import React from 'react';

// same path as public/index.html uses so we don't get flicker
const logoPath = '/eg-logo.png';

// this is the react component duplication of the static loading page in public/index.html
// NOTE that it assumes the inline css from there exists
export const FullPageMessage: React.FC = ({ children }) => (
    <div className="loading-container">
        <div className="loading-image-container">
            <img className="loading-image" src={logoPath} alt="Logo" />
        </div>
        <div className="loading-text">{children}</div>
    </div>
);
