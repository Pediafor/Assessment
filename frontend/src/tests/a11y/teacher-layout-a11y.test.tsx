import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherLayout from '@/app/teacher/layout';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, ...props }: any) => <a {...props}>{children}</a> }));
jest.mock('next/navigation', () => ({ usePathname: () => '/teacher', useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('@/components/layout/sidebar', () => ({ Sidebar: () => <nav aria-label="Sidebar" /> }));
jest.mock('@/components/role-guard', () => ({ RoleGuard: ({ children }: any) => <>{children}</> }));

describe('Teacher layout a11y', () => {
  it('renders skip link and main section with heading', () => {
    render(<TeacherLayout><div>child</div></TeacherLayout> as any);
    const skip = screen.getByRole('link', { name: /skip to content/i });
    expect(skip).toBeInTheDocument();
  const main = document.querySelector('#main');
  expect(main).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /teacher/i })).toBeInTheDocument();
  });
});
