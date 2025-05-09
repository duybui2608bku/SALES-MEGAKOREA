# System Patterns

## System Architecture

### Overall Architecture

The SALE-MANAGER-MEGAKOREA system follows a client-server architecture with:

- **Frontend**: React-based SPA (Single Page Application)
- **Backend**: Express-based REST API server
- **Database**: MongoDB for data persistence

### Network Architecture

```
[Client Browser] <--HTTP/HTTPS--> [Express Server] <---> [MongoDB]
```

## Application Structure

### Frontend Structure

- **Atomic Design Pattern**: Components are organized in a hierarchical structure

  - `/Components`: Reusable UI components
  - `/Pages`: Page-level components
  - `/Modal`: Modal components organized by domain
  - `/Layouts`: Layout components including headers, footers, and main layout

- **Context-based State Management**:

  - `/Context`: React Context API for global state management
  - `AppContext.tsx`: Main application context

- **Feature-based Organization**:

  - Domain-specific folders (User, Product, Services, etc.)
  - Each domain has its own components, interfaces, and services

- **Service Layer Pattern**:
  - `/Service`: API service modules organized by domain
  - Each service module encapsulates API calls to the backend

### Backend Structure

- **MVC-like Pattern**:

  - `/controllers`: Request handlers
  - `/models`: Data models and schema definitions
  - `/routes`: API endpoint definitions

- **Repository Pattern**:

  - `/repository`: Data access layer separating business logic from data storage

- **Service Layer**:

  - `/services`: Business logic layer

- **Domain-Driven Structure**:
  - Organization around business domains (branch, product, services, etc.)

## Key Design Patterns

### Frontend Patterns

1. **Provider Pattern**:

   - AppProvider wraps the application to provide global state
   - Context API used for state management

2. **Component Composition**:

   - Components are composed to build complex UIs
   - MainLayout used to provide consistent page structure

3. **Protected Routes Pattern**:

   - Role-based route protection
   - Authentication-based route protection

4. **Custom Hooks**:

   - `/hook`: Custom React hooks for reusable logic
   - `useRouterElements`: Hook for managing routing

5. **Query Pattern**:
   - TanStack Query (React Query) for data fetching and caching
   - Separation of data fetching from components

### Backend Patterns

1. **Middleware Pattern**:

   - Authentication middleware
   - Error handling middleware
   - Request validation middleware

2. **Repository Pattern**:

   - Abstraction of data storage operations
   - Domain-specific repositories

3. **Service Layer**:

   - Business logic encapsulation
   - Database connection service

4. **Controller-Service-Repository**:
   - Controllers handle HTTP requests
   - Services contain business logic
   - Repositories handle data access

## Data Flow Patterns

### Frontend Data Flow

1. **Component Initialization**:

   - Component mounts
   - TanStack Query hooks fetch data
   - Data displayed in component

2. **User Interaction**:
   - User triggers action
   - Handler function processes interaction
   - API service called
   - TanStack Query invalidates and refetches data if needed
   - UI updates with new data

### Backend Data Flow

1. **Request Handling**:
   - Express route receives request
   - Middleware processes request (auth, validation)
   - Controller function handles request
   - Service performs business logic
   - Repository interacts with database
   - Response returned to client

## Critical Implementation Paths

### Authentication Flow

1. User enters credentials on Login page
2. Credentials sent to `/users/login` endpoint
3. Server validates credentials and generates JWT
4. Client stores JWT in local storage
5. Client includes JWT in subsequent requests
6. Protected routes check authentication status

### Role-Based Access Control

1. User roles defined in RoleUser enum
2. Protected routes check user role against allowed roles
3. Navigation elements conditionally rendered based on user role
4. API endpoints validate user permissions

### Service Card Sales Flow

1. User selects service card to sell
2. Customer information entered or selected
3. Transaction details recorded
4. Payment processed
5. Service card associated with customer
6. Transaction appears in sold cards list

### Commision Calculation

1. Services completed by technicians recorded
2. Sales completed by sales staff recorded
3. Commision rates applied based on role and performance
4. Commision reports generated for review
