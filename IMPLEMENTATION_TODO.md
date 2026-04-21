# Nexus Teammate - MVP Implementation TODO

> Phase 1 MVP: 模块化单体 + MySQL + Redis + Queue + 独立 Worker
> 技术栈: TypeScript + Midwayjs + TypeORM + BullMQ + MySQL 8.0 + Redis

## Phase 1: 项目脚手架与基础设施 (ID: P1) ✅ COMPLETED

- [x] P1-1: 初始化 Midwayjs 工程骨架
- [x] P1-2: framework/db 基础设施
- [x] P1-3: framework/queue 基础设施
- [x] P1-4: framework/cache 基础设施
- [x] P1-5: framework/event 基础设施
- [x] P1-6: framework/auth 基础设施
- [x] P1-7: framework/sse 基础设施
- [x] P1-8: 中间件与拦截器
- [x] P1-9: 配置管理
- [x] P1-10: 公共类型与常量

## Phase 2: 核心领域模块 (ID: P2)

### P2-1: Auth 模块 ⏳ SKIPPED (MVP 用 JWT middleware 代替，后续补充)

### P2-2: Project 模块 ✅ COMPLETED
- [x] P2-2-1: Entity
- [x] P2-2-2: Repository
- [x] P2-2-3: App Service
- [x] P2-2-4: Controller
- [x] P2-2-5: DTO

### P2-3: Board 模块 ✅ COMPLETED
- [x] P2-3-1: Entity (3个)
- [x] P2-3-2: Repository
- [x] P2-3-3: App Service
- [x] P2-3-4: Controller
- [x] P2-3-5: DTO

### P2-4: Task 模块 ✅ COMPLETED
- [x] P2-4-1: Entity (4个)
- [x] P2-4-2: Repository (读写分离)
- [x] P2-4-3: Domain Service
- [x] P2-4-4: App Service
- [x] P2-4-5: Controller
- [x] P2-4-6: DTO
- [x] P2-4-7: Assembler
- [x] P2-4-8: Event

## Phase 3: 自动化与 Agent 模块 (ID: P3) ✅ COMPLETED

### P3-1: Automation 模块 ✅ COMPLETED
- [x] P3-1-1 ~ P3-1-8 (全部完成)

### P3-2: Agent 模块 ✅ COMPLETED
- [x] P3-2-1 ~ P3-2-9 (全部完成)

## Phase 4: 扩展与支撑模块 (ID: P4) ✅ COMPLETED

### P4-1: Asset 模块 ✅ COMPLETED (10 files)
- [x] P4-1-1 ~ P4-1-5

### P4-2: Connector 模块 ✅ COMPLETED (8 files)
- [x] P4-2-1 ~ P4-2-7

### P4-3: Analytics 模块 ✅ COMPLETED (4 files)
- [x] P4-3-1 ~ P4-3-3

### P4-4: Audit 模块 ✅ COMPLETED (5 files)
- [x] P4-4-1 ~ P4-4-3

### P4-5: System 模块 ✅ COMPLETED (2 files)
- [x] P4-5-1 ~ P4-5-2

### P4-6: Outbox Worker ✅ COMPLETED
- [x] P4-6-1 ~ P4-6-2

## Phase 5: 测试与集成 (ID: P5)

- [x] P5-1: 单元测试: Domain Service (状态机, DSL 校验, Agent 定义校验) — 38 tests, 3 suites ✅
- [ ] P5-2: 集成测试: Repository (事务, 分页)
- [ ] P5-3: API 测试: 核心接口契约 (创建任务, 状态流转, Agent 执行入队, Webhook)
- [ ] P5-4: E2E 冒烟: 任务创建 → 自动化触发 → Agent 执行 → 状态流转

## 模块依赖关系

```
P1 (Infrastructure) → P2 (Core Domains) → P3 (Automation + Agent) → P4 (Extensions) → P5 (Testing)

P2 内部依赖:
  Auth → Project → Board → Task

P3 内部依赖:
  Automation → Agent (Automation 触发 Agent 执行)

P4 内部依赖:
  Asset (被 Agent 引用)
  Connector (被 Automation 引用)
  Analytics (读取所有模块事件)
  Audit (贯穿所有模块)
  System (SSE 依赖所有模块事件)
```

## 实施策略

1. 先搭骨架 (P1)，确保 TypeORM 跑通、Redis 连上、队列可用
2. 再立任务主链路 (P2-4)，这是所有模块的根基
3. 然后接自动化和 Agent (P3)，形成事件驱动闭环
4. 最后补扩展和支撑模块 (P4)
5. 全程覆盖测试 (P5)

## 核心模块 Sub-Agent 分配

| 模块 | Agent | 状态 | 文件数 |
|------|-------|------|--------|
| P1 基础设施 | @Agent-Infrastructure | ✅ 完成 | ~35 |
| P2-2 Project | @Agent-Project | ✅ 完成 | 6 |
| P2-3 Board | @Agent-Board | ✅ 完成 | 8 |
| P2-4 Task | @Agent-Task | ✅ 完成 | 13 |
| P3-1 Automation | @Agent-Automation | ✅ 完成 | 9 |
| P3-2 Agent | @Agent-Agent | ✅ 完成 | 15 |
| **合计** | | | **~100** |
| P4-1 Asset | @Agent-Asset | ✅ 完成 | 10 |
| P4-2 Connector | @Agent-Connector | ✅ 完成 | 8 |
| P4-3 Analytics | @Agent-Analytics | ✅ 完成 | 4 |
| P4-4 Audit | @Agent-Audit | ✅ 完成 | 5 |
| P4-5 System | @Agent-System | ✅ 完成 | 2 |
| **总计** | | | **~155** |

## Review Notes (Phase 1-3)

### 已修复的问题
1. `BaseRepository` 缺少 `PageResult` 接口和 `findAndPaginate` 方法 — 已补充
2. Agent 模块缺少 module 注册文件 — 已创建
3. 配置管理目录缺失 — 已创建 4 个环境配置文件
4. Jobs 目录缺失 — 已创建 4 个 processor 骨架
5. `configuration.ts` 未导入业务模块 — 已更新

### 待完善项
1. Auth 模块 (P2-1) 暂未实现，JWT middleware 提供基础鉴权
2. `app.ts` 仍为占位文件，需补充应用初始化逻辑
3. `outbox.service.ts` 需要完善定时扫描与投递逻辑
4. Agent Runtime 的 `model-gateway.ts` 和 `tool-runner.ts` 为 MVP 占位实现
