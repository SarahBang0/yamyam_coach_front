// 회원가입 (docs/화면설계.md 5-2)
// 가입에 성공하면 자동으로 로그인한 뒤 메인으로 간다

import { login, requireGuest } from '../core/auth.js';
import { validateUser } from '../core/validator.js';
import { homeUrl } from '../core/utils.js';
import { $, initLayout, readForm, setMessage, showResult, go } from '../core/ui.js';
import { createUser, isUserIdTaken } from '../services/userService.js';

if (requireGuest()) {
  initLayout();
  setupSignupForm();
}

function setupSignupForm() {
  const form = $('#signup-form');
  if (!form) return;

  $('#check-id-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    checkUserId(form);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = readForm(form);
    const result = createUser(data);
    if (showResult(form, result)) return;

    login(result.data.userId, data.password);
    go(homeUrl());
  });
}

// 아이디 중복 확인: 형식 → 중복 순서로 검사해 아이디 칸 아래에 결과를 보여준다
function checkUserId(form) {
  const userId = form.elements.namedItem('userId')?.value ?? '';
  const formatError = validateUser({ userId }).userId;
  if (formatError) {
    setMessage(form, 'userId', formatError);
  } else if (isUserIdTaken(userId)) {
    setMessage(form, 'userId', '이미 사용 중인 아이디입니다.');
  } else {
    setMessage(form, 'userId', '사용할 수 있는 아이디입니다.', true);
  }
}
