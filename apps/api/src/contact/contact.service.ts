import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from './contact.model';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact)
    private contactModel: typeof Contact,
  ) {}

  async findAll() {
    return this.contactModel.findAll({
      order: [['updatedAt', 'DESC']],
    });
  }

  async create(data: any) {
    return this.contactModel.create(data);
  }

  async update(id: number, data: any) {
    const contact = await this.contactModel.findByPk(id);
    if (contact) {
      return contact.update(data);
    }
    return null;
  }

  async remove(id: number) {
    const contact = await this.contactModel.findByPk(id);
    if (contact) {
      return contact.destroy();
    }
  }
}
