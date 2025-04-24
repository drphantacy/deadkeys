import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
import App from './App';
import './styles/App.css';
import { LineraProvider } from './linera/LineraProvider';
import { HashRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement); // Use createRoot
    root.render(
        <React.StrictMode>
            <LineraProvider>
                <HashRouter>
                    <App />
                </HashRouter>
            </LineraProvider>
        </React.StrictMode>
    );
}