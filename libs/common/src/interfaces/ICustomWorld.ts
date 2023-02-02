import type { IWorld } from '@cucumber/cucumber';

import { IWorldConfig } from './IWorldConfig';

export interface ICustomWorld extends IWorld {
  [key: string]: any;
  
  config: IWorldConfig;
  
  
}