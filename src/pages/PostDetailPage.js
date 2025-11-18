// src/pages/PostDetailPage.js
import React, { useState } from 'react';
// 這裡假設 Comment 組件已在 BoardTemplate.js 或其他地方正確定義並傳入

// 統一配色定義 (略)
const COLOR_DEEP_NAVY = '#1e2a38'; 	 
const COLOR_MORANDI_BROWN = '#a38c6b'; 
const COLOR_BRICK_RED = '#c9362a'; 	 
const COLOR_OFF_WHITE = '#f3f3e6'; 	 
const COLOR_SECONDARY_TEXT = '#666666'; 
const COLOR_BACKGROUND_LIGHT = '#ffffff';
const COLOR_BORDER = '#dddddd';
const COLOR_HIGHLIGHT_LINE = COLOR_MORANDI_BROWN; 

// 這裡假設 Comment 組件可以被 PostDetailPage 訪問，如果不行，需要將其定義從 BoardTemplate.js 移出或傳入
const Comment = ({ comment }) => (
	<div style={{ display: 'flex', padding: '15px 0', borderBottom: `1px dashed ${COLOR_BORDER}`, alignItems: 'flex-start' }}>
		{/* ... (Comment JSX 內容) ... */}
		{/* 頭像 */}
		<div style={{ width: '40px', marginRight: '15px', flexShrink: 0 }}>
			<div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: COLOR_BORDER, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLOR_SECONDARY_TEXT, fontWeight: 'bold' }}>
				{comment.authorName ? comment.authorName.charAt(0) : 'U'}
			</div>
		</div>
		{/* 內容 */}
		<div style={{ flexGrow: 1 }}>
			<div style={{ fontWeight: '600', fontSize: 'small', color: COLOR_DEEP_NAVY }}>{comment.authorName || '匿名用戶'}</div>
			<div style={{ fontSize: 'x-small', color: COLOR_SECONDARY_TEXT, marginBottom: '5px' }}>
				<time>{comment.date}</time>
			</div>
			<p style={{ margin: '0 0 10px 0', color: COLOR_DEEP_NAVY }}>{comment.content}</p>
		</div>
	</div>
);


