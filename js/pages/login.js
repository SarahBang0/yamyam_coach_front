// 로그인 (docs/화면설계.md 5-1)

import { login, requireGuest } from '../core/auth.js';
import { validateLogin } from '../core/validator.js';
import { getQueryParam, homeUrl } from '../core/utils.js';
import { $, initLayout, readForm, showErrors, go } from '../core/ui.js';

if (requireGuest()) {
  initLayout();
  setupLoginForm();
}

function setupLoginForm() {
  const form = $('#login-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = readForm(form);
    if (showErrors(form, validateLogin(data))) return;

    const result = login((data.userId ?? '').trim(), data.password ?? '');
    if (showErrors(form, {}, result.message)) return;
    go(redirectTarget());
  });
}

// 로그인 후 돌아갈 주소 (requireLogin이 붙여 준 ?redirect=)
// 다른 사이트로 가는 주소는 무시하고 메인으로 보낸다
function redirectTarget() {
  const redirect = getQueryParam('redirect');
  const isSameSite = redirect && redirect.startsWith('/') && !redirect.startsWith('//');
  return isSameSite ? redirect : homeUrl();
}
