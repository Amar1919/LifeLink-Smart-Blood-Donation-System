
// ============================================================
// LIFELINK - SMART BLOOD DONATION SYSTEM
// NEO4J GRAPH DATABASE SETUP
// Database: lifelink
// ============================================================


// ============================================================
// SECTION 1: UNIQUENESS CONSTRAINTS
// ============================================================

CREATE CONSTRAINT donor_id_unique IF NOT EXISTS
FOR (d:Donor)
REQUIRE d.donorId IS UNIQUE;

CREATE CONSTRAINT request_id_unique IF NOT EXISTS
FOR (r:BloodRequest)
REQUIRE r.requestId IS UNIQUE;

CREATE CONSTRAINT blood_group_unique IF NOT EXISTS
FOR (b:BloodGroup)
REQUIRE b.name IS UNIQUE;

CREATE CONSTRAINT hospital_id_unique IF NOT EXISTS
FOR (h:Hospital)
REQUIRE h.hospitalId IS UNIQUE;

CREATE CONSTRAINT blood_bank_id_unique IF NOT EXISTS
FOR (b:BloodBank)
REQUIRE b.bloodBankId IS UNIQUE;

CREATE CONSTRAINT location_unique IF NOT EXISTS
FOR (l:Location)
REQUIRE (l.city, l.state) IS UNIQUE;


// ============================================================
// SECTION 2: CREATE BLOOD GROUP NODES
// ============================================================

UNWIND ['O+', 'A+', 'B+'] AS groupName
MERGE (:BloodGroup {name: groupName});


// ============================================================
// SECTION 3: CREATE DONOR NODES
// ============================================================

MERGE (d1:Donor {donorId: 1})
SET
    d1.name = 'Rahul Sharma',
    d1.bloodGroup = 'O+',
    d1.city = 'Bangalore',
    d1.state = 'Karnataka',
    d1.available = true;

MERGE (d2:Donor {donorId: 2})
SET
    d2.name = 'Arjun Kumar',
    d2.bloodGroup = 'A+',
    d2.city = 'Mysore',
    d2.state = 'Karnataka',
    d2.available = true;

MERGE (d3:Donor {donorId: 3})
SET
    d3.name = 'Sneha Rao',
    d3.bloodGroup = 'B+',
    d3.city = 'Bangalore',
    d3.state = 'Karnataka',
    d3.available = false;


// ============================================================
// SECTION 4: CREATE BLOOD REQUEST NODES
// ============================================================

MERGE (r1:BloodRequest {requestId: 1})
SET
    r1.patientName = 'Priya Patil',
    r1.requiredBloodGroup = 'O+',
    r1.unitsRequired = 2,
    r1.urgencyLevel = 'HIGH',
    r1.status = 'PENDING',
    r1.city = 'Bangalore',
    r1.state = 'Karnataka';

MERGE (r2:BloodRequest {requestId: 2})
SET
    r2.patientName = 'Priya Patil',
    r2.requiredBloodGroup = 'A+',
    r2.unitsRequired = 3,
    r2.urgencyLevel = 'MEDIUM',
    r2.status = 'PENDING',
    r2.city = 'Bangalore',
    r2.state = 'Karnataka';


// ============================================================
// SECTION 5: CREATE HOSPITAL NODES
// ============================================================

MERGE (h1:Hospital {hospitalId: 1})
SET
    h1.name = 'Manipal Hospital',
    h1.city = 'Bangalore',
    h1.state = 'Karnataka';

MERGE (h2:Hospital {hospitalId: 2})
SET
    h2.name = 'Apollo Hospital',
    h2.city = 'Bangalore',
    h2.state = 'Karnataka';


// ============================================================
// SECTION 6: CREATE BLOOD BANK NODES
// ============================================================

MERGE (b1:BloodBank {bloodBankId: 1})
SET
    b1.name = 'Red Cross Blood Bank',
    b1.contactNumber = '9876543212',
    b1.city = 'Bangalore',
    b1.state = 'Karnataka',
    b1.pincode = '560001';

