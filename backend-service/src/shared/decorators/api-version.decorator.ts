import { SetMetadata } from '@nestjs/common';

import { API_VERSION_KEY } from '../constants';

export const ApiVersion = (version: string): MethodDecorator & ClassDecorator =>
  SetMetadata(API_VERSION_KEY, version);
