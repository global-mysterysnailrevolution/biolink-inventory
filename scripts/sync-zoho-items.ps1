# Zoho Inventory Sync Script
# Uses MCP tools (via Cursor) to fetch items from Zoho and sync to Bio-Link database
# This script should be run in Cursor where MCP tools are available

Write-Host "🔄 Zoho Inventory Sync Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# This script demonstrates how to sync Zoho items using MCP tools
# In Cursor, you can call MCP tools directly

Write-Host "📋 Steps to sync Zoho items:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. In Cursor, use MCP tools to fetch items:" -ForegroundColor White
Write-Host "   - Call: mcp_zoho_inventory_custom_zoho_get_items({ limit: 1000 })" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Transform items to Bio-Link format" -ForegroundColor White
Write-Host ""
Write-Host "3. Call the sync API endpoint:" -ForegroundColor White
Write-Host "   POST https://biolink-api-production.up.railway.app/api/zoho-sync/items" -ForegroundColor Gray
Write-Host "   Headers: Authorization: Bearer <admin-token>" -ForegroundColor Gray
Write-Host "   Body: { items: [...] }" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Or use the sync service directly in Node.js" -ForegroundColor White
Write-Host ""

# Example: If you have items, you can call the API
$API_URL = "https://biolink-api-production.up.railway.app"
$LOGIN_URL = "$API_URL/api/auth/login"

Write-Host "💡 Quick sync example:" -ForegroundColor Cyan
Write-Host ""
Write-Host "# 1. Login to get token" -ForegroundColor Gray
Write-Host "`$loginBody = @{ email = 'admin@biolink.local'; password = 'admin123' } | ConvertTo-Json" -ForegroundColor Gray
Write-Host "`$token = (Invoke-RestMethod -Uri '$LOGIN_URL' -Method POST -ContentType 'application/json' -Body `$loginBody).token" -ForegroundColor Gray
Write-Host ""
Write-Host "# 2. Get items from Zoho (via MCP in Cursor)" -ForegroundColor Gray
Write-Host "# `$zohoItems = <fetch from MCP>" -ForegroundColor Gray
Write-Host ""
Write-Host "# 3. Sync items" -ForegroundColor Gray
Write-Host "# `$syncBody = @{ items = `$zohoItems } | ConvertTo-Json" -ForegroundColor Gray
Write-Host "# Invoke-RestMethod -Uri '$API_URL/api/zoho-sync/items' -Method POST -ContentType 'application/json' -Body `$syncBody -Headers @{ Authorization = \"Bearer `$token\" }" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Script ready - Use MCP tools in Cursor to fetch Zoho items!" -ForegroundColor Green
