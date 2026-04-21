# Nexus Teammate Midwayjs 模块与脚手架设计

## 1. 文档目标

本文档用于基于当前产品文档、技术方案、数据库设计和 OpenAPI 草案，细化 Nexus Teammate 在 `Midwayjs + TypeORM + MySQL + Redis` 技术栈下的后端模块划分、目录结构、分层约束、进程模型和脚手架设计。

目标不是描述业务，而是解决以下问题：
1. 代码应该如何组织
2. 模块边界如何划分
3. HTTP 服务与 Worker 如何共享能力
4. 哪些能力属于公共基础设施，哪些属于业务域
5. MVP 阶段应该先搭哪些骨架

## 2. 设计原则

1. 以领域模块为主组织代码，而不是按技术类型平铺。
2. Controller 只处理协议层，不承载业务逻辑。
3. Application Service 负责用例编排，Domain Service 负责领域规则。
4. Repository 负责数据读写，不反向依赖 Controller。
5. HTTP 与 Worker 共用领域层和基础设施层，不复制逻辑。
6. 异步执行链路与同步接口链路共享同一套实体、事件和服务。

## 3. 推荐工程形态

MVP 阶段建议使用单仓单服务工程，但在运行时拆成两类进程：

1. `api` 进程
   负责 REST API、Webhook 接入、SSE 推送、管理端接口。
2. `worker` 进程
   负责 Agent 执行、自动化异步动作、连接器同步、Outbox 事件投递。

优势：
1. 代码复用高
2. 部署简单
3. 逻辑边界可提前固定
4. 后续可平滑拆分为独立服务

## 4. 建议目录结构

```text
nexus-teammate/
├─ src/
│  ├─ app.ts
│  ├─ configuration.ts
│  ├─ constants/
│  ├─ common/
│  │  ├─ base/
│  │  ├─ dto/
│  │  ├─ enums/
│  │  ├─ errors/
│  │  ├─ interfaces/
│  │  ├─ types/
│  │  └─ utils/
│  ├─ middleware/
│  ├─ filter/
│  ├─ guard/
│  ├─ interceptor/
│  ├─ decorator/
│  ├─ config/
│  ├─ framework/
│  │  ├─ db/
│  │  ├─ cache/
│  │  ├─ queue/
│  │  ├─ event/
│  │  ├─ logger/
│  │  ├─ auth/
│  │  ├─ storage/
│  │  └─ sse/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ project/
│  │  ├─ board/
│  │  ├─ task/
│  │  ├─ automation/
│  │  ├─ agent/
│  │  ├─ asset/
│  │  ├─ connector/
│  │  ├─ analytics/
│  │  ├─ audit/
│  │  └─ system/
│  ├─ jobs/
│  │  ├─ agent/
│  │  ├─ automation/
│  │  ├─ connector/
│  │  └─ outbox/
│  └─ subscribers/
├─ test/
├─ ormconfig/
├─ scripts/
├─ docs/
└─ openapi.yaml
```

## 5. 分层规范

每个业务模块建议统一如下结构：

```text
modules/task/
├─ controller/
├─ app/
├─ domain/
├─ entity/
├─ repository/
├─ dto/
├─ assembler/
├─ event/
├─ service/
└─ constants/
```

### 5.1 各层职责

#### `controller`
1. 接收 HTTP 请求
2. 参数校验
3. 调用 Application Service
4. 转换返回格式

不得做：
1. 复杂业务判断
2. Repository 直接读写
3. 事务控制

#### `app`
Application Service 层。

职责：
1. 编排一个完整用例
2. 协调多个 Domain Service / Repository
3. 负责事务边界
4. 发布领域事件或 Outbox 事件

#### `domain`
Domain Service 层。

职责：
1. 封装核心规则
2. 校验状态流转
3. 构造领域命令和领域结果

#### `entity`
1. TypeORM Entity
2. 仅描述持久化结构
3. 不要把复杂业务逻辑塞进 Entity

#### `repository`
职责：
1. 负责实体查询、写入、分页和锁控制
2. 封装 QueryBuilder 细节
3. 提供面向领域的读写方法

#### `dto`
职责：
1. Controller 请求和响应对象
2. 输入参数校验
3. OpenAPI 对齐

#### `assembler`
职责：
1. Entity -> DTO
2. Domain Result -> Response VO
3. 外部请求 -> 内部 Command

