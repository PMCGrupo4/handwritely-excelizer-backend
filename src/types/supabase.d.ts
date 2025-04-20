declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    auth: {
      signInWithPassword: (credentials: { email: string; password: string }) => Promise<any>;
      signUp: (credentials: { email: string; password: string }) => Promise<any>;
      signOut: () => Promise<any>;
      getSession: () => Promise<any>;
      getUser: (token: string) => Promise<any>;
      onAuthStateChange: (callback: (event: string, session: any) => void) => void;
    };
    storage: {
      from: (bucket: string) => {
        upload: (path: string, file: File | Blob, options?: any) => Promise<any>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
        remove: (paths: string[]) => Promise<any>;
      };
      listBuckets: () => Promise<any>;
      createBucket: (name: string, options?: any) => Promise<any>;
    };
    from: (table: string) => {
      select: (columns?: string) => {
        eq: (column: string, value: any) => {
          single: () => Promise<{ data: any; error: any }>;
          order: (column: string, options?: { ascending?: boolean }) => any;
        };
        order: (column: string, options?: { ascending?: boolean }) => any;
      };
      insert: (data: any) => Promise<{ data: any; error: any }>;
      delete: () => {
        eq: (column: string, value: any) => Promise<{ data: any; error: any }>;
      };
    };
    rpc: (fn: string, params?: any) => Promise<any>;
  }

  export function createClient(url: string, key: string): SupabaseClient;
} 