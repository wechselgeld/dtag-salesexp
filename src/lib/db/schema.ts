import { pgTable, text, timestamp, boolean, integer, doublePrecision, jsonb, index, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Models

export const users = pgTable('User', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	role: text('role').notNull().default('TEAM_LEADER'),
	isEditor: boolean('isEditor').notNull().default(false),
	odRegionId: text('odRegionId'),
	locationId: text('locationId'),
	teamId: text('teamId'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const odRegions = pgTable('OdRegion', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	isActive: boolean('isActive').notNull().default(true),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const locations = pgTable('Location', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	address: text('address'),
	isActive: boolean('isActive').notNull().default(true),
	odRegionId: text('odRegionId'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const products = pgTable('Product', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	category: text('category').notNull(),
	basePrice: doublePrecision('basePrice').notNull(),
	isActive: boolean('isActive').notNull().default(true),
	priority: integer('priority').notNull().default(0),
	
	dataVolume: text('dataVolume'),
	downloadSpeed: integer('downloadSpeed'),
	uploadSpeed: integer('uploadSpeed'),
	contractDuration: integer('contractDuration').default(24),

	allowNewActivation: boolean('allowNewActivation').notNull().default(true),
	allowMove: boolean('allowMove').notNull().default(true),
	allowPlanChange: boolean('allowPlanChange').notNull().default(true),
	allowSpeedUp: boolean('allowSpeedUp').notNull().default(false),

	activationFeeNew: doublePrecision('activationFeeNew'),
	activationFeeMove: doublePrecision('activationFeeMove'),
	activationFeePlanChange: doublePrecision('activationFeePlanChange').default(0),
	activationFeeSpeedUp: doublePrecision('activationFeeSpeedUp'),

	allowMagentaTV: boolean('allowMagentaTV').notNull().default(false),
	hasMagentaTVBundle: boolean('hasMagentaTVBundle').notNull().default(false),
	magentaTVBundleName: text('magentaTVBundleName'),
	magentaTVBundlePrice: doublePrecision('magentaTVBundlePrice'),

	allowHardwareTiers: boolean('allowHardwareTiers').notNull().default(false),

	deviceManufacturer: text('deviceManufacturer'),
	deviceContext: text('deviceContext'),
	purchasePrice: doublePrecision('purchasePrice'),
	rentalPrice: doublePrecision('rentalPrice'),

	features: text('features'),
	targetGroups: text('targetGroups'),
	salesScript: text('salesScript'),
	magentaInfosUrl: text('magentaInfosUrl'),

	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const salesArguments = pgTable('SalesArgument', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	text: text('text').notNull(),
	productId: text('productId').notNull(),
	sortOrder: integer('sortOrder').notNull().default(0),
	isActive: boolean('isActive').notNull().default(true),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const priceHistories = pgTable('PriceHistory', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	productId: text('productId').notNull(),
	price: doublePrecision('price').notNull(),
	label: text('label'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const specialPrices = pgTable('SpecialPrice', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	internalNote: text('internalNote'),
	magentaTVRequirement: text('magentaTVRequirement').notNull().default('NONE'),
	requiresSpeedUp: boolean('requiresSpeedUp').notNull().default(false),
	requiresMove: boolean('requiresMove').notNull().default(false),
	requiresNewActivation: boolean('requiresNewActivation').notNull().default(false),
	discountTarget: text('discountTarget').notNull().default('BASE_PRICE'),
	discountType: text('discountType').notNull().default('ABSOLUTE'),
	isActive: boolean('isActive').notNull().default(true),
	priority: integer('priority').notNull().default(0),
	ruleConfig: jsonb('ruleConfig'),
	useRuleEngine: boolean('useRuleEngine').notNull().default(false),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

// Junction table for SpecialPrice <-> Product (Many-to-Many)
export const specialPricesToProducts = pgTable('_ProductSpecialPrices', {
	A: text('A').notNull().references(() => products.id, { onDelete: 'cascade' }), // Product ID
	B: text('B').notNull().references(() => specialPrices.id, { onDelete: 'cascade' }), // SpecialPrice ID
}, (t) => ({
	pk: primaryKey({ columns: [t.A, t.B] }),
	idxA: index('_ProductSpecialPrices_A_idx').on(t.A),
	idxB: index('_ProductSpecialPrices_B_idx').on(t.B),
}));

export const specialPriceTiers = pgTable('SpecialPriceTier', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	specialPriceId: text('specialPriceId').notNull(),
	price: doublePrecision('price').notNull(),
	fromMonth: integer('fromMonth').notNull(),
	toMonth: integer('toMonth').notNull(),
	discountTarget: text('discountTarget').notNull().default('BASE_PRICE'),
	discountType: text('discountType').notNull().default('ABSOLUTE'),
});

export const addons = pgTable('Addon', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	category: text('category'),
	isGlobal: boolean('isGlobal').notNull().default(false),
	isActive: boolean('isActive').notNull().default(true),
	magentaTVRequirement: text('magentaTVRequirement').notNull().default('NONE'),
	imageUrl: text('imageUrl'),
	ruleConfig: jsonb('ruleConfig'),
	useRuleEngine: boolean('useRuleEngine').notNull().default(false),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

// Junction table for Addon <-> Product (Many-to-Many)
export const addonsToProducts = pgTable('_ProductAddons', {
	A: text('A').notNull().references(() => addons.id, { onDelete: 'cascade' }), // Addon ID
	B: text('B').notNull().references(() => products.id, { onDelete: 'cascade' }), // Product ID
}, (t) => ({
	pk: primaryKey({ columns: [t.A, t.B] }),
	idxA: index('_ProductAddons_A_idx').on(t.A),
	idxB: index('_ProductAddons_B_idx').on(t.B),
}));

export const addonTiers = pgTable('AddonTier', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	addonId: text('addonId').notNull(),
	name: text('name').notNull(),
	price: doublePrecision('price').notNull(),
});

export const teamHighlights = pgTable('TeamHighlight', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	teamId: text('teamId').notNull(),
	productId: text('productId'),
	addonId: text('addonId'),
	category: text('category'),
	businessCase: text('businessCase'),
	reason: text('reason'),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const maintenanceAnnouncements = pgTable('MaintenanceAnnouncement', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	title: text('title').notNull(),
	message: text('message').notNull(),
	priority: text('priority').notNull(),
	isActive: boolean('isActive').notNull().default(true),
	validFrom: timestamp('validFrom', { withTimezone: true }),
	validUntil: timestamp('validUntil', { withTimezone: true }),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const oneTimeCredits = pgTable('OneTimeCredit', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	value: doublePrecision('value').notNull(),
	isActive: boolean('isActive').notNull().default(true),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const teams = pgTable('Team', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	email: text('email').notNull().default('team06@telekom.de'),
	locationId: text('locationId'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
}, (t) => ({
	locationIdx: index('Team_locationId_idx').on(t.locationId),
}));

export const salesSessions = pgTable('SalesSession', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	teamId: text('teamId').notNull(),
	acceptedTerms: boolean('acceptedTerms').notNull().default(false),
	userAgent: text('userAgent'),
	ip: text('ip'),
	isActive: boolean('isActive').notNull().default(true),
	expiresAt: timestamp('expiresAt', { withTimezone: true }),
	email: text('email'),
	firstName: text('firstName'),
	lastName: text('lastName'),
	isVerified: boolean('isVerified').notNull().default(false),
	verificationToken: text('verificationToken').unique(),
	verificationExpiresAt: timestamp('verificationExpiresAt', { withTimezone: true }),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const news = pgTable('News', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	title: text('title').notNull(),
	content: text('content').notNull(),
	priority: text('priority').notNull().default('INFO'),
	isActive: boolean('isActive').notNull().default(true),
	odRegionId: text('odRegionId'),
	locationId: text('locationId'),
	teamId: text('teamId'),
	createdAt: timestamp('createdAt', { withTimezone: true }).notNull().default(sql`now()`),
	updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull().default(sql`now()`),
});

export const systemSettings = pgTable('SystemSetting', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
});

// Relations

export const userRelations = relations(users, ({ one }) => ({
	odRegion: one(odRegions, { fields: [users.odRegionId], references: [odRegions.id] }),
	location: one(locations, { fields: [users.locationId], references: [locations.id] }),
	team: one(teams, { fields: [users.teamId], references: [teams.id] }),
}));

export const odRegionRelations = relations(odRegions, ({ many }) => ({
	locations: many(locations),
	users: many(users),
	news: many(news),
}));

export const locationRelations = relations(locations, ({ one, many }) => ({
	odRegion: one(odRegions, { fields: [locations.odRegionId], references: [odRegions.id] }),
	teams: many(teams),
	users: many(users),
	news: many(news),
}));

export const productRelations = relations(products, ({ many }) => ({
	specialPrices: many(specialPricesToProducts),
	highlights: many(teamHighlights),
	compatibleAddons: many(addonsToProducts),
	salesArguments: many(salesArguments),
	priceHistory: many(priceHistories),
}));

export const salesArgumentRelations = relations(salesArguments, ({ one }) => ({
	product: one(products, { fields: [salesArguments.productId], references: [products.id] }),
}));

export const priceHistoryRelations = relations(priceHistories, ({ one }) => ({
	product: one(products, { fields: [priceHistories.productId], references: [products.id] }),
}));

export const specialPriceRelations = relations(specialPrices, ({ many }) => ({
	products: many(specialPricesToProducts),
	tiers: many(specialPriceTiers),
}));

export const specialPriceToProductRelations = relations(specialPricesToProducts, ({ one }) => ({
	product: one(products, { fields: [specialPricesToProducts.A], references: [products.id] }),
	specialPrice: one(specialPrices, { fields: [specialPricesToProducts.B], references: [specialPrices.id] }),
}));

export const specialPriceTierRelations = relations(specialPriceTiers, ({ one }) => ({
	specialPrice: one(specialPrices, { fields: [specialPriceTiers.specialPriceId], references: [specialPrices.id] }),
}));

export const addonRelations = relations(addons, ({ many }) => ({
	tiers: many(addonTiers),
	compatibleProducts: many(addonsToProducts),
	highlights: many(teamHighlights),
}));

export const addonToProductRelations = relations(addonsToProducts, ({ one }) => ({
	addon: one(addons, { fields: [addonsToProducts.A], references: [addons.id] }),
	product: one(products, { fields: [addonsToProducts.B], references: [products.id] }),
}));

export const addonTierRelations = relations(addonTiers, ({ one }) => ({
	addon: one(addons, { fields: [addonTiers.addonId], references: [addons.id] }),
}));

export const teamHighlightRelations = relations(teamHighlights, ({ one }) => ({
	team: one(teams, { fields: [teamHighlights.teamId], references: [teams.id] }),
	product: one(products, { fields: [teamHighlights.productId], references: [products.id] }),
	addon: one(addons, { fields: [teamHighlights.addonId], references: [addons.id] }),
}));

export const teamRelations = relations(teams, ({ one, many }) => ({
	location: one(locations, { fields: [teams.locationId], references: [locations.id] }),
	users: many(users),
	sessions: many(salesSessions),
	highlights: many(teamHighlights),
	news: many(news),
}));

export const salesSessionRelations = relations(salesSessions, ({ one }) => ({
	team: one(teams, { fields: [salesSessions.teamId], references: [teams.id] }),
}));

export const newsRelations = relations(news, ({ one }) => ({
	odRegion: one(odRegions, { fields: [news.odRegionId], references: [odRegions.id] }),
	location: one(locations, { fields: [news.locationId], references: [locations.id] }),
	team: one(teams, { fields: [news.teamId], references: [teams.id] }),
}));
