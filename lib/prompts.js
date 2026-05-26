function contextBlock(idea, platform, style, audience, aspectRatio) {
  return `## 项目输入
- 一句话想法：${idea}
- 目标平台：${platform || '抖音'}
- 风格基调：${style || '电影感写实'}
- 目标受众：${audience || '年轻女性 25-34'}
- 视频画幅：${aspectRatio || '9:16'}`;
}

// 步骤 1：编剧 → 剧本段落
export function buildWritePrompt(idea, platform, style, audience, aspectRatio) {
  return `你是编剧。根据项目输入，创作视频的叙事结构。

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
      "scene": "场景描述"
    }
  ]
}
\`\`\`

规则：生成 3-4 个段落，只输出 JSON`;
}

// 步骤 2：导演 → 导演阐述
export function buildDirectPrompt(idea, platform, style, segmentsJson) {
  return `你是导演。基于编剧已确认的剧本段落，做导演分析。

- 想法：${idea}
- 平台：${platform || '抖音'}
- 风格：${style || '电影感写实'}
- 已确认段落：${segmentsJson}

## 任务
输出合法 JSON，不要额外文字：

\`\`\`json
{
  "directorNotes": "导演总体阐述（100字以内，含节奏把控和视觉风格定位）",
  "beatAnalysis": [
    {
      "segmentId": "P01",
      "beatGoal": "这个节拍的导演意图",
      "cameraStyle": "镜头风格（如手持跟拍、固定长镜、特写推拉）",
      "pacing": "节奏（紧张/舒缓/递进）",
      "actorDirection": "演员走位与情绪指导"
    }
  ],
  "characterList": [
    {
      "name": "角色名",
      "role": "主角/配角",
      "traits": "性格关键词",
      "appearanceNotes": "导演对外观的要求（供服化道参考）"
    }
  ],
  "sceneList": [
    {
      "name": "场景名",
      "type": "室内/室外",
      "mood": "情绪氛围",
      "lightingNote": "导演对光线要求"
    }
  ],
  "propList": [
    {
      "name": "道具名",
      "description": "道具描述",
      "significance": "叙事意义"
    }
  ]
}
\`\`\`

规则：每个段落都要做节拍分析，1-2 个角色，1-2 个场景，1-3 个关键道具，只输出 JSON`;
}

// 步骤 3：服化道设计师 → 角色 + 场景视觉
export function buildDesignPrompt(idea, style, segmentsJson, directorJson) {
  return `你是服化道设计师。基于导演阐述，设计角色外观和场景的视觉提示词。

- 想法：${idea}
- 风格：${style || '电影感写实'}
- 剧本段落：${segmentsJson}
- 导演阐述：${directorJson || '（无）'}

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

规则：生成 1-2 个角色、1-2 个场景，与导演清单对应，只输出 JSON`;
}

// 步骤 4：音乐总监 → 音乐设计
export function buildMusicPrompt(idea, style, segmentsJson, directorJson) {
  return `你是音乐总监。基于导演阐述和剧本，设计音乐方案。不直接读剧本，只参考导演阐述中的节奏和情绪。

- 想法：${idea}
- 风格：${style || '电影感写实'}
- 剧本段落：${segmentsJson}
- 导演阐述：${directorJson || '（无）'}

## 任务
输出合法 JSON，不要额外文字：

\`\`\`json
{
  "musicDirection": {
    "genre": "音乐风格",
    "tempo": "节奏（BPM）",
    "moodCurve": "情绪曲线描述",
    "instruments": "主要乐器",
    "referenceStyle": "参考风格（如汉斯·季默/坂本龙一）",
    "sunoPrompt": "Suno 音乐生成提示词（中文，50字以内）"
  },
  "soundDesign": {
    "ambientSuggestion": "环境音建议",
    "keySoundEffects": ["关键音效1", "关键音效2"]
  }
}
\`\`\`

规则：1 个音乐方案，含 Suno 提示词和环境音建议，只输出 JSON`;
}

// 步骤 5：分镜师 → 视频提示词 + 故事板 + 交付清单
export function buildStoryboardPrompt(idea, platform, style, aspectRatio, segmentsJson, directorJson) {
  return `你是分镜师。基于导演阐述和全部上游输出，生成视频提示词、故事板增强和交付清单。

- 想法：${idea}
- 平台：${platform || '抖音'}
- 风格：${style || '电影感写实'}
- 画幅：${aspectRatio || '9:16'}
- 剧本段落：${segmentsJson}
- 导演阐述：${directorJson || '（无）'}

## 任务
输出合法 JSON，不要额外文字：

\`\`\`json
{
  "videoPrompts": [
    {
      "segmentId": "P01",
      "prompt": "视频生成提示词（中文，80-150字，含镜头语言、光线、构图、动作描述，可直接喂给 Seedance/可灵/Runway）"
    }
  ],
  "storyboardSegments": [
    {
      "segmentId": "P01",
      "reason": "为什么这个段落需要故事板增强",
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
  "checklist": ["交付物1", "交付物2", "交付物3", "交付物4", "交付物5"],
  "advice": "给创作者的核心制片建议（2-3句话）"
}
\`\`\`

规则：每个段落生成 1 个视频提示词，标出 1 个适合故事板增强的段落，4-5 条交付物，只输出 JSON`;
}
