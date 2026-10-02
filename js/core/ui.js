// 화면 공통 도우미 (docs/화면설계.md 3·4장 규칙)
// pages/*.js는 DOM을 다룰 때 이 함수들을 쓴다.
// HTML이 아직 덜 만들어졌어도 오류가 나지 않도록, 찾는 요소가 없으면 조용히 넘어간다.

import { getCurrentUser, logout } from './auth.js';
import { homeUrl, formatNumber } from './utils.js';

// querySelector 줄임말 (root가 없으면 null)
export function $(selector, root = document) {
  return root ? root.querySelector(selector) : null;
}

// 모든 화면 맨 처음에 호출: data-auth 보이기·숨기기, 헤더 이름, 로그아웃 버튼, 비밀번호 보기 버튼, 화면 전환
// 로그인한 회원(비밀번호 제외)이나 null을 돌려준다
export function initLayout() {
  const user = getCurrentUser();
  document.querySelectorAll('[data-auth]').forEach((el) => {
    const forMember = el.dataset.auth === 'member';
    el.hidden = forMember ? !user : Boolean(user);
    if (forMember && user) fillFields(el, { name: user.name });
  });

  $('#logout-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    logout();
    go(homeUrl());
  });
  setupPasswordToggles();
  clearErrorOnInput();
  setupExclusiveCheckboxes();
  setupPageTransitions();
  return user;
}

// 다른 화면으로 이동 (지금 화면 내용을 살짝 사라지게 한 뒤 이동, 새 화면은 CSS로 떠오른다)
export function go(url) {
  if (prefersReducedMotion()) {
    window.location.href = url;
    return;
  }
  document.documentElement.classList.add('is-leaving');
  setTimeout(() => {
    window.location.href = url;
  }, 200);
}

// 같은 사이트 안의 링크는 go()로 이동해서 화면이 부드럽게 이어지게 한다
// (다른 스크립트가 이미 막은 클릭, 새 탭 열기, '#' 링크는 건드리지 않음)
function setupPageTransitions() {
  // 뒤로 가기로 돌아왔을 때 사라진 상태로 남지 않게
  window.addEventListener('pageshow', () => document.documentElement.classList.remove('is-leaving'));

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    if (link.getAttribute('href').startsWith('#')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    go(url.href);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 체크박스 묶음에서 data-exclusive가 붙은 칸('없음')은 다른 칸과 함께 고를 수 없다
// 다른 칸을 모두 풀면 '없음'이 다시 선택된다
function setupExclusiveCheckboxes() {
  document.addEventListener('change', (event) => {
    const box = event.target;
    if (box.type !== 'checkbox' || !box.name || !box.form) return;
    const group = [...box.form.querySelectorAll(`input[type="checkbox"][name="${box.name}"]`)];
    const exclusive = group.find((b) => 'exclusive' in b.dataset);
    if (!exclusive) return;

    if (box === exclusive && box.checked) {
      group.forEach((b) => { if (b !== exclusive) b.checked = false; });
    } else if (box !== exclusive && box.checked) {
      exclusive.checked = false;
    } else if (!group.some((b) => b.checked)) {
      exclusive.checked = true;
    }
  });
}

// 입력칸에 다시 입력하면 그 칸의 오류 문구를 지운다
function clearErrorOnInput() {
  document.addEventListener('input', (event) => {
    const { name, form } = event.target;
    if (name && form) setMessage(form, name, '');
  });
}

// [data-action="toggle-password"] 버튼: 같은 묶음(부모 요소) 안의 입력칸을 글자로 보였다 숨겼다 한다
// 보이는 동안 버튼에 class="is-visible"이 붙는다 (눈 아이콘 모양 바꾸기용)
function setupPasswordToggles() {
  document.querySelectorAll('[data-action="toggle-password"]').forEach((button) => {
    const input = button.parentElement?.querySelector('input');
    if (!input) return;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.classList.toggle('is-visible', show);
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? '비밀번호 숨기기' : '비밀번호 보기');
    });
  });
}

// root 안의 [data-field="키"] 자리에 data[키] 값을 넣는다 (data에 없는 키는 건드리지 않음)
// - link: <a>의 href로 넣는다
// - grade: 글자와 함께 data-grade 속성도 넣는다 (CSS에서 등급별 색 지정용)
// - 숫자는 천 단위 쉼표를 넣어 보여준다 (1300 → 1,300)
export function fillFields(root, data) {
  if (!root) return;
  const fields = [...root.querySelectorAll('[data-field]')];
  if (root.matches?.('[data-field]')) fields.unshift(root);

  fields.forEach((el) => {
    const key = el.dataset.field;
    if (!(key in data)) return;
    const value = data[key] ?? '';
    if (key === 'link') {
      el.href = value;
      return;
    }
    el.textContent = typeof value === 'number' ? formatNumber(value) : value;
    if (key === 'grade') el.dataset.grade = value;
  });
}

