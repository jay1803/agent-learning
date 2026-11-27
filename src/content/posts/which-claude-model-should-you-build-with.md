---
title: "Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku"
date: 2026-11-25T01:23:09Z
category: agents
description: "Addy Osmani 的 Claude 选型指南：多数工作从 Opus 5.5 medium 起步，规格清晰的日常任务降到 Sonnet，高量分类与子代理用 Haiku，最难的技术项目和长时间无人值守任务升到 Fable；换模型前先调 effort、先给模型自我验证手段；混用模型要注意缓存与思考块不跨模型、子代理只做“出错容易发现”的活，并用自己的任务按“每个完成任务的成本”实测。"
source: "https://claude.dev/blog/which-claude-model-should-you-build-with/"
author: "Addy Osmani"
---

这篇 claude.dev 博客（2026-11-09，Addy Osmani，Playbooks 栏目）回答“该用哪个 Claude 模型”。结论很直接：**大多数工作从 Opus 5.5 的默认 effort（medium）开始**——它是 Claude Code 的默认模型，每 token 价格是 Fable 5.2 的一半。然后按任务往下或往上调：规格清晰的日常活降到 Sonnet 5.5，最简单的高量活降到 Haiku 5.5，最难的技术项目、Opus 开到 high 仍不够、或长时间无人值守运行时升到 Fable 5.2。

文章里最值得带走的几个不那么直觉的判断：

- **每 token 更贵不等于每个任务更贵**。 最难的任务上，Fable 5.2 high 和 Opus 5.5 max 分数持平，成本却约一半。
- **换模型前先调 effort，再之前先给模型验证手段**。 能自动检查结果时，“全部用低档跑、失败的再用高档重跑”比全部高档更便宜也更准。
- **子代理放小模型，但只放“出错容易发现”的活**；改代码和判断留在主模型——这和 Claude Code 自带的 opusplan（Opus 规划、Sonnet 改代码）恰好相反。

## 按任务选起点

| 任务 | 起始模型 | 起始 effort |
| --- | --- | --- |
| 日常工程、调试、多 PR 功能 | Opus 5.5 | medium，再 high |
| 分类、路由、打标签、高量抽取 | Haiku 5.5 | medium |
| 搜文件、读日志、做摘要的子代理 | Haiku 或 Sonnet | 模型默认 |
| 聊天与交互会话 | Sonnet（简单高量用 Haiku） | low 或 medium |
| 规格清晰的编码（bug 修复、按 spec 迭代） | Sonnet 5.5 | medium，难的用 high |
| 日常文档、幻灯片、表格 | Sonnet 5.5 | high（Claude Code 里 medium） |
| 反复运行的 agent 任务（调查、审阅、起草） | Sonnet 5.5 | medium |
| 计算机使用和重视觉的流程 | Opus 5.5 | medium |
| 大型重构迁移、架构规划、带很多子代理 | Fable 5.2 | medium，再 high |
| 深度研究、科学或量化分析 | Fable 5.2 | medium，再 high |
| 还不确定 | Opus 5.5 | medium |

作者特别提醒：**规格清晰不代表该用 Sonnet**——迁移或性能优化也可能规格明确，但难度仍需要 Opus，大的甚至要 Fable。复杂财务模型、或从一大堆素材里生成的文档，也应从 Opus 起步。

## 四个模型对比

- **价格（每百万 token，输入/输出**）：Haiku 5.5 为 $0.10/$0.50（提示超过 100K 时 $0.50/$2.50）；Sonnet 5.5 $2/$10；Opus 5.5 $4/$20；Fable 5.2 $8/$40。缓存读取分别是 $0.01（超 100K 为 $0.05）、$0.10、$0.20、$0.20。
- 四个模型都是 1M 上下文、128K 最大输出。
- **思考**：Opus 和 Fable 始终开启自适应思考；Sonnet 默认开启，`between_tools` 可跳过开头的思考；Haiku 默认开启但可关。
- API 默认 effort：Haiku、Opus 为 medium，Sonnet、Fable 为 high（Claude Code 里两者都是 medium）。只有 Opus 和 Fable 支持付费换速度的 fast mode。

## 取舍

**能力与“每个完成任务的成本**”。 在 Terminal-Bench 3.0 上，上一代 Fable 5.1 max 得 58.0%，Opus 5.5 high 得 58.9%，token 只用了一半。在 FrontierCode 2.0 上，Fable 5.2 high 与 Opus 5.5 max 基本持平（45.3% 对 45.5%），每个任务成本却约一半——所以**把 Opus 开到 high 以上之前，先试 Fable**。小模型适合可检查输出的高量活，不适合长 agent 循环。比较模型时要给任务集里最难的那几题单独算账：某个 20 题的搜索基准上，两道题就占了 43% 的花费。

**延迟与准确率**。 有人在等回复的场景，从 Sonnet 的 low 或 medium 开始。SWE-bench Pro 上，Opus 5.5 medium 比 high 低约 2.5 分，成本约 70%；low 低约 8 分，成本约三分之一；xhigh 高约 1.4 分，成本是 high 的 2.5 倍。effort 只是让模型想得更久、调更多工具、多检查自己，**给不了它本来没有的知识和技能**，那得换更大的模型。模型不够用时的顺序：

1. 先确认模型能验证自己的工作（测试、构建、调用接口的脚本）；
2. 再把 effort 调高一级；
3. 再换上一级模型，并从比小模型更低的 effort 开始。

