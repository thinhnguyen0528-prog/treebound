import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, X, CheckCircle2, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameContext?: {
    currentLevel?: string;
    question?: string;
    treeVal?: any;
    selectedNode?: any;
    mistakes?: number;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  gameContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'mentor',
      text: 'Chào bạn! Tôi là Tree Mentor 🌱. Tôi sẽ giúp bạn nắm vững cấu trúc cây nhị phân, thuật toán duyệt NLR/LNR/LRN và cây tìm kiếm nhị phân BST. Bạn đang gặp vướng mắc ở phần nào?',
      timestamp: 'Ngay bây giờ',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    testing: boolean;
    message: string;
  }>({
    connected: false,
    testing: false,
    message: 'Đang kiểm tra kết nối...',
  });

  // Check Gemini API status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus((prev) => ({ ...prev, testing: true }));
      const res = await fetch('/api/gemini/status');
      if (res.ok) {
        const data = await res.json();
        setConnectionStatus({
          connected: data.connected,
          testing: false,
          message: data.connected ? 'Gemini AI Tutor đã kết nối (Gemini 3.8 Flash)' : 'AI Tutor chưa kết nối API key (Đang dùng Smart Offline Mentor)',
        });
      } else {
        setConnectionStatus({
          connected: false,
          testing: false,
          message: 'AI Tutor is not connected. (Chế độ hỗ trợ thông minh ngoại tuyến)',
        });
      }
    } catch {
      setConnectionStatus({
        connected: false,
        testing: false,
        message: 'AI Tutor is not connected. (Sẵn sàng trợ giúp offline)',
      });
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, testing: true }));
    sound.playClick();
    try {
      const res = await fetch('/api/gemini/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus({
          connected: true,
          testing: false,
          message: 'Kết nối thành công! Gemini AI đã sẵn sàng hỗ trợ bạn.',
        });
        sound.playCorrect();
      } else {
        setConnectionStatus({
          connected: false,
          testing: false,
          message: data.message || 'Không thể kết nối với Gemini. Vui lòng kiểm tra GEMINI_API_KEY.',
        });
        sound.playError();
      }
    } catch {
      setConnectionStatus({
        connected: false,
        testing: false,
        message: 'Lỗi kiểm tra kết nối. Vui lòng thử lại sau.',
      });
      sound.playError();
    }
  };

  const generateOfflinePedagogicalAnswer = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('preorder') || q.includes('tiền thứ tự')) {
      return 'PreOrder (N-L-R): Thăm Node gốc trước → rồi đi sang Cây con Trái → cuối cùng sang Cây con Phải. Gợi ý: Hãy luôn viết giá trị của đỉnh ngay khi bạn đặt chân tới nó!';
    }
    if (q.includes('inorder') || q.includes('trung thứ tự')) {
      return 'InOrder (L-N-R): Duyệt toàn bộ Cây con Trái trước → sau đó mới thăm Node gốc → rồi duyệt Cây con Phải. Đặc biệt trong cây BST, phép duyệt InOrder sẽ cho dãy số tăng dần!';
    }
    if (q.includes('postorder') || q.includes('hậu thứ tự')) {
      return 'PostOrder (L-R-N): Duyệt hết Cây con Trái → duyệt hết Cây con Phải → rồi mới thăm Node gốc cuối cùng. Đây là thứ tự thường dùng khi xóa cây hoặc tính toán kích thước thư mục!';
    }
    if (q.includes('bst') || q.includes('tìm kiếm') || q.includes('sang trái') || q.includes('sang phải')) {
      return 'Quy tắc vàng của BST: Nhánh TRÁI luôn chứa các giá trị NHỎ HƠN node hiện tại (val < current), nhánh PHẢI chứa các giá trị LỚN HƠN (val > current). Cứ so sánh để quyết định rẽ hướng nhé!';
    }
    if (q.includes('lá') || q.includes('leaf')) {
      return 'Node Lá (Leaf) là node có bậc bằng 0, nghĩa là node đó KHÔNG có bất kỳ node con nào (cả nhánh trái và nhánh phải đều là NULL).';
    }
    if (q.includes('bậc') || q.includes('degree')) {
      return 'Bậc của một node trong cây nhị phân là số con của nó (0, 1 hoặc 2). Bậc của cây là bậc lớn nhất trong tất cả các node trong cây.';
    }
    if (q.includes('chiều cao') || q.includes('height')) {
      return 'Chiều cao của cây là số mức từ gốc đến lá xa nhất. Ví dụ cây có root (mức 1), các con của nó ở mức 2, cháu ở mức 3 thì chiều cao là 3.';
    }
    if (q.includes('rừng') || q.includes('forest')) {
      return 'Rừng (Forest) là tập hợp các cây rời nhau. Nếu bạn loại bỏ node gốc của một cây, các cây con bên dưới sẽ tạo thành một rừng cây!';
    }
    if (q.includes('xóa') || q.includes('delete')) {
      return 'Xóa node trong BST có 3 trường hợp:\n1. Node lá (0 con): Xóa trực tiếp.\n2. Node có 1 con: Nối con đó lên thế chỗ cha.\n3. Node có 2 con: Tìm node nhỏ nhất ở cây con phải (In-order Successor) hoặc lớn nhất ở cây con trái để thế mạng!';
    }
    if (q.includes('hoàn chỉnh') || q.includes('đầy đủ') || q.includes('complete') || q.includes('full')) {
      return '• Cây nhị phân đầy đủ (Full): Mọi node đều có 0 hoặc 2 con.\n• Cây nhị phân hoàn chỉnh (Complete): Đầy đủ mọi tầng trừ tầng đáy, và tầng đáy các node được lấp từ trái sang phải.\n• Cây nhị phân gần đầy (Almost Complete): Tương đương cây hoàn chỉnh.';
    }
    return 'Tree Mentor đây! Hãy nhớ bản chất: với mỗi thao tác, hãy bắt đầu so sánh từ Node gốc (Root), sau đó quyết định rẽ trái hay phải theo định nghĩa bài toán nhé!';
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      if (connectionStatus.connected) {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            context: gameContext,
          }),
        });

        const data = await response.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `m_${Date.now()}`,
              sender: 'mentor',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          sound.playNodeSelect(620);
          setLoading(false);
          return;
        }
      }

      // Offline / fallback mentor rule
      setTimeout(() => {
        const offlineReply = generateOfflinePedagogicalAnswer(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: `m_${Date.now()}`,
            sender: 'mentor',
            text: offlineReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        sound.playNodeSelect(620);
        setLoading(false);
      }, 400);
    } catch {
      const offlineReply = generateOfflinePedagogicalAnswer(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          sender: 'mentor',
          text: offlineReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg h-[620px] max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">TREE MENTOR</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  AI Tutor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cố vấn học tập Cây Nhị Phân & Thuật toán
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Connection Banner */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {connectionStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[280px]">
              {connectionStatus.message}
            </span>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={connectionStatus.testing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Tree Mentor đang suy nghĩ lời giải thích...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-5 py-2 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => handleSendMessage('Quy tắc duyệt PreOrder là gì?')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            NLR (PreOrder) là gì?
          </button>
          <button
            onClick={() => handleSendMessage('Tại sao cây BST lại đi sang trái khi giá trị nhỏ hơn?')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Quy tắc BST?
          </button>
          <button
            onClick={() => handleSendMessage('Node Lá và Bậc của Node được xác định thế nào?')}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Node Lá & Bậc?
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi Tree Mentor (VD: Tại sao bước này rẽ sang phải?)..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              aria-label="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
