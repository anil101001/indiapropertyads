# Create Admin User Script
Write-Host "Creating Admin User..." -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body (Get-Content "create-admin.json" -Raw)

Write-Host "`n✅ Admin user created successfully!" -ForegroundColor Green
Write-Host "Email: $($response.data.email)" -ForegroundColor Yellow
Write-Host "Role: $($response.data.role)" -ForegroundColor Yellow
Write-Host "User ID: $($response.data.userId)" -ForegroundColor Yellow
Write-Host "`n⚠️  Note: Email verification required. Check console for OTP if email not configured." -ForegroundColor Magenta
