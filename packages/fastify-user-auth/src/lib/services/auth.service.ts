import type { PgDatabase, QueryResultHKT } from 'drizzle-orm/pg-core';
import type { UsernamePasswordSaltPGGenericTableType } from '../drizzle-partials';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';

export class AuthService {
  constructor(
    private db: PgDatabase<QueryResultHKT>,
    private usersTable: UsernamePasswordSaltPGGenericTableType,
    private jwtSecret: string,
  ) {}

  async canLogin(username: string, password: string) {
    const users = await this.db
      .select({
        username: this.usersTable.username,
        password: this.usersTable.password,
        salt: this.usersTable.salt,
      })
      .from(this.usersTable)
      .where(eq(this.usersTable.username, username));

    if (users.length === 0) {
      return false;
    }

    const user = users[0];
    return this.compareHashedPassword(password, user.salt, user.password);
  }

  createAuthToken(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { username },
        this.jwtSecret,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        },
      );
    });
  }

  checkAuthToken(token: string): Promise<{ username: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.jwtSecret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as { username: string });
        }
      });
    });
  }

  compareHashedPassword(password: string, salt: string, hash: string) {
    const hashedPassword = this.hashPassword(password, salt);
    return hashedPassword === hash;
  }

  hashPassword(password: string, salt: string) {
    return createHash('sha512').update(password).update(salt).digest('hex');
  }

  createSalt() {
    return randomBytes(64).toString('hex');
  }
}
