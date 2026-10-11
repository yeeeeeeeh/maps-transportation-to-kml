"use strict";
const API = "https://api.transitous.org/api";
const MODE_COLORS = {WALK:"#7a8599",BUS:"#c2410c",COACH:"#9a3412",TRAM:"#b91c1c",SUBWAY:"#1d4ed8",METRO:"#1d4ed8",
  SUBURBAN:"#047857",REGIONAL_RAIL:"#1e40af",REGIONAL_FAST_RAIL:"#1e40af",LONG_DISTANCE:"#4338ca",HIGHSPEED_RAIL:"#7c3aed",
  NIGHT_RAIL:"#312e81",RAIL:"#1e40af",FERRY:"#0e7490",AIRPLANE:"#475569",FUNICULAR:"#a16207",AERIAL_LIFT:"#a16207",
  BIKE:"#15803d",CAR:"#374151",OTHER:"#6b7280"};
/* ---------- i18n ---------- */
// All user-visible text lives here. KML output stays English (see EN) and API-supplied names are never translated.
const DICT = {
  en: {
    "title":"Transit Route to KML",
    "desc":"Plan a public transport trip, or paste a Google Maps directions link, and download the route as KML.",
    "h1":"Transit",
    "sub":"Plan a public transport trip, then save it as a KML file for Google Earth, My Maps, OsmAnd or any GIS tool.",
    "lang.group":"Language","lang.en":"English","lang.zh-TW":"繁體中文",
    "gmaps.label":"Google Maps link","gmaps.ph":"Paste a google.com/maps/dir/… link","gmaps.go":"Use",
    "gmaps.hint":"Start, destination and time are read from the link, then the same trip is planned here.",
    "gmaps.read":"Read the link. Planning the same trip…",
    "from":"From","to":"To","place.ph":"Station, stop, address or lat,lon",
    "pick.map":"Map","pick.fromTitle":"Click the map to set the start","pick.toTitle":"Click the map to set the destination",
    "time":"Time","means":"Means","depart":"Depart","arrive":"Arrive by","swap":"Swap ⇅","go":"Find trips",
    "export":"Export","opt.walk":"Include walking legs","opt.stops":"Boarding and alighting stops","opt.inter":"Intermediate stops",
    "dl.one":"Download selected","dl.all":"All options",
    "foot.by":"Routing and geocoding by","foot.sources":"data sources","foot.map":"Map ©","foot.contrib":"contributors",
    "foot.source":"Source code and contact","dot":".",
    "zoom.in":"Zoom in","zoom.out":"Zoom out",
    "tip.from":"From: ","tip.to":"To: ",
    "st.pickFrom":"Click the map to set the start.","st.pickTo":"Click the map to set the destination.",
    "st.placeFail":"Place search failed: {err}",
    "st.needBoth":"Pick a start and a destination from the suggestions, or use Map.",
    "st.searching":"Searching…","st.none":"No trips found for that time. Try another time or nearby stops.",
    "st.opts.one":"{n} option. Pick one to preview, then download.","st.opts.other":"{n} options. Pick one to preview, then download.",
    "st.fail":"Search failed: {err}","st.failNet":"Search failed: {err} (network or browser blocked the request)",
    "st.reading":"Reading the link…","st.saved":"Saved {fn}","st.kmlFail":"Couldn't build the KML file: {err}","st.raw":"{err}",
    "note.notTransit":"The link is for driving, walking or cycling. Planning it by public transport instead.",
    "note.via":"Stops along the way in the link are skipped.",
    "note.noTime":"The link has no time (Google leaves it out for \"leave now\"), so the time below is used.",
    "err.invalid":"That isn't a valid link.",
    "err.short":"Short links (maps.app.goo.gl) can't be opened from this page. Open the link in a browser, then copy the long google.com/maps/dir/… address it turns into.",
    "err.notGoogle":"That isn't a Google Maps link.",
    "err.place":"This link is for a place, not directions. Open directions in Google Maps and copy that link.",
    "err.points":"Couldn't find both a start and a destination in that link. If the start is \"Your location\", pick it on the map instead.",
    "err.notFound":"Couldn't find \"{name}\".","err.coord":"Bad coordinate in route data.",
    "kind.STOP":"Stop","kind.ADDRESS":"Address","kind.PLACE":"Place",
    "transfers.one":"{n} transfer","transfers.other":"{n} transfers",
    "dur.m":"{m} min","dur.hm":"{h} h {m} min",
    "leg.walkTo":"{mode} to {to}","leg.fromTo":"{from} to {to}","leg.plat":" (pl. {p})",
    "mode.WALK":"Walk","mode.BUS":"Bus","mode.COACH":"Coach","mode.TRAM":"Tram","mode.SUBWAY":"Metro","mode.METRO":"Metro",
    "mode.SUBURBAN":"Suburban rail","mode.REGIONAL_RAIL":"Train","mode.REGIONAL_FAST_RAIL":"Train","mode.LONG_DISTANCE":"Intercity",
    "mode.HIGHSPEED_RAIL":"High-speed","mode.NIGHT_RAIL":"Night train","mode.RAIL":"Train","mode.FERRY":"Ferry","mode.AIRPLANE":"Flight",
    "mode.FUNICULAR":"Funicular","mode.AERIAL_LIFT":"Cable car","mode.BIKE":"Bike","mode.CAR":"Car","mode.OTHER":"Transit"
  },
  "zh-TW": {
    "title":"大眾運輸路線轉 KML",
    "desc":"規劃大眾運輸行程,或貼上 Google 地圖路線連結,並將路線下載為 KML。",
    "h1":"大眾運輸",
    "sub":"規劃大眾運輸行程,再儲存為 KML 檔案,可用於 Google Earth、My Maps、OsmAnd 或任何 GIS 工具。",
    "lang.group":"語言","lang.en":"English","lang.zh-TW":"繁體中文",
    "gmaps.label":"Google 地圖連結","gmaps.ph":"貼上 google.com/maps/dir/… 連結","gmaps.go":"使用",
    "gmaps.hint":"會從連結讀取起點、終點與時間,然後在這裡規劃相同的行程。",
    "gmaps.read":"已讀取連結,正在規劃相同的行程…",
    "from":"起點","to":"終點","place.ph":"車站、站牌、地址或 緯度,經度",
    "pick.map":"地圖","pick.fromTitle":"點選地圖以設定起點","pick.toTitle":"點選地圖以設定終點",
    "time":"時間","means":"類型","depart":"出發","arrive":"抵達時間","swap":"對調 ⇅","go":"搜尋路線",
    "export":"匯出","opt.walk":"包含步行路段","opt.stops":"上車與下車站點","opt.inter":"中途站點",
    "dl.one":"下載所選路線","dl.all":"所有選項",
    "foot.by":"路線規劃與地點搜尋:","foot.sources":"資料來源","foot.map":"地圖 ©","foot.contrib":"貢獻者",
    "foot.source":"原始碼與聯絡方式","dot":"。",
    "zoom.in":"放大","zoom.out":"縮小",
    "tip.from":"起點:","tip.to":"終點:",
    "st.pickFrom":"請在地圖上點選以設定起點。","st.pickTo":"請在地圖上點選以設定終點。",
    "st.placeFail":"地點搜尋失敗:{err}",
    "st.needBoth":"請從建議清單選擇起點與終點,或使用「地圖」。",
    "st.searching":"搜尋中…","st.none":"找不到該時間的行程。請改選其他時間或附近的站點。",
    "st.opts.one":"共 {n} 個選項。請選擇一個預覽,然後下載。","st.opts.other":"共 {n} 個選項。請選擇一個預覽,然後下載。",
    "st.fail":"搜尋失敗:{err}","st.failNet":"搜尋失敗:{err}(網路問題,或請求被瀏覽器封鎖)",
    "st.reading":"正在讀取連結…","st.saved":"已儲存 {fn}","st.kmlFail":"無法建立 KML 檔案:{err}","st.raw":"{err}",
    "note.notTransit":"此連結為開車、步行或騎車路線,改以大眾運輸規劃。",
    "note.via":"連結中的途經點已略過。",
    "note.noTime":"連結中沒有時間(Google 在「現在出發」時不會附上),因此使用下方的時間。",
    "err.invalid":"這不是有效的連結。",
    "err.short":"此頁面無法開啟短連結 (maps.app.goo.gl)。請在瀏覽器中開啟該連結,再複製轉換後的完整 google.com/maps/dir/… 網址。",
    "err.notGoogle":"這不是 Google 地圖連結。",
    "err.place":"此連結是地點而非路線。請在 Google 地圖開啟路線,再複製該連結。",
    "err.points":"在連結中找不到起點與終點。如果起點是「你的位置」,請改在地圖上選取。",
    "err.notFound":"找不到「{name}」。","err.coord":"路線資料中的座標有誤。",
    "kind.STOP":"站點","kind.ADDRESS":"地址","kind.PLACE":"地點",
    "transfers.one":"轉乘 {n} 次","transfers.other":"轉乘 {n} 次",
    "dur.m":"{m} 分鐘","dur.hm":"{h} 小時 {m} 分鐘",
    "leg.walkTo":"{mode}至 {to}","leg.fromTo":"{from} 至 {to}","leg.plat":"(月台 {p})",
    "mode.WALK":"步行","mode.BUS":"公車","mode.COACH":"客運","mode.TRAM":"電車","mode.SUBWAY":"捷運","mode.METRO":"捷運",
    "mode.SUBURBAN":"近郊鐵路","mode.REGIONAL_RAIL":"火車","mode.REGIONAL_FAST_RAIL":"火車","mode.LONG_DISTANCE":"城際列車",
    "mode.HIGHSPEED_RAIL":"高速鐵路","mode.NIGHT_RAIL":"夜間列車","mode.RAIL":"火車","mode.FERRY":"渡輪","mode.AIRPLANE":"航班",
    "mode.FUNICULAR":"纜索鐵路","mode.AERIAL_LIFT":"纜車","mode.BIKE":"自行車","mode.CAR":"汽車","mode.OTHER":"交通"
  }
};
const EN = "en";
let lang = EN;
const curStatus = {key:"", params:null, err:false};
let hintKeys = ["gmaps.hint"];

