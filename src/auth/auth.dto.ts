import { ApiProperty } from '@nestjs/swagger';
import { AppRole, BaseResponseTypeDTO } from 'src/utils';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    example: 'consultoba@gmail.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'User password (min 6 characters)',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class SignupDTO {
  @ApiProperty({
    example: 'consultoba@gmail.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    example: AppRole.ADMIN,
    description: 'Role assigned to the user (e.g., USER, ADMIN)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  role: string;
}

export class AuthResponse extends BaseResponseTypeDTO {
  @ApiProperty()
  isNewUser: boolean;

  @ApiProperty({ nullable: true })
  token?: string;

  @ApiProperty({ nullable: true })
  data?: Object;
}
