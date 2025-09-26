# Pediafor Question Schema Reference

This document defines the **standard JSON schema** for questions in the Pediafor Assessment & Evaluation application. Contributors should follow these formats to ensure consistency across the platform.

---

## 🎯 Purpose

The goal of this schema is to:

* Provide a **consistent structure** for representing questions.
* Ensure compatibility with **AI models** (embeddings, metadata).
* Support **multiple question types** (MCQs, essays, coding challenges, etc.).
* Make it **extensible** for future needs like hints, adaptive grading, or multimedia.
* Treat schemas as **versioned contracts** so they can evolve without breaking older data.

---

## ✅ Example: Multiple Choice Question (MCQ)

```json
{
  "id": "q-uuid-123",
  "schema_version": "v1",
  "version": 1,
  "type": "multiple_choice", 
  "difficulty": "medium", 
  "tags": ["biology", "cellular_respiration"],

  "content": {
    "text": "Which of the following is the primary site of ATP production in a eukaryotic cell?",
    "media": [
      {
        "type": "image",
        "url": "https://pediafor.com/assets/mitochondrion.png",
        "caption": "An illustration of a mitochondrion."
      }
    ],
    "hints": [
      "Think about the organelle often called the 'powerhouse of the cell'."
    ]
  },

  "answer": {
    "options": [
      { "id": "option-a", "text": "Nucleus" },
      { "id": "option-b", "text": "Mitochondrion" },
      { "id": "option-c", "text": "Cytoplasm" },
      { "id": "option-d", "text": "Ribosome" }
    ],
    "correct_option_id": "option-b",
    "explanation": "Mitochondria are known as the 'powerhouses' of the cell because they produce ATP through cellular respiration.",
    "allow_multiple": false
  },

  "grading": {
    "points": 5,
    "partial_credit": false,
    "rubric": null
  },

  "metadata": {
    "author_id": "u-uuid-456",
    "reviewed": true,
    "ai_assisted": true,
    "source_model": "gemini-1.5-pro",
    "embedding": [0.1, 0.2, 0.3],
    "created_at": "2024-09-16T12:00:00Z",
    "updated_at": "2024-09-16T12:00:00Z"
  }
}
```

---

## 🔑 Key Fields

* **id** → Unique identifier (UUID).
* **schema\_version** → Defines which schema version this question follows.
* **version** → Incremented when the specific question instance is updated.
* **type** → Question type (e.g., `multiple_choice`, `essay`, `code`, `matching`).
* **difficulty** → Label for adaptive assessments (`easy`, `medium`, `hard`).
* **tags** → Keywords for search and categorization.
* **content** → Question body, including text, media, and optional hints.
* **answer** → Options, correct answers, and explanation.
* **grading** → Points, partial credit rules, and rubrics.
* **metadata** → Provenance, author, AI-assistance flags, and embeddings.

---

## 🌀 Schema Evolution Strategy

Schemas are designed to evolve as technology and educational needs grow. For example:

* **v1** → Initial release (basic MCQ, essay, coding support).
* **v2** → Could add `adaptive_logic`, `ai_feedback`, or `accessibility` fields.
* **v3** → Could support immersive formats like AR/VR or voice-interactive assessments.

### Guidelines for Evolution

* Store schemas in `schemas/` directory (e.g., `question_v1.json`, `question_v2.json`).
* APIs must explicitly state which schema version they support.
* Maintain a `CHANGELOG.md` documenting changes between versions.
* Older schemas remain valid so **backward compatibility** is guaranteed.

---

## 🚀 Notes for Contributors

* **Keep schemas consistent** → Always follow the latest schema definition.
* **Use UUIDs** for all IDs (`question`, `option`, `user`, etc.).
* **Extensibility is key** → Don’t hardcode; allow for future fields.
* **AI-readiness** → Include embeddings, tags, and metadata wherever possible.

---

## 📌 Future Extensions

* **Adaptive questions** that unlock hints progressively.
* **Coding questions** with input/output test cases.
* **Essay questions** with AI-assisted grading.
* **Interactive/matching questions** (drag and drop, hotspot selection).
* **Accessibility fields** for inclusive education.

