import { useState, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { $isRangeSelection } from 'lexical';
import { api } from '../lib/api';

export function AIToolbar() {
  const [editor] = useLexicalComposerContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getText = () => {
    let text = '';
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        text = selection.getNodes().map((n) => n.getTextContent()).join('\n');
      }
      if (!text) {
        text = $getRoot().getTextContent();
      }
    });
    return text;
  };

  const runAI = async (action: 'summary' | 'fix_grammar') => {
    const text = getText();
    if (!text.trim()) {
      setError('Add some content first.');
      return;
    }
    setLoading(true);
    setError(null);
    setIsOpen(false);
    try {
      const { result } = await api.ai.generate(text, action);
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        const text = $createTextNode(result);
        p.append(text);
        root.append(p);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-400 hover:to-indigo-400 disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/25 flex items-center gap-1.5"
      >
        <span>✨</span>
        <span>AI Tools</span>
        <span className="text-[10px]">▼</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl shadow-black/40 py-1.5 z-50">
          <button
            onClick={() => runAI('summary')}
            disabled={loading}
            className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>✨</span>
            <span>Generate Summary</span>
          </button>
          <button
            onClick={() => runAI('fix_grammar')}
            disabled={loading}
            className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span>✏️</span>
            <span>Fix Grammar</span>
          </button>
        </div>
      )}
      {error && <span className="text-[11px] text-red-400 ml-2">{error}</span>}
    </div>
  );
}
