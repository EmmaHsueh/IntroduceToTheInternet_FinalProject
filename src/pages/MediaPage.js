// src/pages/MediaPage.js
import React from 'react';
import Header from '../components/Header';
import MediaDisplay from '../components/MediaDisplay';

const MediaPage = () => {
    return (
        <>
            <Header />
            <main>
                <MediaDisplay />
            </main>
        </>
    );
};

export default MediaPage;