#### `event`
职责：
1. 定义领域事件
2. Outbox 事件名常量
3. 事件 Payload 结构

#### `service`
仅保留技术型或适配型 service。

例如：
1. `task-read.service.ts`
2. `task-search.service.ts`

## 6. 模块边界设计

## 6.1 auth 模块

职责：
1. 当前用户上下文
2. Token 解析
3. 权限判断
4. 租户上下文注入

建议文件：

```text
modules/auth/
├─ controller/auth.controller.ts
├─ app/auth-app.service.ts
├─ domain/permission.service.ts
├─ dto/auth.dto.ts
└─ service/current-user.service.ts
```

## 6.2 project 模块

职责：
1. 项目 CRUD
2. 项目成员与基础配置
3. 项目级权限

## 6.3 board 模块

职责：
1. 看板 CRUD
2. 列配置
3. 状态列顺序与布局
4. 状态流转配置入口

## 6.4 task 模块

职责：
1. 任务创建、更新、详情、评论
2. 看板任务查询
3. 状态流转
4. 人工接管
5. 任务事件记录

这是 MVP 的核心模块，优先级最高。

## 6.5 automation 模块

职责：
1. 自动化规则管理
2. DSL 校验
3. 规则匹配与动作分发
4. 规则执行记录

与 task 模块的边界：
1. task 负责变更任务
2. automation 负责决定是否触发动作

## 6.6 agent 模块

职责：
1. Agent 定义管理
2. Agent 执行入口
3. 执行状态读写
4. Runtime 编排
5. 工具调用与模型网关

建议子结构：

```text
modules/agent/
├─ controller/
├─ app/
├─ domain/
├─ entity/
├─ repository/
├─ runtime/
│  ├─ orchestrator/
│  ├─ gateway/
│  ├─ tool/
│  ├─ context/
│  └─ guardrail/
├─ dto/
└─ event/
```

## 6.7 asset 模块

职责：
1. 技能、胶囊、模板管理
2. 资产发布和绑定
3. Runtime 资产解析

## 6.8 connector 模块

职责：
1. Webhook 接入
2. 连接器实例管理
3. 同步任务
4. 第三方数据标准化

建议子结构：

```text
modules/connector/
├─ controller/
├─ app/
├─ domain/
├─ entity/
├─ repository/
├─ provider/
│  ├─ jira/
│  ├─ feishu/
│  └─ generic/
└─ dto/
```

## 6.9 analytics 模块

职责：
1. 智能密度统计
2. 总览和趋势接口
3. 统计聚合查询

MVP 阶段建议先读主库聚合表或简化统计表，不要一开始就引入复杂 OLAP。

## 6.10 audit 模块

职责：
1. 审计日志记录
2. 操作轨迹查询
3. 关键动作留痕

## 6.11 system 模块

职责：
1. SSE 推送
2. 健康检查
3. 系统级配置接口

## 7. framework 基础设施层设计

`framework/` 放所有跨模块共享的基础能力，不放业务逻辑。

## 7.1 db

建议文件：

```text
framework/db/
├─ data-source.ts
├─ transaction.helper.ts
├─ base.repository.ts
└─ query-helper.ts
```

职责：
1. TypeORM DataSource 初始化
2. 事务辅助工具
3. 通用分页与排序能力

## 7.2 cache

职责：
1. Redis 封装
2. 锁能力
3. 热点缓存

建议封装：
1. `redis.service.ts`
2. `distributed-lock.service.ts`
3. `cache-key.helper.ts`

## 7.3 queue

职责：
1. BullMQ 队列注册
2. Job 入队
3. Worker 消费基类

建议文件：

```text
framework/queue/
├─ queue.constants.ts
├─ queue.service.ts
├─ queue.factory.ts
└─ worker.base.ts
```

建议队列划分：
1. `agent_execution`
2. `automation_action`
3. `connector_sync`
4. `outbox_publish`

## 7.4 event

职责：
1. 领域事件发布
2. Outbox 投递
3. 事件名常量

建议：
1. 同步域内用领域事件
2. 跨进程传播通过 Outbox + Queue
3. 不直接依赖数据库触发器

## 7.5 auth

职责：
1. JWT 解析
2. 权限校验
3. 当前用户注入

## 7.6 storage

职责：
1. 对象存储封装
2. 预签名上传
3. 附件元数据

## 7.7 sse

