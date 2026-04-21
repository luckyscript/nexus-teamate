export class BusinessException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly data: unknown;

  constructor(code: string, message: string, statusCode = 400, data?: unknown) {
    super(message);
    this.name = 'BusinessException';
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
  }

  static unauthorized(message = 'Unauthorized'): BusinessException {
    return new BusinessException('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Forbidden'): BusinessException {
    return new BusinessException('FORBIDDEN', message, 403);
  }

  static notFound(message = 'Resource not found'): BusinessException {
    return new BusinessException('RESOURCE_NOT_FOUND', message, 404);
  }

  static validationError(message: string, data?: unknown): BusinessException {
    return new BusinessException('VALIDATION_ERROR', message, 422, data);
  }

  static internalError(message = 'Internal server error'): BusinessException {
    return new BusinessException('INTERNAL_ERROR', message, 500);
  }

  static taskStatusInvalid(message = 'Invalid task status transition'): BusinessException {
    return new BusinessException('TASK_STATUS_INVALID', message, 400);
  }

  static agentExecutionFailed(message = 'Agent execution failed'): BusinessException {
    return new BusinessException('AGENT_EXECUTION_FAILED', message, 400);
  }

  static automationRuleInvalid(message = 'Invalid automation rule'): BusinessException {
    return new BusinessException('AUTOMATION_RULE_INVALID', message, 400);
  }

  static connectorAuthFailed(message = 'Connector authentication failed'): BusinessException {
    return new BusinessException('CONNECTOR_AUTH_FAILED', message, 400);
  }

  static assetPublishDenied(message = 'Asset publish permission denied'): BusinessException {
    return new BusinessException('ASSET_PUBLISH_DENIED', message, 403);
  }

  static tenantMismatch(message = 'Tenant context mismatch'): BusinessException {
    return new BusinessException('TENANT_MISMATCH', message, 403);
  }

  static optimisticLock(message = 'Resource has been modified by another request'): BusinessException {
    return new BusinessException('OPTIMISTIC_LOCK', message, 409);
  }
}
