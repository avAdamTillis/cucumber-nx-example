import { After, Before, setWorldConstructor } from '@cucumber/cucumber';

import { CustomWorld } from '@cnxe/steps';

setWorldConstructor(CustomWorld);
Before(CustomWorld.prototype.init);
Before({ tags: '@ui' }, CustomWorld.prototype.initUi);
After(CustomWorld.prototype.dispose);
