function contextBlock(idea, platform, style, audience, aspectRatio) {
  return `## 项目输入
- 一句话想法：${idea}
- 目标平台：${platform || '抖音'}
- 风格基调：${style || '电影感写实'}
- 目标受众：${audience || '年轻女性 25-34'}
- 视频画幅：${aspectRatio || '9:16'}`;
}

// 步骤 1：编剧 + 导演 → 剧本段落
export function buildWritePrompt(idea, platform, style, audience, aspectRatio) {
  return `你是编剧和导演。

${contextBlock(idea, platform, style, audience, aspectRatio)}

## 任务
把上述想法展开成视频叙事结构。输出合法 JSON，不要额外文字：

\`\`\`json
{
  "projectTitle": "项目名称（10字以内）",
  "projectBrief": "一句话概括（30字以内）",
  "segments": [
    {
      "id": "P01",
      "title": "段落标题",
      "duration": "时长（如 5.0s）",
      "goal": "叙事目标",
      "characters": "涉及角色",
      "scene": "场景描述",
      "videoPrompt": "视频生成提示词（中文，80-120字，含镜头语言、光线、构图、动作）"
    }
  ]
}
\`\`\`

规则：生成 3-4 个段落，只输出 JSON`;
}

// 步骤 2：服化道设计师 → 角色 + 场景（基于已确认的段落）
export function buildDesignPrompt(idea, style, segmentsJson) {
  return `你是服化道设计师。基于已确认的剧本段落，设计角色外观和场景。

- 想法：${idea}
- 风格：${style || '电影感写实'}
- 已确认的段落：${segmentsJson}

## 任务
输出合法 JSON，不要额外文字：

\`\`\`json
{
  "characters": [
    {
      "name": "角色名",
      "role": "主角/配角",
      "ageAppearance": "年龄外观",
      "costume": "服装材质",
      "traits": "性格特征",
      "designNotes": "AI 生图设计要点（50字以内）"
    }
  ],
  "scenes": [
    {
      "name": "场景名",
      "type": "室内/室外",
      "lighting": "光线描述",
      "mood": "情绪氛围",
      "materials": "材质与空间描述",
      "designNotes": "AI 生图设计要点（50字以内）"
    }
  ]
}
\`\`\`

规则：生成 1-2 个角色、1-2 个场景，与段落中的角色/场景描述对应，只输出 JSON`;
}

// 步骤 3：音乐总监 + 分镜师 + 交付清单
export function buildProducePrompt(idea, platform, style, segmentsJson) {
  return `你是音乐总监兼分镜师。基于已确认的段落，完成音乐设计、故事板增强和交付清单。

- 想法：${idea}
- 平台：${platform || '抖音'}
- 风格：${style || '电影感写实'}
- 已确认的段落：${segmentsJson}

## 任务
输出合法 JSON，不要额外文字：

\`\`\`json
{
  "storyboardSegments": [
    {
      "segmentId": "P01",
      "reason": "为什么需要故事板增强",
      "shots": [
        {
          "shotNumber": 1,
          "description": "镜头描述",
          "cameraAngle": "机位/角度",
          "focalLength": "焦距",
          "movement": "镜头运动",
          "duration": "时长"
        }
      ]
    }
  ],
  "musicDirection": {
    "genre": "音乐风格",
    "tempo": "节奏（BPM）",
    "moodCurve": "情绪曲线描述",
    "referenceStyle": "参考风格",
    "sunoPrompt": "Suno 音乐提示词（50字以内）"
  },
  "checklist": ["交付物1", "交付物2", "交付物3", "交付物4"],
  "advice": "给创作者的核心建议（1-2句话）"
}
\`\`\`

规则：1 个故事板段落，3-5 条交付物，只输出 JSON`;
}