MERGE (b2:BloodBank {bloodBankId: 2})
SET
    b2.name = 'LifeCare Blood Bank',
    b2.contactNumber = '9876543213',
    b2.city = 'Mysore',
    b2.state = 'Karnataka',
    b2.pincode = '570001';


// ============================================================
// SECTION 7: CREATE LOCATION NODES
// ============================================================

UNWIND [
    {city: 'Bangalore', state: 'Karnataka'},
    {city: 'Mysore', state: 'Karnataka'}
] AS location
MERGE (:Location {
    city: location.city,
    state: location.state
});


// ============================================================
// SECTION 8: DONOR - BLOOD GROUP RELATIONSHIPS
// ============================================================

MATCH (d:Donor)
MATCH (b:BloodGroup {name: d.bloodGroup})
MERGE (d)-[:HAS_BLOOD_GROUP]->(b);


// ============================================================
// SECTION 9: BLOOD REQUEST - BLOOD GROUP RELATIONSHIPS
// ============================================================

MATCH (r:BloodRequest)
MATCH (b:BloodGroup {name: r.requiredBloodGroup})
MERGE (r)-[:REQUIRES]->(b);


// ============================================================
// SECTION 10: DONOR - LOCATION RELATIONSHIPS
// ============================================================

MATCH (d:Donor)
MATCH (l:Location {
    city: d.city,
    state: d.state
})
MERGE (d)-[:LOCATED_IN]->(l);


// ============================================================
// SECTION 11: BLOOD BANK - LOCATION RELATIONSHIPS
// ============================================================

MATCH (b:BloodBank)
MATCH (l:Location {
    city: b.city,
    state: b.state
})
MERGE (b)-[:LOCATED_IN]->(l);


// ============================================================
// SECTION 12: BLOOD REQUEST - HOSPITAL RELATIONSHIPS
// ============================================================

MATCH (r:BloodRequest {requestId: 1})
MATCH (h:Hospital {hospitalId: 1})
MERGE (r)-[:REQUESTED_AT]->(h);

MATCH (r:BloodRequest {requestId: 2})
MATCH (h:Hospital {hospitalId: 2})
MERGE (r)-[:REQUESTED_AT]->(h);


// ============================================================
// SECTION 13: DONOR MATCHING RELATIONSHIPS
// ============================================================

MATCH (d:Donor), (r:BloodRequest)
WHERE d.bloodGroup = r.requiredBloodGroup
AND d.available = true

MERGE (d)-[m:MATCHED_WITH]->(r)
ON CREATE SET
    m.matchType = 'EXACT_BLOOD_GROUP',
    m.createdAt = datetime();


// ============================================================
// SECTION 14: DONOR DISCOVERY QUERY
// BLOOD GROUP + AVAILABILITY + LOCATION
// ============================================================

MATCH (d:Donor)-[:LOCATED_IN]->(l:Location)
MATCH (r:BloodRequest)
WHERE d.available = true
AND d.bloodGroup = r.requiredBloodGroup
AND l.city = r.city

RETURN
    r.requestId AS RequestID,
    r.patientName AS Patient,
    r.urgencyLevel AS Urgency,
    r.requiredBloodGroup AS RequiredBloodGroup,
    d.name AS DonorName,
    d.bloodGroup AS DonorBloodGroup,
    l.city AS DonorCity

ORDER BY
    CASE r.urgencyLevel
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
        ELSE 4
    END;


// ============================================================
// SECTION 15: VERIFY NODE COUNTS
// ============================================================

MATCH (n)
RETURN
    labels(n) AS NodeType,
    count(n) AS TotalNodes
ORDER BY NodeType;


// ============================================================
// SECTION 16: VERIFY RELATIONSHIP COUNTS
// ============================================================

MATCH ()-[r]->()
RETURN
    type(r) AS Relationship,
    count(r) AS TotalRelationships
ORDER BY Relationship;


// ============================================================
// SECTION 17: VERIFY UNIQUENESS CONSTRAINTS
// ============================================================

SHOW CONSTRAINTS;


// ============================================================
// END OF LIFELINK NEO4J SETUP
// ============================================================