// An Error that carries a translation key, so its text follows the current language.
const fail=(key,params)=>Object.assign(new Error(DICT.en[key].replace(/\{(\w+)\}/g,(_,k)=>params&&params[k]!=null?params[k]:"")),{i18n:key,params});
const errText=e=>e&&e.i18n?t(e.i18n,e.params):(e&&e.message)||String(e);
function t(key,params,l){
  const d=DICT[l||lang]||DICT.en;
  const s=d[key]!=null?d[key]:DICT.en[key]!=null?DICT.en[key]:key;
  return s.replace(/\{(\w+)\}/g,(_,k)=>{ const v=params&&params[k]; return v instanceof Error?errText(v):v==null?"":v; });
}
const modeName=(m,l)=>DICT.en["mode."+m]?t("mode."+m,null,l):m;

function detectLang(){
  try{ const s=localStorage.getItem("lang"); if(DICT[s]) return s; }catch(_){}
  const n=String((typeof navigator!=="undefined"&&navigator.language)||"").toLowerCase();
  return n==="zh"||n.startsWith("zh-")?"zh-TW":EN;
}

const $ = s => document.querySelector(s);
const state = { from:null, to:null, itins:[], sel:0, picking:null };

/* ---------- map ---------- */
// Escapes text for HTML and XML (tooltips and KML).
const esc=s=>String(s??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]));
const hex6=v=>typeof v==="string"&&/^#?[0-9a-f]{6}$/i.test(v)?"#"+v.replace("#",""):null;
const num=v=>{const n=Number(v); if(!Number.isFinite(n)) throw fail("err.coord"); return n;};
const map = L.map("map",{zoomControl:true}).setView([50.5,6.5],6);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
const routeLayer = L.layerGroup().addTo(map);
const endpointLayer = L.layerGroup().addTo(map);

