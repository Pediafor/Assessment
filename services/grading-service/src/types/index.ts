export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text' | 'file_upload';
  content: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  metadata?: Record<string, any>;
}

export interface Assessment {
  id: string;
  title: string;
  questions: Question[];
  totalPoints: number;
  gradingConfig?: GradingConfig;
}

export interface Submission {
  id: string;
  userId: string;
  assessmentId: string;
  answers: Record<string, any>;
  status: 'draft' | 'submitted' | 'graded';
  submittedAt?: Date;
}

export interface GradingConfig {
  id: string;
  assessmentId: string;
  gradingMethod: 'automated' | 'manual' | 'hybrid';
  allowPartialCredit: boolean;
  penaltyPerWrongAnswer?: number | undefined;
  mcqScoringType: 'standard' | 'partial_credit' | 'negative_marking';
  autoGradeOnSubmit: boolean;
  releaseGradesImmediately: boolean;
  showCorrectAnswers: boolean;
  showFeedback: boolean;
}

export interface QuestionGradeResult {
  questionId: string;
  pointsEarned: number;
  maxPoints: number;
  isCorrect: boolean | null;
  studentAnswer: any;
  correctAnswer: any;
  feedback?: string | undefined;
}

export interface GradeResult {
  submissionId: string;
  assessmentId: string;
  userId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  questionGrades: QuestionGradeResult[];
  feedback?: string;
  gradedAt: Date;
  isAutomated: boolean;
}

export interface GradingRequest {
  submissionId: string;
  assessmentId?: string;
  userId?: string;
  forceRegrade?: boolean;
}

export interface GradingResponse {
  success: boolean;
  grade?: GradeResult;
  error?: string;
  message?: string;
}

export interface AnalyticsData {
  assessmentId: string;
  totalSubmissions: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  scoreDistribution: Record<string, number>;
  questionStats: Record<string, QuestionStats>;
}

export interface QuestionStats {
  questionId: string;
  averageScore: number;
  difficultyIndex: number; // Percentage who got it correct
  discriminationIndex: number; // How well it discriminates between high/low performers
  totalAttempts: number;
  correctAttempts: number;
}

export interface UserContext {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  permissions: string[];
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}