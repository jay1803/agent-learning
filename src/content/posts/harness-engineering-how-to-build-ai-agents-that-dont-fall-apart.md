---
title: "Harness Engineering: How to Build AI Agents That Don't Fall Apart"
date: 2026-11-24T15:12:17Z
category: agents
description: "rari（0xwhrrari）把 harness 工程拆成七项职责：把请求变成契约、给 agent 地图而非手册、在合适环境暴露合适工具、把记忆外置为持久状态、先加传感器再加自主、在模型之外执行权限、记录 trace 并就地恢复；核心是让每次失败升级系统，而不是只修这一次输出。"
source: "https://x.com/0xwhrrari/status/2093685107534000560"
author: "rari"
---

这篇 X Article（2026-08-29，作者 rari，@0xwhrrari）的核心论点：agent 反复失败时，多数人会改 prompt、换模型、加大上下文窗口，但问题常常不在“智能”，而在**模型周围的环境**，也就是 harness。prompt 工程改进的是指令，**harness 工程改进的是指令被执行的条件**。最值得带走的一句：**一般人修的是这次的输出，harness 工程师修的是这一类失败**，一个好的 harness 会把 agent 的错误转化为基础设施。文章大量引用 OpenAI（用 Codex 建 agent-first 代码库）和 Anthropic（长时运行 agent、Managed Agents）的公开文章作为佐证。

## 模型只是推理引擎

- 模型能建议下一步动作，但不能自己造出可靠的运行环境。harness 决定模型能看到什么、能碰什么、什么能跨会话保留、什么算证据、何时必须停止。
- 同一个模型放进聊天框只会答题；放进带终端、测试、浏览器工具、项目记忆、隔离 worktree 和评审循环的仓库，就能交付软件。**权重没变，变的是 harness**。
- OpenAI 的经验：早期进展慢是因为“环境定义不足”，而不是模型能力不够。应对办法不是让 agent 更努力，而是问缺了什么能力，并让这种能力**既清晰可读又可强制执行**。

## 生产级 harness 的七项职责

1. **把请求变成契约**：行动前把请求转成有边界的对象。契约防止任务被悄悄重新定义，否则 agent 可能完成了另一件事却宣布成功。
2. **给 agent 一张地图**：用一份小的根指南告诉它去哪里找，而不是把所有文档塞进每个上下文。详细知识放在它所管的代码、工具或流程旁边，用到时再加载。地图节省上下文，巨型手册消耗上下文。
3. **在合适的环境里暴露合适的工具**：每个工具都要有清晰用途、可预测的输出、明确的失败状态和权限边界。好工具在模型推理出错之前就消除歧义，坏工具逼模型去猜发生了什么。
4. **把记忆外置成持久状态**：对话不是记录系统。决策、产物、失败、未解决的风险都存在上下文窗口之外，下一个会话继承的是工作状态，而不是对对话的有损复述。这样 agent 才能扛过上下文重置、崩溃和交接。
5. **先加传感器，再加自主**：agent 无法纠正它观察不到的东西。测试、linter、截图、日志、指标、schema 校验把模糊的“质量”变成证据。模型产出制品，环境产出关于制品的证据，harness 决定证据是否足以继续。
6. **在模型之外执行权限**：模型可以建议动作，必须由 harness 授权。对昂贵、不可逆或涉及他人的动作尤其重要：**不要让同一个概率系统既制定计划、又批准风险、还执行副作用**。
7. **记录 trace 并就地恢复**：每次运行都要留下可读的轨迹。没有 trace，失败是谜；有了 trace，失败就是下一次改进 harness 的输入。

## 几个关键原则

- **指令要变成基础设施**：重要规则写两遍，一遍作为 agent 能理解的说明（解释原因），一遍作为它无法绕过的机械检查（守住边界）。这样一次失败就变成系统的永久改进，下一个 agent 不必记得那次事故，harness 替它记住。
- **循环归 harness 管**：“一直试到成功”不是控制系统。有用的循环要有证据、有限次数的重试、预算和升级路径。**模型决定怎么修补局部缺口，harness 决定是否允许再试一次**。Anthropic 在长时运行 agent 上得出类似结论：用结构化制品保持跨会话连续性，用独立的评估者给构建者具体反馈，而不是让它批准自己的工作。
- **把大脑、双手和历史分开**：推理引擎不应同时充当文件系统、权限系统、记忆数据库和审计日志。沙箱死了历史还在；换模型后工具和策略仍可检查；任务恢复时，新会话能从制品和 trace 重建状态。Anthropic Managed Agents 用 session、harness、sandbox 显式做了这种分离，作者强调重要的是架构，不是厂商。
- **每次运行都要有“变更回执”**：不只保留最终输出，还要一份说明输出如何产生的简短回执。这样模型升级可比较、回归可归因、审计可进行，也避免最终答案掩盖一个坏掉的过程。
- **从能闭环的最小 harness 开始**：不要在第一个任务前就建平台，先做能观察、验证、恢复的最小系统，任务值得时再加复杂度。短小低风险的任务可能只需一个 prompt 加一次审阅；能改文件、联网、开 PR 的六小时编码任务才需要真正的 harness。**harness 应该比它所控制的失败面更小**。