function drawEndpoints(){
  endpointLayer.clearLayers();
  for (const k of ["from","to"]) {
    const p = state[k]; if (!p) continue;
    L.circleMarker([p.lat,p.lon],{radius:8,weight:3,color:k==="from"?"#047857":"#b3261e",fillColor:"#fff",fillOpacity:1})
      .bindTooltip(esc(t(k==="from"?"tip.from":"tip.to")+p.name)).addTo(endpointLayer);
  }
}

document.querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{
  state.picking = b.dataset.pick; document.body.classList.add("picking");
  setStatus(state.picking==="from"?"st.pickFrom":"st.pickTo");
}));
map.on("click",async e=>{
  if(!state.picking) return;
  const k = state.picking; state.picking=null; document.body.classList.remove("picking");
  const lat=+e.latlng.lat.toFixed(6), lon=+e.latlng.lng.toFixed(6);
  let name = lat+", "+lon;
  try{ const r = await getJSON(API+"/v1/reverse-geocode?numResults=1&place="+lat+","+lon); if(r[0]) name = r[0].name; }catch(_){}
  setPlace(k,{name,lat,lon}); setStatus("");
});

/* ---------- geocoding ---------- */
function setPlace(k,p){ state[k]=p; $("#"+k).value=p.name; drawEndpoints(); }

function areaText(m){
  const a=(m.areas||[]).filter(x=>!x.matched).sort((x,y)=>Math.abs(x.adminLevel-8)-Math.abs(y.adminLevel-8))[0];
  return [t(m.type==="STOP"?"kind.STOP":m.type==="ADDRESS"?"kind.ADDRESS":"kind.PLACE"), a&&a.name].filter(Boolean).join(" · ");
}

