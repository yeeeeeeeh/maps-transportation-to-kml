"use strict";
/* ---------- retirement calculator tab ----------
   Runs after app.js and reuses its DICT, t(), $, esc and applyLang.
   Money is in euros. Box 3 follows Dutch rules: "old" = deemed return on wealth (forfaitair rendement),
   "new" = tax on actual return incl. unrealised price gains (werkelijk rendement, planned from 2028). */
Object.assign(DICT.en,{
  "tab.transit":"Transit → KML","tab.retire":"Retirement","tabs.group":"Tools",
  "r.h1":"Retirement","r.tag":"on dividends",
  "r.sub":"How big must your portfolio be to pay a monthly cost from dividends alone, and do your savings get you there? Compared under the old and the new Dutch box 3 tax.",
  "r.you":"You","r.age":"Current age","r.retire":"Retire at age","r.until":"Plan until age",
  "r.salary":"Net salary per year","r.raise":"Salary raise per year %","r.invest":"Invest % of salary","r.start":"Invested today",
  "r.goal":"Retirement","r.cost":"Monthly cost in retirement (today's money)","r.infl":"Inflation per year %",
  "r.market":"Investments","r.yield":"Dividend yield %","r.growth":"Share price growth per year %",
  "r.box3":"Box 3 tax","r.partner":"Fiscal partner (doubles the tax-free amounts)",
  "r.old":"Old box 3 (deemed return)","r.new":"New box 3 (actual return)",
  "r.oRate":"Tax rate %","r.oDeemed":"Deemed return %","r.oFree":"Tax-free wealth per person",
  "r.nRate":"Tax rate %","r.nFree":"Tax-free return per person",
  "r.box3Hint":"Defaults are the 2025 rules and the new-system bill. Tax-free amounts and your monthly cost rise with inflation. Dividend withholding tax is assumed to be credited.",
  "r.mort":"Mortgage","r.mBal":"Mortgage balance today",
  "r.mFrom":"From year","r.mTo":"To year","r.mRate":"Interest %","r.mPay":"Per month",
  "r.mPayPh":"auto","r.mAdd":"Add period","r.mDel":"Remove period",
  "r.mHint":"Leave \"per month\" empty for a standard annuity that is paid off by the last year. Payments are made from your salary while you work, and from the portfolio after you retire.",
  "r.need":"Needed at retirement","r.have":"You will have","r.gap":"Short by","r.surplus":"Ahead by",
  "r.pct":"Invest {p}% of salary to get there","r.pctNo":"Not reachable even at 100% of salary",
  "r.never":"Not possible on dividends alone: after tax the dividends never cover the cost.",
  "r.atRetire":"At age {age} ({year}) you need {cost} a year: {month} a month{mort}.",
  "r.atRetireMort":", including {m} a year of mortgage",
  "r.afterMort":"Once the mortgage is paid off: {v} needed.",
  "r.mortLeft":"Mortgage still owed at retirement: {v}.",
  "r.netDiv":"Dividends after tax in the first retirement year: {v} a year.",
  "r.lasts":"Money runs out at age {age}.","r.lastsOk":"Lasts past age {age}.",
  "r.sells":"From age {age} dividends no longer cover spending and shares are sold.",
  "r.chart":"Portfolio by age","r.chartAlt":"Line chart of the projected portfolio under the old and the new box 3, with the amount needed at retirement marked.",
  "r.legOld":"Old box 3","r.legNew":"New box 3","r.legNeed":"Needed","r.legRetire":"Retire",
  "r.table":"Year by year",
  "c.year":"Year","c.age":"Age","c.salary":"Salary","c.contrib":"Invested","c.spend":"Spent",
  "c.left":"Salary left","c.mInt":"Mortgage interest","c.mPaid":"Mortgage paid","c.mBal":"Mortgage owed",
  "c.wOld":"Portfolio (old)","c.taxOld":"Tax (old)","c.wNew":"Portfolio (new)","c.taxNew":"Tax (new)",
  "r.disc":"An estimate, not financial advice. Returns are assumed steady every year; real markets are not."
});
Object.assign(DICT["zh-TW"],{
  "tab.transit":"大眾運輸 → KML","tab.retire":"退休試算","tabs.group":"工具",
  "r.h1":"退休","r.tag":"靠股息",
  "r.sub":"只靠股息支付每月開銷,需要多少投資組合?你的儲蓄能否達成?並比較荷蘭新舊 Box 3 稅制。",
  "r.you":"個人","r.age":"目前年齡","r.retire":"退休年齡","r.until":"規劃至年齡",
  "r.salary":"每年稅後薪資","r.raise":"每年加薪 %","r.invest":"投資薪資的 %","r.start":"目前投資金額",
  "r.goal":"退休生活","r.cost":"退休後每月開銷(以今日幣值)","r.infl":"每年通膨率 %",
  "r.market":"投資","r.yield":"股息殖利率 %","r.growth":"每年股價成長 %",
  "r.box3":"Box 3 稅","r.partner":"有稅務伴侶(免稅額加倍)",
  "r.old":"舊 Box 3(視同報酬)","r.new":"新 Box 3(實際報酬)",
  "r.oRate":"稅率 %","r.oDeemed":"視同報酬率 %","r.oFree":"每人免稅資產",
  "r.nRate":"稅率 %","r.nFree":"每人免稅報酬",
  "r.box3Hint":"預設值為 2025 年規定及新制法案。免稅額與每月開銷隨通膨調整。假設股息預扣稅可抵扣。",
  "r.mort":"房貸","r.mBal":"目前房貸餘額",
  "r.mFrom":"起始年","r.mTo":"結束年","r.mRate":"利率 %","r.mPay":"每月",
  "r.mPayPh":"自動","r.mAdd":"新增期間","r.mDel":"移除期間",
  "r.mHint":"「每月」留空則以本息平均攤還,於最後一年還清。工作期間由薪資支付,退休後由投資組合支付。",
  "r.need":"退休時所需","r.have":"你將擁有","r.gap":"尚差","r.surplus":"超出",
  "r.pct":"需投資薪資的 {p}% 才能達成","r.pctNo":"即使投資 100% 薪資也無法達成",
  "r.never":"僅靠股息無法達成:稅後股息永遠不足以支付開銷。",
  "r.atRetire":"在 {age} 歲({year} 年)每年需要 {cost}:每月 {month}{mort}。",
  "r.atRetireMort":",其中每年房貸 {m}",
  "r.afterMort":"房貸還清後:需要 {v}。",
  "r.mortLeft":"退休時仍欠房貸:{v}。",
  "r.netDiv":"退休第一年稅後股息:每年 {v}。",
  "r.lasts":"資金在 {age} 歲用完。","r.lastsOk":"資金可撐過 {age} 歲。",
  "r.sells":"從 {age} 歲起股息不足以支付開銷,需賣出股票。",
  "r.chart":"各年齡的投資組合","r.chartAlt":"折線圖:新舊 Box 3 下預估的投資組合,並標示退休時所需金額。",
  "r.legOld":"舊 Box 3","r.legNew":"新 Box 3","r.legNeed":"所需","r.legRetire":"退休",
  "r.table":"逐年明細",
  "c.year":"年份","c.age":"年齡","c.salary":"薪資","c.contrib":"投入","c.spend":"支出",
  "c.left":"薪資餘額","c.mInt":"房貸利息","c.mPaid":"房貸支付","c.mBal":"房貸餘額",
  "c.wOld":"投資組合(舊)","c.taxOld":"稅(舊)","c.wNew":"投資組合(新)","c.taxNew":"稅(新)",
  "r.disc":"僅為估算,並非理財建議。假設每年報酬穩定,但實際市場並非如此。"
});

