# FaceSnapVault - Smart Event Photo Retrieval System

## Overview

FaceSnapVault is a full-stack web application that uses advanced facial recognition technology to help users find themselves in event photos. Users can upload a selfie and receive instant matches from event photo collections using Google Cloud Vision API for face detection and matching.

The system is built with a modern tech stack featuring React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and Firebase authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Authentication**: Firebase Auth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with proper HTTP status codes
- **File Upload**: Multer for handling multipart form data
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Structured relational design with proper foreign key relationships

## Key Components

### Database Schema
The system uses five main tables:
- **users**: User profiles with Firebase UID mapping
- **events**: Event information with unique access codes
- **photos**: Photo metadata and storage URLs
- **faceVectors**: Face detection data with vector embeddings
- **photoMatches**: User-photo match results with confidence scores

### Authentication System
- Firebase Authentication for user management
- JWT token verification middleware
- Role-based access control (admin/user roles)
- Development-friendly mock authentication fallback

### Face Recognition Pipeline
1. **Photo Processing**: Google Cloud Vision API extracts face vectors
2. **Vector Storage**: Face embeddings stored as JSON in database
3. **Similarity Matching**: Cosine similarity algorithm for face comparison
4. **Confidence Scoring**: Match results ranked by similarity confidence

### File Upload System
- Multer-based file handling with size limits (10MB)
- Image format validation (JPEG, PNG, WebP, GIF)
- Bulk upload support for event organizers
- Progress tracking and error handling

## Data Flow

### User Photo Matching Flow
1. User uploads selfie via web interface
2. Backend processes image with Google Vision API
3. Face vectors extracted and compared with event photos
4. Top matches returned with confidence scores
5. Results displayed in responsive photo gallery

### Admin Event Management Flow
1. Admin creates event with unique access code
2. Bulk photo upload with automatic face detection
3. Face vectors generated and stored for all photos
4. Event photos become searchable by users

### Authentication Flow
1. User signs in with Google OAuth via Firebase
2. Firebase JWT token sent with API requests
3. Backend verifies token and creates/updates user profile
4. Role-based routing (admin vs regular user dashboard)

## External Dependencies

### Core Services
- **Firebase**: Authentication and user management
- **Google Cloud Vision**: Face detection and analysis (mock implementation for development)
- **Neon Database**: Serverless PostgreSQL hosting
- **SendGrid**: Email notifications (mock implementation for development)

### Development Tools
- **Replit**: Cloud development environment
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Development Environment
- Replit-hosted with hot reload via Vite
- Mock implementations for external services
- PostgreSQL database with development data
- Port 5000 for backend, proxied through Vite

### Production Deployment
- Autoscale deployment target on Replit
- Build process: Vite frontend build + ESBuild backend bundle
- Environment variables for API keys and database URLs
- Static file serving for optimized frontend assets

### Database Management
- Drizzle migrations for schema changes
- Connection pooling with Neon serverless
- Automatic schema validation and type generation

## Changelog
- June 18, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.