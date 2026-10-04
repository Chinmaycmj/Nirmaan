'use client';

import React from 'react';
import { 
  Keyboard, 
  X, 
  Command, 
  Play, 
  Lightbulb, 
  Brain, 
  MessageSquareQuote, 
  Search,
  Code2
} from 'lucide-react';

interface ShortcutsCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: 'Execution & Validation',
    shortcuts: [
      {
        keys: ['⌘', 'Enter'],
        altKeys: ['Ctrl', 'Enter'],
        description: 'Run & Validate code in sandbox',
        icon: Play,
      },
      {
        keys: ['⌘', 'H'],
        altKeys: ['Ctrl', 'H'],
        description: 'Reveal next progressive hint tier',
        icon: Lightbulb,
      },
      {
        keys: ['⌘', 'Shift', 'P'],
        altKeys: ['Ctrl', 'Shift', 'P'],
        description: 'Predict next step before revealing solution',
        icon: Brain,
      },
      {
        keys: ['⌘', 'Shift', 'E'],
        altKeys: ['Ctrl', 'Shift', 'E'],
        description: 'Open Explain-Back audit modal',
        icon: MessageSquareQuote,
      },
    ],
  },
  {
    category: 'Navigation & Palettes',
    shortcuts: [
      {
        keys: ['⌘', 'K'],
        altKeys: ['Ctrl', 'K'],
        description: 'Open global Command Palette',
        icon: Search,
      },
      {
        keys: ['?'],
        altKeys: ['Shift', '/'],
        description: 'Toggle Keyboard Shortcuts Cheat Sheet',
        icon: Keyboard,
      },
      {
        keys: ['Esc'],
        altKeys: ['Escape'],
        description: 'Close active modal or floating learning card',
        icon: X,
      },
    ],
  },
];

export const ShortcutsCheatSheetModal: React.FC<ShortcutsCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white border border-[#ebdcd0] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1c1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ebdcd0] flex items-center justify-between bg-[#faf6ee]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B5D2E6]/40 flex items-center justify-center text-[#326080]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1c1917]">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-[#78716c]">
                Quick actions for high-velocity learning in Nirmaan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-[#ebdcd0]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {group.shortcuts.map((sc, sIdx) => {
                  const Icon = sc.icon;
                  const keysToDisplay = isMac ? sc.keys : sc.altKeys;

                  return (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl border border-[#ebdcd0] bg-[#faf6ee]/40 flex items-center justify-between hover:bg-[#faf6ee] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#326080]" />
                        <span className="text-xs font-medium text-[#1c1917]">
                          {sc.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {keysToDisplay.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 rounded-md bg-white border border-[#ebdcd0] font-mono text-[11px] font-bold text-[#326080] shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#faf6ee] border-t border-[#ebdcd0] flex items-center justify-between text-xs text-[#78716c]">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#ebdcd0] font-mono text-[10px]">Esc</kbd> anytime to dismiss overlays</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#326080] text-white font-bold hover:bg-[#254b66] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
