// YamYam 달력 (브라우저 기본 달력 대신)
//
// HTML 약속:
//   <div class="datepicker" data-datepicker>
//     <input type="hidden" name="date">            ← 실제 값 'YYYY-MM-DD' (폼이 읽는 값)
//     <button type="button" class="datepicker__trigger">
//       <span data-datepicker-label></span>        ← '10월 2일 (목)' 이 들어감
//     </button>
//   </div>
// - 미래 날짜는 고를 수 없다 (식단은 오늘까지만 기록)
// - 날짜를 고르면 숨은 input의 값을 바꾸고 'change' 이벤트를 보낸다 → 폼의 change 처리가 그대로 동작
// - 기록이 있는 날에 점을 찍으려면: picker.markedDates = new Set(['2026-10-01', …])
// - 값을 코드로 바꿨을 때는 setDateValue(picker, '2026-10-01')

import { today } from './utils.js';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function setupDatePickers(root = document) {
  root.querySelectorAll('[data-datepicker]').forEach(setupDatePicker);
}

// 값 바꾸기 + 글자 갱신 + change 이벤트
export function setDateValue(picker, value) {
  const input = picker.querySelector('input');
  input.value = value;
  updateLabel(picker);
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// '2026-10-02' → '10월 2일 (목)'
export function formatDateLabel(value) {
  if (!value) return '날짜 선택';
  const date = toDate(value);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

function setupDatePicker(picker) {
  if (picker.dataset.ready) return;
  picker.dataset.ready = 'true';
  const input = picker.querySelector('input');
  const trigger = picker.querySelector('.datepicker__trigger');

  const panel = document.createElement('div');
  panel.className = 'datepicker__panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', '날짜 선택');
  picker.append(panel);

  let viewMonth = null; // 달력에 보이는 달의 1일

  const open = () => {
    viewMonth = firstOfMonth(toDate(input.value || today()));
    render();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  function render() {
    const max = today();
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const isLatestMonth = toValue(viewMonth) >= toValue(firstOfMonth(toDate(max)));
    const marked = picker.markedDates ?? new Set();

    const days = [];
    for (let i = 0; i < viewMonth.getDay(); i++) days.push('<span></span>');
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const value = toValue(new Date(year, month, d));
      const classes = ['datepicker__day'];
      if (value === input.value) classes.push('is-selected');
      if (value === max) classes.push('is-today');
      if (marked.has(value)) classes.push('has-mark');
      const disabled = value > max ? ' disabled' : '';
      days.push(`<button type="button" class="${classes.join(' ')}" data-value="${value}"${disabled}>${d}</button>`);
    }

    panel.innerHTML = `
      <div class="datepicker__head">
        <button type="button" class="datepicker__nav" data-move="-1" aria-label="이전 달">‹</button>
        <strong>${year}년 ${month + 1}월</strong>
        <button type="button" class="datepicker__nav" data-move="1" aria-label="다음 달"${isLatestMonth ? ' disabled' : ''}>›</button>
      </div>
      <div class="datepicker__week">${WEEKDAYS.map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="datepicker__grid">${days.join('')}</div>
      <button type="button" class="datepicker__today" data-value="${max}">오늘</button>`;
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (panel.hidden) open();
    else close();
  });

  panel.addEventListener('click', (event) => {
    event.preventDefault();
    // 달을 넘기면 달력을 새로 그려서 누른 버튼이 사라진다 → '바깥 클릭'으로 오해해 닫히지 않게 여기서 멈춘다
    event.stopPropagation();
    const move = event.target.closest('[data-move]');
    if (move && !move.disabled) {
      viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + Number(move.dataset.move), 1);
      render();
      return;
    }
    const day = event.target.closest('[data-value]');
    if (day && !day.disabled) {
      setDateValue(picker, day.dataset.value);
      close();
    }
  });

  // 바깥을 누르거나 Esc를 누르면 닫는다
  document.addEventListener('click', (event) => {
    if (!panel.hidden && !picker.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      close();
      trigger.focus();
    }
  });

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  updateLabel(picker);
}

// 코드로 값을 넣은 뒤 글자만 다시 그릴 때 (change 이벤트 없음)
export function refreshDatePicker(picker) {
  updateLabel(picker);
}

function updateLabel(picker) {
  const label = picker.querySelector('[data-datepicker-label]');
  if (label) label.textContent = formatDateLabel(picker.querySelector('input').value);
}

function toDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toValue(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function firstOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
