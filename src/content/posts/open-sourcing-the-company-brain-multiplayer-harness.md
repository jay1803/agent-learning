---
title: "We're open sourcing the company brain, Here's how we designed the multi-player harness"
date: 2026-11-24T15:08:38Z
category: agents
description: "Supermemory 的 Dhravya Shah 开源其 Slack 多人 agent “company brain”，并拆解 harness 设计：用置信度而非是/否决定是否插话、ANSWER/INVESTIGATE/PASS 加表情反应、步数预算与收尾时撤掉工具、按频道划分记忆边界、挂起式审批，以及新消息如何替换或追加到进行中的任务。"
source: "https://x.com/DhravyaShah/status/2103668051468300701"
author: "Dhravya Shah"
---

这篇文章（X Article，2026-09-26，Supermemory 创始人 Dhravya Shah）的核心论点：**在 Slack 里放一个模型，和造一个 AI 同事是两回事**。后者要回答的不只是“该说什么”，还有“该不该说、要不要先查、点个表情是不是就够了、适用哪个信息边界、请求是否已经变了、需不需要审批、能不能可靠收尾”。Supermemory 在停掉 company brain 产品两周后把它开源（`supermemoryai/company-brain`，可一键部署到 Cloudflare，数据归用户），停掉的原因是要专注做最好的记忆系统。harness 主要由 @maheshthedev 构建，基于 Cloudflare Agents SDK。

## 为什么多人 agent 难

模型能分类消息、调用工具、写出流畅回答，但它不天然知道这些事：

- 如何从 Slack 事件（包括 huddle、笔记）中主动学习；
- 自己在这个频道能不能说话；
- 某个记忆容器能不能安全地搜索；
- 审批策略怎么定（发邮件前要不要批？审批要太多同样糟糕）；
- 更新的消息是否已经替换了当前请求；
- 模型输出的“正在处理”是不是最终答案；
- 运行时在工具调用中途消失后怎么恢复；
- **什么时候沉默才是正确结果**。

## 架构

- 全部构建在 Cloudflare 上。核心是 `CompanyBrainAgent`，一个**按组织 ID 分片的 Durable Object**，负责：基于 fiber 的回合生命周期与恢复检查点；持久的本地 SQL（进行中的回合、收件箱、审批、bot 线程、冷却、发布游标、trace）；解密 bot token 后的 Slack API 操作；分诊、主动性判定与动作评估；主模型/工具循环；审批的挂起与恢复；计费与遥测调度。
- 事件分四类：**显式**（@、私信、assistant 线程、叫名字）、**被动**（可能主动参与的频道顶层消息）、**仅作上下文**（保留但不回复）、**忽略**（bot 自身流量、不支持的子类型）。

## 只在需要时说话

- 他们试过的很多公开 agent 都太主动，很快就让人烦。主动的 agent 要回答两个问题：能不能做点有用的事？现在该不该打断？
- 最初用是/否二元判断，后来改成**由小模型按多个阈值输出置信度**，于是能区分：有用但置信度低 → 先调查而不是回答；社交上合适但没信息量 → 只点表情；紧急但打扰 → 在更严格模式下调查；正确有用但已有人回答 → 跳过；显式且轻量 → 确认一下，而不是启动完整回合。
- 输出是“主动作 + 反应”：主动作为 ANSWER / INVESTIGATE / PASS，反应为白名单内的表情或无。由此组合出四种自然行为：只回复、只点表情、点表情并回复、什么都不做。他们还开源了 `emoji-resolve`，让 agent 随意写表情由解析器解析，并能学会使用组织的自定义表情。
- 每个频道可单独配置主动程度；显式 @ 基本总是回答。

## 回答：带时间意识的分阶段状态机

- 选中 ANSWER 或 INVESTIGATE 后进入分阶段状态机，让工作方式符合人的预期。模型会持续汇报进度（“我发现了 xyz，下一步做 abc”），避免人以为它卡住了。实现上用 AI SDK 流式输出，并在 `onBeforeStep` hook 里注入节奏提示。
- **步数预算是主动控制机制**：接近结束时告诉模型还剩几步；到最后边界时**撤掉工具访问**，逼模型用已有信息综合出答案。这避免了常见失败：最后一步又发起一次搜索，结果永远没回答。

## 工具：渐进披露与 codemode

- 用 codemode 加 `activeTools` 选择器控制每一步可见的工具名；沙箱和调度器的 schema 默认隐藏，模型显式“解锁”该类工具后才出现。
- 好处：更少 schema 占用上下文；无关工具不争夺注意力；某些能力只在有意切换后才出现，便于策略控制。收尾时也能直接移除全部工具，不必重建整个上下文。

## 记忆：区分持久知识与实时状态

- 很多 company brain 创业公司把一切灌进向量库，作者认为这会增加过时信息、让模型困惑。他们**把持久的组织知识与实时运营状态明确分开**：一个回合可以先用记忆弄清“那次迁移”指什么，再去查 Linear 或 GitHub 确认当前状态。两者混用，要么记忆太易变，要么实时工具缺上下文。
- 记忆层级按**频道**而非按用户划分（Supermemory 的 containerTag）：公开频道 → `sm_org_shared`；私信 → `user_{userId}`；私有频道或群聊 → `slack_channel_{channelId}`。

