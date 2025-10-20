import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentHome from '@/app/student/page';

jest.mock('next/link', () => {
  return ({ children }: any) => <a>{children}</a>;
});

jest.mock('@/hooks/useSubmissions', () => ({
  useAssessmentsQuery: () => ({ data: [], isLoading: false }),
  useMySubmissionsQuery: () => ({ data: [], isLoading: false }),
}));

jest.mock('@/hooks/useRealtimeInvalidation', () => ({
  useRealtimeInvalidation: () => {},
}));

describe('Student Dashboard a11y', () => {
  it('has accessible section headings', () => {
    render(<StudentHome /> as any);
    expect(screen.getByRole('heading', { name: /assigned/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /completed/i })).toBeInTheDocument();
  });
});
