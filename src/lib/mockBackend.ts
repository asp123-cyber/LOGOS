import { INITIAL_PROFILES, INITIAL_ARTICLES, INITIAL_COMMENTS } from './seedData';
import type { Profile, Article, Comment, Follow, ArticleLike, Bookmark, Report, Invite } from './database.types';

const STORAGE_KEYS = {
  PROFILES: 'logos_mock_profiles',
  ARTICLES: 'logos_mock_articles',
  COMMENTS: 'logos_mock_comments',
  LIKES: 'logos_mock_likes',
  BOOKMARKS: 'logos_mock_bookmarks',
  FOLLOWS: 'logos_mock_follows',
  REPORTS: 'logos_mock_reports',
  INVITES: 'logos_mock_invites',
  AUTH_USER: 'logos_mock_auth_user',
};

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to write mock storage:', err);
  }
}

// Initial hydration
export function initMockStorage() {
  getStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  getStorage(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
  getStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  getStorage(STORAGE_KEYS.LIKES, [
    { user_id: INITIAL_PROFILES[0]?.id || '', article_id: INITIAL_ARTICLES[0]?.id || '', created_at: new Date().toISOString() },
    { user_id: INITIAL_PROFILES[1]?.id || '', article_id: INITIAL_ARTICLES[0]?.id || '', created_at: new Date().toISOString() },
  ]);
  getStorage(STORAGE_KEYS.BOOKMARKS, [
    { user_id: INITIAL_PROFILES[0]?.id || '', article_id: INITIAL_ARTICLES[0]?.id || '', created_at: new Date().toISOString() },
  ]);
  getStorage(STORAGE_KEYS.FOLLOWS, [
    { follower_id: INITIAL_PROFILES[0]?.id || '', following_id: INITIAL_PROFILES[1]?.id || '', created_at: new Date().toISOString() },
  ]);
  getStorage(STORAGE_KEYS.REPORTS, [] as Report[]);
  getStorage(STORAGE_KEYS.INVITES, [
    {
      id: 'inv-seed-1',
      email: 'colleague@university.edu',
      token: 'welcome-to-logos-invite-token',
      invited_by: INITIAL_PROFILES[0]?.id || '',
      used_by: null,
      used_at: null,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    },
  ]);

  // Set default logged-in author as Eleanor Vance (Admin) for instant out-of-the-box experience
  const currentUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (!currentUser) {
    const defaultAuthor = INITIAL_PROFILES[0];
    if (defaultAuthor) {
      localStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify({
          id: defaultAuthor.id,
          email: 'eleanor@logos.org',
          created_at: defaultAuthor.created_at,
          user_metadata: { display_name: defaultAuthor.display_name },
        })
      );
    }
  }
}

// Ensure mock tables exist
if (typeof window !== 'undefined') {
  initMockStorage();
}

type AuthCallback = (event: string, session: { user: Record<string, unknown> | null } | null) => void;
const authListeners: AuthCallback[] = [];

export const mockAuth = {
  async getSession() {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) return { data: { session: null }, error: null };
    try {
      const user = JSON.parse(raw);
      return { data: { session: { user, access_token: 'mock-token' } }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  onAuthStateChange(callback: AuthCallback) {
    authListeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) authListeners.splice(index, 1);
          },
        },
      },
    };
  },

  async signInWithPassword({ email }: { email: string; password?: string }) {
    const profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const cleanEmail = email.toLowerCase().trim();

    // Match admin credentials explicitly
    let matchedProfile = profiles.find((p) => {
      if (
        cleanEmail === 'admin@logos.org' ||
        cleanEmail === 'admin' ||
        cleanEmail === 'eleanor@logos.org' ||
        cleanEmail === 'eleanor_vance' ||
        cleanEmail === 'eleanor_vance@logos.org'
      ) {
        return p.role === 'admin' || p.username === 'eleanor_vance';
      }
      return (
        p.username.toLowerCase() === cleanEmail ||
        p.id === cleanEmail ||
        p.username.toLowerCase() === cleanEmail.split('@')[0]
      );
    });

    if (!matchedProfile) {
      // Create user on the fly if not found
      const newId = `user-${Date.now()}`;
      matchedProfile = {
        id: newId,
        username: email.split('@')[0] || 'writer',
        display_name: email.split('@')[0] || 'Writer',
        bio: 'New intellectual contributor to LOGOS.',
        avatar_url: null,
        role: profiles.length === 0 ? 'admin' : 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profiles.push(matchedProfile);
      setStorage(STORAGE_KEYS.PROFILES, profiles);
    }

    const userObj = {
      id: matchedProfile.id,
      email: `${matchedProfile.username}@logos.org`,
      created_at: matchedProfile.created_at,
      user_metadata: { display_name: matchedProfile.display_name },
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userObj));
    authListeners.forEach((fn) => fn('SIGNED_IN', { user: userObj }));

    return { data: { user: userObj, session: { user: userObj } }, error: null };
  },

  async signUp({ email, options }: { email: string; password?: string; options?: { data?: { display_name?: string } } }) {
    const profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const newId = `user-${Date.now()}`;
    const name = options?.data?.display_name || email.split('@')[0] || 'New Writer';
    const username = email.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || `writer_${Date.now()}`;

    const newProfile: Profile = {
      id: newId,
      username,
      display_name: name,
      bio: 'New member in the LOGOS publishing community.',
      avatar_url: null,
      role: 'member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles.push(newProfile);
    setStorage(STORAGE_KEYS.PROFILES, profiles);

    const userObj = {
      id: newId,
      email,
      created_at: newProfile.created_at,
      user_metadata: { display_name: name },
    };

    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(userObj));
    authListeners.forEach((fn) => fn('SIGNED_IN', { user: userObj }));

    return { data: { user: userObj }, error: null };
  },

  async signOut() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    authListeners.forEach((fn) => fn('SIGNED_OUT', null));
    return { error: null };
  },

  async resetPasswordForEmail(_email: string) {
    return { error: null };
  },
};

