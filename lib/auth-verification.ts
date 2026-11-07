export type AuthUserLike = {
  is_anonymous?: boolean;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
};

export function isRegisteredUnverified(user: AuthUserLike | null | undefined) {
  return Boolean(
    user &&
      !user.is_anonymous &&
      user.email &&
      !user.email_confirmed_at &&
      !user.confirmed_at,
  );
}

export function isEmailVerified(user: AuthUserLike | null | undefined) {
  return Boolean(
    user &&
      (user.is_anonymous ||
        !user.email ||
        user.email_confirmed_at ||
        user.confirmed_at),
  );
}
