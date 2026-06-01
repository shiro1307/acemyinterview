sessions

- id: text
- role: text
- created_at: timestamp

questions

- id: text
- session_id: text
- text: text

answers

- id: text
- question_id: text
- text: text
- created_at: timestamp

feedback

- id: text
- answer_id: text
- score: int4
- strengths: text[]
- missing_points: text[]
- model_answer: text
- created_at: timestamp
