const k=(n:string)=>'okila_'+n;
export function load<T>(n:string,d:T):T{try{const v=localStorage.getItem(k(n));return v?JSON.parse(v):d}catch{return d}}
export function save(n:string,v:unknown){try{localStorage.setItem(k(n),JSON.stringify(v))}catch{}}
export function wipe(){Object.keys(localStorage).filter(x=>x.startsWith('okila_')).forEach(x=>localStorage.removeItem(x))}
