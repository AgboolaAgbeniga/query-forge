import { useKeyboardShortcuts, ShortcutConfig } from '@/lib/keyboard';
import { useQueryStore } from '@/lib/store';

interface BuilderShortcutsProps {
  setShowShortcuts: React.Dispatch<React.SetStateAction<boolean>>;
  setShowClearAllConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveRightTab: React.Dispatch<React.SetStateAction<'history' | 'results'>>;
}

export function useBuilderShortcuts({ 
  setShowShortcuts, 
  setShowClearAllConfirm, 
  setActiveRightTab 
}: BuilderShortcutsProps) {
  const store = useQueryStore();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'e',
      alt: true,
      description: 'Switch to Results Tab',
      action: () => setActiveRightTab('results'),
    },
    {
      key: 'n',
      alt: true,
      description: 'Add new rule',
      action: () => store.addRule(store.rootGroupId),
    },
    {
      key: 'g',
      alt: true,
      description: 'Add new group',
      action: () => store.addGroup(store.rootGroupId),
    },
    {
      key: 'Delete',
      ctrl: true,
      description: 'Clear builder',
      action: () => setShowClearAllConfirm(true),
    },
    {
      key: '?',
      shift: true,
      description: 'Show shortcuts modal',
      action: () => setShowShortcuts((s) => !s),
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
