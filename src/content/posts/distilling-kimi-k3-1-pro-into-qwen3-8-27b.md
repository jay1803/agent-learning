---
title: "Distilling Kimi-K3.1-Pro into Qwen3.8-27B: Teaching a model a new language"
date: "2026-11-27T10:04:38Z"
category: "agents"
description: "Together AI 发现 Qwen3.8-27B 几乎不会写老挝语（FLORES-200 chrF++ 5.5），于是用 Kimi-K3.1-Pro 当老师做离策略蒸馏：约 3,800 条译文训练后学生达到 44.3、为老师的 93%；首轮训练丢了泰语能力，靠混入泰语数据修复，全部实验花费 260 美元。"
source: "https://x.com/togethercompute/status/2126025460416921661"
author: "Together AI"
---

Together AI 用 Kimi-K3.1-Pro 的译文微调 Qwen3.8-27B，让这个常把英译老挝语任务答成泰语的小模型在全部测试句上改用老挝文，填补了与教师模型之间 92% 的老挝语得分差距，同时保住了泰语翻译能力。老挝语属于西南部台语支，是老挝的官方语言，与最接近的泰语使用不同的文字。这个例子体现了小模型能力的不均衡：一个常用模型可以在具体任务上失灵，而更大、成本更高的模型能完成同一任务。

Together AI 先用每种语言 50 句筛查了 11 种语言。老挝语上，Qwen3.8-27B 的输出有 45 句含泰文，只有 6 句含老挝文。这里统计的是输出是否含有某种文字，正式评估则按字母以哪种文字为主归类。**chrF++** 根据字符和词的重合程度衡量译文与人工参考的接近程度，取值为 0 到 100。泰文与老挝文参考译文几乎没有字符重合，因此这批样本上基座只得 7.2，教师得 49.0。例如，原句是“他补充说：‘我们现在有一些 4 个月大的小鼠，它们以前患有糖尿病，现在已经不患糖尿病了。’”Qwen 用泰语合理地译出了这层意思，Kimi 则用老挝语作答。

Thinking Machines 介绍的**在策略蒸馏（on-policy distillation**）由学生生成文本，再由教师逐个词元评分。教师需要给出学生词元的对数概率，实践中通常要求两个模型共用分词器。Kimi 和 Qwen 使用不同的分词器，Together AI 因此采用**离策略蒸馏（off-policy distillation）**，让教师生成译文，再通过监督微调（SFT）让学生模仿。教师只需通过常规无服务器聊天接口提供文本，无需占用训练资源。实验依次采集英语源句，让关闭思考模式的 Kimi 翻译，剔除未以目标文字为主的译文，在 Together Post-Training 上以教师译文为目标微调 Qwen 的 LoRA 适配器并用留出的句子评估，最后将适配器保存到模型注册表。

评估追踪四个指标。第一项是老挝语 chrF++，每次运行首尾都用完整的 1,012 条 FLORES-200 devtest 句子与人工参考比较，训练中抽测 300 句，通常每 25 步一次，耗时最长的两次运行改为每 50 或 100 步一次。过程评估所用的 300 句上，基座和教师分别得 6.7 和 47.3，devtest 始终留作评估。第二项是字母以老挝文为主的输出比例，直接捕捉错用泰文的问题。第三项是在另外 300 条英译泰语测试句上计算 chrF++，监测原有能力。第四项让 Kimi 将各系统的译文回译成英语，再与各自的英语源句比较，尽量把原意保留程度与参考译文风格分开衡量。

不使用教师、直接用 945 条 FLORES-200 开发集人工老挝语译文微调的对照组，在第 25 步就把抽样老挝语 chrF++ 从 6.7 拉到 43.3，同期泰语却跌到 11.7。模型学会了“被要求翻译时就写老挝语”，把原本的错语种问题反转了。它最终取得学生中最高的老挝语成绩，如果只评老挝语就会选中这个方案。换成 Kimi 对同一批英语句子生成的老挝语译文后，泰语维持了两轮，到第三轮才下滑，当时 300 条泰语答案中有 17 条用老挝文写成。再混入 989 条 Kimi 生成的泰语译文，两次混合训练中的泰语 chrF++ 在任何一次评估都没低于 47.3，最终都超过基座。

