---
title: "How to Become a Marketing Engineer"
date: 2026-11-24T01:10:04Z
category: agents
description: "Shann Holmberg 讲如何把营销工作搭成 agent 系统：从工作区、知识层、数据层到工作流、工单、循环与定时 bot，核心是先从自己熟悉的一件任务做起，持续改进上下文而不是堆 agent。"
source: "https://x.com/shannholmberg/status/2098004743536750869"
author: "Shann Holmberg"
---

营销工程师的本质不是“会用 AI 写文案”，而是搭建一套让 agent 能干营销活的系统：把公司的知识、数据和工具接起来，让研究、策划、生产、复盘形成闭环。作者的核心判断是：agent 产出平庸时，问题几乎总在输入——研究太宽、缺少客户上下文、指令漏了约束——改进这些输入就是系统建设本身，而不是多加几个 agent。

## 起点：从你最熟的一件事开始

不必覆盖所有营销垂类。懂内容就从内容开始，选一个真实工作负载里的任务，建立工作流，使用，再根据结果回头改上下文和指令。作者约 70% 的营销工作在 Agent Development Environment（ADE，他用的是 Orca）里完成，生产内容也直接在里面做，不只是做原型。他也用 Hermes 这类自主 agent 做原型，但承认开放式任务更耗 token，给它具体可执行的任务价值更高。

## 工作区：按垂类分目录，再用 Markdown 说明书串起来

- 按营销垂类（内容、SEO 等）分目录，共享知识放在旁边，各垂类共用同一份公司信息。
- 一个 campaign 的流向：共享知识里读 offer，内容知识里读语气指南，活跃 campaign 文件夹里读 brief；研究和草稿存进工作区，通过审核的成品进 outputs，发布后的数据和复盘进 results/learnings。
- 目录名本身不会告诉 agent 怎么干，需要一份简短的 Markdown 说明：东西在哪、用哪些来源、输出存哪。
- 不要一开始就建全套，用到哪个垂类建哪个。

## 工具与数据连接

- 先从工作流要做什么倒推需要哪些连接（如读取 X 帖子及表现数据、在 Typefully 建草稿），每个 API 连接都要配一个脚本或集成，再给 agent 写明何时用、能做什么。
- 能复用就别自己造，例如用 /last30days 跨 X、Reddit、YouTube 和网页做近 30 天话题研究。
- 密钥放 .env，排除出 Git，不要写进 prompt、brief 或知识文件。
- **权限要拆开**：读数据、创建草稿、发布是三件不同的事。内容工作流里“发布前人工审核”必须是流程的一部分，并尽量在工具侧限制发布权限。先用小任务（取几条帖子、建一个草稿）验证再往后接。

## 知识层：内部知识 + 外部知识

- 内部：客户通话、产品信息、历史 campaign 结果、你的反馈；外部：竞品广告和落地页、受众讨论、搜索数据。
- **你的专业判断必须进入上下文**：比如用语音笔记解释“上一个 campaign 为什么吸引了错误的买家”；评审广告时把理由存下来（“这个承诺超出了产品能交付的结果”），下一轮就有具体的检查项。
- 研究要带来源和日期，未验证的假设要标注，让 agent 能区分“已批准的定位决策”和“会上有人随口一提”。
- 只对某个 campaign 有用的研究留在该 campaign 下，可复用的再提到共享或垂类知识。

## 数据层：先有一个想回答的问题

- 以仓库（warehouse）汇总分散在各工具里的记录，用脚本抓取、agent 分析。
- **API 连接不会自动保持数据更新**，需要定时任务（cron）去刷新。
- 记录要能串起来：campaign/广告 ID、链接上的追踪参数、CRM 里的线索到成交。归因链常常不完整，工作流应该标出缺失的追踪或数据，而不是自信地把每笔销售都归因掉。
- 从一个具体问题出发，例如“上个月哪些创意角度带来了合格线索，接下来该测什么”，这需要花费、线索结果和每条广告测试的角度三类数据。人的复盘能补上数字解释不了的部分（销售跟进晚了、中途改了 offer、某条广告承诺过头），这些也要存下来。

## 第一个工作流：先规划，再带着你的输入运行

- 选一个你做得足够多、能识别好结果的任务，例如把客户研究和过往结果变成下一轮创意的 brief。发布广告、改预算以后再说。
- 作者先用转录工具口述 5–10 分钟（目标、背景、试过什么、不确定什么），再用 Matt Pocock 的规划 skill 让 agent 追问、补全计划。回答追问本身就在厘清边界：不定义什么是“合格线索”，就不知道该用哪些结果；offer 没定，就不该生成创意。
- 运行后审阅：竞品研究无关就先修选择标准；角度忽略了客户异议，就查是信息缺失还是指令没要求使用。
- 流程成型后存成可复用的工作流，并标明哪些输入会随 campaign 变化。

## 跨渠道 campaign：共享计划 + 各垂类分头建

- 作者的教训：早期内容系统过度设计，用了四个 agent 做本质上三步生产加一个反馈环；**改善喂给写作者的上下文，比增加 agent 更有用**。
- 做法：先整体规划一次，产出共享 campaign brief，各垂类再派生更具体的 brief。用 Paper 或 Figma 做视觉情绪板和 campaign book，记录已批准的方向与各渠道示例，给所有垂类和图像生成模型当共同参照。
- 研究只存一次、多处引用；能并行的（竞品研究、历史复盘、潜客研究）并行，最终文案要等 offer 确定，广告要有落地页，邮件要与用户实际订阅的内容一致。
- **用工单管理**：每张工单写明交付物、引用的上下文、交付前检查项、依赖、负责的 agent 和产出链接。协调 agent 读取工单、派给专项 agent；需要你决策时在工单里写下具体问题，其他独立工作继续。改了 offer 时，协调者要找出受影响的素材并退回修改。
- 单个素材通过检查，不代表整体一致，所以还要整体审查：广告承诺与落地页是否兑现，邮件 offer、日期、链接和声明是否一致。

## 循环、定时任务与 bot

- **循环**：让 agent 重复执行“构建→检查→带具体反馈返工”，直到满足验收条件。目标要定义“完成”长什么样；作者用 /goal，prompt 保持简短，细节放在支撑文件里。循环要设上限（时间或 token 预算、重试次数、何时求助）；同一项检查反复失败说明缺少产品参考、需要换工具或要你做决定。自动检查能验证尺寸、文字截断这类客观项，创意好不好仍然需要人判断。
- **定时任务**：工作流稳定后才值得挂 cron。调度不能补救没做完的工作流，要事先定义访问范围、产出、如何检查、失败怎么办；周报任务应该提示数据更新失败，而不是悄悄拿上周数字写一份自信的报告。“出报告”“建草稿”“改预算”需要的权限各不相同。
- **bot**：给团队用的专用 agent，有自己的指令、工具和上下文，例如 Slack 里的 Hermes。可以响应消息，也可以按计划运行；消息触发一个任务，定时触发另一个。放在主工作区、做成定时任务还是做成 bot，取决于工作如何发生、需要你介入多少。

## 作者的落地建议

给自己真实的任务（有截止时间、有要求、有人会用结果）建工作流，记录自己每次介入的地方，这些就是该改进的点；再换一个 campaign 或周期重跑，检验是否可复用，还是依赖上一轮对话里埋着的指令。稳定后再往后接：研究喂 brief、brief 喂生产、结果喂下一轮规划。保存 brief、工作流、示例输出和结果，记下仍需人介入、失败和改动的部分，既便于迭代，也能给同事展示。

## 原文代码块与图表

原文 23 段代码块与表格：角色来源、术语、工作区目录结构、知识与数据流、工具连接、campaign 目录、工单与依赖、循环检查流程、两段 /goal 提示词、一份工单模板、定时任务与工作流清单，以及出问题时该查什么。以下为接口返回的原文，未改动。

| draws from | how it helps you build |
|---|---|
| product marketing | give agents the customer, positioning and offer context they need |
| content & creative | define voice, provide examples and review the assets produced |
| growth & performance | build workflows around campaign tests and measurable outcomes |
| marketing ops & automation | connect tools and define how work moves between them |
| analytics | give agents reliable data and check their interpretation of results |
| engineering | connect APIs, write code with agents and test workflows |

| term | what it means |
|---|---|
| model | the AI you choose for a task, such as researching, planning or writing |
| harness | the software around the model that gives it access to files, tools and code execution, and controls what it can do |
| ADE | Agent Development Environment: the interface where you work directly with agents, review their actions and guide the work |

```markdown
marketing/
├── shared-knowledge/
├── content/
│   ├── knowledge/
│   ├── work/
│   ├── workflows/
│   ├── skills/
│   ├── agents/
│   ├── scripts-and-code/
│   ├── outputs/
│   └── results-and-learnings/
├── seo-aeo/
├── outbound/
├── paid-and-creative/
└── lifecycle-and-cro/
```

| area | what belongs here |
|---|---|
| shared knowledge | company information used across verticals: product, audience, positioning and brand guidelines |
| vertical knowledge | relevant research, examples and guidance, such as a voice guide or SEO research |
| work | active campaigns, briefs, plans and work in progress |
| workflows | the steps and connections that take a task from its inputs to a finished output |
| skills, agents & code | reusable instructions, agent definitions and scripts those workflows use |
| outputs | the assets and deliverables produced |
| results & learnings | performance reports, feedback and findings worth using again |

```markdown
SHARED KNOWLEDGE          CAMPAIGN CONTEXT
audience + offer         brief + research
        │                       │
        └───────────┬───────────┘
                    ↓
              WORKFLOW RUN
                    ↓
             drafts + review
                    ↓
            approved deliverables
                    ↓
             campaign results
                    ↓
          findings + your feedback
                    ↓
        context for the next campaign
```

| connection | what it makes possible |
|---|---|
| X API | research posts and retrieve available performance data |
| Typefully API | create drafts and schedule approved content |
| research tools and skills | investigate topics, competitors and conversations beyond your own accounts |
| your data warehouse | query the data you’ve collected across marketing sources |

| internal context | external context |
|---|---|
| product details, offers and positioning | competitor products, offers and campaigns |
| customer calls, CRM notes and support conversations | public discussions, reviews and customer questions |
| your expertise, examples and input during planning | industry research and market developments |
| previous campaigns, warehouse data and results | search demand and keyword research |

```markdown
shared-knowledge/
├── audience.md
├── product-and-offer.md
└── positioning.md

paid-and-creative/knowledge/
├── customer-objections.md
├── approved-claims.md
└── creative-test-learnings.md
```

```markdown
┌───────────────────────────────────────────────┐
│ RESEARCH                                      │
│ Save the finding, source and date.            │
│ Label unverified claims.                      │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│ YOUR REVIEW                                   │
│ Check the evidence and campaign relevance.    │
│ Record your decision and its reason.          │
└───────────────────────┬───────────────────────┘
                        │
            ┌───────────┴─────────────┐
            ▼                         ▼
┌───────────────────────┐ ┌───────────────────────┐
│ CAMPAIGN KNOWLEDGE     │ │ SHARED KNOWLEDGE       │
│ Findings for this     │ │ Reviewed findings     │
│ campaign.             │ │ useful across         │
│                       │ │ campaigns.            │
└───────────────────────┘ └───────────────────────┘
```

| source | what it can contribute |
|---|---|
| ad platform | campaigns, ads, spend, impressions and clicks |
| website analytics | visits, landing-page activity and tracked conversions |
| CRM | lead quality, sales outcomes and revenue |
| experiment records | the audience, offer and creative angle tested |

```
┌────────────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐
│ CHANNEL DATA           │    │ SCRIPT                 │    │ WAREHOUSE              │    │ AGENT ANALYSIS         │    │ YOUR REVIEW            │
│                        │    │                        │    │                        │    │                        │    │                        │
│ ads, analytics + CRM   ├───▶│ fetch + check records  ├───▶│ linked campaign data   ├───▶│ read data + context    ├───▶│ check the evidence     │
│ activity + results     │    │ update stored data     │    │ queryable history      │    │ propose next tests     │    │ choose the next tests  │
│                        │    │                        │    │                        │    │                        │    │                        │
└────────────┬───────────┘    └────────────────────────┘    └────────────────────────┘    └────────────────────────┘    └────────────┬───────────┘
             ▲                                                                                                                       │
             │                                                                                                                       │
             │                                                                                                                       ▼
┌────────────┴───────────┐                                  ┌────────────────────────┐                                  ┌────────────┴───────────┐
│ CAMPAIGN EXECUTION     │                                  │ NEXT CAMPAIGN BRIEF    │                                  │ SAVE                   │
│                        │                                  │                        │                                  │                        │
│ run approved tests     ◀──────────────────────────────────┤ use saved findings     ◀──────────────────────────────────┤ record decisions       │
│ generate new results   │                                  │ plan + approve tests   │                                  │ link the evidence      │
│                        │                                  │                        │                                  │                        │
└────────────────────────┘                                  └────────────────────────┘                                  └────────────────────────┘
```

```markdown
AD PLATFORM + WEBSITE ANALYTICS + CRM
                    ↓
        scheduled collection and updates
                    ↓
              DATA WAREHOUSE
                    ↓
       campaign analysis and creative briefs
```

```md
/goal prepare a creative brief for the next round of paid ads.

use audience.md, approved-claims.md, campaign-book/
and previous-test-results.md as context.

research and propose 3 angles. explain who each angle is for,
what informed it and how it differs from previous tests.
link the supporting sources and flag assumptions.

check each angle against the audience and approved claims.
save the brief to creative-brief.md in the campaign folder.

stop when the brief is ready for my review.
do not produce or publish ads. ask if required context is missing.
```

```markdown
campaign/
├── brief.md              ← audience, offer, goal
├── campaign-book/        ← approved visual direction
├── research/             ← shared across channels
├── tickets/              ← tasks and dependencies
├── landing-page/
├── paid/
├── email/
└── results/              ← informs the next campaign
```

