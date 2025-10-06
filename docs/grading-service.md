# Grading Service - Comprehensive Documentation

> **Ready for Development** | **Infrastructure Prepared** | **Automated Grading** | **October 2025**

## Table of Contents

1. [Service Overview](#service-overview)
2. [Architecture & Design](#architecture--design)
3. [Planned Feature Implementation](#planned-feature-implementation)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Grading Algorithms](#grading-algorithms)
7. [Security & Authorization](#security--authorization)
8. [Integration Strategy](#integration-strategy)
9. [Deployment Guide](#deployment-guide)
10. [Performance Requirements](#performance-requirements)
11. [Development Roadmap](#development-roadmap)

---

## Service Overview

The Grading Service is the automated evaluation engine for the Pediafor Assessment Platform. It will handle the intelligent scoring of student submissions, providing immediate feedback and detailed grading breakdowns for multiple question types.

### 🎯 Primary Responsibilities (Planned)
- **Automated Grading**: Intelligent scoring for multiple-choice, true/false, and short-answer questions
- **Partial Credit**: Advanced algorithms for partial credit assignment
- **Performance Analytics**: Student performance tracking and statistical analysis
- **Feedback Generation**: Automated feedback based on answer patterns
- **Grade Management**: Comprehensive grade storage and retrieval
- **Batch Processing**: High-volume grading for institutional deployments

### 🏗️ Service Architecture (Planned)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gateway       │    │   Grading       │    │   PostgreSQL    │
│   Service       │    │   Service       │    │   Database      │
│                 │    │                 │    │                 │
│ - Route Auth    │◄──►│ - Auto Grading  │◄──►│ - Grades        │
│ - Token Verify  │    │ - Analytics     │    │ - Rubrics       │
│ - Load Balance  │    │ - Batch Proc.   │    │ - Statistics    │
│                 │    │ - ML Engine     │    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                      │
        │                        │                      │
   Port :3000               Port :4003              Port :5435
   (Public API)              (Internal)              (Private)
```

### 🔄 Service Dependencies (Planned)

#### Upstream Dependencies
- **Submission Service**: Student responses and submission metadata
- **Assessment Service**: Question data, answer keys, and grading rubrics
- **User Service**: User context for authorization and audit logging

#### Downstream Dependencies  
- **Analytics Service**: Performance data for institutional reporting (future)
- **Notification Service**: Grade notification delivery (future)
- **Report Service**: Grade reporting and transcript generation (future)

---

## Architecture & Design

### Domain Model (Planned)

```typescript
// Core grading entities
Grade {
  id: string
  submissionId: string    // Reference to submission
  assessmentId: string    // Reference to assessment
  userId: string         // Student being graded
  totalScore: number     // Total points earned
  maxScore: number       // Maximum possible points
  percentage: number     // Calculated percentage
  gradedAt: Date        // Grading timestamp
  gradedBy?: string     // Manual grader (if applicable)
  feedback?: string     // Optional feedback
  
  questionGrades: QuestionGrade[]
}

// Question-level grading detail
QuestionGrade {
  id: string
  gradeId: string
  questionId: string
  pointsEarned: number
  maxPoints: number
  isCorrect: boolean
  feedback?: string
  algorithm: string      // Grading algorithm used
}

// Grading rubric definition
GradingRubric {
  id: string
  assessmentId: string
  questionId: string
  correctAnswers: JSON   // Expected answers
  partialCreditRules: JSON
  feedbackTemplates: JSON
}
```

### Grading Algorithms (Planned)

#### Multiple Choice Questions
- **Binary Scoring**: Correct = full points, incorrect = 0 points
- **Penalty Scoring**: Subtract points for incorrect answers
- **Confidence Weighting**: Adjust scores based on confidence levels

#### Partial Credit Algorithms
- **Linear Partial Credit**: Proportional scoring based on correctness
- **Exponential Partial Credit**: Weighted scoring favoring complete answers
- **Custom Rubrics**: Instructor-defined scoring rules

#### Advanced Grading Features
- **Pattern Recognition**: Identify common correct answer variations
- **Spelling Tolerance**: Accept minor spelling variations in text answers
- **Numerical Tolerance**: Handle rounding and precision in numerical answers
- **Machine Learning**: Adaptive grading based on historical patterns

---

## Planned Feature Implementation

### ✅ Infrastructure Ready

#### Service Foundation
- **Database Schema**: Complete grade and rubric models designed
- **Docker Configuration**: Container setup prepared for deployment
- **API Structure**: RESTful endpoint design planned
- **Integration Points**: Submission and Assessment service interfaces defined

### 🔄 Core Features (To Implement)

#### Automated Grading Engine
```typescript
interface GradingEngine {
  gradeSubmission(submissionId: string): Promise<Grade>;
  gradeQuestion(answer: any, rubric: GradingRubric): Promise<QuestionGrade>;
  applyPartialCredit(answer: any, rules: PartialCreditRules): number;
  generateFeedback(grade: QuestionGrade): string;
}
```

#### Batch Processing System
```typescript
interface BatchProcessor {
  processAssessment(assessmentId: string): Promise<BatchResult>;
  processSubmissions(submissionIds: string[]): Promise<Grade[]>;
  scheduleGrading(config: GradingSchedule): Promise<JobId>;
  getProgress(jobId: JobId): Promise<GradingProgress>;
}
```

#### Analytics Engine
```typescript
interface AnalyticsEngine {
  getStudentPerformance(userId: string): Promise<PerformanceMetrics>;
  getAssessmentStatistics(assessmentId: string): Promise<AssessmentStats>;
  getQuestionAnalysis(questionId: string): Promise<QuestionAnalytics>;
  generateReports(config: ReportConfig): Promise<Report>;
}
```

---

## API Documentation (Planned)

### Core Endpoints

#### Grading Operations

**Grade Single Submission**
```http
POST /api/grades/submissions/{submissionId}/grade
Headers: x-user-id, x-user-role
Content-Type: application/json

{
  "algorithm": "standard",
  "partialCredit": true,
  "feedbackLevel": "detailed"
}

Response: 201 Created
{
  "id": "grade-789",
  "submissionId": "submission-456",
  "totalScore": 85,
  "maxScore": 100,
  "percentage": 85.0,
  "gradedAt": "2025-10-06T...",
  "questionGrades": [
    {
      "questionId": "q1",
      "pointsEarned": 10,
      "maxPoints": 10,
      "isCorrect": true,
      "feedback": "Excellent work!"
    }
  ]
}
```

**Get Grade for Submission**
```http
GET /api/grades/submissions/{submissionId}
Headers: x-user-id, x-user-role

Response: 200 OK
{
  "id": "grade-789",
  "totalScore": 85,
  "maxScore": 100,
  "percentage": 85.0,
  "feedback": "Good work overall. Review question 3 for improvement.",
  "questionGrades": [/* detailed breakdown */]
}
```

**Batch Grade Assessment**
```http
POST /api/grades/assessments/{assessmentId}/batch-grade
Headers: x-user-id, x-user-role

{
  "algorithm": "standard",
  "notifyStudents": true,
  "generateReports": true
}

Response: 202 Accepted
{
  "jobId": "batch-job-123",
  "status": "queued",
  "totalSubmissions": 150,
  "estimatedDuration": 300
}
```

#### Analytics Operations

**Assessment Statistics**
```http
GET /api/grades/assessments/{assessmentId}/statistics
Headers: x-user-id, x-user-role

Response: 200 OK
{
  "totalGraded": 145,
  "averageScore": 82.3,
  "standardDeviation": 12.5,
  "distribution": {
    "A": 28,
    "B": 52,
    "C": 35,
    "D": 18,
    "F": 12
  },
  "questionAnalysis": [
    {
      "questionId": "q1",
      "correctRate": 0.85,
      "averageTime": 45,
      "difficulty": "medium"
    }
  ]
}
```

**Student Performance Summary**
```http
GET /api/grades/students/{studentId}/performance
Headers: x-user-id, x-user-role

Response: 200 OK
{
  "studentId": "student-123",
  "overallGPA": 3.2,
  "totalAssessments": 15,
  "averageScore": 78.5,
  "trends": {
    "improving": true,
    "consistencyScore": 0.75
  },
  "strengths": ["Problem Solving", "Analysis"],
  "weaknesses": ["Mathematical Concepts"],
  "recentGrades": [/* last 10 grades */]
}
```

#### Rubric Management

**Create Grading Rubric**
```http
POST /api/grades/rubrics
Headers: x-user-id, x-user-role
Content-Type: application/json

{
  "assessmentId": "assessment-123",
  "questionId": "q1",
  "correctAnswers": ["B", "C"],
  "partialCreditRules": {
    "oneCorrect": 0.5,
    "bothCorrect": 1.0
  },
  "feedbackTemplates": {
    "correct": "Excellent!",
    "partial": "Good start, but review the material.",
    "incorrect": "Please review this topic."
  }
}

Response: 201 Created
{
  "id": "rubric-456",
  "assessmentId": "assessment-123",
  "questionId": "q1",
  // ... rubric details
}
```

---

## Database Schema (Planned)

### Core Tables

#### Grades Table
```sql
CREATE TABLE "Grade" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "submissionId" TEXT UNIQUE REFERENCES "Submission"("id") ON DELETE CASCADE,
  "assessmentId" TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "totalScore"   DOUBLE PRECISION NOT NULL,
  "maxScore"     DOUBLE PRECISION NOT NULL,
  "percentage"   DOUBLE PRECISION NOT NULL,
  "feedback"     TEXT,
  "gradedBy"     TEXT,
  "gradedAt"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "algorithm"    TEXT NOT NULL DEFAULT 'standard',
  "metadata"     JSONB,
  
  CONSTRAINT "Grade_percentage_check" CHECK ("percentage" >= 0 AND "percentage" <= 100)
);

CREATE INDEX "Grade_userId_idx" ON "Grade"("userId");
CREATE INDEX "Grade_assessmentId_idx" ON "Grade"("assessmentId");
CREATE INDEX "Grade_gradedAt_idx" ON "Grade"("gradedAt");
```

#### Question Grades Table
```sql
CREATE TABLE "QuestionGrade" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "gradeId"      TEXT REFERENCES "Grade"("id") ON DELETE CASCADE,
  "questionId"   TEXT NOT NULL,
  "pointsEarned" DOUBLE PRECISION NOT NULL,
  "maxPoints"    DOUBLE PRECISION NOT NULL,
  "isCorrect"    BOOLEAN NOT NULL,
  "feedback"     TEXT,
  "algorithm"    TEXT NOT NULL,
  "metadata"     JSONB,
  
  CONSTRAINT "QuestionGrade_points_check" CHECK ("pointsEarned" >= 0 AND "pointsEarned" <= "maxPoints")
);

CREATE INDEX "QuestionGrade_gradeId_idx" ON "QuestionGrade"("gradeId");
CREATE INDEX "QuestionGrade_questionId_idx" ON "QuestionGrade"("questionId");
```

#### Grading Rubrics Table
```sql
CREATE TABLE "GradingRubric" (
  "id"                  TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "assessmentId"        TEXT NOT NULL,
  "questionId"          TEXT NOT NULL,
  "correctAnswers"      JSONB NOT NULL,
  "partialCreditRules"  JSONB,
  "feedbackTemplates"   JSONB,
  "algorithm"           TEXT NOT NULL DEFAULT 'standard',
  "createdBy"           TEXT NOT NULL,
  "createdAt"           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "GradingRubric_assessment_question_unique" UNIQUE("assessmentId", "questionId")
);

CREATE INDEX "GradingRubric_assessmentId_idx" ON "GradingRubric"("assessmentId");
```

#### Performance Analytics Table
```sql
CREATE TABLE "PerformanceMetric" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"       TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "metricType"   TEXT NOT NULL,
  "value"        DOUBLE PRECISION NOT NULL,
  "percentile"   DOUBLE PRECISION,
  "calculatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "metadata"     JSONB
);

CREATE INDEX "PerformanceMetric_userId_idx" ON "PerformanceMetric"("userId");
CREATE INDEX "PerformanceMetric_assessmentId_idx" ON "PerformanceMetric"("assessmentId");
CREATE INDEX "PerformanceMetric_metricType_idx" ON "PerformanceMetric"("metricType");
```

---

## Grading Algorithms (Detailed)

### Algorithm Architecture

```typescript
interface GradingAlgorithm {
  name: string;
  version: string;
  grade(answer: StudentAnswer, expected: ExpectedAnswer): QuestionGrade;
  supportsPartialCredit: boolean;
  supportedQuestionTypes: QuestionType[];
}

// Standard multiple choice algorithm
class MultipleChoiceAlgorithm implements GradingAlgorithm {
  name = "multiple-choice-standard";
  version = "1.0.0";
  supportsPartialCredit = true;
  supportedQuestionTypes = [QuestionType.MULTIPLE_CHOICE, QuestionType.SINGLE_CHOICE];
  
  grade(answer: StudentAnswer, expected: ExpectedAnswer): QuestionGrade {
    const correctAnswers = expected.correctAnswers as string[];
    const studentAnswers = answer.value as string[];
    
    if (this.isExactMatch(studentAnswers, correctAnswers)) {
      return this.createGrade(expected.maxPoints, expected.maxPoints, true);
    }
    
    if (this.supportsPartialCredit && expected.partialCreditRules) {
      return this.calculatePartialCredit(studentAnswers, correctAnswers, expected);
    }
    
    return this.createGrade(0, expected.maxPoints, false);
  }
  
  private calculatePartialCredit(
    student: string[], 
    correct: string[], 
    expected: ExpectedAnswer
  ): QuestionGrade {
    const intersection = student.filter(x => correct.includes(x));
    const union = [...new Set([...student, ...correct])];
    
    // Jaccard similarity coefficient
    const similarity = intersection.length / union.length;
    const partialPoints = similarity * expected.maxPoints;
    
    return this.createGrade(partialPoints, expected.maxPoints, similarity === 1);
  }
}
```

### Question Type Support

#### Multiple Choice Questions
- **Single Select**: One correct answer from multiple options
- **Multi Select**: Multiple correct answers from options
- **Partial Credit**: Points based on correctness ratio

#### Numerical Questions
- **Exact Match**: Precise numerical answer required
- **Range Tolerance**: Accept answers within specified range
- **Significant Figures**: Consider precision in grading

#### Text Questions
- **Keyword Matching**: Grade based on key terms presence
- **Similarity Scoring**: Use string similarity algorithms
- **Pattern Recognition**: Support for regular expressions

#### Advanced Question Types (Future)
- **Essay Questions**: AI-powered content analysis
- **Code Submissions**: Automated code evaluation
- **Mathematical Expressions**: Symbolic math evaluation

---

## Security & Authorization (Planned)

### Authentication Integration

```typescript
// User context for grading operations
interface GradingContext extends UserContext {
  permissions: {
    canGrade: boolean;
    canViewAnalytics: boolean;
    canModifyRubrics: boolean;
    canAccessStudentData: boolean;
  };
}
```

### Authorization Matrix

| Operation | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| View Own Grades | ✅ | ❌ | ✅ |
| View All Grades | ❌ | Own assessments only | ✅ |
| Trigger Grading | ❌ | Own assessments only | ✅ |
| Modify Grades | ❌ | Own assessments only | ✅ |
| Create Rubrics | ❌ | ✅ | ✅ |
| View Analytics | Limited | Own assessments only | ✅ |
| Batch Operations | ❌ | Own assessments only | ✅ |

### Data Security

- **Grade Immutability**: Audit trail for all grade changes
- **Access Logging**: Comprehensive logging of grade access
- **Data Encryption**: Sensitive grade data encrypted at rest
- **Anonymization**: Support for anonymous grading workflows
- **Backup & Recovery**: Automated grade data backup systems

---

## Integration Strategy

### Submission Service Integration

```typescript
// Grading trigger from submission service
interface GradingTrigger {
  submissionId: string;
  assessmentId: string;
  priority: 'immediate' | 'standard' | 'batch';
  notification: boolean;
}

// Webhook integration
app.post('/api/grades/webhooks/submission-completed', async (req, res) => {
  const trigger: GradingTrigger = req.body;
  
  // Queue grading job
  const job = await gradingQueue.add('grade-submission', trigger);
  
  res.status(202).json({ jobId: job.id });
});
```

### Assessment Service Integration

```typescript
// Fetch assessment data for grading
interface AssessmentGradingData {
  assessmentId: string;
  questions: QuestionGradingInfo[];
  gradingRules: GradingConfiguration;
  timeConstraints: TimeConstraints;
}

class AssessmentIntegration {
  async getGradingData(assessmentId: string): Promise<AssessmentGradingData> {
    const response = await fetch(`${ASSESSMENT_SERVICE_URL}/api/assessments/${assessmentId}/grading-data`);
    return response.json();
  }
}
```

### Message Queue Integration

```typescript
// Asynchronous grading with Bull/Redis
import Bull from 'bull';

const gradingQueue = new Bull('grading', {
  redis: { host: 'redis', port: 6379 }
});

gradingQueue.process('grade-submission', async (job) => {
  const { submissionId } = job.data;
  
  try {
    const grade = await gradingEngine.gradeSubmission(submissionId);
    await notificationService.notifyGradeComplete(grade);
    return grade;
  } catch (error) {
    throw new Error(`Grading failed: ${error.message}`);
  }
});
```

---

## Performance Requirements

### Response Time Targets

- **Single Submission Grading**: < 500ms for typical assessments
- **Batch Grading**: < 5 minutes for 1000 submissions
- **Analytics Queries**: < 2 seconds for standard reports
- **Real-time Updates**: < 100ms for grade status updates

### Throughput Requirements

- **Concurrent Grading**: 100+ simultaneous grading operations
- **Daily Volume**: 100,000+ submissions per day
- **Peak Load**: 10,000+ submissions per hour during peak times
- **Analytics**: 1,000+ analytics queries per minute

### Scalability Architecture

```typescript
// Horizontal scaling configuration
interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  cpuThreshold: number;
  memoryThreshold: number;
  queueLength: number;
}

// Load balancing strategy
interface LoadBalancer {
  strategy: 'round-robin' | 'least-connections' | 'weighted';
  healthCheck: HealthCheckConfig;
  failover: FailoverConfig;
}
```

---

## Development Roadmap

### Phase 1: Core Implementation (4-6 weeks)

#### Week 1-2: Foundation
- [ ] Service setup and Docker configuration
- [ ] Database schema implementation with Prisma
- [ ] Basic API structure and authentication integration
- [ ] Health check and monitoring endpoints

#### Week 3-4: Core Grading Engine
- [ ] Multiple choice question grading algorithm
- [ ] Basic partial credit implementation
- [ ] Grade storage and retrieval operations
- [ ] Integration with Submission Service

#### Week 5-6: Testing & Integration
- [ ] Comprehensive test suite (target: 90%+ coverage)
- [ ] Assessment Service integration
- [ ] Performance optimization and benchmarking
- [ ] Documentation completion

### Phase 2: Advanced Features (6-8 weeks)

#### Weeks 7-10: Enhanced Algorithms
- [ ] Advanced partial credit algorithms
- [ ] Numerical question grading
- [ ] Text-based question grading
- [ ] Custom rubric system

#### Weeks 11-14: Analytics & Reporting
- [ ] Performance analytics engine
- [ ] Statistical analysis tools
- [ ] Report generation system
- [ ] Dashboard integration

### Phase 3: Production & Optimization (4 weeks)

#### Weeks 15-18: Production Readiness
- [ ] Batch processing optimization
- [ ] High-availability configuration
- [ ] Security audit and hardening
- [ ] Performance tuning and monitoring

### Phase 4: Advanced Features (Future)

#### AI-Powered Grading
- [ ] Natural language processing for essay grading
- [ ] Machine learning model integration
- [ ] Adaptive grading based on patterns
- [ ] Plagiarism detection integration

#### Advanced Analytics
- [ ] Predictive analytics for student performance
- [ ] Learning path recommendations
- [ ] Institutional reporting dashboard
- [ ] Data export and visualization tools

---

## Getting Started (For Developers)

### Prerequisites

- **Node.js**: 18+ with TypeScript support
- **PostgreSQL**: 14+ for database operations
- **Redis**: 6+ for job queues and caching
- **Docker**: For containerized development
- **Access**: Submission Service and Assessment Service APIs

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd grading-service

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Database setup
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Configuration

```env
# Service Configuration
PORT=4003
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5435/grading_db"

# Service Integration
SUBMISSION_SERVICE_URL="http://submission-service:4002"
ASSESSMENT_SERVICE_URL="http://assessment-service:4001"

# Queue Configuration
REDIS_URL="redis://localhost:6379"
QUEUE_CONCURRENCY=10

# Performance
GRADING_TIMEOUT=30000
BATCH_SIZE=100
MAX_RETRIES=3
```

### API Testing

```bash
# Health check
curl http://localhost:4003/api/health

# Grade submission (requires authentication)
curl -X POST http://localhost:4003/api/grades/submissions/sub-123/grade \
  -H "Content-Type: application/json" \
  -H "x-user-id: teacher-456" \
  -H "x-user-role: TEACHER" \
  -d '{"algorithm": "standard", "partialCredit": true}'
```

---

## Contributing

### Development Standards

- **TypeScript**: Strict type checking with comprehensive interfaces
- **Testing**: Minimum 90% test coverage required
- **Documentation**: Complete API documentation with examples
- **Performance**: All operations must meet performance targets
- **Security**: Follow platform security standards

### Contribution Workflow

1. **Issue Creation**: Create GitHub issue for feature/bug
2. **Feature Branch**: Create feature branch from main
3. **Implementation**: Implement feature with tests
4. **Testing**: Ensure all tests pass and coverage targets met
5. **Documentation**: Update API documentation and guides
6. **Code Review**: Submit PR for review
7. **Integration**: Merge after approval and CI passing

### Testing Requirements

```bash
# Unit tests for grading algorithms
npm test -- --testPathPattern=algorithms

# Integration tests for API endpoints
npm test -- --testPathPattern=api

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

---

## Conclusion

The Grading Service represents the next critical component in the Pediafor Assessment Platform, bringing automated evaluation capabilities to complete the assessment workflow. With careful planning and a focus on accuracy, performance, and scalability, this service will enable efficient grading at institutional scale while maintaining the flexibility needed for diverse educational contexts.

**Development Priorities:**
1. **Accuracy First**: Ensure grading algorithms produce reliable, fair results
2. **Performance Focused**: Meet response time and throughput requirements
3. **Integration Ready**: Seamless integration with existing platform services
4. **Future Proof**: Extensible architecture for advanced features
5. **Security Conscious**: Protect sensitive grade data and maintain audit trails

The service design provides a solid foundation for both immediate requirements and future enhancements, ensuring the Pediafor Assessment Platform can evolve with changing educational technology needs.

---

*Documentation created: October 6, 2025*
*Status: Ready for Implementation*
*Dependencies: All required services operational*