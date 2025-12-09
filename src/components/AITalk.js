import React, { useEffect, useRef, useState } from 'react';

/**
 * AITalk.jsx
 * React component (semi-transparent "毛玻璃" style) for left-bottom floating AI chat widget.
 * Usage: import AITalk from './components/AITalk'; then <AITalk /> in App.jsx
 * Expects a backend endpoint at POST /chat which accepts { message, role }
 * and returns JSON { reply: string }
 */
const BACKEND_URL = 'http://localhost:10000';
const PERSONAS = [
  { id: 'big', label: '大笨鳥' },
  { id: 'gentle', label: '溫柔學姊' },
  { id: 'funny', label: '搞笑學長' },
];

export default function AITalk() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai_chat_messages_v2') || '[]'); } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [persona, setPersona] = useState(() => localStorage.getItem('ai_chat_persona') || 'big');
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ai_chat_messages_v2', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ai_chat_persona', persona);
  }, [persona]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const addMessage = (m) => setMessages(prev => [...prev, m]);

  const send = async () => {
  const text = input.trim();
  if (!text || sending) return;

    addMessage({ id: Date.now(), role: 'user', text });
    setInput('');
    setSending(true);

    try {
      // 💥 關鍵修改：使用完整的後端網址 (BACKEND_URL) 呼叫 /chat
      const resp = await fetch(`${BACKEND_URL}/chat`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, role: persona }),
      });

      // 💡 關鍵修改 1: 無論 resp.ok 是否為 true，都要先嘗試解析 JSON
      const data = await resp.json();

      if (!resp.ok) {
        // 💡 關鍵修改 2: 如果狀態碼不是 OK，拋出後端回傳的錯誤內容
        // 如果後端有回傳 'reply' 欄位，就使用它
        throw new Error(data.reply || `伺服器錯誤 (HTTP ${resp.status})`);
      }

      // 狀態碼 OK 且解析成功，正常顯示回覆
      const reply = (data && data.reply) ? data.reply : '抱歉，尚未收到回覆。'      
      addMessage({ id: Date.now() + 1, role: 'assistant', text: reply });

    } catch (err) {
      // 💡 關鍵修改 3: 將錯誤訊息顯示出來，而不是寫死的回覆
      console.error('chat error', err);
      
      // 顯示錯誤訊息。如果是我們自己拋出的 Error，err.message 就是後端回傳的 reply 內容
      const errorText = err.message || '服務暫時無法使用，請檢查網路。';
      
      addMessage({ id: Date.now() + 2, role: 'assistant', text: errorText });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clear = () => {
    setMessages([]);
    localStorage.removeItem('ai_chat_messages_v2');
  };

  // Styles: semi-transparent glass, dark theme to match your site
  const styles = {
    floatBtn: {
      position: 'fixed',
      left: 20,
      bottom: 20,
      zIndex: 2147483647,
      width: 64,
      height: 64,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
      cursor: 'pointer',
      border: '2px solid rgba(255,255,255,0.06)',
      background: 'linear-gradient(135deg, rgba(255,122,122,1), rgba(255,181,122,1))',
      color: 'white',
      fontSize: 26,
    },
    panel: {
      position: 'fixed',
      left: 20,
      bottom: 100,
      width: 360,
      maxWidth: 'calc(100vw - 40px)',
      height: 520,
      zIndex: 2147483647,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5e0c3', // 浅咖啡色
      backdropFilter: 'blur(8px) saturate(120%)',
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
      color: '#3a2f2f' // 深咖啡色文字
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        background: '#d2a679' // 和諧咖啡色標題
    },
    title: { fontWeight: 700, fontSize: 15, color: '#2e1f1f' }, // 文字稍深，清楚
    personaSelect: { 
        marginLeft: 'auto', 
        padding: '6px 8px', 
        borderRadius: 8, 
        background: 'rgba(50,35,25,0.25)', 
        color: '#2e1f1f', 
        border: '1px solid rgba(0,0,0,0.1)' 
    },
    list: { 
        padding: 12, 
        flex: 1, 
        overflowY: 'auto', 
        background: 'linear-gradient(180deg, rgba(50,35,25,0.05), transparent)' 
    },
    userBubble: { 
        marginLeft: 'auto', 
        background: 'linear-gradient(180deg,#e3c5a1,#f5e0c3)', 
        color: '#3a2f2f', 
        padding: '8px 12px', 
        borderRadius: 12, 
        maxWidth: '78%' 
    },
    botBubble: { 
        marginRight: 'auto', 
        background: 'linear-gradient(180deg,#f3e1c9,#f5e0c3)', 
        color: '#3a2f2f', 
        padding: '8px 12px', 
        borderRadius: 12, 
        maxWidth: '78%', 
        border: '1px solid rgba(0,0,0,0.05)' 
    },
    inputWrap: { 
        padding: 12, 
        borderTop: '1px solid rgba(0,0,0,0.1)', 
        display: 'flex', 
        gap: 8, 
        alignItems: 'flex-end', 
        background: 'linear-gradient(180deg, rgba(245,224,195,0.15), rgba(245,224,195,0))' 
    },
    textarea: { 
        flex: 1, 
        minHeight: 44, 
        maxHeight: 120, 
        resize: 'none', 
        padding: 10, 
        borderRadius: 8, 
        border: '1px solid rgba(0,0,0,0.1)', 
        background: 'rgba(255,255,255,0.6)', 
        color: '#3a2f2f' 
    },
    sendBtn: { 
        minWidth: 80, 
        padding: '8px 12px', 
        borderRadius: 8, 
        border: 'none', 
        background: 'linear-gradient(135deg,#d2a679,#e3c5a1)', 
        color: '#2e1f1f', 
        fontWeight: 700, 
        cursor: 'pointer' 
    },
    smallBtn: { 
        background: 'transparent', 
        border: '1px solid rgba(0,0,0,0.1)', 
        color: '#2e1f1f', 
        padding: '6px 8px', 
        borderRadius: 8, 
        cursor: 'pointer' 
    }
  }

  return (
    <>
      {/* Floating circular button */}
      <div
        role="button"
        aria-label="開啟聊天"
        style={styles.floatBtn}
        onClick={() => setOpen(o => !o)}
        title={open ? '關閉 AI 聊天' : '開啟 AI 聊天'}
      >
        💬
      </div>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.title}>AI 小幫手</div>
            <select style={styles.personaSelect} value={persona} onChange={e => setPersona(e.target.value)} aria-label="選擇聊天角色">
              {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <button style={{ ...styles.smallBtn, marginLeft: 8 }} onClick={clear} title="清除對話">清除</button>
            <button style={{ ...styles.smallBtn, marginLeft: 8 }} onClick={() => setOpen(false)} title="關閉">關閉</button>
          </div>

          <div style={styles.list} ref={listRef}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', marginTop: 40 }}>
                與 AI 小幫手聊天，選擇角色試試看！
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', marginBottom: 10, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={m.role === 'user' ? styles.userBubble : styles.botBubble}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: m.role === 'user' ? '#5a2' : 'rgba(255,255,255,0.45)', marginTop: 6, textAlign: m.role === 'user' ? 'right' : 'left' }}>{new Date(m.id).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.inputWrap}>
            <textarea
              placeholder="輸入訊息，Enter 送出，Shift+Enter 換行"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              style={styles.textarea}
              aria-label="聊天輸入"
            />
            <button onClick={send} style={styles.sendBtn} disabled={sending}>{sending ? '...' : '送出'}</button>
          </div>
        </div>
      )}
    </>
  );
}