// <template>을 복사해 items 개수만큼 container에 넣는다 (container 안의 기존 내용은 지움)
// options.empty: 목록이 비었을 때만 보일 요소
// options.toFields(item): data-field에 넣을 값 (없으면 item 그대로)
// options.onRow(row, item, index): 줄마다 버튼 연결 등 추가 작업
export function renderList(container, template, items, options = {}) {
  const { empty, toFields = (item) => item, onRow } = options;
  if (empty) empty.hidden = items.length > 0;
  if (!container || !template) return;

  container.replaceChildren();
  items.forEach((item, index) => {
    const row = template.content.firstElementChild.cloneNode(true);
    fillFields(row, toFields(item));
    onRow?.(row, item, index);
    container.append(row);
  });
}

// 폼 입력값 → { name: 값 } (값은 모두 문자열, 선택 안 한 radio는 빠짐)
// 체크박스 묶음은 고른 값의 배열 (하나도 안 골랐으면 빈 배열)
export function readForm(form) {
  if (!form) return {};
  const data = {};
  const checkboxNames = new Set([...form.querySelectorAll('input[type="checkbox"][name]')].map((b) => b.name));
  checkboxNames.forEach((name) => { data[name] = []; });
  for (const [name, value] of new FormData(form)) {
    if (checkboxNames.has(name)) data[name].push(value);
    else data[name] = value;
  }
  return data;
}

// { name: 값 } → 폼 입력칸에 채우기 (radio 묶음도 value로 선택됨)
// 값이 배열이면 체크박스 묶음에서 그 값들을 선택한다 (빈 배열이면 data-exclusive 칸('없음')을 선택)
export function fillForm(form, data) {
  if (!form) return;
  Object.entries(data).forEach(([name, value]) => {
    if (Array.isArray(value)) {
      form.querySelectorAll(`input[type="checkbox"][name="${name}"]`).forEach((box) => {
        box.checked = value.length ? value.includes(box.value) : 'exclusive' in box.dataset;
      });
      return;
    }
    const field = form.elements.namedItem(name);
    if (field) field.value = value ?? '';
  });
}

// [data-error="키"] 자리에 글자를 넣는다. ok가 true면 class="ok"를 붙인다 (성공 안내용)
// 자리가 있으면 true
export function setMessage(root, key, text, ok = false) {
  const el = $(`[data-error="${key}"]`, root);
  if (!el) return false;
  el.textContent = text;
  el.classList.toggle('ok', ok && text !== '');
  return true;
}

export function clearErrors(root) {
  root?.querySelectorAll('[data-error]').forEach((el) => {
    el.textContent = '';
    el.classList.remove('ok');
  });
}

// 오류를 화면에 표시한다. 오류가 하나라도 있으면 true
// - errors의 각 메시지는 [data-error="필드명"] 자리에
// - message와, 자리를 못 찾은 메시지는 [data-error="form"] 자리에 (그 자리도 없으면 alert)
export function showErrors(root, errors = {}, message = '') {
  clearErrors(root);
  const leftover = [];
  Object.entries(errors).forEach(([key, text]) => {
    if (!setMessage(root, key, text)) leftover.push(text);
  });

  const formText = [message, ...leftover].filter(Boolean).join(' ');
  if (formText && !setMessage(root, 'form', formText)) alert(formText);
  return Object.keys(errors).length > 0 || Boolean(message);
}

// 서비스 결과 { ok, errors, message }를 받아 표시. 실패면 true
// 사용: if (showResult(form, result)) return;
export function showResult(root, result) {
  return showErrors(root, result.errors, result.message);
}

// 진행 정도 표시 (0~100으로 자름)
// - el 안의 .bar-fill 너비를 percent%로 바꾼다 (막대 모양)
// - el에 CSS 변수 --percent도 넣는다 (원호·원형 등 다른 모양은 CSS에서 이 값으로 그린다)
export function setBar(el, percent) {
  if (!el) return;
  const value = Math.min(100, Math.max(0, percent));
  el.style.setProperty('--percent', value);
  const fill = $('.bar-fill', el);
  if (fill) fill.style.width = `${value}%`;
}

// 버튼이나 링크를 누르면 url로 이동 (<a>면 href를 넣고, <button>이면 클릭할 때 이동)
export function setLink(el, url) {
  if (!el) return;
  if (el.tagName === 'A') {
    el.href = url;
    return;
  }
  el.addEventListener('click', (event) => {
    event.preventDefault();
    go(url);
  });
}
