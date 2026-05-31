export const sessions = [
  {
    id: "1",
    role: "Frontend Engineer",
    questions: [
      {
        id: 1,
        text: "Explain React reconciliation.",
        answer: "React updates the UI by comparing old and new virtual DOM trees.",
        feedback: {
          score: 7,
          strengths: ["Good explanation", "Clear examples"],
          missing: ["Virtual DOM discussion"],
        },
      },
      {
        id: 2,
        text: "What is event bubbling?",
        answer: "Event bubbling is when an event propagates from child to parent elements.",
        feedback: {
          score: 8,
          strengths: ["Accurate definition", "Good understanding"],
          missing: ["Event capturing not discussed"],
        },
      },
    ],
  },
  {
    id: "2",
    role: "Backend Engineer",
    questions: [
      {
        id: 1,
        text: "Explain REST API principles.",
        answer: "REST uses HTTP methods like GET, POST, PUT, DELETE to interact with resources.",
        feedback: {
          score: 6,
          strengths: ["Mentioned HTTP methods"],
          missing: ["Statelessness not covered", "Resource representation"],
        },
      },
    ],
  },
];