export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
}

/** Exactly what `/api/auth/login|register|refresh` return. */
export interface AuthSession {
  readonly accessToken: string;
  /** ISO-8601 UTC. */
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: string;
  readonly user: AuthUser;
}
