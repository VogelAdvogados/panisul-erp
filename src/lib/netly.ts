const NETLY_API_URL = process.env.NEXT_PUBLIC_NETLY_API_URL;
const NETLY_API_KEY = process.env.NEXT_PUBLIC_NETLY_API_KEY;

if (!NETLY_API_URL) {
  throw new Error('Missing NEXT_PUBLIC_NETLY_API_URL');
}

interface NetlyClient {
  baseUrl: string;
  headers: Record<string, string>;
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

export function collection(path: string) {
  return path;
}

export function doc(collectionPath: string, id: string) {
  return `${collectionPath}/${id}`;
}

export async function getDoc(path: string) {
  return request(path);
}

export async function getDocs(path: string) {
  return request(path);
}

export async function addDoc(path: string, data: unknown) {
  return request(path, { method: 'POST', body: JSON.stringify(data) });
}

export async function setDoc(path: string, data: unknown) {
  return request(path, { method: 'PUT', body: JSON.stringify(data) });
}

export async function updateDoc(path: string, data: unknown) {
  return request(path, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteDoc(path: string) {
  await request(path, { method: 'DELETE' });
}

export async function runTransaction<T>(fn: (tx: unknown) => Promise<T>) {
  return fn({});
}

export function increment(n: number) {
  return { __op: 'increment', value: n };
}

export function query(path: string) {
  return path;
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

export async function writeBatch() {
  const ops: Array<{ method: string; path: string; data?: unknown }> = [];
  return {
    set: (path: string, data: unknown) => ops.push({ method: 'PUT', path, data }),
    update: (path: string, data: unknown) => ops.push({ method: 'PATCH', path, data }),
    delete: (path: string) => ops.push({ method: 'DELETE', path }),
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

export async function getCountFromServer(path: string) {
  const res = await request(`${path}/count`);
  return res?.count ?? 0;
}

export const Timestamp = {
  fromDate: (date: Date) => date.toISOString(),
};
