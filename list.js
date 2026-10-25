"use strict";
const $=s=>document.querySelector(s);
const DICT={
  en:{title:"Maps List to JSON",h1:"Maps list",sub:"Turn a shared Google Maps list into a Google Takeout style “Saved Places.json”. Everything runs in your browser; nothing is uploaded.",
    s1:"1. Add the bookmarklet (once)",s1d:"Drag this button to your bookmarks bar. If dragging is not possible, copy it and paste it as the URL of a new bookmark.",
    bm:"Maps list → JSON",copyBm:"Copy bookmarklet",s2:"2. Open your list and click it",
    s2d:"Open the list link (google.com/maps/placelists/list/… or a maps.app.goo.gl link that opens it) in Google Maps, then click the bookmark. This page opens with the list converted.",
    s3:"Or paste the raw list response",convert:"Convert",dl:"Download JSON",copy:"Copy JSON",back:"Transit route to KML",
    note:"Not affiliated with Google. The list endpoint is unofficial and may change; saved dates are not available, so the export time is used.",
    "raw.ph":"Paste the getlist response here","lang.group":"Language",
    waiting:"Waiting for the bookmarklet…",done:"{n} places converted.",copied:"Copied.",
    "err.empty":"Nothing to convert.","err.parse":"That is not a Google Maps list response.","err.none":"No places found in that response."},
  "zh-TW":{title:"地圖清單轉 JSON",h1:"地圖清單",sub:"將共用的 Google 地圖清單轉成 Google Takeout 格式的「Saved Places.json」。所有處理都在你的瀏覽器中進行，不會上傳任何資料。",
    s1:"1. 加入書籤小工具（只需一次）",s1d:"將此按鈕拖曳到書籤列。若無法拖曳，請複製後貼到新書籤的網址欄。",
    bm:"地圖清單 → JSON",copyBm:"複製書籤小工具",s2:"2. 開啟清單並點選書籤",
    s2d:"在 Google 地圖開啟清單連結（google.com/maps/placelists/list/…，或可開啟清單的 maps.app.goo.gl 連結），然後點選書籤。本頁會開啟並顯示轉換後的清單。",
    s3:"或貼上清單的原始回應",convert:"轉換",dl:"下載 JSON",copy:"複製 JSON",back:"大眾運輸路線轉 KML",
    note:"與 Google 無關。清單端點並非官方提供，可能隨時變更；無法取得儲存日期，因此使用匯出時間。",
    "raw.ph":"在此貼上 getlist 回應","lang.group":"語言",
    waiting:"等待書籤小工具傳送資料…",done:"已轉換 {n} 個地點。",copied:"已複製。",
    "err.empty":"沒有可轉換的內容。","err.parse":"這不是 Google 地圖清單的回應。","err.none":"回應中找不到任何地點。"}
};
let lang="en", statusKey=null, statusN=0, statusErr=false, result=null;
const tr=(k,p)=>{ const s=(DICT[lang][k]!=null?DICT[lang][k]:DICT.en[k]!=null?DICT.en[k]:k); return s.replace(/\{(\w+)\}/g,(_,x)=>p&&p[x]!=null?p[x]:""); };

function setStatus(key,n,err){ statusKey=key; statusN=n||0; statusErr=!!err; renderStatus(); }
function renderStatus(){ const el=$("#status"); el.textContent=statusKey?tr(statusKey,{n:statusN}):""; el.classList.toggle("err",statusErr); }

/* ---------- bookmarklet ---------- */
// Runs on google.com/maps: reads the list through Google's own same-origin endpoint, then hands the raw
// response to this page. The pb parameters mirror what the list page requests (undocumented, may change).
function bookmarkletSource(){
  const url=location.origin+location.pathname;
  return "javascript:"+encodeURI("("+function(A,U){
    (async function(){
      try{
        var m=location.pathname.match(/placelists\/list\/([^\/?#]+)/);
        if(!m){ alert("Open a Google Maps list (…/maps/placelists/list/…) first."); return; }
        var r=await fetch("/maps/preview/entitylist/getlist?authuser=0&hl=en&pb=!1m4!1s"+m[1]+"!2e1!3m1!1e1!2e2!3e2!4i500",{credentials:"include"});
        if(!r.ok) throw new Error("HTTP "+r.status);
        var raw=await r.text(), w=window.open(U);
        if(!w){ alert("Allow pop-ups for this site and try again."); return; }
        var h=function(e){ if(e.source===w&&e.data==="gmaps-list-ready"){ w.postMessage({type:"gmaps-list",raw:raw},A); removeEventListener("message",h); } };
        addEventListener("message",h);
      }catch(x){ alert("Could not read the list: "+x.message); }
    })();
  }.toString()+")("+JSON.stringify(location.origin)+","+JSON.stringify(url)+")");
}
function initBookmarklet(){
  const src=bookmarkletSource(), a=$("#bm");
  a.setAttribute("href",src);
  a.addEventListener("click",e=>e.preventDefault()); // clicking it here would only be blocked by the CSP
  $("#copyBm").addEventListener("click",()=>copyText(src));
}

/* ---------- conversion ---------- */
function show(text){
  let list;
  try{ list=ListParse.parse(text); }
  catch(e){ setStatus(e.message==="no-places"?"err.none":"err.parse",0,true); return; }
  result=ListParse.toTakeout(list);
  const json=JSON.stringify(result,null,2);
  $("#out").textContent=json;
  $("#outTitle").textContent=list.name||"Saved Places.json";
  $("#outBox").hidden=false;
  setStatus("done",list.places.length,false);
}
$("#convert").addEventListener("click",()=>{
  const v=$("#raw").value.trim();
  if(!v){ setStatus("err.empty",0,true); return; }
  show(v);
});

window.addEventListener("message",e=>{
  if(!window.opener||e.source!==window.opener) return;
  if(!/^https:\/\/(www\.)?google\.[a-z.]+$/.test(e.origin)) return;
  const d=e.data;
  if(d&&d.type==="gmaps-list"&&typeof d.raw==="string") show(d.raw);
});
if(window.opener){ setStatus("waiting",0,false); try{ window.opener.postMessage("gmaps-list-ready","*"); }catch(_){} }

/* ---------- output ---------- */
function download(){
  if(!result) return;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:"application/json"}));
  a.download="Saved Places.json"; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function copyText(s){
  try{ await navigator.clipboard.writeText(s); setStatus("copied",0,false); }
  catch(_){ const ta=document.createElement("textarea"); ta.value=s; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); setStatus("copied",0,false); }catch(__){} ta.remove(); }
}
$("#dl").addEventListener("click",download);
$("#copy").addEventListener("click",()=>{ if(result) copyText(JSON.stringify(result,null,2)); });

/* ---------- language ---------- */
function detectLang(){
  try{ const s=localStorage.getItem("lang"); if(DICT[s]) return s; }catch(_){}
  return /^zh/i.test(navigator.language||"")?"zh-TW":"en";
}
function applyLang(next,persist){
  lang=DICT[next]?next:"en";
  document.documentElement.lang=lang; document.title=tr("title");
  document.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent=tr(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.setAttribute("placeholder",tr(el.dataset.i18nPlaceholder)));
  document.querySelectorAll("[data-i18n-aria-label]").forEach(el=>el.setAttribute("aria-label",tr(el.dataset.i18nAriaLabel)));
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===lang)));
  renderStatus();
  if(persist){ try{ localStorage.setItem("lang",lang); }catch(_){} }
}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang,true)));
applyLang(detectLang(),false);
initBookmarklet();
