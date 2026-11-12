/* ------------------------------------------------------------------ */
/*  Database types — mirrors supabase/schema.sql                      */
/* ------------------------------------------------------------------ */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string | null;
          role?: 'member' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string;
          avatar_url?: string | null;
          role?: 'member' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: Article;
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          excerpt?: string;
          content?: Record<string, unknown>;
          cover_image_url?: string | null;
          category?: string;
          tags?: string[];
          status?: 'draft' | 'published' | 'archived' | 'hidden';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: Record<string, unknown>;
          cover_image_url?: string | null;
          category?: string;
          tags?: string[];
          status?: 'draft' | 'published' | 'archived' | 'hidden';
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      follows: {
        Row: Follow;
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      article_likes: {
        Row: ArticleLike;
        Insert: {
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: Bookmark;
        Insert: {
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: {
          id?: string;
          article_id: string;
          author_id: string;
          body: string;
          status?: 'visible' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          author_id?: string;
          body?: string;
          status?: 'visible' | 'hidden';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      reports: {
        Row: Report;
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: 'article' | 'comment' | 'profile';
          target_id: string;
          reason: string;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: 'article' | 'comment' | 'profile';
          target_id?: string;
          reason?: string;
          status?: 'open' | 'reviewing' | 'resolved' | 'dismissed';
          created_at?: string;
        };
        Relationships: [];
      };
      invites: {
        Row: Invite;
        Insert: {
          id?: string;
          email?: string | null;
          token: string;
          invited_by: string;
          used_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          token?: string;
          invited_by?: string;
          used_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/* ------------------------------------------------------------------ */
/*  Row types                                                         */
/* ------------------------------------------------------------------ */

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  role: 'member' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived' | 'hidden';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ArticleLike {
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Bookmark {
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  author_id: string;
  body: string;
  status: 'visible' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'article' | 'comment' | 'profile';
  target_id: string;
  reason: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface Invite {
  id: string;
  email: string | null;
  token: string;
  invited_by: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Augmented types for UI (with JOINed data)                         */
/* ------------------------------------------------------------------ */

export interface ArticleWithAuthor extends Article {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;
  like_count: number;
  comment_count: number;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>;
}

export interface ProfileWithCounts extends Profile {
  follower_count: number;
  following_count: number;
  article_count: number;
}
