/* ════════════════════════════════════════════════
   config.js — 설정 파일
   ────────────────────────────────────────────────
   scriptUrl:
     스프레드시트 → 확장 프로그램 → Apps Script
     → 배포 → 새 배포 → 웹 앱 배포 후 받은 URL
     (API 키 불필요 / 시트 비공개 유지 가능)
════════════════════════════════════════════════ */
const SHEET_CONFIG = {
  scriptUrl: '',  // ← Apps Script 배포 URL 입력
  //   예시: 'https://script.google.com/macros/s/AKfy.../exec'
};

/* ────────────────────────────────────────────────
   DATATYPE 번호 → 의미 매핑 (!참고용 탭 기준)
   값1 = 필수 / 값2~4 = 공란이면 미표기
──────────────────────────────────────────────── */
const DATATYPE = {
  /* ── TabGroup=1  텍스트·BGM ── */
  NAME:        1,  // Data1=이름, Data2=루비
  ALIAS:       2,  // Data1=이명(코드네임 등), Data2=이명루비
  CATCHPHRASE: 3,  // Data1=캐치프레이즈
  QUOTE:       4,  // Data1=한마디 (줄바꿈 포함 가능)
  BGM:         5,  // Data1=YouTube URL, Data2=명칭, Data3=출처
  AFF:         6,  // Data1=소속
  INFO:        7,  // Data1=인적사항 (" / " 구분 텍스트)

  /* ── TabGroup=2  이미지 ── */
  THUMBNAIL:   8,  // Data1=URL, Data2=출처
  FULLBODY:    9,  // Data1=URL, Data2=출처, Data3=그림자색, Data4=그림자불투명도
  SD:          10, // Data1=URL, Data2=출처
  STANDING:    11, // Data1=URL, Data2=명칭, Data3=출처  (복수 가능)
  BG:          12, // Data1=URL
  EXTRA_IMG:   13, // Data1=URL, Data2=명칭, Data3=출처  (복수 가능)

  /* ── TabGroup=3  프로필 (Universal) ── */
  SECTION:     14, // Data1=대분류 제목
  SUBSECTION:  15, // Data1=소분류 제목
  CONTENT:     16, // Data1=내용 (줄바꿈 반영)

  /* ── TabGroup=4  시트 (Universal) ── */
  SKILL:       17, // Data1=명칭, Data2=루비, Data3=설명, Data4=아이콘URL (복수)

  /* ── TabGroup=3  CoC 전용 ── */
  COC_PHOBIA:  18, // Data1=공포증/집착증 설명
  COC_MYTH:    19, // Data1=명칭, Data2=설명  (복수)
  COC_ENTITY:  20, // Data1=명칭, Data2=설명  (복수)
  COC_EQUIP:   21, // Data1=명칭, Data2=설명  (복수)
  COC_FINANCE: 22, // Data1=소비수준, Data2=현금, Data3=자산
  COC_ALLY:    23, // Data1=캐릭터이름, Data2=플레이어닉네임, Data3=링크, Data4=썸네일 (복수)

  /* ── TabGroup=4  CoC 시트 ── */
  COC_STAT:    24, // Data1=명칭, Data2=수치  (최대 8행)
  COC_BONUS:   25, // Data1=명칭, Data2=수치  (복수)
  COC_GAUGE:   26, // Data1=명칭, Data2=현재, Data3=최대 (복수)
  COC_SKILL:   27, // Data1=명칭, Data2=기본치, Data3=투자치, Data4=성장치 (복수)
  COC_WEAPON:  28, // Data1=명칭, Data2=사용기능, Data3=피해/사거리 등, Data4=설명 (복수)

  /* ── TabGroup=3  인세인 전용 ── */
  INS_MISSION: 29, // Data1=공개사명
  INS_SECRET:  30, // Data1=비밀사명, Data2=쇼크 (복수)

  /* ── TabGroup=4  인세인 시트 ── */
  INS_CURIOUS: 31, // Data1=호기심 명칭
  INS_FEAR:    32, // Data1=공포심 명칭
  INS_HP:      33, // Data1=생명력 명칭
  INS_SAN:     34, // Data1=이성치 명칭
  INS_ITEM:    35, // Data1=명칭, Data2=설명 (복수)
  INS_TRAUMA:  36, // Data1=명칭 (복수)
  INS_TRAIT:   37, // Data1=명칭 (복수)
  INS_ABILITY: 38, // Data1=명칭, Data2=타입, Data3=지정특기, Data4=설명 (복수)
  INS_PERSON:  39, // Data1=이름, Data2=거처/비밀, Data3=감정, Data4=설명 (복수)
};
