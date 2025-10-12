import type { Assessment } from "./types";

export const sampleAssessment: Assessment = {
  id: "SAMPLE-001",
  title: "Sample Assessment (All Types)",
  totalTimeSec: 20 * 60,
  questions: [
    {
      id: "q1",
      type: "mcq",
      prompt: "Which planet is known as the Red Planet?",
      choices: [
        { id: "a", text: "Venus" },
        { id: "b", text: "Mars" },
        { id: "c", text: "Jupiter" },
        { id: "d", text: "Mercury" },
      ] as any,
      points: 2,
    },
    {
      id: "q2",
      type: "multi",
      prompt: "Select all prime numbers:",
      choices: [
        { id: "2", text: "2" },
        { id: "3", text: "3" },
        { id: "4", text: "4" },
        { id: "5", text: "5" },
      ] as any,
      points: 3,
    },
    { id: "q3", type: "truefalse", prompt: "The speed of light is approximately 300,000 km/s.", points: 1 },
    { id: "q4", type: "short", prompt: "What is 12 x 8?", points: 1, timeLimitSec: 60 },
    { id: "q5", type: "essay", prompt: "Explain photosynthesis in brief.", points: 5, wordLimit: 150 },
    { id: "q6", type: "file", prompt: "Upload your lab report (PDF)", points: 2, accept: ".pdf" },
    { id: "q7", type: "media", prompt: "Identify the object in the image:", points: 2, mediaUrl: "/icons/icon-192.png", mediaType: "image" },
  ],
};

export const sectionTimedAssessment: Assessment = {
  id: "SAMPLE-SECTIONED-001",
  title: "Sectioned Assessment (Per-Section Timers)",
  sections: [
    {
      id: "sec1",
      title: "Math Basics",
      timeLimitSec: 5 * 60,
      questions: [
        { id: "s1q1", type: "short", prompt: "What is 15 + 27?", points: 1 },
        {
          id: "s1q2",
          type: "mcq",
          prompt: "Which is an even number?",
          points: 1,
          choices: [
            { id: "a", text: "13" },
            { id: "b", text: "24" },
            { id: "c", text: "31" }
          ],
        },
      ],
    },
    {
      id: "sec2",
      title: "Reading Comprehension",
      timeLimitSec: 7 * 60,
      questions: [
        { id: "s2q1", type: "truefalse", prompt: "The earth revolves around the sun.", points: 1 },
        { id: "s2q2", type: "essay", prompt: "Summarize the passage in 100 words.", points: 4, wordLimit: 120 },
      ],
    },
  ],
};
