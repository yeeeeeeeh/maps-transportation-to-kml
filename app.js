"use strict";
const API = "https://api.transitous.org/api";
const MODE_COLORS = {WALK:"#7a8599",BUS:"#c2410c",COACH:"#9a3412",TRAM:"#b91c1c",SUBWAY:"#1d4ed8",METRO:"#1d4ed8",
  SUBURBAN:"#047857",REGIONAL_RAIL:"#1e40af",REGIONAL_FAST_RAIL:"#1e40af",LONG_DISTANCE:"#4338ca",HIGHSPEED_RAIL:"#7c3aed",
  NIGHT_RAIL:"#312e81",RAIL:"#1e40af",FERRY:"#0e7490",AIRPLANE:"#475569",FUNICULAR:"#a16207",AERIAL_LIFT:"#a16207",
  BIKE:"#15803d",CAR:"#374151",OTHER:"#6b7280"};
const MODE_LABEL = {WALK:"Walk",BUS:"Bus",COACH:"Coach",TRAM:"Tram",SUBWAY:"Metro",METRO:"Metro",SUBURBAN:"Suburban rail",
  REGIONAL_RAIL:"Train",REGIONAL_FAST_RAIL:"Train",LONG_DISTANCE:"Intercity",HIGHSPEED_RAIL:"High-speed",NIGHT_RAIL:"Night train",
  RAIL:"Train",FERRY:"Ferry",AIRPLANE:"Flight",FUNICULAR:"Funicular",AERIAL_LIFT:"Cable car",BIKE:"Bike",CAR:"Car",OTHER:"Transit"};

const $ = s => document.querySelector(s);
const state = { from:null, to:null, itins:[], sel:0, picking:null };

/* ---------- map ---------- */
// Escapes text for HTML and XML (tooltips and KML).
const esc=s=>String(s??"").replace(/[<>&'"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]));
const hex6=v=>typeof v==="string"&&/^#?[0-9a-f]{6}$/i.test(v)?"#"+v.replace("#",""):null;
const num=v=>{const n=Number(v); if(!Number.isFinite(n)) throw new Error("Bad coordinate in route data."); return n;};
const map = L.map("map",{zoomControl:true}).setView([50.5,6.5],6);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
const routeLayer = L.layerGroup().addTo(map);
const endpointLayer = L.layerGroup().addTo(map);

function drawEndpoints(){
  endpointLayer.clearLayers();
  for (const k of ["from","to"]) {
    const p = state[k]; if (!p) continue;
    L.circleMarker([p.lat,p.lon],{radius:8,weight:3,color:k==="from"?"#047857":"#b3261e",fillColor:"#fff",fillOpacity:1})
      .bindTooltip(esc((k==="from"?"From: ":"To: ")+p.name)).addTo(endpointLayer);
  }
}

document.querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{
  state.picking = b.dataset.pick; document.body.classList.add("picking");
  setStatus("Click the map to set the "+(state.picking==="from"?"start":"destination")+".");
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
  return [m.type==="STOP"?"Stop":m.type==="ADDRESS"?"Address":"Place", a&&a.name].filter(Boolean).join(" · ");
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
      }catch(err){ setStatus("Place search failed: "+err.message,true); }
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
function setStatus(msg,err){ const s=$("#status"); s.textContent=msg; s.classList.toggle("err",!!err); }
const placeParam=p=>p.stopId||(p.lat+","+p.lon);

(function initTime(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); $("#when").value=d.toISOString().slice(0,16); })();

$("#form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!state.from||!state.to){ setStatus("Pick a start and a destination from the suggestions, or use Map.",true); return; }
  const when=$("#when").value?new Date($("#when").value):new Date();
  const qs="fromPlace="+encodeURIComponent(placeParam(state.from))+"&toPlace="+encodeURIComponent(placeParam(state.to))+
    "&time="+encodeURIComponent(when.toISOString())+"&arriveBy="+$("#arriveBy").value+"&detailedTransfers=true";
  $("#go").disabled=true; setStatus("Searching…"); $("#results").innerHTML="";
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
    if(!state.itins.length){ setStatus("No trips found for that time. Try another time or nearby stops.",true); $("#exportBox").hidden=true; routeLayer.clearLayers(); return; }
    if(state.matchTime!=null){
      const key=$("#arriveBy").value==="true"?"endTime":"startTime";
      let best=0,bd=Infinity;
      state.itins.forEach((it,i)=>{
        const firstTransit=it.legs.find(l=>!isWalk(l));
        const t=key==="startTime"&&firstTransit?firstTransit.startTime:it[key];
        const d=Math.abs(new Date(t)-state.matchTime); if(d<bd){bd=d;best=i;} });
      state.sel=best; state.matchTime=null;
    }
    setStatus(state.itins.length+" options. Pick one to preview, then download.");
    renderList(); showItin(state.sel); $("#exportBox").hidden=false;
  }catch(err){
    setStatus("Search failed: "+err.message+(err instanceof TypeError?" (network or browser blocked the request)":""),true);
  }finally{ $("#go").disabled=false; }
});