// Fluent Mock Query Builder for .from('...')
class MockQueryBuilder {
  private table: string;
  private filters: Array<(row: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAsc = true;
  private rangeStart = 0;
  private rangeEnd = 999999;
  private isSingle = false;
  private isMaybeSingle = false;
  private countMode: 'exact' | null = null;
  private isHead = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = '*', options?: { count?: 'exact'; head?: boolean }) {
    if (options?.count) this.countMode = options.count;
    if (options?.head) this.isHead = true;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((row) => row[field] === value);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((row) => row[field] !== value);
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push((row) => values.includes(row[field]));
    return this;
  }

  or(expr: string) {
    // Basic ilike or simulation: title.ilike.%q%,excerpt.ilike.%q%
    const parts = expr.split(',');
    this.filters.push((row) => {
      return parts.some((p) => {
        const segments = p.split('.');
        const field = segments[0] || '';
        const rawPattern = segments[2] || '';
        const q = rawPattern.replace(/%/g, '').toLowerCase();
        const val = String((row as any)[field] || '').toLowerCase();
        return val.includes(q);
      });
    });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  range(from: number, to: number) {
    this.rangeStart = from;
    this.rangeEnd = to;
    return this;
  }

  limit(count: number) {
    this.rangeEnd = this.rangeStart + count - 1;
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

  // Execute SELECT
  private getData(): any[] {
    let rows: any[] = [];
    if (this.table === 'profiles') rows = getStorage(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    else if (this.table === 'articles') rows = getStorage(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
    else if (this.table === 'comments') rows = getStorage(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    else if (this.table === 'article_likes') rows = getStorage(STORAGE_KEYS.LIKES, []);
    else if (this.table === 'bookmarks') rows = getStorage(STORAGE_KEYS.BOOKMARKS, []);
    else if (this.table === 'follows') rows = getStorage(STORAGE_KEYS.FOLLOWS, []);
    else if (this.table === 'reports') rows = getStorage(STORAGE_KEYS.REPORTS, []);
    else if (this.table === 'invites') rows = getStorage(STORAGE_KEYS.INVITES, []);

    // Filter
    let filtered = rows.filter((r) => this.filters.every((f) => f(r)));

    // Sort
    if (this.orderField) {
      filtered.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    // Hydrate JOIN relationships for articles and comments
    const profiles = getStorage<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const likes = getStorage<ArticleLike[]>(STORAGE_KEYS.LIKES, []);
    const comments = getStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []);

    if (this.table === 'articles') {
      filtered = filtered.map((art) => {
        const author = profiles.find((p) => p.id === art.author_id) || profiles[0];
        const artLikes = likes.filter((l) => l.article_id === art.id).length;
        const artComms = comments.filter((c) => c.article_id === art.id && c.status === 'visible').length;
        return {
          ...art,
          author: {
            id: author?.id || '',
            username: author?.username || 'writer',
            display_name: author?.display_name || 'Writer',
            avatar_url: author?.avatar_url || null,
          },
          like_count: [{ count: artLikes }],
          comment_count: [{ count: artComms }],
        };
      });
    } else if (this.table === 'comments') {
      filtered = filtered.map((comm) => {
        const author = profiles.find((p) => p.id === comm.author_id) || profiles[0];
        return {
          ...comm,
          author: {
            id: author?.id || '',
            username: author?.username || 'writer',
            display_name: author?.display_name || 'Writer',
            avatar_url: author?.avatar_url || null,
          },
        };
      });
    }

    return filtered;
  }

  async then(resolve: (value: any) => void) {
    const rawData = this.getData();
    const count = rawData.length;

    if (this.isHead) {
      resolve({ data: null, count, error: null });
      return;
    }

    const paged = rawData.slice(this.rangeStart, this.rangeEnd + 1);

    if (this.isSingle) {
      if (paged.length === 0) {
        resolve({ data: null, error: { message: 'Row not found' } });
      } else {
        resolve({ data: paged[0], error: null });
      }
      return;
    }

    if (this.isMaybeSingle) {
      resolve({ data: paged[0] || null, error: null });
      return;
    }

    resolve({ data: paged, count, error: null });
  }

  // INSERT
  insert(payload: any) {
    const items = Array.isArray(payload) ? payload : [payload];
    let storageKey = '';
    let currentRows: any[] = [];

    if (this.table === 'articles') {
      storageKey = STORAGE_KEYS.ARTICLES;
      currentRows = getStorage(storageKey, INITIAL_ARTICLES);
    } else if (this.table === 'comments') {
      storageKey = STORAGE_KEYS.COMMENTS;
      currentRows = getStorage(storageKey, INITIAL_COMMENTS);
    } else if (this.table === 'article_likes') {
      storageKey = STORAGE_KEYS.LIKES;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'bookmarks') {
      storageKey = STORAGE_KEYS.BOOKMARKS;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'follows') {
      storageKey = STORAGE_KEYS.FOLLOWS;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'reports') {
      storageKey = STORAGE_KEYS.REPORTS;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'invites') {
      storageKey = STORAGE_KEYS.INVITES;
      currentRows = getStorage(storageKey, []);
    }

    const insertedItems = items.map((item) => ({
      ...item,
      id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    currentRows.push(...insertedItems);
    setStorage(storageKey, currentRows);

    return {
      select: () => ({
        single: async () => ({ data: insertedItems[0], error: null }),
        then: (res: any) => res({ data: insertedItems, error: null }),
      }),
      then: (res: any) => res({ data: insertedItems, error: null }),
    };
  }

  // UPDATE
  update(payload: any) {
    let storageKey = '';
    let currentRows: any[] = [];

    if (this.table === 'profiles') {
      storageKey = STORAGE_KEYS.PROFILES;
      currentRows = getStorage(storageKey, INITIAL_PROFILES);
    } else if (this.table === 'articles') {
      storageKey = STORAGE_KEYS.ARTICLES;
      currentRows = getStorage(storageKey, INITIAL_ARTICLES);
    } else if (this.table === 'comments') {
      storageKey = STORAGE_KEYS.COMMENTS;
      currentRows = getStorage(storageKey, INITIAL_COMMENTS);
    } else if (this.table === 'reports') {
      storageKey = STORAGE_KEYS.REPORTS;
      currentRows = getStorage(storageKey, []);
    }

    return {
      eq: (field: string, val: any) => ({
        then: (res: any) => {
          currentRows = currentRows.map((row) => {
            if (row[field] === val) {
              return { ...row, ...payload, updated_at: new Date().toISOString() };
            }
            return row;
          });
          setStorage(storageKey, currentRows);
          res({ data: currentRows, error: null });
        },
      }),
    };
  }

  // DELETE
  delete() {
    let storageKey = '';
    let currentRows: any[] = [];

    if (this.table === 'article_likes') {
      storageKey = STORAGE_KEYS.LIKES;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'bookmarks') {
      storageKey = STORAGE_KEYS.BOOKMARKS;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'follows') {
      storageKey = STORAGE_KEYS.FOLLOWS;
      currentRows = getStorage(storageKey, []);
    } else if (this.table === 'comments') {
      storageKey = STORAGE_KEYS.COMMENTS;
      currentRows = getStorage(storageKey, INITIAL_COMMENTS);
    } else if (this.table === 'articles') {
      storageKey = STORAGE_KEYS.ARTICLES;
      currentRows = getStorage(storageKey, INITIAL_ARTICLES);
    }

    return {
      eq: (fieldA: string, valA: any) => ({
        eq: (fieldB: string, valB: any) => ({
          then: (res: any) => {
            currentRows = currentRows.filter((r) => !(r[fieldA] === valA && r[fieldB] === valB));
            setStorage(storageKey, currentRows);
            res({ error: null });
          },
        }),
        then: (res: any) => {
          currentRows = currentRows.filter((r) => r[fieldA] !== valA);
          setStorage(storageKey, currentRows);
          res({ error: null });
        },
      }),
    };
  }
}

export const mockStorage = {
  from(_bucket: string) {
    return {
      async upload(path: string, file: File) {
        return new Promise<{ data: { path: string } | null; error: null }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              localStorage.setItem(`logos_img_${path}`, reader.result as string);
            } catch {
              // Ignore quota error in mock
            }
            resolve({ data: { path }, error: null });
          };
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl(path: string) {
        const stored = localStorage.getItem(`logos_img_${path}`);
        if (stored) return { data: { publicUrl: stored } };
        return { data: { publicUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80' } };
      },
    };
  },
};

export function createMockClient(): any {
  return {
    auth: mockAuth,
    from(table: string) {
      return new MockQueryBuilder(table);
    },
    storage: mockStorage,
  };
}