职责：
1. SSE 连接管理
2. Topic 广播
3. 任务更新推送

## 8. 中间件与拦截器设计

## 8.1 中间件建议

1. `request-id.middleware.ts`
   为每个请求注入 `requestId`
2. `tenant-context.middleware.ts`
   注入租户上下文
3. `access-log.middleware.ts`
   记录访问日志

## 8.2 Guard 建议

1. `auth.guard.ts`
2. `permission.guard.ts`
3. `tenant.guard.ts`

## 8.3 拦截器建议

1. `response.interceptor.ts`
   统一返回格式
2. `trace.interceptor.ts`
   打点和链路追踪

## 8.4 Filter 建议

1. `business-exception.filter.ts`
2. `validation-exception.filter.ts`
3. `typeorm-exception.filter.ts`

## 9. DTO 与校验策略

建议统一使用：
1. 请求 DTO
2. 响应 VO
3. Command / Query 对象

建议规则：
1. Controller 入参必须使用 DTO
2. App Service 不直接接收原始 HTTP body
3. Repository 不接收 DTO，而接收 Query/Command

示例：

```text
CreateTaskRequestDto
  -> CreateTaskCommand
  -> TaskAppService.createTask(command)
  -> TaskEntity
  -> TaskDetailVO
```

## 10. TypeORM 组织建议

## 10.1 实体注册

建议按模块注册实体，而不是一处堆满。

例如：

```text
modules/task/entity/task.entity.ts
modules/task/entity/task-comment.entity.ts
modules/task/entity/task-event.entity.ts
modules/agent/entity/agent-definition.entity.ts
modules/agent/entity/agent-execution.entity.ts
```

## 10.2 Base Entity

建议抽公共基类：

1. `BaseTimeEntity`
2. `TenantBaseEntity`
3. `SoftDeleteTenantEntity`

注意：
1. 不要把所有字段都塞进一个巨型 Base Entity
2. 高频日志表可以不继承软删除字段

## 10.3 Repository 规范

每个 Repository 至少拆分为两类方法：

1. Command 类
   负责创建、更新、删除、加锁
2. Query 类
   负责分页、筛选、详情、统计

对复杂查询，建议单独做 Read Repository。

## 11. HTTP 进程与 Worker 进程拆分

## 11.1 API 进程职责

1. 对外 REST API
2. Webhook 接入
3. SSE 推送
4. 同步写库
5. 轻量同步规则校验

不负责：
1. 长时 Agent 执行
2. 大批量同步
3. 重型统计计算

## 11.2 Worker 进程职责

1. Agent 执行队列消费
2. 自动化异步动作执行
3. Connector 同步任务
4. Outbox 发布任务

## 11.3 Worker 目录建议

```text
jobs/
├─ agent/agent-execution.processor.ts
├─ automation/automation-action.processor.ts
├─ connector/connector-sync.processor.ts
└─ outbox/outbox-publish.processor.ts
```

每个 Processor 只做：
1. 取 Job 数据
2. 调用对应 App Service
3. 记录日志和结果

不要把业务逻辑直接写在 Processor 中。

## 12. 事件命名建议

建议统一采用：

```text
task.created
task.updated
task.status_changed
task.takeover_changed
task.comment_added

automation.rule_matched
automation.rule_executed

agent.execution.queued
agent.execution.started
agent.execution.succeeded
agent.execution.failed
agent.execution.terminated

asset.published
asset.bound

connector.webhook_received
connector.sync_started
connector.sync_finished
```

## 13. MVP 首批模块实现顺序

建议顺序：

1. `framework/db`、`framework/queue`、`framework/auth`
2. `auth` 模块
3. `project`、`board` 模块
4. `task` 模块
5. `automation` 模块
6. `agent` 模块
7. `system` 模块中的 SSE
8. `connector` Webhook 基础入口
9. `analytics` 基础总览

原因：
1. 先把协议层和基础设施立起来
2. 再把任务主链路打通
3. 最后接异步与统计

## 14. 建议的最小脚手架文件

如果现在就开始建工程，建议第一批先创建这些文件：

