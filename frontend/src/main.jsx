import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

console.log('GLOVA: main.jsx loading...');
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter basename="/Globar">
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
  console.log('GLOVA: App rendered successfully');
} catch (error) {
  console.error('GLOVA Render Error:', error);
  alert('GLOVA 실행 중 에러 발생: ' + error.message);
}
