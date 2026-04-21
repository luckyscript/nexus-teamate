import { SelectQueryBuilder } from 'typeorm';
import { SortCondition } from '../../common/types';

export class QueryHelper {
  static applyPagination<T>(
    qb: SelectQueryBuilder<T>,
    page: number,
    pageSize: number,
  ): SelectQueryBuilder<T> {
    return qb.skip((page - 1) * pageSize).take(pageSize);
  }

  static applyTenantFilter<T>(
    qb: SelectQueryBuilder<T>,
    tenantId: number,
    alias = 'entity',
  ): SelectQueryBuilder<T> {
    return qb.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
  }

  static applyKeywordFilter<T>(
    qb: SelectQueryBuilder<T>,
    keyword: string | undefined,
    fields: string[],
    alias = 'entity',
  ): SelectQueryBuilder<T> {
    if (!keyword) return qb;

    const conditions = fields.map((f, i) => `${alias}.${f} LIKE :kw${i}`);
    const params: Record<string, string> = {};
    fields.forEach((_, i) => {
      params[`kw${i}`] = `%${keyword}%`;
    });

    return qb.andWhere(`(${conditions.join(' OR ')})`, params);
  }

  static applySorting<T>(
    qb: SelectQueryBuilder<T>,
    sort: SortCondition[],
    alias = 'entity',
  ): SelectQueryBuilder<T> {
    if (sort.length === 0) {
      return qb.orderBy(`${alias}.createdAt`, 'DESC');
    }

    sort.forEach((s, i) => {
      const method = i === 0 ? 'orderBy' : 'addOrderBy';
      qb[method](`${alias}.${s.field}`, s.order);
    });

    return qb;
  }

  static applySoftDeleteFilter<T>(
    qb: SelectQueryBuilder<T>,
    alias = 'entity',
  ): SelectQueryBuilder<T> {
    return qb.andWhere(`${alias}.deletedAt IS NULL`);
  }
}
