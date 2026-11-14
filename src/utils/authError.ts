export type AuthFlowMode = 'login' | 'signup' | 'oauth' | 'reset';

const EMPTY_GARBAGE_MESSAGES = new Set([
  '',
  '{}',
  '[]',
  'null',
  'undefined',
  '[object Object]',
  '[object Error]',
  'SyntaxError',
]);

export function getInAppBrowserName(): string | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || '';
  if (/WhatsApp/i.test(ua)) return 'WhatsApp';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
  if (/Line\//i.test(ua)) return 'Line';
  if (/MicroMessenger/i.test(ua)) return 'WeChat';
  return null;
}

export function extractAuthErrorMessage(err: any, mode: AuthFlowMode = 'login'): string {
  if (!err) {
    return 'Authentication could not be completed. Please try again.';
  }

  let rawMsg = '';
  if (typeof err === 'string') {
    rawMsg = err.trim();
  } else if (typeof err === 'object') {
    const candidate =
      (typeof err.msg === 'string' && err.msg) ||
      (typeof err.error_description === 'string' && err.error_description) ||
      (typeof err.message === 'string' && err.message) ||
      (typeof err.error === 'string' && err.error) ||
      (err.error && typeof err.error === 'object' && (err.error.msg || err.error.message)) ||
      '';
    rawMsg = String(candidate || '').trim();
  }

  const isEmptyOrSerializedObject =
    EMPTY_GARBAGE_MESSAGES.has(rawMsg) ||
    rawMsg.includes('[object Object]') ||
    rawMsg.startsWith('{') && rawMsg.endsWith('}') && rawMsg.replace(/[\s{}]/g, '') === '';

  const status = Number(err?.status || err?.code || 0);
  const errorName = String(err?.name || '');

  if (isEmptyOrSerializedObject || errorName === 'AuthRetryableFetchError' || status >= 500) {
    if (/error sending confirmation email/i.test(rawMsg) || /unexpected_failure/i.test(String(err?.error_code || ''))) {
      return 'Account registration failed because the confirmation email service returned an error. Please try "Continue with Google" or try again in a few minutes.';
    }
    if (mode === 'signup') {
      return 'We could not complete your registration right now because the authentication server returned a temporary error (confirmation email service unavailable). Please try "Continue with Google" or try again shortly.';
    }
    if (mode === 'oauth') {
      return 'Google Sign-In could not be completed in this browser. If you are using WhatsApp or a social in-app browser, please open chipng.com in Chrome or Safari and try again.';
    }
    if (mode === 'reset') {
      return 'Unable to send password reset email right now. Please try again shortly or contact support@chipng.com.';
    }
    return 'The authentication server returned a temporary error. Please check your internet connection and try again.';
  }

  const lower = rawMsg.toLowerCase();

  if (lower.includes('error sending confirmation email') || lower.includes('error sending confirmation')) {
    return 'Registration could not send your confirmation email right now. Please try "Continue with Google" or try again in a few minutes.';
  }
  if (lower.includes('already registered') || lower.includes('user already exists') || lower.includes('already been registered')) {
    return 'This email is already registered. Please switch to "Sign In" above to access your dashboard.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please verify and try again, or use "Forgot password?".';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address via the link sent to your inbox before signing in.';
  }
  if (lower.includes('rate limit') || status === 429) {
    return 'Too many attempts in a short time. Please wait a couple of minutes before trying again.';
  }
  if (lower.includes('password') && (lower.includes('6 characters') || lower.includes('weak') || lower.includes('short'))) {
    return 'Password must be at least 6 characters long.';
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('load failed')) {
    return 'Network error while reaching the authentication server. Please check your internet connection and retry.';
  }
  if (lower.includes('disallowed_useragent')) {
    return 'Google Sign-In is blocked inside in-app browsers (like WhatsApp). Open chipng.com in Chrome or Safari to continue with Google.';
  }
  if (lower.includes('server error')) {
    return mode === 'signup'
      ? 'Unable to complete registration right now due to an authentication server error. Please try "Continue with Google" or sign in if your account already exists.'
      : 'The authentication server encountered a temporary error. Please try again or use Google Sign-In.';
  }

  return rawMsg;
}
