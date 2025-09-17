# 📑 Assessment Schema

The **Assessment Schema** defines the structure for exams, tests, or evaluations in the Pediafor platform.  
It supports **timing flexibility, sectioned organization, and question references** to allow diverse assessment formats.  

This schema is **version 1** and will evolve to accommodate adaptive testing, AI-driven personalization, and emerging best practices.

---

## 📝 Assessment Schema (v1)

```json
{
	"assessment_id": "assess-uuid-123",
	"title": "Introduction to Biology Midterm Exam",
	"description": "This exam covers chapters 1-5 of the Introduction to Biology textbook.",
	"status": "published",
	"version": 1,
	"metadata": {
		"created_by": "u-uuid-456",
		"total_questions": 50,
		"total_points": 100,
		"pass_score": 70,
		"duration_minutes": 60,
		"scheduled_at": "2024-10-01T10:00:00Z"
	},
	"sections": [
		{
			"section_id": "sect-uuid-a1",
			"title": "Multiple Choice Questions",
			"description": "Choose the best answer for each question.",
			"type": "fixed_set",
			"timing": {
				"duration_minutes": 25,
				"is_timed": true
			},
			"questions": [
				{ "question_id": "q-uuid-123", "points": 2 },
				{ "question_id": "q-uuid-456", "points": 2 }
			],
			"metadata": {
				"question_count": 25,
				"max_points": 50
			}
		},
		{
			"section_id": "sect-uuid-b2",
			"title": "Essay Questions",
			"description": "Write a comprehensive response for each question.",
			"type": "fixed_set",
			"timing": {
				"duration_minutes": 35,
				"is_timed": true
			},
			"questions": [
				{ "question_id": "q-uuid-789", "points": 20 }
			],
			"metadata": {
				"question_count": 2,
				"max_points": 40
			}
		}
	]
}
```

### 🔑 Key Notes
1. **Top-Level Metadata**
	 - **duration_minutes** → The master timer for the entire exam.
		 - The UI should display a global countdown.
		 - Once it expires, the entire exam is auto-submitted.
	 - **scheduled_at** → Supports scheduled release of assessments.
	 - **pass_score** → Defines the minimum score required to pass.

2. **Section-Level Timing**
	 - Each section can have its own timing object:

		 ```json
		 "timing": {
			 "duration_minutes": 25,
			 "is_timed": true
		 }
		 ```
	 - **is_timed** → Boolean flag (whether this section has a timer).
	 - **duration_minutes** → Time allotted for this section.
	 - Once expired, this section is submitted, and the student moves on.

3. **Question-Level Timing (Future Extension)**
	 - Timing at the question level should live inside the Question Schema.

		 Example (inside question_schema.md):

		 ```json
		 "metadata": {
			 "ai_generated": true,
			 "timing": {
				 "duration_seconds": 90,
				 "is_timed": true
			 }
		 }
		 ```
	 - This allows:
		 - Quick-fire questions with individual timers.
		 - UI-driven countdowns for specific questions.

---

## 🎯 Supported Timing Configurations

- Single overall time limit (exam-level duration_minutes).
- Per-section time limits (e.g., “Rapid Fire Round”).
- Combination → Both global exam timer + section-level timers.
- Future: Per-question timers (extension in question_schema.md).

---

## 🔮 Future Enhancements

Planned improvements for future schema versions:

- Adaptive Sections → Dynamically served based on student performance.
- Prerequisites → Sections/questions unlocked only after others are completed.
- Randomized Question Pools → For anti-cheating.
- Conditional Timing → Adjusting timers based on accessibility needs.
- Scoring Weights → Weighted sections (e.g., MCQs = 40%, Essays = 60%).
