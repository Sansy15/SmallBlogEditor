import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from './plugins/OnChangePlugin';
import { Toolbar } from './Toolbar';
import { AIToolbar } from '../components/AIToolbar';
import { useInitialContent } from '../hooks/useInitialContent';

function Placeholder() {
  return (
    <div className="absolute top-0 left-0 text-neutral-500 pointer-events-none text-base md:text-lg">
      Start writing your story...
    </div>
  );
}

export function Editor({ postId }: { postId: number | null }) {
  const { initialConfig } = useInitialContent(postId);

  return (
    <LexicalComposer key={postId ?? 'new'} initialConfig={initialConfig}>
      <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/80 shadow-2xl shadow-black/40">
        <div className="border-b border-neutral-900 bg-neutral-950/80 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <Toolbar />
            <AIToolbar />
          </div>
        </div>
        <div className="relative min-h-[420px] px-5 sm:px-7 pb-7 pt-6">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-[360px] font-serif text-lg leading-7 md:text-xl md:leading-8 text-neutral-50" />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <OnChangePlugin />
    </LexicalComposer>
  );
}
