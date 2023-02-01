import { IWorld, IWorldOptions, World } from '@cucumber/cucumber';

import { IConfiguration, IWorldParameters } from './interfaces';

export class CustomWorld extends World implements IWorld<IWorldParameters> {
  [key: string]: any;
  
  private readonly config: IConfiguration;
  
  constructor(options: IWorldOptions<IWorldParameters>) {
    super(options);
    
    const { config = {} } = options.parameters;
    this.config = config;
  }
  
  dispose(): Promise<void> {
    // asynchronous disposal of resources
    return Promise.resolve();
  }
  
  init(): Promise<void> {
    // asynchronous constructor initialization
    return Promise.resolve();
  }
  
  initUi(): Promise<void> {
    // asynchronous constructor initialization for UI steps (tag @ui)
    return Promise.resolve();
  }
}