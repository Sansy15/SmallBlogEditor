import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { $isRangeSelection } from 'lexical';
import { api } from '../lib/api';

export function AIToolbar() {
  const [editor] = useLexicalComposerContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex items-center gap-2">
      <button
        onClick={() => runAI('summary')}
        disabled={loading}
        className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-200 border border-violet-500/40 hover:bg-violet-500/20 disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : 'Generate Summary'}
      </button>
      <button
        onClick={() => runAI('fix_grammar')}
        disabled={loading}
        className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/40 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
      >
        {loading ? '...' : 'Fix Grammar'}
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}
