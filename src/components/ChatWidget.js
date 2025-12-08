// src/components/ChatWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { listenToChatMessages, sendChatMessage } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

// 統一配色定義
const COLOR_DEEP_NAVY = '#1e2a38';
const COLOR_OLIVE_GREEN = '#454f3b';
const COLOR_MORANDI_BROWN = '#a38c6b';
const COLOR_OFF_WHITE = '#f3f3e6';
const COLOR_BACKGROUND_LIGHT = '#ffffff';
const COLOR_BORDER = '#dddddd';
const COLOR_SECONDARY_TEXT = '#666666';

const ChatWidget = ({ onClose, boardName }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // 取得當前用戶資訊
    const { currentUser, userProfile } = useAuth();

    // 監聽聊天訊息
    useEffect(() => {
        console.log('💬 ChatWidget: 開始監聽【' + boardName + '】聊天室');

        const unsubscribe = listenToChatMessages(boardName, (newMessages) => {
            console.log('✅ ChatWidget: 收到 ' + newMessages.length + ' 則訊息');
            setMessages(newMessages);
            setLoading(false);
        });

        // 清理函數：組件卸載時停止監聽
        return () => {
            console.log('🔌 ChatWidget: 停止監聽【' + boardName + '】聊天室');
            unsubscribe();
        };
    }, [boardName]);

    // 自動滾動到最新訊息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 發送訊息
    const handleSend = async () => {
        if (!input.trim()) return;

        // 檢查是否已登入
        if (!currentUser) {
            alert('⚠️ 請先登入才能發送訊息！');
            return;
        }

        const messageContent = input.trim();
        setInput(''); // 立即清空輸入框
        setSending(true);

        try {
            await sendChatMessage({
                boardName,
                sender: userProfile?.nickname || currentUser.email.split('@')[0] || '匿名用戶',
                senderId: currentUser.uid,
                content: messageContent
            });

            console.log('✅ 訊息已發送');
        } catch (error) {
            console.error('❌ 發送訊息失敗:', error);
            alert('發送失敗：' + error.message);
            setInput(messageContent); // 發送失敗時恢復輸入內容
        } finally {
            setSending(false);
        }
    };

    // 處理 Enter 鍵發送
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const CHAT_BUTTON_STYLE = {
        padding: '8px 15px',
        backgroundColor: COLOR_MORANDI_BROWN,
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
        opacity: sending ? 0.6 : 1,
        pointerEvents: sending ? 'none' : 'auto'
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '300px',
            height: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLOR_BACKGROUND_LIGHT
        }}>
            {/* 標題欄 */}
            <div style={{
                padding: '12px 15px',
                backgroundColor: COLOR_MORANDI_BROWN,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
            }}>
                <div style={{ fontWeight: 'bold' }}>💬 {boardName} 即時聊天室</div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.4em',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        opacity: 0.9
                    }}
                >&times;</button>
            </div>

            {/* 訊息區 */}
            <div style={{
                flexGrow: 1,
                padding: '10px 15px',
                overflowY: 'auto',
                backgroundColor: COLOR_OFF_WHITE,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        color: COLOR_SECONDARY_TEXT,
                        padding: '20px',
                        fontSize: 'small'
                    }}>
                        載入訊息中...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: COLOR_SECONDARY_TEXT,
                        padding: '20px',
                        fontSize: 'small'
                    }}>
                        目前沒有訊息，開始聊天吧！
                    </div>
                ) : (
                    messages.map((msg) => {
                        // 判斷是否為當前用戶發送的訊息
                        const isCurrentUser = currentUser && msg.senderId === currentUser.uid;

                        return (
                            <div
                                key={msg.id}
                                style={{
                                    margin: '5px 0',
                                    fontSize: 'small',
                                    textAlign: isCurrentUser ? 'right' : 'left'
                                }}
                            >
                                {/* 顯示發送者名稱（如果不是當前用戶） */}
                                {!isCurrentUser && (
                                    <div style={{
                                        fontSize: 'x-small',
                                        color: COLOR_SECONDARY_TEXT,
                                        marginBottom: '2px'
                                    }}>
                                        {msg.sender}
                                    </div>
                                )}

                                {/* 訊息氣泡 */}
                                <span style={{
                                    padding: '8px 12px',
                                    borderRadius: '18px',
                                    backgroundColor: isCurrentUser ? COLOR_MORANDI_BROWN : COLOR_BORDER,
                                    color: isCurrentUser ? 'white' : COLOR_DEEP_NAVY,
                                    display: 'inline-block',
                                    maxWidth: '80%',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    wordWrap: 'break-word'
                                }}>
                                    {msg.content}
                                </span>

                                {/* 顯示時間 */}
                                <div style={{
                                    fontSize: 'x-small',
                                    color: COLOR_SECONDARY_TEXT,
                                    marginTop: '2px'
                                }}>
                                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString('zh-TW', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
                {/* 用於自動滾動的參考點 */}
                <div ref={messagesEndRef} />
            </div>

            {/* 輸入區 */}
            <div style={{
                padding: '12px 15px',
                borderTop: `1px solid ${COLOR_BORDER}`,
                display: 'flex',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                backgroundColor: COLOR_BACKGROUND_LIGHT
            }}>
                <input
                    type="text"
                    placeholder={currentUser ? "輸入訊息..." : "請先登入"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!currentUser || sending}
                    style={{
                        flexGrow: 1,
                        padding: '10px',
                        border: `1px solid ${COLOR_BORDER}`,
                        borderRadius: '6px',
                        marginRight: '10px',
                        outline: 'none',
                        opacity: (!currentUser || sending) ? 0.6 : 1
                    }}
                />
                <button
                    onClick={handleSend}
                    style={CHAT_BUTTON_STYLE}
                    disabled={!currentUser || sending || !input.trim()}
                    onMouseOver={e => {
                        if (!sending && currentUser) {
                            e.currentTarget.style.backgroundColor = COLOR_OLIVE_GREEN;
                        }
                    }}
                    onMouseOut={e => {
                        if (!sending && currentUser) {
                            e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
                        }
                    }}
                >
                    {sending ? '發送中...' : '發送'}
                </button>
            </div>
        </div>
    );
};

export default ChatWidget;
