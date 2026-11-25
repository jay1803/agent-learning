---
title: "A practical guide to shipping with Claude Code"
date: "2026-11-25T23:04:24Z"
category: "agents"
description: "Addy Osmani 介绍 Claude Ship：Code Review 找问题、PR Steward 让 PR 保持绿色但从不批准或合并、Claude Approvals 按仓库里的策略文件决定谁来批准；个人可以先用 /code-review、/ship、/steward 在自己的 PR 上试，把重复出现的评审意见、启动步骤和维护规则沉淀成 REVIEW.md、verify 和 steward skill，再在团队里从 observe 模式起步、逐步改为强制。"
source: "https://x.com/addyosmani/status/2125492213903978917"
author: "Addy Osmani"
---

这篇 X Article（2026-11-25，Addy Osmani，Claude Code 团队）介绍刚发布的 **Claude Ship**，并给出从个人试用到团队推广的路线。出发点是：开完 PR 之后总有一堆小活——CI 挂了、评审回来六条意见、合并 main 产生冲突——每一件都不大，但每一件都把你从专注的工作里拉出来。Claude Code 团队的做法是让 agent 接手这些后续工作，作者回来时 PR 往往已经更新过一轮。

最值得带走的几点：

- **三个 agent 分工明确，权力被刻意切开**：找问题的不改代码，改代码的**从不批准、从不合并**，批准与否由团队写在仓库里的策略文件决定。
- **规则来自重复**：同一类意见至少在 2 个 PR 上出现，才考虑写成规则，并由人批准加规则的那个 PR；规则也要定期删。
- **先观察，再强制**：审批策略先跑 observe 模式，只记录“本来会怎么判”，团队对照实际评审行为排查误判后再收紧。
- **责任不转移**：在 Claude Code 团队，调用 agent 的人对改动负责，就像自己亲手敲的一样。

## 三个 agent

- **Code Review**（已正式发布）：从多个角度对照代码库深度评审 PR，收集发现、**对抗式验证**、分类后贴到 PR 上。
- **PR Steward**（beta）：负责让 PR 保持绿色——处理失败的 CI、合并冲突，以及来自 Code Review、其他评审工具或同事的意见。每次推送后都留言说明改了什么、怎么撤销。**设计上不批准也不合并。**
- **Claude Approvals**（beta）：执行团队写在仓库里的审批策略，像一个更聪明的 CODEOWNERS。策略允许时可以自己批准常规改动，也可以要求特定场景必须有人深度签字；可以把 Code Review 结果或团队自己的分类器作为判断信号。

前两步（找问题、修问题）今天就能部分自动化；最后一步“能不能合并”是你在分支保护和策略文件里定下的决定。作者强调这套东西面向**没有管理员权限**的开发者或 tech lead：先自己跑命令，把经验写进仓库文件给团队看，只有要让 agent 自动处理全队 PR 时才需要管理员介入。

## 在自己的 PR 上

**如果只做一件事：推送前先评审自己的分支。** 这时抓到的 bug，以后就不会变成评审意见或失败的检查把你拉回来。

```
/code-review
/code-review high 1234       # 用 high effort 评审 PR 1234
/code-review --fix           # 把发现直接改进工作区
/code-review --comment 1234  # 把发现贴到 PR 上
/code-review ultra           # 在云端做更深的评审
```

effort 从 low 到 max：low 只给最有把握的发现，越高给得越多（包括不太确定的）；命令会记住上次的档位。注意：ultra 在云端跑、要登录 claude.ai、可能单独计费；后台评审时 `--fix` 的改动可能无法被 `/rewind` 撤回，最好先提交；**本地 /code-review 读 CLAUDE.md，但不读 REVIEW.md**。建议先跑几次，弄清它能抓到什么、会在哪里出错。

**`/ship`**：没有 PR 时，它会（1）像 `git add -A` 一样提交所有未提交改动（尊重 .gitignore，必要时建分支，提交前提示，可按 Esc 中止）——所以**先跑 `git status`**；（2）以你的身份推送并开 PR；（3）用 /code-review 评审，并修掉它认为成立的问题；（4）**盯着 PR 最多七天**，处理失败检查、冲突和评审意见，PR 合并或关闭即退出。

- 它不会提交名字像密钥的文件，也不会提交设定规则的文件（CLAUDE.md、REVIEW.md、`.claude/`、`.github/`），这些要手动先提交；公开仓库里它完全不替你提交。
- 可选参数：`/ship high`、`/ship 41`、`/ship +my-lint-bot`（额外读这个 bot 的评论，并当作需要对照代码核实的断言）、`/ship stop`。默认只读你、有写权限的人和 Claude GitHub App 的评论。

