import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'agents' })
export class Agent extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  nickname: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 5
  })
  max_chats: number;
}
