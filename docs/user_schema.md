# 🧑‍💻 User Schema (v1)

This document defines the **User Schema (v1)** for the **Pediafor Assessment & Evaluation Application**.  
It includes:
- 📌 A sample user JSON  
- 📜 A JSON Schema specification for validation  
- 📖 Detailed field explanations  
- 🔮 Notes on schema evolution  

This schema will evolve with time, but serves as a solid baseline for contributors.

---

## 📌 Sample User JSON

```json
{
  "id": "u-uuid-123",
  "username": "john.doe",
  "email": "john.doe@example.com",
  "hashed_password": "hashed_password_string",
  "roles": ["student"],
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://pediafor.com/avatars/u-uuid-123.png",
    "bio": "Enthusiastic learner of computer science and biology.",
    "institution_id": "inst-uuid-456"
  },
  "settings": {
    "theme": "dark",
    "notifications_enabled": true,
    "language": "en-US"
  },
  "metadata": {
    "created_at": "2024-09-16T12:00:00Z",
    "last_login_at": "2024-09-16T15:30:00Z",
    "is_active": true
  }
}
```

## 📜 JSON Schema (Validation)
This schema can be used to validate user objects in the system.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "User",
  "description": "Pediafor User Schema v1",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier for the user (UUID format)"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 30
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "hashed_password": {
      "type": "string",
      "description": "Hashed password string, never store plain text"
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["student", "teacher", "admin"]
      },
      "minItems": 1
    },
    "profile": {
      "type": "object",
      "properties": {
        "first_name": { "type": "string" },
        "last_name": { "type": "string" },
        "avatar_url": { "type": "string", "format": "uri" },
        "bio": { "type": "string", "maxLength": 500 },
        "institution_id": { "type": "string" }
      },
      "required": ["first_name", "last_name"]
    },
    "settings": {
      "type": "object",
      "properties": {
        "theme": { "type": "string", "enum": ["light", "dark", "system"] },
        "notifications_enabled": { "type": "boolean" },
        "language": { "type": "string" }
      },
      "required": ["theme", "notifications_enabled", "language"]
    },
    "metadata": {
      "type": "object",
      "properties": {
        "created_at": { "type": "string", "format": "date-time" },
        "last_login_at": { "type": "string", "format": "date-time" },
        "is_active": { "type": "boolean" }
      },
      "required": ["created_at", "is_active"]
    }
  },
  "required": ["id", "username", "email", "hashed_password", "roles", "profile", "settings", "metadata"]
}
```

## 📖 Explanation of Fields

### 🔑 Core Identity
- **id** → Unique UUID for the user.
- **username** → User’s unique identifier for login & display.
- **email** → Required for authentication, password reset, and notifications.
- **hashed_password** → Securely hashed password.
- **roles** → Defines user permissions:
  - `student` → Learner role
  - `teacher` → Instructor role
  - `admin` → System administrator

### 👤 Profile
- **first_name** / **last_name** → Basic identification.
- **avatar_url** → Optional profile image.
- **bio** → Short description, max 500 characters.
- **institution_id** → Links user to an institution (school/university).

### ⚙️ Settings
- **theme** → "light", "dark", or "system".
- **notifications_enabled** → Boolean flag.
- **language** → User’s language preference ("en-US", "fr-FR", etc.).

### 📊 Metadata
- **created_at** → ISO 8601 datetime of account creation.
- **last_login_at** → Last time the user logged in.
- **is_active** → Boolean to suspend/reactivate accounts.

## 🔮 Future Evolution
This schema will expand in future versions:

- 🔐 MFA, OAuth, biometric login.
- 🏫 Education-specific → enrollments, achievements, badges.
- 🌍 Internationalization → RTL scripts, timezone handling.
- 📜 Compliance → parental consent, GDPR/FERPA.
- 🤖 AI → learning style preferences, adaptive learning profiles.

