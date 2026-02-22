# Telekom Sales Experience Tool

## Technical Specification for Google Antigravity

---

## PROJECT OVERVIEW

### What is this?

An internal sales support application for Deutsche Telekom Service GmbH callcenter in Chemnitz. This is a pilot project used exclusively at the Chemnitz location to help agents during customer calls. The tool provides instant access to tariff information, pricing details, special offers, and calculates total costs in real-time.

### Who uses it?

- **Primary users**: 20-100 callcenter agents doing inbound sales calls (occasionally, rarely outbound)
- **Secondary users**: Team leaders (Teamleiter) who can highlight recommended tariffs for their teams
- **Admin users**: Administrators who manage all product data, pricing, and system settings

### What products are sold?

- **Mobilfunk** (Mobile): Prepaid and contract mobile plans
- **Glasfaser** (Fiber): High-speed fiber internet plans
- **Festnetz/DSL** (Landline/DSL): Traditional internet and phone plans
- **MagentaTV**: Telekom's TV streaming service (standalone or bundled with internet tariffs)
- **Zubuchoptionen** (Add-ons): Additional services like Netflix, music streaming, country flats
- **Endgeräte** (Devices): Routers, smartphones, tablets (purchase or rental)

### Why is this needed?

Agents currently lack a centralized, fast, and user-friendly tool during calls. They need to:

- Quickly find tariff details without hunting through multiple systems
- Calculate total costs with special pricing across 24 months
- See which add-ons are compatible with specific tariffs
- Know about current special offers and promotions
- Handle different business cases (new activation, moving address, plan change, speed upgrade)
- Access this information in under 2 seconds to maintain call flow
- Handle/counter different arguments from the customer

### Critical design philosophy

**THIS IS NOT A DASHBOARD. THIS IS AN EXPERIENCE.**

The tool must be so pleasant and fast that agents WANT to use it. It should feel like a premium consumer app, not corporate software. Think Apple or Stripe design quality, not SAP. Every interaction should be smooth, every piece of information should be accessible within 1-2 clicks, and the interface should anticipate what the agent needs next.

---

## TECHNICAL REQUIREMENTS

### Technology Stack

**Frontend Framework: Next.js 14+ with App Router**

- Why: Best-in-class React framework with file-based routing, server components for initial load speed, built-in optimizations
- Must use TypeScript in strict mode for type safety

**Styling: Tailwind CSS with Telekom custom theme**

- Primary color: Magenta #E20074
- Secondary: Cyan #00C8FF
- Must feel modern and premium, not corporate/generic

**UI Components: Radix UI primitives + Magic UI / Aceternity UI**

- Why not shadcn: Too generic and outdated feeling
- Radix provides accessible, unstyled primitives
- Magic UI / Aceternity have modern, premium components with great animations

**Animations: Framer Motion**

- Smooth page transitions
- Micro-interactions on hover/click
- Stagger animations for lists
- This tool should FEEL fast and responsive

**State Management: Zustand**

- Lightweight client state (auth, UI state)
- No need for Redux complexity

**Data Layer: tRPC with React Query**

- End-to-end type safety (TypeScript from client to server)
- No REST API boilerplate
- Automatic type inference
- Built-in caching and optimistic updates

**Database: Prisma ORM with SQLite**

- SQLite is sufficient for this scale (100 concurrent users max)
- Prisma provides type-safe database access
- Easy migrations

**Authentication: JWT with httpOnly cookies**

- Only for admin area
- User area is completely open (no login required)

**Dev Tools:**

- pnpm for package management (faster than npm)
- Biome for linting and formatting (replaces ESLint + Prettier, much faster)
- TypeScript strict mode

### Design System Requirements

**Telekom Branding:**