```text
src/app.ts
src/configuration.ts
src/framework/db/data-source.ts
src/framework/queue/queue.service.ts
src/framework/auth/current-user.service.ts
src/middleware/request-id.middleware.ts
src/interceptor/response.interceptor.ts

src/modules/auth/controller/auth.controller.ts
src/modules/auth/app/auth-app.service.ts

src/modules/project/controller/project.controller.ts
src/modules/project/app/project-app.service.ts
src/modules/project/entity/project.entity.ts
src/modules/project/repository/project.repository.ts

src/modules/board/controller/board.controller.ts
src/modules/board/app/board-app.service.ts
src/modules/board/entity/board.entity.ts
src/modules/board/entity/board-column.entity.ts
src/modules/board/repository/board.repository.ts

src/modules/task/controller/task.controller.ts
src/modules/task/controller/task-comment.controller.ts
src/modules/task/app/task-app.service.ts
src/modules/task/domain/task-domain.service.ts
src/modules/task/entity/task.entity.ts
src/modules/task/entity/task-comment.entity.ts
src/modules/task/entity/task-event.entity.ts
src/modules/task/repository/task.repository.ts
src/modules/task/repository/task-read.repository.ts
src/modules/task/dto/task.dto.ts

src/modules/automation/controller/automation-rule.controller.ts
src/modules/automation/app/automation-app.service.ts
src/modules/automation/domain/automation-domain.service.ts
src/modules/automation/entity/automation-rule.entity.ts
src/modules/automation/entity/automation-rule-execution.entity.ts
src/modules/automation/repository/automation-rule.repository.ts

src/modules/agent/controller/agent.controller.ts
src/modules/agent/controller/agent-execution.controller.ts
src/modules/agent/app/agent-app.service.ts
src/modules/agent/domain/agent-domain.service.ts
src/modules/agent/entity/agent-definition.entity.ts
src/modules/agent/entity/agent-execution.entity.ts
src/modules/agent/repository/agent.repository.ts
src/modules/agent/runtime/orchestrator/agent-orchestrator.ts
src/modules/agent/runtime/gateway/model-gateway.ts
src/modules/agent/runtime/tool/tool-runner.ts

src/modules/system/controller/stream.controller.ts

src/jobs/agent/agent-execution.processor.ts
src/jobs/outbox/outbox-publish.processor.ts
```

## 15. Controller 与 OpenAPI 对齐建议

Controller 命名尽量与 OpenAPI 路径一致：

1. `GET /auth/me` -> `AuthController.me`
2. `GET /projects` -> `ProjectController.list`
3. `GET /boards/:boardId/tasks` -> `TaskController.listByBoard`
4. `POST /tasks/:taskId/transition` -> `TaskController.transition`
5. `POST /agents/:agentId/execute` -> `AgentController.execute`

这样便于：
1. 文档与代码映射
2. 前后端联调
3. 后续自动生成 SDK

## 16. 测试结构建议

建议至少分三层：

1. 单元测试
   测 Domain Service、DSL 校验、状态流转
2. 集成测试
   测 Repository、事务和模块协作
3. API 测试
   测 Controller 与 OpenAPI 契约

建议目录：

```text
test/
├─ unit/
├─ integration/
└─ api/
```

MVP 必测点：
1. 创建任务
2. 状态流转
3. 自动化规则校验
4. Agent 执行入队
5. Webhook 接入

## 17. 配置管理建议

建议按环境拆分配置：

```text
src/config/
├─ config.default.ts
├─ config.local.ts
├─ config.prod.ts
└─ config.unittest.ts
```

建议配置项：
1. `mysql`
2. `redis`
3. `jwt`
4. `queue`
5. `storage`
6. `modelProviders`
7. `sse`
8. `audit`

敏感配置通过环境变量注入，不写入仓库。

## 18. 后续可平滑演进的拆分点

当后续规模变大时，优先拆分：

1. `agent` 模块 -> 独立 Agent Runtime 服务
2. `connector` 模块 -> 独立 Connector Hub 服务
3. `analytics` 模块 -> 独立统计服务

但在当前阶段，不需要为了未来拆分而牺牲今天的开发效率。

## 19. 结论

Nexus Teammate 的 Midwayjs 工程不应做成“几个 controller 加一堆 service”的平铺结构，而应做成“按领域模块组织、按用例编排、按基础设施抽象”的模块化单体。

当前阶段最关键的是先把这几根骨架搭稳：

1. `task` 主链路
2. `automation` 规则链路
3. `agent` 执行链路
4. `framework` 基础设施层
5. `jobs` 异步执行层

这套结构一旦建立，后续接口补充、功能扩展和服务拆分都会顺很多。
