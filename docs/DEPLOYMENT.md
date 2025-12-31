# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Firebase security rules configured
- [ ] PWA icons created (192x192, 512x512)
- [ ] Build tested locally: `npm run build`
- [ ] Tests passing: `npm run lint`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] README updated
- [ ] Error handling implemented
- [ ] Analytics configured
- [ ] Monitoring set up

## Deployment Options

### 1. Vercel (Recommended for Next.js)

**Easiest option with best integration**

#### Setup

```bash
npm install -g vercel
vercel login
vercel
```

#### Configure Environment

1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add all NEXT_PUBLIC_* variables
4. Redeploy

#### Auto-Deploy

Connect your Git repo for automatic deployments on push.

### 2. Firebase Hosting

**Good if using Firebase extensively**

#### Setup

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

#### Deploy

```bash
npm run build
firebase deploy --only hosting
```

#### Configure firebase.json

```json
{
  "hosting": {
    "public": ".next/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 3. Docker + Cloud Run (GCP)

**Scalable containerized deployment**

#### Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["yarn", "start"]
```

#### Build and Push

```bash
docker build -t nextjs-app .
docker tag nextjs-app gcr.io/PROJECT_ID/nextjs-app
docker push gcr.io/PROJECT_ID/nextjs-app
```

#### Deploy to Cloud Run

```bash
gcloud run deploy nextjs-app \
  --image gcr.io/PROJECT_ID/nextjs-app \
  --platform managed \
  --region us-central1
```

### 4. AWS (EC2/App Runner)

#### Option A: EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd your-repo
npm install
npm run build
```

#### Option B: AWS App Runner

```bash
aws apprunner create-service \
  --service-name nextjs-app \
  --source-configuration \
    ImageRepository={ImageIdentifier=your-image,ImageRepositoryType=ECR}
```

### 5. Azure

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service
az appservice plan create \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku B1 --is-linux

# Deploy
az webapp create \
  --name myNextJsApp \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --runtime "NODE|18-lts"
```

### 6. Self-Hosted (VPS)

#### Using PM2

```bash
# SSH into your server
ssh user@your-vps-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Deploy
git clone your-repo
cd your-repo
npm install
npm run build

# Start with PM2
pm2 start "npm start" --name "nextjs-app"
pm2 save
```

#### With Nginx (Reverse Proxy)

```nginx
upstream nextjs_app {
  server localhost:3000;
}

server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://nextjs_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### Enable HTTPS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Post-Deployment

### 1. Monitoring

**Sentry (Error Tracking)**

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
})
```

**Google Analytics**

Add to `src/app/layout.tsx`:

```typescript
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    `,
  }}
/>
```

### 2. Performance Monitoring

- Use Lighthouse CI for automated testing
- Monitor Core Web Vitals
- Set up alerts for error rates

### 3. Security

- Enable HTTPS
- Set security headers
- Configure CORS properly
- Implement rate limiting

## Scaling Considerations

### Database

- Enable auto-scaling in Firestore
- Optimize indexes
- Monitor query performance

### Static Assets

- Use CDN (Cloudflare, CloudFront)
- Enable caching headers
- Optimize images

### Server

- Use serverless for stateless operations
- Load balance if needed
- Auto-scale based on traffic

## Environment Setup

### Production (.env.production)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=prod_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prod_id
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_ENV=production
SENTRY_AUTH_TOKEN=your_token
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Rollback Procedure

### Vercel
- Go to Deployments → Select previous version → Promote

### Firebase Hosting
```bash
firebase hosting:channel:deploy [channel-id]
firebase hosting:clone [source-site] [target-site]
```

### Self-Hosted
```bash
pm2 restart nextjs-app
# Or revert git: git revert HEAD && npm run build
```

## Support

For deployment issues:
- Check logs: `npm run build 2>&1`
- Verify environment variables
- Check Firebase console for errors
- Review deployment provider logs

---

Choose the deployment option that best fits your needs!
