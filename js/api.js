/* ════════════════════════════════════════════════
   api.js — Apps Script 통신 유틸
   ────────────────────────────────────────────────
   doGet  → 공개 시트 데이터
   doPost → 캐릭터 비밀번호 검증
════════════════════════════════════════════════ */

/* ── 공개 데이터 fetch (doGet) ── */
async function fetchSheetValues(sheetName) {
  const { scriptUrl } = SHEET_CONFIG;
  if (!scriptUrl) throw new Error(
    'scriptUrl이 비어 있습니다.\njs/config.js 에 Apps Script 배포 URL을 입력하세요.'
  );

  const url = `${scriptUrl}?sheet=${encodeURIComponent(sheetName)}`;
  let res;
  try {
    res = await fetch(url);
  } catch (netErr) {
    throw new Error(
      `네트워크 오류: ${netErr.message}\n` +
      '· scriptUrl이 올바른지 확인하세요.\n' +
      '· 로컬(file://)에서는 CORS로 동작하지 않습니다. GitHub Pages에서 실행하세요.'
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      `응답이 JSON이 아닙니다 (${res.status}).\n` +
      '· Apps Script가 doGet 함수를 포함해 재배포됐는지 확인하세요.\n' +
      '· 배포 시 "액세스: 모든 사용자"로 설정했는지 확인하세요.'
    );
  }

  if (data.error) throw new Error(`"${sheetName}" 오류: ${data.error}`);
  return data.values || [];
}

/* ── 캐릭터 힌트 조회 (doPost) ── */
async function fetchCharHint(passwordId) {
  const { scriptUrl } = SHEET_CONFIG;
  try {
    const res  = await fetch(scriptUrl, {
      method: 'POST',
      body:   JSON.stringify({ action: 'getHint', passwordId }),
    });
    const data = await res.json();
    return data.hint || '';
  } catch {
    return '';
  }
}

/* ── 캐릭터 비밀번호 검증 (doPost) ── */
async function verifyCharPassword(passwordId, password) {
  const { scriptUrl } = SHEET_CONFIG;
  const res  = await fetch(scriptUrl, {
    method: 'POST',
    body:   JSON.stringify({ action: 'verifyPassword', passwordId, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '비밀번호가 틀렸습니다.');
}

/* ── 비밀번호 해제 상태 (sessionStorage) ──
   탭/창 닫으면 자동 초기화                    */
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
      if (!h || h.startsWith('!')) return;
      const key = h.trim();
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
