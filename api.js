/* ════════════════════════════════════════════════
   api.js
   읽기  : Google Sheets gviz API (빠름, API 키 불필요)
   검증  : Apps Script doPost (비밀번호 확인 전용)
════════════════════════════════════════════════ */

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

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`
            + `?tqx=out:json&headers=0&sheet=${encodeURIComponent(sheetName)}`;

  let text;
  try {
    const res = await fetch(url);
    text = await res.text();
  } catch (e) {
    throw new Error(`네트워크 오류 ("${sheetName}"): ${e.message}`);
  }

  /* ── gviz JSONP 파싱 ──────────────────────────
     형식: /*O_o*/ google.visualization.Query.setResponse({...});
     ⚠ JSON 내부에 ) 가 있을 수 있으므로 lastIndexOf 사용 */
  const PREFIX = 'google.visualization.Query.setResponse(';
  const start  = text.indexOf(PREFIX);
  if (start === -1) {
    throw new Error(
      `"${sheetName}" 데이터를 읽을 수 없습니다.\n` +
      '스프레드시트 공유 설정을 확인하세요:\n' +
      '파일 → 공유 → 웹에 게시  또는  링크가 있는 누구나 → 뷰어'
    );
  }

  let data;
  try {
    const jsonStr = text.slice(start + PREFIX.length, text.lastIndexOf(')'));
    data = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`"${sheetName}" JSON 파싱 실패: ${e.message}`);
  }

  if (data.status === 'error') {
    const msg = data.errors?.[0]?.detailed_message
             || data.errors?.[0]?.message
             || JSON.stringify(data.errors);
    throw new Error(`"${sheetName}": ${msg}`);
  }

  const table = data.table;
  if (!table) return [];

  /* ── 2D 배열 변환 ─────────────────────────────
     gviz 가 headers=0 을 무시하고 헤더를 자동감지하면
     (parsedNumHeaders > 0) table.rows 에서 해당 행이 빠지고
     컬럼명이 table.cols[i].label 로만 남는다.
     이 때 colLabels 를 첫 행으로 복원해서
     parseSheetRows 의 헤더 탐지가 정상 동작하게 함. */
  const dataRows = (table.rows || []).map(row =>
    (table.cols || []).map((_, i) => _cellStr(row?.c?.[i]))
  );

  if ((table.parsedNumHeaders || 0) > 0) {
    const colLabels = (table.cols || []).map(col => col.label || '');
    return [colLabels, ...dataRows];
  }

  return dataRows;
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

/* ── 파싱 유틸 ─────────────────────────────────
   headerKey: 이 값이 있는 행을 헤더로 자동 탐지 */
function parseSheetRows(rows, headerKey) {
  if (!rows || rows.length < 1) return [];

  let headerIdx = Math.min(1, rows.length - 1);
  if (headerKey) {
    const needle = headerKey.toLowerCase();
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if ((rows[i] || []).some(h => h?.toString().trim().toLowerCase() === needle)) {
        headerIdx = i;
        break;
      }
    }
  }

  const headers = rows[headerIdx] || [];
  const result  = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
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
