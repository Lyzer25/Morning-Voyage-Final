# Morning Voyage Setup Guide

This guide will help you set up the Morning Voyage e-commerce platform for development and production deployment.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm
- Google Sheets account (for product management)
- Shopify store (for e-commerce backend)
- Roastify account (for fulfillment)

### Development Setup

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd Morning-Voyage-Final
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables (see [Environment Variables](#environment-variables) section below).

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🔧 Environment Variables

### Required Variables

These variables are **required** for the application to function:

#### Google Sheets Integration

```bash
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
```

**Setup Instructions:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Copy your spreadsheet ID from the URL

#### Shopify Integration

```bash
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store-name
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token_here
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Setup Instructions:**

1. Go to your Shopify Admin → Apps → App and sales channel settings
2. Develop apps → Create an app
3. Configure API access scopes
4. Generate Storefront API and Admin API tokens

#### Security

```bash
WEBHOOK_SECRET=generate_a_strong_random_string
JWT_SECRET=generate_a_strong_random_string
```

**Generate secure secrets:**

```bash
# Generate webhook secret
openssl rand -hex 32

# Generate JWT secret
openssl rand -hex 64
```

### Optional Variables

#### Roastify Integration

```bash
ROASTIFY_API_KEY=your_roastify_api_key
ROASTIFY_API_URL=https://api.roastify.com/v1
```

#### Caching (Recommended for Production)

```bash
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
```

#### Monitoring

```bash
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📋 Product Data Setup

### Google Sheets Structure

Your Google Sheets should have the following columns:

| Column          | Description          | Required | Example                         |
| --------------- | -------------------- | -------- | ------------------------------- |
| sku             | Product SKU          | ✅       | COFFEE-MORNING-12OZ             |
| productName     | Product Name         | ✅       | Morning Blend                   |
| category        | Product Category     | ✅       | coffee                          |
| subcategory     | Product Subcategory  | ✅       | signature-blend                 |
| status          | Product Status       | ✅       | active                          |
| format          | Product Format       | ⭐       | whole-bean                      |
| weight          | Product Weight       | ⭐       | 12 oz                           |
| price           | Product Price        | ✅       | 16.99                           |
| originalPrice   | Original Price       | ❌       | 19.99                           |
| description     | Short Description    | ✅       | Our signature morning blend     |
| longDescription | Detailed Description | ❌       | Detailed product description... |
| roastLevel      | Roast Level          | ❌       | medium                          |
| origin          | Coffee Origin        | ❌       | Colombia & Brazil               |
| tastingNotes    | Tasting Notes        | ❌       | Chocolate, Caramel, Nuts        |
| featured        | Featured Product     | ❌       | true                            |
| badge           | Product Badge        | ❌       | Bestseller                      |

**Legend:** ✅ Required | ⭐ Recommended | ❌ Optional

### Sample Data

```csv
sku,productName,category,subcategory,status,format,weight,price,originalPrice,description,roastLevel,origin,tastingNotes,featured,badge
COFFEE-MORNING-12OZ,Morning Blend,coffee,signature-blend,active,whole-bean,12 oz,16.99,19.99,Our signature morning blend,medium,Colombia & Brazil,"Chocolate, Caramel, Nuts",true,Bestseller
```

## 🏠 Home Hosting Setup

### Starlink Optimization

The application is optimized for home hosting with Starlink internet:

1. **Aggressive Caching**

   ```bash
   ENABLE_AGGRESSIVE_CACHING=true
   CACHE_TTL=600  # 10 minutes for home hosting
   ```

2. **Image Optimization**
   - All images automatically optimized using Next.js Image component
   - WebP format conversion for bandwidth efficiency
   - Proper sizing and lazy loading

3. **Network Resilience**
   - Automatic retry logic for API calls
   - Exponential backoff for failed requests
   - Graceful degradation when services are unavailable

### Production Deployment

1. **Build the Application**

   ```bash
   npm run build
   ```

2. **Start Production Server**

   ```bash
   npm run start
   ```

3. **Process Management (Recommended)**

   ```bash
   # Install PM2
   npm install -g pm2

   # Start application
   pm2 start npm --name "morning-voyage" -- start

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration** (Optional but recommended)
   ```nginx
   server {
       listen 80;
       server_name morningvoyage.co www.morningvoyage.co;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## 🔍 Testing & Monitoring

### API Endpoints

- **Products:** `GET /api/products`
- **Product Sync:** `GET /api/products/sync`
- **Admin Sync:** `GET /api/admin/sync`
- **Webhook:** `POST /api/webhook/sheets`
- **Health Check:** `GET /api/webhook/sheets`

### Health Checks

Monitor these endpoints for application health:

1. **Application Health**

   ```bash
   curl http://localhost:3000/api/webhook/sheets
   ```

2. **Product Data Sync**
   ```bash
   curl http://localhost:3000/api/products/sync
   ```

### Logs

Application logs include structured information:

- **Success Operations:** ✅ prefix with operation details
- **Warnings:** ⚠️ prefix for non-critical issues
- **Errors:** 🚨 prefix for critical problems
- **Debug Info:** 📋 prefix for detailed debugging

## 🛠 Troubleshooting

### Common Issues

1. **TypeScript Errors on Fresh Install**

   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install

   # Restart development server
   npm run dev
   ```

2. **Google Sheets API Not Working**
   - Verify API key is correct
   - Check spreadsheet is publicly accessible
   - Ensure Google Sheets API is enabled in Cloud Console

3. **Products Not Showing**
   - Check Google Sheets data format
   - Verify cache is working: `/api/products/sync`
   - Check browser network tab for API errors

4. **Webhook Failures**
   - Verify `WEBHOOK_SECRET` is configured
   - Check webhook URL is accessible
   - Review webhook logs in console

### Performance Issues

1. **Slow Loading on Starlink**

   ```bash
   # Enable aggressive caching
   ENABLE_AGGRESSIVE_CACHING=true
   CACHE_TTL=900  # 15 minutes

   # Use CDN for static assets
   NEXT_PUBLIC_CDN_URL=your_cdn_url
   ```

2. **High Memory Usage**

   ```bash
   # Reduce cache TTL
   CACHE_TTL=300  # 5 minutes

   # Monitor with PM2
   pm2 monit
   ```

## 📞 Support

For issues specific to:

- **Shopify Integration:** [Shopify Developer Docs](https://shopify.dev/)
- **Roastify Integration:** Contact Roastify support
- **Google Sheets API:** [Google Sheets API Docs](https://developers.google.com/sheets/api)
- **Next.js Issues:** [Next.js Documentation](https://nextjs.org/docs)

## 🔐 Security Checklist

- [ ] All environment variables are configured
- [ ] Webhook secrets are strong and unique
- [ ] Google Sheets API key is restricted appropriately
- [ ] Shopify tokens have minimal required permissions
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive information
