/* Parses the response of Google Maps' list endpoint and rebuilds Google Takeout's "Saved Places.json" (GeoJSON).
   The endpoint is undocumented, so entries are located by shape (a place always carries a [null,null,lat,lng]
   block) rather than by fixed indexes. Works in the browser (window.ListParse) and in Node (module.exports). */
(function(root){
  const strip=s=>String(s).replace(/^\)\]\}'\s*/,"").trim();
  const isCoords=n=>Array.isArray(n)&&n.length>=4&&n[0]===null&&n[1]===null&&typeof n[2]==="number"&&typeof n[3]==="number"
    &&Math.abs(n[2])<=90&&Math.abs(n[3])<=180&&(n[2]!==0||n[3]!==0);

  function findCoords(n,depth){
    if(isCoords(n)) return {lat:n[2],lng:n[3]};
    if(!Array.isArray(n)||depth>7) return null;
    for(const c of n){ const r=findCoords(c,depth+1); if(r) return r; }
    return null;
  }

  // The places array: the array whose array-children (almost) all hold coordinates. Largest wins, then shallowest.
  function findEntries(rootNode){
    let best=null;
    (function walk(n,depth){
      if(!Array.isArray(n)||depth>9) return;
      const kids=n.filter(Array.isArray);
      if(kids.length&&kids.length===n.filter(c=>c!==null).length){
        const withC=kids.filter(k=>findCoords(k,0)).length;
        if(withC&&withC>=kids.length*0.8&&(!best||withC>best.count||(withC===best.count&&depth<best.depth))) best={arr:kids,count:withC,depth};
      }
      for(const c of n) walk(c,depth+1);
    })(rootNode,0);
    return best?best.arr.filter(k=>findCoords(k,0)):[];
  }

  const firstString=n=>{
    if(typeof n==="string") return /^(0x|https?:|\/)/.test(n)||n.length>200?null:n;
    if(!Array.isArray(n)) return null;
    for(const c of n){ const r=firstString(c); if(r) return r; }
    return null;
  };

  function parseEntry(e){
    const {lat,lng}=findCoords(e,0);
    const info=Array.isArray(e[1])?e[1]:[];
    const str=v=>typeof v==="string"?v:"";
    const title=str(e[2])||firstString(e)||"";
    const m=JSON.stringify(e).match(/"(0x[0-9a-f]+):(0x[0-9a-f]+)"/i);
    let cid=""; try{ if(m) cid=BigInt(m[2]).toString(); }catch(_){}
    return {title,note:str(e[3]),address:str(info[2]),lat,lng,cid};
  }

  function parse(text){
    const data=JSON.parse(strip(text));
    const name=Array.isArray(data)&&Array.isArray(data[0])&&typeof data[0][4]==="string"?data[0][4]:"";
    const places=findEntries(data).map(parseEntry);
    if(!places.length) throw new Error("no-places");
    return {name,places};
  }

  // Same shape as Takeout's "Saved Places.json". Date is the export time: the list endpoint does not give the saved date.
  function toTakeout(list,now){
    const date=(now||new Date()).toISOString().replace(/\.\d+Z$/,"Z");
    return {type:"FeatureCollection",features:list.places.map(p=>{
      const props={date,google_maps_url:p.cid?"http://maps.google.com/?cid="+p.cid:"http://maps.google.com/?q="+p.lat+","+p.lng};
      if(p.note) props.Comment=p.note;
      props.location=p.address||p.title
        ?{...(p.address?{address:p.address}:{}),...(p.title?{business_name:p.title}:{}),geo_coordinates:{latitude:p.lat,longitude:p.lng}}
        :{geo_coordinates:{latitude:p.lat,longitude:p.lng}};
      if(!p.address) props.Title=p.title;
      return {geometry:{coordinates:[p.lng,p.lat],type:"Point"},properties:props,type:"Feature"};
    })};
  }

  const api={parse,toTakeout};
  if(typeof module!=="undefined"&&module.exports) module.exports=api; else root.ListParse=api;
})(typeof window!=="undefined"?window:globalThis);
