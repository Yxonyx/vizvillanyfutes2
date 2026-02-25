# VízVillanyFűtés Backend - Supabase Setup Guide

## Overview

This backend uses Supabase for authentication, database, and row-level security. It supports:

- **Contractor registration and management**
- **Job creation from website forms**
- **Job assignment to contractors**
- **Contractor job acceptance/decline**
- **Job status updates**

## Quick Setup

### 1. Supabase Project Configuration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one)

### 2. Enable Email/Password Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - Enable "Confirm email" (recommended for production)
   - Set redirect URLs

### 3. Run Database Migrations

Run the SQL files in order in the **SQL Editor**:

```
1. migrations/001_create_tables.sql    - Creates all tables
2. migrations/002_rls_policies.sql     - Enables RLS and creates policies
3. migrations/003_functions.sql        - Creates database functions
4. migrations/004_seed_data.sql        - (Optional) Adds test data
```

### 4. Create Test Users

Create users in **Authentication** → **Users** → **Add User**:

| Email | Password | Role |
|-------|----------|------|
| admin@yourdomain.hu | (use a strong password) | admin |
| dispatcher@yourdomain.hu | (use a strong password) | dispatcher |
| contractor@yourdomain.hu | (use a strong password) | contractor |

⚠️ **SECURITY NOTE**: Never commit real passwords to version control. Use strong, unique passwords for all accounts.

After creating users, run this SQL to set up their roles (replace UUIDs with actual user IDs):

```sql
-- Get user IDs from auth.users
SELECT id, email FROM auth.users;

-- For Admin user
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('ADMIN_UUID_HERE', 'admin', 'active');

-- For Dispatcher user  
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('DISPATCHER_UUID_HERE', 'dispatcher', 'active');

-- For Contractor user
INSERT INTO public.user_meta (user_id, role, status)
VALUES ('CONTRACTOR_UUID_HERE', 'contractor', 'active');

INSERT INTO public.contractor_profiles (
    user_id, display_name, phone, type, trades, service_areas, years_experience, status
)
VALUES (
    'CONTRACTOR_UUID_HERE',
    'Teszt Vízszerelő',
    '+36 30 000 0000',
    'individual',
    ARRAY['viz'],
    ARRAY['XI', 'XII'],
    5,
    'approved'
);
```

### 5. Environment Variables

Add these to your `.env.local` file (REQUIRED - app will not start without these):

```env
# Supabase (get these from Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email notifications (Resend)
RESEND_API_KEY=your-resend-api-key-here

# Email recipients
DISPATCHER_EMAIL=dispatcher@yourdomain.hu
ADMIN_EMAIL=admin@yourdomain.hu
EMAIL_TO=info@yourdomain.hu

# Base URL for email links
NEXT_PUBLIC_BASE_URL=https://yourdomain.hu
```

⚠️ **SECURITY**: 
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has full database access - keep it secret!
- Add `.env.local` to `.gitignore` (should already be there)

## API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/create` | Create job from website form |
| POST | `/api/contractors/register` | Register new contractor |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout current session |
| GET | `/api/auth/session` | Get current session info |

### Admin/Dispatcher Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/jobs` | List all jobs |
| GET | `/api/admin/jobs/[id]` | Get job details |
| PUT | `/api/admin/jobs` | Update job |
| DELETE | `/api/admin/jobs/[id]` | Cancel job |
| POST | `/api/admin/jobs/assign` | Assign job to contractor |
| GET | `/api/admin/contractors` | List contractors |
| GET | `/api/admin/contractors/[id]` | Get contractor details |
| PUT | `/api/admin/contractors/[id]` | Update contractor |
| POST | `/api/admin/contractors/[id]/approve` | Approve contractor |
| POST | `/api/admin/contractors/[id]/reject` | Reject contractor |
| GET | `/api/admin/customers` | List customers |
| POST | `/api/admin/customers` | Create customer |

### Contractor Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contractor/profile` | Get own profile |
| PUT | `/api/contractor/profile` | Update own profile |
| GET | `/api/contractor/jobs` | Get assigned jobs |
| GET | `/api/contractor/jobs/[id]` | Get job details |
| PUT | `/api/contractor/jobs/[id]` | Update job status |
| GET | `/api/contractor/assignments` | Get all assignments |
| POST | `/api/contractor/assignments/[id]/respond` | Accept/decline assignment |

## Usage Examples

### Create Job from Website Form

```javascript
const response = await fetch('/api/jobs/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: {
      full_name: 'Kiss János',
      phone: '+36 30 123 4567',
      email: 'kiss.janos@example.com'
    },
    address: {
      city: 'Budapest',
      district: 'XI',
      street: 'Bartók Béla út',
      house_number: '10'
    },
    job: {
      trade: 'viz',
      category: 'standard',
      title: 'Csaptelep csere',
      description: 'Konyhai csaptelep cseréje szükséges'
    }
  })
});
```

### Login

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@yourdomain.hu',
    password: 'your-password'
  })
});

const { data } = await response.json();
// Store data.session.access_token for authenticated requests
```

### Authenticated Request

```javascript
const response = await fetch('/api/admin/jobs', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Contractor Accept Job

```javascript
const response = await fetch(`/api/contractor/assignments/${assignmentId}/respond`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    action: 'accept',
    confirmed_start_time: '2024-01-15T09:00:00Z'
  })
});
```

## Database Schema

### Tables

- `user_meta` - User roles and status
- `contractor_profiles` - Contractor details
- `customers` - Customer records
- `addresses` - Customer addresses
- `jobs` - Job/work orders
- `job_assignments` - Job-contractor assignments

### Key Relationships

```
auth.users
    ↓
user_meta (role, status)
    ↓
contractor_profiles (for contractors)

customers → addresses → jobs → job_assignments → contractor_profiles
```

## Row Level Security (RLS)

- **Admins/Dispatchers**: Full access to all data
- **Contractors**: Can only see/update their own profile and assigned jobs
- **Anonymous**: Can create jobs and register as contractors

## Email Notifications

The system sends automatic emails for:

- New job → Dispatcher
- New contractor registration → Admin
- Contractor approved → Contractor
- Job assigned → Contractor

Configure email recipients in environment variables.

## Troubleshooting

### "Unauthorized" errors
- Check that the user has correct role in `user_meta`
- Verify the access token is valid and not expired

### RLS policy errors
- Make sure all migrations ran successfully
- Check that functions are created and have proper permissions

### Email not sending
- Verify `RESEND_API_KEY` is set
- Check email type is valid in switch statement
