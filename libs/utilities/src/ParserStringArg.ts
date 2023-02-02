import { ICustomWorld, IWorldConfig } from '@cnxe/common';
import { logger } from '@cnxe/logger';

import { CaselessMap } from './CaselessMap';
import { ObjectOperations } from './ObjectOperations';
import { Resolve } from './Resolve';

declare type StringHandler<T> = (val: string) => T;
const format = /^(?<type>\w+):(?<value>.*)$/s;
const extensions = new CaselessMap<StringHandler<any>>();

export class ParserStringArg {
  private readonly _config: IWorldConfig;
  
  private readonly _state?: ICustomWorld;
  
  private defaultValue: string;
  
  private type: keyof this;
  
  private value: string;
  
  constructor(state?: ICustomWorld) {
    this.defaultValue = '';
    this._state = state;
    this._config = state?.config ?? {};
    this.type = 'undefined';
    this.value = '';
  }
  
  get arr(): Array<unknown> {
    return JSON.parse(this.value);
  }
  
  get array(): Array<unknown> {
    return this.arr;
  }
  
  get bool(): boolean {
    return /(true|yes|y|1)/i.test(this.value);
  }
  
  get boolean(): boolean {
    return this.bool;
  }
  
  get config(): unknown {
    return Resolve.resolve(this._config, this.value);
  }
  
  /**
   * Extend functionality of the StringArgParse class
   * @param {string} name
   * @param {StringHandler<T>} handler
   * @template T
   */
  static extend<T>(name: string, handler: StringHandler<T>) {
    extensions.set(name, handler);
    return ParserStringArg;
  }
  
  /**
   * Extend functionality of the StringArgParse class
   * @param {string} name
   * @param {StringHandler<T>} handler
   * @template T
   */
  extend<T>(name: string, handler: StringHandler<T>): this {
    extensions.set(name, handler);
    return this;
  }
  
  get float(): number {
    return this.num;
  }
  
  get int(): number {
    return Math.round(Number(this.value));
  }
  
  get integer(): number {
    return this.int;
  }
  
  get isNested() {
    const result = format.test(this.value);
    logger.trace('Checking if "%s" is a nested parse target => %b', this.value, result);
    return result;
  }
  
  get isSupported(): boolean {
    const ops = new ObjectOperations(this);
    return ops.has(this.type);
  }
  
  get json(): any {
    return JSON.parse(this.value);
  }
  
  get list(): Array<unknown> {
    return this.arr;
  }
  
  get object(): Record<string, unknown> {
    return this.json;
  }
  
  get nil(): null {
    return this.null;
  }
  
  get null(): null {
    return null;
  }
  
  get num(): number {
    return Number(this.value);
  }
  
  get number(): number {
    return this.num;
  }
  
  parse<T>(val: `arr:${any}`): T[];
  parse<T>(val: `array:${any}`): T[];
  parse(val: `bool:${true|false|1|0|'yes'|'no'}`): boolean;
  parse(val: `boolean:${true|false|1|0|'yes'|'no'}`): boolean;
  parse<T>(val: `config:${keyof IWorldConfig}`): T;
  parse(val: `float:${number}`): number;
  parse(val: `int:${number}`): number;
  parse(val: `integer:${number}`): number;
  parse<T>(val: `json:${any}`): T;
  parse<T>(val: `list:${any}`): T[];
  parse(val: `nil:${any}`): null;
  parse(val: `null:${any}`): null;
  parse(val: `num:${number}`): number;
  parse(val: `number:${number}`): number;
  parse<T>(val: `object:${any}`): T;
  parse(val: `this:${any}`): ICustomWorld;
  parse(val: `undefined:${any}`): undefined;
  parse<T>(val: string): T;
  parse<T>(val: string): T {
    logger.trace('Assign original arg as this.defaultValue');
    this.defaultValue = val;
    
    if (!format.test(val)) {
      return val as T;
    }
    
    // @ts-ignore
    ({ type: this.type = 'defaultValue', value: this.value } = format.exec(val)?.groups ?? {});
    logger.debug('Resolved arg (%s) => %s', this.type, this.value);
    this.value = this.isNested ? ParserStringArg.parse(this.value, this._state) : this.value;
    return this.result;
  }
  
  static parse<T>(val: string, state?: ICustomWorld): T {
    return new ParserStringArg(state).parse<T>(val) as T;
  }
  
  get result(): any {
    const { type, defaultValue, isSupported } = this;
    return isSupported ? Resolve.resolve(this, type as string) : defaultValue;
  }
  
  get state(): any {
    return this._state ? Resolve.resolve(this._state, this.value) : this.defaultValue;
  }
  
  get this(): ICustomWorld {
    return this.state;
  }
  
  get undefined(): void {
    return undefined;
  }
}
