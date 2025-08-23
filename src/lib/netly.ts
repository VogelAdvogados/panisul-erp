export const db: any = {};

export const collection = (...args: any[]): any => ({ __type: 'collection', args });
export const doc = (...args: any[]): any => ({ __type: 'doc', args });
export const query = (...args: any[]): any => ({ __type: 'query', args });
export const where = (...args: any[]): any => ({ __type: 'where', args });
export const orderBy = (...args: any[]): any => ({ __type: 'orderBy', args });
export const limit = (...args: any[]): any => ({ __type: 'limit', args });
export const addDoc = async (...args: any[]): Promise<any> => ({ id: 'mock', ...args[1] });
export const setDoc = async (...args: any[]): Promise<void> => {};
export const updateDoc = async (...args: any[]): Promise<void> => {};
export const deleteDoc = async (...args: any[]): Promise<void> => {};
export const getDoc = async (...args: any[]): Promise<any> => ({ exists: () => false, data: () => ({}), id: 'mock' });
export const getDocs = async (...args: any[]): Promise<any> => ({ docs: [] });
export const runTransaction = async (database: any, updateFunction: (transaction: any) => Promise<any>): Promise<any> => {
  return updateFunction({});
};
export const increment = (value: number): any => value;
export const writeBatch = (database: any): any => ({
  set: (...args: any[]) => {},
  update: (...args: any[]) => {},
  delete: (...args: any[]) => {},
  commit: async () => {},
});
export const getCountFromServer = async (...args: any[]): Promise<any> => ({ data: () => ({ count: 0 }) });

export const Timestamp = {
  fromDate: (date: Date) => date,
  now: () => new Date(),
};
