import { buildSystemPrompt } from '../lib/prompts.js';

const API_KEY = process.env.API_KEY;
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://cloud.hongqiye.com';
const MODEL = process.env.MODEL || 'claude-opus-4-7';

export default async function handler(req, res) {
  // CORS preflight
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

  const systemPrompt = buildSystemPrompt(idea, platform, style, audience, aspectRatio);

  try {
    const response = await fetch(`${API_ENDPOINT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        temperature: 0.7,
        messages: [
          { role: 'user', content: systemPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: `AI 模型返回错误 (${response.status})`, detail: errText.slice(0, 300) });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || '';

    // Extract JSON from the response (it may be wrapped in markdown code blocks)
    let jsonStr = rawContent.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseErr) {
      return res.status(502).json({
        error: 'AI 返回的内容无法解析为 JSON',
        rawContent: rawContent.slice(0, 500)
      });
    }

    // Ensure required fields exist
    result.segments = result.segments || [];
    result.characters = result.characters || [];
    result.scenes = result.scenes || [];
    result.storyboardSegments = result.storyboardSegments || [];
    result.musicDirection = result.musicDirection || {};
    result.checklist = result.checklist || [];
    result.advice = result.advice || '';

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ error: '服务器内部错误', detail: err.message });
  }
}
