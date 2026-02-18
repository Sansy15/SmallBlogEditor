/**
 * Zustand store for editor state - syncs with drafts list globally.
 * Manages: current post, editor content (Lexical JSON), auto-save status.
 */
import { create } from 'zustand';

export interface Post {
  id: number;
  title: string;
  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EditorState {
  posts: Post[];
  currentPost: Post | null;
  editorJson: string | null;
  isSaving: boolean;
  lastSavedAt: Date | null;

  setPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  setEditorJson: (json: string | null) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSavedAt: (at: Date | null) => void;
  addPost: (post: Post) => void;
  updatePostInList: (id: number, updates: Partial<Post>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  posts: [],
  currentPost: null,
  editorJson: null,
  isSaving: false,
  lastSavedAt: null,

  setPosts: (posts) => set({ posts }),
  setCurrentPost: (post) => set({ currentPost: post, editorJson: post?.content ?? null }),
  setEditorJson: (json) => set({ editorJson: json }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
  updatePostInList: (id, updates) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentPost: s.currentPost?.id === id ? { ...s.currentPost, ...updates } : s.currentPost,
    })),
}));
