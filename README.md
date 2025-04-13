# AI-Powered Survey Platform

## Project Overview
An AI-powered survey creation and analytics platform that enables intelligent survey design, distribution, and in-depth analysis with advanced insights.

## Features
- Robust template library with multiple pre-designed survey templates
- Flexible question type configurations
- Enhanced navigation
- Template page functionality
- Comprehensive password reset flow with separate forget password page
- AI-powered survey generation and analysis

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: Passport.js
- **AI Integration**: OpenAI

## Agent Conversation History

### Initial Project Setup
The project was set up with a full-stack JavaScript application structure:
- Frontend: React with TypeScript using Vite
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: Implemented using Passport.js

### Database Schema
Created a robust database schema in `shared/schema.ts` with tables for:
- Users
- Surveys
- Survey responses
- Survey templates

### Authentication System
Implemented a complete authentication system with:
- Login functionality
- Registration
- Password reset flow
- Protected routes

### Survey Features
Developed core survey functionality:
- Survey creation
- Template selection
- Survey distribution
- Response collection
- Analytics dashboard with AI-powered insights

### Navigation and UI
- Enhanced navigation with responsive design
- Template page for selecting pre-designed surveys
- Landing page with informative sections
- Dashboard for managing surveys

### AI Integration
- OpenAI integration for survey generation
- Sentiment analysis of survey responses
- Trend analysis across multiple responses
- Key insights extraction

### Recent Improvements
- Enhanced template selection page
- Improved password reset flow
- Responsive design adjustments
- Analytics dashboard improvements

## Development Guidelines
Always follow these guidelines when building a full-stack JavaScript application:

### Architecture
- Follow modern web application patterns and best-practices
- Put as much of the app in the frontend as possible
- Backend is primarily responsible for data persistence and API calls
- Minimize the number of files

### Types
- Data models defined in `shared/schema.ts`
- Use insert schemas with `createInsertSchema` from `drizzle-zod`
- Define proper types for insert and select operations

### Storage
- Update `IStorage` in `server/storage.ts` for any new storage operations
- Ensure storage interface uses types from `shared/schema.ts`

### Backend
- API routes in `server/routes.ts`
- Use storage interface for CRUD operations
- Validate request bodies using Zod schemas

### Frontend
- Use `wouter` for routing
- Use shadcn's `useForm` hook and `Form` component
- Use `@tanstack/react-query` for data fetching

### Styling and Theming
- Configure `theme.json` for design preferences
- Use shadcn + Tailwind CSS components
- Create responsive grid-based design
- Use icons from `lucide-react` and `react-icons/si`

## Running the Project
The workflow named 'Start application' runs `npm run dev` which starts both the Express server and Vite development server.