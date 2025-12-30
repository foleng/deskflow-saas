import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Agent } from '../agent/agent.model';

@Table({ tableName: 'conversations' })
export class Conversation extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  visitor_uuid: string;

  @ForeignKey(() => Agent)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  agent_id: number;

  @BelongsTo(() => Agent)
  agent: Agent;

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
