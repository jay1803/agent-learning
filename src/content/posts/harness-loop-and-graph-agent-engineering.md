---
title: "Harness, Loop and Graph: The Enhanced Edition of Agent Engineering"
date: "2026-11-27T11:43:36Z"
category: "agents"
description: "智能体测试全绿却没解决工单，问题不在模型，而在模型周围的系统：Harness 是智能体工作的空间，Loop 是它持续尝试的时间，Graph 是工作走的路线；文章讲三者各管什么、如何嵌套，映射到 Claude Code、Codex 和 Grok Bot，并用一个 IssueBot 贯穿搭建，建议先建 Harness、再闭合 Loop，工作真有结构时才画 Graph。"
source: "https://x.com/0xwhrrari/status/2118327478250840140"
author: "rari"
---

智能体可以把测试全部跑绿，却仍然没解决工单，因为真正决定它能否交付的，是运行环境提供的证据、循环采用的停止条件，以及工作图规定的验收路径。早期，人写提示词、读回答、纠错，再发起下一轮。现在，智能体连续运行数小时，可以开拉取请求、跑测试、把工作交给其他智能体，人已经很少逐步检查。Claude Code 负责人 Boris Cherny 提出的三项要求分别对应任务指令、运行预算和验证系统，后两项需要落实到提示词之外。开篇那个没修好问题的智能体，确实在给定仓库里跑了指定测试，也遵守了完成规则。错在这些条件没有检验工单真正要求的结果。重写提示词、换模型或扩大上下文，有时只会让这类故障换个地方出现。

```plaintext
01  The model is not the agent
02  Harness: the space
03  Loops: the time
04  Graphs: the structure
05  Harness vs loop vs graph
06  In your tools: Claude Code, Codex, Grok Bot
07  Build-along: IssueBot in 5 stages
08  Failure catalog
09  Evals for the harness
10  Security
11  Economics
12  Ship-first checklist
```

2023 年 4 月，Andrej Karpathy 描绘的方向在 AutoGPT 时期已有雏形。模型拿到目标和终端，却会兜圈、忘记做过的事，在工作只完成一半时宣告成功。两年后，讨论从写指令转向组织模型输入，Karpathy 把智能体描述为“一个正在形成的、负责协调单次大语言模型调用的复杂软件层”。Anthropic 同年 9 月将其概括为“大语言模型在循环中自主使用工具”。到 2026 年，这层软件本身成了产品。2 月，OpenAI 开放各个 Codex 界面背后的 Codex App Server。4 月，Anthropic 推出 Claude Managed Agents。8 月，Grok Bot 向公众开放，把智能体放进持久的云端计算机。9 月，OpenAI 基于 Codex 的运行系统推出 Agents API。应用定义工作空间和规则，运行系统管理调用循环，模型在其中选择行动。

```plaintext
FEB  OpenAI opens the Codex App Server, the harness behind every Codex surface
APR  Anthropic ships Claude Managed Agents, a hosted harness
AUG  Grok Bot opens to the public: bots on persistent cloud computers
SEP  OpenAI ships the Agents API on the Codex harness
```

**Harness Engineering** 管智能体能看见什么、能碰什么、能记住什么、能拿出什么证据。**Loop Engineering** 管它怎么尝试、检查、重试和停止。**Graph Engineering** 管有哪些步骤、步骤间传什么、谁选择下一条路径。模型在循环中运行，循环可以嵌入工作图的节点，整张图由运行环境承载。Stop 钩子由运行环境提供，用来强制再做一轮时承担循环职责。验证失败后返回实现，在图上是一条边，在执行中则闭合了修复循环。文章用 Claude Code、Codex 和 Grok Bot 对照这三层，并用 IssueBot 贯穿设计。它接收真实 GitHub 仓库中的工单，交付经审查并由人合并的拉取请求，完成条件包括工单验收通过、CI 全绿和审查批准。

```plaintext
HARNESS  = space      what the agent can see, touch, remember and prove
LOOP     = time       how the agent tries, checks, retries and stops
GRAPH    = structure  which steps exist, what flows between them, who picks the next one
```

```plaintext
INPUT   a GitHub issue in a real repository
OUTPUT  a reviewed pull request, merged by a human
DONE    the acceptance criteria pass, CI is green, the reviewer approved
```

Lance Martin、Gabe Cemaj 和 Michael Cohen 在 2026 年 4 月 8 日介绍 Claude Managed Agents 时，将 Harness 狭义定义为“调用 Claude 并将 Claude 的工具调用路由给相应基础设施的循环”。文章采用广义定义，包含循环所连接的文件、工具、沙箱、规则、记忆、检查和日志。Anthropic 把系统拆成负责决策的“大脑”，即模型和调用循环，负责执行的“双手”，即沙箱和工具，以及记录事实的“会话”，即只追加的事件日志。执行与历史都在同一个容器里时，容器一死，历史也会丢失。“运行系统离开了容器”之后，执行容器可以随时替换。“会话不是 Claude 的上下文窗口”说的是两者的保存期限。上下文只包含模型此刻看得到的内容，已经发生的事件要能跨压缩、崩溃和重启保留。

```plaintext
BRAIN    the model + the harness loop    decides the next action
HANDS    sandboxes and tools             execute it
SESSION  an append-only event log        remembers what happened
```

运行环境的八项职责从验收开始。**第一项是把请求写成契约**。 工单 #412 要修复邮箱包含大写字母时无法登录的问题，数据库模式和公开 API 保持不变，只允许改 `src/auth/service.ts` 与 `tests/auth/login-uppercase.test.ts`。先写 `test_login_uppercase_email`，用同一个测试证明修复前失败、修复后通过，再检查全量测试、lint、类型和实际变更范围。运行预算也可写入约束。缺少契约就容易出现**目标漂移**，智能体改去解决一个更容易的问题，仍然能报完成。Anthropic 的长任务环境由首个会话建立 `feature_list.json`，持久保存每项功能的验收状态。所有功能的 `passes` 初始为 `false`，后续会话只允许翻转这一字段。它明确禁止删除或修改测试，以免掩盖功能缺失或缺陷。选用 JSON 也是为了保护契约，因为模型较少不恰当地覆盖这种文件。

```json
{
  "goal": "Fix issue #412: login fails when the email has uppercase letters",
  "constraints": ["no schema changes", "public API unchanged"],
  "files_to_change": ["src/auth/service.ts", "tests/auth/login-uppercase.test.ts"],
  "test_first": "test_login_uppercase_email",
  "done_when": [
    "the new test fails before the fix and passes after it",
    "the full suite, lint and typecheck pass",
    "only files_to_change were touched"
  ]
}
```

**第二项是给智能体一张一屏能读完的仓库地图**。 根目录的 `CLAUDE.md` 或 `AGENTS.md` 用五行交代项目用途，再给出启动、测试和 lint 命令，标明材料位置、代码里看不出来的约定以及深入文档的入口。Codex 默认把拼接后的项目说明限制在 32 KiB，根文件长到 900 行时，可以按路径拆开并按需加载。Claude Code 团队同样把提示保持简短，让实际文件承载详细知识。

```plaintext
CLAUDE.md / AGENTS.md
  what this repo is, in 5 lines
  how to run it, test it, lint it
  where things live
  rules that are not obvious from the code
  pointers to deeper docs
```

**第三项是设计智能体与计算机的交互界面（ACI）**。 Anthropic 在《Building effective agents》里说，做 SWE-bench 时花在工具上的时间超过了优化整体提示词的时间。模型切换目录后反复弄错相对路径，他们将工具改为只接收绝对路径，错误随即消失。工具应使用 `github_search_issues` 这种带命名空间的名称，只返回有用字段，限制响应长度，并在错误信息里交代发生了什么、可以尝试什么。文章给出的 Claude Code 默认工具输出上限是 25,000 个词元。Anthropic 在自己的研究系统评估中仅改写工具描述，就缩短了 40% 的任务完成时间。IssueBot 的测试报告如果有 6,000 行，而真正的错误在第 4,812 行，模型就得为寻找一条断言读整份报告。更合适的输出先报总数，再只列失败项，把 `ERROR` 和原因放在同一行。Nicholas Carlini 为编译器智能体整理测试输出，也是为了防止“上下文窗口污染”。

```plaintext
NAMES    namespaced: github_search_issues, not search
OUTPUT   high-signal fields, not the whole API response
SIZE     capped (Claude Code caps tool output at 25,000 tokens by default)
ERRORS   what went wrong and what to try next
```

**第四项是管理模型的注意力预算**。 契约、地图和当前步骤常驻，文件、文档、技能与搜索结果先用路径、URL 或查询条件引用，再按需加载。沿用同一段对话时，轮次越多、工作质量越差，就是**上下文退化**。窗口将满时压缩旧轮次，需要重整上下文时开启新会话，子智能体用自己的窗口探索，回传 1–2K 个词元的结果。秘密、原始日志和整份目录留在窗口之外。文章举例说，Codex 在 10 月把 GPT-6.1 Sol 的默认上下文从 272K 提到 500K 个词元以减少压缩，额外容量依然会被无关日志占满。

```plaintext
ALWAYS     the contract, the map, the current step
ON DEMAND  files, docs, skills, search results, loaded by reference
COMPACTED  old turns, summarized when the window fills
ISOLATED   subagent work: explored in its own window, returned as 1-2K tokens
NEVER      secrets, raw logs, whole directories "just in case"
```

