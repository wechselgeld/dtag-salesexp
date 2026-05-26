---
name: coding-standards
description: Architectural guidelines, programming paradigms, type-safety baselines, and ecosystem adaptations for modern development.
---

This document outlines the professional architectural guidelines, programming paradigms, type-safety baselines, and ecosystem adaptations updated for modern development. It serves as a comprehensive operational manual for writing highly maintainable, scalable, strictly typed, and optimized backend systems.

## 1. Architectural & Design Foundations
### Core Engineering Meta-Principles
Before looking at code syntax, these foundational paradigms dictate how software should be partitioned, scoped, and executed.

* **KISS (Keep It Simple, Stupid):** Avoid premature abstraction and structural over-engineering. Write code that reads like a direct expression of the problem.
* **DRY (Don't Repeat Yourself):** Every piece of business logic or systemic knowledge must have a single, unambiguous representation within the codebase.
* **YAGNI (You Aren't Gonna Need It):** Never build features, data structures, or extension points based on assumptions of future requirements. Implement only what is explicitly specified today.
* **SLAP (Single Level of Abstraction Principle):** A function should contain statements that are all at the exact same level of abstraction. High-level orchestrations must not mix with low-level string manipulations or direct mathematical calculations.
* **Law of Demeter (LoD):** The "Principle of Least Knowledge". A module should interact only with its immediate dependencies and structural neighbors—never reach through objects to mutate or call distant dependencies (a.getB().getC().doSomething() is an explicit violation).

## The SOLID Framework
### 1. Single Responsibility Principle (SRP)
A module, class, or function must have one, and only one, reason to change.
* FAIL: A UserService class that authenticates users, writes their records directly to a PostgreSQL database instance, and sends a registration email via SMTP.
* PASS: The UserService executes the business flow, delegates data persistence to a UserRepository, and emits a UserRegistered event handled by an isolated NotificationService.

### 2. Open/Closed Principle (OCP)
Software entities should be open for extension, but closed for modification.
* FAIL: A PaymentProcessor class containing a switch statement that grows every time a new provider (Stripe, PayPal, Adyen) is added, requiring constant structural modifications to the existing file.
* PASS: Defining a PaymentProvider interface. New payment processors implement this interface, and the core engine loops over them polymorphically without changing a single line of internal code.

### 3. Liskov Substitution Principle (LSP)
Subtypes must be completely substitutable for their base types without altering system correctness.
* FAIL: A subclass extending a base class but throwing an error inside an inherited method because it doesn't support that action, unexpectedly breaking caller assumptions.
* PASS: Ensuring that derived classes fully satisfy the contracts established by the parent or interface, or choosing composition over inheritance if behaviors fundamentally diverge.

### 4. Interface Segregation Principle (ISP)
Clients should not be forced to depend on interfaces or methods they do not use.
* FAIL: A massive, monolithic TypeScript interface named SmartDevice forcing a simple BasicPrinter class to implement dummy or throwing implementations for scan(), fax(), and stapleDocs().
* PASS: Splitting the abstraction into highly modular interfaces: Printer, Scanner, and Faxer. The BasicPrinter class implements only the Printer interface.

### 5. Dependency Inversion Principle (DIP)
High-level modules must not depend on low-level modules. Both must depend on abstractions.
* FAIL: Importing a concrete instance of a Prisma or Mongoose database connection directly into a high-level business use-case module.
* PASS: Injecting an abstract interface or token via Dependency Injection frameworks (like NestJS or TS-Syringe), separating business logic execution from infrastructural details.

## 2. Clean Code & Readability Conventions
### Meaningful Naming Conventions
* Variables: Use intention-revealing, searchable nouns in camelCase. Avoid single-character identifiers except in short-lived mathematical matrix loops.
* Functions & Methods: Start with active verbs (calculateTotal, fetchUserById).
* Classes & Interfaces: Use PascalCase nouns (OrderProcessor, UserAccount).
* Booleans: Prefix with clarifying tokens like is, has, should, or can (isAuthorized, hasToken).

### Function Metrics & Composition
* Size Constraint: Functions should ideally target a low count lines of code, and max out around 50 lines. If a function cannot fit completely on a single standard monitor view without scrolling, its scope is often too wide.
* Argument Threshold: Restrict parameters to a maximum of 2. If a function requires 3 or more configuration parameters, combine them into a single, cohesive options object.

### Replace Deep Nesting with Guard Clauses
Keep functions readable by validating requirements early and returning immediately. Avoid indentation hell that obscures the execution path.
```typescript
// ✅ PASS: Flat layout, easy to trace logic
function processOrder(user: User | null, order: Order | null): void {
  if (!user?.isActive) return;
  if (!order?.isValid) return;
  if (!hasAvailableStock(order)) return;

  dispatchOrder(user, order);
}

// ❌ FAIL: Pyramidal indentation hell
function processOrderOld(user: User, order: Order) {
  if (user) {
    if (user.isActive) {
      if (order) {
        if (order.isValid) {
          // logic continues to bury itself away...
        }
      }
    }
  }
}
```

### Eliminate Magic Numbers with Named Explicit Constants
Never hardcode raw metrics or timing configurations directly within operational logic. Move them into declarative constant configurations.
```typescript
// ✅ PASS: Meaningful, context-driven configuration definitions
const MAX_LOGIN_RETRIES = 5;
const SESSION_EXPIRY_MS = 3_600_000;

if (retryCount > MAX_LOGIN_RETRIES) {
  lockAccount();
}

// ❌ FAIL: Obscure numerical values requiring mental guesses
if (retryCount > 5) {
  lockAccount();
}
```

### Clean Conditional Assertions
Avoid complex, stacked ternary structures. If a condition handles more than two variants, map it dynamically or utilize plain switch branches.
```typescript
// ✅ PASS: Clean, linear logic
const layout = isMobile ? MobileView : DesktopView;

// ❌ FAIL: Complex ternary stacking
const layoutOld = isMobile ? MobileView : isTablet ? TabletView : GridView;
```

### Self-Documenting Intent (Code Comments)
Comments must explain why something happens, never what is happening.
```typescript
// ✅ PASS: Explaining critical domain or infrastructural decisions
// Low timeout required to prevent horizontal scaling bottlenecks during peak spikes
const FETCH_TIMEOUT_MS = 250; 

// ❌ FAIL: Redundant noise stating the obvious
// Set active status to true
market.isActive = true;
```

## 3. Strict Type Safety & Design
### Enforce Strict Immutability
Do not rely on developer discipline to prevent mutation; use the type system to block it at compile time.

```typescript
// ✅ PASS: Compile-time immutability
interface User {
  readonly id: string;
  readonly roles: readonly string[];
}

const items: ReadonlyArray<number> = [1, 2, 3];
// items.push(4); // Compile error!

// ❌ FAIL: Runtime pattern only (can still accidentally mutate nested properties)
const user = { id: '1', roles: ['admin'] };
user.roles.push('editor'); // Compiles successfully but mutates data
```

### Eliminate any — Use unknown and Type Guards
When data shapes are variable or unknown (like network payloads), use unknown and narrow the type explicitly using a Type Guard.
```typescript
// ✅ PASS: Narrowing with a Type Guard
interface Market { id: string; name: string }

function isMarket(obj: unknown): obj is Market {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

async function handlePayload(payload: unknown) {
  if (isMarket(payload)) {
    console.log(payload.name); // Safe and fully typed
  }
}

// ❌ FAIL: Turning off the compiler
function handlePayloadLoose(payload: any) {
  console.log(payload.nme); // typo passes silently at compile-time, crashes at runtime
}
```

### Leverage Exhaustiveness Checking with Discriminated Unions
When mapping over domain states or types, use the never type to ensure every single code path is explicitly handled securely at compile time.
```typescript
// ✅ PASS: Compile-time check for unhandled cases
type MarketStatus = 'active' | 'resolved' | 'closed';

function getStatusLabel(status: MarketStatus): string {
  switch (status) {
    case 'active': return 'Live';
    case 'resolved': return 'Settled';
    case 'closed': return 'Archived';
    default: {
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
    }
  }
}

// ❌ FAIL: Silent bugs when a new status is added later
function getStatusLabelLoose(status: MarketStatus) {
  if (status === 'active') return 'Live';
  if (status === 'resolved') return 'Settled';
  // 'closed' returns undefined silently
}
```

### Explicit Imports for Typings
Keep compilation boundaries lean and performant. Enforce explicit static type calls rather than importing entire active components into runtime pipelines to reduce bundler bloat.
```typescript
// ✅ PASS: Separating compiler annotations from active runtime objects
import type { DataPayload } from './api.js';
import { executeQuery } from './api.js';

// ❌ FAIL: Mixing types into runtime paths causing bundler bloat
import { DataPayload, executeQuery } from './api.js';
```

## 4. Modern Modern Syntax & Runtime Capabilities

The following compilation contrasts legacy conventions with their modern, high-performance replacements introduced across recent ECMAScript and TypeScript updates.

---
| Legacy Anti-Pattern / Old Feature | Modern Alternative | Strategic Architectural Value |
| :--- | :--- | :--- |
| Variable hoisting via var | let and const | Enforces block scoping and prevents global runtime pollution. |
| Deeply nested .reduce() for array grouping | Object.groupBy() / Map.groupBy() | Drastically reduces boilerplate and improves structural scannability. |
| Callback architecture / Plain Promises | async / await with try/catch | Normalizes asynchronous operations into a readable synchronous format. |
| Manual intersection & difference array loops | Native Set methods (union, intersection) | Offloads high-complexity algorithm evaluation to V8 engine level optimization. |
| Third-party Date engines (moment.js) | Native Temporal API | Provides high-precision, immutable, timezone-aware datetime manipulation natively. |
| Module assertions via assert { type: 'json' } | Import Attributes (with { type: 'json' }) | Implements the standardized security standard for fetching non-JS modules. |
| Separate sync/async error encapsulation layers | Promise.try() | Unifies both synchronous errors and asynchronous rejections into a single stream. |

### Array Element Grouping (Object.groupBy)
```typescript
// ✅ PASS: Modern Paradigm (Native ECMAScript)
// NOTE: Object.groupBy returns a null-prototype object for security.
const users = [
  { id: 1, role: 'admin', name: 'Alice' },
  { id: 2, role: 'user', name: 'Bob' },
  { id: 3, role: 'admin', name: 'Charlie' }
];

const groupedByRole = Object.groupBy(users, (user) => user.role);
```

### Structural Comparison Operations (Native Set Methods)
```typescript
// ✅ PASS: O(N) optimized built-in Set relationship algebra
const visualDesigners = new Set(['Alice', 'Bob', 'Eve']);
const backendEngineers = new Set(['Bob', 'Charlie', 'Dan']);

const fullStackProfessionals = visualDesigners.intersection(backendEngineers);
```

### Constant Indexed Access Type Narrowing
Modern TypeScript tracks structural values safely down inline blocks when utilizing runtime definitions directly within accessor references.
```typescript
// ✅ PASS: Compiler tracks dynamic properties when parameters are constant
function updateMetrics(config: Record<string, unknown>, key: string) {
  if (typeof config[key] === 'string') {
    console.log(config[key].toUpperCase()); // Fully type-safe
  }
}
```

### Native Built-In Type Predicate Inference
When filtering array configurations, modern TypeScript automatically traces implicit type definitions without forcing manual type overrides (as).
```typescript
// ✅ PASS: Compiler infers type as string[] organically
const rawInputs = ['Node', null, 'TypeScript', undefined];
const formattedStrings = rawInputs.filter((item) => item !== null && item !== undefined);
```

## 5. Node.js Production Backend Standards
### API Boundary & Input Validation via Zod
TypeScript types disappear at runtime. Use run-time schema validation contracts at your system boundaries (API inputs, DB layers) and infer types from them directly to maintain a single source of truth.
```typescript
import { z } from 'zod';

// ✅ PASS: Single source of truth for runtime validation and compile-time typing
export const CreateMarketSchema = z.object({
  name: z.string().min(1),
  maxParticipants: z.number().int().positive(),
});

export type CreateMarketInput = z.infer<typeof CreateMarketSchema>;

export async function createMarketHandler(rawData: unknown) {
  const result = await CreateMarketSchema.safeParseAsync(rawData);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }

  const { name, maxParticipants } = result.data; // Fully typed data
}
```

### Robust Error Architecture & Catch Block Narrowing
* Operational vs. Programmer Errors: Distinguish between operational errors (known runtime failures such as invalid inputs, database timeouts) and programmer errors (unexpected bugs, null pointers).
* Never trust unstable states: If a programmer error occurs, assume the application's global memory state is corrupted. Process managers must log the incident and aggressively restart the individual cluster worker.
* Explicit Catch Narrowing: In modern TypeScript, caught errors are inherently unknown. You must safely determine their type using instanceof before interacting with them.

```typescript
// ✅ PASS: Streamlining the runtime via Promise.try and type-narrowed catch blocks
function computeUserMetrics(id: string): Promise<Metrics> {
  if (!id) throw new Error("Invalid ID provided");
  return fetchSecureMetrics(id);
}

Promise.try(() => computeUserMetrics(req.params.id))
  .then(render)
  .catch((error: unknown) => {
    if (error instanceof DatabaseError) {
      logger.error(`DB Failed with code: ${error.code}`);
      return;
    }
    if (error instanceof Error) {
      logger.error(`Standard error: ${error.message}`);
      return;
    }
    throw new Error('An unexpected, non-Error object was thrown');
  });
```

### High-Performance Non-Blocking Async Execution
* Zero CPU-Blocking In Main Thread: Do not execute heavy cryptographic processes, image scaling, deep recursive structural cloning, or complex calculations synchronously inside the main event loop thread. Use the native worker_threads library to delegate CPU-intensive tasks.
* Parallel Concurrent I/O: Execute independent asynchronous operations concurrently with Promise.all instead of blocking the execution loop sequentially.

```typescript
// ✅ PASS: High performance concurrent resolving without artificial bottlenecks
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
]);
```

### High-Fidelity Enterprise Logging
* Structured Output Format: Always emit structured JSON lines to standard output (stdout) rather than text formats, enabling direct ingestion by modern observability aggregators (e.g., OpenTelemetry, Grafana Loki).
* Contextual Tracing IDs: Every logging statement executed inside a request lifetime must append a unique context transaction identification token (Correlation ID).

## 6. Technical Guardrails, Automation & Linter Rules
Clean code is best maintained through automated tools rather than human memory alone.

### Compiler & ESLint Alignment Rules
* Unused Variable Protections: Variables must be explicitly handled. Use an underscore prefix (_) to explicitly state to the compiler and linter that a parameter is deliberately bypassed (e.g., middleware overrides).
* Defensive Object Definitions: Use interface shapes consistently to define runtime structural contracts, and drop references to empty objects ({}) which pass silent structural risks.
* Asset Import Attributes Safety: When importing operational JSON resources, state the file type clearly with modern with attributes instead of deprecated assert statements.

```typescript
// ✅ PASS: Explicitly declaring a bypassed argument and utilizing modern import attributes
import appSchema from './schema.json' with { type: 'json' };

async function handleRequest(url: string, _options: RequestInit) {
  return fetch(url);
}
```

### Automation Scripts & Hooks
* Linter Automation: ESLint configured with modern standard guidelines (@typescript-eslint/recommended), tracking and blocking code-smells, hidden dependencies, and deprecated type parameters.
* Preemptive Hook Execution: Utilizing Husky paired with lint-staged to intercept local git commit requests. If any file fails formatting checks or breaks a unit test, the commit is blocked directly on the developer's machine.
* Post-Development Check: Always execute the lint compiler tool after completing a code change loop:

```bash
pnpm lint
```

> *Note: You are permitted and encouraged to utilize the `eslint --fix` auto-fixer parameter to reconcile standard structural formatting discrepancies automatically.*