for (const k of ["from","to"]) {
  const inp=$("#"+k), box=inp.nextElementSibling; let t, items=[], idx=-1;
  const close=()=>{box.hidden=true; idx=-1;};
  const choose=m=>{ setPlace(k,{name:m.name,lat:m.lat,lon:m.lon,stopId:m.type==="STOP"?m.id:null}); close(); };
  inp.addEventListener("input",()=>{
    state[k]=null; clearTimeout(t);
    const q=inp.value.trim();
    const ll=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if(ll){ state[k]={name:q,lat:+ll[1],lon:+ll[2]}; drawEndpoints(); close(); return; }
    if(q.length<2){close();return;}
    t=setTimeout(async()=>{
      try{
        const c=map.getCenter();
        items=await getJSON(API+"/v1/geocode?numResults=7&text="+encodeURIComponent(q)+"&place="+c.lat.toFixed(4)+","+c.lng.toFixed(4));
        box.innerHTML=""; idx=-1;
        items.forEach((m,i)=>{const d=document.createElement("div");
          d.textContent=m.name; const s=document.createElement("small"); s.textContent=areaText(m); d.appendChild(s);
          d.addEventListener("mousedown",ev=>{ev.preventDefault();choose(m);}); box.appendChild(d);});
        box.hidden=!items.length;
      }catch(err){ setStatus("st.placeFail",{err},true); }
    },280);
  });
  inp.addEventListener("keydown",e=>{
    if(box.hidden) return;
    const els=[...box.children];
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(); idx=(idx+(e.key==="ArrowDown"?1:-1)+els.length)%els.length;
      els.forEach((el,i)=>el.classList.toggle("on",i===idx));}
    else if(e.key==="Enter"&&idx>=0){e.preventDefault(); choose(items[idx]);}
    else if(e.key==="Escape") close();
  });
  inp.addEventListener("blur",()=>setTimeout(close,150));
}

$("#swap").addEventListener("click",()=>{
  const a=state.from,b=state.to, av=$("#from").value, bv=$("#to").value;
  state.from=b; state.to=a; $("#from").value=bv; $("#to").value=av; drawEndpoints();
});

/* ---------- planning ---------- */
async function getJSON(url){
  const r=await fetch(url);
  if(!r.ok){ let msg=r.status+" "+r.statusText; try{const j=await r.json(); if(j.error) msg=j.error;}catch(_){} const e=new Error(msg); e.status=r.status; throw e; }
  return r.json();
}
// Status text is kept as a key so it can be re-rendered when the language changes.
function setStatus(key,params,err){ Object.assign(curStatus,{key,params:params||null,err:!!err}); renderStatus(); }
function renderStatus(){ const s=$("#status"); s.textContent=curStatus.key?t(curStatus.key,curStatus.params):""; s.classList.toggle("err",curStatus.err); }
const showError=err=>setStatus("st.raw",{err},true);
const placeParam=p=>p.stopId||(p.lat+","+p.lon);

(function initTime(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); $("#when").value=d.toISOString().slice(0,16); })();

$("#form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!state.from||!state.to){ setStatus("st.needBoth",null,true); return; }
  const when=$("#when").value?new Date($("#when").value):new Date();
  const qs="fromPlace="+encodeURIComponent(placeParam(state.from))+"&toPlace="+encodeURIComponent(placeParam(state.to))+
    "&time="+encodeURIComponent(when.toISOString())+"&arriveBy="+$("#arriveBy").value+"&detailedTransfers=true";
  $("#go").disabled=true; setStatus("st.searching"); $("#results").innerHTML="";
  try{
    let data;
    try{ data=await getJSON(API+"/v6/plan?"+qs); }
    catch(err){ if(err.status===404) data=await getJSON(API+"/v5/plan?"+qs); else throw err; }
    state.itins=(data.itineraries||[]).concat(data.itineraries&&data.itineraries.length?[]:(data.direct||[]));
    state.sel=0;
    // The planner names coordinate endpoints "START" / "END"; use the names the person picked.
    for(const it of state.itins) for(const l of it.legs){
      if(l.from.name==="START") l.from.name=state.from.name;
      if(l.to.name==="END") l.to.name=state.to.name;
    }
    if(!state.itins.length){ setStatus("st.none",null,true); $("#exportBox").hidden=true; routeLayer.clearLayers(); return; }
    if(state.matchTime!=null){
      const key=$("#arriveBy").value==="true"?"endTime":"startTime";
      let best=0,bd=Infinity;
      state.itins.forEach((it,i)=>{
        const firstTransit=it.legs.find(l=>!isWalk(l));
        const t=key==="startTime"&&firstTransit?firstTransit.startTime:it[key];
        const d=Math.abs(new Date(t)-state.matchTime); if(d<bd){bd=d;best=i;} });
      state.sel=best; state.matchTime=null;
    }
    setStatus(state.itins.length===1?"st.opts.one":"st.opts.other",{n:state.itins.length});
    renderList(); showItin(state.sel); $("#exportBox").hidden=false;
  }catch(err){
    setStatus(err instanceof TypeError?"st.failNet":"st.fail",{err},true);
  }finally{ $("#go").disabled=false; }
});

