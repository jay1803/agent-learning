---
title: "Graph Engineering with Claude: 14-Step roadmap from 0 to graph architect"
date: 2026-11-24T15:28:35Z
category: agents
description: "Codez（0xCodez）用 14 步讲如何把线性 agent 改成图：节点是有契约的任务、边是真正流动的数据；用 parallel() 扇出、在屏障处扇入、菱形拓扑、运行时路由、边上的验证者、能收敛的循环、按节点分层模型，默认用 pipeline() 而非屏障，最后让 Claude 自己写编排脚本。"
source: "https://x.com/0xCodez/status/2079165300625330317"
author: "Codez"
---

这篇 X Article（2026-07-20，作者 Codez，@0xCodez，原标题后缀 “(Full Course)”）的核心论点：多数人做的多步 agent 其实是**一条直线**——一步等一步，一个上下文装所有东西，直到窗口满了忘掉自己在干什么。而工作本身的形状是一张**图**：节点负责思考，边负责传递结果。Claude Code 的 dynamic workflows 让 Claude 写一段普通 JavaScript 编排脚本，再派出一组 subagent 去执行；**协调本身不花模型 token，因为它是代码，不是对话**。作者对层次的划分：prompt 是一句话，loop 是一个循环，harness 是 agent 站的地板，而“什么先跑、什么能同时跑、什么要等全部完成”这个形状，才是图。

## 基础：节点、边、契约（第 1–4 步）

1. **节点是任务，边是流动的东西**：节点是一个有边界的工作单元（一个 agent、一个输入、一个输出）；边是依赖，只表示“这个节点的输出喂给那个节点的输入”。最常见的错误是把“然后”当成边——“总结这个文件然后告诉我天气”之间没有边，天气不消费摘要。判断方法：对每个“然后”问一句，下一步读不读上一步的输出？不读，就没有边，等待就是浪费。画成方框和箭头：方框是一次 `agent()` 调用，箭头是从一次调用返回值传进另一次 prompt 的变量；画不出箭头，两个方框就是独立的。
2. **线性脚本是退化的图**：一条不分叉的链，每个节点只有一进一出。能跑，但慢且脆弱——C 卡住，D 永远不发生，A 的成果困在上游。对每个箭头问第 1 步的问题，多数链里有两三个箭头并不传数据，只是你打字的顺序；剪掉它们，链就塌成“几个可并行的独立节点 + 一个需要它们全部结果的节点”。
3. **给每个节点一份契约**：有边界的输入（显式传入，不从共享窗口里假设）、有定义的输出形状、只做一件事。在 workflow 里用 JSON schema 强制：subagent 必须返回校验过的结构化数据，校验发生在工具调用层，不匹配时 Claude 会重试，而不是丢给你一段要解析碰运气的自由文本。**这就是“能接进图里的节点”和“只有人读得懂输出的节点”的区别**。
4. **把边当数据契约**：用数据而不是顺序给边命名，能一眼看出边是否真实，也能在形状不变时替换任一端节点。扇出与合成之间的 reduce（flatten、去重、过滤）就是普通 JS。**很多人花模型 token 做的事其实是一条边，而边是免费的**：“合并结果”如果只是 flatten 加去重，就是 `flatMap` 加 `Set`。把 agent 留给判断，不要留给管道；每条边都是 agent 的图，是在给自己的布线交房租。

## 扇出、扇入与菱形（第 5–7 步）

5. **用 `parallel()` 扇出**：N 个独立节点（N 个来源、N 个文件、N 条路由）不要串起来。`parallel()` 接收一组 thunk，每个 thunk 一个 subagent 并发执行。两个让它稳健的细节：它是屏障，等全部完成才返回；单个 thunk 抛错会变成 `null` 而不是让整批失败，所以总要 `.filter(Boolean)`。并发量约等于 CPU 核数，多余的排队，传一百个也能跑完。扇出写在 Claude 生成的代码里，Claude 自己的上下文从不同时装下九个来源——每个 subagent 带自己的上下文，只把答案带回来，所以能扩到几十上百个 subagent 而不淹没会话。
6. **在屏障处扇入**：扇入节点一次看到所有上游结果，做需要全集的事——跨来源去重、按影响排序、总数为空时提前退出。**只有某个阶段真的需要全部前序结果时才用屏障**。冒烟测试：如果写了 `parallel → 转换 → parallel`，而中间的转换没有跨条目依赖，就该用 pipeline，跳过屏障。
7. **菱形：拆分 → 工作 → 合并**：一个节点拆任务，多个节点并行干活，一个节点合并。市场扫描、依赖审计、代码评审、研究报告都是这个骨架，换来源和 prompt 即可。标准形式值得记住：**扇出 → 归约 → 合成**（扇出取广度，用普通代码归约压缩，最后一个 agent 写答案）。看见菱形之后，你不再问“怎么让 agent 多做几步”，而是问“拆在哪、合在哪”。

