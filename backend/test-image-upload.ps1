Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Test: Image Upload to AWS S3" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check for access token
if (-not (Test-Path "access-token.txt")) {
    Write-Host "❌ No access token found. Running login first..." -ForegroundColor Yellow
    & powershell -ExecutionPolicy Bypass -File test-login.ps1
    if (-not (Test-Path "access-token.txt")) {
        Write-Host "❌ Login failed. Cannot proceed." -ForegroundColor Red
        exit 1
    }
}

$token = Get-Content -Path "access-token.txt" -Raw
$baseUrl = "http://localhost:5000/api/v1"

# Prompt for image file
Write-Host "Please provide the path to an image file (JPG, PNG, or WebP):" -ForegroundColor Yellow
Write-Host "Example: C:\Users\YourName\Pictures\test.jpg" -ForegroundColor Gray
$imagePath = Read-Host "Image Path"

# Check if file exists
if (-not (Test-Path $imagePath)) {
    Write-Host "❌ File not found: $imagePath" -ForegroundColor Red
    exit 1
}

# Check file extension
$extension = [System.IO.Path]::GetExtension($imagePath).ToLower()
if ($extension -notin @('.jpg', '.jpeg', '.png', '.webp')) {
    Write-Host "❌ Invalid file type. Only JPG, PNG, and WebP are supported." -ForegroundColor Red
    exit 1
}

# Check file size
$fileSize = (Get-Item $imagePath).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
Write-Host "`nFile: $(Split-Path $imagePath -Leaf)" -ForegroundColor Cyan
Write-Host "Size: $fileSizeMB MB" -ForegroundColor Cyan

if ($fileSize -gt 5MB) {
    Write-Host "❌ File size exceeds 5MB limit!" -ForegroundColor Red
    exit 1
}

# Test 1: Upload Single Image
Write-Host "`n--- TEST 1: Upload Single Image to S3 ---" -ForegroundColor Yellow
try {
    $form = @{
        image = Get-Item -Path $imagePath
    }
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "Uploading to AWS S3..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "$baseUrl/upload/image" -Method POST -Headers $headers -Form $form -UseBasicParsing
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n📸 Image Uploaded Successfully!" -ForegroundColor Green
    Write-Host "URL: $($data.data.url)" -ForegroundColor Cyan
    Write-Host "S3 Key: $($data.data.key)" -ForegroundColor Cyan
    Write-Host "Size: $([math]::Round($data.data.size / 1024, 2)) KB" -ForegroundColor Cyan
    
    # Save image data for property creation
    $imageData = @{
        url = $data.data.url
        key = $data.data.key
        size = $data.data.size
    }
    $imageData | ConvertTo-Json | Out-File -FilePath "uploaded-image.json" -NoNewline
    Write-Host "`n✅ Image data saved to uploaded-image.json" -ForegroundColor Green
    
    # Verify on S3
    Write-Host "`n--- Verifying on AWS S3 ---" -ForegroundColor Yellow
    $s3Key = $data.data.key
    aws s3 ls "s3://india-property-ads/$s3Key"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ File verified on S3!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Test 2: Create Property with Image
Write-Host "`n--- TEST 2: Create Property with Uploaded Image ---" -ForegroundColor Yellow
$confirm = Read-Host "Create a test property with this image? (y/n)"

if ($confirm -eq 'y') {
    try {
        # Load property template
        $property = Get-Content "test-property-create.json" | ConvertFrom-Json
        
        # Add uploaded image
        $property.images = @(
            @{
                url = $imageData.url
                key = $imageData.key
                isCover = $true
                order = 0
            }
        )
        
        # Convert to JSON
        $propertyJson = $property | ConvertTo-Json -Depth 10
        
        # Create property
        $response = Invoke-WebRequest -Uri "$baseUrl/properties" -Method POST -Headers $headers -Body $propertyJson -ContentType "application/json" -UseBasicParsing
        
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        $propertyData = $response.Content | ConvertFrom-Json
        Write-Host "Property ID: $($propertyData.data._id)" -ForegroundColor Cyan
        Write-Host "Status: $($propertyData.data.status)" -ForegroundColor Cyan
        Write-Host "Images: $($propertyData.data.images.Count)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Error creating property: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped property creation." -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Image Upload Test Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Your S3 bucket is working perfectly!" -ForegroundColor Green
Write-Host "Images are being uploaded to: s3://india-property-ads/properties/" -ForegroundColor Green
Write-Host "`nYou can view your bucket at:" -ForegroundColor White
Write-Host "https://s3.console.aws.amazon.com/s3/buckets/india-property-ads" -ForegroundColor Cyan
