# XDistro Music Admin Dashboard

## Project Overview

This is the admin dashboard for XDistro Music, a music distribution platform. The dashboard provides comprehensive tools for administrators to manage users, releases, royalties, and system operations.

## Features

### 🏠 Dashboard Overview
- Real-time statistics and metrics
- Recent activity monitoring
- Quick action buttons
- System health indicators

### 👥 User Management
- View and search all registered users
- Filter by subscription plans and status
- Manage user accounts and subscriptions
- Export user data

### 🎵 Release Management
- Review and approve music releases
- Track submission status
- Manage release metadata
- Monitor distribution progress

### 💰 Royalty Management
- Upload monthly royalty CSV files
- Process royalty distributions
- Track payment history
- Generate royalty reports

### 📋 Royalty Requests
- Review withdrawal requests
- Approve/reject payments
- Manage payment methods
- Monitor transaction status

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd xdistro-admin-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Configure environment values
```bash
cp .env.example .env
```

Use these values in `.env`:
- `VITE_ADMIN_AUTH_MODE=dummy` for local demo data persisted in browser storage
- `VITE_ADMIN_AUTH_MODE=rest` to use backend API endpoints
- `VITE_ADMIN_API_BASE_URL` to point to your admin API base path

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser

## Quality Gate

Run this before pushing changes:

```bash
npm run check
```

This runs linting, TypeScript checks, and production build validation.

## Project Structure

```
src/
├── config/              # Backend mode and route metadata
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminNavbar.tsx
│   │   └── AdminFooter.tsx
│   └── ui/              # Reusable UI components
├── data/                # Dummy seed data for local mode
├── services/            # API/domain services (dummy + rest)
├── hooks/               # React Query hooks per domain
├── pages/
│   ├── admin/           # Admin dashboard pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminReleases.tsx
│   │   ├── AdminRoyalties.tsx
│   │   └── AdminRoyaltyRequests.tsx
│   ├── Login.tsx        # Admin authentication
│   └── NotFound.tsx     # 404 page
├── lib/                 # Utility functions
└── types/               # TypeScript type definitions
```

## Architecture Pattern

Each admin domain follows a consistent vertical slice:

1. `src/types/admin.ts` for domain models and enums
2. `src/data/` for local dummy seed records
3. `src/services/` for backend-ready operations
4. `src/hooks/` for query and mutation hooks
5. `src/pages/admin/` for page UI consuming hooks only

Service behavior is controlled by `VITE_ADMIN_AUTH_MODE`:
- `dummy`: localStorage-backed behavior for local development
- `rest`: fetch-based API calls against `VITE_ADMIN_API_BASE_URL`

This keeps page components thin, preserves local development speed, and makes backend integration incremental.

## Key Components

### AdminNavbar
Navigation component with admin-specific menu items and branding.

### AdminFooter  
Footer component with admin panel information and links.

### Dashboard Pages
- **AdminDashboard**: Overview with statistics and quick actions
- **AdminUsers**: User management interface
- **AdminReleases**: Release review and management
- **AdminRoyalties**: Royalty file upload and processing
- **AdminRoyaltyRequests**: Payment request management

## Authentication

The admin panel includes guarded routes and session refresh handling through the auth context.

- Protected routes redirect unauthenticated users to `/login`
- The attempted destination is preserved and used after successful login
- Session resolution runs during bootstrap to avoid unauthorized flashes
- In `dummy` mode, authentication is local for development only

## Styling

The project uses a custom design system with:
- **Primary Colors**: Orange (#FFA726), Purple (#7342FF), Blue (#3F79FF)
- **Dark Theme**: Dark blue backgrounds with subtle gradients
- **Typography**: Poppins font family
- **Components**: Consistent spacing (8px system) and rounded corners

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by XDistro Music Limited.

## Support

For support or questions about this admin dashboard, please contact the development team.