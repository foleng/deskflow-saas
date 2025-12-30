import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'contacts' })
export class Contact extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  company_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  avatar: string;

  @Column({
    type: DataType.JSON,
    defaultValue: []
  })
  tags: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true
  })
  visitor_uuid: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  last_active: Date;
}
