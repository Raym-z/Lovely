type PendingSignupCredentials = {
  email: string;
  password: string;
};

let pendingCredentials: PendingSignupCredentials | null = null;

export function rememberPendingSignupCredentials(
  email: string,
  password: string,
) {
  pendingCredentials = { email, password };
}

export function readPendingSignupCredentials() {
  return pendingCredentials;
}

export function clearPendingSignupCredentials() {
  pendingCredentials = null;
}
