# Morning Voyage E-commerce Platform

A premium coffee e-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

## Project Overview

Morning Voyage is a specialty coffee brand selling premium coffee products, subscriptions, merchandise, and gift cards through a direct-to-consumer e-commerce website. The platform targets coffee enthusiasts looking for high-quality, freshly roasted coffee delivered to their doorstep.

## Technical Architecture

- **Frontend**: Next.js 14 with TypeScript, deployed on a Raspberry Pi with Nginx
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context API (CartContext, AuthContext)
- **Data Storage**: CSV-based product data with custom parsers
- **Authentication**: Custom JWT-based auth system
- **Deployment**: Self-hosted on Raspberry Pi with Nginx as reverse proxy

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Raspberry Pi (for production deployment)

### Development Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/your-username/morning-voyage.git
   cd morning-voyage
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install

   # or

   yarn install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev

   # or

   yarn dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

1. Build the application:
   \`\`\`bash
   npm run build

   # or

   yarn build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm run start
   # or
   yarn start
   \`\`\`

## Deployment on Raspberry Pi

### Prerequisites

- Raspberry Pi 4 (recommended) with Raspberry Pi OS
- Node.js 18.x or higher installed
- Nginx installed
- Domain name pointing to your Raspberry Pi's IP address

### Setup Steps

1. Clone the repository on your Raspberry Pi:
   \`\`\`bash
   git clone https://github.com/your-username/morning-voyage.git
   cd morning-voyage
   \`\`\`

2. Install dependencies and build the application:
   \`\`\`bash
   npm install
   npm run build
   \`\`\`

3. Set up PM2 for process management:
   \`\`\`bash
   npm install -g pm2
   pm2 start npm --name "morning-voyage" -- start
   pm2 save
   pm2 startup
   \`\`\`

4. Configure Nginx:
   - Copy the provided `nginx.conf` file to `/etc/nginx/nginx.conf`
   - Create the necessary directories:
     \`\`\`bash
     sudo mkdir -p /var/www/morningvoyage/public
     \`\`\`
   - Copy static assets:
     \`\`\`bash
     cp -r public/\* /var/www/morningvoyage/public/
     \`\`\`

5. Set up SSL with Let's Encrypt:
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d morningvoyage.co -d www.morningvoyage.co
   \`\`\`

6. Restart Nginx:
   \`\`\`bash
   sudo systemctl restart nginx
   \`\`\`

## Project Structure

- `/src/app/*` - Next.js App Router pages and layouts
- `/src/components/*` - Reusable React components organized by feature
- `/src/context/*` - React Context providers for global state
- `/src/lib/*` - Utility functions and service libraries
- `/src/types/*` - TypeScript type definitions
- `/src/data/*` - CSV data files for products
- `/public/*` - Static assets including images and fonts

## Performance Optimization

The application includes several performance optimizations:

1. **Image Optimization**: Using Next.js Image component with proper sizing and formats
2. **Code Splitting**: Automatic code splitting with Next.js App Router
3. **Static Asset Caching**: Nginx configuration for optimal caching of static assets
4. **Lazy Loading**: Components and images are loaded only when needed
5. **Server Components**: Using React Server Components where appropriate to reduce client-side JavaScript

## Accessibility

The application follows accessibility best practices:

1. **Semantic HTML**: Using proper HTML elements for better screen reader support
2. **ARIA Attributes**: Adding appropriate ARIA roles and attributes
3. **Keyboard Navigation**: Ensuring all interactive elements are keyboard accessible
4. **Color Contrast**: Meeting WCAG 2.1 AA standards for color contrast
5. **Focus Management**: Proper focus management for interactive elements

## SEO Optimization

The application includes SEO optimizations:

1. **Metadata**: Proper title, description, and OpenGraph tags
2. **Semantic Structure**: Using appropriate heading levels and landmark regions
3. **Sitemap**: XML sitemap for search engine crawling
4. **Structured Data**: JSON-LD structured data for rich search results

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's create a subscription page:
