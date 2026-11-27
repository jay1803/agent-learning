---
title: "Breakdown Of Ramp's $60B Outbound GTM Strategy"
date: 2026-11-24T04:53:40Z
category: agents
description: "Christian（coldemailchris）梳理 Ramp 外呼的七个阶段：从熟人引荐、冷邮件找 offer，到自研 AI SDR（OATs）带来约 30% 管线、2025 年底又将其关停，改为给销售每天一份带理由的名单（Ramp Revenue）并限制触达频率。"
source: "https://x.com/coldemailchris/status/2124591211985952946"
author: "Christian"
---

这篇文章最值得看的一点：Ramp 在 2021 年就自建了 AI SDR（OATs），多年贡献约 30% 的管线，却在 2025-12-02 主动关停；留下来的不是“全自动发邮件”，而是“AI 做研究和初稿，人决定买家读到什么”。作者 Christian（coldemailchris，发于 2026-11-22）称其团队为 100+ 家 B2B 公司发过 1700 万+ 封冷邮件，文章依据 Ramp 创始人与销售负责人的公开演讲和文章整理；文末是其外呼服务和社群 gtmu.io 的推广，所以“What to steal”部分里的数字是作者自家经验，不是 Ramp 的数据。

## 记分牌

- 2026 年 10 月估值 $60B（Dragoneer 领投的 $1.85B 一轮），年化收入 $2B+，客户 85,000+，销售约 500 人，收入预测误差在 5% 以内。
- 作者强调这不是某个妙招，而是七个阶段，**每个阶段修的是上一个阶段制造的问题**。

## 七个阶段

1. **先卖给认识的人**：上线前访谈约 100 位财务人员，把会用产品的创始人和运营者放进股东名单（Eight Sleep、Pop 因创始人是投资人成了早期客户）；下载 LinkedIn 联系人与目标客户匹配，找“谁认识谁”。可借鉴：导出团队和投资人的联系人去匹配 ICP，请对方给一位具名对象引荐并附 2 行可直接转发的介绍。
2. **找到学得最快的渠道**：冷邮件是第一个能反复奏效的渠道，因为它给出的话术反馈比 SEO 和付费广告都快，且回复变会议后很多客户 30 天内成交。Ramp 卖的是“省钱”（中位数客户省 5%，还有节省计算器）。作者的 offer 排序：赚钱 > 省钱 > 省时间 > 降风险。方法：除 offer 行外邮件完全一致，每版发 1,000 封再判断，两周后淘汰最差的 60–70%。**别看回复率，看“每个有兴趣回复所需联系人数**”：500 以下不错，2,000 以上说明问题在 offer，改文案没用。
3. **招天生能干活的人**：2020 年的第一位销售 Max Freeman；用约 2 倍 SDR 薪水招投行出身的人，期望每月 40–60 个会议（常规的 4–6 倍）；早期无配额，从不单独招一个人，面试只问“我会不会向这个人买东西”。对小团队：最关键的席位是处理回复的人（积极回复后打电话，80–90% 能约成）。
4. **在市场上有人卖之前自建 AI SDR（OATs**）：2021 年由五名 SDR 要触达数百万人逼出来。用 Snowflake 汇总整个市场的数据（产品数据、Salesforce、HubSpot、Zendesk、Outreach、广告平台），早期 ChatGPT 写邮件、分拣回复；Tier 1 给真人，Tier 2/3 走 OATs 无人参与；由增长工程团队负责，**工程师和销售共担配额**。2022 年 dbt Labs 案例称其占管线 25%，Gene Lee 后来说“多年约 30%”。聪明之处在于先有一张打过分、分过层的市场总表，自动化只写给值得写的账户。作者做法：原始数据库名单 ICP 匹配约 50–60%，让 AI 读每家官网、写一句业务并与 ICP 对照，低于 80% 匹配就砍掉，名单可到 90%+ 准确。
5. **关停（2025-12-02**）：Gene Lee 的理由是“数十种自动化外呼方案都基于竞争对手也有的相似数据”、买家的“冷外呼疲劳”、销售复杂度上升（500 人销售、多个旗舰产品）。2026 年 6 月 Clay 直播里 Keyan Sarrafzadeh 补充：买复杂金融产品的人要人的联系，自动漏斗回报趋平，于是并回主销售漏斗、工程师分散到 GTM 团队。**被砍掉的是“没人审核就给买家发邮件的 AI”，AI 仍遍布销售流程**。 作者称约 80% 的销售团队在 3 个月内取消 AI SDR；他的规则：简单销售、回复相似 → agent 直接发；大单、资深买家、需判断 → agent 起草、人按发送。
6. **给每个销售一份带理由的名单（Ramp Revenue**）：每天早上看到排序好的当日账户、每个账户上榜的原因、账户摘要和数据来源、待审核的首封邮件草稿。信号包括定价页访问、新员工、网络研讨会报名、线下活动、其他站点的意向、竞争对手动态。Keyan 估计 99% 的 SDR 每周都登录。之后又做了 **Growth MCP**，让每个销售自己的 AI 工具在权限和用量限制下代为操作；300–400 名销售在 Claude Code 和 Codex 里自建工具，每个动作连同 AI 给出的理由都被记录，增长团队再对理由分组，找出效果最好的工作流。
7. **限制触达市场的比例**：Ramp 限制每月触达的市场占比，按“积极回复率 → 回复变成 demo”的顺序追踪质量，销售有目标和排行榜。结果是对同一人群的外呼比两年前更有效，因为品牌增长的同时保护了市场。作者的做法：每 30–60 天触达一次，永不更频繁；先看细分市场规模（1,000 家公司的“完美细分”几周就用光）；整体市场低于 10,000 家就别搞量，逐个账户做；每轮前重新补全数据，因为 6 个月前的名单有 30–50% 的联系人已换工作或信息变了。

