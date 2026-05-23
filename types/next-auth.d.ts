import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'member' | 'admin_bumdes' | 'super_admin';
      bumdesId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'member' | 'admin_bumdes' | 'super_admin';
    bumdesId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'member' | 'admin_bumdes' | 'super_admin';
    bumdesId?: string;
  }
}
