const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

let genAI = null;

// Lazy-initialize Gemini
const getModel = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  if (!genAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// Helper: call with retry on rate-limit
const callWithRetry = async (fn, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RATE_LIMIT');
      if (isRateLimit && attempt < maxRetries) {
        const delay = (attempt + 1) * 5000;
        console.log(`⏳ Rate limited, retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
};

// Extract the largest code block from text
const extractCodeBlock = (text) => {
  const matches = [...text.matchAll(/```(?:\w+)?\n([\s\S]*?)```/g)];
  if (matches.length === 0) return null;
  // Return the largest code block (most likely the fixed code)
  return matches.reduce((a, b) => a[1].length > b[1].length ? a : b)[1].trim();
};

// @route   POST /api/ai/review
// @desc    Get AI code review
// @access  Private
router.post('/review', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: 'Code is required for review.' });
    }

    const model = getModel();

    if (!model) {
      return res.json({
        review: {
          overallScore: 7,
          summary: 'Demo review. Add GEMINI_API_KEY in server/.env for real AI reviews.',
          issues: [{ severity: 'info', line: 1, message: 'Add GEMINI_API_KEY to enable AI.', suggestion: 'Get free key from https://aistudio.google.com/apikey' }],
          suggestions: ['Configure Gemini API for real code analysis'],
          codeQuality: { readability: 7, performance: 7, bestPractices: 7, security: 7 },
        },
      });
    }

    const prompt = `You are an expert code reviewer. Analyze this ${language || 'code'}:

\`\`\`${language || ''}
${code}
\`\`\`

Respond ONLY with valid JSON (no markdown wrapping, no code fences, just raw JSON):
{
  "overallScore": <1-10>,
  "summary": "<2-3 sentence overview>",
  "issues": [{"severity": "<error|warning|info>", "line": <number>, "message": "<issue>", "suggestion": "<fix>"}],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "codeQuality": {"readability": <1-10>, "performance": <1-10>, "bestPractices": <1-10>, "security": <1-10>}
}`;

    const responseText = await callWithRetry(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    });

    let review;
    try {
      // Strip markdown code fences if present
      let cleanJson = responseText;
      cleanJson = cleanJson.replace(/```json?\s*\n?/g, '').replace(/```\s*$/g, '').trim();
      // Find JSON object
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        review = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      review = {
        overallScore: 6,
        summary: responseText.substring(0, 300),
        issues: [],
        suggestions: [responseText.substring(0, 200)],
        codeQuality: { readability: 6, performance: 6, bestPractices: 6, security: 6 },
      };
    }

    res.json({ review });
  } catch (error) {
    console.error('AI Review error:', error.message || error);
    const msg = error.message || '';
    if (msg.includes('429') || msg.includes('quota')) {
      return res.status(429).json({ message: 'AI rate limit reached. Wait 60 seconds and try again.' });
    }
    res.status(500).json({ message: 'AI Review failed.', error: error.message });
  }
});

// @route   POST /api/ai/chat
// @desc    AI chat — fix, explain, optimize code
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, code, language, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const model = getModel();

    if (!model) {
      return res.json({
        reply: "AI assistant is in demo mode. Add GEMINI_API_KEY in server/.env to enable.",
        fixedCode: null,
      });
    }

    // Check if user wants code changes
    const wantsCodeChange = /fix|debug|optimize|improve|rewrite|correct|refactor|add comment|comment|error|bug|wrong/i.test(message);

    const systemPrompt = `You are CodeSync AI, a coding assistant in a collaborative code editor.
The user is working with ${language || 'code'}.

CURRENT CODE IN EDITOR:
\`\`\`${language || ''}
${code || '// Empty editor'}
\`\`\`

Rules:
- Be concise, friendly, practical
- Use markdown: **bold**, \`code\`, bullet points
- ${wantsCodeChange ? 'When fixing/improving code, ALWAYS include the COMPLETE fixed code in a markdown code block (```language ... ```). Put your explanation BEFORE the code block.' : 'Explain clearly without providing full code replacements unless asked.'}`;

    const responseText = await callWithRetry(async () => {
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'I\'m CodeSync AI! I can see your code. How can I help?' }] },
          // Add recent chat history
          ...history.slice(-4).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content || 'ok' }],
          })),
        ],
      });
      const result = await chat.sendMessage(message);
      return result.response.text();
    });

    let reply = responseText;
    let fixedCode = null;

    // Extract code block if present and user wanted changes
    if (wantsCodeChange) {
      const extracted = extractCodeBlock(responseText);
      if (extracted) {
        fixedCode = extracted;
        // Clean up the reply by removing the code block
        reply = responseText.replace(/```(?:\w+)?\n[\s\S]*?```/g, '').trim();
        if (!reply || reply.length < 10) {
          reply = 'Here\'s the fixed code — click "Apply Fix" to update the editor:';
        }
      }
    }

    console.log(`💬 AI Chat: fixedCode=${!!fixedCode}, replyLength=${reply.length}`);
    res.json({ reply, fixedCode });
  } catch (error) {
    console.error('AI Chat error:', error.message || error);
    const msg = error.message || '';
    if (msg.includes('429') || msg.includes('quota')) {
      return res.status(429).json({ message: 'Rate limit reached. Wait a minute and try again.' });
    }
    res.status(500).json({ message: 'AI Chat failed. Please try again.', error: error.message });
  }
});

module.exports = router;
