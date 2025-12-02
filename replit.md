# lolz.live Nomination Tracker

## Overview

This is a real-time nomination and voting tracker for the lolz.live forum's 2024 awards. The application fetches voting data from a specific forum thread, processes user votes across 27 nomination categories, and displays live leaderboards and statistics. It provides a dashboard interface showing top nominees in each category, overall voting statistics, and a live feed of recent votes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing (currently single-page application with dashboard only).

**UI Component System**: Radix UI primitives with shadcn/ui component library styled using Tailwind CSS. The design follows Material Design principles focused on information clarity, scannable data layouts, and consistent patterns for data-heavy applications.

**State Management**: 
- TanStack Query (React Query) for server state management with automatic refetching every 30 seconds
- Local React state for UI interactions
- No global state management library needed due to simple data flow

**Styling Approach**: 
- Tailwind CSS with custom design tokens defined in CSS variables
- HSL color system supporting light/dark themes
- Custom utility classes for elevation effects (`hover-elevate`, `active-elevate-2`)
- Typography system using Roboto and Roboto Mono fonts from Google Fonts

**Design Rationale**: Material Design was chosen over alternatives because the application is utility-focused and data-heavy, requiring clear information hierarchy and efficient data scanning rather than visual flair.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API with a single primary endpoint `/api/nominations` that returns aggregated voting data including category statistics, leaderboards, dashboard stats, and recent votes.

**Data Processing Pipeline**:
1. Fetches posts from lolz.live forum thread via their API
2. Parses post content to extract nominations using text parsing
3. Validates nominations against predefined categories
4. Aggregates votes and maintains deduplication by voter-category-nominee combinations
5. Tracks processed post IDs to avoid reprocessing

**External API Integration**: Connects to lolz.live production API (`https://prod-api.lolz.live`) using bearer token authentication to fetch forum posts with pagination support.

**Vote Parsing Logic**: The system extracts nominations from forum posts by parsing plain text or HTML content, identifying category-nominee pairs, and validating them against the 27 predefined nomination categories.

**Architecture Decisions**:
- **In-Memory Storage**: Uses MemStorage class (implements IStorage interface) for vote data rather than a database. This was chosen because the data is ephemeral (specific to 2024 awards), small enough to fit in memory, and can be reconstructed by re-fetching from the forum API.
- **Polling Strategy**: Backend processes forum posts on-demand when frontend requests data, rather than background job processing, keeping the architecture simple.
- **Storage Abstraction**: IStorage interface allows future migration to PostgreSQL/Drizzle ORM if persistence becomes needed without changing business logic.

### Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Map and Set data structures.

**Database Infrastructure Prepared**: 
- Drizzle ORM configured with PostgreSQL dialect
- Neon serverless PostgreSQL adapter included in dependencies
- Schema definitions in `shared/schema.ts` using Zod for validation
- Migration system configured but not actively used

**Rationale for In-Memory Storage**: 
- Vote data is relatively small (thousands of votes, not millions)
- Data is reconstructable from source (forum thread)
- Faster read/write performance for real-time updates
- Simpler deployment without database provisioning

**Future Migration Path**: The IStorage interface abstraction allows switching to PostgreSQL-backed storage by implementing a new storage class without changing route handlers or business logic.

### External Dependencies

**Third-Party APIs**:
- **lolz.live Forum API**: Primary data source for nomination votes. Requires `LOLZ_API_KEY` environment variable for authentication. Fetches posts from thread ID 9429102.

**Database Services**:
- **Neon Serverless PostgreSQL**: Configured but not actively used. Connection string would be provided via `DATABASE_URL` environment variable.

**UI Libraries**:
- **Radix UI**: Unstyled, accessible component primitives for all interactive UI elements (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component library built on top of Radix UI
- **Lucide React**: Icon library for consistent iconography

**Utility Libraries**:
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date formatting and manipulation
- **TanStack Query**: Server state synchronization and caching
- **clsx & tailwind-merge**: Conditional className composition

**Development Tools**:
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production build bundling for server code
- **Replit Plugins**: Development tooling for Replit environment (cartographer, dev banner, runtime error overlay)

**Environment Variables Required**:
- `LOLZ_API_KEY`: Authentication token for lolz.live API access
- `DATABASE_URL`: PostgreSQL connection string (if database storage is enabled)
- `NODE_ENV`: Environment mode (development/production)

**Deployment Considerations**: The application is optimized for Replit deployment with specific build scripts that bundle server dependencies to reduce filesystem syscalls and improve cold start performance.