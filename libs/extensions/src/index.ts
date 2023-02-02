declare global {
  interface ObjectConstructor {
    getOwnPropertyDescriptors<T>(obj: T): Record<keyof T, PropertyDescriptor>;
    
    values<T>(obj: T): [T[keyof T]][]
  }
}