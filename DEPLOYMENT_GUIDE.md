# Deployment Guide for AppGrosir

## Problem Fixed

This guide addresses the issue: **"Unexpected token 'T', 'The page c'... is not valid JSON"** error that occurred during login when deployed on Vercel.

### Root Cause

The error occurred because:
1. The frontend `apiCall` function tried to parse all responses as JSON without checking the content-type header
2. When API routes didn't exist or errors occurred, the server returned HTML instead of JSON
3. Missing Vercel configuration meant routes weren't properly handled

### Solution Summary

We implemented the following fixes:

1. **Enhanced Frontend Error Handling** (`public/js/app.js`)
   - Check content-type header before parsing JSON
   - Gracefully handle HTML error pages
   - Provide informative error messages

2. **Improved Backend API Responses** (`server.js`)
   - All API endpoints now return JSON (even 404s)
   - Global error handler for consistent JSON responses
   - Production-safe error messages (no sensitive info leakage)

3. **Security Improvements** (`server/routes/auth.js`, `server.js`)
   - JWT_SECRET is now required at startup (fail-fast)
   - Explicit content-type headers on all responses
   - Error message sanitization in production

4. **Vercel Configuration** (`vercel.json`)
   - Proper routing for API and static files
   - Environment configuration

## Deploying to Vercel

### Step 1: Prepare Your Repository

Ensure all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Fix JSON parsing for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect it as a Node.js project

### Step 3: Configure Environment Variables

**CRITICAL:** You must set the `JWT_SECRET` environment variable in Vercel:

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variable:

   - **Name:** `JWT_SECRET`
   - **Value:** Generate a secure random string (see below)
   - **Environments:** Select Production, Preview, and Development

#### Generating a Secure JWT_SECRET

Run this command to generate a secure random string:

```bash
openssl rand -base64 32
```

Or use this Node.js command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example output:** `kX9mP2nR5sT8vW1yZ4bC6dF0gH3jK7lN9oQ1rS4tU6vX8yA0`

Use this generated string as your JWT_SECRET.

### Step 4: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete
3. Your app will be available at `your-project.vercel.app`

### Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try to login with default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Verify that login works without the JSON parsing error

## Important Notes

### Database Considerations

The app currently uses SQLite, which works for development but has limitations on Vercel:

- **Serverless Functions:** Each function invocation may have a fresh filesystem
- **No Persistence:** Data may be lost between deployments
- **No Shared State:** Multiple function instances can't share the same database file

**Recommendations for Production:**
- Migrate to a hosted database (PostgreSQL, MySQL, MongoDB)
- Use services like:
  - [Supabase](https://supabase.com) (PostgreSQL)
  - [PlanetScale](https://planetscale.com) (MySQL)
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (MongoDB)

### Environment Variables

Required:
- `JWT_SECRET` - Your secure JWT signing key

Optional:
- `PORT` - Set automatically by Vercel
- `NODE_ENV` - Set to `production` automatically by Vercel

## Files Modified/Created

This fix involved changes to:

1. **Created:**
   - `vercel.json` - Vercel deployment configuration
   - `.env.example` - Environment variables template
   - `DEPLOYMENT_GUIDE.md` - This guide

2. **Modified:**
   - `public/js/app.js` - Enhanced error handling in apiCall function
   - `server.js` - Added API error handlers and startup validation
   - `server/routes/auth.js` - Explicit JSON content-type headers
   - `README.md` - Added Vercel deployment section

## Troubleshooting

### "Server configuration error" on login

**Cause:** JWT_SECRET is not set in Vercel environment variables

**Solution:** Follow Step 3 above to set the JWT_SECRET

### Still getting JSON parsing errors

**Causes:**
1. Environment variables not saved properly in Vercel
2. Old deployment cached

**Solutions:**
1. Verify JWT_SECRET is set: Settings → Environment Variables
2. Trigger a new deployment: Deployments → ... → Redeploy

### Login works but data is lost after some time

**Cause:** SQLite database is not persistent on Vercel serverless

**Solution:** Migrate to a hosted database (see Database Considerations above)

## Security Checklist

Before going to production:

- [ ] Set a strong, unique JWT_SECRET (minimum 32 characters)
- [ ] Keep JWT_SECRET secret (never commit to Git)
- [ ] Consider migrating from SQLite to a hosted database
- [ ] Change the default admin password
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set up proper backup procedures
- [ ] Review and update user roles/permissions

## Support

If you encounter issues:

1. Check Vercel deployment logs: Deployments → Click on deployment → Logs
2. Check browser console for client-side errors
3. Verify environment variables are set correctly
4. Ensure the latest code is deployed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
