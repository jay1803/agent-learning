---
title: "Loops explained: Claude, GPT, Mira and what actually works"
date: 2026-11-24T15:44:37Z
category: agents
description: "Anatoli Kopadze 解释 agent 循环：prompt 是一条指令，loop 是交给 AI 一个任务、一个判断完成的标准和一条放弃规则；验证、状态、停止条件三者缺一不可，只有任务每周重复、能自动否决坏产出、agent 能端到端完成、“完成”客观可判时才值得做，并提醒成本按上下文复利增长、应看“每个被采纳改动的成本”；后半篇是 Telegram 助手 Mira 的推广。"
source: "https://x.com/AnatoliKopadze/status/2068328135611822149"
author: "Anatoli Kopadze"
---

这篇 X Article（2026-06-20，Anatoli Kopadze）的核心论点：大多数人仍以最慢的方式用 AI——发一个请求、等、改、再问，每一步都经过你，你就是引擎，AI 只是手里的工具。更快的方式是**循环（loop）**：只给一次目标，让 AI 自己规划、执行、检查、修补、重复，直到目标达成。用作者的话说，**prompt 交给 AI 一条指令；loop 交给 AI 一份工作、一个判断工作完成的方法，以及一条何时放弃的规则**。文章前半段是不错的入门框架，后半段转为推广 Telegram 助手 Mira。

## 循环的结构

循环的五步：DISCOVER（弄清要做什么）→ PLAN（决定怎么做）→ EXECUTE（干活）→ VERIFY（对照目标检查）→ ITERATE（没达标就把结果喂回去再来）。真正决定成败的是三个部件：

- **验证是循环的心脏**：没有对结果的真实检查，就不是循环，而是 agent 反复同意自己。检查可以是硬测试（代码是否通过）、可度量条件（数值是否高于 X）或模型对照打分的 rubric。没有关卡，agent 就在给自己的作业打分，而**干活的模型给自己打分太宽松**。
- **状态让循环会学习**：每一轮要记得已经试过什么，否则会永远重复同一个错误。真正的循环在旁边留一份小记录：做完了什么、什么失败了、下一步是什么，明天的运行接着做而不是从零开始。这也正是成本开始变高的地方。
- **停止条件让它保持理智**：没有出口的循环会一直跑到成功、崩溃或把账户耗光。每个正经循环都有两种停法：成功，以及硬上限（“试 8 次就停下并汇报”）。

## 你真的需要循环吗？四条都满足才值得做

1. 任务**至少每周重复**，否则搭建成本收不回来，一次性任务用一个好 prompt 更合适。
2. 有东西能**自动否决坏产出**（测试、类型检查、构建、linter、硬规则），否则循环只是空转。
3. agent 能**端到端自己完成**，而不是把一半推回给你。
4. “完成”是**客观的**，而不是品味判断；质量取决于品味时，人仍然更好。

缺一条就保留为手动 prompt。作者的坦白说法：循环工程是真的，但多数人暂时不需要重型版本。

## 面向代码的版本

循环最先在软件里流行，因为代码最容易验证：测试过就是过，不过就是不过，AI 总知道自己是否完成。作者给的代码循环规格是：目标是 `/tests/auth` 全部通过、lint 干净、没有类型错误；每轮跑测试并读所有失败 → 挑影响最大的一个 → 写最小改动修它 → 重跑测试、lint 和类型检查；通过或满 8 轮即停，停下时总结改了什么、还有什么没过。

真正的循环由五个积木组成（作者称 Claude Code 和 Codex 都已具备）：

1. **自动化（心跳）**：让它成为循环而非一次性运行的触发器。Claude Code 里 `/loop` 按间隔重跑 prompt，`/goal` 让会话持续直到你写的条件成立，hooks 在 agent 生命周期的节点触发命令，推到 cron 或 GitHub Actions 则合上电脑也能继续跑。
2. **skill（可复用指令）**：把规则、要遵循的模式、绝不能碰的清单存成文件，每次运行都读，避免定时任务里的指令腐烂。
3. **sub-agent（让做的人和查的人分开）**：作者认为这是循环里最有用的结构技巧——写代码的模型给自己打分太客气，第二个 agent 用不同指令、有时用更强的模型和更高 effort 来抓第一个说服了自己的地方。写手可以快而便宜，审阅者慢而严格，**这种分离就是质量的大部分来源**。
4. **连接器（让它行动而非建议）**：区别在于 agent 说“这是修复方案”，还是循环自己开 PR、关联工单、构建变绿后在频道里通知。
5. **验证器（关卡）**：能自动否决坏工作的测试、类型检查或构建。它决定循环是在帮你还是在花你的钱，其余都是管道。