## 结论

prompt 工程告诉模型做什么，context 工程决定模型看到什么，**harness 工程构建模型行动的世界**。模型下个月可能就换了，但工具、测试、状态、策略和 trace 可以持续积累，所以持久优势正在从 prompt 移到系统本身。作者附有一份上线前的检查清单（清单原文见下方“原文代码块与图表”），并给出判断：如果其中好几项答案是否，换更强的模型也不会让系统可靠，只会让失败更贵。

## 原文代码块与图表

原文 16 段代码块：模型与 harness 的分工、请求契约、AGENTS.md 地图、工具权限表、持久状态、各类产出的传感器、权限流程、trace 字段、“规则写两遍”示例、有界重试循环、失败类型对应的 harness 修补、大脑/双手/历史、变更回执、harness 成熟度分级、上线前检查清单，以及 prompt 到 graph 的层次。以下为接口返回的原文，未改动。

```
MODEL
reasons and proposes actions

HARNESS
selects context
exposes tools
stores state
enforces permissions
checks results
records traces
recovers from failure
```

```
{
  "goal": "ship the feature",
  "inputs": ["issue", "repository", "design"],
  "output": "reviewable pull request",
  "constraints": ["no schema changes", "preserve public API"],
  "done_when": ["tests pass", "visual check passes", "review passes"]
}
```

```
AGENTS.md
  -> architecture map
  -> testing map
  -> product rules
  -> security rules
  -> task-specific guides
```

```
READ FILES       allowed by default
RUN TESTS        allowed inside sandbox
WRITE FILES      allowed inside workspace
ACCESS NETWORK   scoped by task
DEPLOY           requires approval
DELETE DATA      requires approval
```

```
{
  "task_id": "task_042",
  "current_step": "verify_ui",
  "artifacts": ["build.zip", "report.md", "screenshot.png"],
  "decisions": ["keep existing schema"],
  "failures": ["mobile overflow at 390px"],
  "pending": ["human approval"]
}
```

```
CODE       -> tests + type checks + lint
UI         -> render + screenshot + visual inspection
RESEARCH   -> source check + contradiction check
DATA       -> schema + range + freshness checks
```

```
MODEL SUGGESTS -> POLICY CHECKS -> TOOL EXECUTES
```

```
request
selected context
tool calls
state changes
verification results
retries
cost
final artifact
rollback point
```

```
GUIDE
"UI code may not query the database directly"

CHECK
lint fails when UI imports the repository layer
```

```
for (let attempt = 1; attempt <= 3; attempt += 1) {
  const artifact = await build(state)
  const evidence = await verify(artifact)

  if (evidence.pass) return artifact

  state.failures.push(evidence.gap)
  state.repair = evidence.repair
}

return requestHumanReview(state)
```

```
MISSING CONTEXT   -> add a map or retrieval rule
WRONG TOOL        -> improve tool description or routing
BAD OUTPUT        -> add a validator or stronger contract
REPEATED LOOP     -> add a retry cap and escalation
UNSAFE ACTION     -> add a permission gate
LOST DECISION     -> store it in durable state
UNKNOWN FAILURE   -> add tracing and evidence capture
```

```
BRAIN
the model that reasons

HANDS
the sandbox and tools that act

HISTORY
the append-only record of what happened
```

```
{
  "context_sources": ["issue", "repo_map", "design_spec"],
  "policy_version": "v12",
  "model_route": "complex_coding",
  "tools_used": ["shell", "browser", "tests"],
  "tests": { "passed": 42, "failed": 0 },
  "human_corrections": 1,
  "retries": 2,
  "cost_usd": 3.84,
  "accepted_artifact": "pr_1842",
  "rollback_point": "commit_7f3a"
}

```

```
LEVEL 0
prompt + model

LEVEL 1
project guide + tools

LEVEL 2
structured state + tests + bounded loop

LEVEL 3
permissions + traces + recovery + human gates
```

```
[ ] Is success defined before execution begins
[ ] Can the agent find the right project knowledge without loading everything
[ ] Does every tool have a clear contract and failure state
[ ] Is execution isolated from production systems
[ ] Are important decisions stored outside the conversation
[ ] Does every risky transition have evidence
[ ] Are irreversible actions protected by approval
[ ] Does every loop have a retry cap and budget
[ ] Can the run resume after interruption
[ ] Can you explain every tool call and state change
[ ] Does failure update a guide, test, tool, or policy
[ ] Can the final artifact be rolled back

```

```
PROMPT      -> instruction
CONTEXT     -> working view
HARNESS     -> operating system
LOOP        -> local improvement
GRAPH       -> coordination
```

## 局限

- 这是一篇观点与框架类文章，没有作者自己的实验数据，论据主要来自 OpenAI、Anthropic 的公开文章和一句 Dario Amodei 的引语。文末是 Substack、Telegram 的推广。
- 文中配图接口没有返回；契约示例、权限表、trace 格式、检查清单等 16 段代码块已从原文原样补入上方。
