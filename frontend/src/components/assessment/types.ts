export type Choice = { id: string; text: string; correct?: boolean };
export type QuestionBase = {
  id: string;
  type: "mcq" | "multi" | "truefalse" | "short" | "essay" | "file" | "media";
  prompt: string;
  required?: boolean;
  points?: number;
  mediaUrl?: string;
  timeLimitSec?: number;
};
export type MCQ = QuestionBase & { type: "mcq"; choices: Choice[] };
export type Multi = QuestionBase & { type: "multi"; choices: Choice[] };
export type TrueFalse = QuestionBase & { type: "truefalse" };
export type Short = QuestionBase & { type: "short"; numeric?: boolean };
export type Essay = QuestionBase & { type: "essay"; wordLimit?: number };
export type FileQ = QuestionBase & { type: "file"; accept?: string };
export type MediaQ = QuestionBase & { type: "media"; mediaType: "image" | "audio" | "video" };
export type Question = MCQ | Multi | TrueFalse | Short | Essay | FileQ | MediaQ;
export type Section = {
  id: string;
  title: string;
  timeLimitSec?: number;
  questions: Question[];
};

export type Assessment = {
  id: string;
  title: string;
  totalTimeSec?: number; // overall timer if no section timer
  shuffle?: boolean;
  // Either flat questions or sectioned questions
  questions?: Question[];
  sections?: Section[];
};

export type Answers = Record<string, unknown>;
