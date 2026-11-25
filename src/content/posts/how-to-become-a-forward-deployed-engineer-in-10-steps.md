---
title: "How to become a Forward Deployed Engineer in 10 Steps"
date: 2026-11-24T15:16:08Z
category: agents
description: "Codez（0xCodez）给出成为前线部署工程师（FDE）的十步路线：理解这是“在别人产品上当创始工程师”，AI 的瓶颈从能力转向部署；广度胜于深度，学会交付而非训练模型，做出 MCP server、skill、subagent 三类制品，真实部署一次，并练好筛掉六成候选人的客户访谈轮。"
source: "https://x.com/0xCodez/status/2082468167935308098"
author: "Codez"
---

这篇 X Article（2026-07-29，作者 Codez，@0xCodez，原标题带“$785K / year (full-course)”）的核心论点：**AI 的瓶颈已经从模型能力转到部署**，最稀缺的是能走进一家有遗留系统、合规部门和怀疑态度运维团队的公司，六周后交出能跑的东西的工程师，也就是前线部署工程师（Forward Deployed Engineer，FDE）。作者引用 MIT NANDA 对 300 个企业 AI 项目的研究：95% 对损益几乎没有可衡量的影响，**模型没问题，死的是部署**——接不上遗留数据库、过不了合规审查、交接给运维后活不下去。最反直觉的一点：这份工作不要求最深的技术，而要求同时扛住六个领域的广度，以及**不写代码、先做客户访谈**的能力。

## 这个角色是什么，为什么爆发

- 名字来自军事（把专业单位部署在前线而不是总部）。Palantir 在 2010 年代早期建立了现代版本，叫 Deltas，2016 年前 Deltas 比软件工程师还多。前提是：客户需要的不是更多功能，而是能让产品在碎片化、遗留、受监管、政治复杂的环境里跑起来的工程师。
- 最好的心智模型不是顾问，也不是解决方案工程师，而是**在别人产品上工作的创始工程师**：房间里没有 PM 定范围、没有资深工程师可以升级架构问题、没有 backlog，你当周当场决定做什么、假装做什么、拒绝什么。
- 典型节奏：FDE 在客户那里待 4–8 周交付可用的东西，核心工程团队再把其中通用的部分慢慢产品化。所以这个角色**同时在带来收入和做公司保真度最高的产品研究**。作者认为这不是职位描述，而是一种 go-to-market 策略。
- 三股力量同时推动：AI 打破了通用 SaaS“买来即插即用”的承诺（每家企业的数据、流程、合规约束和“够好”的标准都不同，卖 AI 给财富 500 强总是同时在卖一个集成项目）；实验室需要以技术演进的速度部署，六个月的集成会在试点落地前就杀死它；AI 工具让经济账算得通——借助 Claude Code 等，一个强 FDE 能做几年前三人团队的活，派一个人驻场六周才划算。

## 市场与薪酬

- 头衔不统一：Applied AI Engineer（Anthropic）、FDSE（Palantir）、Solutions Engineer、Deployment Engineer、Founding Engineer (Customer Facing)，只搜“FDE”会漏掉大部分市场。
- Indeed 上 FDE 职位从 2025 年 4 月的 643 个涨到 2026 年 4 月的 5,330 个（+729%）；2026 年年中 39 家 AI 公司公开挂出 224 个 FDE 职位；Salesforce 承诺招一千人；EY 在 2026 年 4 月成为首个正式采用该模式的大型咨询公司。
- 薪酬按层级分化：Levels.fyi 数据显示美国平均总包约 $238K（常见区间 $205K–$486K，staff 级超 $630K），Palantir 中位数约 $215K；前沿实验室高级 FDE 可达 $785K，Anthropic 高级 Applied AI Engineer 底薪超 $300K、总包常超 $500K。另一个提醒：Anthropic 通常不议价。

## 十步路线

