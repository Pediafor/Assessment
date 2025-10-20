import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import TeacherHome from '@/app/teacher/page';
import TeacherAssessments from '@/app/teacher/assessments/page';
import TeacherGrading from '@/app/teacher/grading/page';
import TeacherStudents from '@/app/teacher/students/page';
import TeacherReports from '@/app/teacher/reports/page';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, ...props }: any) => <a {...props}>{children}</a> }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}));
jest.mock('@/hooks/useTeacher', () => ({
  useTeacherAssessments: () => ({ data: [{ id: 'A-1', title: 'Sample', questions: 10, assigned: 5, status: 'Draft' }], isLoading: false }),
  useGradingQueue: () => ({ data: [{ id: 'Q-1', student: 'Jane', assessment: 'Quiz', submitted: '2025-10-10', status: 'New' }], isLoading: false }),
  useTeacherStudents: () => ({ data: [{ id: 'S-1', name: 'Jane', email: 'jane@example.com', active: true }], isLoading: false }),
  useTeacherOverview: () => ({ data: { avgScore: 80, completed: 10, pendingGrading: 2 }, isLoading: false }),
}));

describe('Teacher pages a11y', () => {
  it('Dashboard has main landmark', () => {
    render(<TeacherHome /> as any);
    expect(screen.getByRole('main', { name: /teacher dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /my assessments/i })).toBeInTheDocument();
  });

  it('Assessments has main landmark and heading', () => {
    render(<TeacherAssessments /> as any);
    expect(screen.getByRole('main', { name: /teacher assessments/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /assessments/i })).toBeInTheDocument();
  });

  it('Grading has main landmark and heading', () => {
    render(<TeacherGrading /> as any);
    expect(screen.getByRole('main', { name: /teacher grading/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /grading queue/i })).toBeInTheDocument();
  });

  it('Students has main landmark and heading', () => {
    render(<TeacherStudents /> as any);
    expect(screen.getByRole('main', { name: /teacher students/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /students/i })).toBeInTheDocument();
  });

  it('Reports has main landmark and heading', () => {
    render(<TeacherReports /> as any);
    expect(screen.getByRole('main', { name: /teacher reports/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reports/i })).toBeInTheDocument();
  });
});