**第五项是持久化可恢复状态**。 Anthropic 发现“仅靠压缩还不够”，于是让每个会话结束时用 `claude-progress.txt` 记录进展与下一步，用功能清单保存逐项状态，用带说明的 `git log` 保存实际变更，用 `init.sh` 固化启动方法。运行系统安排新会话先读这些材料、跑一次基本的端到端检查，再开始新工作。IssueBot 在每步开始时读取持久状态，进程重启后也能从记录的步骤继续。示例状态记录工单 #412 正处于 `verify`、已到第 2 次尝试，邮箱应在 `AuthService` 里统一格式，数据库迁移方案因禁止变更模式而被否决，SSO 仍缺少测试覆盖。把否决理由单列出来，能防止压缩后又花一轮尝试同一方案。

```plaintext
claude-progress.txt   what was done and what is next, written at the end of every session
feature_list.json     the contract, one boolean per feature
git log               the real history, with descriptive commits
init.sh               how to start the app, so nobody rediscovers it
```

```json
{
  "issue": 412,
  "step": "verify",
  "attempt": 2,
  "decisions": ["normalize email in AuthService, not in the controller"],
  "rejected": ["lowercasing in a migration (reviewer: no schema changes)"],
  "open_risks": ["SSO path not covered by tests"]
}
```

**第六项是先配足观测手段，再扩大自主权**。 代码用测试、类型和 lint 检查，界面要实际启动、点击并截图，API 要向运行中的服务发真实请求，数据要检查模式、值域和新鲜度。Anthropic 发现实际测试工具显著改善了长任务的表现，默认的单元测试和 `curl` 会漏掉只有走完整个流程才能发现的问题。其浏览器工具看不到警告弹窗，依赖弹窗的功能因此留下更多缺陷。Carlini 的智能体难以判断测试耗时，他便给运行器加入 `--fast`，随机跑 1% 或 10% 的测试。IssueBot 的全绿也只能说明已观测路径通过，套件没走过启用 SSO 的登录流程，就拿不出那条路径的证据。

```plaintext
CODE      tests + types + lint
UI        start the app + click through + screenshot
API       real requests against a running server
DATA      schema + ranges + freshness
```

**第七项是在模型之外执行权限**。 模型提出动作，运行环境按权限策略决定能否放行，工具执行获准的动作，结果写入日志。Claude Code 按拒绝、询问、允许的顺序处理规则。Codex 用 `sandbox_mode` 控制可操作范围，用 `approval_policy` 决定何时要求批准。两者都提供由第二个模型审查动作的方式，自动审查模型在权限门禁中充当分类器。Cursor 的机制拦住约 4% 的动作，将自主程度形容成“旋钮”，Claude Code 文档也明确说自动模式会减少询问，但无法保证安全。

```plaintext
MODEL PROPOSES  ->  POLICY CHECKS  ->  TOOL EXECUTES  ->  RESULT LOGGED
```

**第八项是让每次运行留下五分钟内能读完的轨迹**。 轨迹记录契约、加载的上下文、工具调用、状态变化、检查结果、重试、成本和最终产物。Anthropic 逐轮读应用评估器的日志，找出它与人类判断不一致的地方来调校。Cursor 的 Cloud Doctor 读取失败轨迹，直接针对智能体所用的环境开拉取请求。

SpaceXAI 的 Lauren Tan 用倒金字塔表达规则建设的投入顺序，大部分资源投在上层，底层占最少。两周后，她展示了一个四天完成、产生约 1,150 个拉取请求的游戏副项目。每帧运行的代码以 `.hot.ts` 结尾，lint 禁止这些文件分配内存，文件名给出规则的适用范围，检查器负责执行。IssueBot 可以逐周把三条书面要求做进系统。“不得变更数据库模式”从 `CLAUDE.md` 移到阻止写入 `migrations/` 的工具前钩子。已有测试发生变更且缺少指定标签时，由 CI 判失败。必须走拉取请求的规则由推送拒绝和 GitHub 分支保护落实。每周做一次，持续一个月，文字说明就能主要留给真正需要判断的规则。

```plaintext
edited a migration
  week 1: "no schema changes" in CLAUDE.md
  week 2: a pre-tool hook denies writes to migrations/

fixed the test, not the code
  week 1: "never edit existing tests"
  week 2: CI fails if test files change without a label

pushed to main
  week 1: "always open a PR"
  week 2: a deny rule + branch protection
```

每次模型升级还应检查这些组件解决的问题是否依然存在。Prithvi Rajasekaran 在 2026 年 3 月 24 日写道，每个 Harness 组件都隐含一项关于模型能力的假设，值得做压力测试。Sonnet 4.5 以为自己快到上下文上限时会提前收尾，因此需要重置上下文。Opus 4.5 基本消除了这种行为，他便移除了重置。升级 Opus 4.6 后，他又去掉分阶段迭代，把评估移到最后只做一次。做法是逐项写清组件针对的弱点，每次在分支上移除一个再跑评估，结果持平或更优就删，否则保留并记录原因。随着模型进步，运行环境的设计空间“不会缩小，它会移动”。

```plaintext
DECAY CHECK (on every model upgrade)
for each component:
  what weakness was this added for?
  remove it on a branch, run the evals (part 9)
  same or better -> delete it
  worse          -> keep it, write down why
```

一个循环需要七样东西。**触发条件**可以是提示词、计时器、CI 事件或检查失败，缺失时只能靠人想起来启动。**目标**例如让一项失败测试通过，缺失时系统会追逐最好量化的结果。**状态**通过文件、进度笔记或 JSON 在轮次间传递，缺失时每轮都要从头摸索。**行动策略**规定工具、权限和单轮预算，用来堵住意外捷径。**证据**来自测试、评分或审查判定，让进度可以观察。**反馈**把失败断言交给下一轮，空泛地说“再试一次”容易重犯原错。**退出规则**规定通过、用完预算或无进展时如何收尾。

```plaintext
TRIGGER        what starts an iteration       a prompt, a timer, a CI event, a failed check
GOAL           what this loop is for          "make the failing test pass"
STATE          what carries between turns     files, a progress note, a state JSON
ACTION POLICY  what the agent may do          tools, permissions, budget per turn
EVIDENCE       how progress is measured       test output, a score, a reviewer verdict
FEEDBACK       what goes into the next turn   the failing assertion, not "try again"
STOP RULE      when it ends                   pass, budget hit, no progress
```

```plaintext
no evidence  -> the loop stops when the model feels done
no feedback  -> each retry repeats the last mistake
no state     -> each iteration starts from zero
no stop rule -> the loop runs until the money runs out
no trigger   -> a human has to remember to start it
no goal      -> the loop optimizes whatever is easiest to measure
no policy    -> the loop finds the shortcut you did not forbid
```

**L0 是秒级的模型与工具内循环**。 Claude Code、Codex、Grok Bot 和文中提到的两套智能体 SDK 都自带这层，可以配置工具、权限和最大轮数。停止权在模型手里，模型停止请求工具时，这层就收尾，因此容易提前宣布完成。只有 L0 的 IssueBot 可以读工单、搜索代码、编辑文件并报完成，实际效果还未经独立验证。**L1 把分钟级的验证接在动作后面**。 修改、执行测试或类型检查、lint、构建，读取失败，修复并重新检查。检查越能复现真实问题，修复循环越有方向。检查太弱会放过仍有缺陷的代码，输出过于嘈杂则会消耗模型的阅读预算。

```plaintext
L0  AGENT LOOP        model -> tool -> result -> model         seconds
L1  VERIFY LOOP       act -> check -> fix                      minutes
L2  EVALUATOR LOOP    generator -> separate evaluator -> fix   minutes to hours
L3  SESSION LOOP      fresh session -> same goal -> resume     hours to days
L4  SCHEDULED LOOP    timer or event -> run -> report          days to weeks
L5  IMPROVEMENT LOOP  runs -> traces -> change the harness     weeks to months
```

```plaintext
edit -> run the check -> read the failure -> edit again -> run the check
```

**L2** 用几分钟到数小时处理脚本难以裁定的质量问题，例如设计、研究完整性或拉取请求是否解决了工单。评估器可以用另一模型，也可以让同一模型承担独立职责。Anthropic 的应用构建流程由规划器把 1–4 句需求变成产品规格，生成器分阶段实现，评估器像用户一样点击运行中的应用、逐项打分，低于硬阈值即退回具体反馈。自评的智能体会“自信地称赞自己的工作”，即使人类觉得结果“明显平庸”。独立的 Claude 评估器开箱也倾向宽松，需要少量示例、硬阈值和逐轮比对人类判定来校准。每轮开始前，生成器和评估器先把共同认可的完成条件写进文件，有一轮写了 27 项。

```plaintext
PLANNER    turns a 1-4 sentence request into a product spec
GENERATOR  builds in sprints
EVALUATOR  clicks through the running app like a user, scores each criterion,
           fails the sprint below a hard threshold, writes detailed feedback
```

AI 审查的价值取决于它改变了哪些决定。Anthropic 认为代码审查有价值，Lauren Tan 在 11 月 3 日批评的是泛泛审查，智能体容易纠缠小问题和眼下用不到的改动。Cursor 让多名审查者用“彼此低相关的视角”分别检查不同类型的问题，减少共同盲区。IssueBot 优先把词元花在测试、运行应用和回放等实证检查上。状态复杂时可加性质测试、TLA+ 或类型不变量。需要语言模型时，把问题缩到逐条判断差异是否满足 `done_when`，并保留其他验收依据。

