Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST: User Login" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -InFile "test-login.json" -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    $loginData = $loginResponse.Content | ConvertFrom-Json
    Write-Host "`nLogin Successful!" -ForegroundColor Green
    Write-Host "User: $($loginData.data.user.name) ($($loginData.data.user.email))" -ForegroundColor White
    Write-Host "Role: $($loginData.data.user.role)" -ForegroundColor White
    Write-Host "Email Verified: $($loginData.data.user.emailVerified)" -ForegroundColor White
    Write-Host "`nAccess Token (save this for next tests):" -ForegroundColor Yellow
    Write-Host $loginData.data.tokens.accessToken -ForegroundColor Cyan
    Write-Host "`n" -ForegroundColor White
    
    # Save token to file for next tests
    $loginData.data.tokens.accessToken | Out-File -FilePath "access-token.txt" -NoNewline
    Write-Host "✅ Token saved to access-token.txt" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
