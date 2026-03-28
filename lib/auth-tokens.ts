export type AuthTokenPurpose = 'verify' | 'reset' | 'legacy';

const PURPOSE_SEPARATOR = ':';

export function buildAuthTokenIdentifier(
  purpose: Exclude<AuthTokenPurpose, 'legacy'>,
  email: string
) {
  return `${purpose}${PURPOSE_SEPARATOR}${email.trim().toLowerCase()}`;
}

export function parseAuthTokenIdentifier(identifier: string): {
  purpose: AuthTokenPurpose;
  email: string;
} {
  const trimmedIdentifier = identifier.trim().toLowerCase();
  const [prefix, ...rest] = trimmedIdentifier.split(PURPOSE_SEPARATOR);

  if ((prefix === 'verify' || prefix === 'reset') && rest.length > 0) {
    return {
      purpose: prefix,
      email: rest.join(PURPOSE_SEPARATOR),
    };
  }

  return {
    purpose: 'legacy',
    email: trimmedIdentifier,
  };
}