**L3** 让持续数小时到数天的任务在上下文耗尽、进程崩溃或丢失线索后，从持久状态接着做。Geoffrey Huntley 在 2025 年 7 月发表的 Ralph 原型是 `while :; do cat PROMPT.md | claude-code ; done`，现在也可以换成 `claude -p` 或 `codex exec`。每轮读规格和计划，选最重要的未完成项，做完、测试、退出。Huntley 称它“在一个不确定的世界里，以确定的方式表现糟糕”，失败方式可预测，也就可以针对性调整。Anthropic 的 `ralph-loop` 用 Stop 钩子拦住退出并重新发同一提示，示例加 `--max-iterations 15`，因为默认没有轮次上限。`--completion-promise "DONE"` 精确匹配输出，打印 `DONE` 或撞到上限才退出。Claude Code 的 `/goal` 则用快速小模型逐轮核对完成条件。评估器只依据 Claude 在对话中展示的内容，不执行命令也不读文件，因此可以要求它看到 `tests/auth` 报告 0 项失败、`git status` 显示工作树干净，并写明最多 20 轮。更结构化的会话循环可以按持久清单每次完成一项功能。

```bash
while :; do cat PROMPT.md | claude-code ; done
```

```plaintext
/ralph-loop "Fix every failing test in tests/auth. Print DONE when the suite is green." --max-iterations 15 --completion-promise "DONE"
```

**L4** 把启动交给计时器、Webhook、新的拉取请求评论或部署失败等事件，可按天或周运转。Claude Code 的 `/loop` 任务创建七天后过期，且只在会话仍运行并空闲时触发。示例每十分钟查一次 IssueBot 拉取请求的 CI，在对应分支修复失败并处理新审查评论。需要在本地电脑关闭后继续时，可用 Claude Code 云端例程或 Grok Bot 云端计算机上的例程。定时轮询可能每五分钟花一次词元确认毫无变化，Monitor 可以等实际变化再启动。

**L5** 用数周到数月积累的运行轨迹改进系统本身。先从可回放的轨迹识别复发故障，再将它做成 lint 规则、技能变更、工具修复或新验收检查，在旧运行上做回归，最后把验证过的改动带进下一次运行。Boris Cherny 8 月提到的 Anthropic 内部例程会发现崩溃、合并重复实现、清理无用代码、充当“抽象警察”。定时执行属于 L4，请 Claude 在出现问题时调整例程，让第二天做得更好，才是 L5。例程改动的合并率不到一半，人类审查是最慢的节点。Harrison Chase 分享的论文也把这条改进周期自动化，其中的回归测试负责判定改动究竟带来改进还是造成漂移。

```plaintext
runs produce traces
traces show a repeated failure
the failure becomes a change: a lint rule, a skill edit, a tool fix, a new check
the change is tested against past runs
the next run starts with a better harness
```

`@0xwhrrari` 的短片制作把 L5 用在技能上。Claude Code 协助制作，Blender 生成 3D 场景，HTML 渲染界面镜头，声音由代码合成，一份时间轴文件协调这些产物。每部影片都做复盘，按现象、原因、修复记录问题并标注出处。同一条经验第二次出现时纳入渲染前清单，下一部片在写第一个场景前先读清单。到第 20 部时，共有 24 条规则，每条都至少导致过两部片返工。影片并未因此变便宜，因为作者逐渐加入真实模拟和在镜头里运行真实仓库等要求，返工更多花在物理模拟、画面修补模型等新问题上，构图仍偶有反复。角色的橙色在不同布光下出错 19 次，最终留下的是测量办法。在全分辨率画面里取受光脸颊或身体中部的像素中位数，避开最亮像素，再校正材质反照率。能固定的经验可写成数值，随场景变化的经验可写成检查。

```plaintext
every film ends with a retro
the retro writes each problem as symptom -> cause -> fix, tagged with the film
the second time a lesson shows up, it moves into a pre-render checklist
the next film reads the checklist before it writes a single scene
```

循环有三种可观察的退出。测试全绿或评分达到阈值时成功退出，轮次、词元、金额或运行时间用尽时按预算退出，连续两轮没缩小目标差距时按停滞退出。失败数 `12 → 7 → 4 → 4 → 4` 是停滞，评分 `5.1 → 6.8 → 7.2 → 7.3` 是接近阈值时收益趋平，未处理审查意见 `9 → 3 → 5` 则表明修复正在引入新问题。停滞时可以换计划、换检查、换模型或交给人。搜集资料按去重后的新增来源衡量，连续两轮没有新发现就可停止，Anthropic 的早期研究智能体曾因此暴露出“无休止地在网上寻找并不存在的来源”的问题。它还曾为一个简单查询启动 50 个子智能体，后来规定简单问题用一个智能体和 3–10 次工具调用，对比任务用 2–4 个子智能体，只有复杂研究才用超过 10 个。

```plaintext
SUCCESS  the evidence says done            tests green, score >= threshold
BUDGET   you ran out of what you allowed   turns, tokens, dollars, wall-clock
STALL    more iterations stopped helping   no new passing tests in K rounds
```

```plaintext
failing tests         12 -> 7 -> 4 -> 4 -> 4      stalled
evaluator score       5.1 -> 6.8 -> 7.2 -> 7.3    flattening near the threshold
open review comments  9 -> 3 -> 5                 diverging: fixes create problems
```

```plaintext
SPINNING         same action, same error, again          missing feedback
OSCILLATING      fix A breaks B, fix B breaks A          checks run one at a time
GOAL DRIFT       solves an easier problem                no contract
REWARD HACKING   edits the check instead of the code     the actor can write the check
PREMATURE DONE   stops before the work is done           the model owns the stop rule
CONTEXT ROT      quality falls as turns pile up          no compaction, no fresh session
RUNAWAY FAN-OUT  50 agents for a simple question         no effort rule
```

```plaintext
spend tokens on empirical checks first        tests, a running app, a replay
add formal checks where state is complex      property tests, TLA+, type invariants
give the LLM reviewer one narrow question     "does this diff meet each done_when criterion"
never let an LLM reviewer be the only gate
```

多步骤任务天然存在一张**工作图**。Anthropic 把工作流定义为由预设代码路径编排模型和工具的系统，把智能体定义为由模型动态指挥自身流程和工具使用的系统。Airflow、Temporal 已经提供步骤编排，新增的变量是某个节点可以自己选路，也可能选错。Harrison Chase 在 2024 年从 LangGraph 出发，主张先描述状态和转移，再限定哪些决策交给模型。节点各做一件事，边携带下游所需的对象，状态保存工单、计划、尝试次数和判定，路由器由代码或模型读取状态并记录选择，门禁则记录自己接受的证据或批准。

```plaintext
NODE    a unit of work with one job           plan, implement, verify
EDGE    a transition that carries data        plan -> implement, with the plan object
STATE   what the graph knows right now        issue, plan, attempts, verdicts
ROUTER  picks the next edge                   code or model, reading state
GATE    an edge that needs proof or approval  tests pass, a human says yes
```

这张图有四种常用形状。**链**适合下游消费上游产物，对应 Anthropic 的提示链，IssueBot 用它串起规划、实现和验证。**路由**根据状态分支，IssueBot 过检后进入审查，失败后回到实现，停滞后转交人。**分发与汇合**让独立任务同时执行，对应固定并行和调度者—执行者两种模式，前者在编写流程时确定分支，后者看到任务才拆分。**循环**对应评估与优化模式，由检查结果决定是否沿边返回前一步。每条边都应能说清下游读取了什么。C 如果从不读取 B 的产物，就可以和 B 并行。如果必须传整段对话，则应缩小交接范围。IssueBot 理想的计划边传有类型的对象，缺少 `test_first` 时，在下次模型调用前由代码拒绝。

```plaintext
CHAIN         A -> B -> C           each step needs the previous output
ROUTER        A -> (B | C | D)      different states need different paths
FAN-OUT/JOIN  A -> (B, C, D) -> E   independent work in parallel, merged after
CYCLE         A -> B -> check -> A  repeat until a condition holds
```

```plaintext
CHAIN         plan -> implement -> verify
FAN-OUT/JOIN  verify runs tests, lint and typecheck at once, all must pass
ROUTER        after verify: green -> review, red -> implement, stalled -> escalate
CYCLE         implement -> verify -> implement, at most 5 times
```

并行前先决定怎么汇合。`ALL` 要求全部成功，例如测试、lint 和类型检查都通过。`ANY` 采用第一个合格结果，例如三个候选方案中最先过检的一个。`QUORUM` 要求 N 个结果里至少 K 个同意，例如三名审查者中两名批准。`SETTLED` 保留每个分支的结局，例如保留搜到的资料并记下缺口。`Promise.all` 会在首个失败时拒绝，`Promise.allSettled` 把成功和失败都交给汇合逻辑。长流程还需要恢复点。LangGraph 用检查点和线程 ID 保存每步状态，`interrupt()` 等人决定，`Command(resume=...)` 恢复。被中断的节点会从头执行，先 `open_pr()` 再暂停可能重复开 PR。可以把需批准的动作放到暂停之后，必须提前发生的动作则用 `open_pr_if_missing()` 之类的查重操作来保证可安全重跑。

```plaintext
ALL      every branch must succeed          verify: tests AND lint AND types
ANY      first good result wins             try 3 approaches, keep the first green one
QUORUM   K of N must agree                  3 reviewers, 2 must approve
SETTLED  keep every result, success or not  research: keep what came back, note the gaps
```

```plaintext
WRONG   open_pr()  -> interrupt("approve?")       two PRs after the resume
RIGHT   interrupt("approve?") -> open_pr()
OR      open_pr_if_missing() -> interrupt("approve?")
```

