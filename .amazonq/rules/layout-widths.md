# NexApply — Layout Width Rules

## Fixed Widths

### Sidebar
- **Width:** `248px` (fixed)
- **Position:** Fixed left, full height
- **Border:** 1px solid `#E2E8F0` on right
- **Background:** `#FFFFFF`

### Main Content Offset
- **Margin-left:** `248px` (to account for fixed sidebar)
- All main content areas must have this offset

---

## Page-Specific Layouts

### Single Column Pages (Dashboard, Applications, Job Board)
- **Container:** Full width minus sidebar (auto-calculated)
- **Content padding:** `24px 32px` (vertical horizontal)
- **Max content width:** None (fluid, fills available space)

### Two-Column Pages (Menu.razor — Dashboard)
- **Lower Grid:** `grid-template-columns: 1fr 1fr`
- **Gap:** `16px`
- **Equal columns** for Recent Applications and Top Job Matches

### Three-Column Layout (BrowseJobs.razor)
- **Grid:** `grid-template-columns: 224px 1fr 340px`
- **Left Panel (Filters):** `224px` fixed
- **Center Panel (Job List):** `1fr` (flexible, fills remaining space)
- **Right Panel (Job Detail):** `340px` fixed
- **Gap:** `0` (borders handle visual separation)

---

## Component Widths

### Cards
- **Stat Cards:** Fluid within grid (4-column grid on Dashboard)
- **Job Cards:** Full width of parent container
- **Application Cards:** Full width of parent container
- **Border radius:** `12px` - `14px`

### Inputs & Controls
- **Search Input (Header):** `280px` - `300px`
- **Filter Search Input:** `100%` of parent
- **Sort Select:** Auto-width based on content
- **Buttons:** Auto-width with padding `12px 20px`

### Modals & Overlays
- **Skill Picker:** Full width of filter panel (inherits parent width)
- **Max height:** `280px` with scroll

---

## Responsive Breakpoints (Future)
Currently, NexApply uses fixed desktop layout. When responsive design is needed:

- **Desktop:** `1440px+` (current design)
- **Laptop:** `1024px - 1439px` (collapse right panel, show modal)
- **Tablet:** `768px - 1023px` (stack columns, collapsible sidebar)
- **Mobile:** `< 768px` (full mobile layout, bottom nav)

---

## Spacing Standards

### Horizontal Padding
- **Page content:** `32px` left/right
- **Cards:** `16px` - `20px` internal padding
- **Sidebar:** `10px` - `18px` internal padding
- **Filter panel:** `16px` left/right

### Vertical Padding
- **Page content:** `24px` top/bottom
- **Section gaps:** `16px` - `24px`
- **Card gaps:** `10px` - `16px`

### Grid Gaps
- **Stat cards:** `16px`
- **Job list:** `10px`
- **Info grid:** `8px`

---

## Key Rules

1. **Never hardcode widths for main content areas** — use `flex: 1` or `1fr` in grid
2. **Sidebar is always 248px** — this is the anchor for all layouts
3. **Three-column layout is fixed** — left 224px, right 340px, center flexible
4. **Use padding, not margin** for internal spacing in cards and panels
5. **Maintain consistent gaps** — 8px, 10px, 12px, 16px, 20px, 24px, 32px (multiples of 4)
6. **Border radius consistency** — 6px (small), 8-10px (medium), 12-14px (large)

---

## Layout Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (248px fixed)                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Main Content (margin-left: 248px)                │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Header (sticky, full width)                │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Body (padding: 24px 32px)                  │  │  │
│  │  │  - Single column (Dashboard, Applications)  │  │  │
│  │  │  - Two columns (Menu lower grid)            │  │  │
│  │  │  - Three columns (BrowseJobs)               │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Examples

### Dashboard (Single Column)
```css
.main-content {
    margin-left: 248px;
    padding: 24px 32px;
}

.stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
```

### BrowseJobs (Three Column)
```css
.browse-body {
    display: grid;
    grid-template-columns: 224px 1fr 340px;
    gap: 0;
}

.filter-panel { /* 224px */ }
.job-list-section { /* flexible */ }
.job-detail-panel { /* 340px */ }
```

### Applications (Single Column with Cards)
```css
.applications-body {
    padding: 24px 32px;
}

.app-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.app-card {
    width: 100%; /* fills parent */
    padding: 20px;
}
```
