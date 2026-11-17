# LifeLink – Smart Blood Donation and Urgent Matching System

## 1. Project Overview

LifeLink is a web-based Smart Blood Donation and Urgent Matching System designed to connect blood donors, patients, hospitals, and blood banks through a centralized platform.

The system aims to make emergency blood requests faster and more efficient by helping identify compatible donors and available blood-bank inventory. It also maintains records of blood requests, donor information, donations, blood inventory, and blood allocations.

The application uses MySQL to manage structured relational data and Neo4j to represent and query graph relationships used in donor matching.

## 2. Objectives

- Develop a centralized platform for blood donors, patients, hospitals, and blood banks.
- Simplify the process of creating and managing emergency blood requests.
- Identify potential donors based on blood-group compatibility and availability.
- Maintain blood-bank inventory and donation records.
- Track donor responses and blood allocations.
- Demonstrate the integration of relational and graph databases in a real-world application.

## 3. Key Features

- User registration and login.
- JWT-based authentication.
- Role-based application access.
- Donor profile management.
- Blood request creation and management.
- Donor discovery and matching using Neo4j.
- Donor response and acceptance workflow.
- Blood-bank inventory management.
- Blood allocation tracking.
- Donation history management.
- Blood request cancellation and status tracking.

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React |
| Programming Language | JavaScript |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| API | REST API |
| Relational Database | MySQL |
| Graph Database | Neo4j |
| Authentication | JSON Web Token (JWT) |
| Version Control | Git and GitHub |

## 5. System Architecture

The application follows a client-server architecture.

```text
             USER
               |
               v
       NEXT.JS FRONTEND
        (React + Tailwind)
               |
               v
        REST API REQUESTS
               |
               v
       NODE.JS + EXPRESS
          BACKEND
               |
        +------+------+
        |             |
        v             v
      MySQL         Neo4j
   Relational      Graph
    Database     Database
```

### Database Responsibilities

**MySQL:**
- Stores user information.
- Maintains donor and hospital records.
- Stores blood requests.
- Manages blood-bank inventory.
- Maintains donation and allocation records.

**Neo4j:**
- Represents relationships between relevant application entities.
- Supports graph-based donor discovery and matching.
- Helps retrieve connected donor and blood-request information.

## 6. Database Design

### 6.1 MySQL Database

Database Name: `lifelink_db`

The MySQL database contains the following 10 tables:

| Table Name | Description |
|---|---|
| users | Stores user account information |
| user_phone | Stores user phone numbers |
| donor | Stores donor-specific information |
| hospital | Stores hospital information |
| blood_bank | Stores blood-bank information |
| blood_inventory | Maintains blood-group-wise inventory |
| blood_request | Stores blood requests |
| blood_allocation | Records blood allocations |
| donation | Maintains donation records |
| match_record | Stores donor matching and response records |

The relational database uses primary keys, foreign keys, unique constraints, and appropriate data types to maintain data integrity.

### 6.2 Neo4j Database

Neo4j is used as the graph database component of LifeLink.

It represents relationships between relevant entities and supports graph-based donor-matching operations.

## 7. Project Structure

```text
LifeLink-Smart-Blood-Donation-System/
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── database/
│
└── README.md
```

## 8. Pr