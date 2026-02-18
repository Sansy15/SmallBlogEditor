import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEditorStore } from '../../store/useEditorStore';

/** Syncs Lexical editor state to Zustand store on every change (for auto-save). */
export function OnChangePlugin() {
  const [editor] = useLexicalComposerContext();
  const setEditorJson = useEditorStore((s) => s.setEditorJson);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const json = JSON.stringify(editorState.toJSON());
        setEditorJson(json);
      });
    });
  }, [editor, setEditorJson]);

  return null;
}
