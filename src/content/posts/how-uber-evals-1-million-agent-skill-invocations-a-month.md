---
title: "How Uber Evals 1 Million Agent Skill Invocations a Month"
date: 2026-11-24T01:47:30Z
category: agents
description: "Uber Engineering 讲述如何在企业规模下管理 5000+ 个 agent skill：三层市场、统一安装 CLI、spec 先行、trajectory 评测、消融测试、成本杠杆，以及让 agent 自己提交 papercut 形成改进飞轮。"
source: "https://x.com/ubereng/status/2125008806249930999"
author: "Uber Engineering"
---

Uber 的核心判断是：skill 规模化之后，瓶颈不再是“写 skill”，而是“衡量并持续提升 skill 质量与成本”。他们的做法是把 skill 当作有生命周期的软件来运营：有 owner、有评测、有遥测、有成本 KPI，甚至让 agent 自己上报 skill 的缺陷。文章发于 2026-11-23，署名 Uber Engineering（作者 Mager、Jason Varbedian、Uday Kiran），一个月内 agent 调用 skill 超过 100 万次，市场里的 skill 从 2025 年 10 月的 1 个涨到 5000 多个。

## Skill 是什么，怎么分发

- skill 是一个目录：SKILL.md（名称、描述、正文）加可选脚本和参考文件，打包的是**一个工作流**。agent 分三段加载：名称与描述常驻（约 100 token），正文在运行时加载（建议少于 500 行），脚本与参考资料按需读取。所以几千个 skill 的常驻成本只是每个一小段描述。
- 分发选了 **Git 仓库**，因为版本控制天然给每个 skill 带来 owner、评审和历史。
- 市场分三层，质量与效率要求逐级上升：**Domain**（任一团队自建领域，指定评审人，一次同行批准加 CI 即可发布）→ **Core**（广泛使用的 skill，由团队维护，平台团队审核每次变更）→ **Always-on**（约 100 个对所有人默认开启，新员工首次运行就有可用 skill）。晋级要跑评测系统和质量检查。
- 多 agent 统一安装：自研 CLI **aifx**，屏蔽 Claude Code、Codex、OpenCode 等对 skill 定义和安装的差异。配置分层合并（公司默认、团队、仓库、工作目录、用户、本地覆盖），后一层只能加 plugin 不能删，所以仓库可以声明所有人都必须有的 plugin。还有按角色（工程师、数据科学家等）的 persona。

## 发现与度量

- 发现：有 find-skills skill，按评测结果和运行次数给 skill 排序并算质量分；借助内部 context graph，可以问“我的同事在用而我没用的 skill 有哪些”。
- 度量：用 hooks 通过 OpenTelemetry 采集事件，记录 skill、版本、是 agent 自选还是用户键入的命令；**不含 prompt 文本和文件内容**。每个 skill 算 12 项指标（用户数、留存、成本、延迟、错误等），在作者工具 Skill Workshop 的页面上展示。

## 质量：spec 先行、linter、评测

- **Spec 先行**：模型和 harness 变得快，所以先写 spec（目标、输出、必须或禁止的工具动作、目标 agent 与模型），由 Skill Workshop 编译出 SKILL.md 和测试 prompt，模型或 agent 变化时重新编译。
- **Skill linter**：把好 skill 的特征变成通过或失败的检查，例如步骤编号且每步一个目标并能（至少软）验证；每步给具体命令并检查结果；必须有错误恢复表，“再试一次”不算。
- **评测配比**：约 5% golden case（固定输入、期望输出、工具 mock）、80% 真实 prompt 按 **trajectory** 评分、15% 由作者自评。trajectory 看的是 agent 是否按正确顺序使用了正确的 skill 和工具，而不是只看结果。
- **干净环境**：评测跑在 Minion（后台 agent 平台）、AES（托管沙箱）和 devpods 三处。强制远程运行暴露了大量“在我机器上能跑”的依赖，比如固定路径、缓存文档、特定系统工具。
- **反直觉的一点**：**通过率 70%–90% 的评测可能比 100% 的更有用**，因为答案本来就有波动，100% 可能说明评测漏掉了答案里有意义的变化。
- LLM-as-judge 需要人工标注集作为基础；评判时要定义“什么重要”（措辞要不要一致、哪些变化不改变含义），因为 agent 可能盯着无关细节，或在格式正确时漏掉严重幻觉。

