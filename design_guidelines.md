# Patient Health Management Dashboard - Design Guidelines

## Design Approach
**Reference-Based Approach**: Medical monitoring systems (hospital monitors, ICU displays)
- Inspired by clinical medical equipment interfaces with real-time data visualization
- Information-dense layout prioritizing data clarity and quick scanning
- Medical-grade interface aesthetic matching the provided dashboard screenshot

## Core Design Principles
1. **Clinical Precision**: Every element serves a clear medical/data purpose
2. **Scan-ability**: Critical health metrics immediately visible without scrolling
3. **Hierarchy of Urgency**: Vital signs prominently displayed, detailed data accessible via navigation
4. **Consistent Data Presentation**: Standardized layouts for all health parameters

---

## Typography System

**Font Families**:
- Primary: Inter or Roboto (Google Fonts) - excellent for data displays and dashboards
- Monospace: Roboto Mono - for vital sign numbers and timestamps

**Type Scale**:
- Large Vitals Display: text-5xl to text-6xl font-bold (heart rate, SpO2, BP)
- Section Headers: text-2xl font-semibold
- Parameter Labels: text-sm font-medium uppercase tracking-wide
- Data Values: text-xl to text-3xl font-semibold
- Body Text: text-base
- Timestamps/Metadata: text-xs to text-sm

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section margins: m-6 to m-8
- Grid gaps: gap-4 to gap-6
- Tight groupings: space-y-2
- Standard groupings: space-y-4

**Dashboard Structure**:

1. **Top Navigation Bar** (h-16):
   - Logo/App name (left)
   - Patient name/ID (center)
   - Logout/Profile (right)
   - Fixed positioning with border-b

2. **Collapsible Side Menu** (w-64 expanded, w-16 collapsed):
   - Smooth transition animations (transition-all duration-300)
   - Icon-only when collapsed
   - Icon + text when expanded
   - Active state highlighting for current section
   - Menu items: Dashboard, ECG Parameters, Reports, Profile, Settings
   - Collapse toggle at bottom

3. **Main Dashboard Area**:
   - Full viewport height minus top nav
   - Scrollable content area with padding p-6
   - Responsive grid system for health parameters

**Vital Signs Grid** (Top Priority Section):
```
Desktop: 4-column grid (grid-cols-4 gap-4)
Tablet: 2-column grid (md:grid-cols-2)
Mobile: Single column (grid-cols-1)
```

Each vital card includes:
- Large number display (primary metric)
- Unit label (BPM, %, °C)
- Parameter name
- Small trend indicator or mini-chart
- Card styling: rounded-lg with border and subtle shadow

---

## Component Library

### Navigation Components

**Collapsible Side Menu**:
- Menu items: h-12 with px-4
- Icon size: w-6 h-6
- Hover state with subtle background change
- Active state with accent border-l-4
- Group headings with text-xs uppercase

**Top Navigation**:
- Height: h-16
- Items aligned with justify-between
- Avatar/profile: w-10 h-10 rounded-full
- Notification badge if needed

### Dashboard Cards

**Vital Sign Card**:
- Padding: p-6
- Border radius: rounded-xl
- Structure:
  - Parameter label (top, small text)
  - Large value display (center, dominant)
  - Unit (inline with value, smaller)
  - Status indicator icon (top-right corner)

**ECG Waveform Display Cards**:
- Full-width sections for each parameter (PLETH, SPO2, RESP, CVP/ART, ECG-OXP, ETCO2)
- Height: h-40 to h-48 per waveform
- Parameter label on left
- Real-time value on right
- Canvas/SVG area for waveform visualization
- 2-column grid for multiple waveforms (grid-cols-2 gap-4)
- Bottom section: full-width ECG strip (h-32)

### Form Components

**Registration Form**:
- Max-width: max-w-md mx-auto
- Vertical spacing: space-y-4
- Input fields: h-12 rounded-lg with px-4
- Labels: text-sm font-medium mb-1
- Error messages: text-xs text-red-500 mt-1
- Dropdown menus with custom styling matching inputs

**Password Field Special Features**:
- Eye icon toggle (right side, absolute positioning)
- Strength indicator bar below field (h-1 rounded-full)
- Match validation checkmark for confirm password

**Blood Group Dropdown**:
- Options: A+, A-, B+, B-, AB+, AB-, O+, O-, Others
- Conditional text input appears when "Others" selected (transition-all)

### Data Visualization

**Charts/Graphs** (using Recharts):
- Line charts for trends over time
- Bar charts for comparative data
- Responsive containers (ResponsiveContainer width="100%" height={300})
- Consistent spacing: mb-8 between charts

**Date Filters**:
- Button group: inline-flex rounded-lg overflow-hidden
- Options: Day, Month, Year
- Active state clearly highlighted
- Positioned top-right of data sections

### Profile Section

**Patient Information Cards**:
- Grid layout: grid-cols-1 md:grid-cols-2 gap-6
- Each info item: label-value pairs with py-3 border-b
- Contact information prominently displayed
- Health records list with date grouping

**Health Records List**:
- Chronological display (most recent first)
- Date headers with text-lg font-semibold sticky top-0
- Record cards with hover state
- Quick view expandable sections

---

## Responsive Behavior

**Breakpoints**:
- Mobile: base (< 768px) - single column, collapsed menu by default
- Tablet: md (768px+) - 2-column grids, expandable menu
- Desktop: lg (1024px+) - full multi-column layouts, menu always visible

**Side Menu Responsive**:
- Mobile: Overlay drawer that slides in from left
- Desktop: Persistent sidebar with collapse option

**Dashboard Grid Adaptations**:
- Mobile: Stack all cards vertically, full-width waveforms
- Tablet: 2-column vital signs, single-column waveforms
- Desktop: 4-column vital signs, 2-column waveforms

---

## Accessibility

- All vital sign values have aria-labels with full descriptions
- Waveform canvases have text alternatives
- Keyboard navigation for all interactive elements
- Focus visible states with ring-2 ring-offset-2
- Color-coding supplemented with icons/patterns
- High contrast maintained throughout (WCAG AA minimum)
- Form validation messages announced to screen readers

---

## Animations

**Minimal, Purposeful Only**:
- Menu collapse/expand: transition-all duration-300
- Hover states: transition-colors duration-150
- Data refresh indicators: subtle pulse animation
- NO scroll animations, parallax, or decorative motion

---

## Images

This dashboard application **does not require hero images or decorative photography**. All visual elements are:
- Charts and data visualizations (generated via Recharts)
- ECG waveform canvases (drawn programmatically)
- Icons from Heroicons (outline style for menu, solid for status indicators)
- User avatar placeholder (patient profile section only)

Focus is entirely on functional data display and medical monitoring interface, not marketing imagery.