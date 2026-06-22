// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════
let B = {}; // bestiary: name -> {data, sna_level}
let R = {}; // ratings: level -> name -> {tier, tags, note}
let S = { round:0, groups:[], effects:[], feats:{}, buffs:{} };
let nGid = 1, nCid = 1, addBuffPopup = null;

// ═══════════════════════════════════════════════════════════════
//  ICONS (inline SVG)
// ═══════════════════════════════════════════════════════════════
const IC = {
  // MDI filled icon set — consistent style on dark backgrounds
  hp: (cls='') => `<svg class="icon icon-hp ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z"/></svg>`,
  ac: (cls='') => `<svg class="icon icon-ac ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5z"/></svg>`,
  // Crossed swords for Attack column
  atk: (cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="m6.2 2.44l11.9 11.9l2.12-2.12l1.41 1.41l-2.47 2.47l3.18 3.18c.39.39.39 1.02 0 1.41l-.71.71a.996.996 0 0 1-1.41 0L17 18.23l-2.44 2.47l-1.41-1.41l2.12-2.12l-11.9-11.9V2.44zM15.89 10l4.74-4.74V2.44H17.8l-4.74 4.74zm-4.95 5l-2.83-2.87l-2.21 2.21l-2.12-2.12l-1.41 1.41l2.47 2.47l-3.18 3.19a.996.996 0 0 0 0 1.41l.71.71c.39.39 1.02.39 1.41 0L7 18.23l2.44 2.47l1.41-1.41l-2.12-2.12z"/></svg>`,
  // Broken heart for Damage column
  dmg: (cls='') => `<svg class="icon icon-dmg ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c.67 0 1.32.12 1.94.33L13 9.35l-4 5zM16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35l-1-7l4.5-5l-2.65-5.08C13.87 3.47 15.17 3 16.5 3"/></svg>`,
  // Cycle/round icon (current round)
  cycle: (cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6v3l4-4l-4-4v3a8 8 0 0 0-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12a6 6 0 0 1 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 0 1-6 6v-3l-4 4l4 4v-3a8 8 0 0 0 8-8c0-1.57-.46-3.03-1.24-4.26"/></svg>`,
  // Timer/stopwatch (rounds remaining)
  countdown: (cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="m19.03 7.39l1.42-1.42c-.45-.51-.9-.97-1.41-1.41L17.62 6c-1.55-1.26-3.5-2-5.62-2a9 9 0 0 0 0 18c5 0 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61M13 14h-2V7h2zm2-13H9v2h6z"/></svg>`,
  // Sigma/sum (running total)
  sum: (cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path fill="currentColor" d="M18 6H8.83l6 6l-6 6H18v2H6v-2l6-6l-6-6V4h12z"/></svg>`,
  // Per-attack special icons (small colored pips)
  grab: `<span class="pip pip-grab"></span>`,
  trip: `<span class="pip pip-trip"></span>`,
  poison: `<span class="pip pip-poison"></span>`,
  burn: `<span class="pip pip-burn"></span>`,
  disease: `<span class="pip pip-disease"></span>`,
  stun: `<span class="pip pip-stun"></span>`,
};

// Damage type by attack name (PF1e Universal Monster Rules)
const DMG_TYPE = {
  bite:'B/P/S', claw:'B/S', gore:'P', horn:'P', slam:'B', sting:'P',
  rake:'B/S', hoof:'B', tail:'B', talon:'S', wing:'B', pincers:'B',
  tentacle:'B', dagger:'P/S', sword:'S', mace:'B', rock:'B',
};
function getDmgType(name) {
  const n = name.toLowerCase().replace(/\s*\d+$/, '').replace(/\s*\([^)]*\)/, '').trim();
  return DMG_TYPE[n] || 'B/P/S';
}

// ═══════════════════════════════════════════════════════════════
//  DICE (Crypto)
// ═══════════════════════════════════════════════════════════════
let rng = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0]; };
let dd = s => { if (s <= 0) return 1; if (s === 1) return 1; const limit = (0x100000000 - (0x100000000 % s)) >>> 0; if (limit === 0) return (rng() % s) + 1; let v; do { v = rng(); } while (v >= limit); return (v % s) + 1; };
let d20 = () => dd(20);
function rdice(n) {
  const m = n.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return {t:0,r:[],m:0};
  const [nc,sc,mc] = [+m[1],+m[2],+(m[3]||0)];
  const rolls = Array.from({length:nc},()=>dd(sc));
  return {t:Math.max(1,rolls.reduce((a,b)=>a+b,0)+mc), r:rolls, m:mc};
}

// ═══════════════════════════════════════════════════════════════
//  BUFFS
// ═══════════════════════════════════════════════════════════════
const BD = {
  prayer:{a:1,d:1,s:1,ty:'luck'},bless:{a:1,d:0,s:0,ty:'morale'}, // prayer = LUCK (stacks w/ morale); bless = morale (+1 atk, +1 vs fear)
  destruction:{a:0,d:4,s:0,ty:'sacred'},justice:{a:3,d:0,s:0,ty:'sacred'},
  smiting:{a:0,d:0,s:0,ty:'sp'},haste:{a:1,d:0,s:0,ty:'haste',extra:1},
  heroism:{a:2,d:0,s:2,ty:'morale'},
  fh4:{a:0,d:0,s:0,ty:'sp',fh:4},
  rage:{a:1,d:1,s:0,ac:-2,ty:'u'}, // Rage: +2 Str → +1 atk/dmg, +2 Con → +1 HP/HD, -2 AC
  // Greater Magic Fang (enhancement to attack+damage on natural weapons). Dual nature:
  gmf:{a:0,d:0,s:0,ty:'enh',gmf:true}, // one natural weapon: +1 per 4 CL (max +5), value computed via gmfBonus()
  gmfAll:{a:1,d:1,s:0,ty:'enh'},       // alternative: ALL natural weapons, flat +1 regardless of CL
};
// Greater Magic Fang primary-mode bonus: +1 per four caster levels, min +1, max +5.
function gmfBonus(){
  const el=(typeof document!=='undefined')&&document.getElementById('inp-cl');
  const cl=el?(+el.value||0):10;
  return Math.max(1,Math.min(5,Math.floor(cl/4)));
}
function avgDmg(s){ const m=(s||'').match(/^(\d+)d(\d+)([+-]\d+)?$/); return m ? (+m[1])*((+m[2])+1)/2 + (+(m[3]||0)) : 0; }
// GMF "one natural weapon" = ONE attack source. Multiple appendages — a "2 claws" line parses to
// "claw 1"/"claw 2" — are SEPARATE natural weapons, so only ONE is enhanced. Multiple attacks with the
// SAME single weapon (Zerda's two "bite" attacks via animal-companion Multiattack — identical name) all
// benefit, since the enhancement is on that one weapon. Grouped by EXACT name: parseMelee numbers paired
// appendages but leaves single-weapon repeats unnumbered. "Best" = weapon making the most attacks (more
// applications of +X), tiebreak highest attack bonus, then highest average damage. Returns name or null.
function gmfBestWeapon(c){
  if(!c.attacks||!c.attacks.length) return null;
  const groups={};
  for(const a of c.attacks){
    const name=a.name.toLowerCase();
    groups[name]=groups[name]||{count:0,maxBonus:-99,maxDmg:0};
    groups[name].count++;
    groups[name].maxBonus=Math.max(groups[name].maxBonus,a.bonus);
    groups[name].maxDmg=Math.max(groups[name].maxDmg,avgDmg(a.dmg));
  }
  let best=null,bg=null;
  for(const[name,g] of Object.entries(groups)){
    if(!bg || g.count>bg.count
       || (g.count===bg.count && g.maxBonus>bg.maxBonus)
       || (g.count===bg.count && g.maxBonus===bg.maxBonus && g.maxDmg>bg.maxDmg)){best=name;bg=g;}
  }
  return best;
}
function bTotal(overrides) {
  const by = {};
  for (const [id,on] of Object.entries(S.buffs)) {
    if (!on) continue;
    if (overrides && overrides[id] === false) continue;
    const def = BD[id]; if (!def) continue;
    if (id==='gmf') continue; // Greater Magic Fang (one weapon) is applied per-weapon in computeRoll, not uniformly
    const t = def.ty;
    if (t==='u'||t==='sp'||t==='haste') {
      by[id] = by[id]||{a:0,d:0,s:0,ac:0,extra:0,fh:0};
      by[id].a+=def.a; by[id].d+=def.d; by[id].s+=def.s; by[id].ac+=(def.ac||0);
      if(def.extra) by[id].extra=1; if(def.fh) by[id].fh=def.fh;
    } else {
      by[t]=by[t]||{a:0,d:0,s:0,ac:0,extra:0,fh:0};
      by[t].a=Math.max(by[t].a,def.a); by[t].d=Math.max(by[t].d,def.d);
      by[t].s=Math.max(by[t].s,def.s); by[t].ac+=(def.ac||0);
      if(def.extra) by[t].extra=1; if(def.fh) by[t].fh=Math.max(by[t].fh,def.fh);
    }
  }
  // Second pass: local-only buffs (override=true, global off)
  if (overrides) {
    for (const [id, val] of Object.entries(overrides)) {
      if (val !== true || S.buffs[id]) continue;
      const def = BD[id]; if (!def) continue;
      if (id==='gmf') continue; // applied per-weapon in computeRoll
      const t = def.ty;
      if (t==='u'||t==='sp'||t==='haste') {
        by[id]=by[id]||{a:0,d:0,s:0,ac:0,extra:0,fh:0};
        by[id].a+=def.a;by[id].d+=def.d;by[id].s+=def.s;by[id].ac+=(def.ac||0);
        if(def.extra)by[id].extra=1;if(def.fh)by[id].fh=def.fh;
      } else {
        by[t]=by[t]||{a:0,d:0,s:0,ac:0,extra:0,fh:0};
        by[t].a=Math.max(by[t].a,def.a);by[t].d=Math.max(by[t].d,def.d);
        by[t].s=Math.max(by[t].s,def.s);by[t].ac+=(def.ac||0);
        if(def.extra)by[t].extra=1;if(def.fh)by[t].fh=Math.max(by[t].fh,def.fh);
      }
    }
  }
  const r={a:0,d:0,s:0,ac:0,extra:0,fh:0};
  for(const v of Object.values(by)){r.a+=v.a;r.d+=v.d;r.s+=v.s;r.ac+=v.ac;if(v.extra)r.extra=1;r.fh=Math.max(r.fh,v.fh||0);}
  return r;
}

// ═══════════════════════════════════════════════════════════════
//  MELEE PARSER
// ═══════════════════════════════════════════════════════════════
function parseMelee(str) {
  if(!str||str.toLowerCase()==='none') return [];
  const atks=[], segs=[]; let depth=0, cur='';
  for(const ch of str){if(ch==='('){depth++;cur+=ch;}else if(ch===')'){depth--;cur+=ch;}else if(ch===','&&depth===0){segs.push(cur.trim());cur='';}else cur+=ch;}
  if(cur.trim())segs.push(cur.trim());
  for(const seg of segs){
    const pm=seg.match(/\(([^)]+)\)/);let dmg='1d4',sp=[],cr=20,cm=2;
    if(pm){const pc=pm[1];const dm=pc.match(/^(\d+d\d+(?:[+-]\d+)?)/);if(dm)dmg=dm[1];
      const c1=pc.match(/\/(\d+)[–-]20/);if(c1)cr=+c1[1];const c2=pc.match(/[×x](\d+)/);if(c2)cm=+c2[1];
      for(const kw of['grab','trip','poison','constrict','rake','rend','attach','burn','pull','push','disease','stun'])if(pc.toLowerCase().includes(kw))sp.push(kw);
    }
    let bef=pm?seg.slice(0,seg.indexOf('(')).trim():seg.trim();
    // Handle melee touch attacks: "tail -2 touch" → strip "touch", flag attack
    const isTouch = /\s+touch\s*$/i.test(bef);
    if (isTouch) bef = bef.replace(/\s+touch\s*$/i, '').trim();
    const nm=bef.match(/^(?:(\d+)\s+)?([\w\s]+?)\s+([+-]?\d+)\s*$/);
    if(nm){const cnt=nm[1]?+nm[1]:1,name=nm[2].trim().replace(/s$/,''),bonus=+nm[3];
      for(let i=0;i<cnt;i++)atks.push({name:cnt>1?`${name} ${i+1}`:name,bonus,dmg,cr,cm,sp:[...sp]});
    }
  }
  return atks;
}

// ═══════════════════════════════════════════════════════════════
//  TIER LOGIC
// ═══════════════════════════════════════════════════════════════
function tierOpts(slot) {
  const o=[{id:'top',lbl:`1x SNA ${slot}`,sna:slot,expr:'1'}];
  if(slot>=2) o.push({id:'lower',lbl:`1d3 SNA ${slot-1}`,sna:slot-1,expr:'1d3'});
  if(slot>=3) o.push({id:'lowest',lbl:`1d4+1 SNA ${slot-2}`,sna:slot-2,expr:'1d4+1'});
  return o;
}
function rollCount(expr){if(expr==='1')return 1;let t=rdice(expr).t;if(S.feats.superior)t++;return t;}

function updTiers(){
  const slot=+document.getElementById('inp-slot').value;
  const sel=document.getElementById('inp-tier');
  const opts=tierOpts(slot);
  sel.innerHTML=opts.map(o=>`<option value="${o.id}">${o.lbl}${S.feats.superior&&o.expr!=='1'?' (+1 sup)':''}</option>`).join('');
  updCreatures();
}

let creatureList = []; // current dropdown items
let selectedCreature = '';
function updCreatures(){
  const slot=+document.getElementById('inp-slot').value;
  const tierId=document.getElementById('inp-tier').value;
  const opts=tierOpts(slot);
  const tier=opts.find(o=>o.id===tierId)||opts[0];
  const lvRatings = R[tier.sna] || {};
  const sorted=Object.values(B).filter(b=>b.sna_level===tier.sna)
    .sort((a,b)=>{
      const ra=lvRatings[a.data.name]?.tier||'U', rb=lvRatings[b.data.name]?.tier||'U';
      const order={S:0,A:1,B:2,C:3,U:4};
      const tierDiff=(order[ra]??4)-(order[rb]??4);
      if(tierDiff!==0) return tierDiff;
      const aAlt=a.data.is_alternate?1:0, bAlt=b.data.is_alternate?1:0;
      if(aAlt!==bAlt) return aAlt-bAlt;
      return a.data.name.localeCompare(b.data.name);
    });
  creatureList = sorted.map(b=>{
    const c=b.data.combat_card;
    const rating=lvRatings[b.data.name];
    return {name:b.data.name, hp:c.HP, ac:c.AC, tier:rating?.tier||'U', note:rating?.note||'', alt:b.data.is_alternate, src:b.data.source||'core'};
  });
  renderCreatureDropdown('');
  if(creatureList.length && !creatureList.find(c=>c.name===selectedCreature)) {
    selectedCreature=creatureList[0].name;
  }
  updDropDisplay();
}
function renderCreatureDropdown(filter){
  const el=document.getElementById('cdrop-items');
  if(!el) return;
  const f=filter.toLowerCase();
  // Set name column width based on longest name (approx 7.2px per char in monospace 12px)
  const maxLen = creatureList.reduce((m,c)=>Math.max(m,c.name.length),0);
  el.style.setProperty('--name-col', Math.ceil(maxLen * 7.4 + 12) + 'px');
  el.innerHTML=creatureList.filter(c=>!f||c.name.toLowerCase().includes(f)||c.note.toLowerCase().includes(f))
    .map(c=>`<div class="cdrop-item ${c.name===selectedCreature?'active':''}" onclick="selectCreature('${c.name.replace(/'/g,"\\'")}')">
      <span class="tier tier-${c.tier}">${c.tier}</span>
      <span class="cdrop-name">${c.name}${c.alt?` <span class="cdrop-note">[${c.src}]</span>`:''}</span>
      ${c.note?`<span class="cdrop-note">│ ${c.note}</span>`:'<span></span>'}
      <span class="cdrop-stats">${c.hp}${IC.hp('icon-sm')} ${c.ac}${IC.ac('icon-sm')}</span>
    </div>`).join('');
}
function updDropDisplay(){
  const c=creatureList.find(x=>x.name===selectedCreature);
  const el=document.getElementById('cdrop-text');
  if(!el) return;
  if(c) el.innerHTML=`<span class="tier tier-${c.tier}">${c.tier}</span> ${c.name} <span class="cdrop-stats">${c.hp}${IC.hp('icon-sm')} ${c.ac}${IC.ac('icon-sm')}</span>`;
  else el.textContent='Select...';
}
function selectCreature(name){
  selectedCreature=name;
  updDropDisplay();
  document.getElementById('creature-drop').classList.remove('open');
}
function toggleCreatureDrop(){
  const el=document.getElementById('creature-drop');
  el.classList.toggle('open');
  if(el.classList.contains('open')){
    const search=el.querySelector('.cdrop-search');
    search.value='';
    renderCreatureDropdown('');
    const items=document.getElementById('cdrop-items');
    setTimeout(()=>{ search.focus(); items.scrollTop=0; },0);
  }
}
function filterCreatures(v){ renderCreatureDropdown(v); }
if (typeof globalThis.__TEST__ === 'undefined') document.addEventListener('click',e=>{
  const drop=document.getElementById('creature-drop');
  if(drop && !drop.contains(e.target)) drop.classList.remove('open');
  // Close numpad on outside click
  const pad=document.getElementById('numpad');
  if(NP.open && pad && !pad.contains(e.target)) closeNumpad();
  // Close buff-add popup on outside click
  if(addBuffPopup && !addBuffPopup.contains(e.target) && !e.target.classList.contains('buff-add-btn')) closeAddBuff();
});
function toggleTray(name) {
  const panel = document.getElementById('tray-'+name);
  const tab = document.getElementById('tab-'+name);
  const wasOpen = panel.classList.contains('open');
  // Close all trays first
  document.querySelectorAll('.tray-panel').forEach(p=>p.classList.remove('open'));
  document.querySelectorAll('.tray-tab').forEach(t=>t.classList.remove('active'));
  // Toggle the clicked one
  if (!wasOpen) { panel.classList.add('open'); tab.classList.add('active'); }
}

