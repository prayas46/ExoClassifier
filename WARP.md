# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered exoplanet classification web application built with React, TypeScript, and Vite. The application allows users to classify exoplanets using NASA datasets (K2, Kepler, and TESS) through an interactive UI with both single and batch analysis capabilities.

## Essential Commands

### Development Workflow
- `npm i` - Install dependencies
- `npm run dev` - Start development server (runs on http://localhost:8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Alternative Package Manager
This project includes a `bun.lockb` file, indicating Bun compatibility:
- `bun install` - Alternative to npm install
- `bun dev` - Alternative to npm run dev

## Architecture Overview

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: shadcn/ui (Radix-based component library)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion
- **State Management**: React hooks + TanStack React Query for server state

### Key Application Structure

#### Main Application Flow
The app follows a single-page application structure with these key sections:
1. **Hero Section** - Introduction with embedded YouTube video
2. **Features Section** - Bento grid layout showcasing NASA datasets and AI capabilities
3. **Classifier Section** - Main interactive component with dual modes:
   - Single planet analysis with adjustable parameters
   - Batch analysis (CSV upload - currently mock implementation)
4. **3D Visualization** - Embedded Spline 3D model for visual feedback

#### Core Components Architecture
- `src/App.tsx` - Root component with routing, providers, and toasters
- `src/pages/Index.tsx` - Main page composition
- `src/components/Classifier.tsx` - The heart of the app containing:
  - Parameter sliders for exoplanet properties
  - Mock classification logic
  - Results display with confidence scores
  - 3D visualization integration

### Data Flow & Classification Logic
The classifier currently uses mock data but is structured for real API integration:
- Input parameters: orbital period, planet radius, transit depth/duration, planet mass, stellar temperature/radius, system distance
- Output: planet type, confidence score, habitability score, size category, estimated temperature
- Currently simulates 2-second processing delay with deterministic mock results

### UI/UX Patterns
- **Design System**: Uses shadcn/ui components with custom Tailwind configuration
- **Responsive Design**: Mobile-first approach with grid layouts
- **Animation Strategy**: Framer Motion for page transitions and micro-interactions
- **Theme Support**: Built-in dark/light mode support via next-themes

## Development Guidelines

### Component Development
- All components use TypeScript with proper type definitions
- UI components follow shadcn/ui patterns with Radix primitives
- Animation components use Framer Motion with `whileInView` for performance
- Form components integrate with React Hook Form and Zod validation

### State Management Approach
- Local state with React hooks for UI interactions
- TanStack React Query for async operations (ready for API integration)
- No global state management (Redux/Zustand) - component-level state sufficient

### Styling Conventions
- Tailwind utility classes with CSS variables for theming
- Component variants using `class-variance-authority` (cva)
- Consistent spacing and color scheme using design tokens
- Custom utilities in `src/lib/utils.ts` for className merging

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Classifier.tsx  # Main classifier component
│   ├── Hero.tsx        # Landing section
│   ├── Features.tsx    # Feature showcase
│   └── Footer.tsx      # Site footer
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── assets/             # Static assets
```

## API Integration Readiness

The codebase is structured for easy API integration:
- Replace mock classification logic in `Classifier.tsx` with real API calls
- TanStack React Query is configured for async operations
- Error handling patterns established with toast notifications
- Loading states already implemented throughout UI

### Expected API Structure
Based on the current mock implementation, the API should accept:
```typescript
interface PlanetData {
  orbital_period: number;
  planet_radius: number;
  transit_depth: number;
  transit_duration: number;
  planet_mass: number;
  stellar_temperature: number;
  stellar_radius: number;
  system_distance: number;
}
```

And return:
```typescript
interface ClassificationResult {
  planet_type: string;
  confidence: number;
  habitability_score: number;
  size_category: string;
  temperature: number;
}
```

## External Dependencies

### Major Libraries
- **@radix-ui/*** - Accessible UI primitives for complex components
- **framer-motion** - Animation library with performance optimizations
- **@tanstack/react-query** - Server state management and caching
- **react-router-dom** - Client-side routing
- **tailwindcss** - Utility-first CSS framework
- **zod** - TypeScript-first schema validation

### Development Tools
- **@vitejs/plugin-react-swc** - Fast React compilation
- **typescript-eslint** - TypeScript-aware linting
- **lovable-tagger** - Development-time component tagging

## Deployment Notes

- Built with Vite for optimal production bundles
- Static assets served from `public/` directory  
- Environment configured for Lovable platform deployment
- Production build outputs to `dist/` directory

## 3D Integration

The app integrates Spline 3D models via iframe embedding:
- Main 3D visualization: https://my.spline.design/worldplanet-ACy9j4dwrbm6RTBiCz8JGpFz/
- Provides visual feedback during classification
- Loading states and overlays implemented for smooth UX

## Future Enhancement Areas

Based on the current codebase structure:
1. **Real API Integration** - Replace mock classification with actual ML model endpoints
2. **Batch Processing** - Complete CSV upload and processing functionality
3. **Enhanced Visualizations** - Additional 3D models based on classification results
4. **Advanced Analytics** - Historical analysis and comparison features
5. **User Accounts** - Save classifications and analysis history