老挝语样本数接近时，人工译文训练在人工参考指标上领先。FLORES-200 的开发集和测试集采用相同的人工翻译流程，学生从开发集学到的译文风格也适用于测试集。改用 Kimi 的译文作为参考，蒸馏学生的 chrF++ 从 8 升到 58，人工译文训练的学生得到 47。开发集只有 997 条人工参考，但教师可以继续翻译新的英语文本。加入 3,000 条英语 Wikipedia 句子的教师译文后，经过滤的老挝语训练集从 965 条扩大到 3,834 条，最终追到距人工译文方案不到半分，同时保住了泰语。用同一批 300 句做过程评估，大数据集只训练一轮就达到 43.2，小规模老挝语加泰语数据训练三轮得到 41.3。

完整老挝语测试与 300 句泰语测试的结果如下，三项依次是老挝语 chrF++、老挝文输出率和泰语 chrF++。

| Run | Training data | Lao chrF++ | Lao script | Thai chrF++ |
| --- | --- | --- | --- | --- |
| Base student | none | 5.5 | 11% | 46.7 |
| SFT on human references | 945 human Lao translations | 44.7 | 100% | 5.3 |
| Distilled, Lao only | 965 Kimi-K3.1-Pro Lao translations | 41.8 | 100% | 44.3 |
| Distilled, Lao + Thai | 965 Lao + 989 Thai, from Kimi-K3.1-Pro | 41.9 | 100% | 47.4 |
| Distilled, Lao + Thai, 4× Lao data | 3,834 Lao + 989 Thai, from Kimi-K3.1-Pro | 44.3 | 100% | 47.8 |
| Kimi-K3.1-Pro teacher | - | 47.5 | 100% | 49.9 |

| 方案 | 老挝语 chrF++ | 老挝文输出率 | 泰语 chrF++ |
| --- | ---: | ---: | ---: |
| Qwen3.8-27B 基座 | 5.5 | 11% | 46.7 |
| 945 条人工老挝语译文 | 44.7 | 100% | 5.3 |
| 965 条 Kimi 老挝语译文 | 41.8 | 100% | 44.3 |
| 965 条 Kimi 老挝语译文，加 989 条泰语译文 | 41.9 | 100% | 47.4 |
| 3,834 条 Kimi 老挝语译文，加 989 条泰语译文 | 44.3 | 100% | 47.8 |
| Kimi-K3.1-Pro 教师 | 47.5 | 100% | 49.9 |

人工译文组训练结束时的泰文输出率为 0%。扩大老挝语数据的混合方案达到了教师老挝语得分的 93%，以基座为起点，用学生增分除以教师增分，即 `(44.3 − 5.5) / (47.5 − 5.5)`，填补了 92% 的差距。回译结果解释了为什么差距能缩得这么快：基座模型错用泰语的输出得 64.6，人工老挝语参考译文得 64.0，蒸馏学生的老挝语输出得 65.7。基座在训练前已大体保留原意，主要差距在目标语种的选择。所有方案在第 25 或第 50 步首次评估时，就已纠正老挝语输出所用的文字。

Together AI 随后用一个适配器训练五种语言。它选了师生差距最大的老挝语、北索托语和祖鲁语，加上两种模型得分都最低的拉丁字母语言约鲁巴语，以及用于保留原有能力的泰语。训练共用 8,871 条 Kimi 译文，泰语约 1,000 条，其余各约 2,000 条。五种语言均有改善。老挝语升到 41.8，填补 87% 的差距。北索托语从 32.7 升到 48.0，教师得 50.7，填补 85%。约鲁巴语从 20.7 升到 25.7，教师得 27.7，填补 71%。祖鲁语从 37.7 升到 39.2，教师得 50.3，填补 12%。泰语升到 48.0，基座和教师成绩沿用上表。老挝语用全量测试集，其余语言各用 300 句，每种语言的师生都在同一批句子上评分。进步最小的祖鲁语在训练期间有 1% 到 2% 的输出陷入重复循环，后续可尝试增加祖鲁语训练数据，或在生成时加入重复惩罚。

| Language | Base student | Distilled | Kimi-K3.1-Pro | Gap closed |
| --- | --- | --- | --- | --- |
| Lao | 5.5 | 41.8 | 47.5 | 87% |
| Northern Sotho | 32.7 | 48.0 | 50.7 | 85% |
| Yoruba | 20.7 | 25.7 | 27.7 | 71% |
| Zulu | 37.7 | 39.2 | 50.3 | 12% |
| Thai | 46.7 | 48.0 | 49.9 | improved |

