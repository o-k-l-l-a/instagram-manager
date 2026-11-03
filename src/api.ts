export type U={id:string;username:string;full_name:string;pic:string;priv:boolean;ver:boolean};
const ck=(n:string)=>document.cookie.split('; ').find(c=>c.startsWith(n+'='))?.split('=')[1]??null;
export const hasSession=()=>!!ck('ds_user_id');
export const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export class ApiErr extends Error{constructor(public status:number){super('HTTP '+status)}}
const H=()=>({'X-IG-App-ID':'936619743392459','X-Requested-With':'XMLHttpRequest','X-CSRFToken':ck('csrftoken')||''});
const map=(u:any):U=>({id:String(u.pk_id??u.pk),username:u.username,full_name:u.full_name||'',pic:u.profile_pic_url,priv:!!u.is_private,ver:!!u.is_verified});
export async function fetchAll(kind:'followers'|'following',onCount:(n:number)=>void,wait:()=>Promise<void>,ctl:{stop:boolean}){
  const out:U[]=[];let max:string|undefined;
  for(let i=0;i<250&&!ctl.stop;i++){
    const r=await fetch(`https://www.instagram.com/api/v1/friendships/${ck('ds_user_id')}/${kind}/?count=50`+(max?`&max_id=${encodeURIComponent(max)}`:''),{credentials:'same-origin',headers:H()});
    if(!r.ok)throw new ApiErr(r.status);
    const d=await r.json();const us=(d.users||[]).map(map);out.push(...us);onCount(out.length);
    if(!d.next_max_id||d.has_more===false||!us.length)return{users:out,complete:true};
    max=d.next_max_id;await wait();
  }
  return{users:out,complete:false};
}
/** غیررسمی: ممکن است هر زمان تغییر کند. */
export async function unfollow(u:U):Promise<'ok'|'fail'|'blocked'>{
  const r=await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${u.id}/`,{method:'POST',credentials:'same-origin',headers:{...H(),'Content-Type':'application/x-www-form-urlencoded'},body:''});
  const txt=r.ok?'':await r.text().catch(()=>'');
  if(r.status===429||/feedback_required|checkpoint|action_blocked/i.test(txt))return'blocked';
  return r.ok?'ok':'fail';
}
