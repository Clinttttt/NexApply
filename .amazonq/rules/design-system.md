# NexApply — Design System

## Color Palette

### Primary
- **Deep Blue** `#1D4ED8` — primary brand, buttons, active states, badges
- **Blue Light** `#3B82F6` — hover states, gradients
- **Blue BG** `#EFF6FF` — backgrounds, subtle highlights
- **Blue Border** `#BFDBFE` — borders, dividers

### Neutrals (Slate Grays)
- **Slate 900** `#0F172A` — primary text, headings
- **Slate 800** `#1E293B` — secondary surfaces
- **Slate 600** `#475569` — body text
- **Slate 500** `#64748B` — muted text
- **Slate 400** `#94A3B8` — placeholder text
- **Slate 200** `#E2E8F0` — borders
- **Slate 100** `#F1F5F9` — subtle backgrounds
- **Slate 50** `#F8FAFC` — page background

### Accent Colors
- **Amber** `#D97706` / `#FEF3C7` — warnings, under review
- **Green** `#059669` / `#D1FAE5` — success, shortlisted
- **Red** `#DC2626` / `#FEE2E2` — errors, declined

### White
- **White** `#FFFFFF` — cards, sidebar, primary surfaces

## Typography

### Fonts
- **Primary:** DM Sans (body text, UI)
- **Display:** Fraunces (headings, logo, large numbers)

### Font Sizes
- `10px` — labels, tiny text
- `11px` — small buttons, badges
- `12px` — secondary text
- `13px` — base text
- `13.5px` — nav items, body
- `14px` — emphasized text
- `15-16px` — card titles
- `18px` — logo, section headers
- `24-26px` — page titles
- `32-36px` — stat values

## Spacing
- `4px` — tight spacing
- `8px` — compact spacing
- `12px` — default gap
- `16px` — card padding
- `20px` — section padding
- `24px` — large padding
- `32px` — page margins

## Border Radius
- `6px` — small elements (buttons, badges)
- `8px` — nav items, inputs
- `10px` — cards (small)
- `12px` — cards (medium)
- `14px` — cards (large)
- `50%` — circles (avatars)

## Shadows
- **Small:** `0 1px 2px rgba(15, 23, 42, 0.05)`
- **Medium:** `0 2px 8px rgba(15, 23, 42, 0.08)`
- **Large:** `0 4px 20px rgba(15, 23, 42, 0.08)`
- **Primary:** `0 2px 8px rgba(29, 78, 216, 0.3)` — blue glow

## Transitions
- **Fast:** `0.12s ease` — hover states
- **Base:** `0.15s ease` — standard interactions
- **Slow:** `0.2s ease` — complex animations

## Component Patterns

### Cards
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Radius: `12px` or `14px`
- Padding: `16px` - `20px`
- Shadow on hover: `0 4px 20px rgba(15, 23, 42, 0.08)`

### Buttons
- Primary: Blue background `#1D4ED8`, white text
- Secondary: Light blue background `#EFF6FF`, blue text `#1D4ED8`
- Padding: `4px 10px` (small), `8px 16px` (medium)
- Radius: `6px` - `8px`

### Badges
- Small: `11px` font, `2px 7px` padding
- Radius: `10px` (pill shape)
- Colors match context (blue, amber, green)

### Icons
- Size: `15px` - `17px` for UI icons
- Stroke width: `2px` standard
- Color: inherit from parent

## Usage Rules

1. **Always use CSS variables** from `app.css` instead of hardcoded colors
2. **Maintain 2-color focus:** Blue + Slate grays (use amber/green sparingly)
3. **White-dominant design:** Most surfaces should be white `#FFFFFF`
4. **Consistent spacing:** Use multiples of 4px
5. **Smooth transitions:** Always add transitions to interactive elements
6. **Accessible contrast:** Ensure text meets WCAG AA standards