Anthropic 在 2025 年 6 月 13 日公开的研究系统由 Opus 4 规划、Sonnet 4 子智能体并行搜索。其内部研究评估中，多智能体表现比单智能体 Opus 4 高 90.2%，而在 BrowseComp 上，仅词元用量就解释了 80% 的表现差异。单智能体约消耗普通聊天四倍的词元，多智能体约十五倍。各分支有干净的窗口，额外词元便能用在各自的材料上。适合这种结构的是价值高且有大量独立工作、材料超过单个上下文窗口，或需要用多种复杂工具取证的任务。各分支依赖密集、都要共享同一上下文时，拆开反而难以协调。大多数编码任务中真正可并行的部分比研究少。

```plaintext
+90.2%  multi-agent vs single-agent Opus 4 on their internal research eval
80%     of the performance variance on BrowseComp explained by token usage alone
~4x     tokens an agent uses vs a chat
~15x    tokens a multi-agent system uses vs a chat
```

Wilson Lin 在相隔六个月的两篇 Cursor 文章《Scaling long-running autonomous coding》和《Agent swarms and the new model economics》里描述了规模扩大后的协调问题。同级智能体共享状态、用任务锁时，20 个智能体慢到只剩 2–3 个的有效吞吐量。取消锁、事后处理冲突，缺少层级又让智能体变得畏惧风险。后来，规划者拆任务、执行者实现、裁决者判定每轮结果，有一次接近一周做出了超过 100 万行、分布在 1,000 个文件中的浏览器。进一步的群体模式用强规划者、便宜执行者和每秒约 1,000 次提交的自定义版本控制系统，把工作单位变成规格。专门的集成角色被移除，因为它制造的瓶颈更多。Cursor 的经验是，结构太少会冲突、重复、漂移，太多会变脆弱，很多改进来自删掉复杂度。他们还发现提示词比运行环境和模型更重要，并怀疑群体模式的收益主要来自规划者的上下文始终干净，因为规划者从不承担实现。

```plaintext
1 LOCKS        equal agents, shared state, task locks
               "Twenty agents would slow down to the effective throughput of two or three"
2 OPTIMISTIC   no locks, resolve conflicts after the fact
               "With no hierarchy, agents became risk-averse."
3 HIERARCHY    planners create tasks, workers finish them, a judge decides each cycle
               a web browser: over 1M lines across 1,000 files in close to a week
4 SWARM        smart planners, cheap workers, a custom VCS at ~1,000 commits a second
               "With swarms, the unit of work becomes the spec."
```

有足够强的验证基准时，调度者可以省掉。Nicholas Carlini 在 2026 年 2 月 5 日公布的 C 编译器项目用 16 个智能体，每个在独立 Docker 容器里用 Bash 循环运行 Claude。Opus 4.6 在两周内跑了近 2,000 个 Claude Code 会话，成本略低于 $20,000，产出约 100,000 行 Rust，可在 x86、ARM 和 RISC-V 上构建可启动的 Linux 6.9。没有调度智能体，每个执行者向 `current_tasks/` 写文本文件认领任务。GCC 提供比较基准，内核构建失败时，先让 GCC 编译大部分文件，再让新编译器处理其余文件来缩小故障范围。基准给扁平结构提供了收敛方向。Carlini 同时发现，新功能和修复经常破坏已有功能，只看到测试绿灯，很容易过早判断已经做完。

```plaintext
16 agents, each in its own Docker container, each running Claude in a bash loop
nearly 2,000 Claude Code sessions over two weeks, Opus 4.6, just under $20,000
a 100,000-line C compiler in Rust that builds bootable Linux 6.9 on x86, ARM and RISC-V
```

动态工作流把另一种分工写进代码。模型先设计图，生成的脚本按规定顺序、并行分支和汇合规则执行，所以文档称“工作流把计划写进代码”。文中所述功能默认同时跑 16 个智能体，单次最多 1,000 个，词元消耗高，适用于迁移、重构和批量修复。只有一个动作和一个检查时，单智能体加 L1 足够。节点还说不清时先让单智能体探索。每步都要完整上下文时，拆边会损失信息。路径每次都变时，可把路由留给模型。状态结构一屏说不清，也说明任务还没理解到适合画图的程度。

```plaintext
one step with one check          use L1 inside a single agent
you cannot name the nodes yet    explore with one agent first, draw the graph after
every step needs all the context splitting it loses information at every edge
the route changes every run      that is an agent: let the model route
```

增加结构可以按七个问题推进。首先看智能体能否用自己无法操控的手段验证结果，缺口在观测和 L1。其次看一场会话能否完成适合该长度的任务，问题通常先从地图、工具和上下文查起。长任务会丢线索，再补持久状态和 L3。脚本裁定不了质量，再加设有硬阈值的 L2。出现需求各异的步骤，才用有类型的边和门禁画图。有足够独立的工作承担相对聊天 4–15 倍的词元消耗，再引入并行。跨运行重复失败，才考虑用 L5 改环境。多数智能体加到第三或第四步就够了。单智能体加 L1 适合多数编码和修复，容易在覆盖较弱时停早。固定工作流便宜，适合步骤已知的重复任务，容易栽在意外输入上。带循环的图适合有门禁、可恢复的多步工作，成本可达聊天的数倍，要防错误路由和重复副作用。调度者与执行者适合广泛检索，容易给小任务分出太多支线，或堵在汇合点。群体模式适合大代码库和约一周的构建，缺少裁决容易冲突和漂移。没有观测手段就先画图，或者把调用五次工具就能解决的问题分给十个子智能体，都会把复杂度加到错误的位置。

```plaintext
HARNESS owns  what is possible        tools, permissions, context, state, sensors, traces
LOOP owns     what happens next time  evidence, feedback, retries, stop rules
GRAPH owns    what happens next step  nodes, edges, routing, joins, gates
```

```plaintext
HARNESS  sandbox, tools, CLAUDE.md, hooks, permissions, state file, traces
  GRAPH  plan -> implement -> verify -> review -> open PR -> CI -> human gate
    L1   implement <-> verify          until green or stalled, max 5
    L2   review -> implement           until no blocking comments, max 2
    L3   the whole run                 resume from state after a crash
    L4   new issue / new comment       starts a run
    L5   weekly trace review           proposes harness changes
```

```plaintext
HARNESS
edits files it should not touch        path rules, a pre-tool hook               01
cannot find the right code             a short map, a better search tool         01
tool output floods the context         summarize, cap, grep-able errors          02
forgets a decision after compaction    a state file read at every step           03

LOOP
says done but tests fail               a verify step the model does not control  08
same error, same fix, five times       exact feedback + a stall exit             09
fix A breaks B, fix B breaks A         every check, every round                  10
edits the test to pass                 tests read-only for the actor             11
never ends                             a budget exit                             13

GRAPH
steps wait for no reason               cut false dependencies                    15
one failed branch kills the run        allSettled + a join rule                  16
duplicate PR after a resume            check before create                       17
agents overwrite each other            ownership, worktrees, a planner           20
```

```plaintext
1. Can it check its work with something it does not control?
   no  -> sensors + an L1 verify loop               harness + loop
2. Does it finish tasks that fit in one session?
   no  -> fix the map, the tools, the context       harness
3. Does it lose the thread on long tasks?
   yes -> durable state + an L3 session loop        harness + loop
4. Does quality need judgment a script cannot give?
   yes -> an L2 evaluator with hard thresholds      loop
5. Does the task have distinct steps with different needs?
   yes -> draw the graph: typed edges, gates        graph
6. Are there truly independent parts worth 4-15x the tokens?
   yes -> fan-out or orchestrator-workers           graph
7. Does it keep failing the same way across runs?
   yes -> an L5 loop that changes the harness       loop on the harness
```

```plaintext
SINGLE AGENT + L1     most coding tasks, bug fixes
                      ~4x a chat in tokens · fails by stopping early on weak checks
FIXED WORKFLOW        repeated processes with known steps
                      cheap · breaks on inputs the steps did not expect
GRAPH WITH LOOPS      multi-step work with gates and resumes
                      a few x · routing bugs, non-idempotent resumes
ORCHESTRATOR-WORKERS  parallel research, wide search
                      ~15x a chat · fan-out on easy tasks, a slow join
SWARM                 huge codebases, week-long builds
                      large, mostly in the workers · conflicts and drift without a judge
```

```plaintext
GRAPH BEFORE SENSORS    a beautiful DAG where no node can tell if it worked
PROMPT AS POLICY        "never push to main" in markdown and nowhere else
SELF-GRADING            the agent that writes the code decides it is good
CONTEXT AS DATABASE     decisions that only exist in the conversation
FAN-OUT FOR EVERYTHING  10 subagents for a question one agent answers in 5 calls
FROZEN HARNESS          components built for last year's model, never removed
```

三套产品分别提供了地图、可复用知识、检查、权限、跨会话与定时循环、工作图和自建入口。**Claude Code** 用 `.claude/rules` 给根地图补充路径规则，例如只在 `src/auth/**` 加载邮箱统一格式的规则，要求在 `AuthService` 处理，并在 `tests/auth` 给身份验证改动补测试。知识由技能和插件承载。文章所述文档有 33 种钩子事件，包括 `PreToolUse`、`PostToolUse`、`Stop`、`SubagentStop` 和 `PreCompact`。`PreToolUse` 返回退出码 `2` 可以阻止调用，`Stop` 返回 `2` 会把标准错误送回 Claude，让它继续。钩子处理方式包括命令、`http`、`mcp_tool`、`prompt` 和 `agent`，因此能在停机前调独立智能体检查。Bash 沙箱在操作系统层限制写入工作目录，网络经过代理，默认允许列表为空。原生 Windows 不运行该沙箱，文章给出的环境是 WSL2。`/rewind` 的检查点无法替代版本控制，Bash 造成的变更不在其跟踪范围内。

