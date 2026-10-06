import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client utility
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/gemini/status', (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    connected: hasKey,
    model: 'gemini-3.8-flash',
    message: hasKey ? 'Tree Mentor AI is connected and ready.' : 'AI Tutor is not connected. (Using offline smart mentor rules)',
  });
});

app.post('/api/gemini/test', async (_req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(400).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Hãy chào mừng người học đến với TREEBOUND bằng một câu ngắn gọn truyền cảm hứng.',
      config: {
        systemInstruction: 'Bạn là Tree Mentor trong TREEBOUND. Trả lời đúng 1 câu ngắn gọn tiếng Việt đầy cảm hứng.',
      },
    });

    return res.json({
      success: true,
      message: response.text || 'Kết nối Gemini API thành công!',
    });
  } catch (error: any) {
    console.error('Gemini test error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Không thể kết nối đến Gemini API.',
    });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI Tutor is not connected',
        offlineFallback: true,
      });
    }

    const contextInfo = context ? `\n[Bối cảnh thời gian thực trong game]: ${JSON.stringify(context)}` : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${prompt}${contextInfo}`,
      config: {
        systemInstruction: `Bạn là TREE MENTOR - người đồng hành và cố vấn lập trình trong web game TREEBOUND (Master the Tree. Master the Algorithm).
Nhiệm vụ:
- Giải thích các khái niệm: Root, Leaf, Node, Branch, Bậc (Degree), Chiều cao (Height), Mức (Level), Cây con trái/phải, Cây nhị phân đầy đủ/hoàn chỉnh.
- Hướng dẫn thuật toán duyệt: PreOrder (N-L-R), InOrder (L-N-R), PostOrder (L-R-N).
- Hướng dẫn cây nhị phân tìm kiếm BST (Left < Node, Right > Node).
- Phong cách: Giảng viên công nghệ thân thiện, ngắn gọn, súc tích (chỉ từ 2 đến 3 câu).
- Tuyệt đối không làm bài thay hay đưa đáp án trực tiếp khi người chơi đang làm quiz/level, hãy gợi ý tư duy logic!
- Dùng tiếng Việt chuẩn xác thuật ngữ cấu trúc dữ liệu.`,
      },
    });

    return res.json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi khi kết nối AI Tutor.',
    });
  }
});

app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { question, currentSelection, expectedConcept, levelName, mistakesCount, hintTier } = req.body;
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI Tutor is not connected',
        offlineFallback: true,
      });
    }

    const tierDesc = hintTier === 3 
      ? 'Cấp độ 3 (Chỉ ra hướng đi cụ thể cho bước này)' 
      : hintTier === 2 
      ? 'Cấp độ 2 (Giải thích quy tắc thuật toán liên quan)' 
      : 'Cấp độ 1 (Gợi ý tư duy nhẹ nhàng)';

    const promptText = `Người chơi đang ở màn: "${levelName || 'Thử thách TREEBOUND'}".
Mức độ gợi ý yêu cầu: ${tierDesc}.
Câu hỏi hoặc mục tiêu: "${question || 'Thực hiện thao tác trên cây nhị phân'}".
Người chơi vừa chọn sai hoặc cần gợi ý: "${currentSelection || 'Chưa chọn'}".
Khái niệm cần học: "${expectedConcept || 'Cây nhị phân'}".
Số lần sai: ${mistakesCount || 0}.
Hãy đưa ra một gợi ý sư phạm ngắn gọn (1-2 câu) đúng với mức độ gợi ý trên.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: 'Bạn là Tree Mentor trong TREEBOUND. Hãy đưa ra gợi ý ngắn gọn, súc tích (1-2 câu) theo đúng cấp độ yêu cầu.',
      },
    });

    return res.json({
      hint: response.text,
    });
  } catch (error: any) {
    console.error('Gemini hint error:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi khi tạo gợi ý.',
    });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TREEBOUND server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
