// src/pages/MemberPage.js
import React from 'react';
import Header from '../components/Header';
import MemberDirectory from '../components/MemberDirectory';

const MemberPage = () => {
    return (
        <>
            <Header />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
                <MemberDirectory />
            </main>
        </>
    );
};

export default MemberPage;