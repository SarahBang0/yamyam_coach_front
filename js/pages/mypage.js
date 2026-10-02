// 마이페이지: 내 정보, 정보 수정, 회원 탈퇴 (docs/화면설계.md 5-3)

import { getCurrentUser, requireLogin } from '../core/auth.js';
import { homeUrl } from '../core/utils.js';
import { $, initLayout, fillFields, fillForm, readForm, setMessage, showErrors, showResult } from '../core/ui.js';
import { updateUser, deactivateUser } from '../services/userService.js';
import { calcBMI, calcTargetKcal } from '../services/analysisService.js';

if (requireLogin()) {
  initLayout();
  renderInfo();
  setupUserForm();
  setupWithdrawForm();
}

// 내 정보 영역을 채우고, 수정 폼에 현재 값을 넣는다 (헤더의 이름도 함께 바뀜)
function renderInfo() {
  const user = getCurrentUser();
  const { bmi, bmiLabel } = calcBMI(user);
  fillFields(document, { ...user, bmi, bmiLabel, targetKcal: calcTargetKcal(user) });
  fillForm($('#user-form'), {
    password: '',
    passwordConfirm: '',
    name: user.name,
    height: user.height,
    weight: user.weight,
    diseaseInfo: user.diseaseInfo,
  });
}

function setupUserForm() {
  const form = $('#user-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = updateUser(getCurrentUser()?.userId, readForm(form));
    if (showResult(form, result)) return;

    renderInfo();
    setMessage(form, 'form', '수정되었습니다.', true);
  });
}

function setupWithdrawForm() {
  const form = $('#withdraw-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const { password = '' } = readForm(form);
    if (!password) {
      showErrors(form, { password: '비밀번호를 입력하세요.' });
      return;
    }
    if (!confirm('정말 탈퇴할까요? 탈퇴한 아이디는 다시 사용할 수 없습니다.')) return;

    const result = deactivateUser(getCurrentUser()?.userId, password);
    if (showResult(form, result)) return;
    alert('탈퇴되었습니다.');
    window.location.href = homeUrl();
  });
}
