# Morning Voyage E-commerce Platform Documentation

This documentation covers the comprehensive e-commerce platform for Morning Voyage, a premium coffee dropshipping business built with Next.js and integrated with Google Sheets for product management.

## Table of Contents

1. [Setup & Installation](SETUP.md)
2. [Google Sheets API Integration](google-sheets-api.md)
3. [Product Management System](product-management.md)
4. [API Reference](api-reference.md)
5. [Architecture Overview](architecture.md)
6. [Development Workflow](development.md)
7. [Deployment Guide](deployment.md)
8. [Troubleshooting](troubleshooting.md)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone [repository]
   cd Morning-Voyage-Final
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Configure Google Sheets API credentials
   - Set up required environment variables

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Sync Products**
   - Visit `/admin` to access admin panel
   - Use the sync button to load products from Google Sheets
   - Products are automatically cached and grouped by variants

## Key Features

- ✅ **Google Sheets Integration**: Real-time product sync from spreadsheet
- ✅ **Product Variant Management**: Automatic grouping of products by name and format
- ✅ **Comprehensive API**: RESTful endpoints with error handling and logging
- ✅ **Admin Dashboard**: Product management and sync controls
- ✅ **Responsive Design**: Mobile-first e-commerce experience
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Testing Suite**: Comprehensive test coverage with Vitest
- ✅ **Error Boundaries**: Graceful error handling throughout the application

## Current Status

The platform is **production-ready** with:
- ✅ 30 products successfully synced from Google Sheets
- ✅ 14 unique coffee varieties with variant grouping
- ✅ Full e-commerce UI with filtering and search
- ✅ Robust error handling and monitoring
- ✅ Type-safe implementation throughout

## Architecture Highlights

- **Next.js 15**: App Router with server-side rendering
- **Google Sheets API**: Direct integration for product management
- **In-Memory Caching**: High-performance product data caching
- **Variant Grouping**: Intelligent product organization by format
- **Error Handling**: Centralized error management with request tracking
- **Component Architecture**: Modular, reusable React components

## Contact & Support

For technical questions or support, refer to the detailed documentation in each section or check the troubleshooting guide.
