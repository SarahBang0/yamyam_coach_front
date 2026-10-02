// 여러 곳에서 쓰는 작은 도우미 함수

// 오늘 날짜를 'YYYY-MM-DD'로 (내 컴퓨터 시간 기준)
export function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// 소수점 자리 맞추기: round(3.456, 1) → 3.5
export function round(n, digits = 1) {
  const p = 10 ** digits;
  return Math.round(Number(n) * p) / p;
}

// 화면에 보여줄 숫자: 천 단위 쉼표, 소수점은 한 자리까지 (1300 → '1,300', 16.53 → '16.5')
export function formatNumber(n) {
  return Number(n).toLocaleString('ko-KR', { maximumFractionDigits: 1 });
}

// 회원의 질환 목록 (배열). 예전 형식('고혈압' 같은 문자열, '없음')도 배열로 바꿔 준다
export function getDiseases(user) {
  const value = user?.diseaseInfo ?? [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter((d) => d && d !== '없음');
}

// 질환 목록 → 화면 글자 ('고혈압, 당뇨' / '없음')
export function formatDiseases(user) {
  const list = getDiseases(user);
  return list.length ? list.join(', ') : '없음';
}

// URL 쿼리 값 읽기: meal-detail.html?id=3 → getQueryParam('id') === '3'
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// 입력이 멈춘 뒤 ms만큼 지나야 실행 (음식 검색용)
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// 빈 값이 아닌 숫자인지 ('' 와 공백은 숫자가 아님)
export function isNumeric(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

// pages 폴더 안 화면의 주소: index.html(루트)에서는 'pages/'를 붙이고, pages 안에서는 그대로
// pageUrl('meal-detail.html?id=3')
export function pageUrl(file) {
  return isInPagesFolder() ? file : `pages/${file}`;
}

// 메인(index.html) 주소
export function homeUrl() {
  return isInPagesFolder() ? '../index.html' : 'index.html';
}

function isInPagesFolder() {
  return window.location.pathname.includes('/pages/');
}
