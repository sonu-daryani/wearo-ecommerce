/**
 * NextAuth / Auth.js redirect errors are sent to `pages.signIn` as `?error=…`.
 * @see https://authjs.dev/guides/pages/built-in-pages
 */
export function getAuthPageErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;

  const messages: Record<string, string> = {
    OAuthAccountNotLinked:
      "This Google account could not be linked to your Wearo account. If you already registered with email and password, sign in that way first with the same email. If you only use Google, make sure you pick the Google profile that matches your Wearo email.",
    OAuthSignin: "We could not start Google sign-in. Try again in a moment.",
    OAuthCallback:
      "Google sign-in did not complete (redirect or consent failed). Try again and confirm this site’s URL is allowed in your Google Cloud OAuth client.",
    OAuthCreateAccount: "We could not create your account from Google. Try email sign-up or contact support.",
    EmailCreateAccount: "We could not create an account with this email.",
    Callback: "Something went wrong after returning from Google. Try signing in again.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign-in link is invalid or has expired.",
    Configuration:
      "Sign-in is misconfigured on the server (check AUTH_SECRET, AUTH_URL, and Google OAuth settings).",
    CredentialsSignin: "Invalid email or password.",
    SessionRequired: "You need to sign in to continue.",
  };

  return messages[code] ?? `Sign-in failed (${code}). Please try again or use email and password.`;
}
