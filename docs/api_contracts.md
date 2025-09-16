# 📡 Pediafor V1 API Contracts

This document defines the **planned API contracts** for the initial release of the **Pediafor Assessment & Evaluation** application.  
It specifies the endpoints and events for each microservice, ensuring **clear communication and consistency** across the system.

---

## 1. Auth Service
**Purpose:** Manages user authentication, authorization, and user profiles.  

### API Endpoints
- `POST /register` → Creates a new user account.  
- `POST /login` → Authenticates a user and returns an access token.  
- `POST /logout` → Invalidates a user session token.  
- `POST /request-password-reset` → Initiates a password reset process.  
- `POST /password-reset` → Completes the password reset.  
- `GET /me` → Retrieves the currently authenticated user’s profile.  
- `GET /users/{user_id}` → Retrieves a user’s public profile (e.g., name, role).  
- `POST /internal/validate-token` → (Internal API) Validates a token for other microservices.  
- `PUT /users/{user_id}/role` → (Admin) Updates a user’s role.  

### Events (Produced)
- `user_registered` → Fired when a new user signs up.  
- `user_deleted` → Fired when a user account is removed.  

---

## 2. Assessments Service
**Purpose:** Handles exams, questions, and student submissions.  

### API Endpoints
- `POST /assessments` → Creates a new assessment.  
- `GET /assessments/{assessment_id}` → Retrieves a specific assessment and its questions.  
- `PUT /assessments/{assessment_id}` → Updates an existing assessment.  
- `DELETE /assessments/{assessment_id}` → Deletes an assessment.  
- `POST /assessments/{assessment_id}/submit` → Submits a student’s completed exam.  
- `GET /assessments/{assessment_id}/grades` → Retrieves grades for a specific assessment.  

### Events (Produced)
- `assessment_submitted` → Fired when a student submission is received.  

### Events (Consumed)
- `grade_updated` → Consumed from the Grading Service to update final grades.  

---

## 3. Grading Service
**Purpose:** Grades student submissions, including long-running AI-driven evaluations.  
This service is **event-driven only** and does not expose public APIs.  

### Events (Produced)
- `grade_updated` → Fired when a submission has been graded (carries student ID, assessment ID, and grade).  

### Events (Consumed)
- `assessment_submitted` → Listens for new submissions to begin grading.  
- `retake_requested` → (Planned Feature) Listens for re-grade requests.  

---

## 4. Analytics Service
**Purpose:** Aggregates and analyzes data for dashboards and reports.  

### API Endpoints
- `GET /analytics/students/{user_id}` → Retrieves analytics dashboard for a student.  
- `GET /analytics/assessments/{assessment_id}` → Retrieves analytics dashboard for an assessment.  

### Events (Consumed)
- `user_registered` → Tracks user growth.  
- `grade_updated` → Updates student and assessment performance analytics.  

---

## 🔄 Service Communication Overview
- **Auth → All Services**: Provides token validation via `/internal/validate-token`.  
- **Assessments → Grading**: Sends `assessment_submitted` events for grading.  
- **Grading → Assessments & Analytics**: Publishes `grade_updated` events.  
- **Analytics**: Consumes `user_registered` and `grade_updated` to maintain insights.  