## 控制与可信度（第 8–11 步）

8. **运行时用条件路由选边**：路由节点检查结果并决定走哪条下游路径（先给工单分类再分发；看 diff 大小，小的快速过一遍，大的启动完整并行审计）。分类可以由 subagent 判断，但**路由是 Claude 写的代码**，同样的分类每次走同样的路——节点上用 Claude 的判断，边上用脚本的可靠性；不会出现“Claude 决定跳过审计”的意外，因为跳过必须写进图里。
9. **在边上放验证者**：图真正的杠杆不是更多 agent，而是能包在它们外面、产生信心的结构。验证节点唯一的任务是**试图推翻发现**，存活才放行。三种模式：对抗式验证（每个发现派 N 个独立怀疑者去反驳，多数存活才保留）；视角多样的验证（正确性、安全性、能否复现各一个视角，因为多样性能抓到 N 个相同检查抓不到的失败）；评审团（N 个不同角度的尝试，并行打分，以胜者为基础合成并嫁接亚军的长处）。作者称有团队正是用对抗式评审移植了 Bun 运行时。
10. **隔离节点，防止一处失败毒化全图**：链里失败会级联，图里失败应限于本节点——`parallel()` 里抛错变 `null`，`.filter(Boolean)` 就是隔离；每个扇入都要能容忍缺失输入。更隐蔽的问题是并行写文件互相冲突，解法是 worktree 隔离（每个 agent 在自己的 git worktree 里干活再干净合并）。**只在节点真的并行写入时才用**，它是那一种拓扑的安全带，不是每次运行的默认税。
11. **加循环，但要收敛**：规模未知的任务（找到一个 bug 又牵出三个）需要回到前面节点的边，但不收敛的循环会一直派 agent 直到预算耗尽。收敛模式是 **loop-until-dry**：连续 K 轮没有新发现就停。成败的关键细节，也是几乎所有人第一次都会犯的错：**要对“所有见过的”去重，而不是只对“已确认的”去重**，否则被否决的发现每轮都会重新出现，循环永远干不了，变成花钱反复重新发现同一批死胡同的机器。原文示例：每轮并行跑多个 finder，过滤掉 `seen` 里已有的，新发现各由正确性、安全性、复现三个视角判定，至少两票为真才计入确认，连续两轮无新发现则停止。

## 成本、延迟与自动规划（第 12–14 步）

12. **按节点分层用模型**：有些节点有边界、重复（抽字段、给工单分类），有些承载真正的判断（合成报告、裁定发现）。workflow 里每个 subagent 默认继承会话模型，大规模运行会全部按会话档位计费；`agent()` 的 `model` 选项可以把单个节点路由到别处。大跑之前先看 `/model`，把扇出里重复的节点降到便宜模型，合并节点保留高档。**不改图的形状，就能把吃 token 的图变得经济**。
13. **拓扑就是成本和延迟**：最容易绊倒人的是 `parallel()` 与 `pipeline()` 的选择。`parallel()` 屏障让所有东西等最慢的节点；`pipeline()` 让每个条目独立流过所有阶段，没有屏障——A 已在第 3 阶段时 B 还在第 1 阶段，快的先完成，不必陪慢的空等。**默认用 `pipeline()`**，只在阶段确实需要全部前序结果时才用屏障（跨集合去重、按总数提前退出、prompt 要和“其他发现”比较）。“代码更干净”“阶段感觉是分开的”都不是理由——分开不等于要同步。
14. **让 Claude 自己画图（自路由）**：对无法预先规划的任务，描述目标，Claude 自己写编排脚本——拆解任务、选择扇出、派出 subagent、合成结果，图是为这次运行量身定做的。三种入口：在 prompt 里说 “workflow”；运行保存或内置的 workflow，例如 `/deep-research` 就是生产中的图（界定范围 → 并行搜索 → 抓取 → 对抗式验证 → 合成，正是本课程的骨架）；或者打开 ultracode，让 Claude 为会话里每个实质性任务规划 workflow。运行效果好时按 `s` 把脚本存进 `.claude/workflows/`，纳入版本控制，按名字可重跑。

## 本周可以做的六张图

- **全路由安全扫描**：每个路由文件一个 subagent 查缺失的鉴权，验证者逐条确认后才进报告。
- **用 `/deep-research` 出带引用的报告**：拆成不同角度并行搜索、去重来源，每条结论经三票怀疑者验证后再写。
- **逐文件移植模块**：跨文件扇出翻译，每个文件以测试套件为闸门，失败的回到循环里。
- **对 diff 做对抗式评审**：按 diff 大小路由，小改动一次快速过，大改动按正确性、安全性、性能多视角并行审计，再由评审团合成。
- **定时生态扫描**：保存一次、永久重跑，并行查多个来源，在屏障处按影响排序后写摘要。
- **规模未知的发现**：并行 finder，对“所有见过的”去重，验证存活者，连续两轮无新发现再停。

