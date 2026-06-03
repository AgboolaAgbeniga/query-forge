import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcut, ShortcutConfig } from '../keyboard';

describe('Keyboard Module', () => {
  describe('formatShortcut', () => {
    it('should format keys correctly', () => {
      expect(formatShortcut({ key: 'n', action: () => {}, description: '' })).toBe('N');
      expect(formatShortcut({ key: 'n', ctrl: true, action: () => {}, description: '' })).toBe('Ctrl+N');
      expect(formatShortcut({ key: '?', shift: true, action: () => {}, description: '' })).toBe('Shift+?');
      expect(formatShortcut({ key: 'Enter', ctrl: true, shift: true, action: () => {}, description: '' })).toBe('Ctrl+Shift+Enter');
      expect(formatShortcut({ key: 'Delete', action: () => {}, description: '' })).toBe('Del');
    });
  });

  describe('useKeyboardShortcuts', () => {
    it('should trigger action on keydown', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', ctrl: true, action, description: 'New Rule' }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
      window.dispatchEvent(event);

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('should NOT trigger action if modifiers do not match', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', ctrl: true, action, description: 'New Rule' }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: false });
      window.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
    });

    it('should NOT trigger action when focused on input', () => {
      const action = vi.fn();
      const shortcuts: ShortcutConfig[] = [
        { key: 'n', ctrl: true, action, description: 'New Rule' }
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: 'n', ctrlKey: true });
      Object.defineProperty(event, 'target', { value: input });
      window.dispatchEvent(event);

      expect(action).not.toHaveBeenCalled();
    });
  });
});
