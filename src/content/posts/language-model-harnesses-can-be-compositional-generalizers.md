---
title: "Language Model Harnesses can be Compositional Generalizers"
date: "2026-11-25T12:44:45Z"
category: "agents"
description: "MIT 的 Alex L. Zhang、Souradip Chakraborty、Omar Khattab 提出：让 harness 而不是 Transformer 承担泛化——把上下文外置、用代码调度子模型调用，使每次调用都“局部同分布”。RLM harness 只在短任务上 RL 训练就能泛化到长 2–64 倍的任务和结构相似的新领域；“替身 harness 训练”用合成环境和假子调用只训根调用，得到的 RLM-27B 在长上下文难题上平均提升 26.9%、token 少约一半。"
source: "https://arxiv.org/abs/2611.28298"
author: "Alex L. Zhang, Souradip Chakraborty, Omar Khattab"
---

这篇论文（arXiv 2611.28298，2026-11-20，MIT CSAIL，Alex L. Zhang、Souradip Chakraborty、Omar Khattab）的核心论点：**与其让神经网络去泛化到越来越长、越来越陌生的轨迹，不如让 harness 把任务拆成模型本来就会做的小块**。ReAct 式“把整条轨迹当 prompt”的 harness，要求根模型在每一步都面对不断变长、越来越分布外的上下文，训练也只能在完整 rollout 上做，换个环境就得重新收集数据。作者研究另一条路：把上下文外置、用程序管理，并通过代码调用子模型的“神经符号”harness。这样即使整体任务从没见过，**每一次模型调用看到的输入仍然是熟悉、可解的**，作者称之为“局部同分布”（locally in-distribution，LID）。

最值得带走的两点：

- **泛化可以发生在文本层，而不只在权重里。** 训练只需要教会根模型“怎么拆”，子调用复用模型已有的能力，于是短任务上学到的拆法能直接用到长 64 倍的任务上。
- **可以只训练 harness 里的某一次模型调用。** 真实任务太长太贵时，构造内容完全不同、但解法结构相同的合成环境，甚至把子调用换成预置答案的“假调用”，只训根调用，效果能迁移回真实任务。作者称之为替身 harness 训练（surrogate harness training）。

## 比较了哪几种 harness

作者把常见的 harness 抽象拆成三种：**上下文外置**（完整上下文留在环境里，模型只看切片）、**程序化工具调用**（工具和子 agent 是代码里的函数，中间状态不必进模型）、**子 agent 调用**（显式扇出给拥有全新上下文的其他模型）。对比对象：

- **基础 Transformer**：代表“轨迹即 prompt”，所有上下文直接塞给模型。
- **Pi（pi-mono）**：ReAct 循环加终端、压缩和子 agent 工具，即多数编码 agent 的形态，另把长上下文放进文件。
- **CodeAct / LM + REPL**：用代码 REPL 做程序化工具调用，但没有程序化子调用，用来测子调用的价值。
- **RLM（Recursive Language Model）**：上下文外置加程序化子 agent 调用，深度为 1。

训练时 Pi 的根和子 agent 都训；RLM 只对根轨迹计算 loss。

## 长度泛化：只训短任务

在 MRCRv2、GraphWalks、LongBenchPro、OOLONG、OOLONG-Pairs、Ada-LEval 六个可调长度的环境上，用 Qwen3-30B-A3B-Instruct-2507 加 GRPO 只训短版本，评测长 2–64 倍的版本（例如 MRCRv2 从 32K–64K、2 针，到 2M–4M、8 针）。

- **RLM 的评测奖励几乎贴着训练奖励走**；基础 Transformer 的训练奖励往往更高，却泛化不到长任务。RLM 的训练奖励涨得慢，但涨多少，长任务上基本就是多少。
- 有明确程序解的任务（MRCRv2、GraphWalks），CodeAct 这类能写代码的 harness 都能泛化，因为它写出的程序本身与长度无关。
- **没有程序解、需要语义判断的任务（OOLONG 系列）才看出差别**：harness 必须把子调用的能力组合进学到的拆解方式里，这时 RLM 最好。

## 策略泛化：换领域

训练和评测领域完全不重叠、但拆解结构相同：OOLONG 从 trec-coarse 问题到垃圾邮件问题；OBLIQ-Bench 从写作风格类比到数学类比、从推特立场到 LLM 转写错误。基础 Transformer 训练奖励涨得和别人差不多，评测却很差；Pi 在密集的长上下文处理上吃力；LM + REPL 在处理密集时也吃力；**RLM 在三个任务上泛化都最好**。

## 为什么能泛化：两项诊断

