import { MCQGradingEngine } from '../src/services/gradingEngine';
import { Question, GradingConfig } from '../src/types';

describe('MCQGradingEngine', () => {
  const defaultConfig: GradingConfig = {
    id: 'test-config',
    assessmentId: 'test-assessment',
    gradingMethod: 'automated',
    allowPartialCredit: true,
    mcqScoringType: 'standard',
    autoGradeOnSubmit: true,
    releaseGradesImmediately: false,
    showCorrectAnswers: false,
    showFeedback: true
  };

  describe('Single Select Multiple Choice', () => {
    const singleSelectQuestion: Question = {
      id: 'q1',
      type: 'multiple_choice',
      content: 'What is 2 + 2?',
      options: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
      correctAnswer: 'B',
      points: 10
    };

    test('should award full points for correct answer', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(singleSelectQuestion, 'B', defaultConfig);
      
      expect(result.pointsEarned).toBe(10);
      expect(result.maxPoints).toBe(10);
      expect(result.isCorrect).toBe(true);
      expect(result.questionId).toBe('q1');
    });

    test('should award zero points for incorrect answer', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(singleSelectQuestion, 'A', defaultConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.maxPoints).toBe(10);
      expect(result.isCorrect).toBe(false);
    });

    test('should handle case-insensitive answers', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(singleSelectQuestion, 'b', defaultConfig);
      
      expect(result.pointsEarned).toBe(10);
      expect(result.isCorrect).toBe(true);
    });

    test('should handle whitespace in answers', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(singleSelectQuestion, ' B ', defaultConfig);
      
      expect(result.pointsEarned).toBe(10);
      expect(result.isCorrect).toBe(true);
    });

    test('should apply negative marking when configured', () => {
      const negativeConfig: GradingConfig = {
        ...defaultConfig,
        mcqScoringType: 'negative_marking',
        penaltyPerWrongAnswer: 2
      };

      const result = MCQGradingEngine.gradeMultipleChoice(singleSelectQuestion, 'A', negativeConfig);
      
      expect(result.pointsEarned).toBe(0); // Max of 0 and -2
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('Multiple Select Multiple Choice', () => {
    const multiSelectQuestion: Question = {
      id: 'q2',
      type: 'multiple_choice',
      content: 'Which are prime numbers?',
      options: ['A) 2', 'B) 3', 'C) 4', 'D) 5'],
      correctAnswer: ['A', 'B', 'D'],
      points: 15
    };

    test('should award full points for all correct selections', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, ['A', 'B', 'D'], defaultConfig);
      
      expect(result.pointsEarned).toBe(15);
      expect(result.maxPoints).toBe(15);
      expect(result.isCorrect).toBe(true);
    });

    test('should award zero points when no partial credit allowed', () => {
      const noPartialConfig: GradingConfig = {
        ...defaultConfig,
        allowPartialCredit: false
      };

      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, ['A', 'B'], noPartialConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.isCorrect).toBe(false);
    });

    test('should award partial credit when configured', () => {
      const partialConfig: GradingConfig = {
        ...defaultConfig,
        allowPartialCredit: true,
        mcqScoringType: 'partial_credit'
      };

      // Student selected A and B (2 correct) but missed D, and didn't select any incorrect
      // Score: (2 correct - 0 incorrect) / 3 total correct * 15 points = 10 points
      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, ['A', 'B'], partialConfig);
      
      expect(result.pointsEarned).toBe(10);
      expect(result.isCorrect).toBe(null); // Partial credit
    });

    test('should handle incorrect selections in partial credit', () => {
      const partialConfig: GradingConfig = {
        ...defaultConfig,
        allowPartialCredit: true,
        mcqScoringType: 'partial_credit'
      };

      // Student selected A, B (correct) and C (incorrect), missed D
      // Score: 2 correct out of 3 total correct = 2/3 * 15 points = 10 points
      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, ['A', 'B', 'C'], partialConfig);
      
      expect(result.pointsEarned).toBe(10); // 2/3 * 15 = 10
      expect(result.isCorrect).toBe(null);
    });

    test('should not go below zero in partial credit', () => {
      const partialConfig: GradingConfig = {
        ...defaultConfig,
        allowPartialCredit: true,
        mcqScoringType: 'partial_credit'
      };

      // Student selected only incorrect answers
      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, ['C'], partialConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.isCorrect).toBe(false);
    });

    test('should handle single selection as array', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(multiSelectQuestion, 'A', defaultConfig);
      
      expect(result.pointsEarned).toBe(0); // Not all correct answers selected
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('True/False Questions', () => {
    const trueFalseQuestion: Question = {
      id: 'q3',
      type: 'true_false',
      content: 'The Earth is round.',
      correctAnswer: true,
      points: 5
    };

    test('should grade boolean true correctly', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, true, defaultConfig);
      
      expect(result.pointsEarned).toBe(5);
      expect(result.isCorrect).toBe(true);
    });

    test('should grade boolean false correctly', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, false, defaultConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.isCorrect).toBe(false);
    });

    test('should handle string "true"', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 'true', defaultConfig);
      
      expect(result.pointsEarned).toBe(5);
      expect(result.isCorrect).toBe(true);
    });

    test('should handle string "false"', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 'false', defaultConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.isCorrect).toBe(false);
    });

    test('should handle numeric 1 as true', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 1, defaultConfig);
      
      expect(result.pointsEarned).toBe(5);
      expect(result.isCorrect).toBe(true);
    });

    test('should handle numeric 0 as false', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 0, defaultConfig);
      
      expect(result.pointsEarned).toBe(0);
      expect(result.isCorrect).toBe(false);
    });

    test('should handle "yes" as true', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 'yes', defaultConfig);
      
      expect(result.pointsEarned).toBe(5);
      expect(result.isCorrect).toBe(true);
    });

    test('should be case insensitive', () => {
      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, 'TRUE', defaultConfig);
      
      expect(result.pointsEarned).toBe(5);
      expect(result.isCorrect).toBe(true);
    });

    test('should apply negative marking', () => {
      const negativeConfig: GradingConfig = {
        ...defaultConfig,
        mcqScoringType: 'negative_marking',
        penaltyPerWrongAnswer: 1
      };

      const result = MCQGradingEngine.gradeTrueFalse(trueFalseQuestion, false, negativeConfig);
      
      expect(result.pointsEarned).toBe(0); // Max of 0 and -1
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('Feedback Generation', () => {
    const question: Question = {
      id: 'q4',
      type: 'multiple_choice',
      content: 'Test question',
      correctAnswer: 'A',
      points: 10
    };

    test('should generate feedback when showFeedback is true', () => {
      const result = MCQGradingEngine.gradeMultipleChoice(question, 'A', defaultConfig);
      
      expect(result.feedback).toBeDefined();
      expect(result.feedback).toContain('Correct');
    });

    test('should not generate feedback when showFeedback is false', () => {
      const noFeedbackConfig: GradingConfig = {
        ...defaultConfig,
        showFeedback: false
      };

      const result = MCQGradingEngine.gradeMultipleChoice(question, 'A', noFeedbackConfig);
      
      expect(result.feedback).toBeUndefined();
    });

    test('should show correct answer hint when configured', () => {
      const showAnswersConfig: GradingConfig = {
        ...defaultConfig,
        showCorrectAnswers: true
      };

      const result = MCQGradingEngine.gradeMultipleChoice(question, 'B', showAnswersConfig);
      
      expect(result.feedback).toBeDefined();
      expect(result.feedback).toContain('correct answer');
    });
  });
});