**盯 PR 的代价与限制**：以你的身份、在你的机器上、用你的额度运行，合上笔记本就停；需要先 `gh auth login`，只盯你自己开的 PR；非 auto 模式下每个提示都会停下等你，bypass-permissions 模式下不运行，Windows 上不会启动盯梢；需要独立的 checkout（继续干别的就用另一个 worktree）；仓库 `.claude/settings.json` 里如果有针对 Bash 的 PreToolUse 或 PermissionRequest hook 就无法启动。离开期间也在消耗模型轮次，第一次用最好待在旁边看用量。

**只在你信任的仓库里盯 PR。** 盯梢时它会把基础分支合进来，再跑你的测试等命令——也就是说，**任何能往基础分支落代码的人，都能在盯梢期间在你机器上执行命令**。Claude 被告知不要合并，Claude Code 也限制了无人值守轮次里的 gh 和 git 命令（禁止直接合并、强推），自己的提交也排除规则类文件。但这挡不住所有路径：测试脚本以你的凭证运行；你在某一轮里打字，会解除该轮的限制；开了 auto-merge 时，盯梢的一次修复可能恰好让 GitHub 自动合并；它的提交和推送**不经过仓库的 git hooks**，必需的检查要放进 CI 和分支规则。首次使用前运行 `/ship terms` 看完整条款。

**`/steward 41`**：只跑盯梢部分、不先评审，适合不需要再评审、只差有人推到合并的 PR（检查一直红、卡在冲突循环里的 PR 是好选择；正处在设计争论中的 PR 不适合，那是你要拍板的事）。注意它和团队服务 **PR Steward** 不是一回事：后者由管理员开启、以 claude[bot] 身份运行。

**大事升级给人**：盯梢时 Claude 只做小改动，重新设计（新 API、范围扩大）或没能解决的安全问题会上报；**同一个问题最多推 3 次**，之后报告尝试过的方案交给作者——对应团队验证文章里的说法：同一项检查三轮还过不去，大概是方法错了。

## 在仓库里沉淀规则

跑过几个 PR 后会看到重复模式：同一位评审者的同一条意见、Claude 每次都要自己摸索的启动步骤、某个不稳定的检查。按读取它的工具，写进不同文件：

- **重复的评审意见 → 评审规则**：用本地评审就写进 CLAUDE.md（/ship 用的是 /code-review）；用 Code Review 服务就写进根目录 REVIEW.md。Code Review 不读被评审 PR 里的 REVIEW.md，且只有默认分支受保护时，才遵守排除路径、限制 nit 数量这类指令。
- **重复的启动说明 → verify skill**：`.claude/skills/verify/SKILL.md`，写清怎么起服务、等健康检查、用种子账号登录、在浏览器里走一遍改动并截图，最后**没有步骤和所见就不许报告成功**。多跑几次修掉不稳定的部分——**人会忽略自己不信任的验证**。
- **重复的 PR 维护 → steward skill**：`.claude/skills/steward/SKILL.md`，比如锁文件用 npm install 重新生成不要手改、`e2e-nightly` 不稳定先重跑一次、推修复前跑测试和 lint、API 设计意见留给作者。frontmatter 里的 `user-invocable: false` 和 `disable-model-invocation: true` 让它不出现在 / 菜单、也不被模型自动挑中。容易忽略的一点：**本地盯梢从工作目录读这个文件，云端的 PR Steward 从默认分支读**。它改变不了盯梢的限制，但能合并的人都能改它，所以要像审 CI 改动一样审它。

REVIEW.md 示例（原文）：

```
# Review instructions

## What Important means here

Wrong results, leaked data or anything that blocks a rollback.
Style and naming are Nit at most.

## Always check
- Database queries are scoped to the caller's tenant.
- New API routes have an integration test.

## Keep it quiet
- Report at most five Nits.
- Skip generated files and lockfiles.
- Behavior claims need a file and line.
```

## 推广到团队

向管理员要一个仓库、几个志愿者和一段试用期：

1. 先谈好预算上限；
2. 保护默认分支：所有改动走 PR，最新一次推送需要批准，Claude GitHub App **不在绕过名单里**；
3. 由 Owner 为该仓库开启 Code Review；
4. 以 Manual 模式开启 PR Steward（有写权限的人评论 `@claude steward` 触发，`@claude stop` 停止，作者也可选择自动启用）；
5. 建一份 observe 模式的审批策略。这个文件合并即启用 Approvals，先和 Owner 打招呼。

