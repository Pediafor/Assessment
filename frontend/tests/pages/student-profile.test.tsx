import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import StudentProfilePage from '@/app/student/profile/page';

jest.mock('@/components/role-guard', () => ({ RoleGuard: ({ children }: any) => <>{children}</> }));

jest.mock('@/lib/api', () => ({
  UsersApi: {
    updateProfile: jest.fn(async () => ({})),
  },
}));

describe('Student Profile Page', () => {
  it('submits profile update and shows success', async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <StudentProfilePage />
      </QueryClientProvider>
    );
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'jane@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/profile updated/i);
  });

  it('shows error when update fails', async () => {
    const { UsersApi } = require('@/lib/api');
    (UsersApi.updateProfile as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <StudentProfilePage />
      </QueryClientProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/failed to update profile/i);
  });
});
