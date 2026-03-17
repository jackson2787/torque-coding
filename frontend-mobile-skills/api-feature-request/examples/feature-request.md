# API Feature Request: User Profile & Recent Orders Dashboard

## Context & Use Case
We are building the "Dashboard" view for a user upon login. The UI requires displaying the user's basic profile information alongside a brief summary of their 3 most recent orders. 

Currently, achieving this requires hitting `/api/v1/users/me` and then making a separate call to `/api/v1/orders?userId={id}&limit=3`. This N+1 problem slows down the initial dashboard load and requires the frontend to manually stitch the data states together.

We need a single endpoint optimized for this specific dashboard view to keep the client thin and performant.

## Proposed Route & Method
**GET** `/api/v1/users/me/dashboard-summary`

## Expected Request
- **Headers**: Requires standard Authentication Bearer token.
- **Query Params**: None.
- **Body**: None.

## Exact Expected JSON Response Payload
The frontend expects a `200 OK` with the exact following shape. No client-side mapping should be necessary.

```json
{
  "user": {
    "id": "usr_123xyz",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "avatarUrl": "https://cdn.example.com/avatars/usr_123xyz.jpg"
  },
  "recentOrders": [
    {
      "orderId": "ord_987abc",
      "status": "PROCESSING",
      "totalAmount": 145.50,
      "datePlaced": "2023-10-27T14:32:00Z"
    },
    {
      "orderId": "ord_654def",
      "status": "DELIVERED",
      "totalAmount": 22.00,
      "datePlaced": "2023-10-15T09:15:00Z"
    }
  ],
  "unreadNotificationCount": 4
}
```

## Error Specifications

### 401 Unauthorized
If the bearer token is missing or invalid.
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Valid authentication token is required."
  }
}
```

### 500 Internal Server Error
Standard fallback for unforeseen backend issues.
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred while generating the dashboard summary."
  }
}
```
