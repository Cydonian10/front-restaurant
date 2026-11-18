import { HttpContextToken } from '@angular/common/http';

/** Mark requests that must not carry a session token. */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
