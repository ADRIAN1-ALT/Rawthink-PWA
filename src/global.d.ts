declare module 'passport';
declare module 'passport-google-oauth20';
declare module 'passport-apple';

// Minimal ambient types to satisfy TypeScript in this project
interface AuthenticatedUser {
  id: string;
  [key: string]: any;
}

declare namespace Express {
  export interface User extends AuthenticatedUser {}
}
