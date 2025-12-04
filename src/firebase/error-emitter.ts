'use client';

import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class TypedEventEmitter extends EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter();
