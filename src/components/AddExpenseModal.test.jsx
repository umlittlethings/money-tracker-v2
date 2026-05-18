import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddExpenseModal from './AddExpenseModal';
import useStore from '../store/useStore';

vi.mock('../store/useStore', () => {
  let state = {
    wallets: [{ name: 'Cash', balance: 50000, type: 'daily' }],
    addTransaction: vi.fn()
  };
  const mockUseStore = (selector) => selector(state);
  mockUseStore.getState = () => state;
  mockUseStore.setState = (newState) => { state = { ...state, ...newState }; };
  return { default: mockUseStore };
});

describe('AddExpenseModal Validation', () => {
  it('shows error when amount exceeds wallet balance', () => {
    render(<AddExpenseModal isOpen={true} onClose={vi.fn()} />);
    
    // Type an amount greater than the 50000 balance
    const input = screen.getByPlaceholderText('0');
    fireEvent.change(input, { target: { value: '60000' } });
    
    // Submit form
    const saveButton = screen.getByText('Save Expense');
    fireEvent.click(saveButton);
    
    // Expect error message
    expect(screen.getByText(/Insufficient balance in Cash/i)).toBeInTheDocument();
    
    // Expect addTransaction not to be called
    expect(useStore.getState().addTransaction).not.toHaveBeenCalled();
  });
});
