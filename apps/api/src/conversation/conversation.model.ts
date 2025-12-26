import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'conversations' })
export class Conversation extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  visitor_uuid: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  agent_id: number;

  @Column({
    type: DataType.ENUM('open', 'closed'),
    defaultValue: 'open'
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  score: number;

  @Column({
      type: DataType.DATE,
      allowNull: true
  })
  end_time: Date;
}
