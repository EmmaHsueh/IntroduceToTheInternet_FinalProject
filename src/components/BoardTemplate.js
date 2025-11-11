// src/components/BoardTemplate.js
import React from 'react';
import Header from './Header';
import BoardNav from './BoardNav';

// 模擬留言組件 (與 FoodBoardPage 中的相同)
const Comment = ({ comment }) => (
  <div style={{ display: 'flex', padding: '15px 0', borderBottom: '1px dashed #eee', alignItems: 'flex-start' }}>
    <div style={{ width: '40px', marginRight: '10px', flexShrink: 0 }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666' }}>
        {comment.authorName.charAt(0)}
      </div> 
    </div>
    <div style={{ flexGrow: 1 }}>
      <div style={{ fontWeight: 'bold', fontSize: 'small' }}>{comment.authorName}</div>
      <div style={{ fontSize: 'x-small', color: '#666', marginBottom: '5px' }}>
        <time>{comment.date}</time> 
        <span style={{ marginLeft: '10px' }}>| 編輯</span>
      </div>
      <p style={{ margin: '0 0 10px 0' }}>{comment.content}</p>
      <a href={`/reply/${comment.id}`} style={{ fontSize: 'small', color: 'blue' }}>回覆</a>
    </div>
  </div>
);

// 通用看板模板
const BoardTemplate = ({ boardName }) => {
    // 模擬該看板的文章和留言資料
    const mockComments = [
        { id: 1, authorName: `看板用戶-${boardName}-A`, date: '2025-11-08 14:00:00', content: `這是關於【${boardName}】看板的一條熱門討論留言。` },
        { id: 2, authorName: `看板用戶-${boardName}-B`, date: '2025-11-08 14:05:00', content: '希望這個看板的資訊對大家有幫助！' }, 
    ];

    return (
        <>
            <Header />
            <main style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px' }}>
                {/* 看板導覽列，讓用戶可以切換看板 */}
                <BoardNav />
                
                {/* 主要內容區塊 */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                    <h2 style={{ borderBottom: '2px solid orange', paddingBottom: '10px', marginTop: '0' }}>{boardName} 看板討論區</h2>
                    
                    {/* 發布新文章按鈕 */}
                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                         <button style={{ padding: '10px 20px', backgroundColor: 'purple', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            + 發表新貼文
                        </button>
                    </div>

                    {/* 留言列表 */}
                    <div className="comments-list" style={{ marginTop: '20px' }}>
                        {mockComments.map(comment => <Comment key={comment.id} comment={comment} />)}
                    </div>

                    {/* 留言表單 */}
                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
                        <h3 style={{ marginBottom: '15px' }}>發表你的看法</h3>
                        <textarea 
                            placeholder={`在【${boardName}】看板留下您的評論...`}
                            style={{ width: '100%', height: '100px', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <button style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
                            送出留言
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default BoardTemplate;