能自动判定结果时：同一 SWE-bench Pro 子集上，Opus 5.5 全部 low 跑、失败的再 high 重跑，通过约 97%、每题约 $0.17；全部 high 是 95.3%、每题 $0.29。

**上下文与成本**。 大上下文每轮都要重发，但长运行里大部分输入按缓存读取计费。Opus 在 150K 上下文时一轮缓存读取约 $0.03，20K 时约 $0.004。Fable 和 Opus 缓存读取同价，所以在缓存密集的长运行里，二者差距只在未缓存输入和输出上。由此得出：**主模型越大，保持主上下文精简越重要**——昂贵模型的上下文留给决策，冗长的阅读交给便宜的子代理。Haiku 是唯一按提示长度分档计价的模型，超过 100K 的价格是 5 倍，但仍只有 Sonnet 的四分之一；它在短提示上最划算（输入价只有 Sonnet 的二十分之一）。

## 混用模型

- **在自然断点切换**：提示缓存属于写入它的模型，切到新模型的第一轮要按缓存写入价付整个对话的钱。Claude Code 里先 `/compact` 或带一份简短计划开新会话；API 上用一段摘要开启新模型的对话，而不是带全部历史。
- **思考块不一定能跨模型读**：每个思考块记录了产生它的模型。Opus 5.5 能读 Sonnet 和 Haiku 的，Sonnet 能读 Haiku 的，Fable 5.2 能读其他三个的。**往下降一级一定会丢掉之前的推理**，因为模型从不读比它高一级的模型的思考块；读不了时 API 直接丢弃这些块，请求照样成功，新模型就在没有那段推理的情况下继续。
- **子代理放小模型**：Claude Code 里在子代理定义中写 `model: haiku` 或 `model: sonnet`，`CLAUDE_CODE_SUBAGENT_MODEL` 设置默认值。示例是一个只读日志、报告失败用例、不改任何文件的 `log-reader` 子代理。理由是：**小模型读错一条搜索结果，主模型就会打开错误的文件并为此花 token**，所以只把错误容易发现的活交给它。注意新版 Claude Code 内置的 Explore 子代理改为跟随会话模型（API 上最高 Opus），想便宜就自己定义一个叫 Explore 的 haiku 子代理。opusplan 的做法与上述建议相反，作者建议先在自己的任务上实测再设为默认。
- **advisor 工具（beta**）：便宜的执行模型在中途向更强的顾问模型求助，大部分 token 按执行模型计费。但作者很谨慎：平台成本指南里的四种搭配，没有一种明显胜过执行模型单独跑；比如 Opus 5.5 high 配 Fable 5.1 顾问，在内部编码基准上得 90.1%、每次 $2.92，只比 Opus 单独 high 高 1.7 分，花了约 2.1 倍的钱，差距在运行噪音边缘，和调高 effort 能买到的差不多。先测执行模型的求助率。
- **大块工作分给便宜的 worker**：任务大于一个上下文窗口时，顶级模型拆分、并行分给多个便宜 worker、再合并。在约 2200 万 token 源码的内部缺陷搜索基准上，Opus 5.5 带最多 25 个并行 Sonnet 5.5 worker，比 Opus 单独跑便宜约三分之一，分数相当。但一条有依赖的单链步骤、或装得进一个上下文的工作不要这样做，规划和合并的开销会超过节省。

## 迁移前检查兼容性

- **Fable 5.2 的 preserved thinking**：在 Fable 思考块之前的任何内容（系统提示、工具、更早的消息）被改动，API 返回 400，除非显式选择丢弃受影响的思考。用 Claude Code、Agent SDK 或 Managed Agents 不用改；自己拼历史的代码要保持只追加。
- Opus 和 Fable 关掉思考会报错；所有模型的响应都可能以思考块开头，要按类型读 content block。
- **强制工具调用**：`tool_choice` 为 `any` 或指定 tool 在 Sonnet、Opus、Fable 上返回 400，应改用 `auto`、给工具标 `strict: true`，并在提示里说明何时调用。
- 计算机使用只能通过 `computer_toolset_20260801`。
- Haiku 4.5 → 5.5：用 effort 替换 `budget_tokens`，去掉非默认的 temperature、top_p、top_k，消息必须以用户轮结尾，否则都是 400。
- 安全分类器在网络安全和生物内容上最常触发，Claude Code 里被标记的请求可能回退到旧模型重跑。
- 一个系统跑多个模型时，**按最严格的那个来构建每个请求**，这样某一步上下换模型时无需改代码；路由规则简单时让代码选模型，别让模型选。

## 在自己的任务上实测

1. 抽一批真实任务，为每个写结果检查（测试通过、工单关闭、行数正确）；
2. 每个候选模型跑两三个 effort 档，各用独立会话避免共享缓存，从响应的 usage 字段记录每个完成任务的成本；
3. 画“分数对花费”图，**多模型方案只有在胜过图上每一个单模型点时才保留**；
4. 胜出者先在一部分真实流量上影子运行，再切换。

Claude Code 里的快速版：用 `/model` 在两个模型上各跑一个积压任务，比较 `/usage`。

## 局限

- 这是 Anthropic 的官方选型文章，所有基准数据（Terminal-Bench 3.0、FrontierCode 2.0、SWE-bench Pro 及多个内部基准）都来自 Anthropic 自己的运行，没有独立复现；价格、默认值和兼容性细节会随版本变化，应以文档为准。
- 文中的配图和演示（同一照片四个模型渲染、同一作品集网站等）没有纳入，总结只依据文字和表格；Mythos 5.2 只被提及，不在比较范围内。