- **根轨迹复用**：用加权 Jaccard 相似度比较评测轨迹和训练轨迹，上下文外置的 harness 在多数评测任务上，与某条成功的训练轨迹相似度明显更高。
- **但轨迹相似不等于能迁移**：Pi 在短任务上学到的策略（让子 agent 读固定的数据子集、手写长长的中间列表）放到长任务上就失效，所以 Pi 在 OOLONG 上的迁移明显下降。
- **子任务确实可靠**：OOLONG 有中间子任务标签，子调用准确率在训练和评测任务上同样高，说明“复用可靠的局部计算”这一解释站得住。

## 普通 RL 学到的东西不一定能组合

拿上面短任务训练出的 RLM，去打八个更难、结构不直接对应的长任务（LongReason、OOLONG-Real、OBLIQ-Bench、CorpusQA、LooGLE-v2、BrowseComp-Plus、ExpertLongBench、CTC-Bench，上下文从 31K 到约 4.56 亿 token）：

- Qwen3-30B-A3B 平均提升 7 分，更强的 Qwen3.8-27B 只提升 2.4 分。
- **RL 学到什么高度依赖初始策略**：弱模型学会少派子调用、多靠程序解；强模型学会更可靠地扇出给子 agent。前者 token 用量下降，后者反而上升。

## 替身 harness 训练：只训根调用

1. 让 Opus 5.5 在 Claude Code 里读每个任务的公开独立数据切分和几条基座模型的 RLM 轨迹，找出一个能让 Qwen3.8-27B 解题的候选“LM 程序”。
2. 再让它构造一个**上下文与真实任务不重叠、但同一个 LM 程序能同时解开两者**的合成环境。
3. BrowseComp-Plus、ExpertLongBench、OBLIQ-Bench 的合成环境里，**子调用直接返回预置的标准答案**，这样很便宜。因为只训根调用的行为，子调用是假的也没关系。
4. 把候选程序作为提示交给 RLM 生成轨迹，用 GPT-5-mini 当评委加合成环境奖励筛选，得到 8,015 条只含根调用的轨迹（另有 1,465 条 LongReason 子 agent 轨迹），对 Qwen3.8-27B 做 SFT，得到 **RLM-27B**。

结果，同一 RLM harness 下：

- 平均分从 46.1 到 58.5，**提升 12.4 分（相对 26.9%）**；
- 根轨迹**轮数少约 3 倍、输入 token 少约 6 倍**，整体 token 少约 2 倍，子调用派发更多；
- BrowseComp-Plus 上分数涨得不多，但轮数和 token 显著下降；
- 不给提示、直接在合成环境上做 RL，也能在 8 个任务里提升 7 个（平均 +6.8），但没有效率收益，学到的行为也和 SFT 不同。

## 递归：把学会的解法当成可复用组件

从 RLM-27B 能解（avg@3 为 97.5%）而 Qwen3.8-27B 解不稳（57.7%）的任务里选 87 个，随机串成 2000 个“四连任务”：解出第 i 个才能用 `unlock(answer)` 拿到第 i+1 个的输入，每题最多两次机会。

- 默认情况下，两个模型都在同一条根轨迹里依次解，RLM-27B 的全解率为 55.2%。
- 只提示“请尾递归”反而更差（47.2%）。
- 再用替身训练教会它“解完 Ti 就开一个子 RLM 去解剩下的”，**全解率升到 77.5%**。每个子任务都在全新上下文里，由已学会的解法单独处理，根模型的泛化压力大大减轻。

## 局限

- 实验以 Qwen 系列开源模型和长上下文、数据处理类基准为主，没有在编码 agent、真实多轮工具使用等更常见的 agent 场景验证；RLM 只用了深度 1 的子 agent（递归实验除外）。
- 替身环境由 Opus 5.5 在已知任务族的前提下设计，需要预先知道任务结构和一份独立数据切分；这一步对新任务能否自动化、成本多高，论文没有展开。
- 合成轨迹的筛选依赖 GPT-5-mini 评委加合成奖励；“LID”主要靠轨迹相似度和子任务准确率间接佐证，作者也承认轨迹相似本身不足以保证迁移。
- 我用 pdftotext 读了正文（第 1–12 页），64 页附录（训练配置、各合成环境设计、逐环境统计）只看了正文里的引用；正文表 4 在 PDF 抽取中排版错乱，文中引用的平均分是按正文所述增量（+12.4、+2.4、+6.8）核对过的。代码在 `github.com/alexzhang13/harness-cg`，SFT 数据在 Hugging Face `a1zhang/synthetic-rlm-sft-data`。
