# Production Deployment Guide

## Overview
This document outlines the production-ready configuration for the aarok_frontend application.

## Environment Variables

### Required Variables
Set these in EasyPanel's **Environment** section:

1. **SESSION_SECRET** (REQUIRED)
   - Strong random string for JWT token signing
   - Minimum 32 characters recommended
   - Generate with: `openssl rand -base64 32`
   - **Never commit this to version control**

2. **PORT** (Optional)
   - Server port (usually set automatically by EasyPanel)
   - Defaults to 5000 if not specified

3. **NODE_ENV** (Optional)
   - Automatically set to "production" in package.json start script
   - Can be explicitly set if needed

### Optional Variables

4. **DATABASE_URL** (If using PostgreSQL)
   - PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`

5. **LOG_LEVEL** (Optional)
   - Logging verbosity: `debug`, `info`, `warn`, `error`
   - Default: `info`

6. **TRUST_PROXY** (Optional)
   - Set to `"true"` if behind a reverse proxy (EasyPanel, Cloudflare, etc.)
   - Enables proper IP address detection

## Health Checks

The application provides two monitoring endpoints:

- **`/health`** - Health check endpoint
  - Returns server status, uptime, and environment
  - Use for basic health monitoring

- **`/ready`** - Readiness check endpoint
  - Returns readiness status
  - Can be extended with database connection checks

## Security Features

### Security Headers (Production Only)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy (CSP) for frontend routes

### Error Handling
- Production errors don't expose stack traces
- Detailed error logging for debugging
- Graceful error responses

## Graceful Shutdown

The application handles:
- `SIGTERM` - Standard termination signal
- `SIGINT` - Interrupt signal (Ctrl+C)
- Uncaught exceptions
- Unhandled promise rejections

Shutdown process:
1. Stops accepting new connections
2. Waits for existing requests to complete
3. Closes HTTP server gracefully
4. Force closes after 10 seconds if needed

## Build Process

1. **Setup Phase**: Installs Node.js 18 LTS and npm 9.x
2. **Install Phase**: Installs all dependencies with `npm ci`
3. **Build Phase**: 
   - Builds React frontend with Vite
   - Bundles Express server with esbuild
4. **Start Phase**: Runs production server with `npm start`

## Monitoring

### Logs
- Structured logging with timestamps
- Error logging with stack traces (development only)
- Request logging for API endpoints
- Log levels: `info`, `warn`, `error`

### Metrics to Monitor
- Server uptime
- Response times
- Error rates
- Health check status

## Troubleshooting

### Service Not Reachable
1. Check health endpoint: `https://your-domain/health`
2. Verify PORT environment variable is set correctly
3. Check EasyPanel logs for errors
4. Ensure SESSION_SECRET is set

### Build Failures
1. Check Node.js version (should be 18.x)
2. Verify all dependencies are installed
3. Check for TypeScript compilation errors
4. Review build logs in EasyPanel

### Performance Issues
1. Monitor response times via logs
2. Check resource usage in EasyPanel
3. Review database connection pool settings (if using database)
4. Enable caching where appropriate

## Best Practices

1. **Always set SESSION_SECRET** in production
2. **Use HTTPS** (handled by EasyPanel)
3. **Monitor health endpoints** regularly
4. **Set up log aggregation** for production
5. **Regular security updates** for dependencies
6. **Backup database** regularly (if using database)
7. **Use environment-specific configurations**

## Support

For issues or questions:
- Check EasyPanel documentation
- Review application logs
- Check health endpoints
- Contact your deployment team

