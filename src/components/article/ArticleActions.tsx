import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { saveOwnedArticle } from '../../lib/ownedArticle';
import type { Article } from '../../lib/database.types';

type Props = {
  article: Pick<Article, 'id' | 'author_id' | 'title'>;
  onDeleted: () => void;
};

export default function ArticleActions({ article, onDeleted }: Props) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!user || user.id !== article.author_id) return null;

  async function handleDelete() {
    if (user?.id !== article.author_id || deleting) return;
    if (!window.confirm(`Permanently delete "${article.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await saveOwnedArticle(article.id, null);
      onDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete this essay. Please try again.');
      setDeleting(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <Link to={`/write?edit=${article.id}`} className="btn-secondary"><Edit2 size={15} /> Edit essay</Link>
      <button type="button" disabled={deleting} onClick={handleDelete} className="btn-secondary text-red-700 dark:text-red-300"><Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete essay'}</button>
      {deleteError && <p role="alert" className="w-full text-sm text-red-700 dark:text-red-300">{deleteError}</p>}
    </div>
  );
}