const NOW_YEAR = new Date().getFullYear();
const R_FIELDS = {age:35,retire:60,until:95,salary:50000,raise:2.5,invest:20,start:25000,
  cost:3000,infl:2.5,yield:3.5,growth:3,oRate:36,oDeemed:5.88,oFree:57684,nRate:36,nFree:1800,mBal:250000};
const R_DEFAULT_MORT = [{from:NOW_YEAR,to:NOW_YEAR+9,rate:3.8,pay:""},{from:NOW_YEAR+10,to:NOW_YEAR+24,rate:4.2,pay:""}];

const rNum = id => { const v = Number($("#r-"+id).value); return Number.isFinite(v) ? v : 0; };
const money = v => new Intl.NumberFormat(lang==="zh-TW"?"zh-TW":"en-GB",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
const short = v => { const a=Math.abs(v); return a>=1e6?(v/1e6).toFixed(a>=1e7?0:1)+"M":a>=1e3?Math.round(v/1e3)+"k":String(Math.round(v)); };

/* ---------- inputs ---------- */
function mortRow(r){
  const tr=document.createElement("tr");
  tr.innerHTML=`<td><input type="number" class="m-from" step="1" value="${esc(r.from)}"></td>
<td><input type="number" class="m-to" step="1" value="${esc(r.to)}"></td>
<td><input type="number" class="m-rate" step="0.01" value="${esc(r.rate)}"></td>
<td><input type="number" class="m-pay" step="10" value="${esc(r.pay)}" data-i18n-placeholder="r.mPayPh" placeholder="${esc(t("r.mPayPh"))}"></td>
<td><button type="button" class="small m-del" data-i18n-title="r.mDel" data-i18n-aria-label="r.mDel" title="${esc(t("r.mDel"))}" aria-label="${esc(t("r.mDel"))}">✕</button></td>`;
  tr.querySelector(".m-del").addEventListener("click",()=>{ tr.remove(); recalc(); });
  $("#r-mRows").appendChild(tr);
}
function readMort(){
  return [...document.querySelectorAll("#r-mRows tr")].map(tr=>{
    const g=c=>tr.querySelector(c).value;
    return {from:Number(g(".m-from")),to:Number(g(".m-to")),rate:Number(g(".m-rate"))||0,pay:g(".m-pay")===""?"":Number(g(".m-pay"))};
  }).filter(r=>Number.isFinite(r.from)&&Number.isFinite(r.to)&&r.to>=r.from);
}
function readInputs(){
  const o={}; for(const k in R_FIELDS) o[k]=rNum(k);
  o.partner=$("#r-partner").checked; o.mort=readMort(); return o;
}
function saveInputs(o){ try{ localStorage.setItem("retire",JSON.stringify(o)); }catch(_){} }
function loadInputs(){
  let o=null; try{ o=JSON.parse(localStorage.getItem("retire")||"null"); }catch(_){}
  for(const k in R_FIELDS) $("#r-"+k).value = o&&Number.isFinite(o[k]) ? o[k] : R_FIELDS[k];
  $("#r-partner").checked=!!(o&&o.partner);
  (o&&Array.isArray(o.mort)?o.mort:R_DEFAULT_MORT).forEach(mortRow);
}

/* ---------- model ---------- */
// Mortgage by calendar year, month by month. A period without a fixed payment gets an annuity
// that clears the balance by the end of the last period.
function mortgageYears(bal,periods){
  const out=new Map(); if(!(bal>0)||!periods.length) return out;
  const last=Math.max(...periods.map(p=>p.to));
  for(let y=NOW_YEAR;y<=last;y++){
    const p=periods.find(q=>y>=q.from&&y<=q.to);
    let interest=0, paid=0;
    if(p&&bal>0){
      const r=p.rate/100/12;
      for(let m=0;m<12&&bal>0;m++){
        const n=(last-y+1)*12-m;
        const pay=p.pay!==""?p.pay:(r?bal*r/(1-Math.pow(1+r,-n)):bal/n);
        const i=bal*r, princ=Math.min(bal,pay-i);
        interest+=i; paid+=i+princ; bal-=princ;
      }
    }
    out.set(y,{interest,paid,bal:Math.max(0,bal)});
  }
  return out;
}

// Box 3 tax for one year on a portfolio of w. f = inflation index for the tax-free amounts.
function box3(regime,inp,w,div,gain,f){
  const people=inp.partner?2:1;
  if(regime==="old") return inp.oRate/100*inp.oDeemed/100*Math.max(0,w-inp.oFree*people*f);
  return inp.nRate/100*Math.max(0,div+gain-inp.nFree*people*f);
}

// Portfolio needed so that dividends after box 3 tax pay `spend` per year, with the tax also paid from dividends.
function needed(regime,inp,spend,f){
  const y=inp.yield/100, g=inp.growth/100, people=inp.partner?2:1;
  if(spend<=0) return 0;
  if(y<=0) return Infinity;
  if(regime==="old"){
    const rd=inp.oRate/100*inp.oDeemed/100, free=inp.oFree*people*f;
    if(spend/y<=free) return spend/y;
    return y>rd?Math.max(free,(spend-rd*free)/(y-rd)):Infinity;
  }
  const r=inp.nRate/100, free=inp.nFree*people*f;
  if(spend/y*(y+g)<=free) return spend/y;
  const den=y-r*(y+g);
  return den>0?(spend-r*free)/den:Infinity;
}

function simulate(regime,inp,investPct,mort){
  const rows=[]; let w=inp.start, salary=inp.salary, firstSell=null, broke=null;
  for(let age=inp.age, yr=NOW_YEAR; age<=inp.until; age++, yr++){
    const f=Math.pow(1+inp.infl/100,yr-NOW_YEAR), working=age<inp.retire;
    const m=mort.get(yr)||{interest:0,paid:0,bal:mort.size?[...mort.values()].pop().bal:Math.max(0,inp.mBal)};
    const div=w*inp.yield/100, gain=w*inp.growth/100, tax=box3(regime,inp,w,div,gain,f);
    const contrib=working?salary*investPct/100:0;
    const spend=working?0:inp.cost*12*f+m.paid;
    if(!working&&firstSell==null&&div-tax<spend-0.5) firstSell=age;
    rows.push({yr,age,salary:working?salary:0,contrib,spend,left:working?salary-contrib-m.paid:0,
      mInt:m.interest,mPaid:m.paid,mBal:m.bal,w,tax});
    w=Math.max(0,w+div+gain-tax+contrib-spend);
    if(w<=0&&broke==null&&!working) broke=age;
    if(working) salary*=1+inp.raise/100;
  }
  return {rows,firstSell,broke};
}

function analyse(regime,inp,mort){
  const yrs=inp.retire-inp.age, yr=NOW_YEAR+yrs, f=Math.pow(1+inp.infl/100,yrs);
  const m=mort.get(yr), mPaid=m?m.paid:0, costYear=inp.cost*12*f;
  const need=needed(regime,inp,costYear+mPaid,f), needNoMort=needed(regime,inp,costYear,f);
  const atRetire=s=>{ const row=s.rows.find(r=>r.age===inp.retire); return row?row.w:s.rows.length?s.rows[s.rows.length-1].w:inp.start; };
  const sim=simulate(regime,inp,inp.invest,mort), have=atRetire(sim);
  let pct=null;
  if(Number.isFinite(need)){
    if(atRetire(simulate(regime,inp,100,mort))>=need){
      let lo=0, hi=100;
      for(let i=0;i<40;i++){ const mid=(lo+hi)/2; if(atRetire(simulate(regime,inp,mid,mort))>=need) hi=mid; else lo=mid; }
      pct=hi;
    } else pct=Infinity;
  }
  const div=have*inp.yield/100, netDiv=div-box3(regime,inp,have,div,have*inp.growth/100,f);
  return {need,needNoMort,have,pct,sim,yr,costYear,mPaid,mortLeft:m?m.bal+m.paid-m.interest:0,netDiv};
}

/* ---------- output ---------- */
function card(regime,a,inp){
  const legend=t(regime==="old"?"r.old":"r.new");
  if(!Number.isFinite(a.need)) return `<div class="rcard"><h3>${esc(legend)}</h3><p class="rwarn">${esc(t("r.never"))}</p>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(money(a.have))}</b></div></div>`;
  const diff=a.have-a.need;
  const pctTxt=a.pct===Infinity?t("r.pctNo"):a.pct!=null?t("r.pct",{p:a.pct.toFixed(1)}):"";
  const notes=[];
  if(a.mPaid>0&&Number.isFinite(a.needNoMort)) notes.push(t("r.afterMort",{v:money(a.needNoMort)}));
  notes.push(t("r.netDiv",{v:money(a.netDiv)}));
  if(a.sim.firstSell!=null) notes.push(t("r.sells",{age:a.sim.firstSell}));
  notes.push(a.sim.broke!=null?t("r.lasts",{age:a.sim.broke}):t("r.lastsOk",{age:inp.until}));
  return `<div class="rcard ${regime}"><h3>${esc(legend)}</h3>
<div class="kv"><span>${esc(t("r.need"))}</span><b>${esc(money(a.need))}</b></div>
<div class="kv"><span>${esc(t("r.have"))}</span><b>${esc(money(a.have))}</b></div>
<div class="kv ${diff>=0?"ok":"bad"}"><span>${esc(t(diff>=0?"r.surplus":"r.gap"))}</span><b>${esc(money(Math.abs(diff)))}</b></div>
<p class="rpct ${diff>=0?"ok":"bad"}">${esc(pctTxt)}</p>
<ul class="rnotes">${notes.map(n=>`<li>${esc(n)}</li>`).join("")}</ul></div>`;
}

function chart(inp,o,nw){
  const W=640,H=260,L=52,R=10,T=12,B=28;
  const rowsO=o.sim.rows, rowsN=nw.sim.rows; if(!rowsO.length) return "";
  const pts=[...rowsO.map(r=>r.w),...rowsN.map(r=>r.w),...[o.need,nw.need].filter(Number.isFinite)];
  const maxY=Math.max(1,...pts)*1.05, a0=inp.age, a1=Math.max(inp.age+1,inp.until);
  const x=a=>L+(a-a0)/(a1-a0)*(W-L-R), y=v=>T+(1-v/maxY)*(H-T-B);
  const line=(rows,cls)=>`<polyline class="${cls}" fill="none" stroke-width="2.5" stroke-linejoin="round" points="${rows.map(r=>x(r.age).toFixed(1)+","+y(r.w).toFixed(1)).join(" ")}"/>`;
  const ticks=[]; for(let i=0;i<=4;i++){ const v=maxY*i/4; ticks.push(`<line class="ch-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ch-lbl" x="${L-6}" y="${y(v)+4}" text-anchor="end">${short(v)}</text>`); }
  const step=Math.max(5,Math.ceil((a1-a0)/8/5)*5);
  for(let a=Math.ceil(a0/step)*step;a<=a1;a+=step) ticks.push(`<text class="ch-lbl" x="${x(a)}" y="${H-8}" text-anchor="middle">${a}</text>`);
  const rx=x(inp.retire);
  const dot=(v,cls)=>Number.isFinite(v)?`<circle class="${cls}" cx="${rx}" cy="${y(v)}" r="5" stroke-width="2"/>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("r.chartAlt"))}">${ticks.join("")}
<line class="ch-retire" x1="${rx}" x2="${rx}" y1="${T}" y2="${H-B}" stroke-dasharray="4 4"/>
${line(rowsO,"ch-old")}${line(rowsN,"ch-new")}${dot(o.need,"ch-need-old")}${dot(nw.need,"ch-need-new")}</svg>
<div class="legend"><span class="sw old"></span>${esc(t("r.legOld"))}<span class="sw new"></span>${esc(t("r.legNew"))}<span class="sw need"></span>${esc(t("r.legNeed"))}<span class="sw retire"></span>${esc(t("r.legRetire"))}</div>`;
}

function table(o,nw){
  const cols=["c.year","c.age","c.salary","c.contrib","c.left","c.spend","c.mInt","c.mPaid","c.mBal","c.wOld","c.taxOld","c.wNew","c.taxNew"];
  const body=o.sim.rows.map((r,i)=>{ const n=nw.sim.rows[i];
    const cells=[r.yr,r.age,money(r.salary),money(r.contrib),money(r.left),money(r.spend),money(r.mInt),money(r.mPaid),money(r.mBal),money(r.w),money(r.tax),money(n.w),money(n.tax)];
    return `<tr${r.spend>0?' class="ret"':""}>${cells.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`; }).join("");
  return `<div class="tblwrap"><table class="rtable"><thead><tr>${cols.map(c=>`<th>${esc(t(c))}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function recalc(){
  const inp=readInputs(); saveInputs(inp);
  if(inp.retire<inp.age) inp.retire=inp.age;
  if(inp.until<inp.retire) inp.until=inp.retire;
  const mort=mortgageYears(inp.mBal,inp.mort);
  const o=analyse("old",inp,mort), nw=analyse("new",inp,mort);
  const head=t("r.atRetire",{age:inp.retire,year:o.yr,cost:money(o.costYear+o.mPaid),month:money((o.costYear+o.mPaid)/12),
    mort:o.mPaid>0?t("r.atRetireMort",{m:money(o.mPaid)}):""});
  const left=o.mortLeft>0.5?" "+t("r.mortLeft",{v:money(o.mortLeft)}):"";
  $("#r-out").innerHTML=`<p class="rhead">${esc(head+left)}</p>
<div class="rcards">${card("old",o,inp)}${card("new",nw,inp)}</div>
<section><h2 class="rsec">${esc(t("r.chart"))}</h2>${chart(inp,o,nw)}</section>
<details><summary>${esc(t("r.table"))}</summary>${table(o,nw)}</details>
<p class="sub">${esc(t("r.disc"))}</p>`;
}

/* ---------- tabs ---------- */
function showTab(name){
  const retire=name==="retire";
  document.body.classList.toggle("tab-retire",retire);
  document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===name)));
  if(retire) recalc(); else map.invalidateSize();
}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{
  history.replaceState(null,"",b.dataset.tab==="retire"?"#retire":location.pathname+location.search);
  showTab(b.dataset.tab);
}));
window.addEventListener("hashchange",()=>showTab(location.hash==="#retire"?"retire":"transit"));

loadInputs();
$("#r-form").addEventListener("input",recalc);
$("#r-form").addEventListener("submit",e=>e.preventDefault());
$("#r-mAdd").addEventListener("click",()=>{
  const rows=readMort(), lastTo=rows.length?Math.max(...rows.map(r=>r.to)):NOW_YEAR-1;
  mortRow({from:lastTo+1,to:lastTo+10,rate:rows.length?rows[rows.length-1].rate:4,pay:""}); recalc();
});
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{ if(document.body.classList.contains("tab-retire")) recalc(); }));
applyLang(lang,false);
showTab(location.hash==="#retire"?"retire":"transit");