## 先调查，再决定要不要说

INVESTIGATE 让 agent 可以先在后台查，再决定是否发言。这对“环境智能”很关键：如果每次后台检查都必须产出文字，频道就会被“我查了，什么都没发现”污染。允许**沉默的结论**，系统才会优化有用的结果，而不是可见的活动量。

## 审批与并发

- **审批不交给另一个 agent**：当前回合以可序列化的恢复状态挂起，批准后由同一个推理过程带着决定继续。这保留了因果链：提出动作的 agent 也是看到审批并完成工作的那个。
- Slack 不是一问一答的表单，agent 工作时线程还在继续，同事可能补证据、纠正前提、替换请求或叫停。进入活动线程的新消息走“活动回合闸门”而不是普通分诊，由小模型决定：**替换**原请求、**停止**、**忽略**新消息，还是**追加**为现有思路的上下文。

## 为什么 harness 要这么复杂

- 不能像 Pi、opencode、Codex 这类 harness 那样“YOLO 全塞进去”：面向大组织需要确定性，权限、工具使用等都很重要；而且真正的多人协作才是难点，问答很简单也很无聊。
- 产品层面：要让用户不担心 agent 做出对公司不利的事，所以记忆工具、访问控制和审批流必须由他们掌控、可按客户需求调整。
- 优化目标不同：不只是回答质量，而是**作为员工提供的价值**。技术上正确的回答，如果发错频道、暴露私密上下文、重复别人已说的话、打断敏感讨论或忽略了更新的消息，仍然是糟糕的介入。

## 原文代码块与图表

原文 12 张 ASCII 架构图与流程图：整体分层、消息过滤、分诊打分到四种动作、显式消息的处理、computeTurn 各阶段、runModelLoop 每步的钩子与步数预算、工具装配与懒加载、记忆与实时应用的分工、调查后静默、审批挂起与恢复、活动线程的新消息闸门，以及作者的“agent 价值”公式。以下为接口返回的原文，未改动。

```
┌──────────────────────────────────────────────────────────────────────┐
│                     COMPANY BRAIN EXPERIENCE                         │
├──────────────────────────────────────────────────────────────────────┤
│  Slack UX                                                            │
│  mentions · DMs · threads · reactions · progress · approval cards    │
├──────────────────────────────────────────────────────────────────────┤
│  HARNESS                                                             │
│  routing · state · policy · memory scope · tools · concurrency        │
│  recovery · budgets · side effects · telemetry                       │
├──────────────────────────────────────────────────────────────────────┤
│  MODELS                                                              │
│  triage · main reasoning · classifiers · salvage · entity resolution │
├──────────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                                      │
│  Cloudflare · Postgres · AI Gateway · providers · connected apps     │
└──────────────────────────────────────────────────────────────────────┘
```

```
Slack message
    │
    ├─ bot or self message? ─────────────────────────────► DROP
    ├─ unsupported subtype? ─────────────────────────────► DROP
    ├─ clearly addressed to another person? ─────────────► CONTEXT / DROP
    ├─ membership or entitlement failure? ───────────────► NOTICE or DROP
    ├─ emoji-only passive message? ──────────────────────► DROP
    ├─ quiet channel and not explicit? ──────────────────► DROP
    ├─ proactive cooldown unavailable? ──────────────────► DROP
    └─ active turn already running? ─────────────────────► STEERING GATE
                                                             │
                                                             ▼
                                                        TRIAGE ELIGIBLE
```

```
                     MESSAGE + CONTEXT
                            │
                            ▼
              ┌──────────────────────────┐
              │ Triage model             │
              │ estimates the situation │
              │                          │
              │ usefulness              │
              │ confidence              │
              │ urgency                 │
              │ noise                   │
              │ interruption cost       │
              │ investigation value     │
              │ reaction fit            │
              └────────────┬─────────────┘
                           │ 0–100 scores
                           ▼
              ┌──────────────────────────┐
              │ Deterministic evaluator  │
              │ formulas + mode policy   │
              │ explicit-message rules   │
              └────────────┬─────────────┘
                           │
          ┌────────────────┼────────────────┬────────────────┐
          ▼                ▼                ▼                ▼
       ANSWER         INVESTIGATE      ACKNOWLEDGE         PASS
    full turn          tool check        reaction         silence
```

```
Explicit message
      │
      ▼
Triage model
      │
      ├─ ACK ───────────────► allowlisted reaction
      ├─ ANSWER ────────────► full turn
      ├─ INVESTIGATE ───────► full turn with investigation framing
      ├─ PASS ──────────────► coerced to ANSWER
      └─ error / bad parse ─► fallback ANSWER
```

