import { useMemo } from 'react';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { useEditorStore } from '../store/useEditorStore';
import { editorTheme } from '../editor/theme';

export function useInitialContent(_postId: number | null) {
  const currentPost = useEditorStore((s) => s.currentPost);

  const initialConfig = useMemo(() => {
    let editorState: string | undefined;
    if (currentPost?.content) {
      try {
        JSON.parse(currentPost.content);
        editorState = currentPost.content;
      } catch {
        editorState = undefined;
      }
    }

    return {
      namespace: 'SmartBlogEditor',
      theme: editorTheme,
      onError: (e: Error) => console.error('Lexical error:', e),
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
      editorState,
    };
  }, [currentPost?.id]); // Only re-create when switching posts - content loaded from store

  return {
    initialConfig,
    initialContent: currentPost?.content ?? null,
  };
}
