import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import * as svc from '@/lib/services/assessments';
import { useAssessmentsQuery } from '@/hooks/useSubmissions';

jest.spyOn(svc, 'listAssessments').mockResolvedValue([
  { id: 'A1', title: 'Mock Assessment', status: 'Assigned' },
]);

describe('useAssessmentsQuery', () => {
  it('returns assessments from API', async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: any) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useAssessmentsQuery(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.[0]?.id).toBe('A1');
    });
  });
});
