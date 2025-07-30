# Updated Database Schema

## Members Table

```sql
CREATE TABLE members (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(50) NOT NULL,
    join_date DATE NOT NULL,
    profile_pic VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | VARCHAR(255) | Yes | Unique identifier for the member |
| `name` | VARCHAR(255) | Yes | Full name of the member |
| `email` | VARCHAR(255) | Yes | Email address (unique) |
| `phone` | VARCHAR(50) | Yes | Primary phone number |
| `dob` | DATE | Yes | Date of birth |
| `address` | TEXT | Yes | Full address |
| `emergency_contact` | VARCHAR(50) | Yes | Emergency contact phone number |
| `join_date` | DATE | Yes | Date when member joined |
| `profile_pic` | VARCHAR(500) | No | URL to profile picture |
| `created_at` | TIMESTAMP | Auto | Record creation timestamp |
| `updated_at` | TIMESTAMP | Auto | Record last update timestamp |

## Changes from Previous Schema

### Removed Fields:
- `position` - Member position/role
- `department` - Department assignment  
- `status` - Member status (active/inactive/pending)

### Added Fields:
- `dob` - Date of birth for age analytics
- `address` - Full address for geographic insights
- `emergency_contact` - Emergency contact number
- `profile_pic` - URL reference to profile picture

## Profile Picture Storage Strategy

Instead of storing images directly in the database (which is not recommended), we use a URL reference approach:

### Recommended Solutions:

1. **Cloud Storage Services:**
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Blob Storage
   - Cloudinary (includes image optimization)

2. **Implementation Pattern:**
   ```
   Upload Image → Cloud Storage → Return URL → Store URL in DB
   ```

3. **Alternative for Development:**
   - Store images in `public/uploads/` folder
   - Reference as `/uploads/profile_123.jpg`
   - Note: Not recommended for production

### n8n Webhook Endpoints

Your n8n workflow should handle these actions:

```javascript
// Example webhook payload structure
{
  "action": "create" | "update" | "delete" | "fetch_all",
  "data": {
    // Member object for create/update
    // { id } for delete
    // {} for fetch_all
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Expected Responses:

- **create/update/delete**: `{ "success": true, "message": "Operation completed" }`
- **fetch_all**: `{ "success": true, "members": [...] }`

## Indexes for Performance

```sql
-- Recommended indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_members_dob ON members(dob);
CREATE INDEX idx_members_name ON members(name);
```

## Sample Data

```sql
INSERT INTO members (id, name, email, phone, dob, address, emergency_contact, join_date) VALUES
('1', 'John Doe', 'john.doe@example.com', '+1234567890', '1990-05-15', '123 Main St, New York, NY 10001', '+1234567899', '2024-01-15'),
('2', 'Jane Smith', 'jane.smith@example.com', '+1234567891', '1988-08-22', '456 Oak Ave, Los Angeles, CA 90210', '+1234567898', '2024-01-20');
```