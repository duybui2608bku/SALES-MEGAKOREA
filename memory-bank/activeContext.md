# Active Context

## Current Work Focus

The SALE-MANAGER-MEGAKOREA system has been set up with its primary functionality. The current focus is on understanding the existing codebase to prepare for potential enhancements or bug fixes.

## Project Status

The project appears to be in active development with a functional frontend and backend structure. Core features for user management, product management, service management, customer management, and commission tracking are in place.

## Recent Changes

- Memory bank has been initialized to document the project structure and architecture

## Active Decisions and Considerations

- The project uses a combination of React, TypeScript, and MongoDB as its primary technology stack
- Code organization follows domain-driven design principles with separation into modules based on business domains
- Authentication is handled via JWT with role-based access control
- The application uses React Context for global state management

## Important Patterns and Preferences

- Frontend components are organized by domain (User, Product, Services, etc.)
- Backend follows an MVC-like pattern with controllers, models, and routes
- API services are separated by domain and follow RESTful conventions
- Styling uses a combination of SCSS and Styled Components
- The application uses Ant Design as its primary UI component library
- The application appears to support the Vietnamese locale

## Next Steps

1. **Explore Specific Features**:

   - Understand the commission calculation logic
   - Review service card management implementation
   - Examine customer management workflow

2. **Code Quality Review**:

   - Check for code consistency
   - Identify potential performance optimizations
   - Review error handling approaches

3. **Documentation Enhancement**:
   - Develop more detailed API documentation
   - Create usage guides for key features

## Learnings and Project Insights

- The application demonstrates a well-structured approach to organizing a complex business application
- The role-based access control system provides a flexible way to manage permissions
- The combination of React Query with REST APIs provides efficient data handling
- The project uses a mix of modern React patterns including hooks, context, and functional components
