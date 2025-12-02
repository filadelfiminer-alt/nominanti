# Design Guidelines: lolz.live Nomination Tracker

## Design Approach
**Selected Approach:** Design System - Material Design

**Justification:** This is a utility-focused, data-heavy application requiring clear information hierarchy, efficient data scanning, and stability. Material Design provides excellent patterns for dashboards, tables, and data visualization while maintaining visual clarity.

**Key Principles:**
- Information clarity over visual flair
- Scannable data layouts
- Consistent patterns for repeated use
- Responsive data tables and cards

## Typography System

**Font Family:** Google Fonts - Roboto (primary), Roboto Mono (numbers/stats)

**Hierarchy:**
- H1 (Page Title): 2.5rem, font-weight: 500
- H2 (Category Headers): 1.75rem, font-weight: 500  
- H3 (Nominee Names): 1.25rem, font-weight: 500
- Body Text: 1rem, font-weight: 400
- Stats/Numbers: 1.5rem, font-weight: 700 (Roboto Mono)
- Labels: 0.875rem, font-weight: 500, uppercase, letter-spacing: 0.5px

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Card padding: p-6
- Section spacing: mb-8
- Grid gaps: gap-4 to gap-6
- Component margins: m-4

**Container Strategy:**
- Max-width: max-w-7xl mx-auto
- Side padding: px-4 md:px-8
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation Header
- Fixed top bar with site branding "Номинации lolz.live 2024"
- Real-time update indicator (pulse animation)
- Last updated timestamp
- Refresh button

### Dashboard Overview (Hero Section)
- Statistics cards grid (3-4 columns on desktop):
  - Total votes cast
  - Total nominees
  - Most nominated user
  - Categories completed
- No large hero image - focus on immediate data access

### Category Cards
Primary view for displaying nomination categories:
- Card-based layout with elevation
- Category title prominently displayed
- Top 5 nominees per category shown by default
- Vote count badges (pill-shaped, right-aligned)
- "View All" expansion option for categories with more nominees
- Grid: 1 column mobile, 2 columns tablet, 3 columns desktop

### Leaderboard Table
Alternative view showing cross-category leaders:
- Sortable table columns: Rank, Username, Total Votes, Categories
- Sticky header on scroll
- Row hover states
- Pagination for 50+ entries

### Nominee Display Pattern
Consistent across all components:
- Username (linked to lolz.live profile)
- Vote count in prominent badge
- Rank indicator for top 3 (medals/badges)

### Live Update Feed
Sidebar or bottom panel:
- Real-time stream of new votes detected
- Format: "Username voted for @Nominee in Category"
- Auto-scrolling, dismissible
- Compact, non-intrusive

### Filter/Sort Controls
- Category dropdown selector
- Sort by: Most votes, Alphabetical, Recent activity
- Search bar for finding specific nominees
- Material Design outlined text fields

## Animations

**Minimal and Purposeful:**
- Pulse indicator for live updates (subtle, 2s interval)
- Smooth number count-up when votes change (0.3s)
- Card hover: subtle lift (translate-y: -2px, 0.2s ease)
- No scroll animations, parallax, or decorative motion

## Icons

**Library:** Material Icons (via CDN)
- trophy icons for rank badges
- refresh icon for manual updates
- search icon in filter bar
- expand/collapse chevrons

## Russian Language Optimization

- Ensure adequate spacing for longer Cyrillic text
- Test all labels and buttons with Russian content
- No text truncation in critical UI elements

## Data Visualization

- Bar chart option for vote comparison within categories
- Use simple, readable charts (Chart.js or similar)
- Minimal chart decoration, focus on data clarity

## Responsive Breakpoints

- Mobile (< 768px): Single column, stacked cards
- Tablet (768-1024px): 2-column grid
- Desktop (> 1024px): 3-column grid, sidebar layouts

**Critical:** All data must remain accessible and readable at any viewport size. Tables convert to card-based layouts on mobile.