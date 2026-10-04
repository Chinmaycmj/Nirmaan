'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Play, 
  Sparkles, 
  Brain, 
  MessageSquareQuote, 
  ShieldCheck, 
  Award, 
  Maximize2, 
  RotateCcw, 
  FolderGit2, 
  Layers, 
  Settings, 
  X,
  BookOpen
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  icon: React.ReactNode;
  category: 'execution' | 'learning' | 'workspace' | 'assistance';
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, commands, query]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1917]/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-[#FFF1E7] border border-[#ebdcd0] rounded-3xl max-w-xl w-full shadow-2xl animate-fadeIn overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="h-14 px-4 border-b border-[#ebdcd0] bg-white flex items-center gap-3">
          <Search className="w-4 h-4 text-[#78716c] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action (e.g. Run, Predict, Focus, Portfolio)..."
            className="w-full bg-transparent text-sm text-[#1c1917] placeholder-[#a8a29e] outline-none font-medium"
            autoFocus
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#faf6ee] text-[#78716c] px-2 py-0.5 rounded border border-[#ebdcd0]">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#78716c]">
              No commands found matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#326080] text-white shadow-sm'
                      : 'text-[#1c1917] hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-white' : 'text-[#326080]'}>
                      {cmd.icon}
                    </span>
                    <span className="font-semibold">{cmd.title}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-[#faf6ee] text-[#78716c] border-[#ebdcd0]'
                    }`}>
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="h-9 px-4 bg-white/70 border-t border-[#ebdcd0] flex items-center justify-between text-[11px] text-[#78716c] font-mono">
          <span>Navigate with ↑ ↓ • Select with Enter</span>
          <span>Nirmaan Command Engine</span>
        </div>
      </div>
    </div>
  );
};