// ═══════════════════════════════════════════════════════════════
//  PRE-ROLL — sorted roll table
// ═══════════════════════════════════════════════════════════════
function preRoll(c) {
  // Store RAW dice rolls — bonuses computed at render time so buff toggles don't re-roll
  const rawRows = [];
  const rawGrabs = [];

  for (const atk of c.attacks) {
    const r = d20();
    const dr = rdice(atk.dmg);
    let critConf = 0, critDmgRaw = 0, fumbleConf = 0;
    const threat = r >= atk.cr && r !== 1;

    if (threat) {
      critConf = d20();
      // Crit multiplier: x2 = 1 extra roll, x3 = 2 extra rolls, x4 = 3 extra
      const extraRolls = (atk.cm || 2) - 1;
      critDmgRaw = 0;
      for (let cr = 0; cr < extraRolls; cr++) critDmgRaw += rdice(atk.dmg).t;
    }
    if (r === 1) {
      fumbleConf = d20();
    }

    rawRows.push({
      name: atk.name, r, baseBonus: atk.bonus, baseDmg: dr.t, dmgDice: atk.dmg, dmgRolls: dr.r, dmgMod: dr.m,
      critConf, critDmgRaw, fumbleConf, fumbleBonus: atk.bonus,
      cr: atk.cr, cm: atk.cm, specials: atk.sp,
      nat20: r===20, nat1: r===1, threat, isRake: false, primary: atk.primary || false,
    });

    if (atk.sp.includes('grab') && c.cmb) {
      rawGrabs.push({ atk: atk.name, d20: d20(), baseCmb: c.cmb + 4 });
    }
  }

  // Maintain grapple roll (always pre-roll if creature has grab)
  let maintainRoll = null;
  let maintainDmgRaw = null;
  let grabAtkName = '', grabAtkDmg = '';
  const grabAtk = c.attacks.find(a => a.sp.includes('grab'));
  if (grabAtk && c.cmb) {
    maintainRoll = { d20: d20(), baseCmb: c.cmb + 9 }; // +4 grab, +5 circumstance
    maintainDmgRaw = rdice(grabAtk.dmg);
    grabAtkName = grabAtk.name;
    grabAtkDmg = grabAtk.dmg;
  }

  // Rake attacks (always pre-roll; computeRoll filters by pounce/grapple state)
  if (c.hasRake && c.rakeAtks.length > 0) {
    for (const atk of c.rakeAtks) {
      const r = d20();
      const dr = rdice(atk.dmg);
      const rThreat = r >= (atk.cr||20) && r !== 1;
      let rCritConf = 0, rCritDmgRaw = 0, rFumbleConf = 0;
      if (rThreat) {
        rCritConf = d20();
        const extraRolls = (atk.cm || 2) - 1;
        for (let cr2 = 0; cr2 < extraRolls; cr2++) rCritDmgRaw += rdice(atk.dmg).t;
      }
      if (r === 1) rFumbleConf = d20();
      rawRows.push({
        name: atk.name, r, baseBonus: atk.bonus, baseDmg: dr.t, dmgDice: atk.dmg, dmgRolls: dr.r, dmgMod: dr.m,
        critConf:rCritConf, critDmgRaw:rCritDmgRaw, fumbleConf:rFumbleConf, fumbleBonus:atk.bonus,
        cr:atk.cr||20, cm:atk.cm||2, specials:atk.sp||[],
        nat20:r===20, nat1:r===1, threat:rThreat, isRake:true,
      });
    }
  }

  // Haste slot (raw roll, uses best attack bonus)
  const hasHaste = bTotal(c.buffOvr).extra; // check now but re-eval at render
  if (c.attacks.length > 0) {
    const best = c.attacks.reduce((a,x)=>a.bonus>x.bonus?a:x);
    const r = d20();
    const dr = rdice(best.dmg);
    rawRows.push({
      name:'Haste', r, baseBonus: best.bonus, baseDmg: dr.t, dmgDice: best.dmg, dmgRolls: dr.r, dmgMod: dr.m,
      critConf:0, critDmgRaw:0, fumbleConf:0, fumbleBonus:best.bonus,
      cr:20, cm:2, specials:[],
      nat20:r===20, nat1:r===1, threat:false, isRake:false, isHaste:true,
    });
  }

  // Auto-damage pre-rolls (damage only, no attack roll)
  const auto = {};
  for (const [key, flag, dmgField] of [
    ['constrictRaw', null,           'constrictDmg'],
    ['rendRaw',      'hasRend',      'rendDmg'],
    ['deathRollRaw', 'hasDeathRoll', 'deathRollDmg'],
    ['gnawRaw',      'hasGnaw',     'gnawDmg'],
    ['trampleRaw',   'hasTrample',  'trampleDmg'],
    ['whirlwindRaw', 'hasWhirlwind','whirlwindDmg'],
    ['vortexRaw',    'hasVortex',   'vortexDmg'],
  ]) {
    auto[key] = (flag ? c[flag] : c[dmgField]) && c[dmgField] ? rdice(c[dmgField]) : null;
  }

  // Powerful Charge (pre-roll alternate gore damage + crit extra)
  let chargeRaw = null, chargeCritExtra = 0;
  if (c.hasPowerfulCharge && c.powerfulChargeDmg) {
    chargeRaw = rdice(c.powerfulChargeDmg);
    chargeCritExtra = rdice(c.powerfulChargeDmg).t;
  }

  // Web (pre-roll ranged touch attack, no damage)
  let webRaw = null;
  if (c.hasWeb && c.webAtk) {
    const r = d20();
    webRaw = { r, nat20: r===20, nat1: r===1 };
  }

  // Rock Throwing (pre-roll attack + damage + crit/fumble)
  let rockRaw = null;
  if (c.hasRockThrowing && c.rockAtk) {
    const r = d20();
    const dr = rdice(c.rockAtk.dmg);
    const threat = r >= 20 && r !== 1;
    let rockCritConf = 0, rockCritDmgRaw = 0;
    if (threat) { rockCritConf = d20(); rockCritDmgRaw = rdice(c.rockAtk.dmg).t; }
    const fumbleConf = r === 1 ? d20() : 0;
    rockRaw = { r, baseDmg: dr.t, dmgRolls: dr.r, dmgMod: dr.m, critConf: rockCritConf, critDmgRaw: rockCritDmgRaw, fumbleConf, threat, nat20: r===20, nat1: r===1 };
  }

  // Spikes (pre-roll 4 ranged attacks + damage)
  let spikesRaw = [];
  if (c.hasSpikes && c.spikesAtk) {
    for (let i = 0; i < c.spikesAtk.count; i++) {
      const r = d20();
      const dr = rdice(c.spikesAtk.dmg);
      const threat = r >= 20 && r !== 1;
      let critConf = 0, critDmgRaw = 0;
      if (threat) { critConf = d20(); critDmgRaw = rdice(c.spikesAtk.dmg).t; }
      const fumbleConf = r === 1 ? d20() : 0;
      spikesRaw.push({ r, baseDmg: dr.t, dmgRolls: dr.r, dmgMod: dr.m, critConf, critDmgRaw, fumbleConf, threat, nat20: r===20, nat1: r===1 });
    }
  }

  // Musk (pre-roll ranged touch attack, no damage)
  let muskRaw = null;
  if (c.hasMusk && c.muskAtk) {
    const r = d20();
    muskRaw = { r, nat20: r===20, nat1: r===1 };
  }

  // Breath Weapon (pre-roll damage)
  let breathRaw = null;
  if (c.hasBreathWeapon && c.breathDmg) {
    breathRaw = rdice(c.breathDmg);
  }

  // Vital Strike (pre-roll extra weapon dice)
  let vitalStrikeExtraRaws = [];
  if (c.hasVitalStrike && c.attacks.length > 0) {
    const primaryAtk = c.attacks[0];
    for (let i = 0; i < c.vitalStrikeLevel; i++) {
      vitalStrikeExtraRaws.push(rdice(primaryAtk.dmg));
    }
  }

  c.rawRoll = { rows: rawRows, grabs: rawGrabs, maintainRoll, maintainDmgRaw, grabAtkName, grabAtkDmg,
    ...auto, chargeRaw, chargeCritExtra,
    webRaw, rockRaw, spikesRaw, muskRaw, breathRaw, vitalStrikeExtraRaws };
}

// Build an auto-damage row (no attack roll — fixed damage from ability)
function buildAutoRow(raw, dmgDice, buffDmg, name, extras = {}) {
  return { name, dmg: Math.max(1, raw.t + buffDmg),
    dmgDice, dmgRolls: raw.r, dmgMod: (raw.m || 0) + buffDmg, buffDmg, ...extras };
}

// Build a ranged attack row (web = noDamage touch, rock = full crit)
function buildRangedRow(raw, atkBonus, b, name, opts = {}) {
  const bonus = atkBonus + b.a;
  const total = raw.r + bonus;
  const hit_ac = raw.nat20 ? 999 : raw.nat1 ? 0 : total;
  const fumbleConfTotal = raw.nat1 ? (raw.fumbleConf || 0) + atkBonus + b.a : 0;
  const base = { name, r: raw.r, bonus, total, hit_ac,
    nat20: raw.nat20, nat1: raw.nat1,
    specials: [], isRake: false, primary: false, isRanged: true,
    fumbleConf: raw.fumbleConf || 0, fumbleConfTotal,
    buffAtk: b.a, paAtk: 0, paDmg: 0, baseBonus: atkBonus, ...opts.extra };
  if (opts.noDamage) {
    return { ...base, dmg: 0, dmgNoCrit: 0, threat: false, critOk: false,
      critConf: 0, critConfTotal: 0, dmgDice: '', dmgRolls: [], dmgMod: 0, buffDmg: 0 };
  }
  const dmgBase = (raw.baseDmg || 0) + b.d;
  let dmgWithCrit = dmgBase, critOk = false, critConfTotal = 0;
  if (raw.threat) {
    critConfTotal = (raw.critConf || 0) + bonus;
    critOk = true;
    dmgWithCrit = dmgBase + (raw.critDmgRaw || 0) + b.d;
  }
  return { ...base, dmg: dmgWithCrit, dmgNoCrit: dmgBase,
    threat: raw.threat || false, critOk, critConf: raw.critConf || 0, critConfTotal,
    dmgDice: opts.dmgDice || '', dmgRolls: raw.dmgRolls || [],
    dmgMod: (raw.dmgMod || 0) + b.d, buffDmg: b.d };
}

