# 📊 Pediafor Analytics Report Guide

This document outlines the various types of analytics reports that can be generated from the data collected by the Pediafor platform. These reports range from standard performance summaries to advanced, AI-driven insights. The goal is to provide meaningful, actionable insights to students, educators, and administrators.

---

## 🟢 Foundational Analytics

These are standard reports that provide a clear snapshot of performance. They are essential for every educational platform.

- **Student Performance Over Time**  
  A report showing a student's scores on all assessments over a chosen time period (e.g., a semester).

- **Skill Mastery**  
  A report on a student's performance by specific question type (e.g., multiple-choice vs. essay).

- **Relative Performance**  
  A report showing a student's rank or percentile compared to their peers on a specific assessment.

- **Assessment-Level Grade Distribution**  
  A report showing the distribution of scores for a single assessment (e.g., a histogram or bar chart).

- **Question Effectiveness**  
  A report showing the success rate for each question in an assessment, helping to identify poorly designed questions.

- **Question-Level Time Analysis**  
  A report showing the average time students spent on each question.

- **Assessment Completion Rate**  
  Tracks how many students started an exam versus how many completed it.

- **Attempt Patterns**  
  For systems that allow multiple attempts, reports showing trends across first, second, and third attempts.

- **Device & Environment Report**  
  Uses submission metadata (`device_type`, `ip_address`, `user_agent`) to reveal accessibility patterns. Example: Students on mobile devices consistently scoring lower.

- **Section-Level Analytics**  
  Since assessments support timed **sections**, this report breaks down performance at the section level.

---

## 🔮 Advanced and Predictive Analytics

These reports leverage the comprehensive schema to provide proactive, actionable insights that go beyond simple reporting.

- **Student Risk Profile**  
  Flags students who are at risk of failing an assessment or a course by analyzing performance trends, submission history, and time usage.

- **"What If?" Scenarios**  
  An interactive tool that allows instructors to adjust a student's or class's performance and see how it impacts predicted outcomes.

- **Question Bank Health Report**  
  Scores each question on a "health index" based on usage, average difficulty, and incorrect answer rates.

- **Curriculum Bottleneck Identification**  
  Identifies topics where a majority of students are consistently underperforming across multiple assessments.

- **Rubric Effectiveness Report**  
  For AI-graded essays, measures how consistently rubrics are applied across multiple submissions.

- **Hint and Resource Usage Analysis**  
  Tracks how often students use hints and whether hint usage improves learning outcomes.

- **Confidence Score Analysis**  
  Correlates time spent and answer selection patterns with confidence, highlighting unusual hesitation.

- **Course Engagement Trends**  
  Tracks enrollment and completion rates across institutions, showing course popularity and retention.

- **Learning Path Recommendations**  
  Uses historical data to suggest personalized learning resources or modules for each student.

- **Anomaly Detection**  
  Flags unusual activity (e.g., very fast completion → potential malpractice, or sudden performance spikes/drops).

- **Adaptive Difficulty Validation**  
  Evaluates whether adaptive, AI-selected questions improve learning outcomes.

- **Fairness & Bias Detection**  
  Detects systemic underperformance across different groups (gender, region, institution) to ensure equity.

- **Feedback Effectiveness**  
  Tracks whether students who receive detailed feedback improve in subsequent attempts.

---

## 🏗️ Architectural Considerations

Analytics in Pediafor will run on a **dedicated analytics database**, separate from operational services, to ensure scalability and performance.  

Key points for the architecture:

- **Real-Time Dashboards**  
  Some metrics (e.g., "active students", "submissions per minute") are most valuable when streamed live from event data.

- **Separation of OLTP & OLAP**  
  - OLTP (Postgres): Stores raw transactional data (submissions, grades).  
  - OLAP (ClickHouse, DuckDB, TimescaleDB, or analytics-friendly Postgres schema): Optimized for reporting and trend analysis.  

- **Configurable Analytics Reports**  
  Allow educators and admins to define their own dashboards and reports (e.g., "track essay scores by rubric consistency across 3 courses").

---

## 🚀 Future Improvements

While the current analytics suite covers most core and advanced use cases, the following enhancements are planned for future releases:

- **Benchmarking Across Institutions**  
  Compare performance across multiple schools/universities to identify systemic strengths and weaknesses.

- **AI-Generated Insights**  
  Automated narratives alongside charts (e.g., "Students spent 20% more time on Section B compared to Section A").

- **Cohort Analysis**  
  Track the progress of specific groups (e.g., students who enrolled in the same semester).

- **Offline & Edge Analytics**  
  For regions with poor connectivity, analytics reports generated locally and synced when online.

