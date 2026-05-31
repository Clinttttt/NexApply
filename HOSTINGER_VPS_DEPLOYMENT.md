# Deploy NexApply to Hostinger VPS

## Your VPS Details
- **IP Address**: 72.60.236.223
- **OS**: Ubuntu (KVM 1)
- **Expiration**: 2026-06-19

## Prerequisites
- SSH access to your VPS
- Domain name (optional, can use IP initially)

---

## Step 1: Connect to VPS

```bash
ssh root@72.60.236.223
```

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install .NET 9.0 SDK
wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 9.0
echo 'export DOTNET_ROOT=$HOME/.dotnet' >> ~/.bashrc
echo 'export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools' >> ~/.bashrc
source ~/.bashrc

# Verify .NET installation
dotnet --version

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install Node.js 20 (for frontend build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y
```

## Step 3: Setup PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE nexapply;
CREATE USER nexapply_user WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE nexapply TO nexapply_user;
\q
```

## Step 4: Clone Your Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/Clinttttt/NexApply.git
cd NexApply
```

## Step 5: Configure Backend API

```bash
# Navigate to API directory
cd /var/www/NexApply/NexApply.Api

# Create production appsettings
nano appsettings.Production.json
```

Paste this configuration:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=nexapply;Username=nexapply_user;Password=YourStrongPassword123!"
  },
  "AppSettings": {
    "Token": "MySuperSecureRandomKeyThatLooksJustAwesomeAndNeedsToBeVeryVeryLong!!!111oneeeleven",
    "Issuer": "MyAwesomeApp",
    "Audience": "MyAwesomeAudience"
  },
  "Authentication": {
    "Google": {
      "ClientId": "<GOOGLE_OAUTH_CLIENT_ID>",
      "ClientSecret": "<GOOGLE_OAUTH_CLIENT_SECRET>"
    }
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUsername": "clintvillanueva82@gmail.com",
    "SmtpPassword": "bufenozioyjlhhla",
    "FromEmail": "clintvillanueva82@gmail.com",
    "FromName": "NexApplyV2"
  }
}
```

Save and exit (Ctrl+X, Y, Enter)

## Step 6: Build and Run Backend

```bash
# Restore packages
dotnet restore

# Run migrations
dotnet ef database update

# Build the API
dotnet publish -c Release -o /var/www/nexapply-api

# Create systemd service
sudo nano /etc/systemd/system/nexapply-api.service
```

Paste this:
```ini
[Unit]
Description=NexApply API
After=network.target

[Service]
WorkingDirectory=/var/www/nexapply-api
ExecStart=/root/.dotnet/dotnet /var/www/nexapply-api/NexApply.Api.dll
Restart=always
RestartSec=10
SyslogIdentifier=nexapply-api
User=root
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

Save and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nexapply-api
sudo systemctl start nexapply-api
sudo systemctl status nexapply-api
```

## Step 7: Build Frontend

```bash
cd /var/www/NexApply/NexApply.Web

# Create .env.production
nano .env.production
```

Paste:
```
VITE_API_URL=http://72.60.236.223/api
```

Build frontend:
```bash
npm install
npm run build
```

## Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/nexapply
```

Paste this configuration:
```nginx
# API Backend
server {
    listen 80;
    server_name 72.60.236.223;

    # API endpoint
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }

    # Frontend
    location / {
        root /var/www/NexApply/NexApply.Web/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nexapply /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 10: Test Your Application

Open browser and go to:
- **Frontend**: http://72.60.236.223
- **API Health**: http://72.60.236.223/api/health

---

## Optional: Add Custom Domain & SSL

If you have a domain (e.g., nexapply.com):

### 1. Point Domain to VPS
In your domain DNS settings, add:
```
A Record: @ → 72.60.236.223
A Record: www → 72.60.236.223
```

### 2. Install SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
```

### 3. Update Frontend .env
```bash
cd /var/www/NexApply/NexApply.Web
nano .env.production
```
Change to:
```
VITE_API_URL=https://yourdomain.com/api
```

Rebuild:
```bash
npm run build
```

---

## Maintenance Commands

### Update Application
```bash
cd /var/www/NexApply
git pull origin master

# Rebuild API
cd NexApply.Api
dotnet publish -c Release -o /var/www/nexapply-api
sudo systemctl restart nexapply-api

# Rebuild Frontend
cd ../NexApply.Web
npm install
npm run build
```

### View Logs
```bash
# API logs
sudo journalctl -u nexapply-api -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
sudo systemctl restart nexapply-api
sudo systemctl restart nginx
```

---

## Troubleshooting

**API won't start:**
```bash
sudo journalctl -u nexapply-api -n 50
```

**Database connection fails:**
```bash
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -c "\du" # List users
```

**Nginx errors:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Port already in use:**
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

---

## Cost: FREE (Using your existing VPS)

Your VPS is already paid until 2026-06-19, so hosting is free!

