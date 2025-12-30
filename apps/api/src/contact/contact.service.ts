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

  async importContacts(file: Express.Multer.File): Promise<number> {
    if (!file) {
      throw new Error('No file provided');
    }

    const content = file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/);
    
    // Simple CSV parser
    // Assuming header: Name,Email,Phone,Company,Tags
    // Skip header
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    
    let count = 0;
    for (const line of dataLines) {
      // Handle quoted values vaguely (this is a simple parser, not robust for all CSV edge cases)
      // For now, let's assume simple CSV without internal commas in fields unless quoted
      // A better approach without library is splitting by comma but respecting quotes
      const values = this.parseCSVLine(line);
      
      if (values.length >= 2) { // At least Name and Email
        const [name, email, phone, company_name, tagsStr] = values;
        
        try {
          await this.contactModel.create({
            name: name?.trim(),
            email: email?.trim(),
            phone: phone?.trim(),
            company_name: company_name?.trim(),
            tags: tagsStr ? tagsStr.split(',').map(t => t.trim()) : [],
            last_active: new Date(),
          });
          count++;
        } catch (err) {
          console.error(`Failed to import line: ${line}`, err);
          // Continue with next line
        }
      }
    }
    
    return count;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    
    return result.map(val => val.trim().replace(/^"|"$/g, ''));
  }
}
