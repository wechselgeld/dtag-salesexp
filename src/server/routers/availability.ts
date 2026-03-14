import {
    router, publicProcedure,
} from '@/server/trpc';
import {
    TRPCError,
} from '@trpc/server';
import {
    z,
} from 'zod';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const availabilityRouter = router({
    check: publicProcedure
        .input(z.object({
            street: z.string(),
            houseNumber: z.string(),
            zip: z.string(),
            city: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
            const baseUrl = 'https://www.telekom.de/shop/api/eshop/bff-de';
            const trackingId = crypto.randomUUID();

            const headers: Record<string, string> = {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'channel': 'OneShop',
                'caller': 'oneshop-ui',
                'x-request-tracking-id': trackingId,
                'x-request-status': 'AUTHORIZED',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': 'https://www.telekom.de/shop/tarife/internet-tarife',
                'Origin': 'https://www.telekom.de',
            };

            const addressPayload = {
                'address': {
                    'houseNumber': input.houseNumber,
                    'streetName': input.street,
                    'city': input.city,
                    'postCode': input.zip,
                    'locality': input.city,
                    'installationAddressRequired': false,
                },
                'phoneNumber': '',
                'isPostCodeSelected': true,
                'isStreetNameSelected': true,
                'isHouseNumberNewSelected': true,
            };

            try {
                // Step 1: Availability Check
                console.log('[AVC] Starting check for:', input.street, input.houseNumber, input.zip, input.city);
                const avcResponse = await fetch(`${baseUrl}/connection/v2/availabilityCheck`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(addressPayload),
                });

                if (!avcResponse.ok) {
                    console.error('[AVC] HTTP error:', avcResponse.status);
                    throw new TRPCError({
                        code: 'BAD_GATEWAY',
                        message: 'Telekom API availabilityCheck failed',
                    });
                }

                const avcData = await avcResponse.json() as any;
                console.log('[AVC] Status:', avcData.status, '| Address qualified:', avcData.address?.qualified);

                // Capture session cookies (critical for tariff lookup)
                const setCookieHeaders = avcResponse.headers.getSetCookie();
                if (setCookieHeaders.length > 0) {
                    const cookieStr = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
                    headers['Cookie'] = cookieStr;
                    console.log('[AVC] Captured', setCookieHeaders.length, 'cookies');
                }
                else {
                    console.warn('[AVC] No cookies received - tariff lookup may fail');
                }

                // Step 2: Wait for session to settle on Telekom backend
                // The Telekom API processes the availability check asynchronously;
                // tariff requests fail with DT_UNKNOWN_ERROR if sent too quickly.
                await sleep(1500);

                // Step 3: Fetch tariffs with retry logic
                const tariffsPayload = {
                    'channel': 'OneShop',
                    'category': 'internet-tarife',
                    'selectedAttributes': [
                        {
                            'name': 'isSwitchingProvider',
                            'value': false,
                        },
                        {
                            'name': 'isYoung',
                            'value': false,
                        },
                    ],
                };

                let tariffsData: any = null;
                const maxRetries = 3;

                for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                        console.log(`[Tariffs] Attempt ${attempt + 1}/${maxRetries}...`);
                        const tariffsResponse = await fetch(`${baseUrl}/connection/v2/tariffs`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(tariffsPayload),
                        });

                        // Always try to read the JSON body, even on 500
                        const data = await tariffsResponse.json() as any;
                        console.log(`[Tariffs] HTTP ${tariffsResponse.status} | tariffs: ${(data.tariffs || [
                        ]).length} | error: ${data.error || false} | code: ${data.code || 'none'}`);

                        // If we got tariffs, success!
                        if (data.tariffs && data.tariffs.length > 0) {
                            tariffsData = data;
                            break;
                        }

                        // Error response - retry with increasing delay
                        if (attempt < maxRetries - 1) {
                            const delay = 2000 + attempt * 1500;
                            console.log(`[Tariffs] Retrying in ${delay}ms...`);
                            await sleep(delay);
                            continue;
                        }

                        // Final attempt still failed
                        tariffsData = data;
                    }
                    catch (fetchError: any) {
                        console.error(`[Tariffs] Fetch error on attempt ${attempt + 1}:`, fetchError.message);
                        if (attempt < maxRetries - 1) {
                            await sleep(2000 + attempt * 1500);
                            continue;
                        }
                    }
                }

                // Step 4: If tariffs failed, try to get fiber status as fallback
                let fiberStatus: string | null = null;
                if (!tariffsData?.tariffs?.length) {
                    try {
                        const fiberResponse = await fetch(`${baseUrl}/connection/v1/fiber/status?businessProcess=acquisition`, {
                            headers,
                        });
                        const fiberData = await fiberResponse.json() as any;
                        fiberStatus = fiberData.fiberStatus;
                        console.log('[Fiber] Status:', fiberStatus);
                    }
                    catch {
                        console.log('[Fiber] Could not fetch fiber status');
                    }
                }

                // Extract tariff names with speed info
                const tariffs = tariffsData?.tariffs || [
                ];
                const availableTariffNames = tariffs.map((t: any) => {
                    const maxDown = t.characteristics?.find((c: any) => c.name === 'maxDownloadSpeed');
                    const maxUp = t.characteristics?.find((c: any) => c.name === 'maxUploadSpeed');
                    const tech = t.characteristics?.find((c: any) => c.name === 'technology');

                    let label = t.name;
                    if (maxDown?.values?.[0]?.value) {
                        label += ` (${maxDown.values[0].value}/${maxUp?.values?.[0]?.value || '?'} MBit/s)`;
                    }
                    if (tech?.values?.[0]?.label) {
                        label += ` [${tech.values[0].label}]`;
                    }
                    return label;
                });

                console.log('[Result] Found', availableTariffNames.length, 'tariffs');

                return {
                    status: avcData.status,
                    availableTariffNames,
                    address: avcData.address,
                    fiberStatus,
                };
            }
            catch (error: any) {
                console.error('Telekom API Error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error.message || 'Internal error check availability',
                    cause: error,
                });
            }
        }),

    suggestAddress: publicProcedure
        .input(z.object({
            searchTerm: z.string(),
            searchTarget: z.enum([
                'placeAndZip',
                'streetName',
                'houseNumber',
            ]).optional(),
            selectedAddress: z.any().optional(),
        }))
        .query(async ({
            input,
        }) => {
            const baseUrl = 'https://www.telekom.de/shop/api/eshop/bff-de';
            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'channel': 'OneShop',
                'caller': 'oneshop-ui',
            };

            const payload = {
                searchTerm: input.searchTerm,
                page: 0,
                size: 10,
                selectedAddress: input.selectedAddress || {
                },
                searchTarget: input.searchTarget || 'placeAndZip',
            };

            // Use addressSuggestions for houseNumber, suggestions for others
            const endpoint = input.searchTarget === 'houseNumber' ? 'addressSuggestions' : 'suggestions';

            const response = await fetch(`${baseUrl}/connection/v1/address/${endpoint}?currentStep=availabilityCheck`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                return [
                ];
            }
            return response.json();
        }),
});