- Must follow Telekom corporate identity
- Primary: Magenta (#E20074)
- Secondary: Cyan (#00C8FF)
- Typography: Inter or Telekom Sans
- Feel modern but respect brand guidelines

**UX Patterns Required:**

1. **Command Palette (Cmd+K)**: Power users can search/navigate without mouse
2. **Keyboard shortcuts**: Common actions accessible via keyboard
3. **Glassmorphism effects**: Modern frosted glass aesthetic for cards/modals
4. **Micro-interactions**: Every button, every hover state should feel responsive
5. **Loading skeletons**: Never use spinners, always show content structure while loading
6. **Toast notifications**: For confirmations and errors (use sonner library)
7. **Empty states**: Beautiful illustrations and helpful copy when no data
8. **Zero-click information**: Show relevant info immediately, don't hide behind tabs/accordions
9. **Progressive disclosure**: Show basics first, reveal complexity on demand
10. **Optimistic UI**: Update UI immediately, sync with server in background

**Performance Targets:**

- No layout shifts (CLS = 0)
- Smooth 60fps animations

---

## BUSINESS DOMAIN & DATA MODEL

### Product Categories Explained

**1. Mobilfunk (Mobile Plans)**
Mobile phone contracts with data, voice, and SMS. Contract duration is always 24 months. Key attributes:

- Data volume (e.g., "50 GB", "100 GB", "Unlimited")
- Network speed (4G OR 5G OR BOTH)
- International roaming options
- Special rule: NO "Umzug" (moving address) business case for mobile - only Neubereitstellung and Tarifwechsel
- Activation fee for Neubereitstellung is 39.95€ (different from other categories)

**2. Glasfaser (Fiber Internet)**
High-speed fiber optic internet plans. Key attributes:

- Download/upload speeds (e.g., "300 Mbit/s", "1000 Mbit/s")
- Can be bundled with MagentaTV
- Supports all business cases including "Speedup" (upgrading to faster speed)
- Standard activation fees: 69.95€

**3. Festnetz/DSL (Landline/DSL)**
Traditional internet via phone line. Similar to Glasfaser in terms of business rules and bundling options.

**4. MagentaTV (TV Service)**
Telekom's IPTV/streaming service. Complex because it exists in two forms:

- **Standalone**: Customer buys only MagentaTV without internet
- **Bundled**: Combined with Glasfaser/Festnetz tariffs, which creates a NEW merged product

When MagentaTV is added to a compatible tariff, the product name CHANGES. Example:

- Original tariff: "MagentaZuhause M"
- With MagentaTV: "MagentaZuhause M mit MagentaTV Smart"

This merged product has its OWN special prices that differ from the standalone tariff prices. This is a critical business rule.

**5. Zubuchoptionen (Add-ons)**
Additional services that can be added to tariffs. Two types:

- **Global add-ons**: Can be added to ANY tariff (e.g., "Country Flat" for international calls)
- **Tariff-specific add-ons**: Only compatible with certain tariffs

Some add-ons have tiers (e.g., Netflix has "Standard", "Premium", "Standard with Ads"). The system must intelligently suggest relevant add-ons based on the selected tariff.

**6. Endgeräte (Devices)**
Hardware like routers, smartphones, tablets. Can be:

- Purchased outright (one-time fee)
- Rented (monthly fee)

Of course, phones are only available in mobile tariffs. There are routers that are only available for Fiber and some only for DLS/Festnetz.

### Business Cases (Geschäftsfälle)

These determine the context of the sale and affect pricing/fees:

**1. Neubereitstellung (New Activation)**
Customer is completely new or getting an additional line.

- Activation fee applies: 69.95€ (or 39.95€ for Mobilfunk)
- All special prices available

**2. Umzug (Moving Address)**
Customer is moving and keeping their service.

- Activation fee applies: 69.95€
- May have special "Umzug" promotional prices
- NOT available for Mobilfunk products

**3. Tarifwechsel (Plan Change)**
Customer is switching to a different tariff within Telekom.

- NO activation fee
- Regular special prices apply

**4. Speedup (Speed Upgrade)**
Customer is upgrading to a faster internet speed (only Glasfaser/Festnetz).

- Activation fee applies: 69.95€
- Special "Speedup" promotional prices often available

### Special Prices (Sonderpreise) - Complex Pricing Logic

This is the most complex part of the system. Special prices are PROMOTIONAL prices that differ from the base price and can be active during specific months of the contract.

**Key principles:**

1. **Multiple time periods**: A product can have different prices for months 1-3, 4-6, 7-12, etc.
2. **Agent selectable**: Agents CHOOSE which special prices to apply (checkboxes) (only one at a time)
3. **Context-dependent**: Special prices can be tied to:
   - Normal sales (default)
   - Only when MagentaTV is bundled
   - Only for Speedup business case
   - Only for Umzug business case
   - Only for specific tariffs

**Example scenario:**
"MagentaZuhause M" normally costs 49.95€/month.

Available special prices:

- "Q1 2026 Aktion": Months 1-6 = 29.95€ (general promotion)
- "Speedup Bonus": Months 1-3 = 19.95€ (only if business case = Speedup)
- "MagentaTV Bundle Rabatt": Months 1-12 = 39.95€ instead of 49.95€ (only if MagentaTV added)

### Gutschriften (Vouchers/Credits)

One-time credits that reduce the total cost (one-time). Examples:

- "100€ Router Gutschrift" (router credit)
- "Loyalty bonus 50€"
- Can be applied to any product type

Agents add these manually during the calculation.

### Teamleiter Highlights (Team Leader Recommendations)

Team leaders can mark specific tariffs or business cases as "recommended" for their team. This helps guide newer agents toward current sales focuses or quota priorities.

When an agent views a tariff that their team leader has highlighted, they see a visual indicator (e.g., "⭐ Team-Empfehlung") explaining why it's recommended.

### Wartungsmeldungen (Maintenance Announcements)

Admins can create urgent announcements that appear as banners for all users. Use cases:

- "CRM system down, use backup process"
- "Special promotion ending today"
- "Network maintenance scheduled"

Priority levels: LOW, MEDIUM, HIGH, CRITICAL
Critical announcements are red and prominent.

---

## CORE FEATURES & REQUIREMENTS

### User Side (Public Access - No Login Required)

#### Landing Page

The entry point. Must be visually striking and immediately useful.

**Elements:**

- Maintenance banner at top (only when active announcements exist)
- Global search bar (searches across all products)
- Five category cards: Mobilfunk, Festnetz, Glasfaser, MagentaTV OTT, Endgeräte
- Each card should have:
  - Icon
  - Category name
  - Count of active products
  - Hover effect with lift/glow

**Command Palette (Cmd+K):**
Users can press Cmd+K anywhere to open a search overlay. Should support:

- Product search by name
- Jump to category
- Recent searches
- Keyboard navigation

#### Product Listing Page

Shows all products within a category.

**Filtering capabilities:**

- Price range slider
- Feature checkboxes (e.g., "5G", "Unlimited data"), different for each category
- Speed selector (for internet)
- Sort by: Price, Name, Popularity

**Visual requirements:**

- Grid layout (3 columns on desktop)
- Each product card shows:
  - Product name
  - Key feature (data volume, speed)
  - Base price per month
  - Badge if special prices are active
  - "Details" button
  - "Add to comparison" button (optional feature)
- Cards should have subtle hover animations
- Fast filtering (no page reload)

**Team leader highlights:**
If a product is highlighted by the user's team leader, show a prominent badge/indicator.

#### Product Detail View

The most important page. Agents spend most time here during calls.

**Layout requirements:**
Split into sections that progressively build the quote:

**Section 1: Product Overview**

- Product name with category badge
- All features listed clearly
- Base price prominently displayed

**Section 2: Business Case Selector**
Radio buttons for applicable cases (remember: Mobilfunk has no Umzug).

- Show activation fee next to each option
- If team leader highlighted a specific case, show indicator
- Updates pricing calculations live

**Section 3: Special Price Selector**
THIS IS CRITICAL. Must be intuitive despite complexity.

- Show ALL available special prices as checkboxes
- Group by context:
  - "Allgemeine Aktionen" (general promotions)
  - "Speedup Angebote" (only show if Speedup selected)
  - "Umzug Angebote" (only show if Umzug selected)
  - "MagentaTV Bundle Rabatte" (only show if MagentaTV toggled on)
- Each checkbox shows:
  - Name of promotion
  - Time period (e.g., "Monate 1-6")
  - Price during that period
- Agent can select one
- Visual preview of which price applies in which months

**Section 4: MagentaTV Toggle** (only for compatible tariffs)

- Clear checkbox/switch: "MagentaTV hinzufügen"
- Shows merged product name when enabled
- Reveals MagentaTV-specific special prices
- Updates total calculation

**Section 5: Add-on Selector**
Intelligently suggest compatible add-ons.

- Show most relevant first (intelligent scoring based on product type and data volume)
- Each add-on:
  - Name and description
  - Price per month
  - If tiered (like Netflix), show tier selector
  - Checkbox to add
- Updates total calculation live

**Section 6: Voucher Selector**

- Search field to find vouchers
- Selected vouchers shown as chips/badges
- Each shows amount (e.g., "100€ Router Credit")
- Updates total calculation

**Section 7: Cost Calculator** (Always visible/sticky)
Most important element. Shows:

- Monthly breakdown for all 24 months
  - Which special price applies when
  - When it switches to base price
  - Add-on costs
- Activation fee (if applicable)
- Applied vouchers
- Total cost over 24 months
- Average monthly cost over 24 months (very prominent)

**Visual design for calculator:**

- Use a timeline/chart view if possible
- Color-code special price periods
- Make it easy to see the complete picture at a glance
- Should update INSTANTLY as agent makes selections

#### Comparison View (Optional Nice-to-Have)

Side-by-side comparison of up to 3-4 products.
Table view with:

- All key features
- Pricing
- Highlight differences in color

### Admin Area (Protected - JWT Authentication)

#### Admin Dashboard

After login, admins see overview:

- Total products count (by category)
- Active special prices count
- Active maintenance announcements
- Quick action buttons

#### Product Management

Full CRUD for all product types.

**Create/Edit Product Form:**
Different fields based on product type:

For ALL products:

- Name
- Category (dropdown)
- Base price
- Description
- Features (multi-line text or JSON array)
- Active toggle

For Tariffs (Mobilfunk/Glasfaser/Festnetz):

- Contract duration (default 24)
- Data volume
- Speed
- Business case checkboxes:
  - Allow Neubereitstellung (+ custom fee field)
  - Allow Umzug (+ custom fee field) - disabled for Mobilfunk
  - Allow Tarifwechsel
  - Allow Speedup (+ custom fee field) - only for Glasfaser/Festnetz
- MagentaTV compatibility:
  - Can merge with MagentaTV checkbox
  - Merged name suffix field (e.g., " mit MagentaTV Smart")

For Devices:

- Manufacturer
- Model
- Category
- Purchase price
- Rental price (optional)
- Stock count

**Associated data management:**
From product edit view, admin can:

- Manage special prices for this product
- Assign compatible add-ons
- Set priority (for display order)

#### Special Price Management

CRUD for special prices with clear UI.

**Create Special Price form:**

- Name (e.g., "Q1 2026 Aktion")
- Product (dropdown selector)
- Month from (1-24)
- Month to (1-24)
- Price
- Context checkboxes:
  - Requires MagentaTV
  - Requires Speedup
  - Requires Umzug
- Active toggle
- Priority (for display order)

**List view:**

- Group by product
- Show time range and price
- Quick activate/deactivate toggle
- Edit/Delete buttons

#### Add-on Management

CRUD for add-ons.

**Add-on form:**

- Name
- Type: Single or Tiered
- Base price (for single type)
- If tiered, manage tiers:
  - Tier name
  - Tier price
  - Tier features
- Global checkbox (available for all products)
- If not global, assign to specific products (multi-select)

#### Voucher Management

Simple CRUD.

- Name
- Amount
- Description
- Applicable to which product types (checkboxes)

#### Maintenance Announcement Management

CRUD for announcements.

- Title
- Message (rich text editor)
- Priority (LOW/MEDIUM/HIGH/CRITICAL)
- Start date/time
- End date/time (optional)
- Active toggle

#### Team Leader Panel (Teamleiter Role)

Teamleiter role has limited admin access:

**My Team:**

- View team members
- Set quarterly goals (text field)

**Highlights Manager:**

- Select tariffs to highlight for team
- Select business cases to highlight
- Add reason/note for why highlighted
- Set priority

These highlights appear on the user side for team members.

---

## INTELLIGENT FEATURES

### Smart Add-on Suggestions

When showing add-ons for a product, the system must score and sort them intelligently.

**Scoring algorithm should consider:**

1. **Product-specific addons** score higher than global ones
2. **Context matching**:
   - For Mobilfunk with high data volume → prioritize streaming services (Netflix, Spotify)
   - For Mobilfunk → prioritize travel/roaming add-ons
   - For Glasfaser/Festnetz → prioritize TV/streaming and security services
3. **Usage patterns** (future enhancement): Track which add-ons are commonly selected together

Present in order: highest score first.

### MagentaTV Bundle Merge Logic

When user toggles MagentaTV on a compatible tariff:

1. Product name changes to merged version (e.g., "MagentaZuhause M" → "MagentaZuhause M mit MagentaTV Smart")
2. Special prices section updates to show MagentaTV-specific promotions
3. Calculator recalculates with bundled pricing
4. Reverse is smooth: toggling off restores original state

### Cost Calculation Engine

Complex calculation that happens in real-time on every change.

**Inputs:**

- Selected product
- Selected business case
- Selected special prices (can be multiple)
- Add-ons
- Vouchers
- MagentaTV toggle state

**Process:**
For each month 1-24:

1. Start with base price
2. Check if any selected special price applies to this month
3. If multiple apply, use the lowest price (best deal for customer)
4. Add all add-on prices
5. Sum monthly total

After 24 months:

- Add activation fee (based on business case)
- Subtract voucher amounts
- Calculate grand total
- Calculate average monthly cost

**Output:**

- Month-by-month breakdown
- Total over 24 months
- Average monthly cost
- Applied special prices with time ranges
- Activation fee
- Applied vouchers

Must execute in <100ms to feel instant.

---

## USER EXPERIENCE REQUIREMENTS

### Navigation Flow

Users should be able to:

1. Land on homepage
2. Click category → see product list in <500ms
3. Click product → see details in <500ms
4. Make all selections
5. See final calculation
   All in under 30 seconds for experienced agents.

### Keyboard Accessibility

Power users (experienced agents) should be able to:

- Navigate entire app with keyboard
- Use Cmd+K to jump anywhere
- Tab through form fields logically
- Use arrow keys in lists
- Press Enter to confirm/select

### Visual Feedback

Every action needs immediate feedback:

- Button clicks: scale down animation
- Form inputs: border glow on focus
- Selections: smooth checkmark animation
- Loading states: skeleton screens (never spinners)
- Success: green toast notification
- Error: red toast with clear message

### Maintenance Mode

When critical announcement is active:

- Red banner across top of every page
- Cannot be dismissed (until admin deactivates)
- Shows message prominently
- If HIGH/CRITICAL priority, may want to add blinking/pulsing effect

### Error States

Graceful error handling:

- Product not found: Show friendly message with link back to category
- Network error: "Connection problem, trying again..." with retry button
- Form validation: Inline errors with helpful messages

### Empty States

If category has no products:

- Show illustration
- "Keine Produkte in dieser Kategorie"
- If admin is logged in, show "Produkt erstellen" button

---

## SECURITY & DATA REQUIREMENTS

### Authentication

- Admin area requires login
- Use JWT tokens in httpOnly cookies (secure)
- Sessions expire after 8 hours of inactivity
- No "Remember Me" option (corporate environment)

### Data Privacy

- NO customer data is stored in this system
- No PII (personally identifiable information)
- Only product/pricing data

### Validation

- All inputs must be validated on both client and server
- Use Zod schemas for validation (shared between frontend and backend)
- Prevent injection attacks
- Sanitize all text inputs

### Role-Based Access

Two roles:

1. **Admin**: Full access to everything
2. **Teamleiter**: Can only manage team highlights and goals, cannot touch product data

---

## QUALITY REQUIREMENTS

### Performance

- Initial page load: <2 seconds
- Product listing: Render 50+ products in <500ms
- Search: Results in <200ms
- Calculator updates: <100ms
- Page transitions: <150ms
- No layout shift (CLS score = 0)

### Browser Support

- Desktop only
- Chrome (primary)
- Firefox
- Edge
- No Safari requirement (not used in callcenter)

### Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Focus indicators
- ARIA labels where needed
- Color contrast ratios met

### Reliability

- Handle 100 concurrent users without performance degradation
- Graceful degradation if backend is slow
- Offline detection and clear messaging

---

## SCOPE BOUNDARIES

### What this system does NOT do:

- Does NOT connect to CRM systems
- Does NOT process actual orders/contracts
- Does NOT store customer information
- Does NOT integrate with payment systems
- Does NOT send emails or notifications
- Does NOT have mobile/tablet version
- Does NOT need to scale beyond 100 users
- Does NOT need deployment configuration (handled separately)

### What this system DOES do:

- Provides product information
- Calculates prices and total costs
- Manages special promotional pricing
- Helps agents find right products quickly
- Gives admins control over all product data
- Enables team leaders to guide their teams

---

## SUCCESS CRITERIA

The system is successful if:

1. Agents use it during EVERY call (adoption = 100%)
2. Agents can find and price a tariff in <30 seconds
3. Zero complaints about slowness or bugs
4. Admins can update prices/products without developer help
5. Team leaders actively use highlighting feature
6. Agents report it "makes their job easier"

The system has failed if:

1. Agents go back to old methods (spreadsheets, asking colleagues)
2. Calculation errors require manual correction
3. Performance degrades with 50+ concurrent users
4. Admins need developer intervention to make changes

---

## IMPLEMENTATION PRIORITIES

Build in this order:

1. **Core product listing and detail view** - Most critical, agents need this immediately
2. **Cost calculator** - Second most critical
3. **Admin CRUD for products** - Enables self-service
4. **Special prices system** - Complex but essential
5. **Add-on suggestions** - Nice to have, improves UX
6. **Team leader highlights** - Lower priority enhancement
7. **Command palette and keyboard shortcuts** - Polish for power users
8. **Comparison view** - Nice to have, not essential

---

## FINAL NOTES FOR ANTIGRAVITY

This is a **pilot project** for ONE location. It's not enterprise software that needs to scale to thousands of users. However, it IS user-facing software that agents will use 50+ times per day, so it MUST be:

- Fast
- Reliable
- Beautiful
- Intuitive

The biggest technical challenges are:

1. **Special pricing logic** - Multiple overlapping time periods, context-dependent
2. **MagentaTV bundle merging** - Product transformation with separate pricing
3. **Real-time calculation** - Must feel instant despite complexity
4. **Intelligent add-on sorting** - Context-aware suggestions

Focus on getting the EXPERIENCE right. This tool should feel like a premium consumer app, not corporate software. Every interaction should be smooth. Every piece of information should be accessible quickly. Agents should actively ENJOY using this tool.

Use the technology stack specified to build a modern, type-safe, performant application. The stack is intentionally modern and developer-friendly for a single-developer scenario, but should not sacrifice quality or user experience.
