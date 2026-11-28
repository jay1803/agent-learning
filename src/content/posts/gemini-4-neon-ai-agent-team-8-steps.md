---
title: "Gemini 4 Neon: Build an AI Agent team with the best Google model in 8 Steps"
date: "2026-11-28T14:20:35Z"
category: "agents"
description: "Movez 的上手教程：Gemini 4 Neon 应当当作团队负责人来用，由它规划、分派和签收，Hydrogen 等便宜模型执行，另一个模型做验证者；同一模型单独跑 SWE-sweep 为 12.8%，放进团队 harness 为 39.0%。分 8 步讲安装与选档、Orchestrator 与思考档位、用 .agents/ 写出团队、带验证的 /swarm、在 T3 Code 混用多家模型、接入 Gemini 工具、用 ADK 写成代码，以及动效设计工作室。"
source: "https://x.com/0xMovez/status/2125577359269019791"
author: "Movez"
---

**Gemini 4 Neon 最能发挥判断力的位置是团队的 Orchestrator：由它规划、分派和验收，让 Hydrogen 并行执行，再让独立的验证者核查结果**。 Google 于 11 月 18 日发布 Neon，作者起初把它当作 Google 对 Opus 的低价回应，后来从任务分工上理解了它的用途。他估计，99% 的人只发挥了 Neon 约三分之一的能力。一类人在聊天窗口得到还不错的回答就回到 Claude，另一类让 Neon 单独以 `xhigh` 跑，到午饭时就耗尽配额。按他引用的 Google 数据，同一模型、同一权重，在 SWE-sweep 上独立运行得 12.8%，在团队框架中得 39.0%，约为原来的 3 倍。作者也在开篇邀请读者关注他的 Substack。 [substack.com/@0xmovez](https://substack.com/@0xmovez)

Google 发布文描述的是一个判断快的 Orchestrator 指挥多个并行的 Hydrogen 子代理。`High` 档的 Neon 读仓库、写简报、在执行者受阻时修订计划，最后签核。每个 Hydrogen 执行者只接一项范围明确的工作，有自己的工作副本，待命到被点名之前不消耗令牌。验证者在独立上下文中核对路径、行号和测试结果，换用另一种模型可减少与执行者共享盲点的可能。任何有命令行权限的代理都能通过 `gemini-api` 调用深度研究、图像、视频、语音和音乐。

四个入口可以先选一个。Antigravity 桌面应用和 `agy` CLI 都用 Google AI Pro 或 Ultra 的订阅配额，桌面端便于看团队协作，CLI 适合服务器和 SSH。Gemini API 按令牌计费，像 Richie 一样买不了 AI Pro 的 Workspace 用户可以用付费 API 密钥。T3 Code 通过 ACP 驱动同一套 Antigravity 运行时，以订阅账户登录就消耗订阅配额。ADK 把团队写进应用代码，模型调用也按令牌计费。作者给出的迁移方式是沿用 `.agents/` 和 `AGENTS.md`，以后再加其他入口。

macOS 和 Linux 运行 `curl -fsSL https://antigravity.google/cli/install.sh | bash`，将 `agy` 装到 `~/.local/bin/agy`。Windows PowerShell 运行 `irm https://antigravity.google/cli/install.ps1 | iex`。装好后用 `agy --version` 检查，再运行 `agy`。桌面端依次选“新建项目 → 添加文件夹 → 创建”，再选本地模式或新工作树。首次启动可导入 Claude Code、Codex、Cursor 或 Gemini CLI 的 MCP 服务器、技能和规则。走 API 路线就在 `~/.gemini/antigravity-cli/settings.json` 写入 `{ "modelProvider": "gemini" }`，设置 `GEMINI_API_KEY` 后启动 `agy`，页眉应显示“Gemini API 密钥”。Antigravity 正向付费 Pro 和 Ultra 用户推出 Neon，企业可通过 Gemini for business 使用。各档方案均可用 `/swarm`，免费用户可以先用当前可见的模型练习，升级后再切到 Neon。

```python
# macOS / Linux (installs to ~/.local/bin/agy)
curl -fsSL https://antigravity.google/cli/install.sh | bash

# Windows PowerShell
irm https://antigravity.google/cli/install.ps1 | iex

# check and start
agy --version
agy
```

```python
{ "modelProvider": "gemini" }
```

```python
export GEMINI_API_KEY="your-key"
agy   # header should now say "Gemini API key"
```

在聊天框下方的模型选择器中选 `Orchestrator · Gemini 4 Neon High`，就会在同一会话里用 Neon 规划、Hydrogen 执行。Hydrogen 遇阻会交回控制权，由 Neon 检查现场、修订计划并恢复执行。“设置 → 模型 → Orchestrator 设置”可更换组合。规划者默认是 Gemini 4 Neon，也可选 Carbon、Argon 或 Claude Opus 5.5。执行者默认是 Gemini 4 Hydrogen，也可选 Claude Sonnet 5.5。作者建议第一周沿用默认组合，遇到持续多天的任务再把规划者换成 Carbon。

Adam Holter 以 `low` 为基准估算每任务成本，`low` 为 `1x`，`medium` 为 `2.5x`，默认的 `high` 为 `5x`，`xhigh` 为 `8.6x`。从 `high` 升到 `xhigh` 约多花 72%，Terminal-Bench Science 提高 4.3 分，FrontierCode 提高 1.1 分，AutomationBench 提高 0.1 分，GDP.pdf 则下降 5.4 分。从 Gemini 3.x 迁移时要删掉 `thinking_budget` 和 `MINIMAL`，API 收到这些旧参数会返回 HTTP 400。文中提到 Google DeepMind 的 Philipp Schmid 给出了选档原则，所附正文在这里止于引介。

团队规则随仓库保存。Antigravity 在代理启动前读取仓库根目录和上级目录中的 `AGENTS.md`、`GEMINI.md`，以及 `.agents/` 下的配置，个人默认配置放在 `~/.gemini/config/`。`AGENTS.md` 供所有代理和工具共用，`GEMINI.md` 可选，用于 Gemini 专用说明。`.agents/agents/` 下的 `planner.md`、`implementer.md`、`verifier.md` 和 `motion-designer.md` 分别定义规划者、实施者、验证者和动效设计者。规则放在 `.agents/rules/*.md`，技能放在 `.agents/skills/<name>/SKILL.md`，钩子和 MCP 分别配置在 `.agents/hooks.json` 与 `.agents/mcp_config.json`。Antigravity 向下扫描一层，需要把辅助文件和代理定义放在一起时，用 `.agents/agents/<name>/agent.md`。

```python
your-repo/
├── AGENTS.md                 # shared rules: every agent, every tool
├── GEMINI.md                 # Gemini-only notes (optional)
└── .agents/
    ├── agents/               # custom subagents, one .md each
    │   ├── planner.md
    │   ├── implementer.md
    │   ├── verifier.md
    │   └── motion-designer.md
    ├── rules/*.md
    ├── skills/<name>/SKILL.md
    ├── hooks.json
    └── mcp_config.json
```

每份任务简报都写清负责范围、禁改范围和完成条件，共享规则也按这个结构写，便于简报继承。示例 `AGENTS.md` 先用一段交代项目用途、技术栈和运行方式，再列出可直接运行的命令 `pnpm install`、`pnpm test`、`pnpm tsc --noEmit` 和 `pnpm lint`。`app/(marketing)/` 只做落地页，`content/` 只处理 Markdown 文案，修改 `lib/billing/` 前须经 `@verifier` 签核。测试和类型检查都通过才算完成，报告中的每项断言都附仓库相对路径和从 1 开始的行号，最后发布 `@verifier [done]`，附少于 15 行的摘要。规则禁止推送、部署、触碰 `.env*`、重写负责范围外的文件和编造数字。“如果没有测量，就写‘未测量’。”

```python
# AGENTS.md

## Project
<one paragraph: what this repo is, stack, how to run it>

## Commands (agents may run these without asking)
- install: pnpm install
- test: pnpm test
- typecheck: pnpm tsc --noEmit
- lint: pnpm lint

## Ownership
- app/(marketing)/  → landing work only
- content/          → copy only, Markdown
- lib/billing/      → nobody edits without @verifier sign-off

## Done means
- tests and typecheck pass
- every claim in a report has a repo-relative path + 1-based line number
- post "@verifier [done]" with a summary under 15 lines

## Never
- push, deploy or touch .env*
- rewrite files outside your owned paths
- invent numbers: if you did not measure it, say "not measured"
```

自定义代理由 YAML 文件头和系统提示词组成，必填项只有 `name` 和 `description`。示例将 `verifier` 定义为只读审查员，设 `model: pro`、`skills: [skills/test-runner]`、`commandExecutionPolicy: sandbox`，授予 `view_file`、`grep_search`、`find_by_name` 和 `run_command`。它打开每处引用的文件，核对路径和从 1 开始的行号，把具体不符之处回给报告作者，再重跑对方声称已通过的测试和类型检查，附输出最后 20 行，并标出每个找不到命令输出或文件依据的数字。全部通过才发 `[accepted]`，否则发 `[rejected]` 并逐项列出修正要求。`mainAgent` 和 `subagent` 分别控制能否担任主代理、子代理，`mcpServers` 指定可用的 MCP 服务器。命令执行策略可选 `off`、`auto`、`eager` 或默认的 `sandbox`，作者建议建立信任前让执行者留在 `sandbox`。打开侧栏“自定义”即可在“代理”下看到四个角色，输入 `@verifier check README.md` 可检查验证者是否在独立上下文中回应。

```python
---
name: verifier
description: Read-only reviewer. Checks every path, line number and test claim in worker reports before anything is accepted.
tools: [view_file, grep_search, find_by_name, run_command]
model: pro
commandExecutionPolicy: sandbox
skills: [skills/test-runner]
---
You review, you never edit.
For each report you receive:
1. Open every file path cited. If a path or 1-based line number is wrong, reply to the author with the exact mismatch.
2. Re-run the commands the worker claims passed (test, typecheck). Paste the last 20 lines of output.
3. Flag any number that has no command or file behind it.
Only post "[accepted]" when all three hold. Otherwise post "[rejected]" with a numbered list of fixes.
```

第一次运行可以只审计。输入 `/swarm` 并按 `Tab`，描述几条独立工作线和一个验证角色，当前会话就成为 `@coordinator`。它用约一分钟检查仓库，创建具名代理，在共享看板上给每人发布简报。经 Kevin Hou 推荐，Flavio Copes 在 `flaviocopes.com` 上把任务分成三条：检查 `scripts/check-internal-links.mjs` 和近期草稿中的失效内部链接，检查 `scripts/audit-images.mjs` 与 `public/images/` 中过大或未使用的素材，检查 `scripts/build-site.mjs` 和 `package.json` 中最主要的构建瓶颈。验证者逐条核对文件路径和行号，协调者在看板汇总并排序。

```python
/swarm Audit three areas of flaviocopes.com with separate read-only workers:
(1) scripts/check-internal-links.mjs and recent drafts for broken internal links,
(2) scripts/audit-images.mjs and public/images/ for oversized or unused assets,
(3) scripts/build-site.mjs and package.json for the biggest build-time bottlenecks.
Have a verifier cross-check every reported file path and line number,
then post one ranked summary on the board.
```

这次运行有五名成员，均使用 `gemini-4-hydrogen`。`@links-auditor` 查链接，`@images-auditor` 查图片，`@build-auditor` 查构建，`@verifier` 核验报告，`@monitor` 负责监看。验证者在第 7 号报告中指出两条错误断言，链接审计员在 9 分 42 秒后提交修正并获签核，协调者随后在第 14 号帖子发布了 10 项按优先级排序的发现。审计找出 233 MiB 未使用或被同名资源覆盖的素材，发现图片脚本漏查了 3,646 张图中的 3,021 张，链接检查器漏查 79 个付费应用，构建处理约 8,721 个产物时的并发度只有 2。独立核验让原本可能直接出现在单次聊天回答里的错误在汇总发出前得到修正。

让团队改代码时，文中的第一个例子给 `src/routes/users.ts`、`src/routes/orders.ts` 和 `src/routes/products.ts` 各派一名执行者，分别加输入校验、在各处理器旁补测试，再由验证者运行 `npm test`。第二个例子给 `pkg/httpclient` 的 HTTP 客户端和 `pkg/webhooks` 的 Webhook 发送器加指数退避重试，由异模型验证者检查竞态并运行 `go test -race ./...`。`/swarm` 的执行者默认沿用当前会话的模型，需要异模型复核时要在任务里明确指定。

```python
/swarm Add input validation to the three API handlers in src/routes/users.ts,
src/routes/orders.ts and src/routes/products.ts. Give each handler its own worker,
add tests next to each handler, and have a verifier run npm test when they finish.
```

```python
/swarm Add retry with exponential backoff to the HTTP client in pkg/httpclient
and the webhook sender in pkg/webhooks. Run the verifier on a different model
than the workers, and have it check for race conditions and run go test -race ./...
```

T3 Code 可以并排运行 Claude Code、Codex 和 Antigravity 各自的原生执行框架。Antigravity 通过官方 ACP 代理接入，对应 `t3dotgg` 的 PR #9348。在“设置 → 提供商”启用 Antigravity 并安装运行时，要求 1.5+，推荐 1.5.12，约 1.25 GiB。登录可用 Google 账户、Gemini Enterprise、Gemini API 密钥或 Agent Platform（Vertex），买不了 AI Pro 的 Workspace 用户可选 Enterprise 或 API 密钥。选中 Gemini 4 Neon 后可在旁边调整思考档位，`/plan`、`/compact` 和 `/goal` 会透传给原生运行时，技能仍从 `.agents/skills` 加载。

Theo 曾要求 Neon 忽略某项技能规定的写作风格，Neon 照做了。他的代码审查测试得到 21 条有效发现、5 条轻微发现、0 条错误发现，架构问答中则有 72 条断言中的 10 条出错。作者据此把日常规划和 PR 审查交给 `High` 档的 Neon，认为成本允许每个 PR 都跑一次。大量实施交给 Orchestrator 调度的 Hydrogen，或已订阅的 Claude。扮演用户的体验测试交给另一家厂商的模型，并让它在没看过原计划的情况下体验。Theo 认为 Neon 的 3D 输出偏弱，作者建议让其他模型参与 3D 和着色器工作，并指出出色演示的视觉方向由人指定。Theo 还让 Neon 在 Windows 上安装并认证 Antigravity、在 T3 Code 内验证、通知另一个讨论线程，全程 8 分钟。过程中 Neon 发现适配器丢弃了 `html_render` 帧，绕过问题并提交了 PR。

Gemini 的研究和媒体能力也可以直接给其他代理用。11 月 23 日，Gemini API 开始接受视频、音频和文档作为函数结果。11 月 24 日，Google 开源的 `gemini-api` CLI 受到关注，Claude Code 和 Codex 中的代理也能从 shell 调用 Gemini 媒体工具。文中的安装版本是 11 月 20 日发布的 v0.5.0。macOS 和 Linux 用 `curl -fsSL https://raw.githubusercontent.com/google-gemini/gemini-api-cli/main/scripts/install.sh | bash`，Windows PowerShell 用 `iwr -useb https://raw.githubusercontent.com/google-gemini/gemini-api-cli/main/scripts/install.ps1 | iex`，也可用 `go install github.com/google-gemini/gemini-api-cli/cmd/gemini-api@latest`。随后用 `gemini-api configure --api-key "YOUR_API_KEY"` 把密钥存入系统钥匙串，用 `gemini-api whoami` 检查身份，再用 `gemini-api generate "Hello from my agent" --dry-run` 预览一次调用。

```python
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/google-gemini/gemini-api-cli/main/scripts/install.sh | bash
# Windows PowerShell
iwr -useb https://raw.githubusercontent.com/google-gemini/gemini-api-cli/main/scripts/install.ps1 | iex
# or with Go
go install github.com/google-gemini/gemini-api-cli/cmd/gemini-api@latest

# store the key in your OS keychain, then check
gemini-api configure --api-key "YOUR_API_KEY"
gemini-api whoami
gemini-api generate "Hello from my agent" --dry-run
```

把工具说明写进 `AGENTS.md`、`CLAUDE.md` 或 `.cursorrules`，代理就知道可以调用模型、生成或编辑媒体、分析文件，以及启动托管代理。用 `--help` 或 `--usage` 选命令，构造 `--body` 的 JSON 请求时查 `--schema`，先用 `--dry-run` 预览，需要 JSON 时再加 `--output-format json`。对 `generate`、`agent run` 和 `agent status --stream` 等流式命令，需要单个 JSON 响应或使用 `--jq` 过滤时，传 `--stream=false --output-format json`。`agent run --background` 默认返回单次交互，显式传 `--stream` 才流式输出。CLI 本身无状态，计划和上下文由调用方保管，返回的媒体路径和交互 ID 用于续接任务。

```python
You have access to gemini-api through the shell.
Use it to call Gemini models, generate or edit media, analyze files, or launch managed agents.
1. Inspect --help or --usage to choose a command, and --schema when building a --body JSON payload.
2. Preview API calls with --dry-run (or --dry-run --output-format json).
3. For discrete JSON output or --jq filtering on streaming commands (generate, agent run, agent status --stream), pass --stream=false --output-format json (--background on agent run returns a single interaction without streaming unless --stream is passed).
4. Capture returned file paths (from media commands) and interaction IDs (from agent/model runs) to continue multi-step tasks.
```

后台研究示例用 `gemini-api agent run "Research competing pricing pages for dev tools and cite sources" --agent deep-research-preview-04-2026 --background --jq '.id'` 调研开发工具竞品定价并要求引用来源。把返回值存为 `ID` 后，用 `gemini-api agent status "$ID" --stream=false --output-format json` 查询。`gemini-api analyze --input product-brief.pdf "What should we build first, and why?" > plan.md` 把产品优先级及理由写入计划。`gemini-api analyze --input before.png --input after.png "Summarize the visual design changes"` 用于比较截图。四个媒体例子分别是：

- Nano Banana 2.1 用 `gemini-api image "A friendly robot mascot, soft studio lighting" --out ./assets/mascot.jpg` 生成柔和影棚布光的机器人吉祥物。
- Omni 1.2 Flash 用 `gemini-api video "A slow camera move through a sunlit workshop" --out ./assets/` 生成阳光照进工作室的缓慢运镜。
- 3.8 Flash TTS 用 `gemini-api tts "Welcome. Let's build something together." --out ./assets/welcome.wav` 合成欢迎旁白。
- Lyria 用 `gemini-api music "Warm ambient music for a product walkthrough" --out ./assets/` 生成产品演示所需的温暖氛围音乐。

```python
# background Deep Research, returns an ID immediately
ID=$(gemini-api agent run "Research competing pricing pages for dev tools and cite sources" \
  --agent deep-research-preview-04-2026 --background --jq '.id')
gemini-api agent status "$ID" --stream=false --output-format json

# read a PDF / compare screenshots
gemini-api analyze --input product-brief.pdf "What should we build first, and why?" > plan.md
gemini-api analyze --input before.png --input after.png "Summarize the visual design changes"

# media: Nano Banana 2.1, Omni 1.2 Flash, 3.8 Flash TTS, Lyria
gemini-api image "A friendly robot mascot, soft studio lighting" --out ./assets/mascot.jpg
gemini-api video "A slow camera move through a sunlit workshop" --out ./assets/
gemini-api tts "Welcome. Let's build something together." --out ./assets/welcome.wav
gemini-api music "Warm ambient music for a product walkthrough" --out ./assets/
```

函数结果可以携带界面子代理录下的 `.mp4` 故障视频，供 Neon 直接观看，也可以携带通话录音、`.docx` 规格文档或电子表格中的工作表。媒体须留在工具结果中，另起一轮用户消息粘贴会打断函数调用链。

面向他人交付 Slack 机器人、夜间定时任务或 API 时，作者把 Antigravity 里的团队重建为 ADK 2.0 工作流，部署到 Cloud Run。Google 的开发者指南先用 Interactions API 展示最短交接路径。用 `genai.Client(enterprise=True, project="PROJECT_ID", location="global")` 创建客户端，第一次 `client.interactions.create` 让 `gemini-4-neon` 制定一个三步计划，把 Go 的 REST 订单服务迁移到 gRPC，并用 `store=True` 保存交互。第二次让 `gemini-4-hydrogen` 实现第一步的 `.proto` 服务定义，传 `previous_interaction_id=plan_turn.id` 即可续接，无需重发计划，最后用 `print(exec_turn.output_text)` 读取结果。

```python
from google import genai

client = genai.Client(enterprise=True, project="PROJECT_ID", location="global")

plan_turn = client.interactions.create(
    model="gemini-4-neon",
    input="Design a 3-step plan to migrate our REST order service to gRPC in Go.",
    store=True,
)
exec_turn = client.interactions.create(
    model="gemini-4-hydrogen",
    input="Implement step 1 (.proto service definition) from the plan.",
    previous_interaction_id=plan_turn.id,
)
print(exec_turn.output_text)
```

ADK 2.0 Workflow 用边连接节点，元组表示并行分派，`JoinNode` 等所有分支完成后，把按节点名索引的字典交给下一个节点。路由字典定义条件边，回到上游的边要带条件才可形成循环。示例从 `START` 进入 `planner`，由 `gemini-4-neon` 用 `thinking_level="HIGH"` 写 API、界面和测试三份简报，各自注明负责范围、禁改范围和完成条件。`worker_api`、`worker_ui` 和 `worker_tests` 分别用 `gemini-4-hydrogen` 执行。结果在 `join` 汇合，`verifier` 用同为 `HIGH` 档的 Neon 对照代码核查断言，通过 `Verdict` 输出 `accepted` 和 `fixes`。`check` 发出 `pass` 时由 `respond` 答复用户，发出 `revise` 时退回 `planner`。工作流里的 Agent 节点默认是 `mode="single_turn"`，执行者只接当前简报。要从 ADK 驱动实际的 Antigravity 代理，可用 `google.adk.labs.antigravity` 里的 `AntigravityAgent`。这段工作流代码是供改造的草图，名称要按实际安装版本的文档核对。

```python
from pydantic import BaseModel
from google.adk import Agent, Workflow, Event
from google.adk.workflow import START, JoinNode
from google.genai import types

HIGH = types.GenerateContentConfig(thinking_config=types.ThinkingConfig(thinking_level="HIGH"))

class Verdict(BaseModel):
    accepted: bool
    fixes: list[str]

planner = Agent(name="planner", model="gemini-4-neon", generate_content_config=HIGH,
    instruction="Split the request into api, ui and tests briefs. Each brief: owns / must not touch / done.")
worker_api   = Agent(name="worker_api",   model="gemini-4-hydrogen", instruction="Do only the api brief.")
worker_ui    = Agent(name="worker_ui",    model="gemini-4-hydrogen", instruction="Do only the ui brief.")
worker_tests = Agent(name="worker_tests", model="gemini-4-hydrogen", instruction="Do only the tests brief.")
join = JoinNode(name="join")
verifier = Agent(name="verifier", model="gemini-4-neon", generate_content_config=HIGH,
    output_schema=Verdict, instruction="Check every claim against the code. Reject anything unverified.")

def check(node_input: Verdict):
    yield Event(route="pass" if node_input.accepted else "revise")

def respond(node_input):
    return "Done. Summary for the user."

root_agent = Workflow(
    name="neon_team",
    edges=[
        (START, planner, (worker_api, worker_ui, worker_tests), join, verifier, check),
        (check, {"pass": respond, "revise": planner}),
    ],
)
```

动效制作也能按同一方式分工。作者观察到，广传的 Neon 演示常把画面写成单个 HTML 文件，用 Canvas、Three.js 或 WebGL 生成并逐帧渲染，因此片长、切点和音频削波都可以用程序核查。四个创作者给出的约束各不相同：

- `@IshanJX` 用 Extra Effort 要求制作 15 秒、60 FPS 的样片，全部放进一个 HTML/CSS/JS 文件，使用 WebGL 或 Canvas，无外部库或素材，加入 3D 运镜转场、动态排版、程序化着色器、物理粒子和卡点音效。
- `@atomtanstudio` 要求“只用代码制作一段向全世界介绍 Gemini 4 Neon 的动效视频……全力以赴。不用外部素材。”
- `@cfenghub` 让 Neon 自己写提示词，再制作 15 秒的单页 Three.js 与 GLSL 广告，采用高调明亮的发布风格和 Gemini 渐变色，人工修改为零。
- `@Jonathascosta89` 在 `XHIGH` 下只给项目文件夹和一句“给我的项目做一段介绍视频”。

雨景案例中，Neon 自行判断图片需要深度信息，获取 Depth Anything V2 Large，在本地运行并建出画面层次。针对 Noel 对默认渐变的抱怨，作者建议直接在简报里给品牌设计变量和节拍时点。团队示例先把仓库的 20 秒发布短片写进 `film/brief.md`，再分派四项工作：

- `@film` 用 Canvas 和 Three.js 写单文件 `film/film.html`，无外部素材，开放 `window.seek(t)`，使指定时刻的画面可重复渲染。
- `@copy` 写 `film/script.md`，四行旁白，每行最多九词，按简报节拍定时。
- `@sound` 运行 `gemini-api tts -f film/script.md --voice-prompt "calm, warm narrator" --out film/vo.wav`，再运行 `gemini-api music "minimal pulse, 120 bpm, 20 seconds" --out film/`。
- `@render` 用 Playwright 以 60 fps 调用 `seek(t)`，再用 `ffmpeg` 把画面、旁白与音乐合成 `film/out.mp4`。

异模型验证者核对片长是否为 `20.0 秒 ±0.2 秒`、每个切点是否对准简报中的节拍、用色是否全部来自 `film/brief.md`、音频峰值是否低于 `-1 dBFS`。驳回时要报出具体场景编号，让修改者能直接定位问题。

```python
/swarm Make a 20-second launch film for this repo from film/brief.md.
Workers:
(1) @film writes film/film.html: one file, Canvas + Three.js, no external assets,
    exposes window.seek(t) so frames can be rendered deterministically.
(2) @copy writes film/script.md: 4 lines of voiceover, max 9 words each, timed to the beats in the brief.
(3) @sound runs: gemini-api tts -f film/script.md --voice-prompt "calm, warm narrator" --out film/vo.wav
    and gemini-api music "minimal pulse, 120 bpm, 20 seconds" --out film/
(4) @render uses Playwright to call seek(t) at 60 fps, then ffmpeg to mux frames + vo + music into film/out.mp4.
Verifier on a different model: duration 20.0s ±0.2s, every cut lands on a beat in the brief,
brand colors only from brief.md, audio peak below -1 dBFS. Reject with the scene number, not "make it better".
```

文末把这些安排整理成九套提示词：

1. **Orchestrator 开场**。 读 `AGENTS.md` 和仓库，暂缓编辑。给出 10 行代码库地图、带路径与行号的 3 个最高风险文件及原因，以及能证明项目正常的命令。把 `<goal>` 拆成 2–4 条工作线，每条注明负责路径、禁改路径和完成条件。
2. **只读审计**。 用 `/swarm` 把 `<repo>` 的 `<N>` 个区域交给独立执行者，逐条写明要查的文件和问题。每项发现附仓库相对路径和从 1 开始的行号，由异模型验证者交叉核查，最后只发一份按优先级排序的汇总。
3. **功能开发**。 用 `/swarm` 构建 `<feature>`，让 `@api`、`@ui` 和 `@tests` 各管自己的路径。改共享文件前问 `@coordinator`。异模型验证者读每份差异，重跑指定的测试和类型检查，两项通过才验收。
4. **通用验证者**。 全程只读，打开每条引用，重跑每条声称通过的命令，拒绝没有文件或命令依据的数字。回复 `[accepted]` 或 `[rejected]`，驳回时用编号列出修正项及文件和行号。“永远别写‘看起来不错’。”
5. **执行者简报**。 给 `@<name>` 负责路径、禁改路径、一句话任务、须通过的命令和可观察结果。完成后发 `@verifier [done]`，附改动文件、已运行命令及最后 10 行输出，未验证的内容写“未测量”。尝试超过两次仍受阻就点名 `@coordinator`。
6. **单个顽固故障**。 写明哪台机器出问题、哪台正常，并量化症状。逐阶段计时列成表，按实测耗时占比排列原因，同时检查磁盘格式、挂载选项、DNS 和 CPU 调速策略，测出原因再改。Theo 的 VPS 工作树延迟总计 6.3 秒，其中 3.8 秒追到了按机械硬盘用途格式化的磁盘，这个原因此前漏查了三周。
7. **带 Gemini 媒体的落地页**。 生成吉祥物图片和欢迎旁白，启动托管研究代理调查竞品，再把素材和研究发现纳入页面。
8. **按简报制作动效**。 为 `<subject>` 写一个 `<duration>` 秒的 `film/film.html`，规格为 `1920x1080`、60 fps，单文件 Canvas 加 Three.js，无外部素材，限定字体和十六进制色值。按 `0.0`、`2.4`、`4.8` 秒等节拍切镜，开放 `window.seek(t)` 精确渲染指定画面，每个场景用两行注释标明时间范围。
9. **给未参与者的运行回报**。 最多 15 行，每个改动文件占一行，交代验证了什么和怎么验证、什么被驳回及原因、哪些仍未验证，以及一件需要手动检查的事。不用形容词。

```python
Read AGENTS.md and the repo. Don't edit anything yet.
Give me: (1) a 10-line map of the codebase, (2) the 3 riskiest files and why, with paths and line numbers,
(3) which commands prove the project works. Then propose how you would split <goal> into 2-4 worker tracks
with owned paths, forbidden paths and a done condition for each.
```

```python
/swarm Audit <N> areas of <repo> with separate read-only workers:
(1) <files> for <problem>, (2) <files> for <problem>, (3) <files> for <problem>.
Every finding needs a repo-relative path and 1-based line number.
Have a verifier on a different model cross-check every path and line, then post one ranked summary.
```

```python
/swarm Build <feature>. One worker per track:
@api owns <paths>, @ui owns <paths>, @tests owns <paths>. Nobody edits <shared files> without asking @coordinator.
Done = <test command> and <typecheck command> pass.
Verifier on a different model reads every diff and reruns both commands before accepting.
```

```python
You review, you never edit. Open every cited path. Re-run every command claimed to pass.
Reject any number without a command or file behind it. Reply "[accepted]" or "[rejected]" + numbered fixes
naming the file and line. Never write "looks good".
```

```python
You are @<name>. You own: <paths>. You must not touch: <paths>.
Task: <one sentence>. Done when: <command> passes and <observable result>.
When finished, post "@verifier [done]" with: files changed, commands run with last 10 lines of output,
anything you could not verify marked "not measured". If blocked for more than 2 attempts, tag @coordinator.
```

```python
<symptom with exact numbers> happens on <machine>, not on <other machine>.
Measure before you theorize: time each stage, show me the table, then rank causes by measured share of the delay.
Check the boring layers too (disk format, mount options, DNS, CPU governor). No fix until the cause is measured.
```

```python
Build a landing page for this app. Use Gemini to create a mascot image and a welcome voiceover,
and launch a managed research agent to investigate competing products.
Incorporate the assets and findings into the page.
```

```python
Write film/film.html: a <duration>s motion graphics film about <subject>, 1920x1080, 60 fps.
One file, Canvas + Three.js only, no external assets. Colors only from: <hex list>. Fonts: <font>.
Beats at: <0.0, 2.4, 4.8 ...> seconds; every cut lands on a beat.
Expose window.seek(t) that renders the exact frame at time t. Add a 2-line comment per scene with its time range.
```

```python
Summarize this run for someone who saw none of it: what changed (files + one line each), what was verified
and how, what was rejected and why, what is still unverified, and the one thing I should check by hand.
Max 15 lines. No adjectives.
```

费用要算到整次任务。Google AI Pro 是 `$19.99/月`，Antigravity 应用、`agy` 和通过订阅登录的 T3 Code 都把思考令牌计入订阅配额。按作者估算，团队约消耗单代理 `4x` 到 `5x` 的配额，可能在运行中耗尽。API 按每 100 万令牌计费，Neon 输入 `$3.00`、输出 `$15.00`、缓存输入 `$0.15`，缓存折扣为 95%。从 `4,096+` 令牌的提示开始可触发隐式缓存，因此作者把稳定的 `AGENTS.md` 和简报放在提示词开头。Hydrogen 输入 `$1.50`、输出 `$7.50`、缓存输入 `$0.075`。Carbon 的输入和输出优惠价为 `$2` 和 `$10`，截至 11 月 30 日，12 月 1 日起为 `$4` 和 `$20`。

SimpleBench 中，Neon 平均每题输出 2,385 个令牌，Opus 5.5 为 575 个，完整一轮分别花了 `$7.99` 和 `$2.74`。输出量可以让每令牌较便宜的模型在单次任务里花得更多。按作者引用的 Google 数据，`High` 档的 Neon 每任务成本比 Carbon 低 32%。作者据此用 `High` 做日常规划和审查，把大量执行交给 Hydrogen，把 `xhigh` 留给卡住的任务。

作者给第一个晚上排了六步：

1. 用 15 分钟装 `agy` 或 Antigravity 应用、登录并选择 `Orchestrator · Neon High`。
2. 用 10 分钟在主仓库运行第一套提示词，读完代码库地图。
3. 用 25 分钟把命令、负责范围和完成条件写入 `AGENTS.md`，配好 `.agents/agents/verifier.md`。
4. 用 30 分钟跑三条工作线的只读 `/swarm`，读最终汇总，手动抽查两项发现。
5. 用 15 分钟安装 `gemini-api`、写入代理说明，再用平时的代理对一个竞品发起深度研究。
6. 用 10 分钟从审计中挑一项发现，发起第一次改代码的团队任务，并指定另一种模型验证。

Theo 的 Neon 团队在不到 10 小时内超越了另一个模型追了七天以上的结果，把二进制缩到原来的 `1/5.95`，测试套件快了 48.6%。作者用这次有明确目标的协作收束全文：“写提示词现在是在安排人手。”规划、实施、验收各由谁负责，以及达到什么条件算完成，都是提示词要规定的事。“让 Neon 做决定。让 Hydrogen 写代码。让另一个模型检查。”
