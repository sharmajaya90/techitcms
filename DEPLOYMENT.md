# Deployment Guide for Music CMS on Hostinger

This guide explains how to deploy your Music CMS application on Hostinger with your existing domain and connect to MongoDB.

## 1. Prepare Your Application

Before deploying, make sure your application is production-ready:

1. **Install Production Dependencies**:
   ```bash
   npm install --save compression helmet
   ```

2. **Create a .env File for Production**:
   Create a `.env` file with the following variables:
   ```
   NODE_ENV=production
   PORT=3000  # Adjust as needed for Hostinger
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret  # Generate a strong random string
   ```

3. **Test Your Application Locally in Production Mode**:
   ```bash
   npm run prod
   ```

4. **Prepare Your Files for Deployment**:
   Create a ZIP file excluding these directories:
   - `node_modules/` (will be installed on the server)
   - `.git/` (not needed for deployment)
   - `uploads/` (will be created on the server)

## 2. Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**:
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a Cluster**:
   - Click "Build a Cluster" (free tier is sufficient for starting)
   - Choose a cloud provider and region (select the region closest to your Hostinger server location)
   - Keep the default cluster tier (M0 Sandbox - Free)
   - Name your cluster (e.g., "music-cms-prod")
   - Click "Create Cluster"

3. **Set Up Database Access**:
   - Go to "Database Access" under SECURITY
   - Click "Add New Database User"
   - Create a username and password (store these securely)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" under SECURITY
   - Click "Add IP Address"
   - For initial setup, select "Allow Access from Anywhere" (you can restrict this later)
   - Click "Confirm"

5. **Get Your Connection String**:
   - Go to "Clusters" and click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with "music-cms"

## 3. Deploy to Hostinger

### Option 1: Using Hostinger's hPanel (Node.js Hosting Plan)

1. **Log in to Hostinger Control Panel**:
   - Access your Hostinger account
   - Go to hosting dashboard

2. **Set Up Node.js Environment**:
   - Navigate to "Website" → "Node.js"
   - Set the Node.js version to 14.x or higher
   - Set the NPM version to 6.x or higher
   - Set Entry Point to "server.js"
   - Configure environment variables from your .env file
   - Click "Save"

3. **Upload Your Files**:
   - Go to "File Manager" or use FTP client
   - Upload your application ZIP file
   - Extract the ZIP file to the root directory

4. **Install Dependencies**:
   - Access SSH Terminal (or use Hostinger's Node.js console if available)
   - Navigate to your application directory
   - Run: `npm install --production`

5. **Start Your Application**:
   - In the Node.js panel, click "Start Application"
   - Check the logs for any startup errors

### Option 2: Using Hostinger VPS (More Control)

1. **Log in to Your VPS via SSH**:
   ```bash
   ssh username@your-vps-ip
   ```

2. **Update System Packages**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **Install Node.js and npm**:
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   node -v  # Verify installation
   npm -v   # Verify npm installation
   ```

4. **Install PM2 Process Manager**:
   ```bash
   sudo npm install -g pm2
   ```

5. **Create Application Directory**:
   ```bash
   mkdir -p /var/www/music-cms
   cd /var/www/music-cms
   ```

6. **Upload and Extract Your Application**:
   - Use SFTP to upload your ZIP file
   - Extract: `unzip your-app.zip -d .`

7. **Install Dependencies**:
   ```bash
   npm install --production
   ```

8. **Set Up Environment Variables**:
   ```bash
   nano .env
   # Add your production environment variables
   ```

9. **Start Your Application with PM2**:
   ```bash
   pm2 start server.js --name "music-cms"
   pm2 save
   pm2 startup
   # Run the command PM2 provides to set up automatic startup
   ```

10. **Set Up Nginx as Reverse Proxy**:
    ```bash
    sudo apt install -y nginx
    
    # Create Nginx config
    sudo nano /etc/nginx/sites-available/music-cms
    ```

    Add this configuration:
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
        
        # Proxy main application
        location / {
            proxy_pass http://localhost:3000;  # Your Node.js port
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Serve uploads directly through Nginx
        location /uploads/ {
            alias /var/www/music-cms/uploads/;
            expires 1d; # Add 1 day cache
            add_header Cache-Control "public, max-age=86400";
        }
    }
    ```

11. **Enable the Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/music-cms /etc/nginx/sites-enabled/
    sudo nginx -t  # Test configuration
    sudo systemctl restart nginx
    ```

## 4. Connect Your Domain

1. **Log in to Hostinger Dashboard**:
   - Go to "Domains" section
   - Select your domain

2. **Point Domain to Your Hosting**:
   - If using shared hosting: Follow Hostinger's instructions to point your domain to your hosting account
   - If using VPS: Update DNS A records to point to your VPS IP address

3. **DNS Settings**:
   - Add an A record: `@` pointing to your server IP
   - Add a CNAME record: `www` pointing to `@`
   - Wait for DNS propagation (can take up to 24-48 hours)

## 5. Secure Your Site with SSL

### Using Hostinger's hPanel:
1. Navigate to SSL section in hPanel
2. Enable Let's Encrypt SSL for your domain
3. Follow the prompts to complete the process

### Using VPS:
1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Follow the Prompts**:
   - Provide your email for renewal notifications
   - Agree to terms of service
   - Choose whether to redirect HTTP to HTTPS (recommended)

## 6. Post-Deployment Tasks

1. **Configure Automatic Backups**:
   - For MongoDB Atlas: Enable automatic backups in the Atlas dashboard
   - For VPS: Set up a backup script for your application files

2. **Set Up Monitoring**:
   - For VPS: Use PM2 monitoring: `pm2 monitor`

3. **Test Your Application**:
   - Visit your domain and test all functionality
   - Verify uploads work properly
   - Test user registration and login
   - Ensure MongoDB connection is working

4. **Secure MongoDB**:
   - Go back to MongoDB Atlas Network Access
   - Remove "Allow Access from Anywhere"
   - Add your server's IP address instead

## 7. Troubleshooting

### Application Won't Start
- Check the logs: `pm2 logs music-cms`
- Verify environment variables are set correctly
- Ensure MongoDB connection string is correct
- Check for permission issues in the uploads directory

### MongoDB Connection Issues
- Verify IP allowlist in MongoDB Atlas
- Confirm connection string is correct in .env
- Test connection from server: `mongo your-connection-string`

### File Upload Problems
- Check permissions on uploads directory: `chmod 755 uploads`
- Verify the uploads path is correctly configured

### SSL Certificate Issues
- Run: `sudo certbot renew --dry-run` to test renewal
- Check Nginx configuration for SSL setup

## 8. Maintenance

1. **Regular Updates**:
   ```bash
   # On your server
   cd /var/www/music-cms
   git pull  # If using Git
   npm install --production
   pm2 restart music-cms
   ```

2. **Monitor Logs**:
   ```bash
   pm2 logs music-cms
   # Or
   tail -f /var/log/nginx/error.log
   ```

3. **Database Management**:
   - Monitor database size in MongoDB Atlas dashboard
   - Set up alerts for approaching storage limits

4. **SSL Certificate Renewal**:
   - Let's Encrypt certificates auto-renew, but verify:
   ```bash
   sudo systemctl status certbot.timer
   ``` 