const PostDetailPage = ({ post, onBack, onAddComment }) => {
	const [commentContent, setCommentContent] = useState('');
	
	const handleCommentSubmit = (e) => {
		e.preventDefault();
		if (commentContent.trim()) {
			// 由於 BoardTemplate.js 中的 Comment 組件沒有 authorName，我們在這裡為模擬數據添加一個
			// 註：實際應用中，authorName 應該來自當前登入的使用者資訊
			onAddComment(post.id, commentContent, "當前用戶(您)"); 
			setCommentContent('');
		} else {
			// 🏆 修正: 替換 alert 為 console.error 或忽略，因為 alert 不會在 Immersive 環境中顯示
			console.error('留言內容不能為空！'); 
		}
	};

	const BACK_BUTTON_STYLE = {
		padding: '10px 20px',
		marginBottom: '25px', // 增加一點間距
		backgroundColor: COLOR_OFF_WHITE,
		color: COLOR_DEEP_NAVY,
		border: `1px solid ${COLOR_BORDER}`,
		borderRadius: '6px',
		cursor: 'pointer',
		fontWeight: '600',
		transition: 'all 0.3s',
		boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
	};

	const COMMENT_BUTTON_STYLE = {
		padding: '10px 20px',
		backgroundColor: COLOR_BRICK_RED,
		color: 'white',
		border: 'none',
		borderRadius: '6px',
		cursor: 'pointer',
		marginTop: '10px',
		fontWeight: 'bold',
		transition: 'background-color 0.3s'
	};
	const TEXTAREA_STYLE = {
		width: '100%',
		height: '100px',
		padding: '12px',
		boxSizing: 'border-box',
		border: `1px solid ${COLOR_BORDER}`,
		borderRadius: '6px',
		resize: 'vertical',
		marginBottom: '10px', 
		fontSize: '14px',
		lineHeight: '1.5',
		outline: 'none',
		transition: 'border-color 0.3s'
	};
	
	return (
		<div style={{ margin: "40px auto", padding: "0 20px", maxWidth: "900px" }}>
			{/* 新增返回文章列表按鈕 */}
			<button 
				onClick={onBack}
				style={BACK_BUTTON_STYLE}
				onMouseOver={e => {
					e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN;
					e.currentTarget.style.color = 'white';
				}}
				onMouseOut={e => {
					e.currentTarget.style.backgroundColor = COLOR_OFF_WHITE;
					e.currentTarget.style.color = COLOR_DEEP_NAVY;
				}}
			>
				← 返回文章列表
			</button>

			{/* 文章內容 */}
			<div style={{ marginBottom: '30px', padding: '20px', backgroundColor: COLOR_BACKGROUND_LIGHT, border: `1px solid ${COLOR_BORDER}`, borderRadius: '8px' }}>
				<h1 style={{ 
					marginTop: '0', 
					borderBottom: `2px solid ${COLOR_HIGHLIGHT_LINE}`, 
					paddingBottom: '10px',
					color: COLOR_DEEP_NAVY,
					fontWeight: '500'
				}}>
					{post.title}
				</h1>
				<div style={{ fontSize: 'small', color: COLOR_SECONDARY_TEXT, marginBottom: '20px' }}>
					作者: **{post.author}** | 發表於: {post.date}
				</div>
				
				{/* 顯示貼文所有圖片 */}
				{post.imageUrls && post.imageUrls.length > 0 && (
					<div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
						{post.imageUrls.map((url, index) => (
							<img 
								key={index}
								src={url} 
								alt={`貼文圖片 ${index + 1}`} 
								style={{ 
									maxWidth: '100%', 
									maxHeight: '300px', 
									width: 'auto', 
									height: 'auto', 
									objectFit: 'contain', 
									borderRadius: '8px', 
									border: `1px solid ${COLOR_BORDER}` 
								}}
							/>
						))}
					</div>
				)}
				
				<p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: COLOR_DEEP_NAVY }}>{post.content}</p>
			</div>

			{/* 留言列表... */}
			<h3 style={{ 
				borderBottom: `1px solid ${COLOR_HIGHLIGHT_LINE}`, 
				paddingBottom: '5px', 
				marginBottom: '15px',
				color: COLOR_DEEP_NAVY
			}}>
				留言 ({post.comments ? post.comments.length : 0})
			</h3>
			<div style={{ marginBottom: '30px' }}>
				{post.comments?.length > 0 ? (
					// 留言反轉排序，讓最新留言在最上方
					post.comments.slice().reverse().map(comment => (
						<Comment key={comment.id} comment={comment} /> 
					))
				) : (
					<div style={{ textAlign: 'center', color: COLOR_SECONDARY_TEXT, padding: '20px', backgroundColor: COLOR_OFF_WHITE, borderRadius: '8px' }}>
						這篇文章還沒有人留言，快來搶沙發吧！
					</div>
				)}
			</div>

			{/* 留言表單 */}
			<div style={{ paddingTop: '20px', borderTop: `1px solid ${COLOR_BORDER}` }}>
				<h3 style={{ marginBottom: '15px', color: COLOR_DEEP_NAVY }}>發表你的評論</h3>
				<form 
					onSubmit={handleCommentSubmit}
					// 使用 flexbox 使 textarea 和按鈕可以堆疊，並讓按鈕靠右
					style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} 
				>
					<textarea 
						value={commentContent}
						onChange={(e) => setCommentContent(e.target.value)}
						placeholder="留下您的評論..."
						style={{ ...TEXTAREA_STYLE, marginBottom: '0' }} // 讓 textarea 充滿父層寬度
					/>
					<button 
						type="submit"
						style={COMMENT_BUTTON_STYLE}
						onMouseOver={e => e.currentTarget.style.backgroundColor = COLOR_MORANDI_BROWN}
						onMouseOut={e => e.currentTarget.style.backgroundColor = COLOR_BRICK_RED}
					>
						送出留言
					</button>
				</form>
			</div>
		</div>
	);
};
export default PostDetailPage;