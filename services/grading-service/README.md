# Grading Service

[![Build Status](https://img.shields.io/badge/Build-Ready%20for%20Development-yellow)](.)
[![Status](https://img.shields.io/badge/Status-Infrastructure%20Prepared-blue)](.)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=nodedotjs)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue?logo=typescript)](.)

The **Grading Service** is a microservice in the Pediafor Assessment Platform responsible for automated grading of student submissions, scoring calculations, and grade management.

## 🎯 Purpose

This service will handle:
- **Automated Grading**: Multiple-choice question scoring with immediate feedback
- **Partial Credit**: Advanced scoring algorithms for complex question types
- **Grade Management**: Grade storage, retrieval, and analytics
- **Performance Analytics**: Student performance insights and statistical analysis
- **Integration**: Seamless integration with Submission Service and Assessment Service

## 🏗️ Planned Architecture

### **Core Features (Planned)**
- **Multiple Choice Grading**: Automated scoring for MCQ assessments
- **Scoring Algorithms**: Configurable partial credit and penalty systems
- **Grade Book**: Comprehensive grade storage and retrieval
- **Analytics Engine**: Performance metrics and statistical analysis
- **Real-time Processing**: Immediate grading upon submission
- **Batch Processing**: Bulk grading for large assessments

### **Database Schema (Planned)**
```typescript
model Grade {
  id              String    @id @default(cuid())
  submissionId    String    // Reference to submission
  assessmentId    String    // Reference to assessment
  userId          String    // Student being graded
  totalScore      Float     // Total points earned
  maxScore        Float     // Maximum possible points
  percentage      Float     // Calculated percentage
  gradedAt        DateTime  @default(now())
  gradedBy        String?   // User who graded (if manual)
  feedback        String?   // Optional feedback
  
  // Question-level breakdown
  questionGrades  QuestionGrade[]
  
  @@unique([submissionId])
}

model QuestionGrade {
  id          String  @id @default(cuid())
  gradeId     String
  questionId  String
  pointsEarned Float
  maxPoints   Float
  isCorrect   Boolean
  feedback    String?
  
  grade       Grade   @relation(fields: [gradeId], references: [id])
}
```

### **API Endpoints (Planned)**
```typescript
// Grading Operations
POST   /api/grades/submissions/:id/grade    // Grade a submission
GET    /api/grades/submissions/:id          // Get grade for submission
PUT    /api/grades/:id                      // Update grade (manual adjustments)

// Analytics
GET    /api/grades/assessment/:id/stats     // Assessment grading statistics
GET    /api/grades/student/:id/summary      // Student performance summary
GET    /api/grades/analytics                // Institutional analytics

// Batch Operations
POST   /api/grades/batch/grade              // Batch grade multiple submissions
GET    /api/grades/export/:assessmentId     // Export grades to CSV
```

## 🚀 Integration Points

### **Submission Service Integration**
- **Trigger**: Automatic grading when submission status changes to "SUBMITTED"
- **Data Flow**: Retrieve student answers from submission service
- **Response**: Update submission with calculated score and grade breakdown

### **Assessment Service Integration**
- **Question Data**: Retrieve question types, correct answers, and scoring rules
- **Rubrics**: Access grading rubrics and partial credit configurations
- **Meta Information**: Assessment settings, time limits, and grading policies

### **User Service Integration**
- **Authentication**: Verify teacher/admin permissions for manual grading
- **Student Data**: Access student information for grade reporting
- **Role Management**: Enforce grading permissions based on user roles

## 🧪 Testing Strategy (Planned)

### **Test Categories**
- **Unit Tests**: Grading algorithms, scoring calculations, validation logic
- **Integration Tests**: Service-to-service communication, database operations
- **Performance Tests**: High-volume grading, concurrent processing
- **Accuracy Tests**: Grading algorithm correctness with known answer sets

### **Test Coverage Goals**
- **Grading Algorithms**: 100% coverage for all scoring logic
- **API Endpoints**: Complete request/response validation
- **Error Handling**: Comprehensive error scenarios and edge cases
- **Performance**: Load testing for institutional-scale deployments

## ⚙️ Configuration (Planned)

### **Grading Configuration**
```typescript
interface GradingConfig {
  // Multiple Choice Settings
  mcq: {
    correctWeight: number;      // Points for correct answer
    incorrectPenalty: number;   // Penalty for wrong answer
    noAnswerWeight: number;     // Points for unanswered
  };
  
  // Partial Credit Settings
  partialCredit: {
    enabled: boolean;
    algorithm: 'linear' | 'exponential' | 'custom';
    minimumCredit: number;
  };
  
  // Processing Settings
  processing: {
    batchSize: number;
    maxConcurrent: number;
    timeout: number;
  };
}
```

## 📊 Performance Requirements

### **Response Time Targets**
- **Single Submission**: < 500ms for typical MCQ assessment
- **Batch Grading**: < 5 minutes for 1000 submissions
- **Analytics**: < 2 seconds for standard reports
- **Export**: < 30 seconds for assessment-level data export

### **Scalability Targets**
- **Concurrent Grading**: 100+ simultaneous grading operations
- **Throughput**: 10,000+ submissions per hour
- **Data Volume**: Support for assessments with 1M+ submissions
- **Response Time**: Consistent performance under load

## 🔐 Security Considerations

### **Access Control**
- **Grading Permissions**: Only teachers/admins can trigger manual grading
- **Grade Visibility**: Students see only their own grades
- **Data Protection**: Secure grade storage with audit trails
- **Authentication**: Integration with Gateway Service for user verification

### **Data Integrity**
- **Grade Immutability**: Audit trail for all grade changes
- **Backup Strategy**: Regular grade data backups
- **Validation**: Input validation for all grading operations
- **Error Recovery**: Graceful handling of grading failures

## 🛠️ Development Setup (When Ready)

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- Access to Submission Service and Assessment Service
- Message queue (RabbitMQ) for async processing

### **Environment Variables**
```env
PORT=4003
DATABASE_URL="postgresql://user:password@localhost:5435/grading_db"
SUBMISSION_SERVICE_URL="http://submission-service:4002"
ASSESSMENT_SERVICE_URL="http://assessment-service:4001"
RABBITMQ_URL="amqp://localhost:5672"
```

## 🚧 Current Status

### **Infrastructure Status**
- ✅ **Docker Configuration**: Container setup prepared
- ✅ **Database Schema**: Grade and QuestionGrade models designed
- ✅ **Service Structure**: Basic service architecture planned
- 🔄 **Implementation**: Awaiting development start

### **Dependencies Ready**
- ✅ **Submission Service**: Complete - provides student responses
- ✅ **Assessment Service**: Complete - provides question data and rubrics
- ✅ **Gateway Service**: Complete - provides authentication
- ✅ **User Service**: Complete - provides user context

### **Next Steps**
1. **Implement Core Grading Logic**: MCQ scoring algorithms
2. **Build API Endpoints**: RESTful grading service API
3. **Add Integration Layer**: Connect to Submission and Assessment services
4. **Develop Analytics**: Performance metrics and reporting
5. **Create Test Suite**: Comprehensive testing framework
6. **Performance Optimization**: High-volume processing capabilities

## 🤝 Contributing

This service is ready for implementation! Contributors can help with:

### **Core Implementation**
- **Grading Algorithms**: Implement MCQ scoring with partial credit
- **API Development**: Build RESTful endpoints for grade management
- **Integration**: Connect with existing services (Submission, Assessment)
- **Testing**: Develop comprehensive test suite

### **Advanced Features**
- **Analytics Engine**: Student performance insights and reporting
- **Batch Processing**: High-volume grading capabilities
- **Export Features**: Grade export in multiple formats
- **Real-time Updates**: WebSocket integration for live grade updates

### **Development Standards**
- **TypeScript**: Strict typing throughout the service
- **Testing**: Minimum 90% test coverage required
- **Documentation**: Comprehensive API documentation
- **Performance**: Sub-second response times for individual operations

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](../../LICENSE) file for details.

---

**Part of the [Pediafor Assessment Platform](../../README.md)** - Open-source education infrastructure for the modern classroom.

**Ready for Implementation** - Core dependencies complete, infrastructure prepared, waiting for development to begin.