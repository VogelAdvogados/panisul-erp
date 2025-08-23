import { randomUUID } from 'crypto';

const NETLY_API_URL = process.env.NEXT_PUBLIC_NETLY_API_URL;
const NETLY_API_KEY = process.env.NEXT_PUBLIC_NETLY_API_KEY;

if (!NETLY_API_URL) {
  throw new Error('Missing NEXT_PUBLIC_NETLY_API_URL');
}

interface NetlyClient {
  baseUrl: string;
  headers: Record<string, string>;
}

export interface NetlyCollectionReference {
  path: string;
}

export interface NetlyDocumentReference {
  path: string;
  id: string;
}

export interface NetlyDocumentSnapshot<T = unknown> {
  id: string;
  exists: () => boolean;
  data: () => T;
}

export interface NetlyTransaction {
  get<T = unknown>(ref: NetlyDocumentReference): Promise<NetlyDocumentSnapshot<T>>;
  set(ref: NetlyDocumentReference, data: unknown): Promise<void>;
  update(ref: NetlyDocumentReference, data: unknown): Promise<void>;
  delete(ref: NetlyDocumentReference): Promise<void>;
}

export const db: NetlyClient = {
  baseUrl: NETLY_API_URL,
  headers: NETLY_API_KEY ? { Authorization: `Bearer ${NETLY_API_KEY}` } : {},
};

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${db.baseUrl}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...db.headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    throw new Error(`Netly request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export function collection(_db: NetlyClient, path: string): NetlyCollectionReference {
  return { path };
}

export function doc(
  db: NetlyClient,
  collectionPath: string,
  id?: string,
): NetlyDocumentReference;
export function doc(
  collectionRef: NetlyCollectionReference,
  id?: string,
): NetlyDocumentReference;
export function doc(
  arg1: NetlyClient | NetlyCollectionReference,
  arg2?: string,
  arg3?: string,
): NetlyDocumentReference {
  if ('path' in arg1 && !('baseUrl' in arg1)) {
    const collectionPath = arg1.path;
    const id = arg2 ?? randomUUID();
    return { path: `${collectionPath}/${id}`, id };
  }
  const collectionPath = arg2!;
  const id = arg3 ?? randomUUID();
  return { path: `${collectionPath}/${id}`, id };
}

function resolvePath(ref: NetlyCollectionReference | NetlyDocumentReference | string) {
  return typeof ref === 'string' ? ref : ref.path;
}

export async function getDoc<T = unknown>(ref: NetlyDocumentReference | string): Promise<NetlyDocumentSnapshot<T>> {
  const path = resolvePath(ref);
  const data = await request(path);
  return {
    id: typeof ref === 'string' ? path.split('/').pop() || '' : ref.id,
    exists: () => data !== null,
    data: () => data as T,
  };
}

export async function getDocs(path: NetlyCollectionReference | string) {
  return request(resolvePath(path));
}

export async function addDoc(path: NetlyCollectionReference | string, data: unknown): Promise<NetlyDocumentReference> {
  const basePath = resolvePath(path);
  const res = await request(basePath, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const id = res.id ?? randomUUID();
  return { path: `${basePath}/${id}`, id };
}

export async function setDoc(path: NetlyDocumentReference | string, data: unknown) {
  await request(resolvePath(path), { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateDoc(path: NetlyDocumentReference | string, data: unknown) {
  await request(resolvePath(path), { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteDoc(path: NetlyDocumentReference | string) {
  await request(resolvePath(path), { method: 'DELETE' });
}

export async function runTransaction<T>(
  _db: NetlyClient,
  fn: (tx: NetlyTransaction) => Promise<T>,
): Promise<T> {
  const tx: NetlyTransaction = {
    get: ref => getDoc(ref),
    set: (ref, data) => setDoc(ref, data),
    update: (ref, data) => updateDoc(ref, data),
    delete: ref => deleteDoc(ref),
  };
  return fn(tx);
}

export function increment(n: number) {
  return { __op: 'increment', value: n };
}

export function query(collectionRef: NetlyCollectionReference, ..._args: unknown[]): string {
  return collectionRef.path;
}

export function where(..._args: unknown[]) {
  return {};
}

export function orderBy(..._args: unknown[]) {
  return {};
}

export function limit(..._args: unknown[]) {
  return {};
}

export function writeBatch(_db: NetlyClient) {
  const ops: Array<{ method: string; path: string; data?: unknown }> = [];
  return {
    set: (ref: NetlyDocumentReference, data: unknown) => ops.push({ method: 'PUT', path: ref.path, data }),
    update: (ref: NetlyDocumentReference, data: unknown) => ops.push({ method: 'PATCH', path: ref.path, data }),
    delete: (ref: NetlyDocumentReference) => ops.push({ method: 'DELETE', path: ref.path }),
    commit: async () => {
      await Promise.all(
        ops.map(op =>
          request(op.path, {
            method: op.method,
            body: op.data ? JSON.stringify(op.data) : undefined,
          }),
        ),
      );
    },
  };
}

export async function getCountFromServer(path: NetlyCollectionReference | string) {
  const basePath = resolvePath(path);
  const res = await request(`${basePath}/count`);
  return {
    data: () => ({ count: res?.count ?? 0 }),
  };
}

export const Timestamp = {
  fromDate: (date: Date) => date.toISOString(),
};