/* ---------- Google Maps link ---------- */
// Reads /maps/dir/A/B/@lat,lon,z/data=… links, ?api=1&origin=&destination= links and ?saddr=&daddr= links.
function parseGoogleMapsUrl(raw){
  let u; try{ u=new URL(raw.trim()); }catch(_){ throw fail("err.invalid"); }
  if(/goo\.gl$|app\.goo\.gl$/.test(u.hostname))
    throw fail("err.short");
  if(!/google\./.test(u.hostname)) throw fail("err.notGoogle");
  const out={points:[],time:null,arriveBy:false,transit:null,bias:null};
  const clean=s=>decodeURIComponent(s.replace(/\+/g," ")).trim();
  const llRe=/^\s*(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/;
  const toPoint=s=>{ if(!s) return null; const m=s.match(llRe); return m?{name:s.trim(),lat:+m[1],lon:+m[2]}:{name:s}; };
  const p=u.searchParams;
  if(p.get("origin")||p.get("destination")){
    out.points=[toPoint(p.get("origin")),toPoint(p.get("destination"))];
    if(p.get("travelmode")) out.transit=p.get("travelmode")==="transit";
  } else if(p.get("saddr")||p.get("daddr")){
    out.points=[toPoint(p.get("saddr")),toPoint((p.get("daddr")||"").split(/\s+to:/)[0])];
    if(p.get("dirflg")) out.transit=p.get("dirflg")==="r";
  } else {
    const path=u.pathname.split("/");
    const i=path.indexOf("dir");
    if(i<0) throw fail("err.place");
    const segs=[];
    for(const s of path.slice(i+1)){ if(!s||s.startsWith("@")||s.startsWith("data=")) break; segs.push(clean(s)); }
    out.points=segs.map(toPoint);
    const at=u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/); if(at) out.bias={lat:+at[1],lon:+at[2]};
    const data=(u.pathname.match(/data=([^/?]*)/)||[])[1]||"";
    // Each waypoint block: !1m5!1m1!1s<id>!2m2!1d<lon>!2d<lat>  (a "My location" start has no block)
    const wps=[...data.matchAll(/!1m(\d+)!1m1!1s[^!]*!2m2!1d(-?[\d.]+)!2d(-?[\d.]+)/g)].map(m=>({lon:+m[2],lat:+m[3]}));
    // Waypoints that already are coordinates have no block, so pair blocks with the named segments only.
    const named=out.points.map((pt,k)=>pt&&pt.lat==null?k:-1).filter(k=>k>=0);
    if(wps.length===named.length) named.forEach((k,j)=>Object.assign(out.points[k],wps[j]));
    const mode=data.match(/!3e(\d)/); if(mode) out.transit=mode[1]==="3";
    const tt=data.match(/!8j(\d{9,11})/);
    if(tt){
      // Google stores the wall-clock time at the trip's location, written as if it were UTC.
      const d=new Date(+tt[1]*1000);
      out.time=new Date(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes());
    }
    const tm=data.match(/!6e(\d)/); if(tm) out.arriveBy=tm[1]==="1";
  }
  out.points=out.points.filter(Boolean);
  if(out.points.length<2) throw fail("err.points");
  if(out.points.length>2) out.via=out.points.length-2;
  return out;
}

async function resolvePoint(pt,bias){
  if(pt.lat!=null) return {name:pt.name&&!llRe2.test(pt.name)?pt.name:await nameFor(pt),lat:pt.lat,lon:pt.lon};
  const b=bias||{lat:map.getCenter().lat,lon:map.getCenter().lng};
  const r=await getJSON(API+"/v1/geocode?numResults=1&text="+encodeURIComponent(pt.name)+"&place="+b.lat.toFixed(4)+","+b.lon.toFixed(4));
  if(!r[0]) throw fail("err.notFound",{name:pt.name});
  return {name:pt.name.split(",")[0],lat:r[0].lat,lon:r[0].lon};
}
const llRe2=/^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$/;
async function nameFor(pt){
  try{ const r=await getJSON(API+"/v1/reverse-geocode?numResults=1&place="+pt.lat+","+pt.lon); if(r[0]) return r[0].name; }catch(_){}
  return pt.lat.toFixed(5)+", "+pt.lon.toFixed(5);
}
const toLocalInput=d=>{ const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,16); };

