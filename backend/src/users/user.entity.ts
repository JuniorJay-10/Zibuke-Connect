import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Contact } from '../contacts/contact.entity.js';

// An @Entity class describes one database table. TypeORM reads this class
// (via decorators) and creates/manages the matching Postgres table for us —
// we never write CREATE TABLE by hand.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // We NEVER store the plain password — only a bcrypt hash of it. Even if
  // the database were ever exposed, the original password can't be
  // recovered from this column.
  @Column()
  passwordHash: string;

  @Column()
  displayName: string;

  @Column({ default: false })
  emailVerified: boolean;

  // This user's browser-SIP extension (2000-2019), assigned lazily by
  // SipService the first time they request their SIP config — not every
  // user necessarily needs one, so we don't assign it eagerly at
  // registration. See sip/sip.service.ts and freeswitch/web-users.xml,
  // which defines matching FreeSWITCH-side accounts for this range.
  @Column({ unique: true, nullable: true })
  sipExtension: string;

  // The "other side" of Contact's @ManyToOne relation below. This doesn't
  // create a database column — it just gives us a convenient way to write
   @OneToMany(() => Contact, (contact) => contact.owner)
  contacts: Relation<Contact>[];
}