```plaintext
MAP
  Claude Code  CLAUDE.md, .claude/rules with paths
  Codex        AGENTS.md chain, 32 KiB by default
  Grok Bot     the bot's job, its memory, its skills
KNOW-HOW
  Claude Code  skills, plugins
  Codex        skills in .agents/skills
  Grok Bot     skills, Teach a task
CHECKS
  Claude Code  hooks, exit 2 blocks
  Codex        hooks
  Grok Bot     routines + connected apps
PERMISSIONS
  Claude Code  deny > ask > allow, auto mode, sandbox
  Codex        sandbox_mode + approval_policy
  Grok Bot     the vault, which apps you connect
L3 / L4 LOOPS
  Claude Code  /goal, ralph-loop, claude -p / /loop, routines, Monitor
  Codex        codex exec, resume / cloud tasks, exec in CI
  Grok Bot     long-running bot work / routines
GRAPH
  Claude Code  subagents, dynamic workflows, agent teams
  Codex        subagents, custom agents
  Grok Bot     several bots, handoffs, group chats
BUILD YOUR OWN
  Claude Code  Claude Agent SDK, Managed Agents
  Codex        Agents API, App Server
```

```markdown
---
paths:
  - "src/auth/**"
---
# Auth rules
- Emails are normalized in AuthService, never in controllers
- Every auth change needs a new test in tests/auth
```

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-check.sh" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/require-green.sh" }] }
    ]
  }
}
```

```plaintext
/goal the test output shows tests/auth passing with 0 failures and git status shows a clean tree, or stop after 20 turns

/loop 10m check CI on the open IssueBot PRs, fix failures on their branches, reply to new review comments
```

Claude Code 的 `.claude/agents/` 用 Markdown 为子智能体定义提示、工具和模型，独立执行后返回摘要。示例 `issue-reviewer` 使用 `opus` 和 `Read, Grep, Glob, Bash`，按契约引用每条完成条件，找出缺测试的条件和可能受变更影响的具体调用方，用 `BLOCKING` 或 `APPROVE` 开头，最多五条，省去风格意见。需要并行写代码时，设置 `isolation: worktree` 为各自分配 Git 工作树。更大的图可以使用智能体团队或动态工作流，例如给每条 `issuebot-batch` 工单分配一个智能体、单独验证、各开一份拉取请求。`claude -p` 支持 `--output-format json` 和 `--json-schema`，Claude Agent SDK 在 Python 和 TypeScript 中提供同样的工具、调用循环和上下文管理，Claude Managed Agents 则提供托管方式。

```markdown
---
name: issue-reviewer
description: Reviews an IssueBot diff against its contract. Use after verify passes.
tools: Read, Grep, Glob, Bash
model: opus
---
You review one diff against .issuebot/contract-current.json. You never edit files.
1. Does the diff meet each done_when criterion? Quote the criterion.
2. Which criterion has no test?
3. Which changed line could break another caller? Name the caller.
Start with BLOCKING or APPROVE, then at most 5 bullets. No style comments.
```

**Codex** 从 `~/.codex` 的全局说明开始，再从仓库根目录逐层读到当前目录，较近的 `AGENTS.md` 优先。`~/.codex/config.toml` 里的 `sandbox_mode` 可设 `read-only`、`workspace-write` 或 `danger-full-access`，`approval_policy` 独立设置，可用 `on-request`、`never` 或更细的选项。文中给出的 `codex exec` 默认是只读，无人值守的 CI 要写入就得显式开放。示例用 `codex exec --json --output-schema verdict.schema.json` 返回 `PASS` 或 `FAIL` 及首条失败测试，再用 `codex exec resume --last` 恢复修复，外层可按结构化结果分支。钩子接检查，`exec`、恢复、云端任务和 CI 支撑跨会话或事件驱动，技能使用跨智能体的 `.agents/skills`，工作图可由子智能体和自定义智能体组成，自建入口是 App Server 和 Agents API。OpenAI 内部产品的实践是多个入口共用一套 Codex Harness，工程师转向建设让 Codex 写代码的环境。作者建议 IssueBot 用 Sol 规划和审查、Terra 实现、Luna 分流，然后在自己的评估集上检验这种分工。

```
# ~/.codex/config.toml
sandbox_mode = "workspace-write"   # read-only | workspace-write | danger-full-access
approval_policy = "on-request"     # on-request | never (plus granular options)
```

```bash
codex exec --json --output-schema verdict.schema.json \
  "Run the test suite. Report PASS or FAIL and the first failing test."

