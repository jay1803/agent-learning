---
title: "The McKinsey Pyramid Principle: 4 Prompts That Make Every Email Impossible to Ignore"
date: 2026-11-24T15:25:34Z
category: writing
description: "Nav Toor 把 Barbara Minto 的金字塔原理做成 4 个 Claude 提示词：答案先行、SCQA 开头、MECE 审查、模拟 CEO 测试；核心规则只有一条——先给结论，自下而上思考、自上而下表达。"
source: "https://x.com/heynavtoor/status/2080238307813040398"
author: "Nav Toor"
---

这篇 X Article（2026-07-23，Nav Toor）的核心论点：你写的东西没人读，问题不在读者，而在**你把它倒着写了**——像讲故事一样先铺垫、最后给结论，而手里还有 47 封未读邮件的读者在看到重点前就放弃了。解法是 1985 年就成书的 **Minto 金字塔原理**，整套系统一句话：**自下而上思考，自上而下表达（Think bottom up. Communicate top down.）**。作者把它落成 4 个可直接复制给 Claude 的提示词，串成一个 10 分钟流程。

## 来历

- 作者讲述：Barbara Minto 是哈佛商学院 600 人班里的 8 名女性之一，后成为 McKinsey 首位女性 MBA 雇员，在克利夫兰办公室负责改报告。她发现顾问们无论多聪明都按“背景 → 分析 → 最后一页给建议”来写，而每周要读 20 份报告的合伙人总抱怨找不到答案。她把报告改成金字塔：建议在顶、论据在中、数据在底。办公室负责人 John Tomb 让她培训全公司，1973 年成为 McKinsey 全球必修课，1985 年出书至今未绝版。
- 作者称 Amazon 的六页备忘录（Bezos 禁用 PowerPoint）、Google 分析师、BCG、Bain 都在用这套方法，但公司外几乎没人听说过——这就是差距所在：“差距不是才能，而是 40 年前写下来的一个方法。”

## 前后对比

- 倒着写：87 个词，重点在最后 6 个词（“我一直在想 Q3 的数字……我查了打开率、点击率，问了销售，算了三遍……发现工作日表现差、周末好，我觉得应该换时间”）。
- 金字塔写法：53 个词，重点在前 7 个词——“我们应该把邮件发送从工作日改到周末。三个理由：工作日打开率自 3 月起降了 34%；同期周末升了 22%；销售确认周末回复的转化快 2 倍。数据见附件。”之后每个词都在回答读者此刻已经关心的问题。
- 文中另一个例子（CRM 选型）同理：开头直接“推荐 Vendor B”，三条理由分别是唯一原生集成 Salesforce 和 Slack、三年总成本高 $4,200 但每周省约 12 小时、4 个同规模参考客户一年后全部续约，最后写明“周五前需要决定”。

## 金字塔的形状：三层、两条规则

- **顶层**：一个答案，一句话，“能纹在胳膊上”。
- **中层**：2–4 个支撑论点，每个都是顶层成立的理由，必须 **MECE**（相互独立、完全穷尽）：论点之间不重叠，合起来不留缺口。
- **底层**：数据、引语、截图等证据。
- Minto 的论点：人会给收到的任何信息强加层级，你不给，他们就会糟糕地自己编一个；你给了，他们在读完第一句前就开始信任你。所以金字塔不是模板而是承诺：**每个词要么是答案，要么是答案的理由，要么是理由的证据，其他都删掉**。

## 4 个提示词（原文照录）

**1. 答案先行**——用于每封超过 3 句话的邮件、每份文档、每条需要真正回应的 Slack 消息。前十次会有点痛，“那是讲故事的本能在死去”。

```
You are trained in the Barbara Minto Pyramid Principle.
I need to communicate this idea. Rewrite it in pyramid form.
Rules:
1. Line 1 is the single sentence answer or recommendation.
2. Then list 2 to 4 supporting points. They must be MECE.
3. Under each point, list the proof or data.
4. Cut every word that is not the answer, a reason, or proof.
5. If I have not given you the answer clearly, ask me one question that surfaces it.
Here is my idea: [PASTE YOUR MESSY DRAFT]
```

