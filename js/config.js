/* ════════════════════════════════════════════════
   config.js — 설정 파일
   scriptUrl: Apps Script 배포 URL 입력
════════════════════════════════════════════════ */
const SHEET_CONFIG = {
  sheetId:   '10QdVQYawcoEO6Z5UkERpxnMBxmAs5vN58Cw_QJkZa6o', // 시트 ID
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzKGb2eAnErizRM8_kmNmjWugNC68-cF-accltcmOWpaVSSv4XRLHUQXLXCjDzl77uOOw/exec',  // ← Apps Script 배포 URL (비밀번호 검증 전용)
};

/* DataType ID → 이름 매핑
   사용법: DATATYPE[r.DataType]  → 'FULLBODY' 등 */
const DATATYPE = {
  /* TabGroup=1 */
  1:  'NAME',        // 캐릭터 이름
  2:  'ALIAS',       // 이명
  3:  'CATCHPHRASE', // 캐치프레이즈
  4:  'QUOTE',       // 한마디
  5:  'BGM',         // BGM
  6:  'AFF',         // 소속
  7:  'INFO',        // 인적사항
  /* TabGroup=2 */
  8:  'THUMBNAIL',   // 썸네일
  9:  'FULLBODY',    // 전신 이미지
  10: 'SD',          // SD 이미지
  11: 'STANDING',    // 스탠딩 이미지
  12: 'BG',          // 배경 이미지
  13: 'EXTRA_IMG',   // 추가 이미지
  /* TabGroup=3 Universal */
  14: 'SECTION',     // 제목 단락
  15: 'SUBSECTION',  // 서브 제목 단락
  16: 'CONTENT',     // 내용 단락
  /* TabGroup=4 Universal */
  17: 'SKILL',       // 스킬
  /* TabGroup=3 CoC */
  18: 'COC_PHOBIA',  // 공포증·집착증
  19: 'COC_MYTH',    // 신화서·주문·유물
  20: 'COC_ENTITY',  // 기이한 존재
  21: 'COC_EQUIP',   // 장비·소지품
  22: 'COC_FINANCE', // 현금·자산
  23: 'COC_ALLY',    // 동료 탐사자
  /* TabGroup=4 CoC */
  24: 'COC_STAT',    // 능력치
  25: 'COC_BONUS',   // 부가 능력치
  26: 'COC_GAUGE',   // 부가 능력치 최소/최대
  27: 'COC_SKILL',   // 기능치
  28: 'COC_WEAPON',  // 무기
  /* TabGroup=3 인세인 */
  29: 'INS_MISSION', // 공개 사명
  30: 'INS_SECRET',  // 비밀 사명
  /* TabGroup=4 인세인 */
  31: 'INS_CURIOUS', // 호기심
  32: 'INS_FEAR',    // 공포심
  33: 'INS_HP',      // 생명력
  34: 'INS_SAN',     // 이성치
  35: 'INS_ITEM',    // 아이템
  36: 'INS_TRAUMA',  // 후유증
  37: 'INS_TRAIT',   // 특기
  38: 'INS_ABILITY', // 어빌리티
  39: 'INS_PERSON',  // 인물
};
