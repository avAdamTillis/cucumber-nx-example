import { Console } from 'node:console';
import { Writable } from 'node:stream';

export class Logger extends Console {
  constructor(stdout?: Writable, stderr?: Writable, ignoreErrors = true) {
    super(stdout, stderr, ignoreErrors);
  }
}