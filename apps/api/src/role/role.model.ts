import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'roles' })
export class Role extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  name: string; // 'admin', 'agent', etc.

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: []
  })
  permissions: Array<{ action: string; subject: string }>; // e.g., [{ action: 'manage', subject: 'all' }]
}
