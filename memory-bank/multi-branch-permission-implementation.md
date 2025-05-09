# Multi-Branch Permission System Implementation

## Overview

This document outlines the implementation of a branch-based permission system across the application. The system ensures that:

1. Admin users can access data from multiple branches by selecting branch(es) in the UI
2. Regular users are restricted to only their assigned branch data

## Key Components

### 1. Frontend Branch Selection

- `OptionsBranch.tsx` component already handles branch selection
- Admin users: Can select multiple branches
- Regular users: Restricted to their assigned branch (using profile.branch.\_id)

### 2. Backend Permission Enforcement

We've implemented the following:

#### A. Branch Access Middleware

File: `SERVER/src/middlewares/utils.middlewares.ts`

This middleware:

- Automatically injects branch_id for regular users based on their profile
- Preserves admin ability to select branch(es)
- Works with both query params (GET) and body data (POST/PUT/PATCH/DELETE)

```typescript
export const branchAccessMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { decode_authorization } = req;
  if (!decode_authorization) {
    return next();
  }

  const { role, user_id } = decode_authorization as TokenPayload;

  // Admin can access multiple branches (use the one provided in request)
  if (role === UserRole.ADMIN) {
    return next();
  }

  // For non-admin users, get user's branch from profile
  // and ensure they can only access their assigned branch
  if (req.user?.branch) {
    const userBranchId = req.user.branch.toString();

    // Handle different request methods
    if (req.method === "GET") {
      // For GET requests, branch is often in query params
      if (req.query.branch) {
        req.query.branch = userBranchId;
      } else if (req.query.branch_id) {
        req.query.branch_id = userBranchId;
      }
    } else {
      // For POST, PUT, PATCH, DELETE - branch is in body
      if (req.body.branch) {
        req.body.branch = [userBranchId];
      } else if (req.body.branch_id) {
        req.body.branch_id = userBranchId;
      }
    }
  }

  next();
};
```

#### B. Branch Validation Middleware

File: `SERVER/src/middlewares/branch.middlewares.ts`

Two validation middlewares:

- `requireBranchIdValidator`: Enforces branch_id presence in single branch operations
- `requireBranchArrayValidator`: Validates arrays of branch IDs for bulk operations

#### C. Enhanced User Authentication

File: `SERVER/src/middlewares/users.middlewares.ts`

The `accessTokenValidator` middleware now loads the complete user object with branch information.

```typescript
// Load complete user object including branch information for branch-based permission
const { user_id } = decode_authorization;
const user = await databaseServiceSale.users.findOne({
  _id: new ObjectId(user_id),
});

if (user) {
  req.user = user;
}
```

## Integration with Routes

We've updated example routes in `product.routes.ts` to demonstrate how to integrate the branch permission system:

1. Added `branchAccessMiddleware` to enforce branch access rules
2. Added `requireBranchArrayValidator` to ensure branch data is present in requests
3. Maintained existing validators and controllers

## Implementation Requirements for Other Routes

All API routes that deal with branch-specific data should be updated to include:

1. `accessTokenValidator` - Loads user with branch data
2. `branchAccessMiddleware` - Enforces branch restrictions based on user role
3. One of the branch validators - Ensures branch data is present in the request

## Database Queries

All service functions and repository methods should be updated to include branch filtering in database queries, for example:

```typescript
// Before
const items = await collection.find({ status: "active" }).toArray();

// After
const items = await collection
  .find({
    status: "active",
    branch: { $in: branches }, // Where branches is from request
  })
  .toArray();
```

## Testing Requirements

When testing the APIs:

- Admin users should be able to access data from any branch they select
- Regular users should only be able to access data from their assigned branch
- Attempts to access other branch data should be blocked
