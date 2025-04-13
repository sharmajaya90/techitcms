# Preparing Your Music CMS App for Deployment

Follow these steps to prepare your application for deployment on Hostinger:

## 1. Install Production Dependencies

```bash
# Install required production packages
npm install --save compression helmet

# Update all packages to their latest compatible versions
npm update
```

## 2. Create a Production-Ready .env File

Create a `.env` file with secure production values:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=use_a_strong_random_secret_key_here
```

To generate a secure JWT secret key, you can use:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Test Production Mode Locally

```bash
# Run the application in production mode
npm run prod
```

Visit http://localhost:3000 and verify everything works correctly.

## 4. Create a Deployment ZIP File

Create a ZIP file of your project excluding unnecessary files:

```bash
# Create a deployable ZIP file (Linux/Mac)
zip -r music-cms.zip . -x "node_modules/*" ".git/*" "uploads/*"

# Or manually create a ZIP excluding:
# - node_modules/ folder
# - .git/ folder
# - uploads/ folder
```

## 5. Follow the Deployment Guide

Once your application is prepared, follow the detailed instructions in the [DEPLOYMENT.md](DEPLOYMENT.md) file to deploy your application to Hostinger.

## Important Notes

1. **Environment Variables**: Never commit your production .env file to version control.

2. **MongoDB Setup**: Set up MongoDB Atlas before deploying your application.

3. **Uploads Directory**: The uploads directory will be automatically created on the server.

4. **JWT Secret Key**: Make sure to use a different strong secret key for production.

5. **Security**: Keep your MongoDB credentials and JWT secret secure.

After completing these preparation steps, refer to the complete deployment guide for detailed instructions on how to deploy to Hostinger. 