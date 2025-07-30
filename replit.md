# CongressTrack Application

## Overview

CongressTrack is a full-stack web application that allows users to track how their representatives vote on congressional issues. The application enables users to view representatives, explore their voting records, rate votes based on personal preferences, and see alignment scores showing how closely their views match with their representatives' voting patterns.

## System Architecture

This is a modern full-stack application built with:

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server
- **TailwindCSS** with shadcn/ui components for styling
- **React Query (@tanstack/react-query)** for state management and API calls
- **Wouter** for client-side routing
- **Recharts** for data visualization (alignment charts)

### Backend Architecture
- **Express.js** with TypeScript for the REST API server
- **Node.js** runtime environment
- **PostgreSQL** database with Drizzle ORM for data persistence
- **Neon Database** for cloud PostgreSQL hosting
- **Congress.gov API** integration for congressional data

### Database Design
The application uses a PostgreSQL database with the following main entities:
- **Users**: User authentication and profile data
- **Representatives**: Congressional member information (senators and house representatives)
- **Votes**: Bill voting records with metadata
- **Member Votes**: Individual representative voting positions
- **User Preferences**: User ratings and importance scores for specific votes
- **Alignment Scores**: Calculated compatibility between users and representatives

## Key Components

### Data Layer
- **Drizzle ORM** for type-safe database operations
- **Schema definitions** in TypeScript for all database tables
- **Database migrations** managed through Drizzle Kit
- **Connection pooling** via Neon's serverless PostgreSQL

### API Layer
- **RESTful API** endpoints for all data operations
- **Congress.gov API integration** for real-time congressional data
- **Request/response logging** middleware
- **Error handling** with proper HTTP status codes

### Frontend Components
- **Representative browsing** with filtering by state, chamber, and name
- **Voting history visualization** with categorization and time-based filtering
- **User preference tracking** with importance weighting
- **Alignment score calculation** and visualization
- **Responsive design** for mobile and desktop

### External Integrations
- **Congress.gov API** for official congressional voting data
- **Profile images** from theunitedstates.io for representative photos

## Data Flow

1. **Data Ingestion**: Congressional data is fetched from Congress.gov API and stored locally
2. **User Interaction**: Users browse representatives and view voting records
3. **Preference Capture**: Users rate votes with agreement/disagreement and importance levels
4. **Score Calculation**: Alignment scores are computed based on user preferences vs. representative votes
5. **Visualization**: Charts and statistics display user-representative alignment

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **axios**: HTTP client for API calls
- **express**: Web application framework
- **@radix-ui/**: Headless UI components
- **@tanstack/react-query**: Server state management
- **recharts**: Chart visualization library

### Development Dependencies
- **drizzle-kit**: Database schema management
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: CSS framework
- **esbuild**: Fast JavaScript bundling

### Environment Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `CONGRESS_GOV_API_KEY`: Official Congress.gov API access key

## Deployment Strategy

### Build Process
1. **Frontend build**: Vite compiles React app to static assets
2. **Backend build**: esbuild bundles Node.js server code
3. **Database migration**: Drizzle pushes schema changes to production database

### Production Setup
- **Static assets** served from `/dist/public`
- **API server** runs on Node.js with Express
- **Database** hosted on Neon's serverless PostgreSQL
- **Environment configuration** through process.env variables

### Development Workflow
- **Hot module replacement** via Vite dev server
- **TypeScript compilation** with strict type checking
- **Database schema evolution** through Drizzle migrations
- **API development** with Express middleware for logging and error handling

## Changelog

Changelog:
- July 30, 2025. Successfully integrated PostgreSQL database using Neon, replacing in-memory storage with persistent database storage
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.