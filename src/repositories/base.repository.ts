import { DatabaseService } from '../database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected readonly db: DatabaseService,
    private readonly table: string,
  ) {}

  async findAll(): Promise<T[]> {
    return this.db.query<T>(`SELECT * FROM ${this.table}`);
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.table} WHERE id = $1`,
      [id],
    );
    return result.length ? result[0] : null;
  }

  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const formattedValues = keys.map((item, i) => `$${i + 1}`).join(',');

    const query = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${formattedValues}) RETURNING *`;
    const result = await this.db.query<T>(query, values);
    return result[0];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const updateQuery = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const query = `UPDATE ${this.table} SET ${updateQuery} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await this.db.query<T>(query, [...values, id]);
    return result.length ? result[0] : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query<T>(
      `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.length > 0;
  }

  async findByQuery(query: Partial<T>): Promise<T[]> {
    if (!query || Object.keys(query).length === 0) {
      return this.findAll();
    }

    const keys = Object.keys(query);
    const values = Object.values(query);
    const conditions = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');

    const sql = `SELECT * FROM ${this.table} WHERE ${conditions}`;
    return await this.db.query(sql, values);
  }
}