// Compute display rows from raw rolls + current buffs (called at render time)
function computeRoll(c) {
  if (!c.rawRoll) return null;
  const b = bTotal(c.buffOvr);
  // Per-creature flanking
  if (c.flanking) b.a += 2;
  // Situational toggles: Earth/Water Mastery
  if (c.earthMastery) { b.a += 1; b.d += 1; }
  if (c.waterMastery) { b.a += 1; b.d += 1; }
  // Greater Magic Fang (one natural weapon): enhancement applies to ONE weapon's rows only.
  // gmfAll (all weapons, flat +1) is already in b; enhancement doesn't stack, so the chosen weapon
  // gets max(gmfBonus, gmfAll) — i.e. an extra (gmfBonus - 1) on top of the uniform +1, else gmfBonus.
  const gmfOn = c.buffOvr.gmf===true || (!!S.buffs.gmf && c.buffOvr.gmf!==false);
  const gmfAllOn = c.buffOvr.gmfAll===true || (!!S.buffs.gmfAll && c.buffOvr.gmfAll!==false);
  const gmfExtra = gmfOn ? Math.max(0, gmfBonus() - (gmfAllOn?1:0)) : 0;
  const gmfWeapon = gmfExtra>0 ? gmfBestWeapon(c) : null;
  const rows = [];
  const autoRows = [];
  const grabs = [];

  // Power Attack calculation
  let paAtk = 0, paDmg = 0;
  if (c.powerAttacking && c.hasPowerAttack) {
    paAtk = -c.paX;
    // Count non-auto attacks to determine single vs multi (2x vs 3x)
    const maintainMode2 = c.grappling && S.round > (c.grappleRound || 0);
    const visibleCount = c.rawRoll.rows.filter(raw => {
      if (raw.isHaste && !b.extra) return false;
      if (maintainMode2 && !raw.isRake) return false;
      if (raw.isRake && !c.pouncing && !maintainMode2) return false;
      return true;
    }).length;
    paDmg = visibleCount <= 1 ? c.paX * 3 : c.paX * 2;
  }

  // Auto-damage rows: constrict (always shown if creature has it)
  if (c.rawRoll.constrictRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.constrictRaw, c.constrictDmg, b.d, 'Constrict', { isConstrict: true }));
  }
  // Maintain mode = grappling AND past the round grapple started
  const maintainMode = c.grappling && S.round > (c.grappleRound || 0);

  // Death Roll auto-damage (grapple, same trigger as constrict)
  if (c.rawRoll.deathRollRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.deathRollRaw, c.deathRollDmg, b.d, 'Death Roll', { isDeathRoll: true, hasTrip: true }));
  }

  // Gnaw auto-damage (grapple auto-bite)
  if (c.rawRoll.gnawRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.gnawRaw, c.gnawDmg, b.d, 'Gnaw', { isGnaw: true }));
  }

  // Maintain auto-damage: grab attack's damage (only in maintain mode)
  if (c.rawRoll.maintainDmgRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.maintainDmgRaw, c.rawRoll.grabAtkDmg || '?', b.d,
      (c.rawRoll.grabAtkName || 'Attack') + ' (auto)', { isMaintainDmg: true }));
  }

  // Rend auto-damage (bottom of table, after normal attacks computed)
  // Deferred — pushed after rows are built so we can count claw hits

  // Whirlwind / Vortex state: suppress ALL normal rows, show only the state autoRow
  const whirlwindActive = c.whirlwinding && c.hasWhirlwind;
  const vortexActive = c.vortexing && c.hasVortex;
  const stateActive = whirlwindActive || vortexActive; // full attack suppression

  // Whirlwind autoRow
  if (whirlwindActive && c.rawRoll.whirlwindRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.whirlwindRaw, c.whirlwindDmg, b.d, 'Whirlwind', { isWhirlwind: true, dc: c.whirlwindDC }));
  }

  // Vortex autoRow
  if (vortexActive && c.rawRoll.vortexRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.vortexRaw, c.vortexDmg, b.d, 'Vortex', { isVortex: true, dc: c.vortexDC }));
  }

  // Trample autoRow (when trampling toggle is active)
  if (c.trampling && c.hasTrample && c.rawRoll.trampleRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.trampleRaw, c.trampleDmg, b.d, 'Trample', { isTrample: true, dc: c.trampleDC }));
  }

  for (const raw of c.rawRoll.rows) {
    if (raw.isHaste && !b.extra) continue;
    // Whirlwind/Vortex state: suppress ALL normal attack rows
    if (stateActive) continue;
    // Maintain mode: suppress normal attacks + haste (standard action used for maintain)
    if (maintainMode && !raw.isRake) continue;
    // When not pouncing/grappling: suppress rake
    if (raw.isRake && !c.pouncing && !maintainMode) continue;
    // Vital Strike mode: only show the primary (first non-rake, non-haste) attack
    if (c.vitalStriking && c.hasVitalStrike) {
      if (raw.isRake || raw.isHaste) continue;
      // Find the primary attack row — suppress all but the first (highest bonus) normal attack
      const firstNormal = c.rawRoll.rows.find(r2 => !r2.isRake && !r2.isHaste);
      if (raw !== firstNormal) continue;
    }

    // Greater Magic Fang: add its enhancement only to the chosen weapon's row(s).
    // Exact-name match → one appendage (claw 1), but all attacks of a single weapon (Zerda's two "bite").
    const gmfHit = !!gmfWeapon && raw.name.toLowerCase()===gmfWeapon;
    const rowExtra = gmfHit ? gmfExtra : 0;

    const bonus = raw.baseBonus + b.a + paAtk + rowExtra;
    const total = raw.r + bonus;
    const dmgBase = raw.baseDmg + b.d + paDmg + rowExtra;
    let dmgWithCrit = dmgBase;
    let critOk = false, critConfTotal = 0;
    let fumbleConfTotal = 0;

    if (raw.threat) {
      critConfTotal = raw.critConf + bonus;
      critOk = true;
      const extraMults = (raw.cm || 2) - 1;
      // Flat damage bonuses (buff, GMF enhancement, Power Attack) all multiply on a crit.
      dmgWithCrit = dmgBase + raw.critDmgRaw + ((b.d + rowExtra + paDmg) * extraMults);
    }
    if (raw.nat1) {
      fumbleConfTotal = raw.fumbleConf + raw.fumbleBonus + b.a + rowExtra;
    }

    const hit_ac = raw.nat20 ? 999 : raw.nat1 ? 0 : total;

    rows.push({
      name: raw.name, r: raw.r, bonus, total, hit_ac,
      dmg: dmgWithCrit, dmgNoCrit: dmgBase,
      nat20: raw.nat20, nat1: raw.nat1, threat: raw.threat, critOk, cm: raw.cm,
      critConf: raw.critConf, critConfTotal,
      fumbleConf: raw.fumbleConf, fumbleConfTotal,
      specials: raw.specials, isRake: raw.isRake, primary: raw.primary || false,
      dmgDice: raw.dmgDice, dmgRolls: raw.dmgRolls, dmgMod: (raw.dmgMod||0)+b.d+paDmg+rowExtra, buffDmg: b.d+rowExtra, buffAtk: b.a+rowExtra, paAtk, paDmg, baseBonus: raw.baseBonus, gmfHit,
    });
  }

  for (const raw of c.rawRoll.grabs) {
    grabs.push({ atk: raw.atk, d20: raw.d20, total: raw.d20 + raw.baseCmb + b.a });
  }

  rows.sort((a, b) => b.total - a.total);

  // Rend auto-row at BOTTOM (after rows built so we can reference claw hit count)
  if (c.rawRoll.rendRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.rendRaw, c.rendDmg, b.d, 'Rend', { isRend: true }));
  }

  // Web: ranged touch attack row (no damage — entangle on hit)
  if (c.hasWeb && c.rawRoll.webRaw && c.webAtk && !stateActive) {
    rows.push(buildRangedRow(c.rawRoll.webRaw, c.webAtk.bonus, b, 'web (touch)', { noDamage: true, extra: { isWeb: true } }));
  }

  // Rock Throwing: ranged attack row (visible when not in state mode)
  if (c.hasRockThrowing && c.rawRoll.rockRaw && c.rockAtk && !stateActive) {
    const rockRow = buildRangedRow(c.rawRoll.rockRaw, c.rockAtk.bonus, b, `rock (${c.rockAtk.range})`, { dmgDice: c.rockAtk.dmg });
    // Heated Rock: add fire damage to rock throwing
    if (c.hasHeatedRock && c.heatedRockDmg) {
      rockRow.name += ' +fire';
      rockRow.heatedRockDmg = c.heatedRockDmg;
    }
    rows.push(rockRow);
    rows.sort((a2, bb2) => bb2.total - a2.total);
  }

  // Spikes: 4 ranged attack rows (Manticore)
  if (c.hasSpikes && c.rawRoll.spikesRaw.length && c.spikesAtk && !stateActive) {
    for (let i = 0; i < c.rawRoll.spikesRaw.length; i++) {
      rows.push(buildRangedRow(c.rawRoll.spikesRaw[i], c.spikesAtk.bonus, b,
        `spike ${i+1} (${c.spikesAtk.range})`, { dmgDice: c.spikesAtk.dmg }));
    }
    rows.sort((a2, bb2) => bb2.total - a2.total);
  }

  // Musk: ranged touch attack row (no damage — nauseated on hit)
  if (c.hasMusk && c.rawRoll.muskRaw && c.muskAtk && !stateActive) {
    rows.push(buildRangedRow(c.rawRoll.muskRaw, c.muskAtk.bonus, b, `musk (${c.muskAtk.range}, touch)`, { noDamage: true, extra: { isMusk: true } }));
  }

  // Breath Weapon: auto-damage row (Mephit)
  if (c.hasBreathWeapon && c.rawRoll.breathRaw) {
    autoRows.push(buildAutoRow(c.rawRoll.breathRaw, c.breathDmg, b.d, `Breath (${c.breathShape||'area'})`,
      { isBreath: true, dc: c.breathDC }));
  }

  // Vital Strike: enhance the primary attack row with extra dice (no modifier on extra rolls)
  if (c.vitalStriking && c.hasVitalStrike && c.rawRoll.vitalStrikeExtraRaws.length > 0) {
    const primaryRow = rows.find(r2 => !r2.isRake && !r2.isHaste && !r2.isRanged);
    if (primaryRow) {
      const extraTotal = c.rawRoll.vitalStrikeExtraRaws.reduce((sum, ex) => sum + ex.t - ex.m, 0); // extra dice only, no mod
      primaryRow.dmgNoCrit += extraTotal;
      primaryRow.dmg += extraTotal;
      primaryRow.isVitalStrike = true;
      primaryRow.vsExtra = extraTotal;
      primaryRow.vsLevel = c.vitalStrikeLevel;
    }
  }

  // Powerful Charge: replace gore row damage when charging
  if (c.charging && c.rawRoll.chargeRaw) {
    const ch = c.rawRoll.chargeRaw;
    for (const row of rows) {
      if (row.name.toLowerCase().includes('gore')) {
        row.dmgNoCrit = Math.max(1, ch.t + b.d + paDmg);
        row.dmg = row.dmgNoCrit;
        row.dmgDice = c.powerfulChargeDmg;
        row.dmgRolls = ch.r;
        row.dmgMod = (ch.m || 0) + b.d + paDmg;
        row.isCharge = true;
        if (row.critOk) {
          row.dmg = row.dmgNoCrit + (c.rawRoll.chargeCritExtra || 0) + b.d;
        }
        break;
      }
    }
  }

  // Compute maintain grapple total
  let maintain = null;
  if (c.rawRoll.maintainRoll) {
    const mr = c.rawRoll.maintainRoll;
    maintain = { d20: mr.d20, total: mr.d20 + mr.baseCmb + b.a };
  }

  return { rows, autoRows, grabs, maintain };
}

function reroll() {
  for (const g of S.groups) for (const c of g.creatures) if (c.alive) preRoll(c);
  render();
}
// Buff toggle just re-renders — dice stay the same, bonuses recalculate

// ═══════════════════════════════════════════════════════════════
//  CREATURE CREATION
// ═══════════════════════════════════════════════════════════════

// Extract damage dice string from Special_Attacks text with fallbacks
function parseAbilityDmg(specials, keyword, opts = {}) {
  const kw = keyword.replace(/\s+/g, '\\s*');
  // Try: keyword (dice) — e.g. "constrict (1d6+3)"
  const m1 = specials.match(new RegExp(kw + '\\s*\\(([^,)]*\\d+d\\d+(?:[+-]\\d+)?)', 'i'));
  if (m1) { const dm = m1[1].match(/(\d+d\d+(?:[+-]\d+)?)/); if (dm) return dm[1]; }
  // Try: keyword (stuff, dice) — e.g. "rend (2 claws, 1d4+6)"
  const m2 = specials.match(new RegExp(kw + '\\s*\\([^)]*,\\s*(\\d+d\\d+(?:[+-]\\d+)?)', 'i'));
  if (m2) return m2[1];
  // Fallback: data field (may contain non-dice text like "1d8+6 plus trip")
  if (opts.dataField) {
    const dm = String(opts.dataField).match(/(\d+d\d+(?:[+-]\d+)?)/);
    if (dm) return dm[1];
  }
  // Fallback: special_abilities description
  if (opts.abilities) {
    const sa = opts.abilities.find(a => a.name.toLowerCase().includes(keyword));
    if (sa) { const dm = sa.desc.match(/(\d+d\d+(?:[+-]\d+)?)/); if (dm) return dm[1]; }
  }
  // Fallback: melee attack name (gnaw→bite, whirlwind→slam)
  if (opts.melee && opts.atkName) {
    const atk = parseMelee(opts.melee).find(a => a.name.toLowerCase().includes(opts.atkName));
    if (atk) return atk.dmg;
  }
  return '';
}