```markdown
APPROVED CAMPAIGN BOOK
references + layouts + product images
                 │
         ┌───────┴────────┐
         ↓                ↓
    coded layouts    image generation
    page / ad / email  product / scene
         │                │
         └───────┬────────┘
                 ↓
        assembled campaign designs
                 ↓
         your visual review
                 ↓
          approved variations
```

| vertical | what its workflow produces | context it needs |
|---|---|---|
| landing page / CRO | page copy, page build and tracking setup | offer, audience, approved claims and conversion goal |
| paid & creative | ad concepts, assets and test plan | campaign messaging, budget, previous tests and landing page |
| content | launch posts and supporting assets | campaign angles, product details and channel examples |
| lifecycle / email | launch and follow-up sequences | offer, audience segments, timing and signup events |
| outbound | prospect research and outreach drafts | account criteria, buying signals and approved messaging |

| ticket | depends on | status |
|---|---|---|
| approve campaign offer | customer and competitor research | needs my input |
| build landing page | approved offer and campaign book | waiting |
| produce paid creative | approved offer and campaign book | waiting |
| check ad-to-page consistency | landing page and paid creative | waiting |

```md
# produce the paid creative set

assigned to: paid creative agent
status: waiting for approval of the offer and campaign book

## before starting
confirm the offer and campaign book are approved.
use creative-brief.md for the angles, formats and deliverables.
use approved-claims.md for what the ads can promise.

## produce
- editable designs following the campaign book
- exports in each format specified in the brief
- a review report linking each ad to its angle and checks

## ready for my review when
- [ ] every deliverable in the brief is accounted for
- [ ] claims match approved-claims.md
- [ ] formats and dimensions match the brief
- [ ] exported images have readable text and accurate product details
- [ ] designs, exports and review report are linked in this ticket

## update this ticket
if blocked, name the missing input or decision.
otherwise, mark ready for review. do not publish.
```

```markdown
READY TICKET
     ↓
create or revise ←──────────────┐
     ↓                         │
run checks                     │
     ├── fail → specific fixes ┘
     │          within retry budget
     ├── blocked / budget reached → ask for input
     │
     └── pass → ready for your review
                        │
             ┌──────────┴──────────┐
             ↓                     ↓
       request changes          approve
       → revise again           → next task
```

```md
/goal produce the paid creative set listed in campaign-plan.md.

use campaign-book.md and approved-claims.md.
run the checks in creative-checklist.md.
fix failed checks and save the exports with a review report.

stop when the checks pass and the set is ready for my review.
do not publish. ask if an unresolved decision blocks progress.
```

| recurring job | what it does | where the result goes |
|---|---|---|
| daily data update | collect new campaign records and refresh performance metrics | data warehouse |
| weekly competitor review | research changes to relevant offers, ads and landing pages | research files and a team summary |
| weekly campaign report | compare performance with campaign goals and flag questions | campaign ticket and Slack |
| pre-launch check | check scheduled assets for dates, links and offer consistency | review report |

| workflow | how it works |
|---|---|
| **competitor website monitoring** | collect competitor pages on a schedule → detect changes → have an agent explain what changed → send a briefing with source links |
| **competitor creative library** | collect new competitor ads → transcribe videos and analyze images → save searchable references → use them alongside customer research when developing campaign angles |
| **podcast-to-team content** | collect transcripts from selected industry podcasts → extract relevant insights → combine them with each team member’s expertise → draft posts for review → schedule approved content |
| **SEO production** | research keywords and competing pages → develop the angle with your input → create the outline, draft and visuals → run writing and visual checks → prepare for publishing |
| **paid ad creative and testing** | review previous campaign results, customer objections and competitor ads → propose test angles → produce assets using the campaign book → approve and launch → feed results into the next brief |
| **content repurposing** | take an approved article, webinar or interview → identify ideas worth adapting → create channel-specific posts, emails and clips → check accuracy and formatting → review and schedule |
| **email campaign production** | combine the offer, audience segments and customer questions → plan the sequence → draft copy and layouts → check links, timing and segment rules → approve sending → review results |
| **landing-page production and testing** | combine the campaign brief, incoming ad messages and customer objections → build the page → check design, forms and tracking → approve launch → use results to propose the next test |
| **creator campaign research** | research relevant creators → compare audience fit, previous results and rates → prepare a shortlist and briefs → approve partnerships → track delivery and performance |

| what happened | what to investigate |
|---|---|
| the research covered irrelevant companies | selection criteria and research instructions |
| recommendations missed an important customer objection | available customer context |
| the report used old numbers | data updates and freshness checks |
| the output looked correct but wasn’t useful | the brief and how you defined a good result |
