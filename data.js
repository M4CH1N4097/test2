/* ════════════════════════════════════════════════
   data.js — 앱 데이터 모델 & 로딩
════════════════════════════════════════════════ */

const AppData = {
  ready:      false,
  user:       {},      // Setting → UserData* 파싱 결과
  rules:      [],      // Setting → TabName/RuleName/Onoff 목록
  pcs:        [],      // FullIndex 파싱 결과
  ruleCache:  {},      // 룰 탭 캐시 { tabName: [records] }
  logCache:   null,    // Log 탭 캐시
  bioHtml:    null,    // ShortIntroduce 서식 HTML (비동기 로드)
};

/* ────────────────────────────────────────────────
   초기 로드: Setting + FullIndex
──────────────────────────────────────────────── */
async function loadAppData() {
  const [settingRows, indexRows] = await Promise.all([
    fetchSheetValues('Setting'),
    fetchSheetValues('FullIndex'),
  ]);
  _parseSetting(settingRows);
  _parseFullIndex(indexRows);
  AppData.ready = true;

  /* 서식 있는 소개글 비동기 로드 (scriptUrl 있을 때만) */
  if (SHEET_CONFIG.scriptUrl) {
    _loadBioHtml().catch(() => {});
  }
}

async function _loadBioHtml() {
  const res  = await fetch(SHEET_CONFIG.scriptUrl, {
    method: 'POST',
    body:   JSON.stringify({ action: 'getRichText', fieldName: 'ShortIntroduce' }),
  });
  const data = await res.json();
  if (!data.html) return;
  AppData.bioHtml = data.html;
  /* 이미 렌더링된 경우 즉시 업데이트 */
  const el = document.querySelector('.bio');
  if (el) el.innerHTML = data.html;
}

/* ────────────────────────────────────────────────
   Setting 탭 파싱
──────────────────────────────────────────────── */
function _parseSetting(rows) {
  /* 'UserDataName' 셀이 있는 행을 헤더로 자동 탐지 */
  const records = parseSheetRows(rows, 'UserDataName');

  const user  = {};
  const rules = [];

  records.forEach(r => {
    if (r.UserDataName) {
      user[r.UserDataName] = {
        /* 제목이 있으면 UserDataTitle, 없으면 UserDataName 그대로 사용 */
        title: r.UserDataTitle || r.UserDataName,
        value: r.UserData      || '',
      };
    }
    if (r.TabName) {
      rules.push({
        tabName:  r.TabName,
        ruleName: r.RuleName || r.TabName,
        onoff:    r.Onoff?.toUpperCase() === 'TRUE',
      });
    }
  });

  AppData.user  = user;
  AppData.rules = rules;

  if (!Object.keys(user).length) {
    console.warn('[티피덱] Setting 탭에서 UserData를 찾지 못했습니다. 컬럼명을 확인하세요.',
      { firstRow: rows[0], secondRow: rows[1] });
  }
}

/* ────────────────────────────────────────────────
   FullIndex 탭 파싱
──────────────────────────────────────────────── */
function _parseFullIndex(rows) {
  /* 'CharaId' 셀이 있는 행을 헤더로 자동 탐지 */
  const records = parseSheetRows(rows, 'CharaId');

  AppData.pcs = records
    .filter(r => r.ID && r.ID !== '0' && r.Hide?.toUpperCase() !== 'TRUE')
    .map(r => {
      const ruleObj = AppData.rules.find(ru => ru.tabName === r.Rule);
      return {
        id:          r.ID,
        rule:        r.Rule       || '',
        ruleName:    ruleObj?.ruleName || r.Rule || '',
        thumbnail:   r.Thumbnail  || null,
        icons:       [r.Icon1, r.Icon2, r.Icon3].filter(Boolean),
        name:        r.CharaName  || '',
        ruby:        r.Ruby       || '',
        aff:         r.Data6      || '',
        favorit:     r.Favorit?.toUpperCase() === 'TRUE',
        sheetId:     r.SheetId    || '',
        charaId:     r.CharaId    || '',
        passwordId:  parseInt(r.PasswordId) || 0,
        // 이미지 보유 여부 (룰 탭 로드 후 채워짐)
        hasFullbody: null,
        hasSd:       null,
        hasStanding: null,
        // 상세 데이터 (클릭 시 lazy 로드)
        detail:      null,
      };
    });
}

/* ────────────────────────────────────────────────
   캐릭터 상세 데이터 (lazy)
──────────────────────────────────────────────── */
async function loadCharaDetail(pc) {
  if (pc.detail) return pc.detail;

  // 룰 탭 캐시
  if (!AppData.ruleCache[pc.rule]) {
    const rows = await fetchSheetValues(pc.rule);
    /* 'TabGroup' 셀이 있는 행을 헤더로 자동 탐지 */
    AppData.ruleCache[pc.rule] = parseSheetRows(rows, 'TabGroup');
  }

  const allRecords = AppData.ruleCache[pc.rule];

  // SheetId + CharaId 로 그룹 필터
  const group = allRecords.filter(
    r => r.SheetId === pc.sheetId && r.CharaId === pc.charaId
  );

  const g1 = group.filter(r => r.TabGroup === '1');
  const g2 = group.filter(r => r.TabGroup === '2');
  const g3 = group.filter(r => r.TabGroup === '3');
  const g4 = group.filter(r => r.TabGroup === '4');

  // 이미지 플래그 업데이트
  pc.hasFullbody = g2.some(r => DATATYPE[r.DataType] === 'FULLBODY');
  pc.hasSd       = g2.some(r => DATATYPE[r.DataType] === 'SD');
  pc.hasStanding = g2.some(r => DATATYPE[r.DataType] === 'STANDING');

  pc.detail = { g1, g2, g3, g4 };
  return pc.detail;
}

