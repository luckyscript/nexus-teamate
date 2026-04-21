import { Repository, FindManyOptions, FindOneOptions, ObjectLiteral, FindOptionsWhere, FindOptionsOrder } from 'typeorm';

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FindAndPaginateOptions {
  orderBy?: Record<string, 'ASC' | 'DESC'>;
}

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options?: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async remove(entity: T): Promise<T> {
    return this.repository.remove(entity);
  }

  async createQueryRunner() {
    return this.repository.manager.connection.createQueryRunner();
  }

  async paginate(options: { tenantId: number; page?: number; pageSize?: number }, extraWhere?: Record<string, unknown>): Promise<{ items: T[]; total: number }> {
    const { tenantId, page = 1, pageSize = 20 } = options;
    const [items, total] = await this.repository.findAndCount({
      where: { tenantId, ...(extraWhere || {}) } as FindOptionsWhere<T>,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async findAndPaginate(
    where: FindOptionsWhere<T>,
    page: number,
    pageSize: number,
    options?: FindAndPaginateOptions,
  ): Promise<PageResult<T>> {
    const order: FindOptionsOrder<T> = {};
    if (options?.orderBy) {
      for (const [key, value] of Object.entries(options.orderBy)) {
        (order as Record<string, 'ASC' | 'DESC'>)[key] = value;
      }
    } else {
      (order as Record<string, 'ASC' | 'DESC'>).createdAt = 'DESC';
    }
    const [list, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order,
    });
    return { list, total, page, pageSize };
  }
}
