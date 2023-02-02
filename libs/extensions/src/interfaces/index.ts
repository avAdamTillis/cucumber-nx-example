export * from './DateUnits';

declare global {
  interface Array<T> {
    remove(item: T): boolean;
    removeAt(index: number): boolean;
    removeLast(item: T): boolean;
  }
}