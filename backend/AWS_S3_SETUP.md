# AWS S3 Setup Guide for Image Upload

## Overview
The property system supports image uploads to AWS S3. This guide will help you set up AWS S3 for development and production.

---

## Prerequisites
- AWS Account (Free Tier available)
- AWS CLI installed (optional but recommended)

---

## Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Complete the registration (requires credit card, but Free Tier is available)

---

## Step 2: Create S3 Bucket

### Via AWS Console:
1. Log in to AWS Console: https://console.aws.amazon.com/
2. Navigate to **S3** service
3. Click **"Create bucket"**
4. Configure:
   - **Bucket name:** `india-property-ads-dev` (must be globally unique)
   - **Region:** `ap-south-1` (Asia Pacific - Mumbai)
   - **Object Ownership:** ACLs enabled
   - **Block Public Access:** Uncheck all (we need public-read for images)
   - **Versioning:** Disabled (optional)
   - **Encryption:** Enable (recommended)
5. Click **"Create bucket"**

### Bucket Policy:
Add this policy to allow public read access:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::india-property-ads-dev/*"
        }
    ]
}
```

---

## Step 3: Create IAM User for API Access

1. Navigate to **IAM** service
2. Click **"Users"** → **"Add users"**
3. User name: `india-property-ads-api`
4. Access type: **Programmatic access** (check this)
5. Click **"Next: Permissions"**
6. Click **"Attach existing policies directly"**
7. Search and select: **`AmazonS3FullAccess`**
8. Click **"Next"** → **"Create user"**
9. **IMPORTANT:** Save the credentials:
   - Access Key ID
   - Secret Access Key
   (You won't be able to see the secret key again!)

---

## Step 4: Configure Backend

### Update `.env` file:
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-south-1
AWS_S3_BUCKET=india-property-ads-dev
```

### Security Best Practices:
- ✅ Never commit AWS credentials to Git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use IAM roles in production (EC2, ECS)
- ✅ Enable MFA for root account

---

## Step 5: Test Image Upload

### Option A: Using Postman/Thunder Client

1. **Login first:**
   ```
   POST http://localhost:5000/api/v1/auth/login
   Body: { "email": "...", "password": "..." }
   ```

2. **Upload Image:**
   ```
   POST http://localhost:5000/api/v1/upload/image
   Headers:
     Authorization: Bearer <your_token>
   Body (form-data):
     image: [select file]
   ```

3. **Upload Multiple Images:**
   ```
   POST http://localhost:5000/api/v1/upload/images
   Headers:
     Authorization: Bearer <your_token>
   Body (form-data):
     images: [select multiple files]
   ```

### Option B: Using PowerShell (requires file)

```powershell
# Upload single image
$token = Get-Content access-token.txt -Raw
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest `
  -Uri "http://localhost:5000/api/v1/upload/image" `
  -Method POST `
  -Headers $headers `
  -Form @{
    image = Get-Item "test-image.jpg"
  }
```

---

## Image Upload Specifications

### Supported Formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Limits:
- **Max file size:** 5 MB per image
- **Max files per upload:** 10 images
- **Total upload size:** 50 MB

### Folder Structure:
```
S3 Bucket: india-property-ads-dev/
  └─ properties/
      ├─ 1730000000000-abc123def456.jpg
      ├─ 1730000001000-xyz789ghi012.jpg
      └─ ...
```

---

## Cost Estimation

### AWS Free Tier (First 12 months):
- ✅ 5 GB of standard storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests
- ✅ 100 GB data transfer out

### After Free Tier:
- Storage: ~$0.023 per GB/month (ap-south-1)
- PUT requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Estimated Cost for MVP:**
- 10 GB storage: ~$0.23/month
- 100K requests: ~$0.50/month
- **Total: < $1/month** for small scale

---

## Development Alternative

### For Development Without AWS:
You can use **local file storage** temporarily:

1. Create local uploads folder:
   ```bash
   mkdir backend/uploads/properties
   ```

2. Update image upload to save locally
3. Serve files statically via Express

**Note:** This is NOT recommended for production!

---

## Production Recommendations

### CloudFront CDN:
- Add CloudFront distribution for faster image delivery
- Reduces S3 costs
- Better global performance

### Image Optimization:
- Use Lambda@Edge for on-the-fly resizing
- Compress images before upload
- Generate thumbnails automatically

### Security:
- Enable S3 bucket encryption
- Use CloudFront signed URLs for private content
- Implement image virus scanning
- Add watermarks for premium images

---

## Troubleshooting

### Error: "Access Denied"
- Check IAM user has S3 permissions
- Verify bucket policy allows uploads
- Check AWS credentials in .env

### Error: "Bucket does not exist"
- Verify bucket name in .env
- Ensure bucket is in correct region
- Check AWS_REGION environment variable

### Error: "File size exceeds limit"
- Images must be < 5MB
- Use image compression tools
- Check file format (JPEG, PNG, WebP only)

---

## Next Steps

1. Create AWS account if you don't have one
2. Set up S3 bucket
3. Create IAM user and get credentials
4. Update `.env` file
5. Test image upload endpoints
6. Integrate with property creation flow

---

## Testing Without AWS

If you want to test property APIs without AWS S3:
- Properties can be created without images
- Images array can be empty `[]`
- Upload endpoints will fail without AWS credentials
- All other property APIs work fine!

---

**Ready to upload images! 📸**
