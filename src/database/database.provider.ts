import { Sequelize } from 'sequelize-typescript';
import { databaseConfig } from './config';
import { Users } from 'src/user/user.entity';
import { DEVELOPMENT, PRODUCTION, SEQUELIZE, TEST } from 'src/utils';

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
        default:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
      }
      let sequelize: any;
      const DB_LOGGING = process.env.DB_LOGGING ? true : false;
      const NODE_ENV = process.env.NODE_ENV
        ? process.env.NODE_ENV
        : DEVELOPMENT;
      console.log('DB_LOGGING', DB_LOGGING);
      console.log('NODE_ENV', NODE_ENV);
      // console.log('databaseConfig', databaseConfig[NODE_ENV])
      if (process.env.NODE_ENV !== 'test') {
        sequelize = new Sequelize(config.urlDatabase, {
          logging: DB_LOGGING,
          dialectOptions: {
            ssl: false,
          },
          schema: process.env.DB_SCHEMA,
        });
      } else {
        sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: ':memory:',
          logging: DB_LOGGING,
        });
      }
      sequelize.addModels([Users]);

      try {
        await sequelize.sync({ alter: true });
      } catch (err) {
        console.error('Error with DB sync:', err);
      }
      return sequelize;
    },
  },
];
