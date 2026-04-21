export interface PaginationResult<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
  requestId: string;
}

export interface TenantContext {
  tenantId: number;
  userId: number;
  roles: string[];
  permissions: string[];
}

export interface CurrentUser {
  id: number;
  tenantId: number;
  username: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

export type SortOrder = 'ASC' | 'DESC';

export interface SortCondition {
  field: string;
  order: SortOrder;
}
