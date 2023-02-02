import { Console } from 'node:console';
import { stdout as OUT } from 'node:process';
import { Writable } from 'node:stream';
import { inspect, InspectOptions } from 'node:util';

import '@cnxe/extensions';
import { LogLevelValue, NumericLogLevel } from '@cnxe/common';

enum LogLevel {
  Trace,
  Debug,
  Info,
  Log,
  Warn,
  Error
}

export class Logger extends Console {
  private _logLevel?: NumericLogLevel;
  private readonly additional: Writable[];
  private readonly groupNames: string[];
  
  constructor(stdout?: Writable, stderr?: Writable, ignoreErrors = true) {
    super(stdout ?? OUT, stderr, ignoreErrors);
    this.additional = [];
    this.groupNames = [];
  }
  
  debug(...data: any[]) {
    if(this.logLevel >= LogLevel.Debug) {
      this.write(...data);
    }
  }
  
  private static get defaultInspectOptions(): InspectOptions {
    return {
      breakLength: 120,
      compact: true,
      colors: false,
      customInspect: false,
      depth: 2,
      getters: 'get',
      maxArrayLength: 5,
      maxStringLength: 32,
      showHidden: true,
      showProxy: true,
      sorted: true
    };
  }
  
  private get defaultInspectOptions(): InspectOptions {
    return Object.assign(Logger.defaultInspectOptions, { colors: true });
  }
  
  error(...data: any[]) {
    if(this.logLevel >= LogLevel.Error) {
      this.write(...data);
    }
  }
  
  static formatObject(options: InspectOptions, obj: Record<string, unknown> | Array<unknown>): string {
    return inspect(obj, Object.assign({}, Logger.defaultInspectOptions, options));
  }
  
  private formatObject(obj: Record<string, unknown> | Array<unknown>): string {
    return inspect(obj, Object.assign({}, this.defaultInspectOptions));
  }
  
  groupDebug(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Debug, label, ...data);
  }
  
  override groupEnd(label?: string): void {
    // Remove most recent instance of specific label
    if (label) {
      this.groupNames.removeLast(label);
    }
    // Remove last label
    else {
      this.groupNames.pop();
    }
  }
  
  groupError(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Error, label, ...data);
  }
  
  private groupImpl(logLevel: LogLevel, label: string, ...data: any[]): void {
    if (logLevel < this.logLevel) {
      return;
    }
    
    this.groupNames.push(label);
    this.write(...data);
  }
  
  groupInfo(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Info, label, ...data);
  }
  
  groupLog(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Log, label, ...data);
  }
  
  private get groups(): number {
    return this.groupNames.length;
  }
  
  groupTrace(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Trace, label, ...data);
  }
  
  groupWarn(label = 'default', ...data: any[]): void {
    this.groupImpl(LogLevel.Warn, label, ...data);
  }
  
  private get indentation(): string {
    if (this.groups) {
      return '  '.repeat(this.groups);
    }
    
    return '';
  }
  
  info(...data: any[]) {
    if(this.logLevel >= LogLevel.Info) {
      this.write(...data);
    }
  }
  
  log(...data: any[]) {
    if(this.logLevel >= LogLevel.Log) {
      this.write(...data);
    }
  }
  
  get logLevel(): NumericLogLevel {
    if(this._logLevel == null) {
      this.setLogLevel(process.env.LOG_LEVEL ?? 'LOG');
    }
    
    return this._logLevel ?? LogLevel.Log;
  }
  
  set logLevel(value: LogLevelValue) {
    this.setLogLevel(value);
  }
  
  static printf(format: string, arg: string | number): string {
    const [specifier = ''] = /%[a-z%]/i.exec(format) || [];
    const formatInteger = new Intl.NumberFormat('en-us', { maximumFractionDigits: 0, useGrouping: false }).format;
    const formatFloat = new Intl.NumberFormat('en-us').format;
    const formatScientific = new Intl.NumberFormat('en-us', { notation: 'scientific' }).format;
    const stringArg = typeof arg === 'string' ? arg : `${arg}`;
    const numberArg = typeof arg === 'number' ? arg : Number(arg);
    
    switch (specifier) {
      case '%a':
      case '%x':
        return format.replace(specifier, numberArg.toString(16));
      case '%A':
      case '%X':
        return format.replace(specifier, numberArg.toString(16).toUpperCase());
      case '%b':
        return format.replace(specifier, arg ? 'Yes' : 'No');
      case '%c':
        return format.replace(specifier, stringArg.slice(0, 1));
      case '%d':
      case '%i':
        return format.replace(specifier, formatInteger(numberArg));
      case '%e':
        return format.replace(specifier, formatScientific(numberArg).toLowerCase());
      case '%E':
        return format.replace(specifier, formatScientific(numberArg).toUpperCase());
      case '%f':
      case '%g':
        return format.replace(specifier, formatFloat(numberArg));
      case '%F':
      case '%G':
        return format.replace(specifier, formatFloat(numberArg).toUpperCase());
      case '%o':
        return format.replace(specifier, numberArg.toString(8));
      case '%s':
        return format.replace(specifier, stringArg);
      case '%%':
        return format.replace(specifier, '%');
      default:
        return `${format} ${arg}`;
    }
  }
  
  setLogLevel(value: string | number) {
    switch(value.toString().toLowerCase()) {
      case 'debug':
        this._logLevel = LogLevel.Debug;
        break;
      case 'error':
        this._logLevel = LogLevel.Error;
        break;
      case 'info':
        this._logLevel = LogLevel.Info;
        break;
      case 'log':
        this._logLevel = LogLevel.Log;
        break;
      case 'trace':
        this._logLevel = LogLevel.Trace;
        break;
      case 'warn':
        this._logLevel = LogLevel.Warn;
        break;
      default:
        const numeric = typeof value === 'number' ? value : LogLevel.Log;
        this._logLevel = Math.max(Math.min(numeric, LogLevel.Error), LogLevel.Trace) as NumericLogLevel;
        break;
    }
  }
  
  trace(...data: any[]) {
    if(this.logLevel >= LogLevel.Trace) {
      this.write(...data);
    }
  }
  
  warn(...data: any[]) {
    if(this.logLevel >= LogLevel.Warn) {
      this.write(...data);
    }
  }
  
  private write(...data: any[]) {
    super.log(this.indentation, ...data);
    
    if(this.additional.length === 0) {
      return;
    }
    
    const [ first, ...rest ] = data;
    const formatted = this.formatObject(first);
    const message = rest
      // Stringify object-literals using util.inspect, otherwise pass the primitive for potential formatting
      .map(arg => (typeof arg === 'object' ? this.formatObject(arg) : arg))
      // Using the C-standard printf options, format a given argument using the original message string
      .reduce((msg, arg) => Logger.printf(msg, arg), formatted)
      // Add nested-level of indentation to new-line delimited entries so that they print correctly.
      // Line wraps in the console will not be accounted for in this implementation
      .split('\n')
      .join(`\n${this.indentation}`);
    
    
    for(const output of this.additional) {
      output.write(message);
    }
  }
}