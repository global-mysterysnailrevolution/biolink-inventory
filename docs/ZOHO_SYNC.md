# Zoho Inventory Sync Integration

This document explains how to sync items from Zoho Inventory to the Bio-Link Depot Inventory System.

## Overview

The Zoho sync integration allows you to:
- Pull items from Zoho Inventory into the Bio-Link database
- Keep items in sync (create new, update existing)
- Map Zoho item fields to Bio-Link item fields
- Track sync statistics

## Setup

### 1. Zoho API Credentials

Get your Zoho API credentials from [Zoho API Console](https://api-console.zoho.com):

1. Create a Zoho API application
2. Generate OAuth credentials
3. Get a refresh token

Add to your `.env` file:
```env
ZOHO_CLIENT_ID=your-client-id
ZOHO_CLIENT_SECRET=your-client-secret
ZOHO_REFRESH_TOKEN=your-refresh-token
```

### 2. Using MCP Tools (Cursor)

If you're using Cursor with MCP integration, you can use the `zoho-inventory-custom` MCP server:

```javascript
// In Cursor, you can call MCP tools directly
const items = await mcp_zoho_inventory_custom_zoho_get_items({ limit: 100 });
```

### 3. Using the API Endpoint

Once items are fetched from Zoho (via MCP or API), sync them via the API:

```bash
POST /api/zoho-sync/items
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "items": [
    {
      "item_id": "123456",
      "name": "Sample Item",
      "description": "Item description",
      "category": "Category Name",
      "unit": "unit",
      "quantity": 100,
      "sku": "SKU-001",
      "image": "https://..."
    }
  ]
}
```

## Field Mapping

Zoho fields are automatically mapped to Bio-Link fields:

| Zoho Field | Bio-Link Field |
|------------|---------------|
| `item_id` or `id` | `external_product_id` |
| `name` or `item_name` | `name` |
| `description` or `item_desc` | `description` |
| `category` or `item_category` | `category` |
| `unit` or `stock_unit` | `unit` |
| `quantity` or `stock_on_hand` | `default_quantity` |
| `image` or `image_url` | `photo_url` |
| `sku` or `item_code` | `external_variant_id` |

## Sync Behavior

- **New Items**: Items with `external_product_id` that don't exist are created
- **Existing Items**: Items with matching `external_product_id` are updated
- **Errors**: Items that fail to sync are tracked in the response

## Example Sync Workflow

### Option 1: Using MCP Tools in Cursor

1. In Cursor, use MCP tools to fetch Zoho items:
   ```javascript
   const zohoItems = await mcp_zoho_inventory_custom_zoho_get_items({ limit: 100 });
   ```

2. Call the sync API endpoint with the items:
   ```bash
   curl -X POST https://your-api.railway.app/api/zoho-sync/items \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"items": [...]}'
   ```

### Option 2: Direct API Integration

1. Implement Zoho API client using credentials
2. Fetch items from Zoho API
3. Transform to Bio-Link format
4. Call sync endpoint or use `ZohoSyncService` directly

### Option 3: Scheduled Sync Script

Create a cron job or scheduled task that:
1. Fetches items from Zoho API
2. Calls the sync endpoint
3. Logs results

## API Endpoints

### POST /api/zoho-sync/items

Sync items from Zoho Inventory.

**Authentication**: Required (ADMIN role)

**Request Body**:
```json
{
  "items": [
    {
      "item_id": "123",
      "name": "Item Name",
      ...
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "created": 5,
    "updated": 3,
    "skipped": 2,
    "errors": 0
  },
  "errors": []
}
```

### GET /api/zoho-sync/stats

Get current sync statistics.

**Authentication**: Required (ADMIN role)

**Response**:
```json
{
  "created": 5,
  "updated": 3,
  "skipped": 2,
  "errors": []
}
```

## Troubleshooting

### Authentication Errors

If you get 401 errors from Zoho:
- Check that `ZOHO_REFRESH_TOKEN` is valid
- Refresh token may have expired
- Verify API credentials are correct

### Sync Failures

- Check database connection
- Verify item data format matches expected structure
- Review error messages in response

### Missing Fields

If Zoho items are missing fields:
- The sync service uses fallback values
- Default `unit` is "unit" if not provided
- Default `name` is "Unnamed Item" if not provided

## Next Steps

1. Set up Zoho API credentials
2. Test sync with a small batch of items
3. Set up scheduled sync (cron job, Railway cron, etc.)
4. Monitor sync statistics via API endpoint
