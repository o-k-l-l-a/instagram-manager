import {render} from 'preact';
import {App} from './App';
import {css} from './style';
if(!/(^|\.)instagram\.com$/.test(location.hostname)){alert('این ابزار فقط روی instagram.com اجرا می‌شود.\nThis tool only runs on instagram.com.')}
else{document.getElementById('okila')?.remove();
  const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  const r=document.createElement('div');r.id='okila';document.body.appendChild(r);render(<App/>,r)}
