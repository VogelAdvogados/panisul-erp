import 'next';

declare module 'next' {
  export interface PageProps<T = {}> {
    params: Promise<T>;
  }
}
