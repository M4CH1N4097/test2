/* ════════════════════════════════════════════════
   api.js
   ────────────────────────────────────────────────
   읽기  : Google Sheets gviz API (빠름, API 키 불필요)
           시트를 "링크가 있는 사용자 → 뷰어"로 설정 필요
   검증  : Apps Script doPost (비밀번호 확인 전용)
════════════════════════════════════════════════ */

/* ── gviz 셀 값 → 문자열 변환 ── */
function _cellStr(cell) {
  if (!cell || cell.v === null || cell.v === undefined) return '';
  const v = cell.v;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number')  return Number.isInteger(v) ? String(v) : v.toString();
  return v.toString();
}

/* ── 시트 데이터 직접 fetch (gviz) ── */
async function fetchSheetValues(sheetName) {
  const { sheetId } = SHEET_CONFIG;
  if (!sheetId) throw new Error('sheetId가 설정되지 않았습니다. js/config.js를 확인하세요.');

  /* headers=0 → 모든 행을 데이터로 반환 (row1=설명, row2=컬럼명, row3~=데이터) */
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`
            + `?tqx=out:json&headers=0&sheet=${encodeURIComponent(sheetName)}`;

  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new Error(
      `네트워크 오류: ${e.message}\n시트가 "링크가 있는 사용자 뷰어"로 공유됐는지 확인하세요.`
    );
  }

  const text = await res.text();

  /* JSONP 래퍼 제거: /*O_o*/ google.visualization.Query.setResponse({...}); */
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?\s*$/);
  if (!match) throw new Error(`"${sheetName}" 응답 파싱 실패 (시트 공유 설정을 확인하세요)`);

  let data;
  try { data = JSON.parse(match[1]); }
  catch { throw new Error(`"${sheetName}" JSON 파싱 실패`); }

  if (data.status === 'error') {
    const msg = data.errors?.[0]?.detailed_message || data.errors?.[0]?.message || '알 수 없는 오류';
    throw new Error(`"${sheetName}": ${msg}`);
  }

  const table = data.table;
  if (!table?.rows) return [];

  /* 2D 배열로 변환 (parseSheetRows 호환 형식) */
  return table.rows.map(row =>
    (table.cols || []).map((_, i) => _cellStr(row.c?.[i]))
  );
}

/* ── 캐릭터 비밀번호 검증 (Apps Script doPost) ── */
async function verifyCharPassword(passwordId, password) {
  const { scriptUrl } = SHEET_CONFIG;
  if (!scriptUrl) throw new Error('scriptUrl이 설정되지 않았습니다.');

  const res  = await fetch(scriptUrl, {
    method: 'POST',
    body:   JSON.stringify({ action: 'verifyPassword', passwordId, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '비밀번호가 틀렸습니다.');
}

/* ── 캐릭터 힌트 조회 (Apps Script doPost) ── */
async function fetchCharHint(passwordId) {
  const { scriptUrl } = SHEET_CONFIG;
  if (!scriptUrl) return '';
  try {
    const res  = await fetch(scriptUrl, {
      method: 'POST',
      body:   JSON.stringify({ action: 'getHint', passwordId }),
    });
    const data = await res.json();
    return data.hint || '';
  } catch { return ''; }
}

/* ── 비밀번호 해제 상태 (sessionStorage) ── */
function isPasswordUnlocked(passwordId) {
  if (!passwordId || parseInt(passwordId) < 1) return true;
  return sessionStorage.getItem(`pw_${passwordId}`) === 'ok';
}
function unlockPassword(passwordId) {
  sessionStorage.setItem(`pw_${passwordId}`, 'ok');
}

/* ── 파싱 유틸 ── */
function parseSheetRows(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[1] || [];
  const result  = [];
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i] || [];
    const obj = {};
    let hasData = false;
    headers.forEach((h, j) => {
      if (!h || h.toString().startsWith('!')) return;
      const key = h.toString().trim();
      const val = (row[j] || '').toString().trim();
      obj[key] = val;
      if (val) hasData = true;
    });
    if (hasData) result.push(obj);
  }
  return result;
}

function extractYtId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]{11})/);
  return m ? m[1] : null;
}
