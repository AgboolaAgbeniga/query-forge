/**
 * Keyboard shortcut manager.
 * Provides a React hook for registering global keyboard shortcuts.
 */

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutConfig {
  key: string;       // e.g. 'n', 'g', 'z', 's', 'Enter', 'Delete', 'Escape'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if typing in an input, select, or textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        e.stopPropagation();
        shortcut.action();
        return;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/** Formats shortcut for display. e.g. "Ctrl+N" */
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');

  let keyLabel = shortcut.key;
  if (keyLabel === ' ') keyLabel = 'Space';
  if (keyLabel === 'Delete') keyLabel = 'Del';
  if (keyLabel.length === 1) keyLabel = keyLabel.toUpperCase();

  parts.push(keyLabel);
  return parts.join('+');
}