## 消融：少即是多

- 对整个 skill：用真实 prompt 各跑一次有 skill 和无 skill，由盲评 judge 选更好的答案；也测试只保留 skill 的部分，甚至删词，因为模型变强后更多文字可能反而降低表现。
- 结论：多数情况下 skill 让会话更成功且更便宜，最大收益来自给 agent 提供它自己很难找到或理解的东西，比如内部文档访问或数仓查询方式。
- 数据：一个跑数仓查询的 skill，无 skill 的会话多 13% 工具调用、工具错误多 6 倍、耗时多 31%，有 skill 的答案在 87% 的对比中胜出。

## 成本：测量与杠杆

- **测量**：取 agent 调用 skill 前最后一次和调用后第一次的会话累计成本快照，相减得到该次调用成本；按天汇总再除以调用次数。数字里包含读 skill、后续轮次和同一窗口内的其他工具调用，用于看成本去向和做前后对比。
- **杠杆**：
  - **能用代码就别用 LLM（Code Mode**）：固定步骤写成脚本，通过网关调用工具。默认 MCP 在工具超过 100 个时，光工具定义就占 5 万到 7 万 token。这些脚本变成其他 skill 按名称引用的包，同时在 skill 和 plugin 中禁用 .mcp.json。
  - **用 worker 子 agent 跑在更便宜的模型上**：大结果留在 worker 上下文里，只返回有界摘要。tracing skill 单次成本下降 46%；部署类 skill 第一周没降，所以每个 skill 改完都要单独测。
  - **加载时就跑脚本**：结果小且总是需要时，直接把输出放进 prompt，省一轮模型调用，某搜索 skill 从 4 轮降到 3 轮，平均成本降 32%。
  - **把轮询移出主会话**：花费最高的 20 个会话里，通知轮次约占三分之一；已把 PR 监控 skill 的轮询移到更便宜模型的后台 agent。

## Agent 自己提交 bug：papercut 飞轮

- 一个 always-on 的 **log-papercut** skill，让 agent 在遇到摩擦时无需被要求就提交报告：尝试了什么、预期什么、发生了什么、怎么修。所有报告汇总到按 skill 分组的看板。agent 知道“有时事情就是坏的”，也能查别人是怎么绕过的，所以连发生 bug 的当前会话都受益。
- 流程：分组、分诊、根因分析、修复、评测、批准，上线后还要测量并检查回归才关单。三个月内提交了数千条，数百条已修复。例子：PR skill 把 commit message 写进共享临时文件，导致并发会话互相改了对方的 PR；部署 skill 让 agent 传秒级时间戳而 API 要毫秒；配置查询在 key 不存在时静默返回另一个属性；PR skill 在没有 CI 的仓库上一直等检查并反复 404 直到超时。
- 人的信号：在 Fawkes（自动软件维护工厂）里，开 PR 的维护 skill 会根据评论、迭代或被拒绝来改进，被拦下的 PR 进入评测集。

## 局限与下一步

- 他们承认开放问题是：很少运行但很重要、又难以评判的工作流。
- 下一步：对 skill 内容做 A/B 测试和金丝雀发布；按模型家族编译不同的 SKILL.md；按评测索引 skill 运行 trace；skill 推荐；统一的任务路由器。
- 文章中的图表和截图接口没有返回，总结只依据文字部分；文末链接的 Uber 博客原文为 https://www.uber.com/us/en/blog/optimizing-ubers-agent-skills/。
