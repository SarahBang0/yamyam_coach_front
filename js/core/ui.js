// 화면 공통 도우미 (docs/화면설계.md 3·4장 규칙)
// pages/*.js는 DOM을 다룰 때 이 함수들을 쓴다.
// HTML이 아직 덜 만들어졌어도 오류가 나지 않도록, 찾는 요소가 없으면 조용히 넘어간다.

import { getCurrentUser, logout } from './auth.js';
import { homeUrl } from './utils.js';

// querySelector 줄임말 (root가 없으면 null)
export function $(selector, root = document) {
  return root ? root.querySelector(selector) : null;
}

// 모든 화면 맨 처음에 호출: data-auth 보이기·숨기기, 헤더 이름, 로그아웃 버튼
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
    window.location.href = homeUrl();
  });
  return user;
}

// root 안의 [data-field="키"] 자리에 data[키] 값을 넣는다 (data에 없는 키는 건드리지 않음)
// - link: <a>의 href로 넣는다
// - grade: 글자와 함께 data-grade 속성도 넣는다 (CSS에서 등급별 색 지정용)
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
    el.textContent = value;
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
export function readForm(form) {
  return form ? Object.fromEntries(new FormData(form)) : {};
}

// { name: 값 } → 폼 입력칸에 채우기 (radio 묶음도 value로 선택됨)
export function fillForm(form, data) {
  if (!form) return;
  Object.entries(data).forEach(([name, value]) => {
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

// el 안의 .bar-fill 너비를 percent%로 (0~100으로 자름)
export function setBar(el, percent) {
  const fill = $('.bar-fill', el);
  if (fill) fill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
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
    window.location.href = url;
  });
}
