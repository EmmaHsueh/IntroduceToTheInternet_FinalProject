// src/pages/BoardsIndexPage.js
import React from 'react';
import Header from '../components/Header';
import BoardNav from '../components/BoardNav';

const BoardsIndexPage = () => (
    <>
        <Header />
        <main>
            <BoardNav />
            <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#666' }}>
                <p>請點選上方的分類按鈕，進入您感興趣的討論區。</p>
            </div>
        </main>
    </>
);

export default BoardsIndexPage;