async function useGoogleLink(){
  try{
    const g=parseGoogleMapsUrl($("#gmaps").value);
    $("#gmapsGo").disabled=true; setStatus("st.reading");
    const a=g.points[0], b=g.points[g.points.length-1];
    const bias=a.lat!=null?a:b.lat!=null?b:g.bias;
    const [from,to]=await Promise.all([resolvePoint(a,bias),resolvePoint(b,bias)]);
    setPlace("from",from); setPlace("to",to);
    $("#arriveBy").value=String(g.arriveBy);
    if(g.time){ $("#when").value=toLocalInput(g.time); state.matchTime=g.time; }
    const notes=[];
    if(g.transit===false) notes.push("note.notTransit");
    if(g.via) notes.push("note.via");
    if(!g.time) notes.push("note.noTime");
    setHint(notes.length?notes:["gmaps.read"]);
    map.fitBounds(L.latLngBounds([[from.lat,from.lon],[to.lat,to.lon]]),{padding:[40,40]});
    $("#form").requestSubmit();
  }catch(err){ showError(err); }
  finally{ $("#gmapsGo").disabled=false; }
}
$("#gmapsGo").addEventListener("click",useGoogleLink);
$("#gmaps").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); useGoogleLink(); }});
$("#gmaps").addEventListener("paste",()=>setTimeout(useGoogleLink,0));

/* ---------- rendering ---------- */
const fmtT=s=>new Date(s).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const fmtD=(sec,l)=>{const m=Math.round(sec/60); return m>=60?t("dur.hm",{h:Math.floor(m/60),m:m%60},l):t("dur.m",{m},l);};
const legColor=l=>hex6(l.routeColor)||MODE_COLORS[l.mode]||MODE_COLORS.OTHER;
const textColor=l=>hex6(l.routeTextColor)||"#fff";
const lineName=(l,lg)=>l.displayName||l.routeShortName||l.tripShortName||modeName(l.mode,lg);
const isWalk=l=>l.mode==="WALK"||l.mode==="BIKE"||l.mode==="CAR";

function renderList(){
  const box=$("#results"); box.innerHTML="";
  state.itins.forEach((it,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="it"+(i===state.sel?" sel":"");
    const transit=it.legs.filter(l=>!isWalk(l));
    const nT=Number.isFinite(Number(it.transfers))?Number(it.transfers):Math.max(0,transit.length-1);
    b.innerHTML=`<div class="times">${fmtT(it.startTime)} → ${fmtT(it.endTime)}</div>
      <div class="meta">${fmtD(it.duration)} · ${t(nT===1?"transfers.one":"transfers.other",{n:nT})}</div>`;
    const chips=document.createElement("div"); chips.className="chips";
    it.legs.forEach(l=>{ if(isWalk(l)&&l.duration<120) return;
      const c=document.createElement("span"); c.className="chip"+(isWalk(l)?" walk":"");
      if(isWalk(l)) c.textContent=modeName(l.mode)+" "+Math.round(l.duration/60)+"′";
      else { c.textContent=lineName(l); c.style.background=legColor(l); c.style.color=textColor(l); }
      chips.appendChild(c); });
    b.appendChild(chips);
    if(i===state.sel){
      const ul=document.createElement("ul"); ul.className="legs";
      it.legs.forEach(l=>{ const li=document.createElement("li");
        const t=document.createElement("span"); t.className="t"; t.textContent=fmtT(l.startTime);
        const d=document.createElement("span");
        d.textContent=isWalk(l)?t("leg.walkTo",{mode:modeName(l.mode),to:l.to.name}):
          `${lineName(l)}${l.headsign?" → "+l.headsign:""} · `+t("leg.fromTo",{from:l.from.name+(l.from.track?t("leg.plat",{p:l.from.track}):""),to:l.to.name});
        li.append(t,d); ul.appendChild(li); });
      b.appendChild(ul);
    }
    b.addEventListener("click",()=>{ state.sel=i; renderList(); showItin(i); });
    box.appendChild(b);
  });
}