/* ────────────────────────────────────────────────
   Log 탭 (lazy)
──────────────────────────────────────────────── */
async function loadLogs(rule, charaId) {
  if (!AppData.logCache) {
    const rows = await fetchSheetValues('Log');
    AppData.logCache = parseSheetRows(rows, 'Rule');
  }
  return AppData.logCache.filter(
    r => r.Rule === rule && r.CharaId === charaId
  );
}

/* ────────────────────────────────────────────────
   헬퍼: TabGroup=1 → 히어로 섹션 필드 추출
   DataType 매핑: js/config.js 의 DATATYPE 객체 참조
──────────────────────────────────────────────── */
function extractHero(g1) {
  /* DATATYPE[r.DataType] → 이름 문자열로 비교 */
  const one = (name) => g1.find(r => DATATYPE[r.DataType] === name);

  const nameRow  = one('NAME');
  const aliasRow = one('ALIAS');
  const catchRow = one('CATCHPHRASE');
  const quoteRow = one('QUOTE');
  const bgmRow   = one('BGM');
  const affRow   = one('AFF');
  const infoRow  = one('INFO');

  /* 인적사항: "나이 / 성별 / 키" 형태 → 배열로 분리 */
  const infoBadges = infoRow?.Data1
    ? infoRow.Data1.split('/').map(s => s.trim()).filter(Boolean)
    : [];

  /* 한마디: 셀 내 줄바꿈 → 배열로 분리 (최대 3줄 표시) */
  const quoteLines = quoteRow?.Data1
    ? quoteRow.Data1.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    name:        nameRow?.Data1   || null,
    nameRuby:    nameRow?.Data2   || null,
    alias:       aliasRow?.Data1  || null,
    aliasRuby:   aliasRow?.Data2  || null,
    catchphrase: catchRow?.Data1  || null,
    quoteLines,
    infoBadges,
    aff:         affRow?.Data1    || null,
    bgm: bgmRow?.Data1 ? {
      src:      bgmRow.Data1,
      title:    bgmRow.Data2 || '',
      composer: bgmRow.Data3 || '',
    } : null,
  };
}

/* ────────────────────────────────────────────────
   헬퍼: TabGroup=2 → 이미지 추출
──────────────────────────────────────────────── */
function extractImages(g2) {
  const one  = (name) => g2.find(r  => DATATYPE[r.DataType] === name)?.Data1 || null;
  const many = (name) => g2.filter(r => DATATYPE[r.DataType] === name && r.Data1)
                           .map(r => ({ url: r.Data1, name: r.Data2 || '', credit: r.Data3 || '' }));

  /* 포트레이트 슬롯 = 스탠딩 이미지 우선, 없으면 추가 이미지 */
  const standings = many('STANDING');
  const extras    = many('EXTRA_IMG');
  const portraits = standings.length ? standings.map(s => s.url) : extras.map(e => e.url);

  return {
    thumbnail: one('THUMBNAIL'),
    fullbody:  one('FULLBODY'),
    imgSd:     one('SD'),
    bg:        one('BG'),
    standings,
    extras,
    portraits,
  };
}

/* ────────────────────────────────────────────────
   헬퍼: AppData.user → owner 뷰모델
   Setting 탭 UserData* 컬럼 기반
──────────────────────────────────────────────── */
function buildOwner() {
  const u   = AppData.user;
  const get = (k) => u[k]?.value || '';
  const ttl = (k) => u[k]?.title || k;

  return {
    nick:   get('Nickname'),
    avatar: get('ProfileImage') || null,
    /* MainRule: "룰A, 룰B" → 쉼표 분리 */
    tags:   get('MainRule').split(',').map(s => s.trim()).filter(Boolean),
    bio:    get('ShortIntroduce'),
    links: [
      /* UserDataTitle 값을 링크 표시명으로 사용 */
      { label: ttl('Introduce'), url: get('Introduce') },
      { label: ttl('Schedule'),  url: get('Schedule')  },
    ].filter(l => l.url),
    sns: ['SNS 1','SNS 2','SNS 3','SNS 4']
      .map(k => ({ label: ttl(k), url: get(k) }))
      .filter(l => l.url),
    bgm: get('BGM') ? {
      src:      get('BGM'),
      ytId:     extractYtId(get('BGM')),
      /* UserDataTitle: "곡명, 작곡가" 형식 */
      title:    (ttl('BGM') || '').split(',')[0]?.trim() || '',
      composer: (ttl('BGM') || '').split(',')[1]?.trim() || '',
    } : null,
  };
}