**2. SCQA 开头**——金字塔管中层和底层，开头是另一门手艺：情境（读者已认同的事）→ 冲突（什么变了或坏了）→ 问题（冲突引出的隐含问题）→ 答案（你的建议）。读者在第一句点头，第二句前倾，第三句在你问之前就在脑子里形成问题，第四句的答案就像礼物而不是推销。

```
You are trained in Barbara Minto's SCQA framework.
Write me the opening for this document using SCQA.
Rules:
1. Situation. One sentence the reader already agrees with.
2. Complication. One sentence about what changed or what broke.
3. Question. The implied question the complication creates.
4. Answer. My recommendation in one sentence.
Total length: 4 sentences maximum.
Here is my topic: [PASTE YOUR TOPIC]
Here is my recommendation: [PASTE YOUR RECOMMENDATION]
```

**3. MECE 审查**——两个论点换个说法讲同一件事，聪明的读者 4 秒就会发现并不再信任你；漏掉明显角度，读者会问出你最想回避的问题。

```
You are trained in Barbara Minto's MECE principle.
Audit these supporting points for MECE.
Rules:
1. Are any two points saying the same thing? Flag overlaps.
2. Is there an obvious angle missing? Flag gaps.
3. Suggest a rewritten set of 2 to 4 supporting points that are fully MECE.
4. Explain each suggested change in one sentence.
Here are my current supporting points: [PASTE YOUR 3 TO 5 POINTS]
Here is the top-level recommendation they support: [PASTE YOUR RECOMMENDATION]
```

**4. 高管测试**——不是为了润色，而是在真正的读者看到之前，先拿到最严苛读者的判断。

```
You are a busy CEO with 200 unread emails.
You have 3 minutes before your next meeting.
Read this communication and answer honestly:
1. After reading only the first 2 sentences, do you know
what I want you to do? Yes or no.
2. After reading the full document, name the weakest,
most redundant, or missing argument.
3. Would you act on this, ask for more information,
or ignore it? Be brutal.
4. If you would ignore it, rewrite the first 2 sentences
so a busy CEO would not.
Here is my communication: [PASTE YOUR FINAL DRAFT]
```

**10 分钟流程**：第 1–5 分钟用提示词 1 把乱想法变成金字塔；5–8 分钟用提示词 2 加叙事开头；8–10 分钟用提示词 3 压测逻辑；最后一分钟用提示词 4 让模拟 CEO 打分。

## 唯一的规则：先给答案

- 不是铺垫、背景、免责声明或客套，而是答案。读者心里总有一个问题，不管说没说出口，第一行就回答它，然后才解释为什么。军队里叫 **BLUF（Bottom Line Up Front）**。
- McKinsey 的其他习惯都由此而来：一页一个观点、一份备忘录一个建议、一封邮件一个请求。
- 作者列了今天就能改写的 7 样东西：草稿箱里最重要的那封邮件、LinkedIn 简介、下一次演示（只读标题就能知道整个论点）、周报（建议 → 进展 → 风险）、产品描述、下一条 Slack 消息、简历（先写你交付的价值并用数字证明）。
- **60 秒自测**：打开已发送，看最近 5 封超过 3 句的邮件的第一句。如果写的是你想要什么、决定了什么、下一步是什么，你已经走了一半；如果是“希望你这周顺利”“想跟进一下上次的事”，你一直在倒着写。

## 为什么有效（作者的解释）

- **认知负荷**：先给答案，读者建立框架去组织后面的内容；答案被埋，大脑要一直暂存无组织的信息，负担让人停止阅读。
- **首因效应**：人最记得读到的第一件事。
- **决策疲劳**：需要解码的邮件消耗决策能量，金字塔式消息不需要解码。

## 局限

- 这是一篇偏励志、带营销口吻的写作技巧文章（“这个声音值每小时 $500”“未来 18 个月会把人分成两组”），和 agent 关系不大，主要价值在 4 个可直接复用的提示词，所以分类我用了 `writing`。
- 历史细节与心理学解释来自作者列出的二手来源（Wikipedia、BetterUp、Slideworks、Management Consulted 等），没有原始研究支撑；“MECE 是 Minto 发明的”这类说法也只是作者的表述。文中的 McKinsey 年份叙述（1963 年入学/入职）前后略有混淆。
- 文中 6 张配图（金字塔示意等）接口没有返回；4 个提示词从文章的代码块中完整取出。
