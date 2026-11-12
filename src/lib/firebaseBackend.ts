import {
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  fbSignOut,
  onAuthStateChanged,
  type FirebaseUser,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  fsLimit,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from './firebase';
import { INITIAL_PROFILES, INITIAL_ARTICLES, INITIAL_COMMENTS } from './seedData';
import type { Profile } from './database.types';

// Ensure seed data exists in Firestore if articles collection is empty
let seeded = false;
export async function seedFirestoreIfEmpty() {
  if (seeded) return;
  seeded = true;
  try {
    const artSnap = await getDocs(query(collection(db, 'articles'), fsLimit(1)));
    if (artSnap.empty) {
      console.log('[LOGOS] Initializing Cloud Firestore with seed essays...');
      // Seed initial admin profile
      for (const prof of INITIAL_PROFILES) {
        await setDoc(doc(db, 'profiles', prof.id), prof, { merge: true });
      }
      // Seed articles
      for (const art of INITIAL_ARTICLES) {
        await setDoc(doc(db, 'articles', art.id), art, { merge: true });
      }
      // Seed comments
      for (const comm of INITIAL_COMMENTS) {
        await setDoc(doc(db, 'comments', comm.id), comm, { merge: true });
      }
    }
  } catch (err) {
    console.warn('[LOGOS] Firestore seed notice:', err);
  }
}

// Convert Firestore doc to object
function docToData(d: any) {
  const data = d.data();
  return { ...data, id: d.id };
}

// Fluent Firestore Query Builder mirroring .from('...')
class FirestoreQueryBuilder {
  private colName: string;
  private filters: Array<{ field: string; op: any; val: any }> = [];
  private searchFilter: { field: string; text: string } | null = null;
  private orderField: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'desc';
  private limitCount = 50;
  private isSingle = false;
  private isMaybeSingle = false;
  private countOnly = false;

  constructor(colName: string) {
    this.colName = colName;
  }

  select(_cols = '*', options?: { count?: 'exact'; head?: boolean }) {
    if (options?.count || options?.head) {
      this.countOnly = true;
    }
    return this;
  }

  eq(field: string, val: any) {
    this.filters.push({ field, op: '==', val });
    return this;
  }

  neq(field: string, val: any) {
    this.filters.push({ field, op: '!=', val });
    return this;
  }

  in(field: string, vals: any[]) {
    if (vals && vals.length > 0) {
      // Firestore 'in' query allows up to 30 items
      this.filters.push({ field, op: 'in', val: vals.slice(0, 30) });
    } else {
      this.filters.push({ field, op: '==', val: '__empty__' });
    }
    return this;
  }

  or(expr: string) {
    // Extract search query: title.ilike.%query%
    const parts = expr.split(',');
    for (const p of parts) {
      const segs = p.split('.');
      if (segs[2]) {
        const text = segs[2].replace(/%/g, '').toLowerCase();
        if (text) {
          this.searchFilter = { field: segs[0] || 'title', text };
          break;
        }
      }
    }
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderDirection = options?.ascending ? 'asc' : 'desc';
    return this;
  }

  range(_from: number, to: number) {
    this.limitCount = Math.max(12, to + 1);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async then(resolve: (value: any) => void) {
    await seedFirestoreIfEmpty();

    try {
      let q = collection(db, this.colName) as any;
      const constraints: any[] = [];

      for (const f of this.filters) {
        constraints.push(where(f.field, f.op, f.val));
      }

      if (this.orderField && this.filters.length === 0) {
        constraints.push(orderBy(this.orderField, this.orderDirection));
      }

      constraints.push(fsLimit(this.limitCount));

      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);

      let rows = snapshot.docs.map(docToData);

      // Client-side text filter if requested
      if (this.searchFilter) {
        const s = this.searchFilter.text;
        rows = rows.filter((r) => {
          const t = String(r[this.searchFilter!.field] || '').toLowerCase();
          const ex = String(r.excerpt || '').toLowerCase();
          return t.includes(s) || ex.includes(s);
        });
      }

      // If articles or comments, join author profile and counts
      if (this.colName === 'articles') {
        const profSnap = await getDocs(collection(db, 'profiles'));
        const profMap = new Map();
        profSnap.docs.forEach((d) => profMap.set(d.id, docToData(d)));

        const likesSnap = await getDocs(collection(db, 'article_likes'));
        const commSnap = await getDocs(collection(db, 'comments'));

        rows = rows.map((art) => {
          const author = profMap.get(art.author_id) || {
            id: art.author_id,
            username: 'writer',
            display_name: 'Author',
            avatar_url: null,
          };
          const likeCount = likesSnap.docs.filter((l) => l.data()['article_id'] === art.id).length;
          const commCount = commSnap.docs.filter(
            (c) => c.data()['article_id'] === art.id && c.data()['status'] === 'visible'
          ).length;

          return {
            ...art,
            author,
            like_count: [{ count: likeCount }],
            comment_count: [{ count: commCount }],
          };
        });
      } else if (this.colName === 'comments') {
        const profSnap = await getDocs(collection(db, 'profiles'));
        const profMap = new Map();
        profSnap.docs.forEach((d) => profMap.set(d.id, docToData(d)));

        rows = rows.map((comm) => ({
          ...comm,
          author: profMap.get(comm.author_id) || {
            id: comm.author_id,
            username: 'writer',
            display_name: 'Member',
            avatar_url: null,
          },
        }));
      }

      if (this.countOnly) {
        resolve({ data: null, count: rows.length, error: null });
        return;
      }

      if (this.isSingle) {
        if (rows.length === 0) {
          resolve({ data: null, error: { message: 'Document not found' } });
        } else {
          resolve({ data: rows[0], error: null });
        }
        return;
      }

      if (this.isMaybeSingle) {
        resolve({ data: rows[0] || null, error: null });
        return;
      }

      resolve({ data: rows, count: rows.length, error: null });
    } catch (err: any) {
      console.error(`[Firebase] Firestore read error on ${this.colName}:`, err);
      resolve({ data: null, error: err });
    }
  }

  // INSERT
  insert(payload: any) {
    const isArray = Array.isArray(payload);
    const items = isArray ? payload : [payload];

    return {
      select: () => ({
        single: async () => {
          const item = items[0];
          const docId = item.id || doc(collection(db, this.colName)).id;
          const docRef = doc(db, this.colName, docId);
          const toSave = { ...item, id: docId, created_at: item.created_at || new Date().toISOString() };
          await setDoc(docRef, toSave, { merge: true });
          return { data: toSave, error: null };
        },
        then: async (res: any) => {
          for (const item of items) {
            const docId = item.id || doc(collection(db, this.colName)).id;
            await setDoc(doc(db, this.colName, docId), { ...item, id: docId }, { merge: true });
          }
          res({ data: items, error: null });
        },
      }),
      then: async (res: any) => {
        for (const item of items) {
          const docId = item.id || doc(collection(db, this.colName)).id;
          await setDoc(doc(db, this.colName, docId), { ...item, id: docId }, { merge: true });
        }
        res({ data: items, error: null });
      },
    };
  }

  // UPDATE
  update(payload: any) {
    return {
      eq: (field: string, val: any) => ({
        then: async (res: any) => {
          try {
            if (field === 'id') {
              const docRef = doc(db, this.colName, val);
              await updateDoc(docRef, { ...payload, updated_at: new Date().toISOString() });
            } else {
              const q = query(collection(db, this.colName), where(field, '==', val));
              const snap = await getDocs(q);
              for (const d of snap.docs) {
                await updateDoc(d.ref, { ...payload, updated_at: new Date().toISOString() });
              }
            }
            res({ error: null });
          } catch (err) {
            res({ error: err });
          }
        },
      }),
    };
  }

  // DELETE
  delete() {
    return {
      eq: (fieldA: string, valA: any) => ({
        eq: (fieldB: string, valB: any) => ({
          then: async (res: any) => {
            try {
              const q = query(
                collection(db, this.colName),
                where(fieldA, '==', valA),
                where(fieldB, '==', valB)
              );
              const snap = await getDocs(q);
              for (const d of snap.docs) {
                await deleteDoc(d.ref);
              }
              res({ error: null });
            } catch (err) {
              res({ error: err });
            }
          },
        }),
        then: async (res: any) => {
          try {
            if (fieldA === 'id') {
              await deleteDoc(doc(db, this.colName, valA));
            } else {
              const q = query(collection(db, this.colName), where(fieldA, '==', valA));
              const snap = await getDocs(q);
              for (const d of snap.docs) {
                await deleteDoc(d.ref);
              }
            }
            res({ error: null });
          } catch (err) {
            res({ error: err });
          }
        },
      }),
    };
  }
}

export const firebaseStorageAdapter = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        try {
          const sRef = storageRef(storage, `${bucket}/${path}`);
          const res = await uploadBytes(sRef, file);
          return { data: { path: res.metadata.fullPath }, error: null };
        } catch (err) {
          console.error('[Firebase Storage] Upload error:', err);
          return { data: null, error: err };
        }
      },
      getPublicUrl(path: string) {
        // Return storage download URL path
        return {
          data: {
            publicUrl: `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/${encodeURIComponent(
              path
            )}?alt=media`,
          },
        };
      },
    };
  },
};

