# Church Member Management Database Schema (MySQL Compatible)

Below is the finalized schema for a locally hosted MySQL database. It models core member details, phone numbers (normalized), employment, and family relationships. Two helpful SQL views are provided for common queries.

---

## Main members table
```sql
CREATE TABLE members (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title ENUM('Mr', 'Ms', 'Mrs', 'Dr') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    family_name VARCHAR(100),
    dob DATE NOT NULL,
    email VARCHAR(255) UNIQUE,
    baptism_date DATE,
    baptism_church VARCHAR(255),
    baptism_country VARCHAR(100),
    family_status ENUM('Here', 'Origin Country') DEFAULT 'Here',
    carsel VARCHAR(255),
    local_address TEXT,
    church_joining_date DATE NOT NULL,
    profile_pic VARCHAR(500),
    family_photo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (first_name, last_name),
    INDEX idx_family (family_name),
    INDEX idx_joining_date (church_joining_date)
);
```

## Phone numbers (normalized - one member can have multiple phone types)
```sql
CREATE TABLE member_phones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id INT UNSIGNED NOT NULL,
    phone_type ENUM('Primary', 'WhatsApp', 'Emergency', 'Origin Country') NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member_phone_type (member_id, phone_type),
    INDEX idx_member_phones (member_id)
);
```

## Employment information
```sql
CREATE TABLE member_employment (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id INT UNSIGNED NOT NULL,
    company_name VARCHAR(255),
    designation VARCHAR(255),
    profession VARCHAR(255),
    is_employed BOOLEAN DEFAULT FALSE,
    employment_start_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_member_employment (member_id),
    INDEX idx_profession (profession)
);
```

## Family relationships
```sql
CREATE TABLE family_relationships (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id INT UNSIGNED NOT NULL,
    related_member_id INT UNSIGNED NOT NULL,
    relationship_type ENUM('Spouse', 'Child', 'Parent', 'Sibling', 'Other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (related_member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_relationship (member_id, related_member_id, relationship_type),
    INDEX idx_member_relationships (member_id),
    INDEX idx_family_connections (related_member_id)
);
```

## Useful views for common queries
```sql
CREATE VIEW member_summary AS
SELECT 
    m.id,
    CONCAT(m.title, ' ', m.first_name, 
           CASE WHEN m.middle_name IS NOT NULL THEN CONCAT(' ', m.middle_name) ELSE '' END,
           ' ', m.last_name) as full_name,
    m.family_name,
    m.email,
    m.dob,
    m.church_joining_date,
    m.family_status,
    me.is_employed,
    me.company_name,
    me.designation,
    GROUP_CONCAT(CONCAT(mp.phone_type, ': ', mp.phone_number) SEPARATOR ', ') as phone_numbers
FROM members m
LEFT JOIN member_employment me ON m.id = me.member_id AND me.is_current = TRUE
LEFT JOIN member_phones mp ON m.id = mp.member_id AND mp.is_active = TRUE
GROUP BY m.id;
```

## Family tree view
```sql
CREATE VIEW family_tree AS
SELECT 
    m1.id as member_id,
    CONCAT(m1.first_name, ' ', m1.last_name) as member_name,
    fr.relationship_type,
    m2.id as related_member_id,
    CONCAT(m2.first_name, ' ', m2.last_name) as related_member_name,
    m1.family_name
FROM members m1
JOIN family_relationships fr ON m1.id = fr.member_id
JOIN members m2 ON fr.related_member_id = m2.id;
```

---

## n8n webhook actions (suggested):
- CREATE_MEMBER: Insert into members, member_phones, member_employment, and optionally create related members + family_relationships
- UPDATE_MEMBER: Update base member + upsert phones/employment
- DELETE_MEMBER: Cascade delete via FK
- FETCH_ALL_MEMBERS: Return array from member_summary view
- FETCH_MEMBER_DETAILS: Return full joined details for a single member

```
Sample payload for CREATE_MEMBER (frontend → n8n):
{
  "action": "CREATE_MEMBER",
  "data": {
    "member": { "title": "Mr", "first_name": "John", "last_name": "Doe", "dob": "1990-05-15", "email": "john@example.com", "family_status": "Here", "church_joining_date": "2024-01-15" },
    "phones": [
      { "phone_type": "Primary", "phone_number": "+1234567890" },
      { "phone_type": "WhatsApp", "phone_number": "+1234567890" }
    ],
    "employment": { "is_employed": true, "company_name": "Tech Corp", "designation": "Engineer", "profession": "Software", "employment_start_date": "2020-01-01" },
    "relationships": [
      { "relationship_type": "Spouse", "related_member": { "title": "Mrs", "first_name": "Jane", "last_name": "Doe", "dob": "1991-07-01" } },
      { "relationship_type": "Child", "related_member": { "title": "Mr", "first_name": "Alex", "last_name": "Doe", "dob": "2015-06-20" } }
    ]
  }
}
```