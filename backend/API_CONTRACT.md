# LifeLink API Contract (Proposal)

## 1. Authentication
* **POST /api/auth/register**
  * **Auth:** Public
  * **Request:** `{ "firstName": "Ullas", "lastName": "T", "email": "ullas@example.com", "password": "secure123", "role": "DONOR", "city": "Bengaluru", "state": "Karnataka" }`
  * **Response (201):** `{ "message": "User registered successfully", "userId": 1 }`

* **POST /api/auth/login**
  * **Auth:** Public
  * **Request:** `{ "email": "ullas@example.com", "password": "secure123" }`
  * **Response (200):** `{ "token": "jwt_token_here", "user": { "id": 1, "role": "DONOR" } }`
