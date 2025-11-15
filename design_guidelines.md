# Article Generator Tool - Design Guidelines

## Design Approach

**Selected Approach**: Design System - Inspired by modern productivity tools (Linear, Vercel, Notion)
**Rationale**: This is a utility-focused application where clarity, efficiency, and real-time feedback are paramount. The design should minimize cognitive load and maximize workflow efficiency.

**Core Principles**:
- Functional clarity over visual decoration
- Real-time status visibility
- Single-purpose focused interface
- Progressive disclosure of complexity

---

## Layout System

**Container Structure**:
- Single-page application layout, no navigation needed
- Maximum content width: `max-w-4xl mx-auto`
- Consistent page padding: `px-6 py-8` (mobile), `px-8 py-12` (desktop)

**Spacing Primitives**:
We will use Tailwind units of **2, 3, 4, 6, 8, 12** for consistent rhythm:
- Micro spacing: `gap-2`, `p-2` (within components)
- Standard spacing: `gap-4`, `p-4`, `mb-6` (between related elements)
- Section spacing: `mb-8`, `mb-12` (between major sections)

**Grid Structure**:
- Single column layout for main form
- Two-column split for API configuration (desktop only): `grid-cols-1 md:grid-cols-2 gap-4`

---

## Typography

**Font Family**:
- Primary: Inter (Google Fonts) - excellent for UI clarity
- Monospace: JetBrains Mono (for logs and technical output)

**Type Scale**:
- Page title: `text-2xl font-semibold` 
- Section headers: `text-lg font-medium`
- Form labels: `text-sm font-medium`
- Input text: `text-base`
- Status log: `text-sm font-mono`
- Helper text: `text-xs`

---

## Component Library

### 1. Header Section
- Tool title and brief description
- Spacing: `mb-8`

### 2. Configuration Form
**API Configuration Group**:
- Two-column grid on desktop (API selector + API key input)
- Form group spacing: `mb-6`
- Label above input pattern with `mb-2` spacing

**Keyword Input Section**:
- Large textarea: minimum height `h-48`
- Placeholder text with example format
- Character/line counter below textarea: `text-xs text-right mt-2`

**Generation Settings**:
- Inline input for "articles per keyword" with label
- Compact layout: `flex items-center gap-3`

**Primary Action**:
- Large prominent button: `w-full py-3 text-base font-medium`
- Positioned after all inputs with `mt-8` spacing

### 3. Status Log Panel
**Container**:
- Fixed height scrollable area: `h-64 overflow-y-auto`
- Distinct visual separation from form with `mt-12 pt-8` and border-top
- Monospace font for all log entries

**Log Entry Pattern**:
- Timestamp prefix: `[HH:MM:SS]`
- Status indicators: prefix symbols (✓ ✗ ⋯ ↓)
- Entry spacing: `py-1`
- Different entry types visually distinct through spacing and symbols

### 4. Download Section
**Appears Conditionally** (after generation complete):
- Prominent download button with file size indicator
- Success message with article count
- Positioned below status log with `mt-6` spacing

---

## Form Inputs

**Text Input Pattern**:
- Height: `h-11`
- Padding: `px-4`
- Border radius: `rounded-md`
- Border width: `border-2`
- Focus ring: `focus:ring-2 focus:ring-offset-2`

**Textarea Pattern**:
- Same styling as text input
- Padding: `p-4`
- Resize: `resize-none` (fixed height) or `resize-y` (vertical only)

**Select/Dropdown**:
- Same height and padding as text input
- Custom arrow icon from Heroicons

**Button Patterns**:
- Primary: `px-6 py-3 rounded-md font-medium`
- Secondary (download): `px-4 py-2 rounded-md font-medium`
- Disabled state clearly differentiated

---

## Icons

**Library**: Heroicons (via CDN)

**Usage**:
- API selector dropdown: ChevronDownIcon
- Status log indicators: CheckCircleIcon, XCircleIcon, ArrowPathIcon
- Download button: ArrowDownTrayIcon
- Input field icons: KeyIcon (API key), DocumentTextIcon (articles)

**Size**: `h-5 w-5` for inline icons, `h-6 w-6` for button icons

---

## Status Indicators

**Loading State**:
- Animated spinner icon in button during generation
- Button disabled with reduced opacity

**Progress Tracking**:
- Current article number vs total: "Article 3 of 15"
- Step-by-step status messages in log

**Success/Error States**:
- Success: checkmark icon with confirmation message
- Error: X icon with error description
- Clear visual distinction through icons and formatting

---

## Responsive Behavior

**Mobile (< 768px)**:
- Stack API configuration fields vertically
- Reduce textarea height to `h-32`
- Full-width buttons remain prominent
- Status log height reduced to `h-48`

**Desktop (≥ 768px)**:
- Two-column API configuration
- Larger textarea `h-48`
- Status log `h-64`

---

## Accessibility

- All form inputs have associated labels (not placeholders as labels)
- Focus states clearly visible on all interactive elements
- Status log updates announced to screen readers
- Button disabled states prevent multiple submissions
- Error messages associated with relevant inputs

---

## Key Interactions

**Form Validation**:
- Real-time validation for required fields
- Clear error messages below inputs
- Submit button disabled until valid

**Status Log Behavior**:
- Auto-scroll to bottom on new entries
- Entries appear sequentially with slight delay
- Terminal-like appearance with monospace font

**Download Flow**:
- Download button appears only after successful generation
- Single click initiates download
- Success message persists after download

---

## Images

**No images required** for this utility application. The interface is purely functional without need for hero images or decorative graphics.