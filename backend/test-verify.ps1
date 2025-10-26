Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST: Email Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $verifyResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/verify-email" -Method POST -InFile "test-verify-email.json" -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Status: $($verifyResponse.StatusCode)" -ForegroundColor Green
    $verifyData = $verifyResponse.Content | ConvertFrom-Json
    Write-Host "`n$($verifyData.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
