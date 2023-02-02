import { LowercaseLogLevel } from '@cnxe/common';
import { logger } from '@cnxe/logger';

import { IMapEntry, MapCallback } from './interfaces';

export class CaselessMap<T> extends Map<string, T | IMapEntry<T>> {
  private original: [string, T][];
  private readonly silent: boolean;

  constructor(entries: [string, T][] = [], silent = false) {
    super();
    this.silent = silent;

    logger.groupDebug('utilities > src > utils > caseless-map.js > CaselessMap');
    logger.debug('Begin construction of a CaselessMap');

    const original = [];

    logger.debug('Key-Value pair instantiation');

    for (const [key, value] of entries) {
      logger.trace('Handling pair { "%s": %s }', key, value);

      if (this.has(key)) {
        const { index } = super.get(key.toLowerCase()) as IMapEntry<T>;
        const [ originalKey = 'No Key Found' ] = original[index] ?? [];

        logger.trace('Duplicate key found to already exist as "%s". Replacing with "%s"', originalKey, key);

        original[index] = [key, value];
        super.set(key.toLowerCase(), { value, index });
      }
      else {
        logger.trace('New key position added');
        const index = original.push([key, value]) - 1;
        super.set(key.toLowerCase(), { value, index });
      }
    }

    this.original = original as [string, T][];
    Object.defineProperty(this, 'original', {
      value: original as [string, T][],
      enumerable: false
    });

    logger.groupEnd('utilities > src > utils > caseless-map.js > CaselessMap');
  }

  [Symbol.iterator]() {
    return this.original[Symbol.iterator]();
  }

  _logAction(logLevel: LowercaseLogLevel, ...args: any): void {
    const { [logLevel]: log } = logger;

    if (!this.silent && log instanceof Function) {
      log.apply(logger, args);
    }
  }

  override clear() {
    this.original = [];
    super.clear();
  }

  override delete(key: string) {
    logger.groupDebug('utilities > src > utils > caseless-map.js > CaselessMap#delete');
    logger.debug('Begin delete operation for Caseless Key');

    if (this.has(key)) {
      logger.debug('Key detected. Proceeding with delete operation');
      const { index } = super.get(key.toLowerCase()) as IMapEntry<T>;

      this._logAction(
        'trace',
        'Iterating through keys starting from index %d stopping at length %d',
        index,
        this.original.length
      );

      for (let i = index + 1; i < this.original.length; i++) {
        const [ _key, value ] = this.original[i] ?? [];

        if(_key === undefined || value === undefined) {
          // Added to avoid TS2345: Argument of type '{ value: T | undefined; index: number; }' is not assignable to parameter of type 'T | IMapEntry<T>'.
          continue;
        }

        this._logAction(
          'trace',
          'Shifting key "%s" one position forward from %d to %d in backing Map object',
          _key,
          i,
          i - 1
        );

        super.set(_key.toLowerCase(), { value, index: i - 1 });
      }

      logger.trace('Filtering the ordered Array of key-value pairs to exclude index %d', index);
      this.original = this.original.filter((_value, _index) => index !== _index);
    }

    logger.debug('Delete operation completed');
    logger.groupEnd('utilities > src > utils > caseless-map.js > CaselessMap#delete');
    return super.delete(key.toLowerCase());
  }

  override entries() {
    logger.trace('Requested call to CaselessMap#entries. Returning backing Array of Key-Value pairs');
    return this.original[Symbol.iterator]();
  }

  override forEach(callback: MapCallback<T>, thisArg?: Map<string, T>): void {
    const self = thisArg ?? this;
    logger.trace('Call to iterate over collection of Key-Value pairs using callback', callback.toString());

    for (const [key, value] of self.entries()) {
      logger.trace('Iteration of Key "%s" and Value "%s"', key, value);
      callback(value, key, self as Map<string, T>);
    }
  }

  static fromObject<V>(obj: Record<string, V>): CaselessMap<V> {
    return new CaselessMap<V>(Object.entries(obj));
  }

  override get(key: string): T | undefined;
  override get(key: string, def: T): T;
  override get(key: string, def?: T): T | undefined {
    if(def !== undefined && !this.has(key)) {
      logger.trace('Key "%s" unavailable. Returning default:', def);
      return def;
    }

    logger.trace('Key "%s" requested', key);
    const { value } = super.get(key.toLowerCase()) || {};
    logger.trace('Value retrieved:', value);
    return value;
  }

  override has(key: string): boolean {
    logger.trace('Checking for existence of key "%s"', key);
    return super.has(key.toLowerCase());
  }

  override *keys() {
    logger.trace('KeyCollection requested. Returning the backing Array of Key-Value pairs, sans Value');

    for(const [ key ] of this.entries()) {
      yield key;
    }
  }

  get length(): number {
    logger.trace('Length of CaselessMap requested');
    return this.original.length;
  }

  override set<V extends T>(key: string, value: V) {
    logger.trace('Call to set value in CaselessMap');
    const index = this.has(key) ? (super.get(key.toLowerCase()) as IMapEntry<V>).index : this.original.length;

    if (index < this.original.length) {
      const [ originalKey = key ] = this.original[index] ?? [];
      logger.trace('Key "%s" already exists. Replacing entry "%s"', key, originalKey);
      this.original[index] = [key, value];
    }
    else {
      logger.trace('Setting a new Key-Value at key "%s"', key);
      this.original.push([key, value]);
    }

    logger.trace('Call to superclass Map object to set key-value');
    super.set(key.toLowerCase(), { value, index });
    return this;
  }

  toArray() {
    return this.original;
  }

  toJSON() {
    return this.original.reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), {});
  }

  override *values() {
    logger.trace('ValueCollection requested. Returning the backing Array of Key-Value pairs, sans Key');

    for(const [ , value ] of this.entries()) {
      yield value;
    }
  }
}