这组实验给出了四步操作建议：先用每种语言 50 句找出教师明显领先的任务，再检查基座的具体错误，区分本例的语种选错与原意丢失。学生表现停滞时，优先生成更多教师数据，再考虑增加训练轮次。把想保留、又容易受干扰的相近能力混入训练数据，并在训练过程中单独评分。

生成训练数据时，通过 Together 聊天补全接口调用 `moonshotai/Kimi-K3.1-Pro`，提示词是“把以下英文文本译成老挝语。只输出老挝语译文，不作解释。”温度设为 `0.0`，最大输出设为 `1024` 个词元，并用 `chat_template_kwargs={"thinking": False}` 关闭思考模式。在 300 句老挝语测试上，开启思考时只得 43.5，耗用约 8 倍词元，关闭时每条译文平均约 175 个输出词元。英语源文本来自 FLORES-200 开发集和英语 Wikipedia，后者另取 1,000 句生成泰语译文。无服务器接口每百万输入词元收费 $2，每百万输出词元收费 $10，生成约 4,000 条老挝语译文共花 $7.46。译文至少 70% 的字母须属于目标文字，且不能照抄英语源句，两项条件共剔除了约 4% 的 Kimi 老挝语译文。每条保留译文写成一条聊天记录，用户消息放指令和源句，助理消息放教师译文。

```python
from together import Together

client = Together()
resp = client.chat.completions.create(
    model="moonshotai/Kimi-K3.1-Pro",
    messages=[{"role": "user", "content": (
        "Translate the following English text into Lao. "
        "Output only the Lao translation, with no explanation.\n\n" + english
    )}],
    max_tokens=1024,
    temperature=0.0,
    chat_template_kwargs={"thinking": False},
)
lao = resp.choices[0].message.content
```

```json
{"messages": [
  {"role": "user", "content": "Translate the following English text into Lao. Output only the Lao translation, with no explanation.\n\n<English sentence>"},
  {"role": "assistant", "content": "<Kimi-K3.1-Pro's Lao translation>"}
]}
```

Together Post-Training 的模型资源是一组加载基座模型的 GPU，本实验使用 B200。训练器负责前向传播、反向传播和优化更新，可选的生成器负责从中间检查点采样，一个训练会话对应一个 LoRA 适配器。先用 `get_codec("Qwen/Qwen3.8-27B", enable_thinking=False)` 按 Qwen 自身的聊天模板编码，再用 `build_conversation_samples` 和 `TRAIN_ON_LAST` 构建最大长度为 2,048 的样本。提示词的损失权重为 0，助理译文及轮次结束词元的权重为 1，让学生同时学会翻译和停止生成。`build_cross_entropy_sample` 将词元移位，构造接口所需的下一词元预测目标。

创建启用 LoRA 的 `B200-SXM` 资源时配置一个生成器副本和 1,200 秒空闲超时，先登记资源 ID 再等待就绪，以便进程崩溃后仍能找到资源。资源就绪约需 4 到 5 分钟。LoRA 的秩设为模型支持的上限 64，`alpha` 为 128。峰值学习率为 `1e-4`，前 5% 步数用于预热，随后按余弦曲线衰减至峰值的十分之一。批量大小为 16，每步调用 `forward_backward` 计算交叉熵并反向传播，再用 `optim_step` 执行 Adam 更新。到评估点用 `weights_sync` 同步最新权重，由同一资源的 `sample_batch` 对每条测试提示采样一次，温度为 `0.0`，最多生成 1,024 个词元，随后评分，省去单独部署推理端点。训练结束后调用 `create_inference_checkpoint` 注册推理适配器，标识以 `ml_` 开头。

