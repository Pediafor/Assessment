import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }), useSearchParams: () => new URLSearchParams('?token=abc') }));
jest.mock('@/components/auth-provider', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/lib/auth-api', () => ({
  apiLogin: jest.fn(async () => 'student'),
  apiRegister: jest.fn(async () => ({})),
  apiForgotPassword: jest.fn(async () => ({})),
}));

describe('Auth pages basic rendering', () => {
  it('renders login and submits', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'student@pediafor.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('renders register and submits', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'student@pediafor.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });

  it('renders forgot password and submits', async () => {
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'student@pediafor.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });
});
