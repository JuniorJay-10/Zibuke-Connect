import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity.js';
import { CreateContactDto } from './dto.js';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contacts: Repository<Contact>,
  ) {}

  // Every method here takes ownerId explicitly and filters by it — this
  // is what stops one logged-in user from ever seeing or modifying
  // another user's contacts, at the data-access layer, not just in the UI.
  findAllForUser(ownerId: string) {
    return this.contacts.find({ where: { ownerId }, order: { name: 'ASC' } });
  }

  async create(ownerId: string, dto: CreateContactDto) {
    const contact = this.contacts.create({ ...dto, ownerId });
    return this.contacts.save(contact);
  }
}