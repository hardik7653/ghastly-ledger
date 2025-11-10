/**
 * Basic unit test for PassphraseModal component
 * Example test using React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PassphraseModal } from '../../src/components/PassphraseModal';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

describe('PassphraseModal', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders passphrase modal when open', () => {
    render(<PassphraseModal open={true} onAuthenticated={() => {}} />);

    expect(screen.getByText('Restricted Access')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter passphrase...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Archives/i })).toBeInTheDocument();
  });

  it('handles successful authentication', async () => {
    const mockOnAuthenticated = jest.fn();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, token: 'mock-jwt-token' })
    });

    render(<PassphraseModal open={true} onAuthenticated={mockOnAuthenticated} />);

    const input = screen.getByPlaceholderText('Enter passphrase...');
    const button = screen.getByRole('button', { name: /Enter Archives/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ passphrase: '123' })
        })
      );
      expect(mockOnAuthenticated).toHaveBeenCalledWith('mock-jwt-token');
    });
  });

  it('handles authentication failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, message: 'Invalid passphrase' })
    });

    render(<PassphraseModal open={true} onAuthenticated={() => {}} />);

    const input = screen.getByPlaceholderText('Enter passphrase...');
    const button = screen.getByRole('button', { name: /Enter Archives/i });

    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      // Toast notification would appear with error message
    });
  });

  it('disables submit button when passphrase is empty', () => {
    render(<PassphraseModal open={true} onAuthenticated={() => {}} />);

    const button = screen.getByRole('button', { name: /Enter Archives/i });
    expect(button).toBeDisabled();
  });
});