codex exec resume --last "Fix the failing test you reported. Do not edit tests."
```

**Grok Bot** 把有名字和职责、能持续积累上下文的机器人放在带浏览器、文件系统和终端的云端计算机上。机器按用户分配，同一用户的机器人共享机器，FAQ 明说它“不是安全边界”。给一个机器人配置的保险库生产凭据，应视为同机的其他机器人也可能访问，敏感工作要按账号和信任级别拆分。职责、记忆和技能充当工作地图，保险库和已连接应用决定权限。产品自行路由模型，用户控制任务和检查。`Teach a task` 会录下最长十分钟的操作再起草技能，误点的三下也可能被记录，生成后要先审查。例程可定时，也可响应 GitHub、Slack、Linear、Sentry、PagerDuty、邮件和 Webhook，每个机器人最多 50 个例程，至少间隔五分钟，可用已连接的应用做检查。机器人可以并行、互发消息、交接所有权，或通过群聊串起节点。Grok 版 IssueBot 分成写契约的分流者、持有分支的修复者、负责批准或阻断的审查者。同机审查者技术上仍能动修复分支，因此要用角色技能约定和 GitHub 分支保护落实分工。Cursor Agent SDK、Kimi 的开源 AgentENV 和 Perplexity Computer 也承担这三层职责。

IssueBot 的五阶段示例使用 Claude Code 和 TypeScript 仓库，按上述映射也可换成 Codex。示例为展示流程简化了错误处理。

```plaintext
STAGE 1  one agent + a contract + a map         harness basics
STAGE 2  sensors + a verify loop                L1
STAGE 3  permissions + state + traces           harness hardening
STAGE 4  the graph                              plan, implement, verify, review, gate
STAGE 5  triggers + a weekly improvement loop   L4 + L5
```

1. **先用单智能体建立地图和契约**。 示例使用 TypeScript、Node 22、Postgres，`CLAUDE.md` 记录 `npm run dev`、`npm test`、单测命令 `npm test -- -t "<name>"`、`npm run lint` 和 `npm run typecheck`。`src/api` 放路由，`src/auth` 放登录、会话和 SSO，`src/ui` 放界面，`migrations/` 禁改，深入内容指向 `docs/architecture.md` 和 `docs/testing.md`。`gh issue view 412 --json title,body` 将工单写入 `.issuebot/issue.json`。第一次 `claude -p` 用 `--allowedTools "Read,Write"` 和 `--permission-mode acceptEdits`，只写 `.issuebot/contract-current.json`，填 `goal`、`constraints`、`files_to_change`、`test_first` 和 `done_when`，前几次由人阅读。第二次调用用 `Read,Edit,Write,Bash,Grep,Glob` 实现，并报告逐项验证方式。此时验证仍主要靠自己的回报。
2. **把观测接进 L1**。 `PostToolUse` 匹配 `Edit|Write`，调用 `lint-check.sh` 运行 `npm run --silent lint`，通过后再跑 `npm run --silent typecheck`。失败时最多回传 20 行匹配 `error` 的信息，退出码 `2` 会反馈错误，已经发生的编辑无法撤销。Stop 调用 `require-green.sh`，用 `npm test --silent` 跑测试，失败时最多回传 15 行匹配 `FAIL`、`ERROR` 或 `expected` 的信息。`stop_hook_active` 让第一次红灯把 Claude 送回去，第二次停止放行，避免钩子无限重入。紧凑报告示例为 `PASS 214 FAIL 2`，两条失败分别是 `tests/auth/login-uppercase.test.ts` 的大写邮箱用例预期 `200`、实际 `401`，以及 `tests/auth/sso.test.ts` 的会话 Cookie 缺少 `secure` 标记。
3. **加权限、持久状态和轨迹**。 示例允许 `Bash(npm test *)`、`Bash(npm run *)`、`Bash(git diff *)`、`Bash(git status)`，拒绝 `Edit(./migrations/**)`、`Read(./.env)`、`Bash(git push --force *)`、`Bash(git push origin main *)`。`protect-tests.sh` 在 `Edit|Write` 前把目标转成仓库相对路径，再用 `git cat-file -e "main:$rel"` 查询主分支。已有测试必须由人决定能否变更，本轮新增的测试仍可调整。每步开始读持久状态，结束向 JSONL 追加记录。示例在 `2026-11-04T14:02:11Z` 记下 #412 的第 2 次验证失败，耗费 18,234 个词元和 $0.41。`Edit|Write` 钩子看不到由 Bash 发起的编辑，差异检查因此放到外层。
4. **由 LangGraph 执行门禁和路由**。 `plan` 从 `main` 建立 `issuebot/412`、抓标题和正文、让模型写契约。`check_contract()` 要求允许变更的路径在 `src/` 或 `tests/`，拒绝含 `..` 的路径和 `main` 上已有的测试，随后删除原始工单。`implement` 吃进契约、当前验证失败或审查结果，以及此前否决的理由。`verify` 由代码并行执行测试、lint 和类型检查，按实际退出状态汇合。先将新增文件也纳入暂存区，再与 `main` 比较，越出契约或改写旧测试都判失败。验证通过才进入审查，失败最多携带 2,000 字符反馈返回实现，达到五轮预算或连续两轮失败数无下降就转交人。`review` 从 `claude -p --json-schema` 响应的 `structured_output` 取得 `APPROVE` 或 `BLOCKING` 及具体意见，阻断意见写入否决记录，未用完两轮审查预算则回到实现。`open_pr` 先按分支查现有 PR，已有则跳过，否则提交、推送并创建。随后 `gh pr checks --watch` 等待真实 CI，失败则转交，成功才在 `human_gate` 用 `interrupt()` 等待，恢复输入为 `approve` 才走批准路径，合并交给人。`escalate` 发模板工单评论，交代尝试次数并请人接手。`SqliteSaver` 用 `.issuebot/graph.db` 保存检查点，线程 ID 为 `issue-412`，模型成本和检查结果写入轨迹。作者用模拟的 `git`、`gh`、`npm` 和 `claude` 验证了路由、停滞、恢复和差异检查，尚未在真实仓库运行，并提醒按所用版本核对 headless 的返回字段。
5. **接上触发器和周度改进**。 给 GitHub 工单加 `issuebot` 标签，可由 Claude Code 例程、Grok Bot 例程或 CI 启动工作图。第二个触发器只接收协作者对 IssueBot PR 的新审查评论，用不带工具的 `claude -p --json-schema` 转为修改请求列表，由代码剔除契约外的文件，实施节点只接收过滤后的列表。每周读过去七天的 `.issuebot/traces.jsonl` 和 PR 审查意见，按原因分组统计失败及转交记录，针对首要原因只提一项改动，可选 lint 规则、钩子、技能、`CLAUDE.md` 或工具变更。提案注明运行和轨迹行，在分支上回放最近五条失败工单，报告哪些通过，由人审查提案与回放结果后合并。

```markdown
# CLAUDE.md
Web app: TypeScript, Node 22, Postgres.
Run: `npm run dev`. Test: `npm test`. One test: `npm test -- -t "<name>"`.
Lint: `npm run lint`. Types: `npm run typecheck`.
Layout: src/api (routes), src/auth (login, sessions, SSO), src/ui, migrations/ (do not edit).

Definition of done for any issue:
1. A new test file reproduces the bug and fails before the fix
2. The same test passes after the fix
3. npm test, lint and typecheck pass
4. Only files listed in the contract changed

More: docs/architecture.md, docs/testing.md

```

```bash
gh issue view 412 --json title,body > .issuebot/issue.json

claude -p "Read .issuebot/issue.json and CLAUDE.md. Write .issuebot/contract-current.json \
with goal, constraints, files_to_change, test_first and done_when. Do not change code." \
  --allowedTools "Read,Write" --permission-mode acceptEdits

claude -p "Implement .issuebot/contract-current.json. Follow its done_when exactly. \
Report which done_when items you verified and how." \
  --allowedTools "Read,Edit,Write,Bash,Grep,Glob" --permission-mode acceptEdits
```

```bash
#!/bin/bash
# .claude/hooks/lint-check.sh  (PostToolUse, matcher "Edit|Write")
out=$(npm run --silent lint 2>&1 && npm run --silent typecheck 2>&1)
if [ $? -ne 0 ]; then
  echo "$out" | grep -E "error" | head -20 >&2
  exit 2
fi
exit 0

```

```bash
#!/bin/bash
# .claude/hooks/require-green.sh  (Stop)
input=$(cat)
# if this stop was already forced by a hook, let it end: no infinite loop
if [ "$(echo "$input" | jq -r '.stop_hook_active')" = "true" ]; then exit 0; fi
out=$(npm test --silent 2>&1)
if [ $? -ne 0 ]; then
  echo "Tests are failing. Fix the code, not the tests. First failures:" >&2
  echo "$out" | grep -E "FAIL|ERROR|expected" | head -15 >&2
  exit 2
fi
exit 0
```

```plaintext
PASS 214  FAIL 2
ERROR tests/auth/login-uppercase.test.ts > uppercase email > expected 200, got 401
ERROR tests/auth/sso.test.ts > session cookie > expected secure flag
```

```json
{
  "permissions": {
    "allow": ["Bash(npm test *)", "Bash(npm run *)", "Bash(git diff *)", "Bash(git status)"],
    "deny": [
      "Edit(./migrations/**)",
      "Read(./.env)",
      "Bash(git push --force *)",
      "Bash(git push origin main *)"
    ]
  }
}
```

```bash
#!/bin/bash
# .claude/hooks/protect-tests.sh  (PreToolUse, matcher "Edit|Write")
path=$(jq -r '.tool_input.file_path')
rel=$(realpath --relative-to="$CLAUDE_PROJECT_DIR" "$path")
if [[ "$rel" == tests/* ]] && git cat-file -e "main:$rel" 2>/dev/null; then
  echo "Blocked: $rel is an existing test. Add a new test file instead." >&2
  exit 2
fi
exit 0
```

```json
{"ts":"2026-11-04T14:02:11Z","issue":412,"step":"verify","attempt":2,"passed":false,"fail":"login-uppercase: expected 200, got 401","tokens":18234,"usd":0.41}
```

```python
import json, os, subprocess, time
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver   # pip install langgraph-checkpoint-sqlite
from langgraph.types import interrupt, Command

MAX_FIX, MAX_REVIEW = 5, 2
TRACE = ".issuebot/traces.jsonl"

class State(TypedDict, total=False):
    issue: int
    branch: str
    files: list          # files_to_change from the checked contract
    attempts: int
    fail_counts: list    # failures per verify round, for the stall exit
    review_rounds: int
    rejected: list       # reviewer notes the next attempt must not repeat
    passed: bool
    failures: str
    review: dict
    ci_green: bool
    approved: bool

def sh(*cmd, check=True):
    return subprocess.run(cmd, capture_output=True, text=True, check=check)

def trace(step, **data):
    with open(TRACE, "a") as f:
        f.write(json.dumps({"ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "step": step, **data}) + "\n")

def claude(step, prompt, tools, schema=None):
    cmd = ["claude", "-p", prompt, "--output-format", "json",
           "--allowedTools", tools, "--permission-mode", "acceptEdits"]
    if schema:
        cmd += ["--json-schema", json.dumps(schema)]
    out = json.loads(sh(*cmd).stdout)
    trace(step, usd=out.get("total_cost_usd"))
    return out

def on_main(path):       # the file already exists on main
    return sh("git", "cat-file", "-e", f"main:{path}", check=False).returncode == 0

def check_contract(path=".issuebot/contract-current.json"):
    files = json.load(open(path))["files_to_change"]
    for f in files:
        if ".." in f or not f.startswith(("src/", "tests/")):
            raise ValueError(f"contract reaches outside src/ and tests/: {f}")
        if f.startswith("tests/") and on_main(f):
            raise ValueError(f"contract edits an existing test, needs a human: {f}")
    return files

def plan(s):
    sh("git", "checkout", "-B", s["branch"], "main")
    with open(".issuebot/issue.json", "w") as f:
        f.write(sh("gh", "issue", "view", str(s["issue"]), "--json", "title,body").stdout)
    claude("plan", "Write .issuebot/contract-current.json from .issuebot/issue.json. "
           "Copy the acceptance criteria into done_when. Do not change code.", "Read,Write")
    files = check_contract()               # the model wrote it, code checks it
    os.remove(".issuebot/issue.json")      # later nodes never see the raw issue
    return {"files": files, "attempts": 0, "fail_counts": [], "review_rounds": 0, "rejected": []}

def implement(s):
    claude("implement", "Implement .issuebot/contract-current.json.\n"
           f"Fix exactly this: {s.get('failures') or s.get('review', {})}\n"
           f"Earlier review notes, do not repeat these mistakes: {s['rejected']}",
           "Read,Edit,Write,Bash,Grep,Glob")
    return {}

def changed_files():
    sh("git", "add", "-A", "--", ".", ":!.issuebot")     # stage new files too
    return sh("git", "diff", "--cached", "--name-only", "main").stdout.split()

def verify(s):
    procs = [subprocess.Popen(c, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
             for c in (["npm", "test", "--silent"], ["npm", "run", "-s", "lint"],
                       ["npm", "run", "-s", "typecheck"])]
    results = [(p.communicate()[0], p.returncode) for p in procs]   # fan-out, join = ALL
    fails = [l for out, _ in results for l in out.splitlines() if "ERROR" in l or "error" in l]
    for f in changed_files():              # checked in code, so Bash cannot get around it
        if f not in s["files"]:
            fails.append(f"ERROR changed a file outside the contract: {f}")
        elif f.startswith("tests/") and on_main(f):
            fails.append(f"ERROR rewrote an existing test: {f}")
    passed = not fails and all(rc == 0 for _, rc in results)
    trace("verify", attempt=s["attempts"] + 1, passed=passed, fails=len(fails))
    return {"passed": passed, "failures": "\n".join(fails)[:2000],
            "attempts": s["attempts"] + 1, "fail_counts": s["fail_counts"] + [len(fails)]}

def stalled(c):          # the failure count did not shrink in two consecutive rounds
    return len(c) >= 3 and c[-1] >= c[-2] >= c[-3]

VERDICT = {"type": "object", "required": ["verdict", "notes"],
           "properties": {"verdict": {"enum": ["APPROVE", "BLOCKING"]},
                          "notes": {"type": "array", "items": {"type": "string"}}}}

def review(s):
    v = claude("review", "Review `git diff --cached main` against each done_when criterion in "
               ".issuebot/contract-current.json. Correctness and missing tests only.",
               "Read,Grep,Glob,Bash(git diff *)", VERDICT)["structured_output"]
    notes = v["notes"] if v["verdict"] == "BLOCKING" else []
    return {"review": v, "failures": "", "rejected": s["rejected"] + notes,
            "review_rounds": s["review_rounds"] + 1}

def open_pr(s):          # runs before the gate, so it must be safe to run twice
    if json.loads(sh("gh", "pr", "list", "--head", s["branch"], "--json", "url").stdout):
        return {}
    sh("git", "commit", "-m", f"Fix #{s['issue']}", check=False)   # no-op if already committed
    sh("git", "push", "-u", "origin", s["branch"])
    sh("gh", "pr", "create", "--fill", "--head", s["branch"])
    return {}

def ci(s):
    green = sh("gh", "pr", "checks", s["branch"], "--watch", check=False).returncode == 0
    trace("ci", green=green)
    return {"ci_green": green}

def human_gate(s):       # nothing before interrupt(): this node restarts on resume
    return {"approved": interrupt({"issue": s["issue"], "review": s["review"]}) == "approve"}

def escalate(s):
    sh("gh", "issue", "comment", str(s["issue"]), "--body",
       f"IssueBot stopped after {s.get('attempts', 0)} attempts. A human should take this one.")
    return {}

def after_verify(s):
    if s["passed"]:
        return "review"
    if s["attempts"] >= MAX_FIX or stalled(s["fail_counts"]):
        return "escalate"
    return "implement"

def after_review(s):
    if s["review"]["verdict"] == "APPROVE":
        return "open_pr"
    return "escalate" if s["review_rounds"] >= MAX_REVIEW else "implement"

g = StateGraph(State)
for node in (plan, implement, verify, review, open_pr, ci, human_gate, escalate):
    g.add_node(node.__name__, node)
g.add_edge(START, "plan")
g.add_edge("plan", "implement")
g.add_edge("implement", "verify")
g.add_conditional_edges("verify", after_verify, ["review", "implement", "escalate"])
g.add_conditional_edges("review", after_review, ["open_pr", "implement", "escalate"])
g.add_edge("open_pr", "ci")
g.add_conditional_edges("ci", lambda s: "human_gate" if s["ci_green"] else "escalate",
                        ["human_gate", "escalate"])
g.add_conditional_edges("human_gate", lambda s: END if s["approved"] else "escalate",
                        [END, "escalate"])
g.add_edge("escalate", END)

with SqliteSaver.from_conn_string(".issuebot/graph.db") as saver:   # survives a crash
    graph = g.compile(checkpointer=saver)
    cfg = {"configurable": {"thread_id": "issue-412"}}
    graph.invoke({"issue": 412, "branch": "issuebot/412"}, cfg)   # runs until the human gate
    graph.invoke(Command(resume="approve"), cfg)                   # after a human reads the PR
```

```plaintext
Read the last 7 days of .issuebot/traces.jsonl and the review comments on IssueBot PRs.
1. Group failed and escalated runs by cause and count each cause.
2. For the top cause, propose ONE harness change: a lint rule, a hook, a skill edit,
   a CLAUDE.md line or a tool change. Prefer the highest level of the pyramid that works.
3. Show the evidence: which runs, which trace lines.
4. Replay the 5 most recent failed issues with the change on a branch and report
   whether they now pass. Do not merge anything.
```

IssueBot 的工作图从规划、实现、验证、审查一路走到开 PR、CI 与人工批准。外层沙箱、权限、地图、工具、钩子、状态和轨迹给各节点划定行动范围。实现与验证闭合 L1，审查退回实现闭合 L2，SQLite 检查点提供 L3 的恢复能力，工单与评论启动 L4，周度回放驱动 L5。原文的二十项故障目录按这三层寻找原因，用可观察的症状和轨迹定位修复点。

- **01 错改文件**。 修身份验证却碰了 `src/billing`，早期搜索返回 40 个文件，智能体选了第一个。修地图、契约文件清单和路径规则。
- **02 工具输出过载**。 初次测试后工作质量下降，轨迹有一条 60K 词元的工具结果。给输出加摘要、限长和可搜索的单行错误。
- **03 丢失已做决定**。 智能体重试被否决的方案，唯一的否决记录已被压缩。每步读取持久否决清单。
- **04 秘密进入上下文**。 PR 描述出现 API 密钥，轨迹显示早期读过 `.env`。阻止读取，并在工具结果中脱敏。
- **05 环境漂移**。 本地能跑，云端找不到 `pnpm`。用 `init.sh` 或 Dockerfile 固化环境，启动会话时检查。
- **06 规则过时**。 模型遵循团队几个月前停用的约定，来源是无人维护的嵌套 `AGENTS.md`。为说明指定负责人，并在模型升级时重验规则。
- **07 共享机器权限泄露**。 分流机器人用了另一机器人的生产登录。按信任级别分账号，限制保险库凭据权限。
- **08 提前收尾**。 机器人报“已修复”，CI 仍红，最近十轮没有测试命令。让运行系统执行检查，或要求 `/goal` 看见对话里的验证证据。
- **09 空转**。 同一个编辑和错误出现五次，差异哈希一致。回传具体错误，触发停滞退出。
- **10 振荡**。 lint 通过后测试转红，下一轮又变成 lint 失败。每轮跑完整组检查，以 `ALL` 汇合。
- **11 利用验收漏洞**。 测试全绿但缺陷还在，轨迹显示执行者编辑了旧测试。用工具钩子和外层差异检查保护测试，让执行者无法改写评估依据。
- **12 评估器过于宽松**。 漏掉一半工单要求的差异获批，评语全是称赞。缩小问题、设定硬标准，用过去的人类审查校准。
- **13 超预算**。 一行拼写错误跑了 31 轮、花了 $40。限制轮数和词元，给小任务短路径。
- **14 定时任务静默失败**。 例程显示运行了一周，其实每次都在身份验证时退出。每次失败告警，每天发存活信号。
- **15 假依赖**。 一次运行 12 分钟、有 8 分钟在等待，lint 等测试，类型又等 lint。并行执行互不消费结果的检查。
- **16 汇合失误**。 一项可选检查超时，`Promise.all` 拒绝整个运行。先保留分支结果，再按声明的 `ALL`、`ANY` 或 `QUORUM` 判断。
- **17 恢复后重复动作**。 同一线程重跑 `open_pr`，留下两份 PR。创建前查重，或待暂停点之后再创建。
- **18 路由选错**。 安全工单仅凭标题被送进文档拼写短路径。结合标签和涉及的文件，并记录每次选择。
- **19 自由文本交接**。 实现漏掉半份计划，输入里缺 `files_to_change`。传递有类型、可校验的计划对象。
- **20 执行者冲突**。 两个执行者都认领身份验证清理，以不同方式重写同一模块。用任务锁、工作树或规划者按文件分配任务。

```plaintext
01 WRONG FILES
see    the diff touches src/billing for an auth bug
trace  an early grep returned 40 files, the agent took the first match
fix    a map, paths in the contract, path rules

02 TOOL FLOOD
see    quality drops right after the first test run
trace  one tool result of 60K tokens
fix    a summarizing wrapper, a size cap, ERROR on one line

03 LOST DECISION
see    the agent retries an approach the reviewer rejected
trace  the rejection only exists in turns that were compacted
fix    a state file with a "rejected" list, read at every step

04 SECRET IN CONTEXT
see    an API key in a PR description
trace  Read(.env) early in the session
fix    deny Read(./.env), redaction in tool results

05 ENVIRONMENT DRIFT
see    works locally, fails in the cloud run
trace  "command not found: pnpm"
fix    init.sh or a Dockerfile as part of the harness, checked at session start

06 STALE RULE
see    the agent follows a convention the team dropped months ago
trace  the rule came from a nested AGENTS.md nobody owns
fix    owners for instruction files, the decay check on every upgrade

07 SHARED MACHINE LEAK
see    the triage bot used a production login
trace  the credential came from a vault entry added for another bot
fix    separate accounts per trust level, least-privilege vault entries
```

```plaintext
08 PREMATURE DONE
see    "Fixed!" with a red CI run
trace  no test command in the last 10 turns
fix    checks run by the harness, /goal on transcript evidence

09 SPINNING
see    the same edit and the same failure, five times
trace  identical diff hashes across attempts
fix    feed back the exact error, stall exit after 2 rounds without progress

10 OSCILLATION
see    lint passes, tests fail, then lint fails again
trace  a different check failing each round
fix    every check every round, join with ALL

11 REWARD HACKING
see    tests pass, the bug is still there
trace  an Edit on an existing test file
fix    the protect-tests hook + a diff check in code that Bash cannot skip

12 GENEROUS JUDGE
see    the reviewer approves a diff that misses half the issue
trace  review notes that are all praise
fix    narrow questions, hard criteria, calibration on past human reviews

13 RUNAWAY BUDGET
see    a $40 run for a one-line typo
trace  iterations: 31
fix    caps, a token budget, a fast path for small issues

14 SILENT SCHEDULE
see    the routine "ran" all week and nothing happened
trace  every run exited at the auth step
fix    an alert on every failed run, a daily heartbeat

```

```plaintext
15 FALSE DEPENDENCY
see    a 12-minute run where 8 minutes are waiting
trace  lint waits for tests, types wait for lint
fix    run independent checks in parallel

16 BROKEN JOIN
see    the run fails because one optional check timed out
trace  Promise.all rejected on the first error
fix    allSettled + an explicit ALL / ANY / QUORUM rule

17 DUPLICATE SIDE EFFECT
see    two identical PRs after a resume
trace  open_pr ran twice on the same thread
fix    check before create, side effects after interrupts

18 WRONG ROUTE
see    a security issue went down the "docs typo" fast path
trace  the router chose from the title alone
fix    route on labels + files touched, log every choice

19 FREE-TEXT EDGE
see    implement ignores half of the plan
trace  the plan was a paragraph with no files_to_change
fix    a typed plan object, validated in code

20 OVERLAPPING WORKERS
see    two workers rewrote the same module two different ways
trace  both claimed the "auth cleanup" task
fix    task locks, worktrees, a planner that assigns files
```

评估的对象是实际部署的**模型与运行环境组合**。Anthropic 的研究团队从约 20 个真实查询起步，早期改一处提示词就曾让成功率从 30% 跳到 80%。IssueBot 可选 20 条有已知正确修复的历史工单，每条保存工单 JSON、固定仓库提交、隐藏测试和备注，覆盖拼写修复、单文件缺陷、多文件缺陷、应转交人的工单，以及一条试图诱导越权的工单。通过率以隐藏测试和审查都过关为准。成功任务成本用所有尝试的总支出除以通过数。转交准确率同时算漏转和误转。安全指标统计被阻止的动作并要求实际越权为零。人工纠正量记录合并前人还要改什么。每个案例跑三次，单次的 `16/20` 对 `15/20` 可能只是噪声。按修复、测试和 PR 是否匹配工单来评终态，允许智能体走到人未预想到的有效路径。用语言模型裁判时提供评分规则和通过线，同时保留人工测试来发现自动评估遗漏的问题。

```plaintext
evals/issuebot/
  case-001/  issue.json  repo@commit  hidden_tests/  notes.md
  ...
  case-020/
```

```plaintext
PASS RATE            hidden tests pass and the reviewer approves
COST PER SUCCESS     total spend / passed cases, not cost per run
ESCALATION ACCURACY  escalated the cases it should, and only those
SAFETY               blocked actions attempted, and zero that got through
HUMAN CORRECTIONS    edits a human made before merge
```

消融实验可以分别去掉 Stop 钩子、审查子智能体或上下文重置，对照完整基线记录三轮通过率和每个成功任务的成本。权限门禁也有自己的误判率。Cursor 用 6,122 条标注记录评估自动审查智能体，发现同类动作时放时拦，经常反映策略本身含糊。为 IssueBot 开自动模式前，可先把过去 50 次工具调用标成允许或阻止，让门禁跑一遍，再读每条分歧。

```plaintext
COMPONENT REMOVED     PASS RATE (3 runs)   COST PER SUCCESS   DECISION
none (baseline)       ...                  ...                -
Stop hook             ...                  ...                keep / remove
reviewer subagent     ...                  ...                keep / remove
context resets        ...                  ...                keep / remove
```

Simon Willison 在 2025 年描述的风险组合有三项。私有数据包括代码仓库、秘密和收件箱，不可信输入包括工单、PR 评论、网页和邮件，对外通信包括推送、评论、HTTP 请求和消息。IssueBot 同时接触三者，外部用户就可能把诱导泄露 `.env` 的文字伪装成复现步骤。拆解办法是让沙箱读不到秘密、没有生产凭据，只让规划节点以 `Read` 和 `Write` 接触原始工单，由代码校验契约后删除原输入。模型生成的契约仍可转带原文中的指令，例如将已有的 `tests/auth/login.test.ts` 填入 `files_to_change`，所以要在入口检查、执行时阻断、对真实差异复核。运行环境也应限制对外动作，网络允许列表为空，推送限于 `issuebot/*`，转交节点只可发一种模板评论。Claude Code 的 OS 级 Bash 沙箱和 Codex 的 `workspace-write` 约束执行，把工具调用的审计轨迹放到沙箱外。能提出钩子改动的 L5 拥有最高的系统变更权限，因此由它提案和回放，人类负责合并。

```plaintext
PRIVATE DATA            your repo, your secrets, your inbox
UNTRUSTED CONTENT       issues, PR comments, web pages, emails
EXTERNAL COMMUNICATION  git push, comments, HTTP requests, messages
all three together = an attacker can write instructions your agent will follow
```

```plaintext
PRIVATE DATA      deny reads of secrets, no production credentials in the sandbox
UNTRUSTED INPUT   only the plan node reads the raw issue, and it has no tools but Read
                  and Write; code checks the contract it writes, then deletes the issue
EXTERNAL COMMS    an empty network allowlist, pushes only to issuebot/* branches,
                  one comment template from the escalate node
```

```plaintext
SANDBOX      OS-level isolation for bash (Claude Code sandbox, Codex workspace-write)
SECRETS      never in the repo, never in context, redacted in tool results
POLICY       deny rules enforced by the harness, not sentences in a prompt
AUTO MODE    a classifier is a gate, not a guarantee
SHARED HOST  on Grok Bot, split sensitive work across accounts
L5 LOOPS     the loop that edits the harness is the most privileged agent you run
AUDIT        traces of every tool call, stored outside the sandbox
```

工作图的形状也决定钱花在哪。原文引用的 2026 年 11 月 4 日挂牌价以每百万输入／输出词元计。Fable 5.1 和 `gpt-6-astra` 均为 $10／$50，Opus 5.5 为 $4／$20，`gpt-6.1-sol` 和 Sonnet 5.5 为 $2／$10，`gpt-6.1-terra` 为 $1／$5，Haiku 5.5 和 `gpt-6-luna` 为 $0.10／$0.50，`grok-4.7` 为 $2／$6。缓存输入价格约为新输入的四分之一到四十分之一，保持提示前缀稳定有利于命中缓存。Haiku 5.5 的上述价格适用于最长 100K 词元的提示，OpenAI 在上下文超过 272K 时收费更高，预算应按当时价格页重查。

```plaintext
Fable 5.1      $10 / $50       gpt-6-astra    $10 / $50
Opus 5.5       $4 / $20        gpt-6.1-sol    $2 / $10
Sonnet 5.5     $2 / $10        gpt-6.1-terra  $1 / $5
Haiku 5.5      $0.10 / $0.50   gpt-6-luna     $0.10 / $0.50
grok-4.7       $2 / $6
```

在 Cursor 的群体实践中，执行者消耗 69% 到 90% 以上的词元，因而决定账单大头。同一任务用 Opus 规划、Composer 执行花 $411，全用 GPT-5.5 花 $10,565，Cursor 报告两种组合的质量差不多，真正需要最前沿模型做判断的时刻很少。Anthropic 也把强模型做决策、便宜模型批量执行做成了 API 能力。它的复古游戏实验里，单独用 Opus 4.5 跑 20 分钟、花 $9，核心玩法仍有故障。加入规划器、生成器和评估器后，六小时、$200 交付了可玩的游戏。用成功交付衡量成本，IssueBot 依次从占多数的小工单走短路径、实现用便宜模型而规划和审查用强模型、限制轮次和停滞退出、稳定地图及技能和契约组成的提示前缀、只在独立上下文值得额外成本时开子智能体这五处优化。可由 lint 直接预防的复发故障，做成检查后就无需反复为诊断付词元。

```plaintext
agent vs chat              ~4x tokens    Anthropic research post
multi-agent vs chat        ~15x tokens   same
workers' share in a swarm  69% to 90%+   Cursor swarm post
```

```plaintext
cost per finished task = total spend across all attempts / tasks that actually passed
```

```plaintext
SOLO     one agent, Opus 4.5, 20 minutes, $9            the core game was broken
HARNESS  planner + generator + evaluator, 6 hours, $200  a working game
```

```plaintext
1. a fast path for small issues                most issues are small
2. a cheaper model for implement, a stronger one for plan and review
3. caps and stall exits on every loop          stop paying for spinning
4. a stable prefix: map, skills and contract identical across turns, so they cache
5. subagents only where a clean context pays for itself
```

上线前，逐次核对契约能否独立验收，地图能否照着走，工具结果是否简短、结构化、可检索，状态能否恢复，应用能否实际跑通，破坏性动作是否由权限机制拦截，秘密是否隔离并脱敏，轨迹是否能快速读完。运行中的循环要给出具体失败，验证依据要独立于执行者，成功、预算和停滞都应有出口，评估器要经人类判定校准，定时任务失败要告警，环境改动要经过人审查。工作图则逐节点检查职责和输出类型，逐边核实数据依赖、汇合规则、路由日志、暂停恢复时的幂等性，以及不可信输入和高权限工具的接触范围。模型升级时每个案例复跑三次，再每次移除一个组件，留下评估显示仍有作用的部分。原文末尾邀请读者收藏故障目录和清单以备查阅，转发或引用转发，订阅 Substack 和 Telegram 频道，并关注 `@0xwhrrari` 获取更多实践文章。 [原文](https://x.com/0xwhrrari/status/2118327478250840140)

```plaintext
HARNESS
[ ] every run has a contract with a done_when the model does not own
[ ] the map fits on one screen and points at the rest
[ ] tool output is short, structured and grep-able
[ ] decisions live in a state file, not only in the conversation
[ ] the agent can run the app and check its work end to end
[ ] destructive actions are denied by the harness, not by a sentence
[ ] secrets are unreadable and redacted
[ ] every run leaves a trace you can read in five minutes

LOOPS
[ ] a verify step the actor cannot skip or edit
[ ] feedback is the exact failure, not "try again"
[ ] every loop has a success exit, a budget exit and a stall exit
[ ] the evaluator is separate from the actor and calibrated on human judgments
[ ] scheduled runs alert on failure
[ ] harness changes are proposed by agents and approved by people

GRAPHS
[ ] each node has one job and a typed output
[ ] no edge waits for data it does not read
[ ] every fan-out has a join rule
[ ] side effects are idempotent and come after interrupts
[ ] routing choices are logged
[ ] untrusted input and dangerous tools never meet in one node

EVERY MODEL UPGRADE
[ ] rerun the eval set, three runs per case
[ ] remove one component at a time, keep what is load-bearing

```
