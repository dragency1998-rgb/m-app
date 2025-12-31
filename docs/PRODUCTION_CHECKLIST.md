# Production Checklist

Use this checklist before deploying your app to production.

## Code Quality ✓

- [ ] Run `npm run lint` - No errors or warnings
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm run build` - Build completes successfully
- [ ] Code reviewed for best practices
- [ ] No console.log() statements in production code
- [ ] Error boundaries implemented
- [ ] Error handling on all async operations
- [ ] Loading states on all data fetches
- [ ] No sensitive data in client-side code

## Security ✓

- [ ] `.env.local` in `.gitignore` (never commit)
- [ ] Firebase security rules configured
  - [ ] Firestore rules set (not in test mode)
  - [ ] Authentication rules configured
  - [ ] Storage rules configured
- [ ] CORS headers configured appropriately
- [ ] HTTPS enforced in production
- [ ] API rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (if using database)
- [ ] XSS protection verified
- [ ] CSRF tokens (if applicable)

## Performance ✓

- [ ] Images optimized with Next.js Image component
- [ ] Code splitting verified
- [ ] Bundle size acceptable
- [ ] Lazy loading implemented for heavy components
- [ ] Database queries optimized
- [ ] Indexes created in Firestore
- [ ] Caching strategy implemented
- [ ] API responses are minimal
- [ ] No memory leaks in components
- [ ] Service Worker caching configured

## Testing ✓

- [ ] Manual testing of all pages
- [ ] Authentication flow tested
- [ ] Database operations tested
- [ ] API endpoints tested
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Browser compatibility checked
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile app testing (PWA)
- [ ] Offline functionality tested
- [ ] Form validation tested

## PWA & Installation ✓

- [ ] PWA manifest configured
- [ ] App icons created (192x192, 512x512)
- [ ] Service Worker tested
- [ ] Installable on mobile/desktop
- [ ] Offline mode functional
- [ ] App name and description set
- [ ] Theme colors configured
- [ ] Splash screens (optional)

## Firebase Configuration ✓

- [ ] Firebase project created
- [ ] Authentication methods enabled
  - [ ] Email/Password
  - [ ] (Optional) Google Sign-In
  - [ ] (Optional) Other providers
- [ ] Firestore database created
- [ ] Storage bucket created (if needed)
- [ ] Backup enabled
- [ ] Monitoring enabled
- [ ] API keys restricted in Google Cloud Console

## Environment Variables ✓

- [ ] Production Firebase credentials in `.env.local`
- [ ] API URLs configured for production
- [ ] Environment set to 'production'
- [ ] All required variables present
- [ ] No test/development values in production

## Monitoring & Analytics ✓

- [ ] Google Analytics configured (optional)
- [ ] Firebase Analytics enabled (optional)
- [ ] Sentry or error tracking service set up
- [ ] Performance monitoring enabled
- [ ] Logging configured
- [ ] Alerts configured for errors

## Database ✓

- [ ] Firestore auto-scaling enabled
- [ ] Database indexes created as needed
- [ ] Backup and restore tested
- [ ] Data retention policy set
- [ ] Sensitive data encrypted
- [ ] Regular backups scheduled

## Deployment ✓

- [ ] Deployment platform chosen
  - [ ] Vercel
  - [ ] Firebase Hosting
  - [ ] Docker/Cloud Run
  - [ ] Self-hosted
  - [ ] Other: ___________
- [ ] Domain name configured
- [ ] SSL/HTTPS certificate installed
- [ ] DNS records updated
- [ ] CDN configured (if applicable)
- [ ] Environment variables set in production
- [ ] First deployment tested
- [ ] Rollback procedure documented

## Documentation ✓

- [ ] README.md updated
- [ ] API documentation created (if applicable)
- [ ] Deployment instructions documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] Known issues documented
- [ ] Troubleshooting guide created
- [ ] Team onboarding guide created

## Compliance & Privacy ✓

- [ ] Terms of Service created/reviewed
- [ ] Privacy Policy created/reviewed
- [ ] GDPR compliance (if EU users)
- [ ] Cookie consent (if tracking)
- [ ] CCPA compliance (if California users)
- [ ] Data processing agreement with Firebase
- [ ] User data handling documented
- [ ] Data deletion process implemented

## SEO & Metadata ✓

- [ ] Meta tags configured
- [ ] Open Graph tags set
- [ ] Favicon configured
- [ ] Sitemap created (if applicable)
- [ ] robots.txt configured
- [ ] Page titles descriptive
- [ ] Meta descriptions added
- [ ] Heading hierarchy correct (H1, H2, etc)
- [ ] Alt text on images
- [ ] Structured data (schema.org) implemented

## Accessibility ✓

- [ ] Color contrast WCAG AA compliant
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Form labels associated with inputs
- [ ] ARIA labels where needed
- [ ] Focus states visible
- [ ] Mobile accessibility tested
- [ ] Images have alt text

## Mobile & Desktop ✓

- [ ] Mobile viewport configured
- [ ] Responsive design tested
- [ ] Touch-friendly buttons (48px minimum)
- [ ] Mobile menu working
- [ ] Fast on 3G connection
- [ ] Desktop version optimized
- [ ] Tablet view tested
- [ ] Orientation changes handled

## Browser Support ✓

- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Mobile browsers tested
- [ ] Graceful degradation for older browsers

## Final Checks ✓

- [ ] No debug mode enabled
- [ ] No development-only features exposed
- [ ] Staging environment tested
- [ ] Production backup created
- [ ] Emergency contact information updated
- [ ] Incident response plan created
- [ ] On-call rotation established
- [ ] Team notified of deployment
- [ ] Deployment announcement prepared

## Post-Deployment ✓

- [ ] Monitor error logs
- [ ] Check analytics/metrics
- [ ] Test user flows
- [ ] Verify payment processing (if applicable)
- [ ] Monitor server performance
- [ ] Check database usage
- [ ] Gather user feedback
- [ ] Document any issues
- [ ] Plan follow-up improvements

## Ongoing Maintenance ✓

- [ ] Security updates scheduled
- [ ] Dependency updates planned
- [ ] Performance monitoring active
- [ ] Backup verification schedule
- [ ] Team training scheduled
- [ ] Documentation update schedule
- [ ] User support process established
- [ ] Incident management process

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Deployment Environment:** _______________

**Notes:**
