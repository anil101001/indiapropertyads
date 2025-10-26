Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Week 2: Property API Testing" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get access token from Week 1 tests
if (Test-Path "access-token.txt") {
    $token = Get-Content -Path "access-token.txt" -Raw
    Write-Host "✅ Using existing access token" -ForegroundColor Green
} else {
    Write-Host "❌ No access token found. Please run test-login.ps1 first!" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:5000/api/v1"

# Test 1: Create Property
Write-Host "`n--- TEST 1: Create Property ---" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/properties" -Method POST -InFile "test-property-create.json" -Headers $headers -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $propertyData = $response.Content | ConvertFrom-Json
    $propertyId = $propertyData.data._id
    Write-Host "Property ID: $propertyId" -ForegroundColor Cyan
    Write-Host "Status: $($propertyData.data.status)" -ForegroundColor Cyan
    Write-Host "Message: $($propertyData.message)" -ForegroundColor White
    
    # Save property ID for other tests
    $propertyId | Out-File -FilePath "property-id.txt" -NoNewline
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Get All Properties (Public)
Write-Host "`n--- TEST 2: Get All Properties ---" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/properties?page=1&limit=10" -Method GET -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Total Properties: $($data.data.pagination.total)" -ForegroundColor Cyan
    Write-Host "Page: $($data.data.pagination.page) of $($data.data.pagination.pages)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get My Properties
Write-Host "`n--- TEST 3: Get My Properties ---" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/properties/my/properties" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "My Properties Count: $($data.data.pagination.total)" -ForegroundColor Cyan
    
    if ($data.data.properties.Count -gt 0) {
        Write-Host "`nMy Properties:" -ForegroundColor White
        foreach ($prop in $data.data.properties) {
            Write-Host "  - $($prop.title) ($($prop.status))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Single Property
if (Test-Path "property-id.txt") {
    $propertyId = Get-Content -Path "property-id.txt" -Raw
    Write-Host "`n--- TEST 4: Get Property Details ---" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/properties/$propertyId" -Method GET -UseBasicParsing
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "Title: $($data.data.title)" -ForegroundColor Cyan
        Write-Host "Location: $($data.data.address.city), $($data.data.address.state)" -ForegroundColor Cyan
        Write-Host "Price: ₹$($data.data.pricing.expectedPrice)" -ForegroundColor Cyan
        Write-Host "Bedrooms: $($data.data.specs.bedrooms)" -ForegroundColor Cyan
        Write-Host "Views: $($data.data.stats.views)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test 5: Update Property
    Write-Host "`n--- TEST 5: Update Property ---" -ForegroundColor Yellow
    try {
        $updateData = @{
            title = "Updated: Spacious 3BHK Apartment in Indiranagar"
            "pricing" = @{
                expectedPrice = 13000000
                priceNegotiable = true
                maintenanceCharges = 4500
            }
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$baseUrl/properties/$propertyId" -Method PATCH -Body $updateData -Headers $headers -UseBasicParsing
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "New Title: $($data.data.title)" -ForegroundColor Cyan
        Write-Host "New Price: ₹$($data.data.pricing.expectedPrice)" -ForegroundColor Cyan
        Write-Host "Status: $($data.data.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Search/Filter Properties
Write-Host "`n--- TEST 6: Search Properties (Bangalore, 3BHK) ---" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/properties?city=Bangalore&bedrooms=3" -Method GET -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Filtered Results: $($data.data.pagination.total)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Mark as Sold (Optional)
if (Test-Path "property-id.txt") {
    Write-Host "`n--- TEST 7: Mark Property as Sold ---" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to mark the property as sold? (y/n)"
    if ($confirm -eq 'y') {
        try {
            $propertyId = Get-Content -Path "property-id.txt" -Raw
            $response = Invoke-WebRequest -Uri "$baseUrl/properties/$propertyId/mark-sold" -Method PATCH -Headers $headers -UseBasicParsing
            Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
            $data = $response.Content | ConvertFrom-Json
            Write-Host "Property Status: $($data.data.status)" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Skipped." -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Property API Tests Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
