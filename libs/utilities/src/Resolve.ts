import { IDictionary, IIndexed, IResolve } from './interfaces';

/**
 * Class definition to retrieve a value from a specified property path
 */
export class Resolve implements IResolve {
  private __attribute?: string;
  private __index?: string;
  private __pattern?: string;
  private __patterns: string[];
  private __rest: string[];
  target: any;

  // Constructor
  /**
   * @param {Object|Array} target Object or Array to be traversed
   * @param {string|string[]} patterns One or more strings used to traverse the path
   */
  constructor(target: any, patterns: string | string[]) {
    this.__attribute = undefined;
    this.__index = undefined;
    this.__pattern = undefined;
    this.__patterns = [];
    this.__rest = [];

    this.target = target;
    this.reset(target, patterns);
  }

  // Instance Methods
  /**
   * Parser method that converts a string into an array of strings, then filters the patterns array
   * @param {string|string[]} patterns One or more strings used to traverse the path
   * @returns {string[]}
   */
  filterPatterns(patterns: string | IIndexed | any) : string[] {
    if (Array.isArray(patterns)) {
      return patterns.filter(pattern => typeof pattern === 'string' && pattern > '');
    }

    if (typeof patterns === 'string') {
      return patterns.split(/[\s.]/).filter(pattern => pattern > '' && pattern !== '.');
    }

    return [];
  }

  /**
   * Reduce-pattern method, to access for one or more index access requests
   * @param {Object|Array} target Object or Array to be traversed
   * @param {string} index Accessor value used to traverse one level into an array
   * @returns {*}
   */
  reduceIndex(target: any, index: string | number) : any {
    target = target[index];
    return target;
  }

  /**
   * Constructor assist method. Initializes the core members of the class
   * @param {Object|Array} target Object or Array to be traversed
   * @param {string|string[]} patterns One or more strings used to traverse the path
   */
  reset(target: any, patterns: string | string[]) {
    this.target = target;
    this.__patterns = this.filterPatterns(patterns);

    const [pattern, ...rest] = this.__patterns;
    this.__pattern = pattern;
    this.__rest = rest;

    const { attribute, index } = this.patternParts;
    this.__attribute = attribute;
    this.__index = index;
  }

  /**
   * Retrieve properties contained within the provided object via accessor syntax
   * @param {Object|Array} target Object or Array to be traversed
   * @param {string} indexPattern Set of accessor values used to traverse an array for 1-to-N dimension
   * @return {*}
   */
  resolveIndex(target: IDictionary | IIndexed, indexPattern?: string) {
    if (!indexPattern) {
      return target;
    }

    return indexPattern
      .split(/[[\].'"]/)
      .filter(index => index > '')
      .reduce(this.reduceIndex, target);
  }

  /**
   * Try-Catch attempt to parse a string object as JSON
   * @param {*} result Product of traversing the provided target object
   * @returns {*}
   */
  tryParseJson(result: any) : any {
    if (typeof result !== 'string') {
      return result;
    }

    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  // Getters and Setters
  /**
   * Flag to determine if more steps remain to traverse
   * @returns {boolean}
   */
  get complete() : boolean {
    return this.__rest?.length === 0 ?? true;
  }

  /**
   * Result of a regex to extract the parts of the pattern as Attribute (property name) and Index (accessor)
   * @returns {{attribute?: string, index?: string}}
   */
  get patternParts() : IDictionary {
    return /^(?<attribute>[^[\]]+)?(?:\[['"]?(?<index>[^'"]+)['"]?])?$/.exec(this.__pattern ?? '')?.groups ?? {};
  }

  /**
   * Result of traversal by current attribute name
   * @returns {*}
   */
  get property() : any {
    const result = this.__attribute != null ? this.target[this.__attribute] : this.target;
    return this.tryParseJson(result);
  }

  /**
   * Result of traversal by current index patterns using accessor syntax
   * @returns {*}
   */
  get propertyAtIndex() : any {
    if (this.__index) {
      return this.resolveIndex(this.property, this.__index);
    }

    return this.property;
  }

  /**
   * Final result of traversal
   * @returns {*}
   */
  get result() : any {
    const result = this.propertyAtIndex;
    return this.complete ? result : Resolve.resolve(result, this.__rest, this);
  }

  // Static members
  /**
   * Retrieve a value from a specified property path
   * @param {Object|Array} target Object or Array to be traversed
   * @param {string|string[]} patterns One or more strings used to traverse the path
   * @param {Resolve?} thisArg Optional argument to pass existing Resolve instance
   * @returns {*}
   */
  static resolve(target: null | undefined | IIndexed | IDictionary, patterns: string | string[], thisArg?: IResolve) : any {
    if (target == null) {
      return target;
    }

    if (thisArg instanceof Resolve) {
      thisArg.reset(target, patterns);
    }
    else {
      thisArg = new Resolve(target, patterns);
    }

    return thisArg.result;
  }
}
