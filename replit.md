# Hisab Kitab - Personal Finance Tracker

## Overview

Hisab Kitab is a personal finance and expense tracking web application designed for the Bangladeshi market. It features an AMOLED-optimized dark theme, offline-first architecture using IndexedDB, and bilingual support (Bengali/English). The app allows users to track income, expenses, savings, and manage debtor/creditor contacts with full offline functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, Zustand for client state (i18n)
- **Styling**: Tailwind CSS with custom AMOLED-optimized dark theme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions

### Data Storage Strategy
- **Primary (Offline)**: IndexedDB via `idb` library for full offline capability
- **Secondary (Online)**: PostgreSQL database accessed through Drizzle ORM
- **Sync Strategy**: Offline-first with local IndexedDB as source of truth

### Key Design Patterns
- **Shared Code**: The `shared/` directory contains schemas and route definitions used by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared modules
- **Form Handling**: React Hook Form with Zod validation schemas
- **Currency**: BDT (Bangladeshi Taka) with locale-aware formatting

### Database Schema
Core entities defined in `shared/schema.ts`:
- `users` - Settings and PIN lock configuration
- `categories` - Income/expense categories with icons and colors
- `transactions` - All financial transactions with payment method tracking
- `savings` - Savings records by purpose
- `contacts` - Debtors and creditors tracking (Dena-Pona system)

### Features
- Dashboard with monthly financial summary
- Transaction management with filtering
- Savings tracking
- Contact management for debts (payable/receivable)
- PDF report generation with jsPDF
- Local notifications for month-end reminders
- Data export/import for backup
- Bilingual support (Bengali/English)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (`npm run db:push`)

### Third-Party Libraries
- **jsPDF + jspdf-autotable**: PDF report generation (offline-compatible)
- **date-fns**: Date manipulation with Bengali locale support
- **Recharts**: Financial charts and visualizations
- **idb**: IndexedDB wrapper for offline storage

### Development Tools
- **Vite**: Development server and build tool
- **Replit Plugins**: Error overlay, cartographer, and dev banner for Replit environment

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required for server)

### Notes
- The app is designed to work both online and offline
- All financial data can be stored locally in IndexedDB
- No authentication system - single user design
- No cloud sync - data stays on device unless exported