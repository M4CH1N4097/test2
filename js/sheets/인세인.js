/* ════════════════════════════════════════════════
   인세인 시트 플러그인
   js/sheets/인세인.js
   스타일: css/sheets/인세인.css
   ────────────────────────────────────────────────
   pc.sheetData 구조:
   {
     stats:    { 무력, 기민, 집중, 감지, 기술, 매력 },
     fears:    string[],
     memories: string[],
     abils:    string[],
   }
════════════════════════════════════════════════ */
SheetRegistry.register('인세인', function (pc) {

  const d = pc.sheetData || {};

  const stats = d.stats || {
    무력:4, 기민:5, 집중:3,
    감지:4, 기술:6, 매력:5,
  };
  const fears    = d.fears    || ['어둠', '밀실', '죽음'];
  const memories = d.memories || [
    '소중한 사람을 잃은 기억',
    '이해할 수 없는 것을 목격한 날',
  ];
  const abils = d.abils || ['직감', '은신', '간파'];

  const statsHtml = Object.entries(stats).map(([name, val]) => `
    <div class="ins-stat">
      <div class="is-name">${name}</div>
      <div class="is-val">${val}</div>
    </div>`).join('');

  const fearsHtml    = fears.map(f => `<span class="ins-fear">${f}</span>`).join('');
  const abilsHtml    = abils.map(a => `<span class="ins-abil">${a}</span>`).join('');
  const memoriesHtml = memories.map(m => `
    <div class="ins-mem-item">
      <div class="ins-mem-label">기억</div>
      <div>${m}</div>
    </div>`).join('');

  return `
<div class="sheet-insane">
  <div class="sheet-note">※ 구글 시트 연동 후 자동으로 채워집니다 (현재 샘플)</div>

  <div class="sheet-block">
    <div class="sheet-ttl">능 력 치</div>
    <div class="ins-stats">${statsHtml}</div>
  </div>

  <div class="sheet-block">
    <div class="sheet-ttl">공 포</div>
    <div class="ins-list">${fearsHtml}</div>
  </div>

  <div class="sheet-block">
    <div class="sheet-ttl">기 억</div>
    ${memoriesHtml}
  </div>

  <div class="sheet-block">
    <div class="sheet-ttl">특 기</div>
    <div class="ins-list">${abilsHtml}</div>
  </div>
</div>`;
});
