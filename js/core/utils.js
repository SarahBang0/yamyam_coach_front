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
