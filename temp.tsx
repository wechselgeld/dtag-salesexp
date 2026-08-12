     1	'use client';
     2
     3	import {
     4		motion, AnimatePresence,
     5	} from 'framer-motion';
     6	import {
     7		Calculator,
     8		Check,
     9		ChevronDown,
    10		Info,
    11		Coins,
    12		Coffee,
    13	} from 'lucide-react';
    14	import {
    15		useState, useMemo, useEffect, useRef, useCallback,
    16	} from 'react';
    17
    18	import clsx from 'clsx';
    19	import {
    20		trpc,
    21	} from '@/lib/trpc';
    22	import {
    23		DEFAULT_PRICING,
    24	} from '@/hooks/use-cost-calculator';
    25	import {
    26		AnimatedNumber,
    27	} from '@/components/shared/animated-number';
    28
    29	interface StreamingComparisonProps {
    30		isVisible: boolean;
    31	}
    32
    33	const STREAMING_SERVICES = [
    34		{
    35			id: 'hd-tv',
    36			name: 'HD-Fernsehen (Kabel, Waipu, etc.)',
    37			tierName: 'Kabel/Apps (HD)',
    38			price: 9.0,
    39			group: 'tv',
    40			groupName: 'HD-Fernsehen',
    41		},
    42		{
    43			id: 'netflix-ads',
    44			name: 'Netflix S. m. Werbung',
    45			tierName: 'Standard m. Werbung',
    46			price: 4.99,
    47			group: 'netflix',
    48			groupName: 'Netflix',
    49		},
    50		{
    51			id: 'netflix-std',
    52			name: 'Netflix Standard',
    53			tierName: 'Standard',
    54			price: 13.99,
    55			group: 'netflix',
    56			groupName: 'Netflix',
    57		},
    58		{
    59			id: 'netflix-prem',
    60			name: 'Netflix Premium',
    61			tierName: 'Premium',
    62			price: 19.99,
    63			group: 'netflix',
    64			groupName: 'Netflix',
    65		},
    66		{
    67			id: 'disney-ads',
    68			name: 'Disney+ S. m. Werbung',
    69			tierName: 'Standard m. Werbung',
    70			price: 5.99,
    71			group: 'disney',
    72			groupName: 'Disney+',
    73		},
    74		{
    75			id: 'disney-std',
    76			name: 'Disney+ Standard',
    77			tierName: 'Standard',
    78			price: 8.99,
    79			group: 'disney',
    80			groupName: 'Disney+',
    81		},
    82		{
    83			id: 'disney-prem',
    84			name: 'Disney+ Premium',
    85			tierName: 'Premium',
    86			price: 11.99,
    87			group: 'disney',
    88			groupName: 'Disney+',
    89		},
    90		{
    91			id: 'rtl-prem',
    92			name: 'RTL+ Premium',
    93			tierName: 'Premium',
    94			price: 8.99,
    95			group: 'rtl',
    96			groupName: 'RTL+',
    97		},
    98		{
    99			id: 'rtl-max',
   100			name: 'RTL+ Max',
   101			tierName: 'Max',
   102			price: 12.99,
   103			group: 'rtl',
   104			groupName: 'RTL+',
   105		},
   106		{
   107			id: 'apple-tv',
   108			name: 'AppleTV+',
   109			tierName: 'AppleTV+',
   110			price: 9.99,
   111			group: 'apple',
   112			groupName: 'AppleTV+',
   113		},
   114	];
   115
   116	const MAGENTA_PLANS = [
   117		{
   118			id: 'mtv-smart',
   119			name: 'MagentaTV Smart',
   120			price: 10.0,
   121			includes: [
   122				{
   123					name: 'HD-Fernsehen',
   124					id: 'hd-tv',
   125					group: 'tv',
   126				},
   127				{
   128					name: 'MagentaTV+',
   129					id: null,
   130					group: null,
   131				},
   132				{
   133					name: 'RTL+ Premium',
   134					id: 'rtl-prem',
   135					group: 'rtl',
   136				},
   137			],
   138			includedServiceIds: [
   139				'hd-tv',
   140				'rtl-prem',
   141			],
   142		},
   143		{
   144			id: 'mtv-smartstream',
   145			name: 'MagentaTV SmartStream',
   146			price: 17.0,
   147			includes: [
   148				{
   149					name: 'HD-Fernsehen',
   150					id: 'hd-tv',
   151					group: 'tv',
   152				},
   153				{
   154					name: 'MagentaTV+',
   155					id: null,
   156					group: null,
   157				},
   158				{
   159					name: 'Netflix S. m. Werbung',
   160					id: 'netflix-ads',
   161					group: 'netflix',
   162				},
   163				{
   164					name: 'Disney+ S. m. Werbung',
   165					id: 'disney-ads',
   166					group: 'disney',
   167				},
   168				{
   169					name: 'RTL+ Premium',
   170					id: 'rtl-prem',
   171					group: 'rtl',
   172				},
   173			],
   174			includedServiceIds: [
   175				'hd-tv',
   176				'netflix-ads',
   177				'disney-ads',
   178				'rtl-prem',
   179			],
   180		},
   181		{
   182			id: 'mtv-megastream',
   183			name: 'MagentaTV MegaStream',
   184			price: 30.0,
   185			includes: [
   186				{
   187					name: 'HD-Fernsehen',
   188					id: 'hd-tv',
   189					group: 'tv',
   190				},
   191				{
   192					name: 'MagentaTV+',
   193					id: null,
   194					group: null,
   195				},
   196				{
   197					name: 'Netflix Standard',
   198					id: 'netflix-std',
   199					group: 'netflix',
   200				},
   201				{
   202					name: 'Disney+ Standard',
   203					id: 'disney-std',
   204					group: 'disney',
   205				},
   206				{
   207					name: 'RTL+ Premium',
   208					id: 'rtl-prem',
   209					group: 'rtl',
   210				},
   211				{
   212					name: 'AppleTV+',
   213					id: 'apple-tv',
   214					group: 'apple',
   215				},
   216			],
   217			includedServiceIds: [
   218				'hd-tv',
   219				'netflix-std',
   220				'disney-std',
   221				'rtl-prem',
   222				'apple-tv',
   223			],
   224		},
   225	];
   226
   227	// Helper components for Select
   228	function TierSelect({
   229		group,
   230		selectedId,
   231		onSelect,
   232		customPrice,
   233		onPriceChange,
   234		index,
   235		total,
   236	}: {
   237		group: any;
   238		selectedId: string | null;
   239		onSelect: (id: string | null) => void;
   240		customPrice: string | undefined;
   241		onPriceChange: (id: string, val: string) => void;
   242		index: number;
   243		total: number;
   244	}) {
   245		const [
   246			isOpen,
   247			setIsOpen,
   248		] = useState(false);
   249		const dropdownRef = useRef<HTMLDivElement>(null);
   250		const isUpward = index >= total - 2;
   251		const isSingleTier = group.tiers.length === 1;
   252		const singleTier = group.tiers[0];
   253
   254		useEffect(() => {
   255			const handleClickOutside = (e: MouseEvent) => {
   256				if (
   257					dropdownRef.current &&
   258					!dropdownRef.current.contains(e.target as Node)
   259				) {
   260					setIsOpen(false);
   261				}
   262			};
   263			document.addEventListener('mousedown', handleClickOutside);
   264			return () => document.removeEventListener('mousedown', handleClickOutside);
   265		}, [
   266		]);
   267
   268		const selectedTier = group.tiers.find((t: any) => t.id === selectedId);
   269
   270		return (
   271			<div className="relative" ref={dropdownRef}>
   272				<button
   273					type="button"
   274					onClick={() => {
   275						if (isSingleTier) {
   276							onSelect(selectedId ? null : singleTier.id);
   277						}
   278						else {
   279							setIsOpen(!isOpen);
   280						}
   281					}}
   282					className={clsx(
   283						'w-full flex flex-col justify-center px-6 h-[92px] rounded-xl border transition-all duration-300 relative group text-left outline-none',
   284						selectedId
   285							? 'border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30'
   286							: 'border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
   287					)}
   288				>
   289					<div className="flex items-center justify-between w-full">
   290						<div className="flex flex-col items-start overflow-hidden">
   291							<h4
   292								className={clsx(
   293									'text-[1.15rem] font-extrabold tracking-tight leading-none mb-1.5 transition-colors',
   294									selectedId ? 'text-[#e20074]' : 'text-[#1a1a2e]',
   295								)}
   296							>
   297								{group.name}
   298							</h4>
   299							<span className="text-[0.85rem] font-semibold text-[#888] leading-none">
   300								{selectedTier ? selectedTier.tierName : 'Nicht ausgewählt'}
   301							</span>
   302						</div>
   303
   304						<div className="flex items-center gap-5 shrink-0">
   305							{selectedTier && (
   306								<div
   307									className="flex items-center gap-2"
   308									onClick={(e) => e.stopPropagation()}
   309								>
   310									<div className="flex items-center bg-[#f7f8fa] px-3 py-1.5 rounded-xl border border-[#eaedf0] hover:border-[#e20074]/30 transition-all focus-within:border-[#e20074] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#e20074]/30">
   311										<input
   312											type="text"
   313											value={
   314												customPrice ??
   315												selectedTier.price.toFixed(2).replace('.', ',')
   316											}
   317											onChange={(e) => {
   318												const val = e.target.value;
   319												if (/^[0-9]*[.,]?[0-9]*$/.test(val) || val === '') {
   320													onPriceChange(selectedTier.id, val);
   321												}
   322											}}
   323											className="w-12 bg-transparent text-[0.95rem] font-extrabold text-[#1a1a2e] outline-none text-right"
   324										/>
   325										<span className="text-[0.85rem] text-[#1a1a2e] font-bold ml-1">
   326											€
   327										</span>
   328									</div>
   329								</div>
   330							)}
   331							<div
   332								className={clsx(
   333									'w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200',
   334									selectedId
   335										? 'bg-[#e20074] border-[#e20074]'
   336										: 'border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]',
   337								)}
   338							>
   339								{selectedId ? (
   340									<Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
   341								) : !isSingleTier ? (
   342									<ChevronDown
   343										className={clsx(
   344											'w-3 h-3 text-[#aaa] transition-transform',
   345											isOpen ? 'rotate-180' : '',
   346										)}
   347									/>
   348								) : null}
   349							</div>
   350						</div>
   351					</div>
   352				</button>
   353
   354				<AnimatePresence>
   355					{isOpen && (
   356						<motion.div
   357							initial={{
   358								opacity: 0,
   359								y: isUpward ? 4 : -4,
   360								scale: 0.98,
   361							}}
   362							animate={{
   363								opacity: 1,
   364								y: 0,
   365								scale: 1,
   366							}}
   367							exit={{
   368								opacity: 0,
   369								y: isUpward ? 4 : -4,
   370								scale: 0.98,
   371							}}
   372							transition={{
   373								duration: 0.2,
   374								ease: [
   375									0.23,
   376									1,
   377									0.32,
   378									1,
   379								],
   380							}}
   381							className={clsx(
   382								'absolute left-0 right-0 bg-white border border-[#eaedf0] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] z-100 overflow-hidden py-1.5',
   383								isUpward ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
   384							)}
   385						>
   386							<div className="max-h-[240px] overflow-y-auto custom-scrollbar">
   387								<button
   388									onClick={() => {
   389										onSelect(null);
   390										setIsOpen(false);
   391									}}
   392									className={clsx(
   393										'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
   394										!selectedId
   395											? 'bg-[#e20074]/5 text-[#e20074] font-bold'
   396											: 'hover:bg-[#fafafa] text-[#888] font-medium',
   397									)}
   398								>
   399									<span className="text-[0.85rem]">Nicht ausgewählt</span>
   400									{!selectedId && <Check className="w-3.5 h-3.5 ml-auto" />}
   401								</button>
   402								<div className="h-px bg-[#f3f4f6] mx-3 my-1" />
   403								{group.tiers.map((tier: any) => (
   404									<button
   405										key={tier.id}
   406										onClick={() => {
   407											onSelect(tier.id);
   408											setIsOpen(false);
   409										}}
   410										className={clsx(
   411											'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
   412											selectedId === tier.id
   413												? 'bg-[#e20074]/5 text-[#e20074] font-bold'
   414												: 'hover:bg-[#fafafa] text-[#1a1a2e] font-medium',
   415										)}
   416									>
   417										<div className="flex flex-col">
   418											<span className="text-[0.85rem]">{tier.tierName}</span>
   419											<span className="text-[0.7rem] opacity-60 font-medium whitespace-nowrap text-[#666]">
   420												{tier.price.toFixed(2).replace('.', ',')} € / Monat
   421											</span>
   422										</div>
   423										{selectedId === tier.id && <Check className="w-3.5 h-3.5" />}
   424									</button>
   425								))}
   426							</div>
   427						</motion.div>
   428					)}
   429				</AnimatePresence>
   430			</div>
   431		);
   432	}
   433
   434	export function StreamingComparison({
   435		isVisible,
   436	}: StreamingComparisonProps) {
   437		const [
   438			selectedServices,
   439			setSelectedServices,
   440		] = useState<string[]>([
   441		]);
   442		const [
   443			selectedPlan,
   444			setSelectedPlan,
   445		] = useState<string>('mtv-smartstream');
   446		const [
   447			customPrices,
   448			setCustomPrices,
   449		] = useState<Record<string, string>>({
   450		});
   451		const [
   452			mounted,
   453			setMounted,
   454		] = useState(false);
   455
   456		// Reset state when modal is hidden
   457		useEffect(() => {
   458			if (!isVisible) {
   459				setSelectedServices([
   460				]);
   461				setSelectedPlan('mtv-smartstream');
   462				setCustomPrices({
   463				});
   464			}
   465		}, [
   466			isVisible,
   467		]);
   468		const getPrice = useCallback((id: string) => {
   469			if (customPrices[id] !== undefined) {
   470				const val = parseFloat(customPrices[id].replace(',', '.'));
   471				return isNaN(val) ? 0 : val;
   472			}
   473			return STREAMING_SERVICES.find((s) => s.id === id)?.price || 0;
   474		}, [
   475			customPrices,
   476		]);
   477
   478		const {
   479			data: pricingSettings,
   480		} = trpc.settings.getPricingSettings.useQuery(
   481			undefined,
   482			{
   483				staleTime: 10 * 60 * 1000,
   484			},
   485		);
   486		const settings = pricingSettings || DEFAULT_PRICING;
   487
   488		const dynamicPlans = useMemo(
   489			() =>
   490				MAGENTA_PLANS.map((plan) => {
   491					if (plan.id === 'mtv-smart') {
   492						return {
   493							...plan,
   494							price: settings.magentatv_smart_price,
   495						};
   496					}
   497					if (plan.id === 'mtv-smartstream') {
   498						return {
   499							...plan,
   500							price: settings.magentatv_smartstream_price,
   501						};
   502					}
   503					if (plan.id === 'mtv-megastream') {
   504						return {
   505							...plan,
   506							price: settings.magentatv_megastream_price,
   507						};
   508					}
   509					return plan;
   510				}),
   511			[
   512				settings,
   513			],
   514		);
   515
   516		useEffect(() => setMounted(true), [
   517		]);
   518
   519		const groupedServices = useMemo(() => {
   520			const groups: Record<string, { name: string; tiers: typeof STREAMING_SERVICES }> = {
   521			};
   522			STREAMING_SERVICES.forEach((service) => {
   523				if (!groups[service.group]) {
   524					groups[service.group] = {
   525						name: service.groupName,
   526						tiers: [
   527						],
   528					};
   529				}
   530				groups[service.group].tiers.push(service);
   531			});
   532			return Object.entries(groups).map(([
   533				groupId,
   534				data,
   535			]) => ({
   536				groupId,
   537				name: data.name,
   538				tiers: data.tiers,
   539			}));
   540		}, [
   541		]);
   542
   543		const toggleService = (groupId: string, id: string | null) => {
   544			setSelectedServices((prev) => {
   545				// Remove any existing selection from this group
   546				const filtered = prev.filter((sId) => {
   547					const service = STREAMING_SERVICES.find((s) => s.id === sId);
   548					return service?.group !== groupId;
   549				});
   550				if (!id) { return filtered; }
   551				return [
   552					...filtered,
   553					id,
   554				];
   555			});
   556		};
   557
   558		const currentCosts = useMemo(() => {
   559			return selectedServices.reduce((sum, id) => sum + getPrice(id), 0);
   560		}, [
   561			selectedServices,
   562			customPrices,
   563			getPrice,
   564		]);
   565
   566		const targetPlan = useMemo(() => {
   567			return dynamicPlans.find((p) => p.id === selectedPlan);
   568		}, [
   569			selectedPlan,
   570			dynamicPlans,
   571		]);
   572
   573		const coveredValue = useMemo(() => {
   574			return selectedServices.reduce((sum, currentServiceId) => {
   575				const currentService = STREAMING_SERVICES.find(
   576					(s) => s.id === currentServiceId,
   577				);
   578				if (!currentService || !targetPlan) { return sum; }
   579
   580				const currentPrice = getPrice(currentServiceId);
   581
   582				const includedServiceIdForGroup = targetPlan.includedServiceIds.find(
   583					(serviceId) => {
   584						const incService = STREAMING_SERVICES.find((s) => s.id === serviceId);
   585						return incService?.group === currentService.group;
   586					},
   587				);
   588
   589				if (includedServiceIdForGroup) {
   590					const includedPrice = getPrice(includedServiceIdForGroup);
   591					return sum + Math.min(currentPrice, includedPrice);
   592				}
   593				return sum;
   594			}, 0);
   595		}, [
   596			selectedServices,
   597			targetPlan,
   598			customPrices,
   599			getPrice,
   600		]);
   601
   602		const savings = coveredValue - (targetPlan?.price || 0);
   603		const paysMore = savings < 0;
   604
   605		if (!mounted) { return null; }
   606
   607		return (
   608			<div className={clsx('flex-1 overflow-y-auto min-h-0 bg-[#fbfcff]', !isVisible && 'hidden')}>
   609								<div className="px-8 md:px-10 py-8 min-h-full flex flex-col">
   610									<div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_0.9fr] gap-8 md:gap-10 flex-1">
   611										{/* Column 1: Current Services */}
   612										<div className="flex flex-col gap-6">
   613											<div className="flex items-center gap-2.5 px-1">
   614												<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
   615													Was nutzt der Kunde heute?
   616												</h3>
   617											</div>
   618											<div className="grid gap-5">
   619												{groupedServices.map((group, idx) => (
   620													<TierSelect
   621														key={group.groupId}
   622														group={group}
   623														index={idx}
   624														total={groupedServices.length}
   625														selectedId={
   626															selectedServices.find(
   627																(sId) =>
   628																	STREAMING_SERVICES.find((s) => s.id === sId)
   629																		?.group === group.groupId,
   630															) || null
   631														}
   632														onSelect={(id) => toggleService(group.groupId, id)}
   633														customPrice={
   634															selectedServices.find(
   635																(sId) =>
   636																	STREAMING_SERVICES.find((s) => s.id === sId)
   637																		?.group === group.groupId,
   638															)
   639																? customPrices[
   640																		selectedServices.find(
   641																			(sId) =>
   642																				STREAMING_SERVICES.find(
   643																					(s) => s.id === sId,
   644																				)?.group === group.groupId,
   645																		)!
   646																]
   647																: undefined
   648														}
   649														onPriceChange={(id, val) =>
   650															setCustomPrices((prev) => ({
   651																...prev,
   652																[id]: val,
   653															}))
   654														}
   655													/>
   656												))}
   657											</div>
   658										</div>
   659
   660										{/* Column 2: MagentaTV Tarife */}
   661										<div className="flex flex-col gap-6">
   662											<div className="flex items-center gap-2.5 px-1">
   663												<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
   664													Gewünschter MagentaTV-Tarif
   665												</h3>
   666											</div>
   667											<div className="flex flex-col gap-4">
   668												{dynamicPlans.map((plan) => {
   669													const isSelected = selectedPlan === plan.id;
   670													return (
   671														<button
   672															key={plan.id}
   673															onClick={() => setSelectedPlan(plan.id)}
   674															className={clsx(
   675																'w-full flex flex-col p-5 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden',
   676																isSelected
   677																	? 'border-[#e20074]/40 bg-[#e20074]/5 shadow-[0_4px_20px_rgba(226,0,116,0.08)] ring-1 ring-[#e20074]/30'
   678																	: 'border-[#eaedf0] bg-[#f7f8fa] hover:bg-white hover:border-[#d1d5db] hover:shadow-[0_2px_10px_rgba(0,0,0,0.03)]',
   679															)}
   680														>
   681															<div className="flex items-center justify-between mb-3 w-full">
   682																<div className="flex items-center gap-3">
   683																	<div
   684																		className={clsx(
   685																			'w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 shrink-0',
   686																			isSelected
   687																				? 'bg-[#e20074] border-[#e20074]'
   688																				: 'border-[#d1d5db] bg-white group-hover:border-[#a3a8b4]',
   689																		)}
   690																	>
   691																		{isSelected && (
   692																			<Check
   693																				className="w-2.5 h-2.5 text-white"
   694																				strokeWidth={4}
   695																			/>
   696																		)}
   697																	</div>
   698																	<span
   699																		className={clsx(
   700																			'text-[1.05rem] font-extrabold tracking-tight',
   701																			isSelected
   702																				? 'text-[#e20074]'
   703																				: 'text-[#1a1a2e]',
   704																		)}
   705																	>
   706																		{plan.name}
   707																	</span>
   708																</div>
   709																<span
   710																	className={clsx(
   711																		'text-[1.1rem] font-extrabold',
   712																		isSelected
   713																			? 'text-[#e20074]'
   714																			: 'text-[#1a1a2e]',
   715																	)}
   716																>
   717																	{plan.price.toFixed(2).replace('.', ',')} €
   718																</span>
   719															</div>
   720
   721															<div className="flex flex-wrap gap-1.5 mb-4 pl-8">
   722																{plan.includes.map((inc, i) => {
   723																	const isGroupSelected =
   724																		inc.group &&
   725																		selectedServices.some((sId) => {
   726																			const s = STREAMING_SERVICES.find(
   727																				(x) => x.id === sId,
   728																			);
   729																			return s && s.group === inc.group;
   730																		});
   731																	return (
   732																		<span
   733																			key={i}
   734																			className={clsx(
   735																				'text-[0.65rem] px-2 py-0.5 rounded-lg transition-all border',
   736																				isGroupSelected
   737																					? 'bg-[#e20074] border-[#e20074] text-white font-bold'
   738																					: 'bg-[#f3f4f6] border-transparent text-[#6b7280] font-bold',
   739																			)}
   740																		>
   741																			{inc.name}
   742																		</span>
   743																	);
   744																})}
   745															</div>
   746
   747															<div className="mt-auto pt-3 border-t border-[#f3f4f6] flex justify-between items-center pl-1">
   748																<span className="text-[0.9rem] text-black font-bold tracking-wider flex items-center gap-4">
   749																	<Coins className="w-3.5 h-3.5" />
   750																	{plan.includedServiceIds
   751																		.reduce((sum, id) => sum + getPrice(id), 0)
   752																		.toFixed(2)
   753																		.replace('.', ',')}{' '}
   754																	€ als Einzelbuchung
   755																</span>
   756															</div>
   757														</button>
   758													);
   759												})}
   760											</div>
   761										</div>
   762
   763										{/* Column 3: Summary (aligned with product sidebar style) */}
   764										<div className="flex flex-col gap-6">
   765											<div className="flex items-center gap-2.5 px-1">
   766												<h3 className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-tight">
   767													Zusammenfassung
   768												</h3>
   769											</div>
   770
   771											<div className="flex flex-col gap-6.5">
   772												{/* Main Result Card (Moved to top) */}
   773												<div
   774													className={clsx(
   775														'rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 shadow-md',
   776														paysMore
   777															? 'bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-amber-500/10'
   778															: 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-emerald-500/10',
   779													)}
   780												>
   781													{/* Subtle light effect */}
   782													<div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-[80px] -mr-16 -mt-16 rounded-full" />
   783
   784													<span className="text-[0.8rem] font-bold uppercase tracking-[0.2em] mb-4 border-b pb-2">
   785														{paysMore
   786															? 'Monatliche Mehrkosten'
   787															: 'Monatliche Ersparnis'}
   788													</span>
   789
   790													<div className="flex items-baseline py-2">
   791														<span className="text-[4rem] font-extrabold tracking-tighter leading-none drop-shadow-sm">
   792															{paysMore ? '+ ' : ''}
   793															<AnimatedNumber value={Math.abs(savings)} /> €
   794														</span>
   795													</div>
   796
   797													<div className="mt-8 flex flex-col gap-4 w-full">
   798														<div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner">
   799															<div className="flex justify-center items-center text-[1.0rem] font-bold mb-3 tracking-wide text-center">
   800																{coveredValue < (targetPlan?.price || 0) ? (
   801																	<span>
   802																		Noch{' '}
   803																		<b className="text-white text-extrabold whitespace-nowrap">
   804																			<AnimatedNumber
   805																				value={
   806																					(targetPlan?.price || 0) - coveredValue
   807																				}
   808																			/>{' '}
   809																			€
   810																		</b>{' '}
   811																		bis zum Wertvorteil
   812																	</span>
   813																) : (
   814																	<span className="text-[1rem] flex items-center gap-1.5 font-extrabold">
   815																		WERTVORTEIL ERREICHT
   816																	</span>
   817																)}
   818															</div>
   819															<div className="h-2 w-full bg-white/20 rounded-full overflow-hidden p-[2px]">
   820																<motion.div
   821																	initial={{
   822																		width: 0,
   823																	}}
   824																	animate={{
   825																		width: `${Math.min(100, (coveredValue / (targetPlan?.price || 1)) * 100)}%`,
   826																	}}
   827																	className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
   828																/>
   829															</div>
   830														</div>
   831													</div>
   832												</div>
   833
   834												{/* Grid Stats Tiles (Only Status Quo & Wertvorteil) */}
   835												<div className="grid grid-cols-2 gap-4">
   836													{/* Status Quo - Normal */}
   837													<div className="relative flex flex-col items-center text-center p-3.5 rounded-xl border border-[#eaedf0] bg-[#f7f8fa]">
   838														<Calculator
   839															className="w-5 h-5 mb-2 text-[#bbb]"
   840															strokeWidth={1.8}
   841														/>
   842														<div className="text-[0.8rem] font-semibold leading-tight text-[#888]">
   843															Status Quo
   844														</div>
   845														<div className="text-[1.0rem] font-semibold text-[#b0b0b0] mt-1">
   846															<AnimatedNumber value={currentCosts} /> €
   847														</div>
   848													</div>
   849
   850													{/* Wertvorteil - Highlighted Green */}
   851													<div
   852														className="relative flex flex-col items-center text-center p-3.5 rounded-xl border border-[#10b981]/30 bg-[#10b981]/5 transition-all duration-200"
   853													>
   854														<Info
   855															className="w-5 h-5 mb-2 text-[#10b981]"
   856															strokeWidth={1.8}
   857														/>
   858														<div className="text-[0.8rem] font-semibold leading-tight text-[#1a1a2e]">
   859															Wertvorteil
   860														</div>
   861														<div className="text-[1.1rem] font-extrabold text-[#10b981] mt-1">
   862															+ <AnimatedNumber value={coveredValue} /> €
   863														</div>
   864													</div>
   865												</div>
   866
   867												{/* Pro Tag - Normal (Full Width) */}
   868												<div className="relative flex flex-col items-center text-center p-4 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] mt-auto">
   869													<Coffee
   870														className="w-5 h-5 mb-2 text-[#bbb]"
   871														strokeWidth={1.8}
   872													/>
   873													<div className="text-[0.85rem] font-semibold text-[#888] mb-1">
   874														Kosten pro Tag für MagentaTV
   875													</div>
   876													<div className="text-[1.3rem] font-bold text-[#1a1a2e]">
   877														<AnimatedNumber
   878															value={(targetPlan?.price || 0) / 30}
   879														/>{' '}
   880														€
   881													</div>
   882												</div>
   883											</div>
   884										</div>
   885									</div>
   886				</div>
   887			</div>
   888		);
   889	}
