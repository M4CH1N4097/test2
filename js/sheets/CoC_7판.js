/* ════════════════════════════════════════════════
   CoC 7판 시트 플러그인
   js/sheets/CoC_7판.js
   스타일: css/sheets/CoC_7판.css
   ────────────────────────────────────────────────
   pc.sheetData 구조:
   {
     stats:   { STR, CON, SIZ, DEX, APP, INT, POW, EDU },
     derived: { HP, MP, SAN, LCK, DB, MOV },
     skills:  [{ name, val }, ...]
   }
════════════════════════════════════════════════ */
SheetRegistry.register('CoC 7판', function (pc) {

  const d = pc.sheetData || {};

  const stats = d.stats || {
    STR:50, CON:60, SIZ:65, DEX:70,
    APP:60, INT:75, POW:55, EDU:80,
  };
  const derived = d.derived || {
    HP:12, MP:11, SAN:55, LCK:60, DB:'+0', MOV:8,
  };
  const skills = d.skills || [
    { name:'도서관',   val:60 }, { name:'심리학', val:50 },
    { name:'법률',     val:40 }, { name:'설득',   val:35 },
    { name:'회피',     val:42 }, { name:'은닉',   val:30 },
    { name:'응급치료', val:45 }, { name:'추적',   val:25 },
  ];

  const statsHtml = Object.entries(stats).map(([name, val]) => `
    <div class="coc-stat">
      <div class="cs-name">${name}</div>
      <div class="cs-val">${val}</div>
      <div class="cs-sub">${Math.floor(val/2)} / ${Math.floor(val/5)}</div>
    </div>`).join('');

  const derivedHtml = Object.entries(derived).map(([lbl, val]) => `
    <div class="cd-item">
      <span class="cd-lbl">${lbl}</span>
      <span class="cd-val">${val}</span>
    </div>`).join('');

  const skillsHtml = skills.map(s => `
    <div class="coc-skill">
      <span class="csk-name">${s.name}</span>
      <span class="csk-bar"><span class="csk-fill" style="width:${s.val}%"></span></span>
      <span class="csk-val">${s.val}</span>
    </div>`).join('');

  return `
<div class="sheet-coc">
  <div class="sheet-note">※ 구글 시트 연동 후 자동으로 채워집니다 (현재 샘플)</div>

  <div class="sheet-block">
    <div class="sheet-ttl">능 력 치</div>
    <div class="coc-stats">${statsHtml}</div>
  </div>

  <div class="sheet-block">
    <div class="sheet-ttl">파 생 스 탯</div>
    <div class="coc-derived">${derivedHtml}</div>
  </div>

  <div class="sheet-block">
    <div class="sheet-ttl">기 술</div>
    <div class="coc-skills">${skillsHtml}</div>
  </div>
</div>`;
});
