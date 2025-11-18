# Patient Health Management System

## Overview

This is a comprehensive patient health management web application designed for healthcare monitoring and management. The system provides real-time ECG monitoring, vital signs tracking, and comprehensive health record management with role-based access control. It features a medical-grade interface inspired by clinical monitoring equipment, offering information-dense layouts optimized for quick data scanning and clinical precision.

The application serves two primary user roles:
- **Patients**: Can register, log in, view their personal health data with analytics and filtering capabilities
- **Super Admins**: Can access all patient records and manage the system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: 
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- "New York" style variant with custom theming
- Dark/light mode support with theme persistence

**State Management**:
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod validation for form state
- Local storage for authentication tokens and user preferences

**Routing**: Wouter for lightweight client-side routing

**Design Philosophy**:
- Medical-grade interface aesthetic inspired by clinical monitoring equipment
- Information-dense layouts with clear data hierarchy
- Real-time ECG waveform visualization using HTML5 Canvas
- Responsive design with collapsible sidebar navigation
- Typography: Inter/Roboto for UI text, Roboto Mono for vital sign displays

**Key Pages**:
- Home/Landing page
- Login (with separate tabs for patient/admin)
- Registration with comprehensive form validation
- Dashboard with real-time vital signs and ECG waveforms
- Health Records with date/month/year filtering and analytics charts
- Patient Profile
- Admin Dashboard (admin-only)
- Settings

### Backend Architecture

**Runtime**: Node.js with Express.js server

**API Design**: RESTful API with JSON payloads

**Authentication & Authorization**:
- JWT (JSON Web Tokens) for stateless authentication
- Bcrypt for password hashing (10 salt rounds minimum)
- Role-based access control with middleware enforcement
- Separate authentication flows for patients and admins

**Data Storage Strategy**:
- Currently using in-memory storage (MemStorage class) for development
- Designed with abstraction layer (IStorage interface) for easy migration to persistent database
- Drizzle ORM configured for PostgreSQL (production-ready schema defined)

**API Endpoints**:
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- `/api/users/:id` - User profile retrieval
- `/api/patients/:userId/records` - Patient health records
- `/api/ecg-data/:userId/:filterPeriod` - ECG data with time-based filtering
- `/api/admin/users` - Admin access to all users
- `/api/admin/ecg-data` - Admin access to all ECG data

**Security Features**:
- Password strength validation
- Email format verification (RFC 5322 standard)
- Phone number format validation
- JWT token expiration
- Protected routes with authentication middleware
- Role-based authorization middleware

### Data Models

**Users Table**:
- Basic authentication (email, password hash)
- Contact information (phone)
- Medical profile (blood group, gender)
- Role designation (patient/admin)
- Support for custom blood group entry

**Patient Records Table**:
- Links to user via foreign key
- Timestamp-based record keeping
- Diagnosis and notes fields

**ECG Data Table**:
- Comprehensive vital signs (heart rate, SpO2, blood pressure, temperature, respiratory rate)
- Multiple waveform parameters stored as JSON strings (pleth, SpO2, resp, CVP/ART, ECG/OXP, ETCO2)
- Time-based filtering support
- Links to both user and patient record

### Form Validation

**Registration Validation**:
- Email: RFC 5322 standard format
- Phone: 10-digit format validation
- Password: Strength requirements with confirmation matching
- Blood group: Dropdown with conditional custom entry
- All fields required with appropriate error messaging

**Password Requirements**:
- Toggle visibility for password fields
- Confirmation field matching
- Strength validation
- Secure hashing before storage

### Data Visualization

**Charts & Analytics**:
- Recharts library for health metrics visualization
- Line charts for tracking vital signs over time
- Filtering by day, month, and year periods
- Real-time waveform rendering on HTML5 Canvas

**Waveform Types**:
- Pleth (Plethysmograph)
- SpO2 (Oxygen Saturation)
- Respiratory
- CVP/Arterial
- ECG/OXP
- ETCO2 (End-Tidal CO2)

## External Dependencies

### Third-Party UI Libraries
- **@radix-ui/***: Comprehensive suite of accessible UI primitives (accordion, dialog, dropdown, select, tabs, toast, etc.)
- **class-variance-authority**: Utility for building variant-based component APIs
- **cmdk**: Command palette component
- **lucide-react**: Icon library
- **recharts**: Charting library for health metrics visualization
- **react-day-picker**: Calendar/date picker component
- **vaul**: Drawer component library
- **embla-carousel-react**: Carousel component

### Form Management & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolvers
- **zod**: Schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod

### Database & ORM
- **drizzle-orm**: TypeScript ORM
- **drizzle-kit**: Migration and schema management toolkit
- **@neondatabase/serverless**: Neon serverless PostgreSQL driver (configured but not actively used)

### Authentication & Security
- **bcrypt**: Password hashing library (10+ salt rounds)
- **jsonwebtoken**: JWT token generation and verification
- **connect-pg-simple**: PostgreSQL session store (configured for future use)

### Development Tools
- **TypeScript**: Type safety across entire stack
- **Vite**: Build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins (cartographer, dev banner, runtime error modal)

### Styling
- **tailwindcss**: Utility-first CSS framework
- **autoprefixer**: PostCSS plugin for vendor prefixes
- **tailwind-merge**: Utility for merging Tailwind classes
- **clsx**: Conditional class name composition

### State Management
- **@tanstack/react-query**: Server state management and data fetching

### Routing
- **wouter**: Lightweight routing library

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation