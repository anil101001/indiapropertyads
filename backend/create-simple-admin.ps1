# Create Simple Admin User
Write-Host "Creating Simple Admin User..." -ForegroundColor Cyan

$body = @{
    email = "admin@test.com"
    password = "admin123"
    phone = "8888888888"
    role = "admin"
    profile = @{
        name = "Admin"
        location = @{
            city = "Mumbai"
            state = "Maharashtra"
            pincode = "400001"
        }
    }
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "`n✅ Simple Admin created!" -ForegroundColor Green
Write-Host "Email: admin@test.com" -ForegroundColor Yellow
Write-Host "Password: admin123" -ForegroundColor Yellow
Write-Host "Role: $($response.data.role)" -ForegroundColor Yellow