```python
from together import Together
from together.post_training import (AdamParams, LoraConfig, LossConfig,
                                    ModelResourcesClient, SamplingParams)
from post_training_cookbook.codecs import get_codec
from post_training_cookbook.samples import make_prompt
from post_training_cookbook.sft.train import TRAIN_ON_LAST, build_conversation_samples

codec = get_codec("Qwen/Qwen3.8-27B", enable_thinking=False)
samples = [s for row in rows for s in build_conversation_samples(
    row["messages"], codec=codec, train_on_what=TRAIN_ON_LAST, max_length=2048)]

# One resource with one generator replica: train and evaluate on the same resource.
raw = Together().post_training.model_resources.create(
    base_model="Qwen/Qwen3.8-27B", lora_enabled=True,
    compute_config={"gpu_type": "B200-SXM", "num_generator_replicas": 1},
    extra_body={"inactive_timeout": 1200})
record_in_ledger(raw.id)            # before waiting, so a crash can't leak it
wait_until_ready(raw.id)            # about 4 to 5 minutes for us
resources = ModelResourcesClient.attach(model_resources_id=raw.id)
session = resources.create_session(lora_config=LoraConfig(rank=64, alpha=128))

for step in range(total_steps):
    batch = next_batch(samples, size=16)
    session.trainer.forward_backward(samples=batch,
                                     loss=LossConfig(type="LOSS_TYPE_CROSS_ENTROPY"))
    session.trainer.optim_step(adam_params=AdamParams(learning_rate=lr_at(step)))

    if (step + 1) % 25 == 0:
        session.trainer.weights_sync()              # publish new weights to the generator
        outs = session.generator.sample_batch(
            [make_prompt(codec.encode_messages(m, add_generation_prompt=True)) for m in test_prompts],
            num_samples=1, sampling_params=SamplingParams(max_tokens=1024, temperature=0.0))
        score(outs)

checkpoint = session.create_inference_checkpoint()  # registers the adapter (ml_...)
```

| Slice | Used for | Base Lao | Teacher Lao |
| --- | --- | --- | --- |
| 50 sentences per language | The 11-language screen | 7.2 | 49.0 |
| 300 devtest sentences | Evaluations during training, and Thai | 6.7 | 47.3 |
| All 1,012 devtest sentences | Start and end of each run, and the headline results | 5.5 | 47.5 |

按 B200 计价，全部实验共花 $260。每次运行的第一步耗时 2.5 到 3 分钟，之后每步耗时中位数为 2.6 到 3.2 秒，生成器评估 300 句约需 20 秒。最佳老挝语方案占用资源 46 分钟，训练步骤用时 33.7 分钟，30 次评估共用 7.1 分钟，其余时间用于启动会话、保存适配器和关闭资源。复现代码位于 Together Post-Training Cookbook，`recipes/distillation/screen_languages.py` 测量各语言的师生差距，`recipes/distillation/lao_from_kimi_k31_pro.py` 生成并过滤教师数据、训练并评估老挝语学生，`recipes/distillation/multilingual_from_kimi_k31_pro.py` 训练五语适配器。训练入口是 Together Post-Training，得到适配器后可按 **Deploy a checkpoint** 文档提供推理服务。

附录用每个参与训练词元的交叉熵记录损失，单位为奈特。词元数只统计计入损失的助理译文部分。

| Run | Steps | Epochs | Trained tokens | Loss, first 10 steps | Loss, last 25 steps |
| --- | --- | --- | --- | --- | --- |
| SFT on human references | 177 | 3 | 0.37M | 0.54 | 0.16 |
| Distilled, Lao only | 180 | 3 | 0.38M | 0.36 | 0.06 |
| Distilled, Lao + Thai | 366 | 3 | 0.49M | 0.43 | 0.06 |
| Distilled, Lao + Thai, 4× Lao data | 602 | 2 | 1.11M | 0.43 | 0.13 |
| Five languages, one adapter | 831 | 1.5 | 1.04M | 0.82 | 0.30 |

| 方案 | 步数 | 轮次 | 训练词元数 | 前 10 步损失 | 末 25 步损失 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 人工老挝语译文微调 | 177 | 3 | 0.37M | 0.54 | 0.16 |
| 仅老挝语蒸馏 | 180 | 3 | 0.38M | 0.36 | 0.06 |
| 老挝语与泰语混合蒸馏 | 366 | 3 | 0.49M | 0.43 | 0.06 |
| 扩大约四倍老挝语数据的混合蒸馏 | 602 | 2 | 1.11M | 0.43 | 0.13 |
| 五种语言共用适配器 | 831 | 1.5 | 1.04M | 0.82 | 0.30 |

用相同的 FLORES-200 开发集英语源句训练，学生拟合 Kimi 的老挝语译文时，训练开始和结束的损失都低于人工译文组。Together AI 推测，单个模型的译文可能比多人翻译团队的译文更一致。每逢轮次切换，模型重新遇到已见样本，损失随之下降。四次以老挝语为主的训练在第一轮后损失都下降超过一半，留出测试句上的老挝语 chrF++ 却只变化了 −1 到 +3 分。五语适配器在第一轮始终具有最高训练损失，它的五种语言中有四种起点明显落后于教师，老挝语相关实验涉及的两种语言中只有一种如此。
