import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';
import '../../localize/i18n';

describe('Footer Component', () => {
  it('should render the copyright text', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Wichat`)).toBeInTheDocument();
  });

  it('should render the GitHub link', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: /GitHub/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Arquisoft/wichat_es6c');
  });

  it('should render the API documentation link', () => {
    render(<Footer />);
    const apiDocsLink = screen.getByRole('link', { name: /API Docs/i });
    expect(apiDocsLink).toBeInTheDocument();
    expect(apiDocsLink).toHaveAttribute('href', 'http://localhost:8000/api-doc');
  });

  it('should render the GitHub icon', () => {
    render(<Footer />);
    const githubIcon = screen.getByTestId('GitHubIcon');
    expect(githubIcon).toBeInTheDocument();
  });

  it('should render the API documentation icon', () => {
    render(<Footer />);
    const apiDocsIcon = screen.getByTestId('DescriptionIcon');
    expect(apiDocsIcon).toBeInTheDocument();
  });
});