import { APIKEY_REPOSITORY } from 'src/utils';
import { Apikeys } from './apikey.entity';

export const ApikeyProviders = [
  {
    provide: APIKEY_REPOSITORY,
    useValue: Apikeys,
  },
];
