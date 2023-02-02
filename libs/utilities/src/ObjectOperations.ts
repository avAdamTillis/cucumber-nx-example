import '@cnxe/extensions';

import { IDictionary, IIndexed, KeyValueSequenceReducer } from "./interfaces";
import { CaselessMap } from './CaselessMap';

type Collection = IDictionary | IIndexed;

export class ObjectOperations<T extends Collection> {
  private readonly obj: T;

  /**
   *
   * @param {object|Array} obj
   */
  constructor(obj: T) {
    this.obj = obj;
  }

  static applyDescriptor(target: any, property: PropertyKey, descriptors: PropertyDescriptor) {
    const currentDescriptors = Object.getOwnPropertyDescriptors(target);
    Object.defineProperty(target, property, { ...currentDescriptors, ...descriptors });
  }

  static checkEnum<T extends Collection, TResult>(value: keyof T | TResult, obj: T, def?: TResult): TResult | undefined {
    const { constructor: { name: valueType } = {} } = value as Record<string, any>;

    if (obj == null) {
      throw new TypeError(
        `Function checkEnum requires second argument "obj" to be an object with keys or values of type [${
          valueType || typeof value
        }]`
      );
    }

    switch (true) {
      case (value as keyof T) in obj:
      case Object.keys(obj).includes(value as string):
      case Object.values(obj).includes(value):
        return value as TResult;
      default:
        return def;
    }
  }

  dictionarySearch<TResult>(key: keyof T): TResult | undefined;
  dictionarySearch<TResult>(key: RegExp): TResult | undefined;
  dictionarySearch<TResult>(key: keyof T, def: TResult): TResult;
  dictionarySearch<TResult>(key: RegExp, def: TResult): TResult;
  dictionarySearch<TResult>(key: keyof T | RegExp, def?: TResult): TResult | undefined {
    if(key instanceof RegExp) {
      return ObjectOperations.dictionarySearch(this.obj, key, def);
    }

    return ObjectOperations.dictionarySearch(this.obj, key, def);
  }

  static dictionarySearch<T extends Collection, TResult>(obj: T, key: keyof T): TResult | undefined;
  static dictionarySearch<T extends Collection, TResult>(obj: T, key: RegExp): TResult | undefined;
  static dictionarySearch<T extends Collection, TResult>(obj: T, key: keyof T, def: TResult): TResult;
  static dictionarySearch<T extends Collection, TResult>(obj: T, key: RegExp, def: TResult): TResult;
  static dictionarySearch<T extends Collection, TResult>(obj: T, key: keyof T | RegExp, def?: TResult): TResult | undefined {
    if(typeof key !== 'object' && key in obj) {
      return obj[key] as unknown as TResult;
    }

    if(typeof key === 'number' && Array.isArray(obj)) {
      if(key >= obj.length || key < 0) {
        return undefined;
      }

      return obj[key] as unknown as TResult;
    }

    for(const [ k, v ] of Object.entries(obj)) {
      switch(true) {
        case key === k:
          return v as TResult;
        case typeof key === 'string' && k.includes(key.toString()):
          return v as TResult;
        case key instanceof RegExp && key.test(k.toString()):
          return v as TResult;
        default:
          break;
      }
    }

    return def;
  }

  get entries(): [keyof T, any][] {
    return this.keys.map(key => [ key, this.get(key) ]);
  }

  filterObject(...props: Array<string | RegExp>): Collection {
    return ObjectOperations.filterObject(this.obj, ...props);
  }

  static filterObject<T extends Collection>(obj: T, ...props: Array<string | RegExp>): T | Partial<T> {
    // If not filtered
    if (props.length === 0) {
      logger.debug('No properties provided to filter. Returning original object');
      // return the original object
      return obj;
    }

    logger.groupDebug('utilities > src > ObjectOperations > filterObject');
    logger.debug('Filtering properties of provided object');

    logger.trace('Convert object to map for easier iteration');
    const mapped = new CaselessMap(Object.entries(obj));
    logger.trace('Initialize the final output');
    const result: Record<string, any> = {};

    logger.groupTrace('Iteration of filtered properties');
    logger.trace('Assuming that the list of properties is shorter than the potential object size');

    for (const prop of props) {
      if (prop instanceof RegExp) {
        logger.trace('For RegExp filters, iterate over the mapped entries');
        for (const [key, value] of mapped) {
          // Find the key that matches the provided regular expression
          if (prop.test(key)) {
            logger.trace('Key "%s" matches the provided RegExp of %s', key, prop);
            result[key] = value;
          }
        }
      }
      else if (mapped.has(prop)) {
        logger.trace('Filtered property "%s" found.', prop);
        result[prop] = mapped.get(prop);
      }
    }

    logger.groupEnd('Iteration of filtered properties');

    logger.debug('Object filtered, and returned as new instance');
    logger.groupEnd('utilities > src > ObjectOperations > filterObject');

    return Object.setPrototypeOf(result, obj);
  }

  get<TResult>(key: keyof T): TResult | undefined;
  get<TResult>(key: keyof T, def: TResult): TResult;
  get<TResult>(key: keyof T, def?: TResult): TResult | undefined {
    this.initProperty(key, def);
    return ObjectOperations.getProperty(this.obj, key) as TResult;
  }

