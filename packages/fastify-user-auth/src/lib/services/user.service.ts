import type { PgDatabase, QueryResultHKT } from 'drizzle-orm/pg-core';
import type { UsernamePasswordSaltPGGenericTableType } from '../drizzle-partials';
import { AuthService } from './auth.service';
import { eq } from 'drizzle-orm';

export class UserService {
  constructor(
    private db: PgDatabase<QueryResultHKT>,
    private usersTable: UsernamePasswordSaltPGGenericTableType,
    private authService: AuthService,
  ) {}

  async createUser(username: string, password: string) {
    const salt = this.authService.createSalt();
    const hashedPassword = this.authService.hashPassword(password, salt);
    const inserts = await this.db
      .insert(this.usersTable)
      .values({
        username,
        password: hashedPassword,
        salt,
      })
      .returning({ username: this.usersTable.username });
    return inserts[0];
  }

  async addPasswordToUser(username: string, password: string) {
    const salt = this.authService.createSalt();
    const hashedPassword = this.authService.hashPassword(password, salt);
    const updated = await this.db
      .update(this.usersTable)
      .set({
        password: hashedPassword,
        salt,
      })
      .where(eq(this.usersTable.username, username))
      .returning({ username: this.usersTable.username });

    return updated[0];
  }
}
