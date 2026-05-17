/* ════════════════════════════════════════════════
   인세인 시트 플러그인
   js/sheets/인세인.js  /  css/sheets/인세인.css
   ────────────────────────────────────────────────
   pc.sheetData = TabGroup=4 레코드 배열
   DataType 31~39 참조 (js/config.js)
════════════════════════════════════════════════ */
SheetRegistry.register('inSANe', function (pc) {
  const DT  = DATATYPE;
  const g4  = pc.sheetData || [];
  const one  = (dt) => g4.find(r => r.DataType === String(dt));
  const many = (dt) => g4.filter(r => r.DataType === String(dt));
  const esc  = s => (s||'').replace(/\n/g,'<br>');

  /* ── 31: 호기심 / 32: 공포심 ── */
  const curious = one(DT.INS_CURIOUS);
  const fear    = one(DT.INS_FEAR);

  /* ── 33: 생명력 / 34: 이성치 ── */
  const hp  = one(DT.INS_HP);
  const san = one(DT.INS_SAN);

  /* ── 35: 아이템 ── */
  const items    = many(DT.INS_ITEM);
  const itemHtml = items.map(r=>`
    <div class="prof-list-item">
      <span class="prof-item-name">${r.Data1}</span>
      ${r.Data2?`<span class="prof-item-desc">${esc(r.Data2)}</span>`:''}
    </div>`).join('');

  /* ── 36: 후유증 ── */
  const traumas    = many(DT.INS_TRAUMA);
  const traumaHtml = traumas.map(r=>`<span class="ins-abil">${r.Data1}</span>`).join('');

  /* ── 37: 특기 ── */
  const traits    = many(DT.INS_TRAIT);
  const traitHtml = traits.map(r=>`<span class="ins-abil">${r.Data1}</span>`).join('');

  /* ── 38: 어빌리티 ── */
  const abilities   = many(DT.INS_ABILITY);
  const abilityHtml = abilities.map(r=>`
    <div class="ins-ability-item">
      <div class="ins-ability-head">
        <span class="ins-ability-name">${r.Data1}</span>
        ${r.Data2?`<span class="ins-ability-type">${r.Data2}</span>`:''}
        ${r.Data3?`<span class="ins-ability-trait">[${r.Data3}]</span>`:''}
      </div>
      ${r.Data4?`<div class="ins-ability-desc">${esc(r.Data4)}</div>`:''}
    </div>`).join('');

  /* ── 39: 인물 ── */
  const persons    = many(DT.INS_PERSON);
  const personHtml = persons.map(r=>`
    <div class="ins-person-item">
      <div class="ins-person-head">
        <span class="ins-person-name">${r.Data1}</span>
        ${r.Data3?`<span class="ins-person-emo">${r.Data3}</span>`:''}
      </div>
      ${r.Data2?`<div style="font-size:11px;color:var(--text-dim);">${r.Data2}</div>`:''}
      ${r.Data4?`<div class="prof-item-desc">${esc(r.Data4)}</div>`:''}
    </div>`).join('');

  /* ── Universal 스킬 (DT 17) ── */
  const uSkills    = many(DT.SKILL);
  const uSkillHtml = uSkills.length ? `
    <div class="sheet-block">
      <div class="sheet-ttl">스 킬</div>
      <div class="ins-list">
        ${uSkills.map(r=>`<span class="ins-abil">${r.Data1}</span>`).join('')}
      </div>
    </div>` : '';

  const hasData = curious||fear||hp||san||items.length||traits.length||abilities.length;

  return `
<div class="sheet-insane">
  <div class="sheet-note">인세인 캐릭터 시트</div>

  ${(curious||fear||hp||san) ? `<div class="sheet-block">
    <div class="sheet-ttl">기 본 정 보</div>
    <div class="ins-stats">
      ${curious?`<div class="ins-stat"><div class="is-name">호기심</div><div class="is-val">${curious.Data1}</div></div>`:''}
      ${fear   ?`<div class="ins-stat"><div class="is-name">공포심</div><div class="is-val">${fear.Data1}</div></div>`:''}
      ${hp     ?`<div class="ins-stat"><div class="is-name">생명력</div><div class="is-val">${hp.Data1}</div></div>`:''}
      ${san    ?`<div class="ins-stat"><div class="is-name">이성치</div><div class="is-val">${san.Data1}</div></div>`:''}
    </div>
  </div>` : ''}

  ${traitHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">특 기</div>
    <div class="ins-list">${traitHtml}</div>
  </div>` : ''}

  ${abilityHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">어 빌 리 티</div>
    <div>${abilityHtml}</div>
  </div>` : ''}

  ${itemHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">아 이 템</div>
    <div>${itemHtml}</div>
  </div>` : ''}

  ${traumaHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">후 유 증</div>
    <div class="ins-list">${traumaHtml}</div>
  </div>` : ''}

  ${personHtml ? `<div class="sheet-block">
    <div class="sheet-ttl">인 물</div>
    <div>${personHtml}</div>
  </div>` : ''}

  ${uSkillHtml}

  ${!hasData ? '<div class="tab-ph">시트 데이터가 없습니다.</div>' : ''}
</div>`;
});
