import { DataSource, QueryRunner } from 'typeorm';

export class TransactionHelper {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    handler: (queryRunner: QueryRunner) => Promise<T>,
    isolationLevel?: string,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    try {
      const result = await handler(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
