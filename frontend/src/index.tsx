import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './App';
import './styles/App.css';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement); // Use createRoot
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}