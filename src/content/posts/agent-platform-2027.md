---
title: "Agent Platform 2027"
date: 2026-11-24T01:57:54Z
category: agents
description: "John Suh 提出 2027 年 agent 平台的蓝图：agent 以 actor 运行、带权限的共享文件系统、会话与对话分离、收件箱、可即时构建的监听器、代码定义的工作流，以及把一切界面都做成用户可定制的 App，平台即“OS 里的 OS”。"
source: "https://x.com/john_ssuh/status/2124336124172935336"
author: "John Suh"
---

John Suh 的核心论点：未来唯一的应用层软件是一个“万物 agent 化的操作系统”，其他软件都会退化成它下面的数据库；这个平台像一座花园的地基，客户把自己的“种子”种上去，由 agent、人和业务传感器信号共同养大，这比“工厂的工厂”的说法更贴切。他认为这是 ChatGPT 和 Claude 应用层的终局愿景，但相信最后会由独立公司拥有这一层，而多数 ADE、“企业 agent 平台”和垂直 SaaS 公司眼界太窄、技术与产品视野不够。推文发于 2026-11-22，正文只有一段引子，真正的内容在 4 张文档截图里（题为 “Agent platform 2027”），以下依据推文文字和对截图的转写，图中提到的一些产品名（如 Duet、Grokbot、Dots、Capy Captain、Rex 等）原文没有解释。

## 运行时：Agent 即 actor

- 现状：多数可扩展的 agent 负载用 Temporal 之类的方式部署。作者认为会转向 **actor 模型**，让每个 agent harness 有完全独立的运行时。
- 原因：actor 提供运行时隔离，这是“自我改进的 harness”（agent 能即时给自己写扩展或 hook）所必需的；也让同一平台后端、甚至同一租户里可以安全地跑不同实现的 agent 循环。
- 平台要把 **agent 的定义与它的实例、会话分开**，同时支持“一个超级 agent”和“量身定制的 agent 定义”两种风格。
- 他的一个反驳点：Anthropic 口头主张“一个超级 agent”，但在 “Formalizing Fermat's Last Theorem” 的工作里，每个 agent 只有 shell 和文件编辑器。研究者未必想让指挥的 swarm 里每个 agent 都装着 Gmail、Google Drive 和联网搜索 MCP，所以连主张超级 agent 的公司，其“显示出的偏好”也更接近代码定义的 “Grokbot” 模式。
- 相关项目：Cloudflare DO、Pi-Durable x Extensions、Vercel Eve、Rivet、DeepSeek Agent。

## 环境：N 个 agent 对 M 台电脑

- 平台要支持两类计算机：跨多家供应商、可检查点克隆的沙箱，以及用户自己的本地电脑。
- N 个 agent 可以对应 M 台电脑，例如一个 agent 开 5 个沙箱试不同配置、每个编码 agent 一台完整环境的 VM、1000 个 agent 并行使用 100 台 VM。环境本身也应该能由 agent 配置。
- 相关：Claude Remote、Cursor Agent、Cua AI。

## 带 RBAC 的共享文件系统

- agent 集群在云端共享一个 POSIX 文件系统，**访问控制挂在文件系统上，而不是计算机上**。它一部分像 GitHub（agent 生成的代码、扩展、定义），一部分像 Google Drive（上传、下载、生成的文件和“应用”）。
- 既然是远程共享文件系统，可以在里面放 `.env`，每个目录用 `.git` 或 `jj` 做版本控制。RBAC 的配置各组织会不同：agent 像人一样有权限，或权限取决于是谁发起了这一轮，或两者混合。
- 相关：Archil、S3 Filesystems、JuiceFS。

## 会话与对话分离

- 现状：多数编码 agent 应用把 agent 会话（含中间工具调用）直接暴露给用户。作者认为这是错的。
- 用户交互的应该是从核心 agent 会话抽象出来的“**对话**”，与 Slack 频道、iMessage、WhatsApp 或邮件线程同层；给用户看的内容通过**工具调用**发出，而不是直接暴露底层 assistant 消息。直接访问 agent 会话应当像读代码库一样，是检查和调试用的，不是主界面。
- 判断：2025–2026 年围绕编码 agent 会话做的 ADE（例如 T3）会遇到 Cursor 在这两年遇到的同类两难，他怀疑多数活不过这次转型，原因是创新者的窘境。