function decodePolyline(str,precision){
  const f=Math.pow(10,precision??6); let i=0,lat=0,lng=0; const out=[];
  while(i<str.length){
    let r=0,s=0,b; do{b=str.charCodeAt(i++)-63; r|=(b&31)<<s; s+=5;}while(b>=32); lat+=(r&1)?~(r>>1):(r>>1);
    r=0;s=0; do{b=str.charCodeAt(i++)-63; r|=(b&31)<<s; s+=5;}while(b>=32); lng+=(r&1)?~(r>>1):(r>>1);
    out.push([lat/f,lng/f]);
  }
  return out;
}
const legCoords=l=>{
  const g=l.legGeometry; const pts=g&&g.points?decodePolyline(g.points,g.precision):[];
  return pts.length>1?pts:[[l.from.lat,l.from.lon],...(l.intermediateStops||[]).map(s=>[s.lat,s.lon]),[l.to.lat,l.to.lon]];
};

function showItin(i,keepView){
  routeLayer.clearLayers(); const it=state.itins[i]; const all=[];
  // Draw all casings first, then the colored lines, then stop markers, so no leg's casing covers another leg's line.
  const coords=it.legs.map(l=>{ const c=legCoords(l); all.push(...c); return c; });
  it.legs.forEach((l,k)=>L.polyline(coords[k],isWalk(l)?{color:"#fff",weight:7,opacity:1,interactive:false}:{color:"#111",weight:11,opacity:.85,interactive:false}).addTo(routeLayer));
  it.legs.forEach((l,k)=>
    L.polyline(coords[k],{color:legColor(l),weight:isWalk(l)?5:7,opacity:1,dashArray:isWalk(l)?"4 8":null})
      .bindTooltip(esc(isWalk(l)?modeName(l.mode):lineName(l)+(l.headsign?" → "+l.headsign:""))).addTo(routeLayer));
  it.legs.forEach(l=>{
    if(!isWalk(l)) for(const s of [l.from,l.to])
      L.circleMarker([s.lat,s.lon],{radius:5,weight:3,color:legColor(l),fillColor:"#fff",fillOpacity:1}).bindTooltip(esc(s.name)).addTo(routeLayer);
  });
  if(all.length&&!keepView) map.fitBounds(L.latLngBounds(all),{padding:[30,30]});
}

/* ---------- KML ---------- */
const kmlColor=hex=>{ const h=hex.replace("#",""); return "ff"+h.slice(4,6)+h.slice(2,4)+h.slice(0,2); };
const coordStr=c=>c.map(([la,lo])=>lo.toFixed(6)+","+la.toFixed(6)+",0").join(" ");
const isoLocal=s=>new Date(s).toISOString();

