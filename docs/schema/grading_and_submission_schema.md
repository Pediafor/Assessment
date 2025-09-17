# 📊 Submission & Grade Schemas (Initial Release)

This document outlines the Submission Schema and Grade Schema for the Pediafor Assessment & Evaluation platform.
They are designed to be extensible, analytics-ready, and AI-friendly, forming the backbone of our grading and reporting system.

Future versions of these schemas can evolve with new technologies, best practices, and academic needs.

---

## 📝 Submission Schema

### JSON Structure
```json
{
	"submission_id": "sub-uuid-123",
	"assessment_id": "assess-uuid-456",
	"user_id": "u-uuid-789",
	"submitted_at": "2024-09-17T10:00:00Z",
	"answers": [
		{
			"question_id": "q-uuid-123",
			"type": "multiple_choice",
			"submitted_answer": "option-b",
			"time_spent_seconds": 35
		},
		{
			"question_id": "q-uuid-456",
			"type": "long_answer",
			"submitted_answer": "In eukaryotic cells, the mitochondria are...",
			"time_spent_seconds": 180
		}
	],
	"metadata": {
		"ip_address": "192.168.1.1",
		"user_agent": "Mozilla/5.0...",
		"device_type": "desktop",
		"total_time_spent_seconds": 215,
		"completion_status": "complete"
	}
}
```

### Explanation of Fields

- **submission_id**: Unique identifier for the submission.
- **assessment_id**: Links the submission to a specific assessment.
- **user_id**: Identifies which learner submitted this.
- **submitted_at**: Timestamp of submission.
- **answers[]**
	- **question_id**: The question being answered.
	- **type**: Type of question (multiple-choice, essay, coding, etc.).
	- **submitted_answer**: The student’s answer.
	- **time_spent_seconds**: Time spent on this question – critical for analytics.
- **metadata**
	- **ip_address**, **user_agent**, **device_type** → Enables basic proctoring and device-level analytics.
	- **total_time_spent_seconds** → Measures exam duration.
	- **completion_status** → Values: "complete", "incomplete", "abandoned".

---

## 🎯 Grade Schema

### JSON Structure
```json
{
	"grade_id": "gr-uuid-123",
	"submission_id": "sub-uuid-123",
	"assessment_id": "assess-uuid-456",
	"user_id": "u-uuid-789",
	"final_score": 85,
	"max_score": 100,
	"graded_at": "2024-09-17T10:05:00Z",
	"results": [
		{
			"question_id": "q-uuid-123",
			"score": 5,
			"max_score": 5,
			"feedback": "Correct answer.",
			"analytics": {
				"correct_in_first_try": true,
				"is_difficult": false,
				"hint_used": false
			}
		},
		{
			"question_id": "q-uuid-456",
			"score": 15,
			"max_score": 20,
			"feedback": "Good explanation...",
			"analytics": {
				"ai_score_breakdown": {
					"clarity": 4,
					"completeness": 3
				},
				"plagiarism_score": 0.15
			}
		}
	],
	"grading_details": {
		"pass_fail_status": "pass",
		"relative_rank": 0.85,
		"grade_distribution_percentile": 85
	},
	"metadata": {
		"grading_engine_version": "v1.2.0",
		"total_grading_time_ms": 150
	}
}
```

### Explanation of Fields

- **grade_id**: Unique identifier for a grading record.
- **submission_id**, **assessment_id**, **user_id** → References the submission, assessment, and user.
- **final_score** / **max_score**: Total performance of the learner.
- **graded_at**: Timestamp of grading.
- **results[]**
	- **question_id**: Which question is being graded.
	- **score** / **max_score**: Points awarded.
	- **feedback**: Human/AI-generated feedback.
	- **analytics**:
		- **correct_in_first_try**: Boolean for MCQs.
		- **is_difficult**: Set by system based on metrics like time or low global accuracy.
		- **hint_used**: Whether hints were used.
		- **ai_score_breakdown**: AI-driven rubric breakdown (clarity, completeness, etc.).
		- **plagiarism_score**: Integrity measure (0–1 scale).
- **grading_details**
	- **pass_fail_status**: "pass" or "fail".
	- **relative_rank**: Learner’s position relative to peers (0–1 scale).
	- **grade_distribution_percentile**: Percentile in grade distribution.
- **metadata**
	- **grading_engine_version**: Tracks version of grading logic/AI model.
	- **total_grading_time_ms**: Performance metric for grading service.

---

## 🚀 Why This Design?

- **Granularity** → Per-question analytics unlock deep insights into performance.
- **AI-Centric** → The analytics block allows AI-based grading, plagiarism detection, and future rubric expansions.
- **Proctoring Support** → Metadata captures environment and integrity signals.
- **Scalability** → Fields are versioned and extensible for future updates.
- **Future-Proofing** → As technology evolves, more dimensions (e.g., adaptive learning signals, emotional state tracking, etc.) can be added without breaking existing integrations.
