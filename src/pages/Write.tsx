import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CATEGORIES, slugify, validateImageFile } from '../lib/utils';
import { renderTipTapJson } from '../lib/renderContent';
import type { Article as DbArticle } from '../lib/database.types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Write() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editArticleId = searchParams.get('edit');

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [articleId, setArticleId] = useState<string | null>(editArticleId);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>('Ideas');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [loadingInitial, setLoadingInitial] = useState(!!editArticleId);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cobalt-600 underline',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-h-[500px] mx-auto my-6',
        },
      }),
      Placeholder.configure({
        placeholder: 'Compose your essay here. Develop your premises, articulate evidence, address objections...',
      }),
    ],
    content: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load existing article if editing
  useEffect(() => {
    if (!editArticleId || !user) return;

    async function loadArticle() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', editArticleId as string)
          .single();

        if (error || !data) {
          setStatusMsg({ type: 'error', text: 'Could not load requested essay.' });
          return;
        }

        const article = data as unknown as DbArticle;

        if (article.author_id !== user?.id) {
          setStatusMsg({ type: 'error', text: 'You are not authorized to edit this draft.' });
          return;
        }

        setTitle(article.title);
        setExcerpt(article.excerpt);
        setCategory(article.category);
        setTags(article.tags || []);
        setCoverImageUrl(article.cover_image_url);
        setArticleId(article.id);

        if (editor && article.content) {
          editor.commands.setContent(article.content);
        }
      } finally {
        setLoadingInitial(false);
      }
    }

    if (editor) {
      loadArticle();
    }
  }, [editArticleId, user, editor]);

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      setStatusMsg({ type: 'error', text: validation.error || 'Invalid file format.' });
      return;
    }

    setUploadingCover(true);
    setStatusMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/cover_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Cover upload failed.',
      });
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle inline image upload into editor
  const handleInlineImage = async () => {
    if (!user || !editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/inline_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (!error) {
        const { data: { publicUrl } } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath);

        editor.chain().focus().setImage({ src: publicUrl }).run();
      }
    };
    input.click();
  };

  const handleLinkPrompt = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter hyperlink URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save or Publish
  const handleSave = async (publish: boolean) => {
    if (!user || !editor) return;

    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'Please provide a title for your essay.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const contentJson = editor.getJSON();
      const rawSlug = slugify(title);

      // Suffix random characters on new articles to avoid collision
      const slug = articleId ? rawSlug : `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`;

      const payload = {
        author_id: user.id,
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: contentJson as unknown as Record<string, unknown>,
        cover_image_url: coverImageUrl,
        category,
        tags,
        status: publish ? ('published' as const) : ('draft' as const),
        ...(publish ? { published_at: new Date().toISOString() } : {}),
      };

      if (articleId) {
        const { error } = await supabase
          .from('articles')
          .update(payload as any)
          .eq('id', articleId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert(payload as any)
          .select('id')
          .single();
        if (error) throw error;
        if (data) setArticleId((data as { id: string }).id);
      }

      setStatusMsg({
        type: 'success',
        text: publish ? 'Essay published to the community!' : 'Draft saved securely.',
      });

      if (publish) {
        setTimeout(() => navigate(`/article/${slug}`), 1200);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save essay.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingInitial) {
    return <LoadingSpinner message="Preparing Writing Studio..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 font-sans">
      {/* Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-ink-100 dark:border-ink-800 gap-4">
        <div>
          <span className="text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-widest block">
            Writing Studio
          </span>
          <h1 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
            {articleId ? 'Revise Essay' : 'Compose New Inquiry'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-paper-100 dark:bg-ink-800 p-1 text-xs">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                mode === 'edit'
                  ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 shadow-sm'
                  : 'text-ink-500'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                mode === 'preview'
                  ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 shadow-sm'
                  : 'text-ink-500'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-primary text-xs py-2 px-4"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {mode === 'preview' ? (
        /* Preview mode rendering */
        <div className="py-12 max-w-article mx-auto">
          <div className="badge mb-3">{category}</div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">{title || 'Untitled Essay'}</h1>
          {excerpt && <p className="text-xl font-serif italic text-ink-500 mb-8">{excerpt}</p>}
          {coverImageUrl && (
            <img src={coverImageUrl} alt="" className="rounded-xl mb-10 w-full max-h-[460px] object-cover" />
          )}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: renderTipTapJson(editor ? editor.getJSON() : null),
            }}
          />
        </div>
      ) : (
        /* Editor mode */
        <div className="py-8 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Essay Title..."
              className="w-full font-serif text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none text-ink-900 dark:text-paper-100 placeholder:text-ink-300"
            />
          </div>

          {/* Subtitle / Excerpt */}
          <div>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Thesis statement or brief summary (1-2 sentences)..."
              className="w-full font-serif text-lg italic bg-transparent border-none outline-none text-ink-600 dark:text-ink-300 placeholder:text-ink-300 resize-none"
            />
          </div>

          {/* Metadata Controls: Category, Cover, Tags */}
          <div className="p-4 rounded-xl bg-paper-100/60 dark:bg-ink-800/40 border border-ink-100 dark:border-ink-700/60 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-ink-600 dark:text-ink-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field text-xs py-2"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-ink-600 dark:text-ink-300 mb-1">
                Cover Image
              </label>
              <div className="flex items-center gap-2">
                <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingCover ? 'Uploading...' : coverImageUrl ? 'Change Cover' : 'Upload Cover'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
                {coverImageUrl && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Attached
                  </span>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase text-ink-600 dark:text-ink-300 mb-1">
                Tags (Press Enter to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge text-xs px-2.5 py-0.5 inline-flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="epistemology, deduction, ethics..."
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          {/* TipTap Toolbar */}
          {editor && (
            <div className="sticky top-20 z-30 p-2 rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 shadow-sm flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('bold') ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700' : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('italic') ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700' : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('underline') ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700' : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-ink-200 dark:bg-ink-700 mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('heading', { level: 2 })
                    ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700'
                    : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Section Heading (H2)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('heading', { level: 3 })
                    ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700'
                    : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Subsection Heading (H3)"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('blockquote')
                    ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700'
                    : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-ink-200 dark:bg-ink-700 mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('bulletList')
                    ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700'
                    : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('orderedList')
                    ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700'
                    : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-ink-200 dark:bg-ink-700 mx-1" />

              <button
                type="button"
                onClick={handleLinkPrompt}
                className={`p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 ${
                  editor.isActive('link') ? 'text-cobalt-600 bg-cobalt-50 dark:bg-ink-700' : 'text-ink-600 dark:text-ink-300'
                }`}
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleInlineImage}
                className="p-1.5 rounded text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700"
                title="Upload & Insert Inline Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-ink-200 dark:bg-ink-700 mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1.5 rounded text-ink-400 hover:text-ink-700"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1.5 rounded text-ink-400 hover:text-ink-700"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TipTap Content Area */}
          <div className="tiptap-editor min-h-[460px] p-4 bg-white dark:bg-ink-800 rounded-xl border border-ink-100 dark:border-ink-700 prose prose-logos dark:prose-logos-dark max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
    </div>
  );
}
