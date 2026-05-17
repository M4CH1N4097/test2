/* ════════════════════════════════════════════════
   CoC 7판 시트 플러그인
   js/sheets/CoC_7판.js  /  css/sheets/CoC_7판.css
   ────────────────────────────────────────────────
   pc.sheetData = TabGroup=4 레코드 배열
   DataType 24~28 참조 (js/config.js)
════════════════════════════════════════════════ */
SheetRegistry.register('CoC', function (pc) {
  const DT = DATATYPE;
  const g4 = pc.sheetData || [];
  const many = (dt) => g4.filter(r => r.DataType === String(dt));
  const num  = (s)  => parseInt(s) || 0;

  /* ── 24: 능력치 ── */
  const stats = many(DT.COC_STAT).slice(0, 8);
  const statsHtml = stats.map(r => `
    <div class="coc-stat">
      <div class="cs-name">${r.Data1}</div>
      <div class="cs-val">${r.Data2}</div>
      <div class="cs-sub">${Math.floor(num(r.Data2)/2)} / ${Math.floor(num(r.Data2)/5)}</div>
    </div>`).join('');

  /* ── 25: 부가 능력치 (단일 수치) ── */
  const bonuses    = many(DT.COC_BONUS);
  const bonusHtml  = bonuses.map(r => `
    <div class="cd-item">
      <span class="cd-lbl">${r.Data1}</span>
      <span class="cd-val">${r.Data2}</span>
    </div>`).join('');

  /* ── 26: 부가 능력치 (현재/최대 게이지) ── */
  const gauges    = many(DT.COC_GAUGE);
  const gaugeHtml = gauges.map(r => `
    <div class="cd-item" style="flex-direction:column;align-items:flex-start;gap:3px;">
      <span class="cd-lbl">${r.Data1}</span>
      <span class="cd-val">${r.Data2}<span style="font-size:12px;color:var(--text-dim);font-family:var(--sans)"> / ${r.Data3}</span></span>
    </div>`).join('');

  /* ── 27: 기능치 (스킬) ── */
  const skills    = many(DT.COC_SKILL);
  const skillHtml = skills.map(r => {
    const total = num(r.Data2) + num(r.Data3) + num(r.Data4);
    return `
    <div class="coc-skill">
      <span class="csk-name">${r.Data1}</span>
      <span class="csk-bar"><span class="csk-fill" style="width:${Math.min(total,99)}%"></span></span>
      <span class="csk-val">${total}</span>
      <span class="csk-breakdown">${r.Data2}+${r.Data3||0}+${r.Data4||0}</span>
    </div>`;
  }).join('');

  /* ── 28: 무기 ── */
  const weapons    = many(DT.COC_WEAPON);
  const weaponHtml = weapons.length ? `
    <table class="coc-weapon-table">
      <thead><tr><th>무기</th><th>기능</th><th>피해/사거리 등</th><th>설명</th></tr></thead>
      <tbody>
        ${weapons.map(r=>`
          <tr>
            <td>${r.Data1}</td>
            <td>${r.Data2||''}</td>
            <td style="font-size:11px;">${r.Data3||''}</td>
            <td style="font-size:11px;">${r.Data4||''}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : '';

  /* ── Universal 스킬 (DT 17, 공통) ── */
  const uSkills    = many(DT.SKILL);
  const uSkillHtml = uSkills.length ? `
    <div class="sheet-block">
      <div class="sheet-ttl">스 킬</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${uSkills.map(r=>`
          <div class="coc-uskill">
            ${r.Data4?`<img src="${r.Data4}" alt="" class="uskill-icon">`:''}
            <div>
              <div class="uskill-ruby">${r.Data2||''}</div>
              <div class="uskill-name">${r.Data1}</div>
              ${r.Data3?`<div class="uskill-desc">${r.Data3}</div>`:''}
            </div>
          </div>`).join('')}
      </div>
    </div>` : '';

  return `
<div class="sheet-coc">
  <div class="sheet-note">CoC 7판 캐릭터 시트</div>

  ${statsHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">능 력 치</div>
    <div class="coc-stats">${statsHtml}</div>
  </div>` : ''}

  ${(bonusHtml||gaugeHtml) ? `<div class="sheet-block">
    <div class="sheet-ttl">파 생 스 탯</div>
    <div class="coc-derived">${bonusHtml}${gaugeHtml}</div>
  </div>` : ''}

  ${skillHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">기 능 치</div>
    <div class="coc-skills">${skillHtml}</div>
  </div>` : ''}

  ${weaponHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">무 기</div>
    ${weaponHtml}
  </div>` : ''}

  ${uSkillHtml}

  ${!statsHtml&&!skillHtml ? '<div class="tab-ph">시트 데이터가 없습니다.</div>' : ''}
</div>`;
});
