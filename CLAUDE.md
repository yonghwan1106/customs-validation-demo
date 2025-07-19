# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Builds the production application
- **Production**: `npm run start` - Starts the production server (requires build first)
- **Lint**: `npm run lint` - Runs ESLint (currently configured to ignore errors during builds)

## Project Architecture

This is a **Next.js 15 App Router** application implementing a **customs validation system** for the Korean Customs Service contest. The application provides AI-powered import declaration validation and FTA benefit calculations.

### Core Application Structure

**Frontend Architecture:**
- **Next.js App Router** with TypeScript and Tailwind CSS
- **Component-based architecture** using Radix UI primitives
- **Responsive design** with dedicated mobile optimization components
- **Progressive enhancement** with client-side interactivity

**Backend Architecture:**
- **API routes** in `app/api/` for backend functionality
- **SQLite database** (`data/demo.db`) with Better SQLite3
- **AI simulation modules** for HS code classification and validation
- **Mock data and demo scenarios** for testing

### Key Application Features

1. **Import Declaration Validation** (`/validation`):
   - HS code classification and validation
   - Price anomaly detection
   - Origin verification
   - Risk assessment scoring

2. **FTA Calculator** (`/fta-calculator`):
   - Free Trade Agreement benefit analysis
   - Country-specific tariff calculations
   - Certificate requirements

3. **Real-time Dashboard** (main page):
   - Live system statistics
   - Mobile-optimized views
   - Interactive onboarding tour

### Directory Structure

- `app/` - Next.js App Router pages and API routes
  - `api/` - Backend API endpoints
  - `validation/` - Import validation page
  - `fta-calculator/` - FTA calculator page
- `components/` - React components organized by type
  - `ui/` - Base UI components (shadcn/ui)
  - `charts/` - Chart components using Chart.js
- `lib/` - Utility libraries
  - `ai/` - AI simulation modules (HS code classifier, price validator, risk assessment)
  - `database/` - SQLite operations and schema
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `data/` - Database files and mock data

### Database Schema

The SQLite database includes:
- `hscodes` - HS code descriptions and metadata
- `fta_rates` - FTA tariff rates by country
- `price_stats` - Price statistics for anomaly detection
- `demo_scenarios` - Predefined test scenarios

### UI Framework

- **Tailwind CSS** for styling with custom gradient themes
- **Radix UI** components for accessibility
- **Lucide React** for icons
- **Chart.js** with react-chartjs-2 for data visualization
- **Custom tour system** for user onboarding

### Testing and Demo Features

The application includes extensive demo functionality:
- **Visual test scripts** in root directory (test-*.js files)
- **Screenshot generation** for mobile and desktop views
- **Predefined scenarios** for quick testing
- **Mock AI responses** with realistic confidence scores

### Development Notes

- ESLint is configured to ignore errors during builds (`next.config.ts`)
- TypeScript paths configured with `@/*` alias
- Database is automatically initialized on startup
- All AI functionality is currently simulated (ready for real model integration)
- Mobile-first responsive design with dedicated mobile components

### Korean Language Support

The application is primarily in Korean for the Korean Customs Service contest, with:
- Korean UI text and form labels
- Korean HS code descriptions
- Korean country names in dropdowns
- Korean status messages and validation feedback