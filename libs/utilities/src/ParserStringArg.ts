import { Resolve } from './Resolve';

export class ParserStringArg {
    private readonly _config: Record<string, any>;

    private readonly _state?: Record<string, any>;

    private defaultValue: string;

    private type: keyof this;

    private value: string;

    constructor(config?: Record<string, any>, state?: Record<string, any>) {
      this._config = config || {};
      this.defaultValue = '';
      this._state = state;
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

    get float(): number {
      return this.num;
    }

    get int(): number {
      return Math.round(Number(this.value));
    }

    get integer(): number {
      return this.int;
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

    static parse<T>(val: string, config?: IAvailityConfig, state?: IAvailityWorld): T {
      return new ParserStringArg(val, config, state).result as T;
    }

    get result(): any {
      const { type, defaultValue, isSupported } = this;
      return isSupported ? Resolve.resolve(this, type as string) : defaultValue;
    }

    get state(): any {
      return this._state ? Resolve.resolve(this._state, this.value) : this.defaultValue;
    }

    get this(): IAvailityWorld {
      return this.state;
    }

    get undefined(): void {
      return undefined;
    }
  }
