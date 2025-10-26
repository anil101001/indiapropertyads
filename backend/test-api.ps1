# Test Registration
Write-Host "`n=== Testing User Registration ===" -ForegroundColor Cyan
$registerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -InFile "test-register.json" -ContentType "application/json" -UseBasicParsing
Write-Host "Status: $($registerResponse.StatusCode)" -ForegroundColor Green
Write-Host "Response:" -ForegroundColor Yellow
$registerResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
