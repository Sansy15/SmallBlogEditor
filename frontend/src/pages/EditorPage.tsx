import { useEffect, useMemo, useState } from 'react';
import { Editor } from '../editor/Editor';
import { useEditorStore } from '../store/useEditorStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../lib/api';

export function EditorPage() {
  const {
    posts,
    currentPost,
    isSaving,
    lastSavedAt,
    setPosts,
    setCurrentPost,
    addPost,
  } = useEditorStore();
  const [search, setSearch] = useState('');
  const [titleValue, setTitleValue] = useState('');

  useAutoSave();

  // Sync title value with currentPost
  useEffect(() => {
    if (currentPost) {
      setTitleValue(currentPost.title || '');
    }
  }, [currentPost?.id, currentPost?.title]);

  // Auto-save title changes
  const saveTitle = async () => {
    if (!currentPost || titleValue === currentPost.title) return;
    try {
      const updated = await api.posts.update(currentPost.id, { title: titleValue });
      useEditorStore.getState().updatePostInList(currentPost.id, {
        title: updated.title,
        updated_at: updated.updated_at,
      });
    } catch (e) {
      console.error('Failed to save title:', e);
    }
  };

  const debouncedSaveTitle = useDebounce(saveTitle, 2000);

  useEffect(() => {
    if (!currentPost || titleValue === currentPost.title) return;
    debouncedSaveTitle();
  }, [titleValue]);

  useEffect(() => {
    api.posts.list().then(setPosts).catch(console.error);
  }, []);

  const handleNewPost = async () => {
    try {
      const post = await api.posts.create({ title: 'Untitled' });
      addPost(post);
      setCurrentPost(post);
    } catch (e) {
      console.error('Failed to create post:', e);
    }
  };

  const handleSelectPost = (post: { id: number; title: string; content: string | null; status: string; created_at: string; updated_at: string } | null) => {
    setCurrentPost(post);
  };

  const handlePublish = async () => {
    if (!currentPost) return;
    try {
      const updated = await api.posts.publish(currentPost.id);
      useEditorStore.getState().updatePostInList(updated.id, { status: updated.status });
      setCurrentPost(updated);
    } catch (e) {
      console.error('Failed to publish:', e);
    }
  };

  const drafts = useMemo(
    () => posts.filter((p) => p.status === 'draft'),
    [posts]
  );
  const published = useMemo(
    () => posts.filter((p) => p.status === 'published'),
    [posts]
  );

  const filteredDrafts = drafts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPublished = published.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderRelativeTime = (iso: string) => {
    const updated = new Date(iso);
    const diffMs = Date.now() - updated.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hr${diffH > 1 ? 's' : ''} ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} day${diffD > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="h-16 bg-neutral-950/70 border-b border-neutral-900 flex items-center justify-between px-5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-md shadow-violet-500/40" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-neutral-50">Smart Blog Editor</span>
            <span className="text-[11px] text-neutral-500">AI‑assisted long‑form writing</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - Drafts list */}
      <aside className="w-72 bg-neutral-950/80 border-r border-neutral-900 flex flex-col">
        <div className="p-4 border-b border-neutral-900 space-y-3">
          <button
            onClick={handleNewPost}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-xl text-sm font-medium hover:from-violet-400 hover:to-indigo-400 transition-colors shadow-lg shadow-violet-500/25"
          >
            + New Post
          </button>
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded-full bg-neutral-950/80 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {posts.length === 0 && (
            <p className="text-neutral-500 text-xs px-1 py-2">
              No drafts yet. Create one to get started.
            </p>
          )}

          {filteredDrafts.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">
                Drafts
              </p>
              <div className="space-y-1">
                {filteredDrafts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border ${
                      currentPost?.id === post.id
                        ? 'bg-neutral-900/80 border-violet-500/70 shadow-sm shadow-violet-500/30'
                        : 'bg-neutral-950/60 border-neutral-900 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <p className="font-medium text-neutral-100 truncate text-sm">
                      {post.title || 'Untitled'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>Last edited {renderRelativeTime(post.updated_at)}</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredPublished.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5 mt-1">
                Published
              </p>
              <div className="space-y-1">
                {filteredPublished.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleSelectPost(post)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border ${
                      currentPost?.id === post.id
                        ? 'bg-neutral-900/80 border-violet-500/70 shadow-sm shadow-violet-500/30'
                        : 'bg-neutral-950/60 border-neutral-900 hover:border-neutral-700 hover:bg-neutral-900/60'
                    }`}
                  >
                    <p className="font-medium text-neutral-100 truncate text-sm">
                      {post.title || 'Untitled'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Updated {renderRelativeTime(post.updated_at)}</span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main editor area */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto bg-neutral-950">
        {!currentPost ? (
          <div className="max-w-2xl mx-auto mt-24 text-center text-neutral-500">
            <p className="text-lg font-medium text-neutral-100 mb-2">
              Welcome to your writing desk
            </p>
            <p className="text-sm text-neutral-500">
              Use “+ New Post” to start a draft, or select an existing piece from the sidebar.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => {
                setTitleValue(e.target.value);
                useEditorStore
                  .getState()
                  .updatePostInList(currentPost.id, { title: e.target.value });
              }}
              placeholder="Untitled"
              className="w-full bg-transparent border-none text-2xl sm:text-3xl font-semibold text-neutral-50 placeholder:text-neutral-600 focus:outline-none focus:ring-0"
            />
            <Editor postId={currentPost.id} />
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] sm:text-xs text-neutral-500">
                {isSaving
                  ? 'Saving…'
                  : lastSavedAt
                  ? '✓ Saved ✓'
                  : ''}
              </span>
              {currentPost.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  className="text-xs sm:text-sm px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-400 hover:to-indigo-400 transition-colors shadow-lg shadow-violet-500/25"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
