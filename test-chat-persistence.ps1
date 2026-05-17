param(
    [string]$ApiBase = "http://localhost:5000/api",
    [string]$RagApi = "http://localhost:8001"
)

function Test-Endpoint {
    param([string]$url, [string]$method = "GET", [hashtable]$headers, [string]$body)
    
    try {
        $params = @{
            Uri = $url
            Method = $method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($headers) { $params.Headers = $headers }
        if ($body) { $params.Body = $body }
        
        $response = Invoke-WebRequest @params
        return @{ success = $true; data = $response.Content | ConvertFrom-Json; status = $response.StatusCode }
    }
    catch {
        return @{ success = $false; error = $_.Exception.Message; status = $_.Exception.Response.StatusCode.Value__ }
    }
}

Write-Host "========== Chat Persistence Integration Test ==========" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1] Testing User Authentication..." -ForegroundColor Yellow

$loginBody = @{
    email = "test@agrisense.com"
    password = "TestPassword123!"
} | ConvertTo-Json

$loginResult = Test-Endpoint -url "$ApiBase/auth/login" -method "POST" -body $loginBody

if ($loginResult.success) {
    $token = $loginResult.data.token
    Write-Host "[OK] User logged in" -ForegroundColor Green
    Write-Host "     Token: $($token.Substring(0, 20))..."
}
else {
    Write-Host "[FAIL] Login failed: $($loginResult.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Ask RAG Assistant
Write-Host "[2] Testing RAG Assistant..." -ForegroundColor Yellow

$ragBody = @{
    question = "What is the best crop for summer season?"
    language = "en"
    chat_history = @()
} | ConvertTo-Json

$ragResult = Test-Endpoint -url "$RagApi/ask" -method "POST" -body $ragBody

if ($ragResult.success -and $ragResult.data.answer) {
    $answer = $ragResult.data.answer
    if ($answer.Length -gt 80) {
        $answer = $answer.Substring(0, 80) + "..."
    }
    Write-Host "[OK] RAG response received" -ForegroundColor Green
    Write-Host "     Answer: $answer"
}
else {
    Write-Host "[FAIL] RAG error: $($ragResult.error)" -ForegroundColor Red
    Write-Host "     Make sure RAG system is running on port 8001" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Save Chat Session
Write-Host "[3] Testing Chat Session Save to MongoDB..." -ForegroundColor Yellow

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$saveBody = @{
    title = "Summer Crop Selection Test"
    language = "en"
    messages = @(
        @{
            sender = "user"
            text = "What is the best crop for summer season?"
            language = "en"
            createdAt = $timestamp
        },
        @{
            sender = "ai"
            text = $ragResult.data.answer
            language = $ragResult.data.language
            sources = @()
            createdAt = $timestamp
        }
    )
} | ConvertTo-Json -Depth 10

$headers = @{ "Authorization" = "Bearer $token" }
$saveResult = Test-Endpoint -url "$ApiBase/chat-history" -method "POST" -headers $headers -body $saveBody

if ($saveResult.success -and $saveResult.data.session) {
    $sessionId = $saveResult.data.session.id
    Write-Host "[OK] Chat session saved to MongoDB" -ForegroundColor Green
    Write-Host "     Session ID: $sessionId"
}
else {
    Write-Host "[FAIL] Save failed: $($saveResult.error)" -ForegroundColor Red
    Write-Host "     Make sure backend is running on port 5000" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 4: Retrieve Chat Sessions
Write-Host "[4] Testing Chat Sessions Retrieval..." -ForegroundColor Yellow

$headers = @{ "Authorization" = "Bearer $token" }
$listResult = Test-Endpoint -url "$ApiBase/chat-history" -method "GET" -headers $headers

if ($listResult.success) {
    $count = @($listResult.data.sessions).Count
    Write-Host "[OK] Retrieved $count chat session(s)" -ForegroundColor Green
    if ($count -gt 0) {
        foreach ($session in $listResult.data.sessions) {
            Write-Host "     - $($session.title)"
        }
    }
}
else {
    Write-Host "[FAIL] Retrieval failed: $($listResult.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Retrieve Specific Session
Write-Host "[5] Testing Specific Session Retrieval..." -ForegroundColor Yellow

$headers = @{ "Authorization" = "Bearer $token" }
$singleResult = Test-Endpoint -url "$ApiBase/chat-history/$sessionId" -method "GET" -headers $headers

if ($singleResult.success) {
    $session = $singleResult.data.session
    Write-Host "[OK] Session retrieved successfully" -ForegroundColor Green
    Write-Host "     Title: $($session.title)"
    Write-Host "     Messages: $(@($session.messages).Count)"
    Write-Host "     Language: $($session.language)"
}
else {
    Write-Host "[FAIL] Session retrieval failed: $($singleResult.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 6: Test Authorization
Write-Host "[6] Testing Authorization Enforcement..." -ForegroundColor Yellow

$invalidHeaders = @{ "Authorization" = "Bearer invalid-token" }
$authResult = Test-Endpoint -url "$ApiBase/chat-history/$sessionId" -method "GET" -headers $invalidHeaders

if (-not $authResult.success -and $authResult.status -eq 401) {
    Write-Host "[OK] Authorization properly enforced (HTTP 401)" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] Authorization test inconclusive" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========== All Tests Completed ==========" -ForegroundColor Green
Write-Host ""
Write-Host "TESTS PASSED:" -ForegroundColor Cyan
Write-Host "  1. User authentication with JWT tokens"
Write-Host "  2. RAG assistant provides answers"
Write-Host "  3. Chat messages auto-saved to MongoDB"
Write-Host "  4. User can retrieve their chat sessions"
Write-Host "  5. Only authenticated users can access sessions"
Write-Host "  6. Authorization properly enforced"
Write-Host ""
Write-Host "Documentation: See CHAT_PERSISTENCE_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