## 收件箱、监听器与单租户数据

- **收件箱**：用户将越来越少地“读对话”，而是处理一个聚焦的、由审批和问题组成的收件箱；它也应该支持各租户自己的 App，用来审阅需要人介入的业务中间成果。
- **监听器与监控**：agent 应该能按租户自己定义要监听的外部事件流（WSS、Kafka、CDC 等），并把事件确定性地或 agent 化地转成可行动的信号；而且**能即时构建，不依赖平台内置支持**。例子是邮件需求不断变化：每封邮件触发一次 agent 运行 → 改成跨账号批量处理 → 再改成只处理某域名发件人且只持续一周。
- 他对现状的判断：行业平台基本只支持每小时一次的 cron 触发 agent，否则就得自己把 webhook 集成写成插件；而监听器与监控是它们的**严格超集**。
- 相关：Claude Code Monitor、Grokbot 的未来功能。

## 工作流：代码定义，不是拖拽

- agent 应该能按租户定义持久工作流，许多企业流程是长周期的，混合 agent 步骤和确定性步骤。
- n8n、早期 Zapier 这类定义粗糙的拖拽式自动化比写自定义代码更差。既然平台把数据流集中在 API 和 MCP 上，工作流也应在这里定义，而且是**代码定义**。相关：Zapier Zap、Rivet Workflows。

## App（即 Artifacts）：一切界面都是文件系统里可定制的 App

- 现状：人们把 Replit 与 Claude Artifacts、ChatGPT Apps、ChatGPT 内嵌小组件看作不同类别。作者认为它们收敛到同一个概念：App。**所有界面都应该是文件系统里、用户可定制的 App**，比如整个 `/conversations` 页面本身就该是一个 artifact，每个用户在自己的文件系统里拿到一份代码“克隆”，可扩展可修改，就像操作系统自带默认应用。
- 生成式 UI 的表示之争（带默认组件的 JSON、HTML 混合的 DSL、“一切都是 Rune App”）：他的结论是平台把这些都归在 App 之下，具体表示没那么重要。
- 为什么需要“OS 里的 OS”：价值在于**构建在底层 OS 之上的应用层的可定制性和可扩展性**。
- 例子：十家会计公司审查税表，名词都是“review XYZ”，但各家评估信息的流程各不相同，理想状态是各自 fork Excel 做专属界面。

## 对垂直 SaaS 的批评

- 垂直 SaaS 的假设是同一行业的公司共享足够多的流程，值得共用一套表示方式。作者认为这个想法**作为风险投资论点已经破产**（至少是原始形态）：最好的垂直 SaaS 最终都会演变成可配置平台，靠内部或外部的销售工程师、顾问和部署团队给每家公司配置。
- 由此的反问：为什么要一个更差的平台，而不是一个 agent 可以完全操作的通用平台？
- 他的判断：这个过程会由 agent 按指令完成，细到最小粒度的界面；用户不再依赖厂商实施团队定制软件，而是让自己的 agent 直接改应用。现有 OS 不适合做这种“反向工程式”的 artifact，所以需要独立的浏览器或桌面应用来承载。T3、可定制的 Claude Cowork、可安装的 Claude Artifacts 都指向这个方向。

## App 的容器形态

- 会继续存在的：类 tmux 的界面（好的编码 agent 应用已大量探索）、嵌在消息里的 App（已是默认模式，侧边栏 App 在 2025–2026 也成标配）、以 App 为中心、聊天放侧边栏（把 App 与聊天的主次倒过来，如 Claude in Excel）。
- 还会出现的：无限画布（tldraw，适合 ComfyUI 工作流或 Paper、Figma 这类设计，每个组件是一个图像展示 App）、固定画布加层叠窗口（默认 OS 体验）、固定宽高可调整的面板（类似 Metabase）。容器本身也可以是 App，所以模型是递归的。相关：Rex、OpenCode Rune。

## 局限

- 这是一条观点推文加文档截图，不是论证加证据：论点（独立公司会拥有这一层、多数 ADE 与垂直 SaaS 会输）没有数据支持，属于作者的判断。
- 截图里有些写法含糊或未解释的名词（如 “JEV”、Capy Captain、Duet、Dots），我按原文转写没有补全。推文互动数据（约 8000 赞、180 万浏览）仅说明传播度。