## 作者的结论与提醒

- 给 $3M+ ARR 公司的六条：先把市场放进一张表再自动化；用冷邮件找 offer、用“每线索联系人数”评估；软件做研究和初稿，复杂销售里买家读到的内容由人把关；先做信号，每个账户都要有“今天为什么联系”的理由；每 30–60 天一次、换角度、重新补全数据；给某个人一个自己负责的管线数字（Ramp 是工程师，小公司可以是一位 GTM 工程师）。
- 常见错误：买 AI SDR 取代团队；offer 没转化就招 150 个 SDR；只有信号没有底层名单。作者说 Ramp 用了 5 年和一个完整产品团队，你可以用“一张表、几个信号、一个人处理回复”走同样的顺序。

## 原文代码块与图表

文中两段可直接复用的提示词：账户分层打分，以及按信号排序并起草首封邮件（只存草稿、不发送）。以下为接口返回的原文，未改动。

```
Here's my company list: [file].
Columns: company, domain, employees, industry, description.

My ICP: [who you sell to, deal size, must-haves, deal-breakers].

1. For every company, write one line on what they sell.
2. Score each one 0-100 against my ICP, with one line on why.
3. Cut anything under 80.
4. Split the rest into 3 tiers:
   Tier 1: the biggest likely deal size or a live buying signal
   Tier 2: a strong fit with no signal yet
   Tier 3: a fit, but small
5. Give me the count in each tier.

Don't invent any data. If you can't tell, mark it UNKNOWN.
```

```
Here's my qualified account list: [file].
Here's this week's signal data: [file].
Signals: pricing page visits, new hires in [role], funding,
job posts mentioning [problem], competitor contract renewals.

1. Match every signal to an account on my list.
2. Rank the accounts by how many signals they have, then by tier.
3. For the top 25, write:
   - one line on why they're on the list today
   - the best contact to email (name, title)
   - a first email under 65 words that mentions the signal
     without sounding like we're watching them
4. Save it as a table I can review.

Send nothing. Keep everything as drafts.
```

## 局限

- 这是一家外呼代理机构的推广文章（文末有 DM “RAMP”、预约通话和社群链接），Ramp 的部分来自公开演讲的转述，“80% 团队三个月内取消 AI SDR”“1,100 个积极回复/21 天”“106 个线索/23,418 人”等是作者自家客户数据，无法独立验证。
- 文中图片接口没有返回；两段 prompt 已从原文代码块原样补入上方。