function itinFolder(it,n,opt,styles){
  const parts=[];
  const title=`Option ${n}: ${fmtT(it.startTime)}–${fmtT(it.endTime)} (${fmtD(it.duration,EN)})`;
  it.legs.forEach((l,k)=>{
    if(isWalk(l)&&!opt.walk) return;
    const col=legColor(l), id="s"+col.replace("#","")+(isWalk(l)?"w":"");
    styles.set(id,`<Style id="${id}"><LineStyle><color>${kmlColor(col)}</color><width>${isWalk(l)?3:5}</width></LineStyle></Style>`);
    const name=isWalk(l)?`${modeName(l.mode,EN)} to ${l.to.name}`:`${lineName(l,EN)}${l.headsign?" → "+l.headsign:""}`;
    const desc=`${fmtT(l.startTime)} ${l.from.name}${l.from.track?" (platform "+l.from.track+")":""}\n${fmtT(l.endTime)} ${l.to.name}${l.to.track?" (platform "+l.to.track+")":""}\n${fmtD(l.duration,EN)}${l.agencyName?" · "+l.agencyName:""}`;
    const data={mode:l.mode,line:isWalk(l)?"":lineName(l,EN),headsign:l.headsign||"",agency:l.agencyName||"",from:l.from.name,to:l.to.name,
      departure:l.startTime,arrival:l.endTime,distance_m:l.distance!=null?Math.round(l.distance):""};
    parts.push(`<Placemark><name>${esc((k+1)+". "+name)}</name><description>${esc(desc)}</description>
<TimeSpan><begin>${isoLocal(l.startTime)}</begin><end>${isoLocal(l.endTime)}</end></TimeSpan><styleUrl>#${id}</styleUrl>
<ExtendedData>${Object.entries(data).map(([k,v])=>`<Data name="${k}"><value>${esc(v)}</value></Data>`).join("")}</ExtendedData>
<LineString><tessellate>1</tessellate><coordinates>${coordStr(legCoords(l))}</coordinates></LineString></Placemark>`);
  });
  if(opt.stops||opt.inter){
    const pts=[];
    it.legs.forEach(l=>{ if(isWalk(l)) return;
      if(opt.stops){ pts.push({p:l.from,t:l.startTime,kind:"Board",l}); }
      if(opt.inter) (l.intermediateStops||[]).forEach(s=>pts.push({p:s,t:s.departure||s.arrival,kind:"Pass",l}));
      if(opt.stops){ pts.push({p:l.to,t:l.endTime,kind:"Alight",l}); }
    });
    styles.set("stopMain",`<Style id="stopMain"><IconStyle><scale>0.9</scale><Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle></Style>`);
    styles.set("stopSmall",`<Style id="stopSmall"><IconStyle><scale>0.5</scale><Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle><LabelStyle><scale>0.7</scale></LabelStyle></Style>`);
    parts.push(`<Folder><name>Stops</name>${pts.map(({p,t,kind,l})=>`<Placemark><name>${esc(p.name)}</name>
<description>${esc(kind+" "+lineName(l,EN)+(t?" at "+fmtT(t):"")+(p.track?" · platform "+p.track:""))}</description>
<styleUrl>#${kind==="Pass"?"stopSmall":"stopMain"}</styleUrl><Point><coordinates>${num(p.lon)},${num(p.lat)},0</coordinates></Point></Placemark>`).join("\n")}</Folder>`);
  }
  return `<Folder><name>${esc(title)}</name><open>1</open>\n${parts.join("\n")}\n</Folder>`;
}

function buildKml(list){
  const opt={walk:$("#optWalk").checked,stops:$("#optStops").checked,inter:$("#optInter").checked};
  const styles=new Map();
  const folders=list.map(([it,n])=>itinFolder(it,n,opt,styles)).join("\n");
  const name=`${state.from.name} → ${state.to.name}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document><name>${esc(name)}</name>
<description>${esc("Public transport route planned "+new Date().toLocaleString()+" via Transitous (transitous.org). Map data © OpenStreetMap contributors.")}</description>
${[...styles.values()].join("\n")}
<Placemark><name>${esc(state.from.name)}</name><Point><coordinates>${num(state.from.lon)},${num(state.from.lat)},0</coordinates></Point></Placemark>
<Placemark><name>${esc(state.to.name)}</name><Point><coordinates>${num(state.to.lon)},${num(state.to.lat)},0</coordinates></Point></Placemark>
${folders}
</Document></kml>`;
}

function download(kml,suffix){
  const slug=s=>s.normalize("NFKD").replace(/[^\w]+/g,"-").replace(/^-|-$/g,"").slice(0,40);
  const fn=`${slug(state.from.name)}_to_${slug(state.to.name)}${suffix}.kml`;
  const url=URL.createObjectURL(new Blob([kml],{type:"application/vnd.google-earth.kml+xml"}));
  const a=document.createElement("a"); a.href=url; a.download=fn; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  setStatus("st.saved",{fn});
}
const safely=fn=>()=>{ try{ fn(); }catch(err){ setStatus("st.kmlFail",{err},true); } };
$("#dlOne").addEventListener("click",safely(()=>{ const it=state.itins[state.sel];
  download(buildKml([[it,state.sel+1]]),"_"+new Date(it.startTime).toTimeString().slice(0,5).replace(":","")); }));
$("#dlAll").addEventListener("click",safely(()=>download(buildKml(state.itins.map((it,i)=>[it,i+1])),"_all")));

/* ---------- language switcher ---------- */
function setHint(keys){ hintKeys=keys; $("#gmapsHint").textContent=keys.map(k=>t(k)).join(" "); }

function applyLang(next,persist){
  lang=DICT[next]?next:EN;
  document.documentElement.lang=lang;
  document.title=t("title");
  document.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  for(const [attr,dest] of [["i18nPlaceholder","placeholder"],["i18nTitle","title"],["i18nAriaLabel","aria-label"],["i18nContent","content"]])
    document.querySelectorAll("[data-"+attr.replace(/[A-Z]/g,c=>"-"+c.toLowerCase())+"]").forEach(el=>{ el.setAttribute(dest,t(el.dataset[attr])); });
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===lang)));
  // Leaflet's own zoom buttons
  for(const [sel,key] of [[".leaflet-control-zoom-in","zoom.in"],[".leaflet-control-zoom-out","zoom.out"]]){
    const el=document.querySelector(sel); if(el){ el.title=t(key); el.setAttribute("aria-label",t(key)); }
  }
  renderStatus(); setHint(hintKeys); drawEndpoints();
  if(state.itins.length){ renderList(); showItin(state.sel,true); }
  if(persist){ try{ localStorage.setItem("lang",lang); }catch(_){} }
}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang,true)));
applyLang(detectLang(),false);
