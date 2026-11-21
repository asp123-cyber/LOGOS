import { runTransaction, type UpdateData, type DocumentData } from 'firebase/firestore';
import { auth, db, doc } from './firebase';

export async function saveOwnedArticle(id: string, changes: UpdateData<DocumentData> | null) {
  const ref = doc(db, 'articles', id);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error('This essay no longer exists.');
    if (!auth.currentUser || snapshot.data().author_id !== auth.currentUser.uid) {
      throw new Error('Only the author can change this essay.');
    }
    if (changes === null) transaction.delete(ref);
    else transaction.update(ref, { ...changes, updated_at: new Date().toISOString() });
  });
}