1. **理解这份工作**：见上，在别人产品上当创始工程师。
2. **理解它为什么爆发**：瓶颈是部署，不是能力，市场正在据此重新定价。
3. **摸清市场、选目标**：按多个头衔搜索。
4. **建立工程广度**：最强的 FDE 不是公司里最深的工程师，而是能同时装下六个领域、低成本切换的人。底线：Python 和 TypeScript、一个云（选目标客户在用的）、一个能在压力下调试的数据库、一个能快速搭出界面的前端框架。“你不需要是房间里最好的工程师，你需要是房间里唯一什么都能做的人。”另外两层同样重要：**产品判断**（你就是房间里的 PM）和**商业敏感度**（能用省下的钱和工时回答 ROI，让对方能向自己的领导辩护项目）。
5. **学会交付 AI，而不是训练 AI**：没人要 FDE 微调模型。需要的是 prompt 工程、主流模型 API、RAG（尤其是知道什么时候检索是错误答案）、结构化输出、基本的评测纪律，以及至少一个真正用过的 agent 框架。准备重心放在**评测和失败模式**：幻觉、检索失败、错误的工具调用、脆弱的多步流程，以及把延迟、成本、可靠性、安全当作权衡而不是勾选项。任何人都能做出 demo，FDE 的价值是知道 demo 为什么撑不过真实公司、该怎么办。
6. **做出企业会买的三类制品**：Anthropic 的 FDE 职位描述写明交付物是 **MCP server、subagent 和 agent skill**。MCP server 是集成层，把 Claude 接到客户真实系统（工单、数仓、没有文档且只有一个人懂的内部 API）；skill 编码客户特定的流程和机构知识；subagent 处理会撑爆长任务上下文的工作。各做一个、接真实系统，就有了几乎没有候选人具备的作品集；**一个包装了真正混乱 API 的 MCP server，比任何证书都更有说服力**。
7. **把 Claude Code 练成倍增器**：工具不是锦上添花，而是这个席位商业逻辑的承重墙。用它快速熟悉新客户的陌生代码库、写占产出大头的集成胶水代码、把研究委派给 subagent。Anthropic 的技术用例面试可能让你带着 Claude 解题，**你怎么驾驭模型本身就在被评估**。
8. **为真实用户做一次真实部署**：所有 FDE 职位都在筛“交付过生产 AI 系统”。找一个不属于你自己的真实流程（小企业、非营利、公司内部团队、朋友的运营），坐在旁边看他们工作，做出能消除他们一周里最糟部分的东西，部署到他们实际使用的地方，**然后留下来修坏掉的东西**。写报告像 FDE 那样写，不是“用 LangChain 做了个 RAG 聊天机器人”，而是：之前这个流程花多少工时、哪些约束改不了、刻意没做什么、第二周坏了什么、现在花多少。这份文档就是你的面试。
9. **学会客户访谈（要读两遍的一步）**：Anthropic Applied AI Engineer 面试里的客户对话轮，会**淘汰约 60% 已经通过编码轮的候选人**；73% 的前沿实验室 FDE 说这是他们从传统软件背景转过来时最没准备好的技能。典型失败：一听到客户问题就开始解决，提出架构，甚至打开编辑器。通过的人把它当研究访谈：问买方现在的评估标准；问之前失败的 AI 部署（真实约束都埋在那里）；问什么绝对不能变（合规、延迟、数据驻留）；问要替代哪个具体流程、成功后谁会失去工作。做笔记、复述确认，不写代码。
10. **跑完面试流程**：大约五个阶段——招聘筛选；技术用例（在 Anthropic 是用 MCP 工具部署 Claude 的实际场景，规划并执行长任务，推理可靠性、上下文管理和生产一致性）；实用型编码而非 LeetCode（限流器、流式数据处理、分布式任务队列、token 预算分配器、结构化工具调用编排器，常在中途加入新的客户约束看你能否干净重构）；招聘经理轮（过往项目与客户推理）；最终面板（方案设计与价值观）。两条常被忽略的准备：Anthropic 认真筛使命契合度，要读 Core Views on AI Safety、Responsible Scaling Policy 和最近的可解释性工作，泛泛的热情过不了；职位要求“对模型风险有校准过的判断”，**能清楚说出你在哪里不会部署模型、为什么**，本身就是门槛。

## 六种起点

- 传统后端/生产工程师：生产直觉是稀缺的那一半，补上 prompt、模型 API、结构化输出和评测，再对着混乱的内部系统做一个 MCP server。
- ML/研究背景：建模能力过剩、其他都不足，工作是集成、约束和利益相关方，刻意做一个能过合规审查和运维交接的“无聊”系统。
- 新人：前沿实验室的 FDE 很少是入门岗，先去外一圈（把 AI 部署进企业的创业公司和咨询公司），两年后再往上走。
- 解决方案/客户侧背景：你已经有淘汰六成人的那一半，补实用编码。
- 咨询或善于沟通的人：面试正是为筛掉“会说不会写”的人设计的，准备重心是一个交付、维护并公开记录的系统。
- 已经和业务部门坐在一起的内部平台工程师：你可能已经在做 FDE 的事，用“改变了哪些流程、省了多少工时、绕过了哪些约束”重写经历。

## 原文代码块与图表

原文 5 段代码块：技能自评清单、FDE 交付的 MCP server 示例、用 subagent 梳理陌生代码库的会话、按 FDE 复盘格式写的部署报告、客户访谈轮的提问清单。以下为接口返回的原文，未改动。