function mkCreature(bEntry, aug) {
  const data = bEntry.data;
  const card = aug && data.augmented ? data.augmented : data.combat_card;
  const base = data.combat_card;
  const full = data.full_statblock || {};
  const specials = (card.Special_Attacks||base.Special_Attacks||'').toLowerCase();
  const featsLow = (full.Feats||'').toLowerCase();
  const hasPounce = specials.includes('pounce');
  const hasRake = specials.includes('rake');

  // Parse rake attacks from specials string
  // Format: "rake (2 claws +7, 1d6+4)" — count name bonus, damage
  let rakeAtks = [];
  if (hasRake) {
    const rm = specials.match(/rake\s*\(([^)]+)\)/);
    if (rm) {
      const rakeStr = rm[1]; // "2 claws +7, 1d6+4"
      const countM = rakeStr.match(/^(\d+)/);
      const bonusM = rakeStr.match(/([+-]\d+)/);
      const dmgM = rakeStr.match(/(\d+d\d+(?:[+-]\d+)?)/);
      const count = countM ? parseInt(countM[1]) : 2;
      const bonus = bonusM ? parseInt(bonusM[1]) : 0;
      const dmgStr = dmgM ? dmgM[1] : '1d4';
      for (let i = 0; i < count; i++) {
        rakeAtks.push({name:`Rake ${i+1}`, bonus, dmg:dmgStr, cr:20, cm:2, sp:['rake']});
      }
    }
    if (rakeAtks.length === 0) {
      // Fallback: use first claw attack stats
      const allAtks = parseMelee(card.Melee||base.Melee||'');
      const clawAtk = allAtks.find(a=>a.name.toLowerCase().includes('claw'));
      if (clawAtk) {
        rakeAtks = [
          {name:'Rake 1', bonus:clawAtk.bonus, dmg:clawAtk.dmg, cr:20, cm:2, sp:['rake']},
          {name:'Rake 2', bonus:clawAtk.bonus, dmg:clawAtk.dmg, cr:20, cm:2, sp:['rake']},
        ];
      }
    }
  }

  // Parse constrict damage
  const constrictDmg = specials.includes('constrict')
    ? parseAbilityDmg(specials, 'constrict', { abilities: data.special_abilities })
    : '';

  // Parse rend damage (e.g. "rend (2 claws, 1d4+6)")
  const hasRend = specials.includes('rend');
  const rendDmg = hasRend ? parseAbilityDmg(specials, 'rend', { dataField: data.combat_card?.rendDmg }) : '';

  // Parse death roll damage (e.g. "death roll (1d8+6 plus trip)")
  const hasDeathRoll = specials.includes('death roll');
  const deathRollDmg = hasDeathRoll ? parseAbilityDmg(specials, 'death roll', { dataField: data.combat_card?.deathRollDmg }) : '';

  // Parse gnaw (auto-bite damage in grapple)
  const hasGnaw = specials.includes('gnaw');
  const gnawDmg = hasGnaw ? parseAbilityDmg(specials, 'gnaw', { abilities: data.special_abilities, melee: card.Melee||base.Melee||'', atkName: 'bite' }) : '';

  // Parse powerful charge (e.g. "powerful charge (gore, 4d6+12)")
  const hasPowerfulCharge = specials.includes('powerful charge');
  const powerfulChargeDmg = hasPowerfulCharge ? parseAbilityDmg(specials, 'powerful charge', { dataField: data.combat_card?.powerfulChargeDmg }) : '';

  // Situational flags
  const hasEarthMastery = specials.includes('earth mastery');
  const hasWaterMastery = specials.includes('water mastery');

  // Rock Throwing: detect from pre-parsed flag or Special_Attacks text
  const hasRockThrowing = !!data.hasRockThrowing || specials.includes('rock throwing') || specials.includes('rock throw');
  let rockAtk = null;
  if (hasRockThrowing) {
    // Use primary melee attack bonus as proxy for rock attack bonus (same BAB + Str base)
    // Rock damage: 2d6 for Large, 2d8 for Huge (PF1e standard rock throwing)
    const meleeAtks = parseMelee(card.Melee||base.Melee||'');
    const primaryMelee = meleeAtks.length > 0 ? meleeAtks[0] : null;
    const rockAtkBonus = primaryMelee ? primaryMelee.bonus : (full.BAB||0);
    const size = (data.size||'').toLowerCase();
    const rockDmgBase = size === 'huge' || size === 'gargantuan' ? '2d8' : '2d6';
    const rockRange = data.rockThrowingRange || (specials.match(/rock\s+throw(?:ing)?\s*\((\d+\s*ft\.?)/i)?.[1] || '120 ft.');
    // Str mod for damage (from augmented str if aug)
    const strScore = aug ? (full.Str||10)+4 : (full.Str||10);
    const strMod = Math.floor((strScore - 10) / 2);
    rockAtk = { bonus: rockAtkBonus, dmgBase: rockDmgBase, dmgMod: strMod, range: rockRange };
    // Full dmg string for rdice
    rockAtk.dmg = `${rockDmgBase}${strMod >= 0 ? '+' : ''}${strMod}`;
  }

  // Web: parse from Special_Attacks "web (+5 ranged, DC 12, hp 2)"
  const hasWeb = specials.includes('web');
  let webAtk = null;
  if (hasWeb) {
    const wm = specials.match(/web\s*\(\+?(-?\d+)\s*ranged,\s*DC\s*(\d+),\s*hp\s*(\d+)\)/i);
    if (wm) {
      let webBonus = +wm[1];
      let webDC = +wm[2];
      const webHP = +wm[3];
      // Augment Summoning: +4 Con → +2 to DC (Con-based)
      if (aug) { webDC += 2; }
      // Augment doesn't affect Dex-based ranged attack bonus
      webAtk = { bonus: webBonus, dc: webDC, hp: webHP };
    }
  }

  // Trample: detect from pre-parsed flag or Special_Attacks text
  const hasTrample = !!data.hasTrample || specials.includes('trample');
  let trampleDmg = '', trampleDC = 0;
  if (hasTrample) {
    if (data.trampleDmg) {
      trampleDmg = data.trampleDmg;
      trampleDC = data.trampleDC || 0;
    } else {
      // Parse from Special_Attacks string: "trample (2d6+9, DC 17)" or "trample (2d8+15; DC 25)"
      const tm = specials.match(/trample\s*\((\d+d\d+(?:[+-]\d+)?)[,;]\s*DC\s*(\d+)/);
      if (tm) { trampleDmg = tm[1]; trampleDC = +tm[2]; }
    }
    // Adjust DC for augment summoning: +2 Con → +1 to DC (Con-based save DC)
    if (aug && !data.trampleDC && trampleDC) {
      // aug already accounted for in pre-parsed data.trampleDC; only adjust if parsing from text
    }
    if (aug && data.trampleDC) {
      // Pre-parsed DC from non-aug stats — augment adds +2 Con, so fort/ref DC +1
      trampleDC = data.trampleDC + 1;
    }
  }

  // Vital Strike: detect from pre-parsed flag or feats string
  const hasVitalStrike = !!data.hasVitalStrike || featsLow.includes('vital strike');
  let vitalStrikeLevel = 1; // VS=1, IVS=2, GVS=3 (dice multiplier = level + 1)
  if (hasVitalStrike) {
    if (data.vitalStrikeLevel === 'greater' || featsLow.includes('greater vital strike')) vitalStrikeLevel = 3;
    else if (data.vitalStrikeLevel === 'improved' || featsLow.includes('improved vital strike')) vitalStrikeLevel = 2;
    else vitalStrikeLevel = 1;
  }

  // Whirlwind: detect from pre-parsed flag or Special_Attacks text (air elementals)
  const hasWhirlwind = !!data.hasWhirlwind || specials.includes('whirlwind');
  let whirlwindDC = 0;
  if (hasWhirlwind) {
    whirlwindDC = data.whirlwindDC || 0;
    if (!whirlwindDC) { const wm = specials.match(/whirlwind\s*\(DC\s*(\d+)/); if (wm) whirlwindDC = +wm[1]; }
  }
  const whirlwindDmg = hasWhirlwind ? parseAbilityDmg(specials, 'whirlwind', { melee: card.Melee||base.Melee||'', atkName: 'slam' }) : '';

  // Vortex: detect from pre-parsed flag or Special_Attacks text (water elementals)
  const hasVortex = !!data.hasVortex || specials.includes('vortex');
  let vortexDC = 0;
  if (hasVortex) {
    vortexDC = data.vortexDC || 0;
    if (!vortexDC) { const vm = specials.match(/vortex\s*\(DC\s*(\d+)/); if (vm) vortexDC = +vm[1]; }
  }
  const vortexDmg = hasVortex ? parseAbilityDmg(specials, 'vortex', { melee: card.Melee||base.Melee||'', atkName: 'slam' }) : '';

  // Feat-based flags
  const hasDiehard = featsLow.includes('diehard');
  const hasRage = specials.includes('rage') || specials.includes('blood rage');

  // Tier 2b/2c ability flags
  const hasDrench = specials.includes('drench');
  const hasPull = specials.includes('pull');
  let pullDist = '';
  if (hasPull) { const pm = specials.match(/pull\s*\([^,]*,\s*(\d+\s*(?:feet|ft\.?))/i); if (pm) pullDist = pm[1]; }
  const hasQuills = !!(data.special_abilities || []).find(a => a.name.toLowerCase().includes('quill'));
  let quillsDmg = '';
  if (hasQuills) {
    const qa = data.special_abilities.find(a => a.name.toLowerCase().includes('quill'));
    if (qa) { const dm = qa.desc.match(/(\d+d\d+(?:[+-]\d+)?)/); if (dm) quillsDmg = dm[1]; }
  }
  const hasSpikes = !!(data.special_abilities || []).find(a => a.name.toLowerCase().includes('spike'));
  let spikesAtk = null;
  if (hasSpikes) {
    // Spikes: 4 ranged attacks. Stats from Ranged line or computed from BAB+Dex.
    const ranged = card.Ranged || base.Ranged || '';
    const rm = ranged.match(/(\d+)\s*spikes?\s*\+(\d+)\s*ranged\s*\((\d+d\d+(?:[+-]\d+)?)\)/i);
    if (rm) {
      spikesAtk = { count: +rm[1], bonus: +rm[2], dmg: rm[3], range: '180 ft.' };
    } else {
      // Fallback: compute from BAB + Dex mod (ranged), Str mod for damage
      const dexMod = Math.floor(((full.Dex||10) - 10) / 2);
      const strScore = aug ? (full.Str||10)+4 : (full.Str||10);
      const strMod = Math.floor((strScore - 10) / 2);
      const spikeBonus = (full.BAB||0) + dexMod;
      spikesAtk = { count: 4, bonus: spikeBonus, dmg: `1d6+${strMod}`, range: '180 ft.' };
    }
  }
  const hasBreathWeapon = specials.includes('breath weapon');
  let breathDC = 0, breathDmg = '', breathShape = '';
  if (hasBreathWeapon) {
    const bm = specials.match(/breath\s*weapon\s*\(([^)]+)\)/i);
    if (bm) {
      const dcM = bm[1].match(/dc\s*(\d+)/i); if (dcM) breathDC = +dcM[1];
      const dmM = bm[1].match(/(\d+d\d+(?:[+-]\d+)?)/); if (dmM) breathDmg = dmM[1];
      const shM = bm[1].match(/((?:\d+-foot\s+)?(?:cone|line|burst))/i); if (shM) breathShape = shM[1];
    }
    if (aug && breathDC) breathDC += 2; // Con-based DC
  }
  const hasHeatedRock = specials.includes('heated rock');
  let heatedRockDmg = '';
  if (hasHeatedRock) {
    const ha = (data.special_abilities || []).find(a => a.name.toLowerCase().includes('heated rock'));
    if (ha) { const dm = ha.desc.match(/(\d+d\d+(?:[+-]\d+)?)/); if (dm) heatedRockDmg = dm[1]; }
  }
  const hasStampede = specials.includes('stampede');
  const hasAttach = specials.includes('attach') || !!(data.special_abilities || []).find(a => a.name.toLowerCase().includes('attach'));
  const hasBloodDrain = specials.includes('blood drain') || !!(data.special_abilities || []).find(a => a.name.toLowerCase().includes('blood drain'));

  // Electricity: melee touch attack already parsed; extract Fort DC for crit stun legend
  const hasElectricity = !!(data.special_abilities || []).find(a => a.name.toLowerCase().includes('electricity'));
  let electricityDC = 0;
  if (hasElectricity) {
    const ea = data.special_abilities.find(a => a.name.toLowerCase().includes('electricity'));
    if (ea) { const dm = ea.desc.match(/DC\s*(\d+)/); if (dm) electricityDC = +dm[1]; }
    if (aug && electricityDC) electricityDC += 2; // Con-based DC
  }

  // Musk: ranged touch attack (no damage) + Fort DC nauseated
  const hasMusk = specials.includes('musk');
  let muskAtk = null;
  if (hasMusk) {
    const ma = (data.special_abilities || []).find(a => a.name.toLowerCase().includes('musk'));
    let muskDC = 0;
    if (ma) { const dm = ma.desc.match(/DC\s*(\d+)/); if (dm) muskDC = +dm[1]; }
    if (aug && muskDC) muskDC += 2; // Con-based DC
    const sizeMod = {tiny:2,small:1,medium:0,large:-1,huge:-2,gargantuan:-4,colossal:-8};
    const dexMod = Math.floor(((full.Dex||10) - 10) / 2);
    const muskBonus = (full.BAB||0) + dexMod + (sizeMod[(data.size||'medium').toLowerCase()] || 0);
    muskAtk = { bonus: muskBonus, dc: muskDC, range: '30 ft.' };
  }

  // Triggered buffs (generic system)
  const triggers = [];
  if (hasRage) triggers.push({ on:'damage', apply:'rage' });

  const c = {
    id:`C${nCid++}`, name:data.name, hp:card.HP||10, maxHp:card.HP||10,
    ac:card.AC||10, attacks:parseMelee(card.Melee||base.Melee||''), aug,
    cmb:card.CMB||base.CMB||0, cmd:card.CMD||base.CMD||10,
    fort:card.Fort||base.Fort||0, ref:card.Ref||base.Ref||0, will:card.Will||base.Will||0,
    speed:card.Speed||base.Speed||'30 ft.',
    specials, hasPounce, hasRake, rakeAtks, constrictDmg,
    hasRend, rendDmg, hasDeathRoll, deathRollDmg, hasGnaw, gnawDmg,
    hasPowerfulCharge, powerfulChargeDmg, charging:false,
    hasEarthMastery, hasWaterMastery, earthMastery:false, waterMastery:false,
    hasRockThrowing, rockAtk, hasWeb, webAtk,
    hasTrample, trampleDmg, trampleDC, trampling:false,
    hasVitalStrike, vitalStrikeLevel, vitalStriking:false,
    hasWhirlwind, whirlwindDC, whirlwindDmg, whirlwinding:false,
    hasVortex, vortexDC, vortexDmg, vortexing:false,
    hasDiehard, hasRage, triggers,
    hasDrench, hasPull, pullDist, hasQuills, quillsDmg,
    hasSpikes, spikesAtk, hasBreathWeapon, breathDC, breathDmg, breathShape,
    hasHeatedRock, heatedRockDmg, hasStampede, hasAttach, hasBloodDrain,
    hasElectricity, electricityDC, hasMusk, muskAtk,
    hasGrab: parseMelee(card.Melee||base.Melee||'').some(a=>a.sp.includes('grab')),
    acBreak:card.AC_breakdown||base.AC_breakdown||'',
    specialAtks:card.Special_Attacks||base.Special_Attacks||'',
    specialQual:card.Special_Qualities||base.Special_Qualities||'',
    hd:card.HD||base.HD||'',
    // Full statblock
    str:aug?(full.Str||10)+4:(full.Str||10), dex:full.Dex||10,
    con:aug?(full.Con||10)+4:(full.Con||10), int:full.Int||2,
    wis:full.Wis||10, cha:full.Cha||2,
    bab:full.BAB||0, feats:full.Feats||'', skills:full.Skills||'',
    space:full.Space||'5 ft.', reach:full.Reach||'5 ft.',
    type:data.type||'', size:data.size||'', cr:data.cr||'',
    pfsrdUrl:data.pfsrd_url||'',
    bName: data.name,
    specialAbilities: data.special_abilities || [],
    snaLevel: bEntry.sna_level,
    preRoll:null, alive:true, buffOvr:{}, pouncing:false, grappling:false,
    flanking:false,
    hasPowerAttack: (full.Feats||'').toLowerCase().includes('power attack'),
    paX: (full.Feats||'').toLowerCase().includes('power attack') ? 1+Math.floor((full.BAB||0)/4) : 0,
    powerAttacking:false,
    notableFeats: [
      (full.Feats||'').toLowerCase().includes('combat expertise') ? 'CE' : '',
      (full.Feats||'').toLowerCase().includes('lunge') ? 'Lunge' : '',
      (full.Feats||'').match(/\bcleave\b/i) ? ((full.Feats||'').toLowerCase().includes('great cleave')?'Gt Cleave':'Cleave') : '',
    ].filter(Boolean),
  };
  if (c.attacks.length > 1) c.attacks[0].primary = true;
  return c;
}

function doSummon() {
  const slot=+document.getElementById('inp-slot').value;
  const cl=+document.getElementById('inp-cl').value||10;
  const tierId=document.getElementById('inp-tier').value;
  const opts=tierOpts(slot);
  const tier=opts.find(o=>o.id===tierId)||opts[0];
  const name=selectedCreature;
  if(!name) return;
  const bE=B[name.toLowerCase()]; if(!bE) return;
  const count=rollCount(tier.expr);
  const aug=!!S.feats.augment;
  const g={id:`G${nGid++}`,name:`SNA ${slot}: ${count}x ${name}`,src:'sna',
    creatures:[],rl:cl,casting:true,slot};
  for(let i=0;i<count;i++) g.creatures.push(mkCreature(bE,aug));
  S.groups.push(g);
  if(S.round===0) S.round=1;
  for(const c of g.creatures) preRoll(c);
  closeAllTrays();
  render();
}

function closeAllTrays() {
  document.querySelectorAll('.tray-panel').forEach(p=>p.classList.remove('open'));
  document.querySelectorAll('.tray-tab').forEach(t=>t.classList.remove('active'));
}

function addCompanion(key){
  const bE=B[key]; if(!bE){alert('Companion not found: '+key);return;}
  const g={id:`G${nGid++}`,name:bE.data.name,src:'companion',creatures:[],casting:false};
  const c=mkCreature(bE,false); // companions never take Augment Summoning
  g.creatures.push(c);
  S.groups.push(g);
  if(S.round===0) S.round=1;
  preRoll(c);
  closeAllTrays();
  render();
}

function summonLions(){
  const bE=B['lion']; if(!bE){alert('Lion not in bestiary');return;}
  const g={id:`G${nGid++}`,name:'Lion Figurines',src:'figurine',creatures:[],rl:600,casting:false}; // 1hr/day, 1wk cooldown if killed
  for(let i=0;i<2;i++){const c=mkCreature(bE,false);c.name='Lion';g.creatures.push(c);}
  S.groups.push(g);
  if(S.round===0) S.round=1;
  for(const c of g.creatures) preRoll(c);
  closeAllTrays();
  render();
}

// ═══════════════════════════════════════════════════════════════
//  SPELL EFFECTS (Battlefield Spell Cards)
// ═══════════════════════════════════════════════════════════════
function castMod() { return +(document.getElementById('inp-cmod')?.value) || 0; }
const SE = {
  sphere: {
    name: 'Flaming Sphere', dmg: '3d6', dmgType: 'fire', spLv: 2,
    save: 'Ref half', note: 'Move action to reposition 30 ft.',
    dc: () => 10 + 2 + castMod(), dur: cl => cl,
  },
  sphere_wand: {
    name: 'Flaming Sphere (wand)', dmg: '3d6', dmgType: 'fire', spLv: 2,
    save: 'Ref half', note: 'CL 3 wand. Move action to reposition 30 ft.',
    dc: () => 13, dur: () => 3,
  },
  ball_lightning: {
    name: 'Ball Lightning', dmg: '3d6', dmgType: 'electricity', spLv: 4,
    save: 'Ref neg', note: 'Move action directs ALL globes 20 ft. −4 save in metal armor.',
    dc: () => 10 + 4 + castMod(), dur: cl => cl,
    count: cl => Math.max(2, Math.min(5, 2 + Math.floor(Math.max(0, cl - 7) / 4))),
  },
};

function addSpell(type) {
  const def = SE[type]; if (!def) return;
  const cl = +document.getElementById('inp-cl').value || 10;
  const dc = def.dc(cl);
  const dur = def.dur(cl);
  const count = def.count ? def.count(cl) : 1;
  const groupId = count > 1 ? `SG${nGid++}` : null;

  for (let i = 0; i < count; i++) {
    const e = {
      id: `E${nGid++}`, type, name: def.name,
      rl: dur, dc, dmg: def.dmg, dmgType: def.dmgType,
      save: def.save, note: def.note, src: type.includes('wand') ? 'wand' : 'cast',
      groupId, globeIdx: count > 1 ? i + 1 : 0,
      rollResult: rdice(def.dmg),
    };
    S.effects.push(e);
  }
  if (S.round === 0) S.round = 1;
  closeAllTrays();
  render();
}

function rollSpell(eid) {
  const e = S.effects.find(x => x.id === eid); if (!e) return;
  const def = SE[e.type];
  e.rollResult = rdice(e.dmg);
  render();
}



function dismissSpell(eid) {
  S.effects = S.effects.filter(x => x.id !== eid);
  render();
}

function renderSpellCard(e, spColorIdx) {
  const r = e.rollResult || { t: 0, r: [], m: 0 };
  const breakdown = r.r.length ? `[${r.r.join('+')}]` : '';
  const globePill = e.globeIdx ? `<span class="group-tag">Globe ${e.globeIdx}</span>` : '';
  // RE-ROLL ALL lives on the stack wrapper for grouped cards, not per-card

  return `<div class="scard" data-group="${(S.effects.indexOf(e)) % 4}">
    ${globePill}
    <span class="scard-id">${e.id} <span class="scard-dismiss" onclick="event.stopPropagation();dismissSpell('${e.id}')" title="Dismiss">×</span></span>
    <div class="scard-namerow">
      <span class="scard-name">${e.name}</span>
    </div>
    <div class="scard-meta">
      <span class="scard-dice">${e.dmg} ${e.dmgType||''}</span>
      <span>${e.rl}${IC.countdown('icon-sm')}</span>
    </div>
    <div class="scard-dc">DC ${e.dc} ${e.save}</div>
    <div class="scard-result">
      <div class="scard-dmg">${r.t}</div>
      <div class="scard-breakdown">${e.dmg}: ${breakdown}</div>
    </div>
    <div class="scard-actions">
      <button class="sm" onclick="event.stopPropagation();rollSpell('${e.id}')">RE-ROLL</button>
    </div>
    <div class="scard-note">${e.note}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  ROUND
// ═══════════════════════════════════════════════════════════════
function nextRound(){
  S.round++;
  for(const g of S.groups){if(g.casting){g.casting=false;}else if(g.src!=='companion'){g.rl--;}}
  S.groups=S.groups.filter(g=>{if(g.rl<=0&&g.src==='sna'){g.creatures.forEach(c=>{c.alive=false;});return false;}return true;});
  S.effects=S.effects.filter(e=>{e.rl--;return e.rl>0;});
  // Re-roll spell effect damage for new round
  for(const e of S.effects) if(e.rollResult) e.rollResult=rdice(e.dmg);
  // One-shot auto-off: pounce, powerful charge, trample, vital strike
  for(const g of S.groups) for(const c of g.creatures) { c.pouncing=false; c.charging=false; c.trampling=false; c.vitalStriking=false; }
  // Fast healing
  const fh=bTotal({}).fh;
  if(fh>0) for(const g of S.groups) for(const c of g.creatures) if(c.alive&&c.hp<c.maxHp) c.hp=Math.min(c.maxHp,c.hp+fh);
  reroll();
}

// ═══════════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════════
function render(){
  document.getElementById('disp-rd').textContent=S.round;
  saveState();
  document.querySelectorAll('.chip[data-feat]').forEach(el=>el.classList.toggle('on',!!S.feats[el.dataset.feat]));
  document.querySelectorAll('.chip[data-buff]').forEach(el=>el.classList.toggle('on',!!S.buffs[el.dataset.buff]));
  const gmfChip=document.querySelector('.chip[data-buff="gmf"]'); if(gmfChip) gmfChip.textContent=`Gtr Magic Fang +${gmfBonus()}`;
  updTiers();

  const refACval = document.getElementById('ref-ac').value;
  const refAC = refACval === '' ? 0 : parseInt(refACval) || 0;
  const area=document.getElementById('creatures-out');
  // Cards in flat grid — spacers between groups for visual separation
  let h='<div class="creatures-flow">';
  for(let gi=0; gi<S.groups.length; gi++){
    if(gi > 0) h+='<div class="group-spacer"></div>';
    const g = S.groups[gi];
    for(const c of g.creatures) h+=renderCard(c, g, refAC, gi);
  }
  // Assign a color index per spell groupId
  const spGroupColors = {};
  let spColorIdx = 0;
  for(const e of S.effects) {
    if(e.groupId && !(e.groupId in spGroupColors)) spGroupColors[e.groupId] = spColorIdx++;
  }
  if(S.effects.length && S.groups.length) h+='<div class="group-spacer"></div>';
  for(const e of S.effects) h+=renderSpellCard(e, e.groupId ? spGroupColors[e.groupId] : -1);
  h+='</div>';
  area.innerHTML=h;

  // Auto-open summon tray when board is empty and no tray is open
  if(S.groups.length === 0 && S.effects.length === 0 && !document.querySelector('.tray-panel.open')) {
    toggleTray('summon');
  }

  // Dismissed tray content + tab indicator
  const dismissedEl = document.getElementById('dismissed-content');
  const dismissedTab = document.getElementById('tab-dismissed');
  if (dismissed.length > 0) {
    dismissedEl.innerHTML = `<div class="chip-row">${dismissed.map((t,i) =>
      `<button class="sm" onclick="restoreFromDismissed(${i})">${t.creature.name} ↩</button>`
    ).join('')}</div>`;
    dismissedTab.classList.add('has-items');
    dismissedTab.querySelector('.notch-label').textContent = `Dismissed (${dismissed.length})`;
  } else {
    dismissedEl.innerHTML = '';
    dismissedTab.classList.remove('has-items');
    dismissedTab.querySelector('.notch-label').textContent = 'Dismissed';
  }
}

// d20pfsrd links for common special abilities
const PFSRD = {
  grab:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Grab',
  pounce:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Pounce',
  rake:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Rake',
  trip:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Trip',
  constrict:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Constrict',
  trample:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Trample',
  rend:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Rend',
  poison:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Poison',
  disease:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Disease',
  burn:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Burn',
  stun:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Stun',
  web:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Web',
  'death roll':'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Death_Roll',
  gnaw:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Gnaw',
  drench:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Drench',
  pull:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Pull',
  spikes:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Spikes',
  'blood drain':'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Blood_Drain',
  attach:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Attach',
  'breath weapon':'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Breath_Weapon',
  electricity:'https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#Electricity',
  'bull rush':'https://www.d20pfsrd.com/gamemastering/combat/#Bull_Rush',
  'overrun':'https://www.d20pfsrd.com/gamemastering/combat/#Overrun',
  'sunder':'https://www.d20pfsrd.com/gamemastering/combat/#Sunder',
  'awesome blow':'https://www.d20pfsrd.com/feats/monster-feats/awesome-blow/',
};
function spLink(s) {
  const url = PFSRD[s.toLowerCase()];
  return url ? `<a class="sp-link" href="${url}" target="_blank" onclick="event.stopPropagation()">${s}</a>` : s;
}
function mod(score) { return Math.floor((score - 10) / 2); }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}`; }
// Clean + abbreviate speed: strip ft., artifacts, flight quality symbols. Remove earth glide/sprint (surfaced as badges).
function fmtSpeed(s) {
  if (!s) return '';
  return s.replace(/other\s*\['?([^\]']+)'?\]\s*ft\.?/gi, '')
          .replace(/other_semicolon\s+\w+\s*ft\.?/gi, '')
          .replace(/\s*ft\.?/g, '').replace(/\s*\(perfect\)/gi, '✦').replace(/\s*\(good\)/gi, '').replace(/\s*\(average\)/gi, '')
          .replace(/,\s*,/g, ',').replace(/,\s*$/,'').replace(/^,\s*/,'').trim();
}

function renderDeadCard(c) {
  return `<div class="dead-wrap"><div class="ccard dead">
    <div class="ccard-head">
      <span class="ccard-name">${c.name}</span>
      <span class="ccard-hp">${c.hp}/${c.maxHp}</span>
    </div>
    <div class="dead-bar">
      <span class="dead-label">DEAD</span>
      <button class="sm revive-btn" onclick="event.stopPropagation();reviveC('${c.id}')">1 HP</button>
      <button class="sm revive-btn" onclick="event.stopPropagation();reviveC('${c.id}',true)">Full</button>
    </div>
  </div></div>`;
}

function renderBuffChips(c) {
  const activeBuffs = Object.entries(S.buffs).filter(([_,on])=>on);
  const globalHTML = activeBuffs.map(([id])=>{
    const off = c.buffOvr[id]===false;
    return `<span class="buff-chip ${off?'off':''}" onclick="event.stopPropagation();togCBuff('${c.id}','${id}')">${id}</span>`;
  }).join('');
  const localHTML = Object.entries(c.buffOvr||{}).filter(([id,v])=>v===true&&!S.buffs[id]&&BD[id]).map(([id])=>
    `<span class="buff-chip local" onclick="event.stopPropagation();togCBuff('${c.id}','${id}')">${id}</span>`
  ).join('');
  const addBtn = `<span class="buff-add-btn" onclick="event.stopPropagation();showAddBuff('${c.id}',this)" title="Add buff to this creature only">+</span>`;
  const augChip = c.aug ? `<span class="aug-chip">aug</span>` : '';
  const chips = globalHTML + localHTML;
  return (augChip || chips || addBtn) ? `<div class="buff-chips-muted">${augChip} ${chips} ${addBtn}</div>` : '';
}

function renderDecisions(c) {
  const flankHTML = `<span class="toggle-btn situational ${c.flanking?'active':''}" onclick="event.stopPropagation();togFlanking('${c.id}')" title="Flanking: +2 attack (untyped)">${c.flanking?'FLANKING':'Flank'}</span>`;
  const pounceHTML = c.hasPounce ?
    `<span class="toggle-btn decision ${c.pouncing?'active':''}" onclick="event.stopPropagation();togPounce('${c.id}')" title="Charge+pounce: rake without grapple">${c.pouncing?'POUNCING':'Pounce'}</span>` : '';
  const grapHTML = `<span class="toggle-btn state ${c.grappling?'active':''}" onclick="event.stopPropagation();togGrapple('${c.id}')" title="Grappling: maintain + constrict/rake (if available)">${c.grappling?'GRAPPLING':'Grapple'}</span>`;
  const paHTML = c.hasPowerAttack ?
    `<span class="toggle-btn decision ${c.powerAttacking?'active':''}" onclick="event.stopPropagation();togPA('${c.id}')" title="Power Attack: -${c.paX} atk, +${c.paX*2} dmg (${c.paX*3} single)">${c.powerAttacking?'PWR ATK':'Pwr Atk'}</span>` : '';
  // Situational toggles: mastery, charge
  const masteryHTML = c.hasEarthMastery ?
    `<span class="toggle-btn situational ${c.earthMastery?'active':''}" onclick="event.stopPropagation();togMastery('${c.id}','earth')" title="Earth Mastery: +1 atk/+1 dmg when both on ground">${c.earthMastery?'E. MASTERY':'E. Mastery'}</span>` :
    c.hasWaterMastery ?
    `<span class="toggle-btn situational ${c.waterMastery?'active':''}" onclick="event.stopPropagation();togMastery('${c.id}','water')" title="Water Mastery: +1 atk/+1 dmg in water">${c.waterMastery?'W. MASTERY':'W. Mastery'}</span>` : '';
  const chargeHTML = c.hasPowerfulCharge ?
    `<span class="toggle-btn decision ${c.charging?'active':''}" onclick="event.stopPropagation();togCharge('${c.id}')" title="Powerful Charge: gore → ${c.powerfulChargeDmg}">${c.charging?'CHARGING':'Charge'}</span>` : '';
  const trampleHTML = c.hasTrample ?
    `<span class="toggle-btn decision ${c.trampling?'active':''}" onclick="event.stopPropagation();togTrample('${c.id}')" title="Trample: ${c.trampleDmg}, Ref DC ${c.trampleDC} half. Full attack still possible.">${c.trampling?'TRAMPLE':'Trample'}</span>` : '';
  const vitalStrikeLabel = c.vitalStrikeLevel===3?'Gr.VS':c.vitalStrikeLevel===2?'Imp.VS':'Vital Strike';
  const vitalStrikeHTML = c.hasVitalStrike ?
    `<span class="toggle-btn decision ${c.vitalStriking?'active':''}" onclick="event.stopPropagation();togVitalStrike('${c.id}')" title="${vitalStrikeLabel}: single attack with ${c.vitalStrikeLevel+1}x weapon dice. Standard action.">${c.vitalStriking?vitalStrikeLabel.toUpperCase():vitalStrikeLabel}</span>` : '';
  const whirlwindHTML = c.hasWhirlwind ?
    `<span class="toggle-btn state ${c.whirlwinding?'active':''}" onclick="event.stopPropagation();togWhirlwind('${c.id}')" title="Whirlwind: ${c.whirlwindDmg}/round, Ref DC ${c.whirlwindDC} to avoid. Suppresses normal attacks.">${c.whirlwinding?'WHIRLWIND':'Whirlwind'}</span>` : '';
  const vortexHTML = c.hasVortex ?
    `<span class="toggle-btn state ${c.vortexing?'active':''}" onclick="event.stopPropagation();togVortex('${c.id}')" title="Vortex: ${c.vortexDmg}/round, Ref DC ${c.vortexDC} to avoid. Suppresses normal attacks.">${c.vortexing?'VORTEX':'Vortex'}</span>` : '';
  // Notable feats computed at render time (survives localStorage without migration)
  const featsStr = (c.feats||'').toLowerCase();
  const notableFeats = [
    featsStr.includes('combat expertise') ? 'CE' : '',
    featsStr.includes('lunge') ? 'Lunge' : '',
    /\bcleave\b/.test(featsStr) ? (featsStr.includes('great cleave')?'Gt Cleave':'Cleave') : '',
  ].filter(Boolean);
  const featBadges = notableFeats.map(f => `<span class="feat-badge">${f}</span>`).join('');

  // Tactical badges — non-interactive, with tooltips
  const tacBadges = [];
  if (featsStr.includes('flyby attack')) tacBadges.push({name:'Flyby', tip:'Move → attack → continue moving. No AoO from target.'});
  if (featsStr.includes('spring attack')) tacBadges.push({name:'Spring Atk', tip:'Move → melee attack during move → continue moving.'});
  if (featsStr.includes('combat reflexes')) {
    const aoos = Math.max(1, mod(c.dex));
    tacBadges.push({name:`${aoos} AoO`, tip:`Combat Reflexes: ${aoos} AoOs/round (Dex mod).`});
  }
  if (featsStr.includes('diehard')) tacBadges.push({name:'Diehard', tip:`Fights until -${c.con} HP. Auto-stabilizes.`});
  // Movement/utility badges from specials + speed + qualities
  const specLow = (c.specials||'').toLowerCase();
  const speedLow = (c.speed||'').toLowerCase();
  const qualLow = (c.specialQual||'').toLowerCase();
  if (speedLow.includes('earth glide') || qualLow.includes('earth glide')) tacBadges.push({name:'Earth Glide', tip:'Move through earth/stone (not metal). No tunnel. Tremorsense to navigate.'});
  if (specLow.includes('sprint') || speedLow.includes('sprint')) tacBadges.push({name:'Sprint', tip:'1/min: 10× land speed for 1 round.'});
  const tacHTML = tacBadges.map(b => `<span class="tac-badge" title="${b.tip}">${b.name}</span>`).join('');

  const allBadges = featBadges + tacHTML;
  const badgeRow = allBadges ? `<div class="feat-badge-row">${allBadges}</div>` : '';
  return `<div class="decisions-row">${flankHTML} ${pounceHTML} ${chargeHTML} ${trampleHTML} ${vitalStrikeHTML} ${masteryHTML} ${paHTML} <span class="decisions-right">${grapHTML} ${whirlwindHTML} ${vortexHTML}</span></div>${badgeRow}`;
}

function renderRollTable(c, pr, refAC) {
  const hasAC = refAC > 0;
  let hitDmg=0, hitCount=0, totalAtks=pr.rows.length;
  let acLineDrawn = false;
  const triggeredSpecials = new Set();
  let runningDmg = 0, runningDmgCrit = 0;
  const runningByType = {};
  let tableHTML=`<table class="roll-table"><tr><th>Attack</th><th class="r">${IC.atk('icon-sm')}</th><th class="r">${IC.dmg('icon-sm')}</th><th class="r th-sum" title="Running damage total">Σ</th></tr>`;

  // Auto-damage rows at top (constrict, death roll, gnaw, maintain auto-dmg)
  // Rend goes AFTER normal rows (appended below)
  const maintainMode = c.grappling && S.round > (c.grappleRound || 0);
  const topAutoRows = pr.autoRows.filter(ar => !ar.isRend);
  const rendRows = pr.autoRows.filter(ar => ar.isRend);
  for (const ar of topAutoRows) {
    if (ar.isMaintainDmg && !maintainMode) continue;
    // Death roll and gnaw: active when grappling (same as constrict)
    const isGrappleAuto = ar.isConstrict || ar.isDeathRoll || ar.isGnaw || ar.isMaintainDmg;
    // Whirlwind/vortex/trample: always active when their toggle is on (already in autoRows only when active)
    const isStateAuto = ar.isWhirlwind || ar.isVortex || ar.isTrample;
    const active = isGrappleAuto ? c.grappling : isStateAuto ? true : false;
    const cls = active ? 'auto-active' : 'auto-muted';
    if (active) {
      runningDmg += ar.dmg; runningDmgCrit += ar.dmg;
      if (hasAC) { hitDmg += ar.dmg; }
    }
    const runCell = active ? runningDmg : '—';
    const baseMod = ar.dmgMod - (ar.buffDmg||0);
    const buffPart = ar.buffDmg ? ` +${ar.buffDmg} buff` : '';
    const rollStr = ar.dmgRolls ? `[${ar.dmgRolls.join('+')}]${baseMod>=0?'+':''}${baseMod}${buffPart}` : '';
    const dmgTip = `${ar.dmgDice}: ${rollStr}`;
    const tripPip = ar.hasTrip ? `<span class="atk-pips">${IC.trip}</span>` : '<span class="atk-pips"></span>';
    const nameExtra = ar.hasTrip ? ` <span class="auto-trip" title="Target prone (size or smaller)">+ trip</span>` : '';
    // DC info for whirlwind, vortex, trample
    const dcExtra = ar.dc ? ` <span class="auto-dc">Ref DC ${ar.dc}</span>` : '';
    const stateLabel = ar.isWhirlwind ? ' /round' : ar.isVortex ? ' /round' : ar.isTrample ? ' (move through)' : '';
    tableHTML += `<tr class="${cls}"><td>${tripPip}<span class="atk-name">${ar.name.toLowerCase()}${nameExtra}${dcExtra}${stateLabel}</span></td><td class="total">—</td><td class="dmg" title="${dmgTip}">${ar.dmg}</td><td class="running">${runCell}</td></tr>`;
  }

  for(const r of pr.rows){
    const isHit = hasAC ? r.hit_ac >= refAC : null;
    const critConfirmed = r.critOk && hasAC && r.critConfTotal >= refAC;
    const critPending = r.critOk && !hasAC;
    const fumbleFail = r.nat1 && hasAC && r.fumbleConfTotal < refAC;
    const fumbleSafe = r.nat1 && hasAC && r.fumbleConfTotal >= refAC;
    const fumblePending = r.nat1 && !hasAC;
    const effectiveDmg = critConfirmed ? r.dmg : r.dmgNoCrit;
    if(isHit) { hitDmg += effectiveDmg; hitCount++; }
    const countForRunning = isHit === true || isHit === null;
    if(countForRunning && !r.nat1) {
      const thisDmg = hasAC ? effectiveDmg : r.dmgNoCrit;
      runningDmg += thisDmg;
      runningDmgCrit += hasAC ? effectiveDmg : r.dmg;
      const dt = getDmgType(r.name);
      runningByType[dt] = (runningByType[dt]||0) + thisDmg;
    }
    let acLine='';
    if(hasAC && !acLineDrawn && isHit===false){ acLineDrawn=true; acLine=' ac-line'; }

    let cls = '';
    if(fumbleFail) cls = '';
    else if(critConfirmed) cls = 'crit';
    else if(isHit===true) cls = 'hit';
    else if(isHit===false) cls = 'miss';

    let dmgCell;
    if (r.isWeb) {
      dmgCell = isHit===false ? '-' : 'entangle';
    } else if (hasAC) {
      if (!isHit) dmgCell = '-';
      else if (critConfirmed) dmgCell = `<span class="shimmer-red">${effectiveDmg}</span>`;
      else dmgCell = `${effectiveDmg}`;
    } else {
      if (r.critOk) dmgCell = `${r.dmgNoCrit}/<span class="shimmer-red">${r.dmg}</span>`;
      else dmgCell = `${r.dmgNoCrit}`;
    }
    let runCell;
    if (isHit===false || r.nat1) { runCell = ''; }
    else if (runningDmg !== runningDmgCrit) { runCell = `${runningDmg}/${runningDmgCrit}`; }
    else { runCell = runningDmg; }

    const spPips = r.specials.filter(s=>s!=='rake').map(s => IC[s] || '').join('');
    const pipCell = spPips ? `<span class="atk-pips">${spPips}</span>` : `<span class="atk-pips"></span>`;
    const nameCls = r.isRake ? 'atk-name atk-rake' : r.primary ? 'atk-name atk-primary' : 'atk-name';
    const gmfMark = r.gmfHit ? '<span class="gmf-mark" title="Greater Magic Fang">✦</span>' : '';
    const nameCell = `${pipCell}<span class="${nameCls}">${r.name.toLowerCase()}</span>${gmfMark}`;

    if ((isHit || !hasAC) && r.specials.length) {
      for (const s of r.specials.filter(x=>x!=='rake')) {
        triggeredSpecials.add(s);
      }
    }

    const paAtkStr = r.paAtk ? ` ${r.paAtk} PA` : '';
    const buffAtkStr = (r.buffAtk||r.paAtk) ? ` (${r.baseBonus>=0?'+':''}${r.baseBonus} base${r.buffAtk?` ${r.buffAtk>=0?'+':''}${r.buffAtk} buffs`:''}${paAtkStr})` : '';
    const atkTip = `d20: ${r.r} ${r.bonus>=0?'+':''}${r.bonus}${buffAtkStr} = ${r.total}${r.critOk?' | conf: '+r.critConf+' '+((r.bonus>=0?'+':'')+r.bonus)+' = '+r.critConfTotal:''}${r.nat1?' | reroll: '+r.fumbleConf+' '+((r.bonus>=0?'+':'')+r.bonus)+' = '+r.fumbleConfTotal:''}`;
    let atkCell = `${r.total}`;
    if (critPending) atkCell = `<span class="tag-threat">CRIT/${r.critConfTotal}</span>`;
    else if (critConfirmed) atkCell = `<span class="shimmer-red">CONF</span>`;
    else if (r.critOk && hasAC) atkCell = `<span class="tag-crit">CRIT</span>`;
    else if (fumblePending) atkCell = `<span class="tag-nat1">FAIL/${r.fumbleConfTotal}</span>`;
    else if (fumbleFail) atkCell = `<b class="tag-fumble">FUMBLE</b>`;
    else if (fumbleSafe) atkCell = `<span class="tag-muted">FAIL</span>`;
    const dmgType = getDmgType(r.name);
    const typeNames = dmgType.split('/').map(t=>({B:'bludg.',S:'slash.',P:'pierc.'})[t]||t).join(', ');
    const baseMod = r.dmgMod - (r.buffDmg||0) - (r.paDmg||0);
    const buffPart = r.buffDmg ? ` +${r.buffDmg} buff` : '';
    const paPart = r.paDmg ? ` +${r.paDmg} PA` : '';
    const rollStr = r.dmgRolls ? `[${r.dmgRolls.join('+')}]${baseMod>=0?'+':''}${baseMod}${buffPart}${paPart}` : '';
    const dmgTip = `${r.dmgDice||'?'}: ${rollStr} (${typeNames})`;
    const runTip = (runCell && !r.nat1 && !(isHit===false)) ? Object.entries(runningByType).map(([t,v])=>`${v} (${t})`).join(', ') : '';
    tableHTML+=`<tr class="${cls}${acLine}"><td>${nameCell}</td><td class="total" title="${atkTip}">${atkCell}</td><td class="dmg" title="${dmgTip}">${dmgCell}</td><td class="running" title="${runTip}">${runCell}</td></tr>`;
  }

  // Rend auto-rows at BOTTOM of attack table
  // Active when 2+ claw attacks hit vs AC. No AC set → always active (player judges).
  for (const ar of rendRows) {
    const clawHits = hasAC ? pr.rows.filter(r => r.name.toLowerCase().includes('claw') && r.hit_ac >= refAC).length : 999;
    const active = clawHits >= 2;
    const cls = active ? 'auto-active' : 'auto-muted';
    if (active) {
      runningDmg += ar.dmg; runningDmgCrit += ar.dmg;
      if (hasAC) { hitDmg += ar.dmg; }
    }
    const runCell = active ? runningDmg : '—';
    const baseMod = ar.dmgMod - (ar.buffDmg||0);
    const buffPart = ar.buffDmg ? ` +${ar.buffDmg} buff` : '';
    const rollStr = ar.dmgRolls ? `[${ar.dmgRolls.join('+')}]${baseMod>=0?'+':''}${baseMod}${buffPart}` : '';
    const dmgTip = `${ar.dmgDice}: ${rollStr}`;
    tableHTML += `<tr class="${cls} rend-row"><td><span class="atk-pips"></span><span class="atk-name">${ar.name.toLowerCase()}</span></td><td class="total">—</td><td class="dmg" title="${dmgTip}">${ar.dmg}</td><td class="running">${runCell}</td></tr>`;
  }

  tableHTML+=`</table>`;

  // Specials legend
  const specialsHTML = renderSpecialsLegend(c, pr, refAC, triggeredSpecials, maintainMode);

  // Summary
  const nCrits = pr.rows.filter(r=>r.critOk && (!hasAC || r.critConfTotal >= refAC)).length;
  const nFumbles = pr.rows.filter(r=>r.nat1 && hasAC && r.fumbleConfTotal < refAC).length;
  const critNote = nCrits ? ` | <span class="tag-crit">${nCrits} CRIT${nCrits>1?'S':''}</span>` : '';
  const fumbleNote = nFumbles ? ` | <span class="tag-fumble">${nFumbles} FUMBLE${nFumbles>1?'S':''}</span>` : '';
  const dmgDisplay = runningDmg !== runningDmgCrit ? `${runningDmg}/<span class="tag-crit">${runningDmgCrit}</span>` : `${runningDmg}`;
  const summaryTip = Object.entries(runningByType).map(([t,v])=>`${v} (${t})`).join(', ');
  let summaryHTML;
  if(hasAC) {
    summaryHTML=`<div class="roll-summary"><table class="roll-summary-table"><tr>
      <td class="summary-label"><b class="tag-hit">${hitCount}</b>/${totalAtks} hit${critNote}${fumbleNote}</td>
      <td class="total-dmg" title="${summaryTip}">${hitDmg}</td>
    </tr></table></div>`;
  } else {
    summaryHTML=`<div class="roll-summary"><table class="roll-summary-table"><tr>
      <td class="summary-label">${totalAtks} attacks${critNote}${fumbleNote}</td>
      <td class="total-dmg" title="${summaryTip}">${dmgDisplay}</td>
    </tr></table></div>`;
  }

  return { tableHTML, specialsHTML, summaryHTML };
}

function renderSpecialsLegend(c, pr, refAC, triggeredSpecials, maintainMode) {
  const hasAC = refAC > 0;
  const allSpecials = new Set();
  c.attacks.forEach(a => a.sp.forEach(s => { if(s!=='rake') allSpecials.add(s); }));
  allSpecials.delete('constrict');
  const hasExtraLegend = c.hasWeb || c.hasDrench || c.hasPull || c.hasQuills || c.hasSpikes || c.hasBreathWeapon || c.hasHeatedRock || c.hasStampede || c.hasAttach || c.hasBloodDrain || c.hasElectricity || c.hasMusk || (c.hasDeathRoll && c.grappling);
  if (allSpecials.size === 0 && !hasExtraLegend) return '';

  let html = `<div class="specials-section">`;
  for (const s of allSpecials) {
    const isTriggered = triggeredSpecials.has(s);
    const pip = IC[s] || '';
    const mark = (isTriggered && hasAC) ? ' ✓' : '';
    const sName = s.charAt(0).toUpperCase()+s.slice(1);
    const url = PFSRD[s] || '#';
    let info = '';
    if (s === 'grab') {
      if (maintainMode) {
        info = pr.maintain ? ` <span class="shimmer-blue">maintain ${pr.maintain.total} vs CMD</span>` : '';
      } else {
        let grabs = pr.grabs;
        if (hasAC) {
          const hitNames = new Set(pr.rows.filter(r => r.hit_ac >= refAC).map(r => r.name));
          grabs = grabs.filter(g => hitNames.has(g.atk));
        }
        const rolls = grabs.map(g=>g.total).join(', ');
        info = rolls ? ` ${rolls} vs CMD` : '';
      }
    } else {
      const detail = c.specialAbilities?.find(a => a.name.toLowerCase().includes(s));
      if (detail?.desc) {
        const dcMatch = detail.desc.match(/DC\s*(\d+)/);
        const saveMatch = detail.desc.match(/(Fort|Ref|Will)/);
        const effectMatch = detail.desc.match(/effect\s+(.+?)(?:;|$)/);
        const parts = [];
        if (saveMatch) parts.push(saveMatch[1]);
        if (dcMatch) parts.push(`DC ${dcMatch[1]}`);
        if (effectMatch) parts.push(effectMatch[1].trim().replace(/\s*damage\s*/gi,'').slice(0,20));
        if (parts.length) info = ` ${parts.join(' ')}`;
      }
    }
    const infoCls = (isTriggered && hasAC) ? 'legend-active' : '';
    html += `<div class="special-legend legend-${s}">${pip} <a class="sp-link" href="${url}" target="_blank" onclick="event.stopPropagation()">${sName}</a>${mark} <span class="${infoCls}">${info}</span></div>`;
  }
  // Extra legend entries — data-driven for extensibility
  const EXTRA_LEGENDS = [
    { test: c => c.hasDeathRoll && c.grappling,
      render: (c) => {
        const cls = c.grappling ? 'legend-active' : '';
        return `<div class="special-legend legend-trip">${IC.trip||''} <a class="sp-link" href="${PFSRD['death roll']||PFSRD['trip']||'#'}" target="_blank" onclick="event.stopPropagation()">Trip</a> <span class="${cls}">auto (≤${c.size||''})</span></div>`;
      }},
    { test: c => c.hasWeb && c.webAtk,
      render: (c, pr, hasAC, refAC) => {
        const webRow = pr.rows.find(r => r.isWeb);
        const hit = webRow && hasAC && webRow.hit_ac >= refAC;
        return `<div class="special-legend legend-grab"><a class="sp-link" href="${PFSRD['web']||'#'}" target="_blank" onclick="event.stopPropagation()">Web</a> <span class="${hit?'legend-active':''}">DC ${c.webAtk.dc} Escape Artist / break hp ${c.webAtk.hp}</span></div>`;
      }},
    { test: c => c.hasDrench,
      render: () => `<div class="special-legend"><a class="sp-link" href="${PFSRD['drench']||'#'}" target="_blank" onclick="event.stopPropagation()">Drench</a> extinguishes non-magical fires</div>` },
    { test: c => c.hasPull && c.pullDist,
      render: (c) => `<div class="special-legend"><a class="sp-link" href="${PFSRD['pull']||'#'}" target="_blank" onclick="event.stopPropagation()">Pull</a> ${c.pullDist} on hit</div>` },
    { test: c => c.hasQuills,
      render: (c) => `<div class="special-legend"><a class="sp-link" href="#" target="_blank" onclick="event.stopPropagation()">Quills</a> melee attackers take ${c.quillsDmg||'damage'}</div>` },
    { test: c => c.hasBreathWeapon && c.breathDC,
      render: (c) => `<div class="special-legend"><a class="sp-link" href="${PFSRD['breath weapon']||'#'}" target="_blank" onclick="event.stopPropagation()">Breath</a> ${c.breathShape||'area'} Ref DC ${c.breathDC} / 4 rounds</div>` },
    { test: c => c.hasHeatedRock && c.heatedRockDmg,
      render: (c) => `<div class="special-legend">Heated Rock +${c.heatedRockDmg} fire on rock hits</div>` },
    { test: c => c.hasStampede,
      render: () => `<div class="special-legend">Stampede trample with 3+ creatures</div>` },
    { test: c => c.hasAttach,
      render: () => `<div class="special-legend"><a class="sp-link" href="${PFSRD['attach']||'#'}" target="_blank" onclick="event.stopPropagation()">Attach</a> grapples on touch hit (AC 12 while attached)</div>` },
    { test: c => c.hasBloodDrain,
      render: () => `<div class="special-legend"><a class="sp-link" href="${PFSRD['blood drain']||'#'}" target="_blank" onclick="event.stopPropagation()">Blood Drain</a> 1 Con/round while attached</div>` },
    { test: c => c.hasElectricity && c.electricityDC,
      render: (c, pr, hasAC, refAC) => {
        const tailRow = pr.rows.find(r => r.name.includes('tail'));
        const crit = tailRow && tailRow.critOk && (!hasAC || tailRow.critConfTotal >= refAC);
        const cls = crit ? 'legend-active' : '';
        return `<div class="special-legend"><a class="sp-link" href="${PFSRD['electricity']||'#'}" target="_blank" onclick="event.stopPropagation()">Electricity</a> <span class="${cls}">on crit: Fort DC ${c.electricityDC} or stunned 1d4 rds</span></div>`;
      }},
    { test: c => c.hasMusk && c.muskAtk,
      render: (c, pr, hasAC, refAC) => {
        const muskRow = pr.rows.find(r => r.isMusk);
        const hit = muskRow && hasAC && muskRow.hit_ac >= refAC;
        return `<div class="special-legend"><span class="${hit?'legend-active':''}">Musk Fort DC ${c.muskAtk.dc} or nauseated 1d6 rds, then sickened 1d6 min (2/day)</span></div>`;
      }},
  ];
  for (const entry of EXTRA_LEGENDS) {
    if (entry.test(c)) html += entry.render(c, pr, hasAC, refAC);
  }

  // Crit rider feats — show conditionally when a crit confirms
  const featsLow = (c.feats||'').toLowerCase();
  const hasConfirmedCrit = pr.rows.some(r => r.critOk && (!hasAC || r.critConfTotal >= refAC));
  if (hasConfirmedCrit) {
    if (featsLow.includes('bleeding critical')) {
      const cls = hasAC ? 'legend-active' : '';
      html += `<div class="special-legend"><span class="${cls}">Bleeding Critical: 2d6 bleed/round (stacks)</span></div>`;
    }
    if (featsLow.includes('staggering critical')) {
      const bab = c.bab || 0;
      const dc = 10 + bab;
      const cls = hasAC ? 'legend-active' : '';
      html += `<div class="special-legend"><span class="${cls}">Staggering Critical: Fort DC ${dc} or staggered 1d4+1 rounds</span></div>`;
    }
  }

  return html + `</div>`;
}

function renderAbilities(c) {
  const meleeSpecials = new Set(['grab','trip','poison','constrict','rake','rend','attach','burn','pull','push','pounce','death roll','gnaw','death','rage','blood rage','powerful charge','earth mastery','water mastery','powerful','earth','water','web','rock throwing','rock throw','trample','whirlwind','vortex','vital strike','improved vital strike','greater vital strike','stampede','drench','breath weapon','heated rock','blood drain','musk','tongue','electricity']);
  const keyAbilities = (c.specialAbilities || []).filter(a => {
    const kw = a.name.split(/[\s(]/)[0].toLowerCase();
    const kwFull = a.name.split('(')[0].trim().toLowerCase();
    return !meleeSpecials.has(kw) && !meleeSpecials.has(kwFull);
  });
  const saText = c.specialAtks || '';
  const saTextParsed = [...saText.matchAll(/(\w[\w\s]*?)\s*\(([^)]+)\)/g)];
  for (const m of saTextParsed) {
    const name = m[1].trim().toLowerCase();
    if (meleeSpecials.has(name)) continue;
    if (keyAbilities.find(a => a.name.toLowerCase().includes(name))) continue;
    const pfsrdName = name.replace(/\s+/g, '-');
    const url = PFSRD[name] || `https://www.d20pfsrd.com/bestiary/rules-for-monsters/universal-monster-rules/#${pfsrdName}`;
    keyAbilities.push({ name: m[1].trim(), desc: m[2], _fromText: true, _url: url });
  }
  // CMB feat maneuvers — parse from Feats string
  // Inline shows CMB value only; tooltip has tactical detail
  const cmbFeats = [];
  const fs = (c.feats||'');
  const fsLow = fs.toLowerCase();
  const cmbVal = c.cmb || 0;
  if (fsLow.includes('improved bull rush')) {
    const hasGreater = fsLow.includes('greater bull rush');
    const tip = hasGreater ? 'Pushed foe provokes AoOs from allies. No AoO to initiate.' : 'No AoO to initiate.';
    cmbFeats.push({name: hasGreater ? 'Gr. Bull Rush' : 'Imp. Bull Rush', cmb: cmbVal+2, tip, url: PFSRD['bull rush']});
  }
  if (fsLow.includes('improved overrun')) {
    const hasGreater = fsLow.includes('greater overrun');
    const tip = hasGreater ? 'Overrun foe provokes AoOs. No AoO to initiate.' : 'No AoO to initiate.';
    cmbFeats.push({name: hasGreater ? 'Gr. Overrun' : 'Imp. Overrun', cmb: cmbVal+2, tip, url: PFSRD['overrun']});
  }
  if (fsLow.includes('improved sunder')) {
    cmbFeats.push({name: 'Imp. Sunder', cmb: cmbVal+2, tip: 'No AoO to initiate.', url: PFSRD['sunder']});
  }
  if (fsLow.includes('awesome blow')) {
    cmbFeats.push({name: 'Awesome Blow', cmb: cmbVal, tip: 'Target flies 10ft + prone. Standard action.', url: PFSRD['awesome blow']});
  }
  for (const cf of cmbFeats) {
    keyAbilities.push({name: cf.name, desc: `CMB ${fmtMod(cf.cmb)}`, _tip: cf.tip, _fromText: true, _url: cf.url});
  }

  if (keyAbilities.length === 0) return '';
  let html = '<div class="ability-section">';
  for (const a of keyAbilities) {
    const dcMatch = a.desc.match(/DC\s*(\d+)/);
    const dcStr = dcMatch ? `DC ${dcMatch[1]}` : '';
    const rangeMatch = a.desc.match(/(\d+)[- ](?:foot|ft)/);
    const rangeStr = rangeMatch ? `${rangeMatch[1]}` : '';
    const saveMatch = a.desc.match(/(Will|Fort|Ref)\s*(?:save)?/i);
    const saveStr = saveMatch ? saveMatch[1] : '';
    const typeMatch = a.name.match(/\((Su|Ex|Sp)\)/);
    const typeStr = typeMatch ? typeMatch[1] : '';
    let info = [dcStr, saveStr, rangeStr].filter(Boolean).join(' ');
    if (!info && a._fromText && a.desc) info = a.desc;
    // Detail text: tap to expand. CMB feats use _tip, others use full desc.
    const detail = a._tip || (a.desc && !a._fromText ? a.desc : '');
    const nameClean = a.name.split('(')[0].trim();
    const tipAttr = detail ? ` title="${detail.replace(/"/g, '&quot;')}"` : '';
    const nameDisp = `<span class="ability-name"${tipAttr}>${nameClean}</span>`;
    const srdLink = a._url ? ` <a class="sp-link" href="${a._url}" target="_blank" onclick="event.stopPropagation()">SRD</a>` : '';
    const detailHTML = detail ? `<div class="ability-detail">${detail}${srdLink}</div>` : (srdLink ? `<div class="ability-detail">${srdLink.trim()}</div>` : '');
    html += `<div class="ability-row" onclick="event.stopPropagation();this.classList.toggle('expanded')">
      <span>${nameDisp} <span class="ability-type">${typeStr}</span></span>
      <span class="ability-dc">${info}</span>
      ${detailHTML}
    </div>`;
  }
  return html + '</div>';
}

function renderStatBlock(c) {
  return `<div class="statblock">
    <div class="sb-row">
      <span class="sb-label">AC</span><span class="sb-val">${c.ac} ${c.acBreak?'('+c.acBreak+')':''}</span>
    </div>
    <div class="sb-row">
      <span class="sb-label">HP</span><span class="sb-val">${c.maxHp} (${c.hd})</span>
      <span class="sb-label">Spd</span><span class="sb-val">${c.speed}</span>
    </div>
    <div class="sb-row">
      <span class="sb-label">Fort</span><span class="sb-val">${fmtMod(c.fort)}</span>
      <span class="sb-label">Ref</span><span class="sb-val">${fmtMod(c.ref)}</span>
      <span class="sb-label">Will</span><span class="sb-val">${fmtMod(c.will)}</span>
    </div>
    <div class="sb-row">
      <span class="sb-label">CMB</span><span class="sb-val">${fmtMod(c.cmb)}</span>
      <span class="sb-label">CMD</span><span class="sb-val">${c.cmd}</span>
      <span class="sb-label">BAB</span><span class="sb-val">${fmtMod(c.bab)}</span>
    </div>
    <div class="sb-abilities">
      <div><div class="ab-label">STR</div><div class="ab-val">${c.str}</div></div>
      <div><div class="ab-label">DEX</div><div class="ab-val">${c.dex}</div></div>
      <div><div class="ab-label">CON</div><div class="ab-val">${c.con}</div></div>
      <div><div class="ab-label">INT</div><div class="ab-val">${c.int}</div></div>
      <div><div class="ab-label">WIS</div><div class="ab-val">${c.wis}</div></div>
      <div><div class="ab-label">CHA</div><div class="ab-val">${c.cha}</div></div>
    </div>
    <div class="sb-section">
      <div class="sb-row"><span class="sb-label">Space</span><span class="sb-val">${c.space}</span><span class="sb-label">Reach</span><span class="sb-val">${c.reach}</span></div>
      ${c.specialAtks?`<div class="sb-row"><span class="sb-label">SA</span><span class="sb-val">${c.specialAtks}</span></div>`:''}
      ${c.specialQual?`<div class="sb-row"><span class="sb-label">SQ</span><span class="sb-val">${c.specialQual}</span></div>`:''}
      ${c.feats?`<div class="sb-row"><span class="sb-label">Feats</span><span class="sb-val">${c.feats}</span></div>`:''}
    </div>
    ${c.specialAbilities && c.specialAbilities.length ? `<div class="sb-section">${c.specialAbilities.map(a=>`<div class="sb-row"><span class="sb-label sb-sa-label">${a.name}</span><span class="sb-val sb-sa-val">${a.desc}</span></div>`).join('')}</div>` : ''}
    <div class="sb-section">
      <span>${c.type} | ${c.size} | CR ${c.cr}</span>
      ${c.pfsrdUrl?` | <a href="${c.pfsrdUrl}" target="_blank" onclick="event.stopPropagation()">d20pfsrd</a>`:''}
    </div>
  </div>`;
}

function renderCard(c, group, refAC, groupIdx) {
  if (!c.alive) return renderDeadCard(c);

  const hpPct=c.maxHp>0?(c.hp/c.maxHp*100):0;
  const hpCls=hpPct>50?'':hpPct>25?'low':'crit';
  const cardCls=group.casting?'casting':'';
  const durBadge=group.src==='companion'?'∞':group.src==='figurine'?'1hr':`${group.rl}${IC.countdown('icon-sm')}`;

  // Group identity via data-group attribute on card element

  // Roll table + specials + summary
  let summaryHTML='', tableHTML='', specialsHTML='';
  const pr = c.rawRoll ? computeRoll(c) : null;
  if (pr) {
    const result = renderRollTable(c, pr, refAC);
    tableHTML = result.tableHTML;
    specialsHTML = result.specialsHTML;
    summaryHTML = result.summaryHTML;
  }

  const hpTap = `<span class="hp-tap" onclick="openNumpad('hp','${c.id}',this)" title="Tap to adjust HP">${IC.hp()}${c.hp}/${c.maxHp}</span>`;

  return `<div class="ccard ${cardCls}" data-group="${groupIdx % 5}">
        <span class="ccard-id">${c.id} <span class="ccard-dismiss" onclick="dismissCreature('${c.id}','${group.id}')" title="Dismiss">×</span></span>
    <div class="ccard-namerow">
      <span class="ccard-name" onclick="event.stopPropagation();openStatPopover('${(c.bName||c.name).replace(/'/g,"\\'")}')">${c.name}</span>
      <span class="ccard-dur">${durBadge}</span>
    </div>
    <div class="ccard-head">
      ${hpTap}<span class="ccard-ac">${c.ac}${IC.ac()}</span>
    </div>
    <div class="hpbar" onclick="event.stopPropagation();openNumpad('hp','${c.id}',this)"><div class="hpfill ${hpCls}" style="--hp-cur:${c.hp}; --hp-max:${c.maxHp}"></div></div>
    <div class="hp-row">
      <span class="ccard-cmd">CMD ${c.cmd}</span>
    </div>
    ${renderAbilities(c)}
    ${renderDecisions(c)}
    ${summaryHTML}${tableHTML}${specialsHTML}
    ${renderBuffChips(c)}
    <div class="ccard-meta"><span class="meta-spd">${fmtSpeed(c.speed)}</span><span class="meta-right"><span>Reach ${(c.reach||'').replace(/\s*ft\.?/g,'')}</span><br><span>${c.size}</span></span></div>
    ${renderStatBlock(c)}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
//  ACTIONS
// ═══════════════════════════════════════════════════════════════
function findC(id){for(const g of S.groups){const c=g.creatures.find(x=>x.id===id);if(c)return c;}return null;}
function deathThreshold(c){return c.hasDiehard ? -c.con : 0;}
function checkDeath(c){const thresh=deathThreshold(c);if(c.hp<=thresh)c.alive=false;}
function dmgC(id,n){const c=findC(id);if(c){
  const thresh=deathThreshold(c);
  c.hp=Math.max(thresh,c.hp-n);checkDeath(c);
  // Triggered buff system: check creature triggers on damage
  if(c.alive&&n>0&&c.triggers){for(const t of c.triggers){if(t.on==='damage'&&BD[t.apply]){c.buffOvr[t.apply]=true;}}}
  render();
}}
function healC(id,n){const c=findC(id);if(c){c.hp=Math.min(c.maxHp,c.hp+n);c.alive=c.hp>deathThreshold(c);render();}}
function hpAdj(id,n){const c=findC(id);if(c){const thresh=deathThreshold(c);c.hp=Math.max(thresh,Math.min(c.maxHp,c.hp+n));checkDeath(c);if(n<0&&c.alive&&c.triggers){for(const t of c.triggers){if(t.on==='damage'&&BD[t.apply]){c.buffOvr[t.apply]=true;}}}render();}}
function hpSet(id,val){if(!val)return;const n=parseInt(val);if(isNaN(n))return;if(val.startsWith('+')||val.startsWith('-')){hpAdj(id,n);}else{const c=findC(id);if(c){const thresh=deathThreshold(c);c.hp=Math.max(thresh,Math.min(c.maxHp,n));checkDeath(c);render();}}}
function reviveC(id,full){const c=findC(id);if(c){c.alive=true;c.hp=full?c.maxHp:1;preRoll(c);render();}}
function togPounce(id){const c=findC(id);if(c){c.pouncing=!c.pouncing;if(c.pouncing)c.grappling=false;render();}}
function togGrapple(id){const c=findC(id);if(c){c.grappling=!c.grappling;if(c.grappling){c.pouncing=false;c.grappleRound=S.round;}else{c.grappleRound=0;}render();}}
function togFlanking(id){const c=findC(id);if(c){c.flanking=!c.flanking;render();}}
function togPA(id){const c=findC(id);if(c){c.powerAttacking=!c.powerAttacking;render();}}
function togMastery(id,type){const c=findC(id);if(c){if(type==='earth')c.earthMastery=!c.earthMastery;else c.waterMastery=!c.waterMastery;render();}}
function togCharge(id){const c=findC(id);if(c){c.charging=!c.charging;if(c.charging)c.pouncing=false;render();}}
function togTrample(id){const c=findC(id);if(c){c.trampling=!c.trampling;render();}}
function togVitalStrike(id){const c=findC(id);if(c){c.vitalStriking=!c.vitalStriking;render();}}
function togWhirlwind(id){const c=findC(id);if(c){c.whirlwinding=!c.whirlwinding;if(c.whirlwinding)c.vortexing=false;render();}}
function togVortex(id){const c=findC(id);if(c){c.vortexing=!c.vortexing;if(c.vortexing)c.whirlwinding=false;render();}}
let dismissed = []; // {creature, groupId, groupName}
function dismissCreature(cid, gid) {
  for (const g of S.groups) {
    const idx = g.creatures.findIndex(x => x.id === cid);
    if (idx >= 0) {
      const c = g.creatures.splice(idx, 1)[0];
      dismissed.push({ creature: c, groupId: g.id, groupName: g.name });
      break;
    }
  }
  S.groups = S.groups.filter(g => g.creatures.length > 0);
  render();
  // Force-open dismissed tray
  closeAllTrays();
  document.getElementById('tray-dismissed').classList.add('open');
  document.getElementById('tab-dismissed').classList.add('active');
}
function restoreFromDismissed(idx) {
  const item = dismissed.splice(idx, 1)[0];
  if (!item) return;
  const c = item.creature;
  c.alive = true;
  c.dismissed = false;
  preRoll(c);
  // Find or recreate the group
  let g = S.groups.find(x => x.id === item.groupId);
  if (!g) {
    g = { id: item.groupId, name: item.groupName, src: 'sna', creatures: [], rl: 1, casting: false };
    S.groups.push(g);
  }
  g.creatures.push(c);
  render();
}
function manifest(gid){const g=S.groups.find(x=>x.id===gid);if(g){g.casting=false;render();}}
function tFeat(el){S.feats[el.dataset.feat]=!S.feats[el.dataset.feat];render();}
function tBuff(el){S.buffs[el.dataset.buff]=!S.buffs[el.dataset.buff];render();}
function togCBuff(cid,bid){
  for(const g of S.groups){const c=g.creatures.find(x=>x.id===cid);
    if(c){
      if(S.buffs[bid]) { // Global buff: toggle override off/on
        c.buffOvr[bid]=c.buffOvr[bid]===false?undefined:false;
      } else { // Local-only buff: remove it
        delete c.buffOvr[bid];
      }
      render();return;
    }
  }
}
// Add a local-only buff to a creature
function addLocalBuff(cid,bid){
  const c=findC(cid);if(!c)return;
  c.buffOvr[bid]=true;
  closeAddBuff();
  render();
}
function showAddBuff(cid,el){
  event.stopPropagation();
  closeAddBuff();
  const rect=el.getBoundingClientRect();
  const pop=document.createElement('div');
  pop.className='buff-add-popup';
  // List buffs from BD not globally active and not already local on this creature
  const c=findC(cid);if(!c)return;
  const items=Object.entries(BD).filter(([id])=>!S.buffs[id]&&c.buffOvr[id]!==true);
  if(!items.length){pop.innerHTML='<div class="buff-add-item">No buffs available</div>';}
  else{pop.innerHTML=items.map(([id,def])=>{
    const ia=def.gmf?gmfBonus():def.a, idmg=def.gmf?gmfBonus():def.d;
    const info=[ia?`+${ia}a`:'',idmg?`+${idmg}d`:'',def.s?`+${def.s}s`:'',def.extra?'haste':'',def.fh?`fh${def.fh}`:''].filter(Boolean).join('/');
    return `<div class="buff-add-item" onclick="event.stopPropagation();addLocalBuff('${cid}','${id}')">${id} <span class="buff-add-detail">${info}</span></div>`;
  }).join('');}
  let left=rect.left,top=rect.top-items.length*28-8;
  if(top<4)top=rect.bottom+4;
  if(left+140>window.innerWidth)left=window.innerWidth-144;
  pop.style.left=left+'px';pop.style.top=top+'px';
  document.body.appendChild(pop);
  addBuffPopup=pop;
}
function closeAddBuff(){if(addBuffPopup){addBuffPopup.remove();addBuffPopup=null;}}
function clearAll(){S.groups=[];S.effects=[];S.round=0;nCid=1;nGid=1;dismissed=[];document.getElementById('ref-ac').value='';updACDisplay();localStorage.removeItem(SAVE_KEY);render();}
let _resetPending = 0;
function resetApp(){
  if (Date.now() - _resetPending < 3000) { localStorage.clear(); location.reload(); return; }
  _resetPending = Date.now();
  const el = document.querySelector('.reset-toggle');
  if (el) { el.textContent = '↻ Tap again'; setTimeout(() => { el.textContent = '↻ Reset'; _resetPending = 0; }, 3000); }
}

// ═══════════════════════════════════════════════════════════════
//  NUMPAD POPUP
// ═══════════════════════════════════════════════════════════════
let NP = { open: false, mode: null, cid: null, value: '', sign: -1, el: null };

function openNumpad(mode, cid, triggerEl) {
  event.stopPropagation();
  const pad = document.getElementById('numpad');
  const label = document.getElementById('np-label');
  const signBtn = document.getElementById('np-sign-btn');
  NP = { open: true, mode, cid, value: '', sign: mode === 'hp' ? -1 : 0, el: triggerEl };

  if (mode === 'hp') {
    const c = findC(cid);
    label.textContent = c ? `${c.name} — ${c.hp}/${c.maxHp}` : 'HP';
    signBtn.className = 'np-sign-btn dmg';
    signBtn.textContent = '−';
  } else {
    const cur = document.getElementById('ref-ac').value;
    label.textContent = 'Target AC';
    signBtn.className = 'np-ac-label';
    signBtn.textContent = 'AC';
  }

  updNumpadDisplay();
  pad.classList.add('open');

  // Position near trigger
  const rect = triggerEl.getBoundingClientRect();
  const padW = 164, padH = 250;
  let left = rect.left + rect.width / 2 - padW / 2;
  let top = rect.top - padH - 8;
  if (top < 4) top = rect.bottom + 8;
  if (left < 4) left = 4;
  if (left + padW > window.innerWidth - 4) left = window.innerWidth - padW - 4;
  pad.style.left = left + 'px';
  pad.style.top = top + 'px';
}

function numpadKey(k) {
  event.stopPropagation();
  if (k === 'ok') {
    numpadSubmit();
    return;
  }
  if (k === 'sign') {
    if (NP.mode === 'hp') {
      NP.sign = NP.sign === -1 ? 1 : -1;
      const btn = document.getElementById('np-sign-btn');
      if (NP.sign === 1) { btn.className = 'np-sign-btn heal'; btn.textContent = '+'; }
      else { btn.className = 'np-sign-btn dmg'; btn.textContent = '−'; }
    }
    updNumpadDisplay();
    return;
  }
  // Digit — cap at 3 digits
  if (NP.value.length >= 3) return;
  NP.value += k;
  updNumpadDisplay();
}

function numpadClear() {
  event.stopPropagation();
  NP.value = '';
  updNumpadDisplay();
}

function updNumpadDisplay() {
  const disp = document.getElementById('np-display');
  if (NP.mode === 'hp') {
    const signStr = NP.sign === -1 ? '−' : '+';
    const signCls = NP.sign === -1 ? 'dmg' : 'heal';
    disp.innerHTML = `<span class="np-sign ${signCls}">${signStr}</span>${NP.value || '0'}`;
  } else {
    disp.textContent = NP.value || '?';
  }
}

function numpadSubmit() {
  const n = parseInt(NP.value);
  if (NP.mode === 'hp' && NP.cid && !isNaN(n) && n > 0) {
    const val = NP.sign * n;
    hpAdj(NP.cid, val);
  } else if (NP.mode === 'ac') {
    const acInput = document.getElementById('ref-ac');
    if (!isNaN(n) && n > 0) {
      acInput.value = n;
    } else {
      acInput.value = '';
    }
    updACDisplay();
    render();
  }
  closeNumpad();
}

function closeNumpad() {
  NP.open = false;
  document.getElementById('numpad').classList.remove('open');
}

function updACDisplay() {
  const val = document.getElementById('ref-ac').value;
  const disp = document.getElementById('disp-ac');
  if (val && parseInt(val) > 0) {
    disp.textContent = val;
    disp.className = 'ac-val';
  } else {
    disp.textContent = '?';
    disp.className = 'ac-val empty';
  }
}
function doImport(){try{const j=JSON.parse(document.getElementById('inp-import').value);
  if(j.ac){document.getElementById('ref-ac').value=j.ac;updACDisplay();}
  if(j.buffs)for(const b of j.buffs)S.buffs[b]=true;
  if(j.slot)document.getElementById('inp-slot').value=j.slot;
  if(j.tier){updTiers();document.getElementById('inp-tier').value=j.tier;}
  updCreatures();
  if(j.creature){selectedCreature=j.creature;doSummon();}
  render();
}catch(e){alert('Bad JSON: '+e.message);}}

// ═══════════════════════════════════════════════════════════════
//  TODO: CONDITIONS (sickened, blind, paralyzed, etc.)
//  Add per-creature condition toggles once core features stable.
//  Conditions modify attack/damage/AC/saves — integrate with bTotal().
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  STATE PERSISTENCE (localStorage)
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY = 'sna-combat-state';
function saveState() {
  try {
    const data = {
      S, nGid, nCid, dismissed,
      refAC: document.getElementById('ref-ac').value,
      cl: document.getElementById('inp-cl').value,
      cmod: document.getElementById('inp-cmod').value,
      slot: document.getElementById('inp-slot').value,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) { console.warn('save failed', e); }
}
function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.S || !data.S.groups) return false;
    S = data.S;
    nGid = data.nGid || 1;
    nCid = data.nCid || 1;
    if (data.refAC) document.getElementById('ref-ac').value = data.refAC;
    if (data.cl) document.getElementById('inp-cl').value = data.cl;
    if (data.cmod) document.getElementById('inp-cmod').value = data.cmod;
    if (data.slot) document.getElementById('inp-slot').value = data.slot;
    if (data.dismissed) dismissed = data.dismissed;
    updACDisplay();
    // Re-link creature attacks (parseMelee results are plain objects, survive JSON)
    // Re-roll all living creatures to get fresh dice
    for (const g of S.groups) for (const c of g.creatures) if (c.alive) preRoll(c);
    return true;
  } catch(e) { console.warn('load failed', e); localStorage.removeItem(SAVE_KEY); return false; }
}

// ═══════════════════════════════════════════════════════════════
//  STAT BLOCK POPOVER
// ═══════════════════════════════════════════════════════════════
function openStatPopover(bName) {
  closeNumpad(); // mutual exclusion
  const entry = B[bName.toLowerCase()];
  if (!entry) return;
  const d = entry.data;
  const fs = d.full_statblock || {};
  const cc = d.combat_card || {};

  let html = '';

  // Header: name + tags + CR
  html += `<div class="sp-header"><div>`;
  html += `<div class="sp-name">${d.name}</div>`;
  html += `<div class="sp-tags">`;
  if (d.type) html += `<span class="sp-tag">${d.type}</span>`;
  if (d.size) html += `<span class="sp-tag">${d.size}</span>`;
  html += `</div></div>`;
  if (d.cr) html += `<div class="sp-cr">CR ${d.cr}</div>`;
  html += `</div>`;

  // Groove+ember divider
  html += `<div class="sp-divider"></div>`;

  // Hero stats: HP + AC wells, then info
  const acFull = cc.AC_breakdown || '';
  const acSub = acFull.match(/touch\s+(\d+)/) && acFull.match(/flat[- ]footed?\s+(\d+)/)
    ? `touch ${acFull.match(/touch\s+(\d+)/)[1]} · flat ${acFull.match(/flat[- ]footed?\s+(\d+)/)[1]}`
    : '';
  html += `<div class="sp-hero">`;
  html += `<div class="sp-well"><div class="sp-well-label">HP</div><div class="sp-well-value">${cc.HP || '—'}</div>${cc.HD ? `<div class="sp-well-sub">${cc.HD}</div>` : ''}</div>`;
  html += `<div class="sp-well"><div class="sp-well-label">AC</div><div class="sp-well-value">${cc.AC || '—'}</div>${acSub ? `<div class="sp-well-sub">${acSub}</div>` : ''}</div>`;
  html += `<div class="sp-info">`;
  const sq = cc.Special_Qualities || '';
  if (sq) html += `<span><span class="sp-info-label">Senses </span><span class="sp-info-value">${sq}</span></span>`;
  html += `</div></div>`;

  // Saves
  html += `<div class="sp-saves">`;
  html += `<div class="sp-save"><div class="sp-save-label">Fort</div><div class="sp-save-value">${fmtMod(cc.Fort || 0)}</div></div>`;
  html += `<div class="sp-save"><div class="sp-save-label">Ref</div><div class="sp-save-value">${fmtMod(cc.Ref || 0)}</div></div>`;
  html += `<div class="sp-save"><div class="sp-save-label">Will</div><div class="sp-save-value">${fmtMod(cc.Will || 0)}</div></div>`;
  html += `</div>`;

  // OFFENSE band
  html += `<div class="sp-band">OFFENSE</div>`;
  html += `<div class="sp-section">`;
  if (cc.Speed) html += `<div><span class="sp-kw">Speed </span>${cc.Speed}</div>`;
  if (cc.Melee) html += `<div><span class="sp-kw">Melee </span>${cc.Melee}</div>`;
  if (fs.Space || fs.Reach) html += `<div><span class="sp-kw">Space </span>${fs.Space || '5 ft.'}; <span class="sp-kw">Reach </span>${fs.Reach || '5 ft.'}</div>`;
  if (cc.Special_Attacks) html += `<div class="sp-inlaid"><span class="sp-kw">Special Attacks </span>${cc.Special_Attacks}</div>`;
  html += `</div>`;

  // STATISTICS band
  html += `<div class="sp-band">STATISTICS</div>`;
  html += `<div class="sp-section">`;
  // Ability scores grid
  const abs = ['Str','Dex','Con','Int','Wis','Cha'];
  html += `<div class="sp-abilities">`;
  for (const ab of abs) {
    const score = fs[ab];
    const mod = score != null ? Math.floor((score - 10) / 2) : null;
    const modStr = mod != null ? (mod >= 0 ? `+${mod}` : `${mod}`) : '';
    html += `<div class="sp-ab"><div class="sp-ab-label">${ab}</div><div class="sp-ab-score">${score != null ? score : '—'}</div><div class="sp-ab-mod">${modStr}</div></div>`;
  }
  html += `</div>`;
  if (fs.BAB != null) html += `<div><span class="sp-kw">BAB </span>${fmtMod(fs.BAB)}; <span class="sp-kw">CMB </span>${cc.CMB_full || fmtMod(cc.CMB || 0)}; <span class="sp-kw">CMD </span>${cc.CMD_full || cc.CMD || '—'}</div>`;
  if (fs.Feats) html += `<div><span class="sp-kw">Feats </span>${fs.Feats}</div>`;
  if (fs.Skills) html += `<div><span class="sp-kw">Skills </span>${fs.Skills}</div>`;
  if (cc.Special_Qualities) html += `<div><span class="sp-kw">SQ </span>${cc.Special_Qualities}</div>`;
  html += `</div>`;

  // Special abilities (if any)
  if (d.special_abilities && d.special_abilities.length) {
    html += `<div class="sp-band">SPECIAL ABILITIES</div>`;
    html += `<div class="sp-section">`;
    for (const sa of d.special_abilities) {
      html += `<div class="sp-inlaid"><span class="sp-kw">${sa.name} </span>${sa.desc || ''}</div>`;
    }
    html += `</div>`;
  }

  // Footer — SRD link
  if (d.pfsrd_url) {
    html += `<div class="sp-footer"><a href="${d.pfsrd_url}" target="_blank">View on d20pfsrd.com ↗</a></div>`;
  }

  document.getElementById('stat-popover-content').innerHTML = html;
  document.getElementById('stat-popover-scrim').classList.add('open');
  document.body.classList.add('popover-open');
}

function closeStatPopover() {
  document.getElementById('stat-popover-scrim').classList.remove('open');
  document.body.classList.remove('popover-open');
}

// Close popover on Escape
if (typeof globalThis.__TEST__ === 'undefined') document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('stat-popover-scrim').classList.contains('open')) {
    closeStatPopover();
  }
});

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

// ═══ COMPANIONS (hand-authored statblocks, not from SRD bestiary) ═══
// Shaped like a bestiary entry so mkCreature() handles them unchanged.
// sna_level:0 keeps them out of the summon dropdown (tiers are >=1).
// Source of truth: ~/Downloads/Zerda_Companion_Sheet.pdf (corrected numbers).
const COMPANION_DATA = {
  zerda: { sna_level:0, data:{
    name:'Zerda', type:'animal', size:'Small', cr:'—', source:'companion',
    is_alternate:false, pfsrd_url:'',
    special_abilities:[
      {name:'Evasion (Ex)', desc:'No damage on a successful Reflex save vs effects that deal half damage on a save.'},
      {name:'Devotion (Ex)', desc:'+4 morale bonus on Will saves vs enchantment spells and effects.'},
      {name:'Link (Ex)', desc:'Bond with Fennik: handle as a free action, push as a move action; +4 on wild empathy/Handle Animal.'},
      {name:'Share Spells (Ex)', desc:'Fennik may cast a spell with a target of "you" on Zerda when adjacent or riding.'},
    ],
    combat_card:{
      AC:23, AC_breakdown:'23, touch 14, flat-footed 18 (Dex +4, size +1, dodge +1, natural +7, custom -2)',
      HP:90, HD:'6d8+18', Fort:8, Ref:10, Will:4, Speed:'40 ft.',
      // Two bites (+8/+3) is RAW: the animal-companion Multiattack class feature grants a 2nd attack
      // with the primary natural weapon at -5 when the companion has <3 natural attacks. NOT BAB
      // iteration (natural weapons never iterate), NOT the Multiattack monster feat. Do not "fix" to one bite.
      Melee:'bite +8 (1d4+1), bite +3 (1d4+1)',
      CMB:6, CMB_full:'+6', CMD:21, CMD_full:'21',
      Special_Attacks:'', Special_Qualities:'low-light vision, scent, evasion, devotion, link, share spells',
    },
    full_statblock:{
      Str:12, Dex:18, Con:15, Int:4, Wis:12, Cha:6, BAB:6,
      Feats:'Dodge, Mobility, Acrobatic, Improved Steal, Multiattack',
      Skills:'Acrobatics +13, Perception +20, Stealth +13, Survival +5, Sense Motive +2',
      Space:'5 ft.', Reach:'5 ft.',
    },
  }},
};

// ═══ INIT ═══
function loadBestiary(){
  for(const data of BESTIARY_DATA){
    for(const lv of data.levels||[])for(const cr of lv.creatures||[])B[cr.name.toLowerCase()]={data:cr,sna_level:lv.sna_level};
  }
  for(const[key,entry] of Object.entries(COMPANION_DATA)) B[key]={data:entry.data,sna_level:entry.sna_level};
  for(const[lv,creatures] of Object.entries(RATINGS_DATA.ratings||{})){
    R[+lv]={};
    for(const[name,info] of Object.entries(creatures)) R[+lv][name]=info;
  }
}
function init(){
  loadBestiary();
  updTiers();
  loadState();
  render();
}
if (typeof globalThis.__TEST__ === 'undefined') init();

// ═══════════════════════════════════════════════════════════════
//  NODE.JS EXPORTS (for testing)
// ═══════════════════════════════════════════════════════════════
if (typeof module !== 'undefined') module.exports = {
  parseMelee, parseAbilityDmg, rdice, bTotal, mkCreature, preRoll, computeRoll,
  buildAutoRow, buildRangedRow, loadBestiary, gmfBestWeapon,
  B, R, S, BD, SE, d20, dd,
  _setDice(fn) { dd = fn; d20 = () => fn(20); },
};
