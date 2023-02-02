export interface KeyValueSequenceReducer {
  key?: string;
  result: Record<string, string>;
  add(value: unknown): void;
}
