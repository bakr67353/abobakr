# TODO: Fix User Creation and Script Syncing Issues

## User Creation Persistence
- [x] Update POST /api/users to persist to mock-users.json when Supabase fails
- [x] Ensure GET /api/users includes newly created users from file
- [ ] Test user creation with Supabase down

## Script Management Syncing
- [x] Replace lib/email-scripts.ts localStorage with API calls
- [x] Update components/script-management.tsx to use API and pass user_id
- [x] Update components/user-dashboard.tsx to fetch scripts from API
- [x] Ensure scripts are associated with user_id for ownership
- [ ] Test script creation, editing, deletion across users

## Build and Deployment
- [x] Fix Next.js build issues with standalone output on Windows
- [x] Remove problematic standalone configuration
- [x] Verify all 18 routes build successfully
- [x] Prepare for Vercel deployment

## Testing
- [ ] Test user creation without Supabase
- [ ] Test script management with multiple users
- [ ] Verify data persistence and syncing
- [ ] Test Vercel deployment with environment variables