```
┌────────────────────────────────────────────────────────────────────┐
│                         computeTurn                                │
├────────────────────────────────────────────────────────────────────┤
│ A. TOOL ASSEMBLY                                                   │
│    assemble tool set · determine active tools                      │
│                            │                                       │
│ B. CONTEXT LOADING                                                 │
│    workspace prompt · company context · memory profile             │
│    thread history · actor · directory · attachments                │
│                            │                                       │
│ C. MODEL GENERATION                                                │
│    runModelLoop · streamed text · tool calls · live updates        │
│                            │                                       │
│ D. PROGRESS CHECK                                                  │
│    final answer or merely “working on it”?                         │
│                            │                                       │
│ E. SALVAGE                                                         │
│    one tool-free pass if only progress text exists                 │
│                            │                                       │
│ F. APPROVAL HANDSHAKE                                              │
│    consequential action? → checkpoint and suspend                  │
│                            │                                       │
│ G. FINALIZATION                                                    │
│    inbox empty? claim current revision; otherwise continue         │
│                            │                                       │
│ H. COMPLETION                                                      │
│    publish · write memory · charge · telemetry · reflect           │
└────────────────────────────────────────────────────────────────────┘
```

```
runModelLoop
    │
    ├─ streamText({
    │    model: main profile,
    │    system: policies + workspace context,
    │    messages: conversation + turn state,
    │    tools: assembled ToolSet,
    │    activeTools: currently visible names,
    │    stopWhen: step budget reached,
    │    abortSignal: turn control
    │  })
    │
    └─ EACH STEP
         │
         ├─ onBeforeStep
         │    ├─ drain live thread inbox
         │    └─ send pacing/progress nudge if needed
         │
         ├─ prepareStep
         │    ├─ render latest turn state
         │    └─ hide tools during forced wrap-up
         │
         ├─ model output
         │    ├─ text
         │    ├─ tool calls
         │    └─ text + tool calls
         │
         ├─ execute tools and append results
         ├─ record generated step
         ├─ at limit − 3: warn about remaining budget
         └─ at limit − 1: remove tools and force final text
```

```
                         assembleTurnTools
                                │
     ┌──────────────┬────────────┼──────────────┬──────────────┐
     ▼              ▼            ▼              ▼              ▼
┌──────────┐  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ Memory   │  │ Discovery │ │ Live apps │ │ Slack I/O │ │ Effects   │
│ search   │  │ people    │ │ Gmail     │ │ channel   │ │ save      │
│ inspect  │  │ entities  │ │ GitHub    │ │ search    │ │ connect   │
│ resolve  │  │ org tree  │ │ Linear    │ │ progress  │ │ forget    │
└──────────┘  └───────────┘ │ Notion    │ └───────────┘ └───────────┘
                            └───────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Lazy families   │
                         │ sandbox         │
                         │ scheduler       │
                         │ hidden until    │
                         │ enable_tools    │
                         └─────────────────┘
```

```
                 ┌────────────────────────┐
                 │       Agent turn       │
                 └───────────┬────────────┘
                             │
             ┌───────────────┴────────────────┐
             ▼                                ▼
┌────────────────────────┐       ┌────────────────────────┐
│ Company Brain memory   │       │ Connected applications │
│ decisions              │       │ current issue status   │
│ ownership              │       │ latest email           │
│ project context        │       │ live deployment        │
│ historical knowledge   │       │ recent Slack messages  │
└────────────────────────┘       └────────────────────────┘
        durable / semantic                live / transactional
```

```
INVESTIGATE
    │
    ▼
Gather evidence
memory · Slack · traces · connected apps
    │
    ▼
Is there something actionable or useful?
    │
    ├─ yes ─► synthesize and reply
    │
    └─ no ──► silentConclusion
              no Slack message
              release proactive slot
```

```
Model requests consequential tool
              │
              ▼
      Approval classifier
              │
      ┌───────┴────────┐
      ▼                ▼
 no approval       approval required
      │                │
 execute          store pending_approval
                       │
                       ▼
                checkpoint messages,
                tool state, and revision
                       │
                       ▼
                post Approve / Deny card
                       │
                 ┌─────┴─────┐
                 ▼           ▼
               Deny       Approve
                 │           │
              finish     resumeTurnAfterApproval
                             │
                             ▼
                      same model loop,
                      preserved context
```

```
New message arrives in active thread
                 │
                 ▼
       Active-turn gate model
                 │
    ┌────────────┼─────────────┬─────────────┐
    ▼            ▼             ▼             ▼
 IGNORE        APPEND        REPLACE       STOP
 unrelated     add context   supersede     cancel
                 │             request       │
                 ▼                          ▼
         durable inbox                abort signal
                 │
                 ▼
        drain before next step
                 │
                 ▼
    <live_thread_updates> injected
```

```
              usefulness × correctness × timeliness
Agent value = ─────────────────────────────────────
                 noise × risk × interruption cost
```

## 局限

- 这是开源发布配合的架构介绍，没有给出效果数据（例如主动介入的准确率、用户满意度）；产品被停掉的原因只简述为“专注做记忆”，没有说多人 agent 本身的商业表现。
- 文中配图接口没有返回；12 张 ASCII 架构图和流程图已从原文原样补入上方，具体实现细节仍需看 GitHub 仓库。
