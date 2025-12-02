'use client';
import { type Auth } from 'firebase/auth';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public request: SecurityRuleContext;
  public rules?: string;

  constructor(request: SecurityRuleContext, auth: Auth) {
    const user = auth.currentUser;
    const { operation, path, requestResourceData } = request;
    const serverError = {
      auth: user ? JSON.parse(JSON.stringify(user)) : null,
      method: operation,
      path: `/databases/(default)/documents/${path}`,
      ...(requestResourceData && { resource: { data: requestResourceData } }),
    };

    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(
      serverError,
      null,
      2
    )}`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.request = request;
  }
}