/* ---------- Google Maps link ---------- */
// Reads /maps/dir/A/B/@lat,lon,z/data=… links, ?api=1&origin=&destination= links and ?saddr=&daddr= links.
function parseGoogleMapsUrl(raw){
  let u; try{ u=new URL(raw.trim()); }catch(_){ throw new Error("That isn't a valid link."); }
  if(/goo\.gl$|app\.goo\.gl$/.test(u.hostname))
    throw new Error("Short links (maps.app.goo.gl) can't be opened from this page. Open the link in a browser, then copy the long google.com/maps/dir/… address it turns into.");
  if(!/google\./.test(u.hostname)) throw new Error("That isn't a Google Maps link.");
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
    if(i<0) throw new Error("This link is for a place, not directions. Open directions in Google Maps and copy that link.");
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
  if(out.points.length<2) throw new Error("Couldn't find both a start and a destination in that link. If the start is \"Your location\", pick it on the map instead.");
  if(out.points.length>2) out.via=out.points.length-2;
  return out;
}

async function resolvePoint(pt,bias){
  if(pt.lat!=null) return {name:pt.name&&!llRe2.test(pt.name)?pt.name:await nameFor(pt),lat:pt.lat,lon:pt.lon};
  const b=bias||{lat:map.getCenter().lat,lon:map.getCenter().lng};
  const r=await getJSON(API+"/v1/geocode?numResults=1&text="+encodeURIComponent(pt.name)+"&place="+b.lat.toFixed(4)+","+b.lon.toFixed(4));
  if(!r[0]) throw new Error("Couldn't find \""+pt.name+"\".");
  return {name:pt.name.split(",")[0],lat:r[0].lat,lon:r[0].lon};
}
const llRe2=/^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$/;
async function nameFor(pt){
  try{ const r=await getJSON(API+"/v1/reverse-geocode?numResults=1&place="+pt.lat+","+pt.lon); if(r[0]) return r[0].name; }catch(_){}
  return pt.lat.toFixed(5)+", "+pt.lon.toFixed(5);
}
const toLocalInput=d=>{ const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,16); };

async function useGoogleLink(){
  const hint=$("#gmapsHint");
  try{
    const g=parseGoogleMapsUrl($("#gmaps").value);
    $("#gmapsGo").disabled=true; setStatus("Reading the link…");
    const a=g.points[0], b=g.points[g.points.length-1];
    const bias=a.lat!=null?a:b.lat!=null?b:g.bias;
    const [from,to]=await Promise.all([resolvePoint(a,bias),resolvePoint(b,bias)]);
    setPlace("from",from); setPlace("to",to);
    $("#arriveBy").value=String(g.arriveBy);
    if(g.time){ $("#when").value=toLocalInput(g.time); state.matchTime=g.time; }
    const notes=[];
    if(g.transit===false) notes.push("The link is for driving, walking or cycling. Planning it by public transport instead.");
    if(g.via) notes.push("Stops along the way in the link are skipped.");
    if(!g.time) notes.push("The link has no time (Google leaves it out for \"leave now\"), so the time below is used.");
    hint.textContent=notes.join(" ")||"Read the link. Planning the same trip…";
    map.fitBounds(L.latLngBounds([[from.lat,from.lon],[to.lat,to.lon]]),{padding:[40,40]});
    $("#form").requestSubmit();
  }catch(err){ setStatus(err.message,true); }
  finally{ $("#gmapsGo").disabled=false; }
}
$("#gmapsGo").addEventListener("click",useGoogleLink);
$("#gmaps").addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); useGoogleLink(); }});
$("#gmaps").addEventListener("paste",()=>setTimeout(useGoogleLink,0));

/* ---------- rendering ---------- */
const fmtT=s=>new Date(s).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
const fmtD=sec=>{const m=Math.round(sec/60); return m>=60?Math.floor(m/60)+" h "+(m%60)+" min":m+" min";};
const legColor=l=>hex6(l.routeColor)||MODE_COLORS[l.mode]||MODE_COLORS.OTHER;
const textColor=l=>hex6(l.routeTextColor)||"#fff";
const lineName=l=>l.displayName||l.routeShortName||l.tripShortName||MODE_LABEL[l.mode]||l.mode;
const isWalk=l=>l.mode==="WALK"||l.mode==="BIKE"||l.mode==="CAR";

