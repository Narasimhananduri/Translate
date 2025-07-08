// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import TranslationWidget from './TranslationWidget'
import './custom.d.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <TranslationWidget />
  </React.StrictMode>
);
