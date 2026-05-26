import { buildSegmentsPrompt, buildAssetsPrompt, buildProductionPrompt } from '../lib/prompts.js';

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '请使用 POST 请求' });
  }

  const { idea, platform, style, audience, aspectRatio } = req.body || {};

  if (!idea || !idea.trim()) {
    return res.status(400).json({ error: '请输入你的视频想法' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: '服务器未配置 API Key' });
  }

  try {
    // 3 个 AI 请求并行，每个 20-30 秒，总耗时 ~30 秒
    const [segmentsData, assetsData, productionData] = await Promise.all([
      callAI(buildSegmentsPrompt(idea, platform, style, audience, aspectRatio), 2048),
      callAI(buildAssetsPrompt(idea, style), 1024),
      callAI(buildProductionPrompt(idea, platform, style), 1024)
    ]);

    const result = {
      projectTitle: segmentsData.projectTitle || '',
      projectBrief: segmentsData.projectBrief || '',
      segments: segmentsData.segments || [],
      characters: assetsData.characters || [],
      scenes: assetsData.scenes || [],
      storyboardSegments: productionData.storyboardSegments || [],
      musicDirection: productionData.musicDirection || {},
      checklist: productionData.checklist || [],
      advice: productionData.advice || ''
    };

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: '服务器内部错误', detail: err.message });
  }
}