```python
# Rate 1-5. Anything below 3 is your next month of work.

## Engineering breadth          # solid, not elite
[ ] Python // backend, scripts, data
[ ] TypeScript // integrations + a usable frontend
[ ] One cloud, deployed something real to it
[ ] One database, can debug it under pressure
[ ] Can stand up a working UI in a day

## AI native                     # ship, don't train
[ ] Prompt engineering beyond trial and error
[ ] Model APIs: streaming, tool use, token budgets
[ ] RAG // and knowing when retrieval is the WRONG answer
[ ] Structured outputs + schema validation
[ ] Evals // the layer that separates demo from production
[ ] One agent framework, something actually built

## The half nobody practices
[ ] Ran a workshop with a non-technical stakeholder
[ ] Said "we should not build that" to a paying customer
[ ] Expressed your work in dollars or hours saved
[ ] Learned an unfamiliar industry well enough to ship in it
```

```python
# The artifact an FDE actually ships: Claude, wired into a system
# nobody designed for it. Legacy API, no docs, one guy who knows it.

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("warehouse-ops")

@mcp.tool()
def find_stalled_shipments(hours_stalled: int = 24) -> list[dict]:
    """Shipments with no scan event in N hours. Use when ops asks
    what is stuck, or before a customer escalation review."""
    # The real work: their legacy schema, their timezone quirk,
    # their soft-delete column that nobody documented.
    return query(STALLED_SQL, hours_stalled)

@mcp.tool()
def reroute(shipment_id: str, hub: str, reason: str) -> dict:
    """Reroute a shipment. Writes an audit row — compliance
    requires a reason string on every manual intervention."""
    return post_with_audit(shipment_id, hub, reason)

# Note what makes this an FDE artifact and not a demo:
#   - docstrings say WHEN to use the tool, not just what it does
#   - the audit row exists because their compliance team requires it
#   - the schema quirks are handled here, not left for the model
```

```python
› Use a subagent to map how orders flow from intake to fulfillment in 
this repo. I need the data model, the integration points, and anywhere 
state can be written twice. Write it to notes/orders.md. 

● Spawning research subagent · separate context window 
● Read 23 files · 41.2k tokens — none of it in your window 

✓  Returned 680-token summary → notes/orders.md Found: intake writes to `orders` AND `legacy_orders`. Reconciliation job runs 
nightly. Anything failing between 18:00 and the 02:00 job is invisible to ops.

 › That gap is the customer's actual complaint. Draft the MCP tool 
that surfaces those in-flight orders, then we walk ops through it. 
day 2. the previous vendor took six weeks to find this.

```

```python
# Dispatch triage for a 14-van plumbing company
// Structure this like an FDE post-mortem, not a project README.

## The workflow before
Dispatcher spent ~2.5h/day reading job notes and reassigning vans.
Two people quit over it in a year. Nobody had ever timed it.

## Constraints I could not change
- Scheduling data lives in a hosted tool with a read-only API.
- Dispatcher will not use a new app. It had to live in SMS.
- Owner would not approve anything touching customer payment data.

## What I deliberately did NOT build
Auto-reassignment. They didn't trust it and would have turned it
off in week one. Suggestion + one-tap approve instead.
// Being right about this mattered more than the model choice.

## What broke in week two
Job notes had inconsistent van nicknames ("big blue" vs "V-3").
Fixed with an alias table the dispatcher edits herself.
// This is the part that separates shipped from demoed.

## After
~40 min/day. Ran 5 months. She still uses it. Owner added 2 vans.
```

```python
# Run the round like a researcher. Solving too early is the tell.

## Surface the real constraints
- What have you already tried here, and why did it stop?
  // failed deployments hide every constraint that matters
- What can't change no matter what we build?
  // compliance, latency, data residency, the union contract
- Who has to approve this, and what will they object to?

## Find the actual workflow
- Walk me through the last time this went wrong.
- Who does this today, and what does it cost them per week?
- What happens downstream if we get it wrong at 3am?

## Define "good enough" — theirs, not yours
- What accuracy would make you turn this off?
- How will you know in 90 days whether this worked?
- What does the person doing this today do instead, after?

## Close the loop
- Reflect back what you heard. Get it corrected.
- Name what you would NOT build, and why.
// Saying "we shouldn't build that" is a senior signal, not a dodge.
```

## 局限

- 这是一篇职业指南兼 Substack 推广，很多数字（$785K、729%、60% 淘汰率、73% 的调查）没有给出来源细节，无法独立核实；“六种起点”的对应背景是我根据内容归纳的，原文每条只有一句标题式开头。
- 文中配图接口没有返回；5 段代码块已从原文原样补入上方。
