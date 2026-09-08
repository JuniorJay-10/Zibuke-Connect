import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { User } from '../users/user.entity.js';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  // A FreeSWITCH extension number (e.g. "1001"), if this contact is
  // reachable by SIP call, not just meetings/chat.
  @Column({ nullable: true })
  extension: string;

  // Every contact belongs to exactly one user (whoever added them) — this
  // is what keeps one user's contact list private from another's.
  // Relation<User> (not just User) is TypeORM's own fix for exactly this
  // situation: two entities that reference each other. Without it,
  // TypeScript's decorator metadata tries to eagerly reference the User
  // class the instant this file loads, which crashes because User's file
  // is, at that exact moment, still loading Contact.
  @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
  owner: Relation<User>;

  @Column()
  ownerId: string;
}