export const css=`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;800&display=swap');
#okila{position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#0a0e0f;color:#e6efee;font:15px/1.8 Vazirmatn,Tahoma,system-ui,sans-serif;--a:#2dd4c4;--l:rgba(255,255,255,.1);--g:rgba(255,255,255,.045)}
#okila *{box-sizing:border-box}#okila a{color:var(--a);text-decoration:none}
#okila .top{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;padding:.7rem 1.2rem;background:rgba(10,14,15,.82);backdrop-filter:blur(14px);border-bottom:1px solid var(--l)}
#okila .brand{display:flex;gap:.6rem;align-items:center;font-weight:800;margin-inline-end:auto}
#okila .brand small{display:block;font-weight:400;color:#8aa09e;font-size:.72rem;line-height:1.2}
#okila nav{display:flex;gap:.3rem}
#okila button,#okila select,#okila input{font:inherit;color:inherit}
#okila .b{background:var(--g);border:1px solid var(--l);border-radius:10px;padding:.35rem .9rem;cursor:pointer;transition:border-color .15s,background .15s}
#okila .b:hover:not(:disabled){border-color:var(--a)}#okila .b:disabled{opacity:.4;cursor:not-allowed}
#okila .on{background:rgba(45,212,196,.16);border-color:var(--a)}
#okila .pri{background:var(--a);color:#04201d;border-color:var(--a);font-weight:700}
#okila .dng{background:#e5534b;border-color:#e5534b;color:#fff;font-weight:700}
#okila main{max-width:1100px;margin:auto;padding:1.2rem}
#okila .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.8rem;margin:1rem 0}
#okila .card{background:var(--g);border:1px solid var(--l);border-radius:14px;padding:1rem;backdrop-filter:blur(8px)}
#okila .card b{display:block;font-size:1.8rem;font-weight:800;color:var(--a);line-height:1.3}
#okila .muted{color:#8aa09e;font-size:.85rem}#okila .bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.8rem 0}
#okila input[type=text],#okila input[type=number],#okila select{background:#121819;border:1px solid var(--l);border-radius:10px;padding:.35rem .7rem}
#okila .row{display:flex;gap:.8rem;align-items:center;padding:.55rem .8rem;margin:.35rem 0;border:1px solid var(--l);border-radius:12px;background:var(--g)}
#okila .row img{width:44px;height:44px;border-radius:12px;object-fit:cover}#okila .row .n{flex:1;min-width:0}
#okila .tag{font-size:.72rem;border:1px solid var(--l);border-radius:99px;padding:0 .5rem;margin-inline-start:.3rem;color:#8aa09e}
#okila .msg{padding:.6rem .9rem;border-radius:12px;border:1px solid rgba(45,212,196,.35);background:rgba(45,212,196,.08);margin:.6rem 0}
#okila .warn{border-color:rgba(229,170,60,.4);background:rgba(229,170,60,.08);color:#f0cf8a}
#okila .dot{display:inline-block;width:.6rem;height:.6rem;border-radius:50%;margin-inline-end:.4rem;background:#e5534b}#okila .dot.ok{background:var(--a)}
#okila .spark{width:100%;height:90px}#okila footer{text-align:center;padding:2rem 1rem;color:#8aa09e;font-size:.85rem}
#okila table{width:100%;border-collapse:collapse}#okila td,#okila th{padding:.35rem .5rem;border-bottom:1px solid var(--l);text-align:start}
#okila button:focus-visible,#okila input:focus-visible,#okila select:focus-visible{outline:2px solid var(--a);outline-offset:2px}
@media(max-width:600px){#okila .top{padding:.6rem}#okila main{padding:.8rem}}`;
