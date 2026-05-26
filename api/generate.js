import { buildWritePrompt, buildDirectPrompt, buildDesignPrompt, buildMusicPrompt, buildStoryboardPrompt } from '../lib/prompts.js';

const API_KEY = process.env.API_KEY;
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://cloud.hongqiye.com';
const MODEL = process.env.MODEL || 'claude-sonnet-4-6';

async function callAI(prompt, maxTokens = 2048) {
  const res = await fetch(`${API_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI 返回错误 (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content || '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;
  return JSON.parse(jsonStr);
}

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function ensureFields(result) {
  result.segments = result.segments || [];
  result.characters = result.characters || [];
  result.scenes = result.scenes || [];
  result.storyboardSegments = result.storyboardSegments || [];
  result.videoPrompts = result.videoPrompts || [];
  result.musicDirection = result.musicDirection || {};
  result.soundDesign = result.soundDesign || {};
  result.checklist = result.checklist || [];
  result.advice = result.advice || '';
  result.projectTitle = result.projectTitle || '';
  result.projectBrief = result.projectBrief || '';
  result.directorNotes = result.directorNotes || '';
  result.beatAnalysis = result.beatAnalysis || [];
  result.characterList = result.characterList || [];
  result.sceneList = result.sceneList || [];
  result.propList = result.propList || [];
  return result;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCORS(res);
    return res.status(200).end();
  }

  setCORS(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '请使用 POST 请求' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: '服务器未配置 API Key' });
  }

  const { action, idea, platform, style, audience, aspectRatio, segments, directorOutput } = req.body || {};

  if (!idea || !idea.trim()) {
    return res.status(400).json({ error: '请输入你的视频想法' });
  }

  try {
    let result;

    switch (action) {

      case 'write':
        // 步骤 1：编剧 → 段落
        result = await callAI(
          buildWritePrompt(idea, platform, style, audience, aspectRatio),
          1536
        );
        break;

      case 'direct':
        // 步骤 2：导演 → 导演阐述
        if (!segments || segments.length === 0) {
          return res.status(400).json({ error: '请先完成编剧步骤，提供已确认的段落' });
        }
        result = await callAI(
          buildDirectPrompt(idea, platform, style, JSON.stringify(segments)),
          1536
        );
        break;

      case 'design':
        // 步骤 3：服化道 → 角色 + 场景
        if (!segments || segments.length === 0) {
          return res.status(400).json({ error: '请提供已确认的段落' });
        }
        result = await callAI(
          buildDesignPrompt(idea, style, JSON.stringify(segments), directorOutput ? JSON.stringify(directorOutput) : ''),
          1024
        );
        break;

      case 'music':
        // 步骤 4：音乐 → 音乐方向
        if (!segments || segments.length === 0) {
          return res.status(400).json({ error: '请提供已确认的段落' });
        }
        result = await callAI(
          buildMusicPrompt(idea, style, JSON.stringify(segments), directorOutput ? JSON.stringify(directorOutput) : ''),
          1024
        );
        break;

      case 'storyboard':
        // 步骤 5：分镜 → 视频提示词 + 故事板 + 交付
        if (!segments || segments.length === 0) {
          return res.status(400).json({ error: '请提供已确认的段落' });
        }
        result = await callAI(
          buildStoryboardPrompt(idea, platform, style, aspectRatio || '9:16', JSON.stringify(segments), directorOutput ? JSON.stringify(directorOutput) : ''),
          1536
        );
        break;

      default:
        return res.status(400).json({
          error: '请指定步骤：action 应为 write、direct、design、music 或 storyboard'
        });
    }

    return res.status(200).json({ success: true, data: ensureFields(result) });
  } catch (err) {
    return res.status(500).json({ error: '服务器内部错误', detail: err.message });
  }
}
