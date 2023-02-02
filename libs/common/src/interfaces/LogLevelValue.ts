export type LowercaseLogLevel = 'debug' | 'error' | 'info' | 'log' | 'trace' | 'warn';
export type NumericLogLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UppercaseLogLevel = Uppercase<LowercaseLogLevel>;
export type StringLogLevel = LowercaseLogLevel | UppercaseLogLevel | `${NumericLogLevel}`
export type LogLevelValue = StringLogLevel | NumericLogLevel;