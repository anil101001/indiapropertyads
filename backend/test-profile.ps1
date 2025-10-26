Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST: Get User Profile (Protected Route)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $token = Get-Content -Path "access-token.txt" -Raw
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $profileResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/users/me" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "✅ Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    $profileData = $profileResponse.Content | ConvertFrom-Json
    Write-Host "`nUser Profile:" -ForegroundColor Yellow
    $profileData.data | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
