import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => { const { priority, ...rest } = props || {}; return <img {...rest} />; } }));

import { Header } from '@/components/layout/header';

describe('Header accessibility', () => {
  it('has a theme toggle button with aria-label', () => {
    render(<Header />);
    const btn = screen.getByRole('button', { name: /toggle theme/i });
    expect(btn).toBeInTheDocument();
  });
});
