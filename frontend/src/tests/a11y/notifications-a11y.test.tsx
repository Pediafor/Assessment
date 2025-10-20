import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationsPage from '@/app/student/notifications/page';

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, ...props }: any) => <a {...props}>{children}</a> }));
jest.mock('@/hooks/useNotifications', () => ({
  useNotificationsInfinite: () => ({
    data: { pages: [{ items: [] }] },
    isLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
  }),
  useMarkNotificationRead: () => ({ mutate: jest.fn() }),
}));

describe('Student Notifications a11y', () => {
  it('has a main landmark and heading', () => {
    render(<NotificationsPage /> as any);
    const main = screen.getByRole('main', { name: /notifications/i });
    expect(main).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
  });
});
