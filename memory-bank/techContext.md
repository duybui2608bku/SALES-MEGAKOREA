# Technical Context

## Technology Stack

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **API Requests**: TanStack Query (React Query)
- **UI Library**: Ant Design
- **Styling**: SCSS and Styled Components
- **Routing**: React Router DOM
- **Icons**: React Icons
- **HTTP Client**: Axios
- **Date Handling**: DayJS
- **File Handling**: File-Saver, XLSX, PapaParse

### Backend

- **Framework**: Express with TypeScript
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Handling**: Formidable, Sharp
- **Validation**: Express Validator
- **Config Management**: Dotenv
- **CORS Handling**: CORS package
- **Utility Library**: Lodash

## Development Setup

### Client

- **Package Manager**: NPM
- **Development Server**: Vite dev server
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier
- **Tests**: (Not specified in package.json)

### Server

- **Package Manager**: NPM
- **Development Server**: Nodemon with ts-node
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Build Tools**: TypeScript, tsc-alias, rimraf

## Technical Constraints

### Deployment

- The application appears to be designed to run as a separate frontend and backend system
- The frontend is built as a single-page application
- The backend provides RESTful API services

### Performance

- React Query is configured with custom default options:
  - Window focus refetching disabled
  - Retry attempts set to 0

### Authentication

- JWT-based authentication
- Role-based access control
- Local storage used for session management

### File Operations

- Image uploads supported
- File exports (CSV, Excel) supported

### Browser Compatibility

- Modern web browser support
- Vietnamese locale support (Ant Design vi_VN)

### Data Management

- Server organized around domain-specific routes and controllers
- Client organized into domain-specific folders (Pages, Components, Services)

## Technical Dependencies

### External Services

- No external service dependencies explicitly mentioned in the codebase
- Self-contained application with its own database

### Development Dependencies

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Nodemon for development server
- Various build tools

## Deployment Architecture

- Frontend: Static site that can be deployed on any web server
- Backend: Express server that requires Node.js runtime
- Database: MongoDB instance required
- File Storage: Local file system used for storing uploads

## Technical Debt Indicators

- Some commented code in main.tsx and other files
- Mixed styling approaches (SCSS and Styled Components)
- No explicit test configuration visible
