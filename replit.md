# Article Generator Tool

## Overview

This is an AI-powered article generation web application that enables bulk content creation for link building and SEO purposes. Users can input multiple keyword-URL pairs and generate articles using either Groq or Gemini AI APIs. The application processes requests asynchronously, provides real-time progress updates, and packages completed articles into downloadable ZIP archives.

The tool is built as a single-page application with a focus on workflow efficiency, real-time status feedback, and minimal cognitive load for users performing repetitive content generation tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: Shadcn/ui components built on Radix UI primitives
- Design inspired by modern productivity tools (Linear, Vercel, Notion)
- Follows a "new-york" style variant with neutral color palette
- Component library includes comprehensive form controls, dialogs, toasts, and data display components
- CSS-in-JS using Tailwind CSS with custom design tokens

**State Management**:
- TanStack Query (React Query) for server state management and API communication
- Local React state for form inputs and UI interactions
- Custom hooks for toast notifications and mobile responsive behavior

**Routing**: Wouter for lightweight client-side routing (single page with 404 fallback)

**Design System Principles**:
- Functional clarity over decoration
- Single-column layout optimized for form-based workflows
- Consistent spacing using Tailwind units (2, 3, 4, 6, 8, 12)
- Typography hierarchy using Inter font for UI and JetBrains Mono for technical output
- Real-time status visibility through live log displays

### Backend Architecture

**Framework**: Express.js server with TypeScript

**API Design**:
- RESTful endpoints for article generation job management
- POST `/api/generate` - Initiates bulk article generation job
- GET `/api/job/:id` - Polls job status and progress
- GET `/api/download/:id` - Downloads completed article ZIP archive

**Request Processing Pattern**:
- Asynchronous job processing with immediate job ID response
- Client polls for status updates using job ID
- Fire-and-forget pattern separates request acceptance from processing

**Storage Strategy**:
- In-memory storage using Map-based implementation (`MemStorage`)
- Job state tracking includes status, progress counters, and file paths
- File system used for temporary article storage and ZIP archive creation

**File Management**:
- Articles saved in structured directories: `output/{jobId}/Article_{n}_{keyword}/article.txt`
- ZIP archive creation using `archiver` library
- Automatic text cleaning pipeline removes special Unicode characters

**AI Integration Pattern**:
- Provider abstraction supporting multiple AI services (Groq, Gemini)
- API key passed per-request for multi-tenant usage
- Standard prompt template injecting keyword and URL parameters
- Error handling with descriptive messages propagated to client

### Data Storage Solutions

**Session/Job Storage**: In-memory Map structure (ephemeral, suitable for Replit deployment)
- Jobs stored with unique IDs generated using `crypto.randomUUID()`
- No persistent database required for current implementation
- State includes: job ID, status enum, article counters, file paths, error messages

**File System Storage**:
- Article text files stored in job-specific directories
- ZIP archives created on-demand and stored temporarily
- Output directory structure: `/output/{jobId}/Article_{index}_{sanitized_keyword}/article.txt`

**Database Configuration** (Drizzle ORM setup present but not actively used):
- Configured for PostgreSQL via `@neondatabase/serverless`
- Schema and migration configuration exists in `drizzle.config.ts`
- Connection managed through `DATABASE_URL` environment variable
- Currently dormant - potential future enhancement for job persistence

### Authentication and Authorization

**Current State**: No authentication implemented
- Open access model suitable for single-user or trusted environment deployment
- API keys for AI services provided per-request by client

**Security Considerations**:
- Raw body verification enabled for potential webhook integrations
- CORS and credential handling configured for same-origin requests
- Session store configuration present (`connect-pg-simple`) but not activated

### Text Processing Pipeline

**Article Cleaning Logic**:
- Removes Unicode characters: left/right single quotation marks (U+2018, U+2019)
- Replaces em-dash (U+2014) with spaces
- Normalizes whitespace while preserving line breaks
- Applied to all generated content before file storage

**Keyword Sanitization**:
- Non-alphanumeric characters replaced with underscores
- Truncated to 50 characters for filename compatibility
- Used in directory naming for article organization

## External Dependencies

### Third-Party AI Services

**Gemini AI** (`@google/genai`):
- Model: `gemini-2.0-flash-exp`
- Used for article generation with custom prompts
- Configuration: temperature 0.7 (not explicitly set in code, using defaults)
- API key required per request

**Groq** (`groq-sdk`):
- Model: `llama-3.3-70b-versatile`
- Alternative AI provider for article generation
- Configuration: temperature 0.7, max tokens 2048
- API key required per request

### Database and Storage

**Neon PostgreSQL** (`@neondatabase/serverless`):
- Serverless PostgreSQL provider
- Configured but not currently utilized in application logic
- Connection via `DATABASE_URL` environment variable
- Intended for future job persistence or user management

**Drizzle ORM**:
- Type-safe SQL query builder
- Schema defined in `shared/schema.ts`
- Migration output directory: `./migrations`
- Currently in standby mode - infrastructure ready for activation

### Development and Build Tools

**Vite**: Frontend build tool and dev server
- React plugin for JSX transformation
- Runtime error overlay via `@replit/vite-plugin-runtime-error-modal`
- Replit-specific plugins for cartographer and dev banner (development only)
- Path aliases: `@/` for client, `@shared/` for shared code, `@assets/` for assets

**TypeScript**: Full-stack type safety with strict mode enabled

**Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### UI Component Libraries

**Radix UI**: Unstyled accessible component primitives (20+ components imported)
- Forms, dialogs, dropdowns, tooltips, popovers
- Fully accessible with keyboard navigation and ARIA support

**Shadcn/ui**: Pre-styled component layer built on Radix UI
- Customizable through Tailwind design tokens
- Components include buttons, cards, forms, data display elements

### Utility Libraries

**Archiver**: ZIP file creation for article package downloads

**React Hook Form** + **Zod**: Form validation and type-safe schema validation
- `@hookform/resolvers` bridges Zod schemas to form validation

**Class Variance Authority**: Type-safe component variant styling

**date-fns**: Date manipulation and formatting

**clsx** + **tailwind-merge**: Conditional CSS class composition