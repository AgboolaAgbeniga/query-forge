import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryBuilder } from '../QueryBuilder';
import { useQueryStore } from '@/lib/store';

describe('QueryBuilder Integration', () => {
  beforeEach(() => {
    useQueryStore.getState().resetQuery();
    useQueryStore.getState().setActiveSchemaId('users');
  });

  it('renders root group with AND operator and empty state placeholder', () => {
    render(<QueryBuilder />);
    
    // Check for AND/OR toggle
    expect(screen.getByText('AND')).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    
    // Check for empty group placeholder
    expect(screen.getByText('No conditions yet')).toBeInTheDocument();
    expect(screen.getByText('Add a rule or group to start building your query')).toBeInTheDocument();
  });

  it('can add a rule to the root group', () => {
    render(<QueryBuilder />);

    const addRuleButton = screen.getByRole('button', { name: /rule/i });
    fireEvent.click(addRuleButton);

    // Empty state placeholder should disappear
    expect(screen.queryByText('No conditions yet')).not.toBeInTheDocument();

    // Default field for Users is User ID (id), let's check if it exists
    const fieldSelect = screen.getByRole('combobox', { value: 'id' });
    expect(fieldSelect).toBeInTheDocument();

    // Default operator should be Equals
    const operatorSelect = screen.getAllByRole('combobox')[1];
    expect(operatorSelect.value).toBe('equals');
  });

  it('can add a nested subgroup and toggle its operator', () => {
    render(<QueryBuilder />);

    const addGroupButton = screen.getByRole('button', { name: /group/i });
    fireEvent.click(addGroupButton);

    // There should now be two logical groups (root and nested subgroup)
    // Root group will have buttons, and subgroup will also have buttons.
    const addRuleButtons = screen.getAllByRole('button', { name: /rule/i });
    expect(addRuleButtons.length).toBe(2);

    // Let's toggle the logical operator of the subgroup (which is G1)
    const orButtons = screen.getAllByRole('button', { name: 'OR' });
    expect(orButtons.length).toBe(2);

    // Click the second one (subgroup OR button)
    fireEvent.click(orButtons[1]);

    // Check that store state has updated
    const state = useQueryStore.getState();
    const subgroupId = state.groups[state.rootGroupId].children[0];
    expect(state.groups[subgroupId].type).toBe('OR');
  });

  it('can delete rules from the builder', () => {
    render(<QueryBuilder />);

    // Add a rule
    fireEvent.click(screen.getByRole('button', { name: /rule/i }));
    
    // Find delete button (Trash icon button)
    const deleteButton = screen.getByTitle('Remove condition');
    expect(deleteButton).toBeInTheDocument();

    // Click delete
    fireEvent.click(deleteButton);

    // Should return to empty state
    expect(screen.getByText('No conditions yet')).toBeInTheDocument();
  });
});
