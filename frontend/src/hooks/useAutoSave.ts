/**
 * Auto-save hook: debounces editor changes and syncs to backend.
 * Logic: Only save after user stops typing for AUTO_SAVE_DELAY_MS.
 */
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { api } from '../lib/api';
import { useDebounce } from './useDebounce';

const AUTO_SAVE_DELAY_MS = 2000; // 2 seconds after last keystroke

export function useAutoSave() {
  const { currentPost, editorJson, setIsSaving, setLastSavedAt, updatePostInList } = useEditorStore();
  const prevJsonRef = useRef<string | null>(null);

  const saveToBackend = async () => {
    const post = useEditorStore.getState().currentPost;
    const json = useEditorStore.getState().editorJson;
    if (!post || json === null) return;
    if (json === prevJsonRef.current) return;

    prevJsonRef.current = json;
    setIsSaving(true);
    try {
      const updated = await api.posts.update(post.id, { content: json });
      updatePostInList(post.id, { content: updated.content, updated_at: updated.updated_at });
      setLastSavedAt(new Date());
    } catch (e) {
      console.error('Auto-save failed:', e);
      prevJsonRef.current = null; // Retry next change
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useDebounce(saveToBackend, AUTO_SAVE_DELAY_MS);

  useEffect(() => {
    if (!currentPost || editorJson === null) return;
    debouncedSave();
  }, [editorJson, currentPost?.id]);
}
