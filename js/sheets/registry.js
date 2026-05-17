/* ════════════════════════════════════════════════
   SheetRegistry — 룰별 시트 플러그인 시스템
   ────────────────────────────────────────────────
   새 룰 추가 방법
   1. js/sheets/룰이름.js  생성 → SheetRegistry.register() 호출
   2. css/sheets/룰이름.css 생성 (선택 — 자동으로 로드됨)
   3. 끝 — 기존 파일 수정 불필요

   파일명 규칙: pc.roll 의 공백 → _
     "CoC 7판"  →  CoC_7판.js / CoC_7판.css
     "인세인"   →  인세인.js  / 인세인.css
════════════════════════════════════════════════ */
(function () {
  'use strict';

  const _sheets  = {};
  const _loading = {};

  function toFilename(rollName) {
    return rollName.replace(/\s+/g, '_');
  }

  window.SheetRegistry = {

    /**
     * 시트 렌더러 등록
     * @param {string}   rollName  pc.roll 과 정확히 일치하는 룰 이름
     * @param {function} renderFn  (pc) => HTML 문자열
     */
    register(rollName, renderFn) {
      _sheets[rollName] = renderFn;
    },

    /** 렌더링 (미로드면 null 반환) */
    render(rollName, pc) {
      return _sheets[rollName] ? _sheets[rollName](pc) : null;
    },

    /**
     * 시트 파일 동적 로드
     * - css/sheets/{filename}.css  (없으면 조용히 무시)
     * - js/sheets/{filename}.js
     */
    load(rollName, callback) {
      if (_sheets[rollName])  { callback(true); return; }
      if (_loading[rollName]) { return; }
      _loading[rollName] = true;

      const filename = toFilename(rollName);

      /* CSS 자동 로드 (실패해도 무시) */
      const cssId = 'sheet-css-' + filename;
      if (!document.getElementById(cssId)) {
        const link  = document.createElement('link');
        link.id     = cssId;
        link.rel    = 'stylesheet';
        link.href   = 'css/sheets/' + filename + '.css';
        document.head.appendChild(link);
      }

      /* JS 로드 */
      const script  = document.createElement('script');
      script.src    = 'js/sheets/' + filename + '.js';
      script.onload = () => callback(true);
      script.onerror = () => {
        delete _loading[rollName];
        callback(false);
      };
      document.head.appendChild(script);
    },

    filename: toFilename,
  };
})();
