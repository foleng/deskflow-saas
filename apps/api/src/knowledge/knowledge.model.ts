import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'knowledge_base' })
export class Knowledge extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  category: string;

  @Column({
    type: DataType.JSON,
    defaultValue: []
  })
  tags: string[];

  @Column({
    type: DataType.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  views: number;
}