## 原文代码块与图表

原文 8 段代码示例：节点契约（schema）、parallel() 扇出、边上的纯代码归约与屏障节点、运行时路由、loop-until-dry 循环、自路由 workflow 会话等。以下为接口返回的原文，未改动。

```python
Draw it as boxes and arrows. A box is an agent() call. 
An arrow is a variable passed from one call’s return into another’s 
prompt. If you can’t draw the arrow - if no variable crosses - the two 
boxes are independent, and independence is the thing you’ll exploit 
for the rest of this course.

```

```python
// A node with a real contract: bounded in, validated out, one job.
const ITEM = {
  type: 'object', additionalProperties: false,
  properties: {
    title:   { type: 'string' },
    url:     { type: 'string' },
    impact:  { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['title', 'url', 'impact'],
};

const result = await agent(source.prompt, {
  label:  `research:${source.key}`,
  schema: ITEM,           // forces validated structured output
  agentType: 'general-purpose',
});
// result is now a shape the next node can trust — not free text.
```

```python
The temptation is to spawn an agent to “combine the results.” Resist 
it. If combining means flatten-and-dedupe, that’s results.flatMap(...) 
and a Set — deterministic, instant, zero tokens. Save agents for 
judgment, not for plumbing. A graph where every edge is an agent is a 
graph paying rent on its own wiring.

```

```python
phase('Research');

// Nine sources, nine agents, all at once.
const raw = await parallel(
  SOURCES.map((s) => () =>
    agent(s.prompt, {
      label: `research:${s.key}`,
      phase: 'Research',
      schema: ITEM_SCHEMA,     // each node returns validated JSON
      agentType: 'general-purpose',
    }),
  ),
);

const collected = raw.filter(Boolean);  // drop the nulls from failed agents
```

```python
// The edge: plain JS, no agent, zero tokens.
const flat = collected.flatMap((c) => c.items);
log(`Collected ${flat.length} items`);

phase('Curate');
// The barrier node: needs the WHOLE set to dedupe + rank.
const curated = await agent(
  `Dedupe and rank these by impact:\n${JSON.stringify(flat)}`,
  { phase: 'Curate', schema: CURATED_SCHEMA },
);
```

```python
// Router node: an agent classifies, code picks the edge.
const { severity } = await agent(
  `Classify this diff's risk:\n${diff}`,
  { schema: { type: 'object',
      properties: { severity: { enum: ['low', 'high'] } },
      required: ['severity'] } },
);

let review;
if (severity === 'high') {
  // heavy path: full parallel audit
  review = await parallel(FILES.map((f) => () => agent(`Audit ${f}`)));
} else {
  // light path: one quick pass
  review = await agent(`Quick review of ${diff}`);
}
```

```
const seen = new Set(); const confirmed = []; let dry = 0;

while (dry < 2) {                       // stop after 2 empty rounds
  const found = (await parallel(
    FINDERS.map((f) => () => agent(f.prompt, { schema: BUGS }))
  )).filter(Boolean).flatMap((r) => r.bugs);

  const fresh = found.filter((b) => !seen.has(key(b)));
  if (!fresh.length) { dry++; continue; } // nothing new → toward dry
  dry = 0;
  fresh.forEach((b) => seen.add(key(b))); // dedupe vs SEEN, not confirmed

  // diverse-lens verify each fresh finding before it counts
  const judged = await parallel(fresh.map((b) => () =>
    parallel(['correctness', 'security', 'repro'].map((lens) => () =>
      agent(`Judge "${b.desc}" via ${lens} — real?`, { schema: VERDICT })))
    .then((v) => ({ b, real: v.filter(Boolean).filter((x) => x.real).length >= 2 }))));

  confirmed.push(...judged.filter((v) => v.real).map((v) => v.b));
}
```

```python
› Run a workflow to audit every route under src/routes/ for missing 
auth. Spawn one agent per route file, then verify each finding before 
reporting. ● Claude wrote an orchestration script · launching in 
background… /workflows — auth-audit · running ✓ Scope 1/1 2.1k tok · 
4s ✓ Fan-out 18/18 one agent per route file ◯ Verify 11/18 3-vote 
skeptics per finding… ○ Synthesize 0/1 waiting on verify session stays 
responsive — keep working while the fleet runs
```

## 局限

- 这是课程体例的推广文章（有 Substack 链接），**作者没有给出任何实测的耗时、成本或质量数据**，“协调零 token”“扩到上百 subagent”等是对工具特性的描述；“有团队用对抗式评审移植 Bun”也没有给出出处。
- 文中涉及的 `agent()`、`parallel()`、`pipeline()`、`phase()`、worktree 隔离、`/deep-research`、ultracode、按 `s` 保存等，是作者对 Claude Code dynamic workflows 的描述，具体 API 与行为以官方文档为准。
- 各步骤的配图接口没有返回；文中 8 段代码示例已从原文原样补入上方。
