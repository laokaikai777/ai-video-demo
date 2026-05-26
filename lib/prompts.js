// 上下文信息，所有 prompt 共用
function contextBlock(idea, platform, style, audience, aspectRatio) {
  return `## 项目输入
- 一句话想法：${idea}
- 目标平台：${platform || '抖音'}
- 风格基调：${style || '电影感写实'}
- 目标受众：${audience || '年轻女性 25-34'}
- 视频画幅：${aspectRatio || '9:16'}`;
}

// 第 1 个并行请求：编剧 + 导演 → 段落
export function buildSegmentsPrompt(idea, platform, style, audience, aspectRatio) {
  return `你是编剧和导演。根据以下项目输入，设计视频的叙事结构和段落。

${contextBlock(idea, platform, style, audience, aspectRatio)}

## 任务
输出合法 JSON，不要额外文字：

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
      "videoPrompt": "视频生成提示词（中文，80-120字，含镜头语言、光线、构图、动作描述）"
    }
  ]
}
\`\`\`

规则：生成 3-4 个段落，只输出 JSON`;
}

// 第 2 个并行请求：服化道设计师 → 角色 + 场景
export function buildAssetsPrompt(idea, style) {
  return `你是服化道设计师。根据以下项目，设计角色外观和场景。

- 想法：${idea}
- 风格：${style || '电影感写实'}

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

规则：生成 1-2 个角色、1-2 个场景，只输出 JSON`;
}

// 第 3 个并行请求：音乐总监 + 分镜师 + 交付
export function buildProductionPrompt(idea, platform, style) {
  return `你是音乐总监和分镜师。根据以下项目，完成音乐设计、故事板增强和交付清单。

- 想法：${idea}
- 平台：${platform || '抖音'}
- 风格：${style || '电影感写实'}

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
    "sunoPrompt": "Suno 音乐生成提示词（50字以内）"
  },
  "checklist": ["交付物1", "交付物2", "交付物3", "交付物4"],
  "advice": "给创作者的核心制片建议（1-2句话）"
}
\`\`\`

规则：1 个故事板段落（引用 P01），3-5 条交付物清单，只输出 JSON`;
}
