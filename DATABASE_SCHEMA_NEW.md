# Complex Database Schema for Member Management System

## Table Structure Overview

This schema separates member information into logical tables for better data organization and normalization.

## 1. Members (Primary Table)

```sql
CREATE TABLE members (
    id VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    marital_status ENUM('single', 'married', 'divorced', 'widowed') NOT NULL,
    profile_pic VARCHAR(500),
    join_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 2. Member Addresses

```sql
CREATE TABLE member_addresses (
    id VARCHAR(255) PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    address_type ENUM('home', 'work', 'mailing') NOT NULL,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## 3. Emergency Contacts

```sql
CREATE TABLE emergency_contacts (
    id VARCHAR(255) PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## 4. Family Members

```sql
CREATE TABLE family_members (
    id VARCHAR(255) PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    family_member_name VARCHAR(255) NOT NULL,
    relationship ENUM('spouse', 'child', 'parent', 'sibling', 'other') NOT NULL,
    dob DATE,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## 5. Employment Information

```sql
CREATE TABLE member_employment (
    id VARCHAR(255) PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    employment_type ENUM('full_time', 'part_time', 'contract', 'freelance', 'retired', 'unemployed') NOT NULL,
    start_date DATE,
    end_date DATE,
    salary_range ENUM('below_30k', '30k_50k', '50k_75k', '75k_100k', 'above_100k'),
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## 6. Member Skills & Interests

```sql
CREATE TABLE member_skills (
    id VARCHAR(255) PRIMARY KEY,
    member_id VARCHAR(255) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
    category ENUM('technical', 'professional', 'hobby', 'language', 'other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## Indexes for Performance

```sql
-- Primary table indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_join_date ON members(join_date);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_name ON members(first_name, last_name);

-- Foreign key indexes
CREATE INDEX idx_addresses_member_id ON member_addresses(member_id);
CREATE INDEX idx_emergency_contacts_member_id ON emergency_contacts(member_id);
CREATE INDEX idx_family_members_member_id ON family_members(member_id);
CREATE INDEX idx_employment_member_id ON member_employment(member_id);
CREATE INDEX idx_skills_member_id ON member_skills(member_id);

-- Specific query indexes
CREATE INDEX idx_addresses_primary ON member_addresses(member_id, is_primary);
CREATE INDEX idx_emergency_primary ON emergency_contacts(member_id, is_primary);
CREATE INDEX idx_employment_current ON member_employment(member_id, is_current);
```

## n8n Webhook Integration

### Expected Webhook Actions:

1. **CREATE_MEMBER**: Creates member with all related data
2. **UPDATE_MEMBER**: Updates member and related tables
3. **DELETE_MEMBER**: Deletes member and cascades to related tables
4. **FETCH_ALL_MEMBERS**: Returns complete member data with joins
5. **FETCH_MEMBER_DETAILS**: Returns full details for a specific member

### Sample Webhook Payload for CREATE_MEMBER:

```json
{
  "action": "CREATE_MEMBER",
  "data": {
    "member": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "dob": "1990-05-15",
      "gender": "male",
      "marital_status": "married"
    },
    "addresses": [
      {
        "address_type": "home",
        "street_address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA",
        "is_primary": true
      }
    ],
    "emergency_contacts": [
      {
        "contact_name": "Jane Doe",
        "relationship": "spouse",
        "phone": "+1234567891",
        "email": "jane.doe@example.com",
        "is_primary": true
      }
    ],
    "family_members": [
      {
        "family_member_name": "Jane Doe",
        "relationship": "spouse",
        "dob": "1992-08-22",
        "phone": "+1234567891",
        "email": "jane.doe@example.com"
      }
    ],
    "employment": {
      "company_name": "Tech Corp",
      "job_title": "Software Engineer",
      "department": "Engineering",
      "employment_type": "full_time",
      "start_date": "2020-01-15",
      "salary_range": "75k_100k",
      "is_current": true
    },
    "skills": [
      {
        "skill_name": "JavaScript",
        "skill_level": "advanced",
        "category": "technical"
      },
      {
        "skill_name": "Project Management",
        "skill_level": "intermediate",
        "category": "professional"
      }
    ]
  }
}
```

### Expected Response Format:

```json
{
  "success": true,
  "message": "Member created successfully",
  "member_id": "generated-uuid",
  "data": {
    // Complete member object with all related data
  }
}
```

## Sample Complete Member Data Structure

The frontend will work with this flattened structure for easier form handling:

```json
{
  "id": "member-123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dob": "1990-05-15",
  "gender": "male",
  "marital_status": "married",
  "join_date": "2024-01-15",
  "status": "active",
  "addresses": [...],
  "emergency_contacts": [...],
  "family_members": [...],
  "employment": {...},
  "skills": [...]
}
```