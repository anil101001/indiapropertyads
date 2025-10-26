Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   India Property Ads - API Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Registration
Write-Host "TEST 1: User Registration" -ForegroundColor Yellow
Write-Host "-------------------------`n" -ForegroundColor Yellow
try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -InFile "test-register2.json" -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Status: $($registerResponse.StatusCode)" -ForegroundColor Green
    $registerData = $registerResponse.Content | ConvertFrom-Json
    Write-Host "Response:" -ForegroundColor White
    $registerData | ConvertTo-Json -Depth 10
    Write-Host "`n⚠️  CHECK YOUR BACKEND TERMINAL FOR THE OTP (6-digit code)`n" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
