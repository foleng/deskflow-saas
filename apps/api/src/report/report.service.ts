import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from '../conversation/conversation.model';
import { Agent } from '../agent/agent.model';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Conversation)
    private conversationModel: typeof Conversation,
    @InjectModel(Agent)
    private agentModel: typeof Agent,
  ) {}

  async getOverviewStats(startDate: Date, endDate: Date) {
    const whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };

    // 1. Total Conversations
    const totalConversations = await this.conversationModel.count({ where: whereClause });

    // 2. Resolved Conversations
    const resolvedConversations = await this.conversationModel.count({
      where: {
        ...whereClause,
        status: 'closed',
      },
    });

    // 3. Average CSAT
    const csatResult = await this.conversationModel.findAll({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('score')), 'avgScore']],
      where: {
        ...whereClause,
        score: { [Op.ne]: null },
      },
      raw: true,
    });
    const avgCsat = csatResult[0]?.['avgScore'] ? parseFloat(csatResult[0]['avgScore']).toFixed(1) : '0.0';

    // 4. Response Time (Mocked for now)
    const avgResponseTime = '2m 30s';

    return {
      totalConversations,
      resolvedConversations,
      avgCsat,
      avgResponseTime,
    };
  }

  async getVolumeChart(startDate: Date, endDate: Date) {
    // Group by date
    // Note: This query is database specific. Assuming MySQL here.
    const volumeData = await this.conversationModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'incoming'],
        [
          Sequelize.fn(
            'SUM',
            Sequelize.literal("CASE WHEN status = 'closed' THEN 1 ELSE 0 END")
          ),
          'resolved',
        ],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    return volumeData;
  }

  async getAgentPerformance(startDate: Date, endDate: Date) {
    const agentStats = await this.conversationModel.findAll({
      attributes: [
        'agent_id',
        [Sequelize.fn('COUNT', Sequelize.col('Conversation.id')), 'volume'],
        [Sequelize.fn('AVG', Sequelize.col('score')), 'avgRating'],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        agent_id: { [Op.ne]: null },
      },
      include: [
        {
          model: Agent,
          attributes: ['id', 'nickname', 'avatar'],
        },
      ],
      group: ['Conversation.agent_id', 'agent.id', 'agent.nickname', 'agent.avatar'],
      raw: true,
      nest: true,
    });

    return agentStats.map((stat: any) => ({
      key: stat.agent.id,
      name: stat.agent.nickname,
      avatar: stat.agent.avatar,
      volume: parseInt(stat.volume),
      avgTime: '1m 30s', // Mocked
      rating: stat.avgRating ? parseFloat(stat.avgRating).toFixed(1) : 'N/A',
    }));
  }
}
