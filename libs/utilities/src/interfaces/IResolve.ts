import { IDictionary } from './IDictionary';
import { IIndexed } from './IIndexed';

export interface IResolve {
  complete: boolean;
  filterPatterns(patterns: string | unknown[] | unknown): string[];
  patternParts: IDictionary;
  property: unknown;
  propertyAtIndex: unknown;
  reduceIndex: (target: unknown, index: string | number) => unknown;
  reset(target: unknown, patterns: string[]): void;
  resolveIndex<T>(target: IDictionary | IIndexed, indexPattern?: string): T;
  result: unknown;
  target: unknown;
  tryParseJson<T>(result: string | T): T;
}