作者举例称有工程师用这样的循环约六天把整个代码库从一种语言重写成另一种，人工要将近一年。

## 没人提的成本

- 循环靠 token 运转，问题不在每步都要钱，而在**成本复利**：每一轮 agent 都要重读上下文（目标、代码、上次结果、失败记录），这堆东西每轮都重新送进模型且越积越大——跑十轮不是十个 prompt 的钱，而是十个越来越大的 prompt。做/查分离提升质量，也让账单翻倍。作者的粗估：单 agent 一个中等任务约 5 万–20 万 token，并行车队再乘上去。
- **真正该看的指标是“每个被采纳改动的成本”**，而不是花了多少 token、跑了多少轮。给你十个结果你扔掉六个，就是你在做循环本该替你省下的审阅工作；**采纳率低于 50%，它花的比带来的多**。
- 循环会**安静地失败**：Geoffrey Huntley 所说的 “Ralph Wiggum loop”——agent 过早认定自己做完了，带着半成品退出，循环继续跑、继续花钱，什么也没产出。没有能让工作失败的硬关卡，循环不会崩溃，只会**默默给你记账**。
- 因此重型版本属于有预算和护栏的团队：迭代上限、token 预算、无聊步骤用便宜模型、监控。

## 真正可行的顺序

1. 先让**一次手动运行**可靠；
2. 把它变成 skill（保存指令）；
3. 用循环包住 skill（加关卡和停止条件）；
4. **然后**才放上定时。

跳步——把手动都没跑稳的东西排上定时——正是循环在你睡觉时炸掉的方式。先证明一次，加固，再自动化。

## 在任意 LLM 里手动跑一个基础循环

不需要编码 agent，也能在 Claude 或 ChatGPT 里用一段 prompt 体会循环：同时给出目标、严格的成功标准，以及一个强制自查后才能停的协议。原文提示词：

```
▸ SELF-CHECKING LOOP  (paste into Claude or ChatGPT)
You will work in a loop until the task meets the bar.

TASK:
[describe exactly what you want produced]

SUCCESS CRITERIA (be strict, no soft passes):
- [criterion 1]
- [criterion 2]
- [criterion 3]

LOOP PROTOCOL, repeat every turn:
1. PLAN   - state the single next step.
2. DO     - produce or improve the work.
3. VERIFY - score the result 1-10 on each criterion.
            Be brutally honest. List exactly what is still weak.
4. DECIDE - if every criterion is 8+, print "FINAL" and stop.
            Otherwise print "ITERATING" and go again, fixing
            the weakest point first.

RULES:
- Never call it done until every criterion is 8 or higher.
- Each pass must fix the weakest score from the last VERIFY.
- Do not ask me questions. Make a sensible assumption, note it,
  and keep going.

Begin. Run the loop until FINAL.
```

作者也指出它缺了什么：你仍然是触发器，关掉标签页它就没了，没有定时，也不能在收到邮件时自己醒来。

## 后半篇：Mira 推广

作者随后介绍 Telegram 里的助手 Mira：用自然语言描述就能创建定时或事件触发的“Skill”（例如工作日早 7 点汇总 Gmail 和日历、会前一小时提醒上次对话的要点、转发消息自动建 Linear 工单、周五发团队周报、语音转写、一个想法改写成多平台版本、生成图片视频、打卡、记账式卡路里追踪、机票降价自动购买等）。他称 Mira 通过 Composio 连接 500+ 应用、有跨会话长期记忆、按任务切换 GPT/Claude/Gemini，“ChatGPT 回答，Mira 行动”。结尾的建议：循环不是要强行塞进所有场景的东西，多数时候只会白烧钱，**先用现成免费的，真觉得不够了再想自己到底需要什么**。

## 局限

- 前半篇的框架（验证/状态/停止条件、四条门槛、成本按上下文复利、看采纳率、先手动后自动的顺序）清晰实用；但后半篇几乎全是 Mira 的产品推广，并带有作者 X 与 Telegram 的导流。Mira 的各项能力、“六天重写代码库”等说法未给出处或数据，无法核实。
- 有意思的是，Mira 的 Skill 恰恰缺少作者前面强调的“能自动否决坏产出的关卡”，按他自己的四条门槛，多数生活类 Skill 其实是定时任务而非严格意义的循环——文章没有点出这一点。
- 文中引用的“两位最受尊敬的工程师”的原话在配图里，接口没有返回；`/loop`、`/goal` 等是作者对 Claude Code 功能的描述，以官方文档为准。
