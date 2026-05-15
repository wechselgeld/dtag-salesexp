# Design Guidelines - Telekom Sales Helper

This document outlines the design philosophy, visual language, and technical implementation standards for the **Telekom Sales Helper** application. The project follows a "Premium Editorial" aesthetic, blending the core Deutsche Telekom identity with modern web interactions and high-fidelity visuals.

---

## 1. Design Philosophy

Designed to be a high-performance, visually engaging tool for sales representatives. Key principles include:

- **Premium Reliability**: Using clean typography and layouts to convey trust and professionalism.
- **Dynamic Feedback**: Subtle micro-animations and transitions that make the tool feel responsive and "alive."
- **Context-Aware Visuals**: Color coding categories to help users navigate and identify products intuitively.
- **Micro-Interactions**: High-attention to detail on hovers, focuses, and state changes.

---

## 2. Color Palette

The application uses a curated set of colors based on the Telekom Brand Identity, extended with functional and categorical colors.

### Core Brand Colors

**Magenta** | `#E20074` | Primary brand color, actions, highlights.
**Dark Gray** | `#262626` | Primary text color (`ds-text-main`).
**Light Gray** | `#6A6A6A` | Secondary/light text color (`ds-text-light`).
**Shell Gray** | `#F7F8FA` | App-shell background for desktop.
**Border Gray** | `#E0E0E0` | Standard UI borders (`ds-border`).

### Functional Colors

- **Success**: `#2B8A3E`
- **Danger**: `#D9534F`

---

## 3. Typography

The design relies on the **TeleNeo** font family for a sleek, modern, and branded look.

- **Primary Font**: `TeleNeo`, `Teleneo-Marker`
- **Text Sizes**:
  - `h1`: Bold, large for page titles.
  - `h3`: `1.15rem`, Bold (Product/Category cards).
  - `Body`: Standard legible size for descriptions.
  - `Stats/Small`: `0.72rem`, Medium (Metadata, counts).

---

## 4. UI Elements & Components

### Cards & Surfaces

- **Border Radius**: `20px` is the standard for cards and larger containers. Small UI elements use `0.625rem` (`10px`).
- **Standard Card**:
  - Background: `bg-linear-to-br from-white to-[#FCFAFC]`.
  - Border: `1px solid #E8E8E8`.
  - Hover: `shadow-[0_4px_24px_rgba(0,0,0,0.06)]`, Border: `#DDDDDD`.
- **Premium Glassmorphism**:
  - Used for overlays and sticky headers.
  - Implementation: `backdrop-filter: blur(12px)` with low-opacity white/magenta backgrounds.

### Shadows & Borders

- **Premium Shadow**: `box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)`.
- **Magenta Shadow**: Subtle magenta glow for primary elements.
- **Gradient Borders**: Used for high-emphasis selection states.

---

## 5. Animations & Transitions

Animations are used to reduce cognitive load and provide premium feel.

- **Framer Motion**: The standard for component enters and exits.
- **Transitions**: `duration-400 ease-out` (Standard), `cubic-bezier(0.16, 1, 0.3, 1)` (Expo-Out for smooth ends).
- **Keyframe Effects**:
  - **Shimmer**: Skeleton loading states use a magenta-tinted shimmer.
  - **Float**: Subtle vertical floating for decorative icons.
  - **Spin-Glow**: A rotating conic-gradient glow used for highlighted items (`highlight-glow`).

---

## 6. Tailwind Utility Standards

The project utilizes Tailwind CSS v4 features. Avoid hardcoding values; use theme variables:

- **Colors**: `bg-primary`, `text-ds-text-main`, `border-ds-border`.
- **Custom CSS Variables**: Defined in `globals.css` @theme, accessible via `var(--color-*)`.
- **Responsive**: Mobile-first approach, but the desktop shell is the primary surface for sales agents.
- **Utilities**:
  - `.scrollbar-none` to keep layouts clean.
  - `.glass` for blur effects.
  - `.animate-fade-slide-up` for content entry.
