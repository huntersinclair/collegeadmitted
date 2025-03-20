# User Management Module - As-Built Documentation

## Overview
The User Management Module handles user authentication, registration, and profile management in the CollegeAdmitted application. This document details the actual implementation of the user management features.

## Implementation Details

### Authentication Methods
- **Local Authentication**: Email/password-based authentication
- **OAuth Providers**:
  - Google OAuth2
  - (Facebook OAuth2 planned but not yet implemented)

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false
);
```

#### Auth Methods Table
```sql
CREATE TABLE auth_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

#### Profile Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/me/verify-email` - Request email verification
- `POST /api/users/me/password` - Change password

### Security Implementation

#### Password Security
- Passwords hashed using Argon2id
- Salt automatically generated and stored with hash
- Minimum password requirements enforced:
  - 8 characters minimum
  - At least one uppercase letter
  - At least one number
  - At least one special character

#### JWT Implementation
- Access tokens valid for 15 minutes
- Refresh tokens valid for 7 days
- Tokens stored in HTTP-only cookies
- CSRF protection implemented

#### Rate Limiting
- Login attempts limited to 5 per minute
- Password reset requests limited to 3 per hour
- Email verification requests limited to 3 per hour

### Frontend Components

#### Authentication Pages
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset page
- `/auth/verify-email` - Email verification page

#### Profile Management
- `/profile` - User profile page
- `/profile/security` - Security settings
- `/profile/notifications` - Notification preferences

### Error Handling

#### Authentication Errors
- Invalid credentials
- Account locked
- Email not verified
- Rate limit exceeded
- Invalid token

#### Profile Update Errors
- Email already exists
- Invalid password format
- Invalid email format
- File upload errors

### Email Notifications
- Welcome email on registration
- Email verification
- Password reset requests
- Security alerts

### Testing Coverage

#### Unit Tests
- Password hashing
- Token generation/validation
- Input validation
- Rate limiting

#### Integration Tests
- Authentication flows
- Profile updates
- Email verification
- Password reset flow

#### E2E Tests
- Registration process
- Login process
- Profile management
- Password changes

### Monitoring and Logging

#### Authentication Events
- Login attempts (successful/failed)
- Registration events
- Password resets
- Token refreshes

#### Security Events
- Rate limit triggers
- Invalid token attempts
- Suspicious activity detection

### Performance Considerations
- Database indexing on email and provider_user_id
- Caching of user profiles
- Asynchronous email sending
- Connection pooling for database

### Future Enhancements
1. Implement Facebook OAuth
2. Add two-factor authentication
3. Implement session management
4. Add account deletion functionality
5. Enhance security logging
6. Add IP-based security checks

## Integration Points

### Frontend Integration
- React Context for auth state management
- Protected route components
- Form validation using Formik
- Toast notifications for auth events

### Backend Integration
- FastAPI security dependencies
- Supabase client integration
- Email service integration
- Rate limiting middleware

### External Services
- Google OAuth API
- Email service provider
- Supabase Auth API

## Deployment Considerations

### Environment Variables
```
AUTH_SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_SERVICE_API_KEY=
FRONTEND_URL=
BACKEND_URL=
```

### Security Headers
- CORS configuration
- CSP headers
- HSTS enabled
- X-Frame-Options set

### Backup and Recovery
- User data backup strategy
- Token blacklist backup
- Account recovery procedures 