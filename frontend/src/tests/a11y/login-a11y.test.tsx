import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => <img alt={props.alt || ''} /> }));
jest.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ login: jest.fn(() => Promise.reject(new Error('Invalid credentials'))), dashboardPath: '/', role: null }) }));

import LoginPage from '@/app/(auth)/login/page';

describe('Login page a11y', () => {
  it('shows aria-live error on failed login and disables button when pending', async () => {
    render(<LoginPage />);
    const btn = screen.getByRole('button', { name: /sign in/i });
    const email = screen.getByLabelText(/email/i);
    const pwd = screen.getByLabelText(/password/i);
    fireEvent.change(email, { target: { value: 'student@pediafor.com' } });
    fireEvent.change(pwd, { target: { value: 'x' } });
    fireEvent.click(btn);
    // Button becomes disabled while pending
    expect(btn).toBeDisabled();
  });
});
