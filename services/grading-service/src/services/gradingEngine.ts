import { Question, QuestionGradeResult, GradingConfig } from '../types';

export class MCQGradingEngine {
  /**
   * Grade a multiple choice question
   */
  static gradeMultipleChoice(
    question: Question,
    studentAnswer: any,
    config: GradingConfig
  ): QuestionGradeResult {
    const { correctAnswer, points } = question;
    
    // Handle different MCQ formats
    if (Array.isArray(correctAnswer)) {
      return this.gradeMultipleSelect(question, studentAnswer, config);
    } else {
      return this.gradeSingleSelect(question, studentAnswer, config);
    }
  }

  /**
   * Grade single-select multiple choice (radio button)
   */
  private static gradeSingleSelect(
    question: Question,
    studentAnswer: any,
    config: GradingConfig
  ): QuestionGradeResult {
    const { correctAnswer, points, id: questionId } = question;
    
    // Normalize answers for comparison
    const studentAnswerNormalized = this.normalizeAnswer(studentAnswer);
    const correctAnswerNormalized = this.normalizeAnswer(correctAnswer);
    
    const isCorrect = studentAnswerNormalized === correctAnswerNormalized;
    
    let pointsEarned = 0;
    
    if (isCorrect) {
      pointsEarned = points;
    } else if (config.mcqScoringType === 'negative_marking' && config.penaltyPerWrongAnswer) {
      pointsEarned = Math.max(0, -config.penaltyPerWrongAnswer);
    }
    
    return {
      questionId,
      pointsEarned,
      maxPoints: points,
      isCorrect,
      studentAnswer,
      correctAnswer,
      feedback: this.generateFeedback(isCorrect, config)
    };
  }

  /**
   * Grade multiple-select multiple choice (checkbox)
   */
  private static gradeMultipleSelect(
    question: Question,
    studentAnswer: any,
    config: GradingConfig
  ): QuestionGradeResult {
    const { correctAnswer, points, id: questionId } = question;
    
    // Ensure student answer is an array
    const studentAnswers = Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer];
    const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
    
    // Normalize all answers
    const studentSet = new Set(studentAnswers.map(this.normalizeAnswer));
    const correctSet = new Set(correctAnswers.map(this.normalizeAnswer));
    
    // Calculate intersection and symmetric difference
    const intersection = new Set([...studentSet].filter(x => correctSet.has(x)));
    const studentExtra = new Set([...studentSet].filter(x => !correctSet.has(x)));
    const missedAnswers = new Set([...correctSet].filter(x => !studentSet.has(x)));
    const symDifferenceSize = studentExtra.size + missedAnswers.size;
    
    const isExactMatch = studentSet.size === correctSet.size && intersection.size === correctSet.size;
    
    let pointsEarned = 0;
    let isCorrect: boolean | null = null;
    
    if (config.allowPartialCredit && config.mcqScoringType === 'partial_credit') {
      // Partial credit: correct selections as a proportion of total correct, no penalty for wrong selections
      const correctSelections = intersection.size;
      const totalCorrect = correctSet.size;
      
      pointsEarned = (correctSelections / totalCorrect) * points;
      isCorrect = pointsEarned === points ? true : (pointsEarned > 0 ? null : false);
    } else {
      // All or nothing
      if (isExactMatch) {
        pointsEarned = points;
        isCorrect = true;
      } else {
        pointsEarned = config.mcqScoringType === 'negative_marking' && config.penaltyPerWrongAnswer 
          ? Math.max(0, -config.penaltyPerWrongAnswer) 
          : 0;
        isCorrect = false;
      }
    }
    
    return {
      questionId,
      pointsEarned,
      maxPoints: points,
      isCorrect,
      studentAnswer,
      correctAnswer,
      feedback: this.generateMultiSelectFeedback(intersection.size, correctSet.size, config)
    };
  }

  /**
   * Grade true/false question
   */
  static gradeTrueFalse(
    question: Question,
    studentAnswer: any,
    config: GradingConfig
  ): QuestionGradeResult {
    const { correctAnswer, points, id: questionId } = question;
    
    // Normalize boolean answers
    const studentBool = this.normalizeBoolean(studentAnswer);
    const correctBool = this.normalizeBoolean(correctAnswer);
    
    const isCorrect = studentBool === correctBool;
    
    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = points;
    } else if (config.mcqScoringType === 'negative_marking' && config.penaltyPerWrongAnswer) {
      pointsEarned = Math.max(0, -config.penaltyPerWrongAnswer);
    }
    
    return {
      questionId,
      pointsEarned,
      maxPoints: points,
      isCorrect,
      studentAnswer,
      correctAnswer,
      feedback: this.generateFeedback(isCorrect, config)
    };
  }

  /**
   * Normalize answer for consistent comparison
   */
  private static normalizeAnswer(answer: any): string {
    if (typeof answer === 'string') {
      return answer.trim().toLowerCase();
    }
    return String(answer).trim().toLowerCase();
  }

  /**
   * Normalize boolean values from various formats
   */
  private static normalizeBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }

  /**
   * Generate feedback for single answer questions
   */
  private static generateFeedback(isCorrect: boolean, config: GradingConfig): string | undefined {
    if (!config.showFeedback) return undefined;
    
    if (isCorrect) {
      return "Correct! Well done.";
    } else {
      return config.showCorrectAnswers 
        ? "Incorrect. Please review the correct answer." 
        : "Incorrect. Please review this topic.";
    }
  }

  /**
   * Generate feedback for multiple select questions
   */
  private static generateMultiSelectFeedback(
    correctSelections: number, 
    totalCorrect: number, 
    config: GradingConfig
  ): string | undefined {
    if (!config.showFeedback) return undefined;
    
    if (correctSelections === totalCorrect) {
      return "Excellent! You selected all correct answers.";
    } else if (correctSelections > 0) {
      return `Good work! You got ${correctSelections} out of ${totalCorrect} correct selections.`;
    } else {
      return "Please review this question. None of your selections were correct.";
    }
  }
}

/**
 * Helper to add Set.prototype.difference for older Node versions
 */
// Removed the global Set.difference extension as it's not needed