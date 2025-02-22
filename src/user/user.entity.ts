import { ApiProperty } from '@nestjs/swagger';
import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { AppRole } from 'src/utils';

@Table({ schema: process.env.DB_SCHEMA })
export class Users extends Model {
  @ApiProperty()
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty()
  @Column
  email: string;

  @ApiProperty()
  @Column
  password: string;

  @ApiProperty()
  @Column
  firstName: string;

  @ApiProperty()
  @Column
  lastName: string;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isNewUser: boolean;

  @ApiProperty({ enum: AppRole })
  @Column({
    type: DataType.STRING,
    values: Object.values(AppRole),
    defaultValue: AppRole.ADMIN,
  })
  role: string;

  @ApiProperty()
  @Column(DataType.STRING)
  verificationCode: string;

  @ApiProperty()
  @Column({
    allowNull: false,
    defaultValue: true,
    type: DataType.BOOLEAN,
  })
  status: boolean;

  @ApiProperty()
  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  isDeleted: boolean;

  @ApiProperty()
  @CreatedAt
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @ApiProperty()
  @UpdatedAt
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;
}