  /**
   * Typy implementation for traversing an object hierarchy via a string
   * @param {ISearchable} object
   * @param {string} target
   * @return {*}
   */
  static getProperty<T extends Collection, TResult>(object: T, target: keyof T | string): TResult {
    const key = target.toString().replace(/^\./, '')
      .split(/\[["'](\w+)["']]|\[(\d+)]/)
      .filter(val => val)
      .join('.')
      .replace(/\.\./g, '.');

    return typy(object, key).safeObject;
  }

  has(key: keyof T): boolean {
    return key in this.obj;
  }

  initProperty<TResult>(prop: keyof T, def?: TResult): T {
    if(!this.has(prop)) {
      return Object.defineProperty(this.obj, prop, { value: def, writable: true });
    }

    return this.obj;
  }

  /**
   * Simple initializer that checks if the property already exists, and applies a default
   * @param {Object} obj Target to initialize
   * @param {string|number} prop Property to instantiate
   * @param {?*} def Optional value to apply to initialization. Null if empty
   * @return {Object}
   */
  static initProperty<T, TResult>(obj: T, prop: keyof T, def?: TResult): T {
    return new ObjectOperations(obj).initProperty(prop, def);
  }

  get isArray(): boolean {
    return Array.isArray(this.obj);
  }

  static isArray(item: Collection): boolean {
    return Array.isArray(item);
  }

  get isNested(): boolean {
    return this.isObject || this.isArray;
  }

  static isNested(item: Collection): boolean {
    return new ObjectOperations(item).isNested;
  }

  get isObject(): boolean {
    return ObjectOperations.isObject(this.obj);
  }

  /**
   * Type check that item is an object, not an array.
   * @param {*} item Value to check for type as Object
   * @return {boolean}
   */
  static isObject(item: Collection): boolean {
    return typy(item).isObject;
  }

  isOwnProperty(key: keyof T): boolean {
    return ObjectOperations.isOwnProperty(this.obj, key);
  }

  /**
   *
   * @param {object|Array} obj
   * @param {string|number} key
   * @return {boolean}
   */
  static isOwnProperty<T>(obj: T, key: keyof T): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  get keys(): Array<keyof T> {
    const { obj } = this;
    const result: Array<keyof T> = [];

    if(obj == null) {
      return result;
    }

    for(const key in obj) {
      result.push(key as keyof T);
    }

    return result as Array<keyof T>;
  }

  static kvsToObject(keyValueSequence: string[]): Record<string, string> {
    const obj = {
      key: undefined,
      result: {},
      add(value: string) {
        const { key, result } = this;

        if (key !== undefined) {
          this.key = undefined;
          result[key] = value;
        }
        else {
          this.key = value;
        }
      }
    } as KeyValueSequenceReducer;

    for (const item of keyValueSequence) {
      obj.add(item);
    }

    return obj.result;
  }

  static makeHidden(prototype: any, ...properties: PropertyKey[]) {
    for (const property of properties) {
      ObjectOperations.applyDescriptor(prototype, property, { enumerable: false });
    }
  }

  makeHidden(...properties: PropertyKey[]) {
    const prototype = Object.getPrototypeOf(this.obj);

    if (prototype) {
      ObjectOperations.makeHidden(prototype, ...properties);
    }
  }

  /**
   *
   * @param {object[]} sources
   */
  merge(...sources: Partial<T>[]): T {
    const [ first, ...rest ] = sources;

    if(first == null) {
      return this.obj;
    }

    const source = new ObjectOperations(first);

    if(!(this.isNested && source.isNested)) {
      return this.merge(...sources);
    }

    for(const [ key, value ] of source.entries) {
      type valueType = typeof value;
      const targetValue = new ObjectOperations(this.get<valueType>(key));
      const sourceValue = new ObjectOperations(value as valueType);

      if(sourceValue.isNested && targetValue.isNested) {
        targetValue.merge(value as Collection);
      }
      else {
        Object.defineProperty(this.obj, key, { value, writable: true });
      }
    }

    return this.merge(...rest);
  }

  /**
   * Operation of reducing multiple objects into a single target
   * @param {Object} target Object to merge into
   * @param {Object} sources Objects to apply
   * @return {Object}
   */
  static merge<T>(target: T, ...sources: Partial<T>[]) {
    return new ObjectOperations(target).merge(...sources);
  }

  static traverse<T, TResult>(target: T, paths: string[]): TResult {
    let result: any = target;

    for (const _path of paths) {
      const { attribute, index } = /^(?<attribute>[^[]+)?(?:\['?"?(?<index>[^"'\]]+)'?"?])?$/.exec(_path)?.groups ?? {};

      result = attribute ? ObjectOperations.getProperty<any, any>(result, attribute) : result;
      result = typeof result === 'string' ? JSON.parse(result) : result;
      result = typeof index ==='number' && index >= 0 ? (result as ArrayLike<unknown>)[index] : result;
    }

    return result as TResult;
  }

  zip<J, K>(other: K[]): [J, K][] {
    const self = Array.isArray(this.obj) ? this.obj : Object.keys(this.obj);
    return ObjectOperations.zip(self, other);
  }

  static zip<T, U>(a: T[], b: U[]): [T, U][] {
    const result: [T, U][] = [];
    const length = Math.min(a.length, b.length);

    for(let i = 0; i < length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const [ x, y ] = [ a[i]!, b[i]! ];
      result.push([ x, y ]);
    }

    return result;
  }
}
