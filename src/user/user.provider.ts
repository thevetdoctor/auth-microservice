import { USER_REPOSITORY } from 'src/utils';
import { Users } from './user.entity';

export const UserProviders = [
  {
    provide: USER_REPOSITORY,
    useValue: Users,
  },
];
