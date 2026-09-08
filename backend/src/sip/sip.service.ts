import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../users/user.entity.js';

// Browser (SIP.js) callers all live in this extension range — kept
// separate from FreeSWITCH's vanilla 1000-1019 range so browser users and
// traditional softphones (MicroSIP, etc.) never collide on the same
// extension number. freeswitch/web-users.xml defines the matching
// FreeSWITCH-side directory entries for 2000-2019.
const EXTENSION_RANGE_START = 2000;
const EXTENSION_RANGE_END = 2019;

// All browser extensions share one demo password (see
// freeswitch/web-users.xml, which uses the same value). That's fine for
// this assessment's sandbox; a real deployment would issue each user
// their own generated SIP credential instead.
const SIP_DEMO_PASSWORD = process.env.SIP_DEMO_PASSWORD ?? 'ZibukeSip2026!';

@Injectable()
export class SipService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  // Returns this user's browser SIP credentials, assigning them the next
  // free extension the first time they're asked for — most users never
  // need to call this endpoint until they actually open the app with SIP
  // enabled, so there's no reason to hand out an extension at registration.
  async getConfigForUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.sipExtension) {
      user.sipExtension = await this.assignExtension();
      await this.users.save(user);
    }

    return {
      extension: user.sipExtension,
      password: SIP_DEMO_PASSWORD,
    };
  }

  private async assignExtension(): Promise<string> {
    const assigned = await this.users.find({
      where: { sipExtension: Not(IsNull()) },
      select: { sipExtension: true },
    });
    const used = new Set(assigned.map((u) => u.sipExtension));

    for (let ext = EXTENSION_RANGE_START; ext <= EXTENSION_RANGE_END; ext++) {
      const candidate = String(ext);
      if (!used.has(candidate)) return candidate;
    }

    // Only 20 slots exist for this assessment's demo environment — a real
    // deployment would widen the range or generate extensions on demand.
    throw new Error('No browser SIP extensions available (2000-2019 are all in use)');
  }
}