PR Steward 会读评审者的评论并据此行动，和所有解析文本的 agent 一样会被人说的话骗，只在协作者可信的仓库里用，并检查它根据不可信用户评论做的改动。

**第一份审批策略**（`.claude/approvals.yml`，原文）：

```
# .claude/approvals.yml

version: 1
mode: observe

rules:
- purpose: "A change takes two people."
paths: ["**"]
verdict: { claude: comments, seats: 2 }
advisory: [claude/code_review]

- purpose: "A change to the review rules takes two people."
paths: ["**/.claude/**", "**/REVIEW.md", "**/CLAUDE.md", "**/CODEOWNERS", ".github/**"]
nested: inherit

verdict: { claude: comments, seats: 2 }
```

- `seats` 是需要几个人批准，作者可以占一个座位。坑：盯梢合并过基础分支后，最新提交是一个合并提交，作者座位没人坐，**作者要评论 `@claude approve`**。
- `claude: comments` 表示 Claude 不批准；多条规则匹配时**最严格的胜出**；observe 模式只打印结果不批准。
- **一定保留 `advisory` 那一行**：策略文件进入默认分支后，Code Review 只会在匹配到点名它的规则的 PR 上自动启动，删掉这行自动评审就停了；而点名 Code Review 的策略**即使 Code Review 关着也会启动计费评审**。
- 想看“Claude 评审通过时能否降低要求”，可以把 advisory 换成 override：`if: "claude/code_review = pass"` 时改为 `{ claude: approves, seats: 1 }`。作者提醒，PR 里的文字可能左右 Claude 的评审，一旦被左右，这个 override 就会降低该 PR 的门槛；必须有人看的路径放进没有 override 的规则里，合并前告知预算负责人（每次推送都会触发计费评审，observe 模式也一样）。
- 也可以自建分类器（`.claude/classifiers/<name>/def.yml`，比如“这个 PR 跟迁移有关吗”），每次运行都计费，起步先只用路径和 Code Review 结果。

**从观察到强制**：团队自己的内部提交闸门也用同样流程。observe 模式的价值只在于你真的去看——一两周后回看已合并的 PR，对比它的判决和评审者的实际行为，**重点修“Claude 会批准、但人其实不该放行”的那类误判**，再放宽规则。强制前要知道：**Claude 的批准在 GitHub 上是真批准**，规则集只要一个批准时它一个就够；开了 auto-merge 又有只靠作者就能满足的策略时，PR 可能没人动手就被合并，每条路径都要明确决定能否接受并写下来。然后按顺序收紧：

1. 对必须有第二双眼睛的路径，写一条没有 `if`/`override` 的规则，`nested: inherit` 带进子目录：

```
- purpose: "Auth, billing and CI take a person who isn't an author."
    paths: ["src/auth/**", "src/billing/**", ".github/**"]
    nested: inherit
    verdict:
      claude: comments
      seats: [{ count: 1, from: [humans, "!pr/authors"] }]
```

2. 删掉 `mode: observe` 并合并；
3. 约五分钟后在打开的 PR 上评论 `@claude approvals rerun` 清理旧结果（会再次计费分类器）；
4. 请仓库管理员把 Claude Approvals 检查设为必需，并指定来源为 Claude app——在此之前，不管检查结果如何 PR 都能合并。

已有的测试、扫描器和评审者都要保留。

## 本周可以做的三件事

1. 今天：在当前分支跑 `/code-review`，记下它错在哪、漏了什么。
2. 下一个 PR：在你信任所有可合并者的仓库里试 `/ship` 并守在旁边；在另一个终端和 checkout 里对已有 PR 试 `/steward`。
3. 周五前：把你重复最多的那条规则写进 CLAUDE.md、REVIEW.md 或 skill，自己提交（/ship 不提交规则文件），连同示例 observe 策略分享给团队。

## 局限

- 这是 Anthropic 员工为新产品写的上手指南，PR Steward 和 Claude Approvals 还是 beta，命令、计费和行为细节都可能变化，以官方文档为准；文章没有给出效果数据（误判率、节省的时间等）。
- 原文中策略 YAML 的缩进在接口返回里有些错乱（例如第一个示例的规则项缩进不一致），这里照原样收录，实际使用需按文档校正。
- 文中配图（三个 agent 的分工图、各文件对应哪个工具读取的表、observe 模式的判决对照表等）接口没有返回，总结依据文字和代码块。claude.dev 博客上有一篇同名文章（2026-11-24），这篇 X Article 应是其转载或改写版本，我没有逐字对照。
