# Email Configuration Guide

## Production Email Setup

NexApply uses SMTP for sending emails (verification codes, password resets, welcome emails).

### Supported Email Providers

#### 1. Gmail (Recommended for Testing)
```json
"EmailSettings": {
  "SmtpHost": "smtp.gmail.com",
  "SmtpPort": "587",
  "SmtpUsername": "your-email@gmail.com",
  "SmtpPassword": "your-app-password",
  "FromEmail": "your-email@gmail.com",
  "FromName": "NexApply"
}
```

**Setup Steps:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use the 16-character password in `SmtpPassword`

#### 2. SendGrid (Recommended for Production)
```json
"EmailSettings": {
  "SmtpHost": "smtp.sendgrid.net",
  "SmtpPort": "587",
  "SmtpUsername": "apikey",
  "SmtpPassword": "your-sendgrid-api-key",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "NexApply"
}
```

**Setup Steps:**
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Create an API Key
3. Verify your sender email/domain
4. Use API key as `SmtpPassword`

#### 3. Mailgun
```json
"EmailSettings": {
  "SmtpHost": "smtp.mailgun.org",
  "SmtpPort": "587",
  "SmtpUsername": "postmaster@your-domain.mailgun.org",
  "SmtpPassword": "your-mailgun-password",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "NexApply"
}
```

#### 4. AWS SES (Amazon Simple Email Service)
```json
"EmailSettings": {
  "SmtpHost": "email-smtp.us-east-1.amazonaws.com",
  "SmtpPort": "587",
  "SmtpUsername": "your-ses-smtp-username",
  "SmtpPassword": "your-ses-smtp-password",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "NexApply"
}
```

#### 5. Outlook/Office 365
```json
"EmailSettings": {
  "SmtpHost": "smtp.office365.com",
  "SmtpPort": "587",
  "SmtpUsername": "your-email@outlook.com",
  "SmtpPassword": "your-password",
  "FromEmail": "your-email@outlook.com",
  "FromName": "NexApply"
}
```

---

## Environment Variables (Production)

**NEVER commit email credentials to Git!**

Use environment variables or Azure Key Vault:

```bash
# Linux/macOS
export EmailSettings__SmtpHost="smtp.gmail.com"
export EmailSettings__SmtpPort="587"
export EmailSettings__SmtpUsername="your-email@gmail.com"
export EmailSettings__SmtpPassword="your-app-password"
export EmailSettings__FromEmail="noreply@nexapply.com"
export EmailSettings__FromName="NexApply"

# Windows PowerShell
$env:EmailSettings__SmtpHost="smtp.gmail.com"
$env:EmailSettings__SmtpPort="587"
$env:EmailSettings__SmtpUsername="your-email@gmail.com"
$env:EmailSettings__SmtpPassword="your-app-password"
$env:EmailSettings__FromEmail="noreply@nexapply.com"
$env:EmailSettings__FromName="NexApply"
```

---

## Azure App Service Configuration

1. Go to Azure Portal → Your App Service
2. Navigate to **Configuration** → **Application settings**
3. Add these settings:
   - `EmailSettings:SmtpHost`
   - `EmailSettings:SmtpPort`
   - `EmailSettings:SmtpUsername`
   - `EmailSettings:SmtpPassword`
   - `EmailSettings:FromEmail`
   - `EmailSettings:FromName`

---

## Testing Email Locally

For development, you can use:

### Ethereal Email (Fake SMTP for Testing)
```csharp
// Visit https://ethereal.email to generate test credentials
"EmailSettings": {
  "SmtpHost": "smtp.ethereal.email",
  "SmtpPort": "587",
  "SmtpUsername": "generated-username",
  "SmtpPassword": "generated-password",
  "FromEmail": "test@ethereal.email",
  "FromName": "NexApply Test"
}
```

Emails won't actually send but you can view them at https://ethereal.email

---

## Email Templates

The system sends 3 types of emails:

1. **Verification Code** - 6-digit code for registration
2. **Password Reset Code** - 6-digit code for password reset
3. **Welcome Email** - Sent after successful registration

All emails use HTML templates with NexApply branding.

---

## Troubleshooting

### "Failed to send email"
- Check SMTP credentials
- Verify SMTP host and port
- Check firewall/network settings
- Enable "Less secure app access" (Gmail)
- Use App Password instead of regular password (Gmail)

### "Authentication failed"
- Verify username/password
- Check if 2FA is enabled (use App Password)
- Verify API key format (SendGrid)

### Emails going to spam
- Set up SPF, DKIM, DMARC records
- Use verified domain
- Avoid spam trigger words
- Use reputable SMTP provider

---

## Production Recommendations

✅ **Use SendGrid or AWS SES** for production (reliable, scalable)
✅ **Set up custom domain** (e.g., noreply@nexapply.com)
✅ **Verify sender domain** to avoid spam
✅ **Monitor email delivery** rates
✅ **Use environment variables** for credentials
✅ **Enable logging** for email failures
✅ **Set up retry logic** for failed sends

---

## Cost Comparison

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| SendGrid | 100/day | $15/mo (40K emails) |
| Mailgun | 5,000/mo | $35/mo (50K emails) |
| AWS SES | 62,000/mo (if hosted on AWS) | $0.10 per 1,000 emails |
| Gmail | N/A (not for production) | N/A |

---

## Security Notes

- Never hardcode credentials in code
- Use App Passwords for Gmail (not regular password)
- Rotate credentials regularly
- Monitor for suspicious activity
- Use TLS/SSL (port 587 or 465)
