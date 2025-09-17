# � Submission & Grade Schemas (Initial Release)

This document defines the **Submission** and **Grade** schemas for the Pediafor Assessment & Evaluation platform.  
They are designed to be **extensible, analytics-friendly, and AI-ready**, enabling both core assessment workflows and advanced reporting.  

These schemas are **version 1** and may evolve with future releases to incorporate emerging technologies, grading strategies, and best practices.

---

## 📝 Submission Schema (v1)

```json
{
	"submission_id": "sub-uuid-123",
	"assessment_id": "assess-uuid-456",
	"user_id": "u-uuid-789",
	"attempt_number": 1,
	"session_id": "sess-uuid-321",
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
			"time_spent_seconds": 180,
			"attachments": [
				{
					"file_url": "https://pediafor.com/uploads/u-uuid-789/essay-doc.pdf",
					"file_type": "application/pdf"
				}
			]
		}
	],
	"metadata": {
		"ip_address": "192.168.1.1",
		"user_agent": "Mozilla/5.0...",
		"device_type": "desktop",
		"total_time_spent_seconds": 215,
		"completion_status": "complete",
		"auto_saved_at": [
			"2024-09-17T09:45:00Z",
			"2024-09-17T09:55:00Z"
		]
	}
}
```

### 🔑 Key Notes
- **attempt_number** → Tracks if this is the 1st, 2nd, etc., attempt.
- **session_id** → Helps reconnect and correlate across devices or network drops.
- **attachments** → Allows file-based answers (e.g., coding assignments, essays).
- **auto_saved_at[]** → Supports partial saves for resilience.
- **answers[].time_spent_seconds** → Useful for analytics (question difficulty, pacing).

---

## 🏆 Grade Schema (v1)

```json
{
	"grade_id": "gr-uuid-123",
	"submission_id": "sub-uuid-123",
	"assessment_id": "assess-uuid-456",
	"user_id": "u-uuid-789",
	"grader_type": "ai",
	"rubric_version": "2024-v1",
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
				"plagiarism_score": 0.15,
				"confidence_score": 0.92
			}
		}
	],
	"grading_details": {
		"pass_fail_status": "pass",
		"relative_rank": 0.85,
		"grade_distribution_percentile": 85,
		"appeal_status": "pending"
	},
	"metadata": {
		"grading_engine_version": "v1.2.0",
		"total_grading_time_ms": 150
	}
}
```

### 🔑 Key Notes
- **grader_type** → "ai", "human", "hybrid" for transparency.
- **rubric_version** → Ensures fairness if rubrics evolve.
- **confidence_score** → Useful for flagging low-confidence AI grading for human review.
- **appeal_status** → Tracks if a grade is under dispute.
- **analytics fields** → Enable question-level insights, e.g., difficulty, plagiarism detection.

---

## 🎯 Why This Matters

These schemas support AI-first grading while leaving room for human oversight.

Designed for future-proofing: appeal handling, multiple attempts, hybrid grading.

Enables granular analytics to drive insights into student learning patterns, assessment fairness, and difficulty calibration.

---

## 🔮 Future Evolution

Planned enhancements for later schema versions:

- Audit trails (who/what graded and when).
- Normalized storage for very large submissions.
- Cross-linking with proctoring data (webcam, keystroke dynamics).
- Adaptive grading logic for dynamic exams.
