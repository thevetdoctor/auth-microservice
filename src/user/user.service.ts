import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  AppRole,
  checkForRequiredFields,
  compareEnumValueFields,
  hashPassword,
  USER_REPOSITORY,
  validateEmailField,
} from 'src/utils';
import { Users } from './user.entity';
import { sign } from 'jsonwebtoken';
import { SignupDTO } from 'src/auth/auth.dto';
const randomId = require('oba-random-id');

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: typeof Users,
  ) {}

  async findUserByEmail(email: string): Promise<any> {
    const record = await this.userRepo.findOne({
      where: { email, IsDeleted: false },
    });
    if (!record?.id) {
      return null;
    }
    return record;
  }

  async createUser(payload: SignupDTO): Promise<Users> {
    try {
      const { email, role } = payload;

      checkForRequiredFields(
        ['firstName', 'lastName', 'email', 'role'],
        payload,
      );
      compareEnumValueFields(role, Object.values(AppRole), 'role');
      validateEmailField(email);

      const defaultUserPassword = randomId(9, 'alphanumeric');

      // const passwordValidation = validatePassword(password);
      // if (!passwordValidation) {
      //   const message =
      //     'Password must contain at least 8 characters, at least 1 capital letter, 1 number and 1 special character';
      //   throw new BadRequestException(message);
      // }

      const record = await this.findUserByEmail(email);
      if (record?.id) {
        throw new ConflictException('User already exists with similar email');
      }
      const hashedPassword = await hashPassword(defaultUserPassword);

      const createdUser = await this.userRepo.create({
        ...payload,
        role: role.toLowerCase(),
        password: hashedPassword,
      });
      const newUser = await this.userRepo.findOne({
        where: {
          id: createdUser.id,
        },
        attributes: {
          exclude: ['password', 'verificationCode'],
        },
        raw: true,
      });
      return newUser;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