function renderList(){
  const box=$("#results"); box.innerHTML="";
  state.itins.forEach((it,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="it"+(i===state.sel?" sel":"");
    const transit=it.legs.filter(l=>!isWalk(l));
    const nT=Number.isFinite(Number(it.transfers))?Number(it.transfers):Math.max(0,transit.length-1);
    b.innerHTML=`<div class="times">${fmtT(it.startTime)} → ${fmtT(it.endTime)}</div>
      <div class="meta">${fmtD(it.duration)} · ${nT} transfer${nT===1?"":"s"}</div>`;
    const chips=document.createElement("div"); chips.className="chips";
    it.legs.forEach(l=>{ if(isWalk(l)&&l.duration<120) return;
      const c=document.createElement("span"); c.className="chip"+(isWalk(l)?" walk":"");
      if(isWalk(l)) c.textContent=(MODE_LABEL[l.mode]||l.mode)+" "+Math.round(l.duration/60)+"′";
      else { c.textContent=lineName(l); c.style.background=legColor(l); c.style.color=textColor(l); }
      chips.appendChild(c); });
    b.appendChild(chips);
    if(i===state.sel){
      const ul=document.createElement("ul"); ul.className="legs";
      it.legs.forEach(l=>{ const li=document.createElement("li");
        const t=document.createElement("span"); t.className="t"; t.textContent=fmtT(l.startTime);
        const d=document.createElement("span");
        d.textContent=isWalk(l)?`${MODE_LABEL[l.mode]} to ${l.to.name}`:`${lineName(l)}${l.headsign?" → "+l.headsign:""} · ${l.from.name}${l.from.track?" (pl. "+l.from.track+")":""} to ${l.to.name}`;
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

function showItin(i){
  routeLayer.clearLayers(); const it=state.itins[i]; const all=[];
  it.legs.forEach(l=>{ const c=legCoords(l); all.push(...c);
    L.polyline(c,{color:legColor(l),weight:isWalk(l)?4:6,opacity:.9,dashArray:isWalk(l)?"4 8":null})
      .bindTooltip(esc(isWalk(l)?MODE_LABEL[l.mode]:lineName(l)+(l.headsign?" → "+l.headsign:""))).addTo(routeLayer);
    if(!isWalk(l)) for(const s of [l.from,l.to])
      L.circleMarker([s.lat,s.lon],{radius:5,weight:2,color:legColor(l),fillColor:"#fff",fillOpacity:1}).bindTooltip(esc(s.name)).addTo(routeLayer);
  });
  if(all.length) map.fitBounds(L.latLngBounds(all),{padding:[30,30]});
}

/* ---------- KML ---------- */
const kmlColor=hex=>{ const h=hex.replace("#",""); return "ff"+h.slice(4,6)+h.slice(2,4)+h.slice(0,2); };
const coordStr=c=>c.map(([la,lo])=>lo.toFixed(6)+","+la.toFixed(6)+",0").join(" ");
const isoLocal=s=>new Date(s).toISOString();

function itinFolder(it,n,opt,styles){
  const parts=[];
  const title=`Option ${n}: ${fmtT(it.startTime)}–${fmtT(it.endTime)} (${fmtD(it.duration)})`;
  it.legs.forEach((l,k)=>{
    if(isWalk(l)&&!opt.walk) return;
    const col=legColor(l), id="s"+col.replace("#","")+(isWalk(l)?"w":"");
    styles.set(id,`<Style id="${id}"><LineStyle><color>${kmlColor(col)}</color><width>${isWalk(l)?3:5}</width></LineStyle></Style>`);
    const name=isWalk(l)?`${MODE_LABEL[l.mode]} to ${l.to.name}`:`${lineName(l)}${l.headsign?" → "+l.headsign:""}`;
    const desc=`${fmtT(l.startTime)} ${l.from.name}${l.from.track?" (platform "+l.from.track+")":""}\n${fmtT(l.endTime)} ${l.to.name}${l.to.track?" (platform "+l.to.track+")":""}\n${fmtD(l.duration)}${l.agencyName?" · "+l.agencyName:""}`;
    const data={mode:l.mode,line:isWalk(l)?"":lineName(l),headsign:l.headsign||"",agency:l.agencyName||"",from:l.from.name,to:l.to.name,
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
<description>${esc(kind+" "+lineName(l)+(t?" at "+fmtT(t):"")+(p.track?" · platform "+p.track:""))}</description>
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
  setStatus("Saved "+fn);
}
const safely=fn=>()=>{ try{ fn(); }catch(err){ setStatus("Couldn't build the KML file: "+err.message,true); } };
$("#dlOne").addEventListener("click",safely(()=>{ const it=state.itins[state.sel];
  download(buildKml([[it,state.sel+1]]),"_"+new Date(it.startTime).toTimeString().slice(0,5).replace(":","")); }));
$("#dlAll").addEventListener("click",safely(()=>download(buildKml(state.itins.map((it,i)=>[it,i+1])),"_all")));
