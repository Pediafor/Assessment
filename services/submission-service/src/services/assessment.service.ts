import axios from 'axios';

const ASSESSMENT_SERVICE_URL = process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:4001';
const shouldMockAssessments =
  process.env.NODE_ENV === 'test' && process.env.MOCK_ASSESSMENT_SERVICE !== 'false';

export interface Assessment {
  id: string;
  deadline?: Date;
}

export async function getAssessmentById(assessmentId: string): Promise<Assessment | null> {
  if (shouldMockAssessments) {
    return { id: assessmentId };
  }

  try {
    const response = await axios.get(`${ASSESSMENT_SERVICE_URL}/assessments/${assessmentId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch assessment details');
  }
}