// Auth bridge
export const firebaseAuthAdapter = {
  async getSession() {
    const user = auth.currentUser;
    if (!user) return { data: { session: null }, error: null };
    return {
      data: {
        session: {
          user: {
            id: user.uid,
            email: user.email,
            user_metadata: { display_name: user.displayName || user.email?.split('@')[0] },
          },
        },
      },
      error: null,
    };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Sync or ensure profile in Firestore
        const userDocRef = doc(db, 'profiles', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          const newProfile: Profile = {
            id: fbUser.uid,
            username: (fbUser.displayName || fbUser.email?.split('@')[0] || 'writer')
              .toLowerCase()
              .replace(/[^a-zA-Z0-9_]/g, '_')
              .slice(0, 24),
            display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Writer',
            bio: 'Member of LOGOS intellectual publishing community.',
            avatar_url: fbUser.photoURL || null,
            role: 'member',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
        }

        callback('SIGNED_IN', {
          user: {
            id: fbUser.uid,
            email: fbUser.email,
            user_metadata: { display_name: fbUser.displayName || fbUser.email?.split('@')[0] },
          },
        });
      } else {
        callback('SIGNED_OUT', null);
      }
    });

    return {
      data: {
        subscription: {
          unsubscribe,
        },
      },
    };
  },

  async signInWithGoogle() {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return { user: res.user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  async signInWithPassword({ email, password }: any) {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: res.user }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async signUp({ email, password, options }: any) {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification link
      await sendEmailVerification(res.user);

      const name = options?.data?.display_name || email.split('@')[0];
      const newProfile: Profile = {
        id: res.user.uid,
        username: name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24),
        display_name: name,
        bio: 'Member of LOGOS intellectual publishing community.',
        avatar_url: null,
        role: 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await setDoc(doc(db, 'profiles', res.user.uid), newProfile);

      return { data: { user: res.user }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async signOut() {
    await fbSignOut(auth);
    return { error: null };
  },

  async resetPasswordForEmail(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  },
};

// Main Client
export const firebaseClient = {
  auth: firebaseAuthAdapter,
  from(colName: string) {
    return new FirestoreQueryBuilder(colName);
  },
  storage: firebaseStorageAdapter,
};
