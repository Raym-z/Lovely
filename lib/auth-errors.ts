export function friendlyAuthError(message: string | undefined) {
  const value = message?.trim();
  if (!value) return "Something went wrong. Please try again.";

  const normalized = value.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "That email and password did not match. Try again or create an account.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (
    normalized.includes("already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists")
  ) {
    return "That email already has an account. Try logging in instead.";
  }

  if (normalized.includes("manual linking")) {
    return "Account linking is not enabled in this Supabase project yet.";
  }

  if (normalized.includes("captcha")) {
    return "This Supabase project requires CAPTCHA verification. Configure CAPTCHA support or turn off CAPTCHA protection in Supabase Auth settings.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many")
  ) {
    return "A few too many tries. Wait a moment and try again.";
  }

  if (normalized.includes("password")) {
    return value;
  }

  return value;
}
