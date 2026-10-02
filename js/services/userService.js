// 회원 기능 (F306~F309)
// 화면(DOM)은 만지지 않는다. 결과만 돌려주면 pages/*.js가 화면에 보여준다.

import { STORAGE_KEYS, MESSAGES } from '../core/constants.js';
import { getAll, saveAll } from '../core/storage.js';
import { getCurrentUser, logout } from '../core/auth.js';
import { validateUser } from '../core/validator.js';

// 아이디 중복 확인 (탈퇴한 회원의 아이디도 다시 쓸 수 없음)
export function isUserIdTaken(userId) {
  return getAll(STORAGE_KEYS.USERS).some((u) => u.userId === userId.trim());
}

// F306 회원 가입
// data: { userId, password, passwordConfirm, name, height, weight, diseaseInfo }
export function createUser(data) {
  const errors = validateUser(data, 'signup');
  if (!errors.userId && isUserIdTaken(data.userId)) {
    errors.userId = '이미 사용 중인 아이디입니다.';
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const user = {
    userId: data.userId.trim(),
    password: data.password,
    name: data.name.trim(),
    height: Number(data.height),
    weight: Number(data.weight),
    diseaseInfo: data.diseaseInfo,
    active: true,
  };
  const users = getAll(STORAGE_KEYS.USERS);
  users.push(user);
  saveAll(STORAGE_KEYS.USERS, users);
  return { ok: true, data: withoutPassword(user) };
}

// F307 회원 조회 (비밀번호 제외), 없으면 null
export function getUser(userId) {
  const user = getAll(STORAGE_KEYS.USERS).find((u) => u.userId === userId);
  return user ? withoutPassword(user) : null;
}

// F308 회원 수정 (본인만). userId는 바꿀 수 없고, password는 입력했을 때만 바뀐다
// data: { password, passwordConfirm, name, height, weight, diseaseInfo }
export function updateUser(userId, data) {
  const denied = checkSelf(userId);
  if (denied) return denied;

  const errors = validateUser(data, 'update');
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const users = getAll(STORAGE_KEYS.USERS);
  const user = users.find((u) => u.userId === userId);
  user.name = data.name.trim();
  user.height = Number(data.height);
  user.weight = Number(data.weight);
  user.diseaseInfo = data.diseaseInfo;
  if (data.password) user.password = data.password;

  saveAll(STORAGE_KEYS.USERS, users);
  return { ok: true, data: withoutPassword(user) };
}

// F309 회원 탈퇴 (본인만, 비밀번호 재확인). 데이터를 지우지 않고 active만 false로 바꾼 뒤 로그아웃
export function deactivateUser(userId, password) {
  const denied = checkSelf(userId);
  if (denied) return denied;

  const users = getAll(STORAGE_KEYS.USERS);
  const user = users.find((u) => u.userId === userId);
  if (user.password !== password) {
    return { ok: false, errors: { password: '비밀번호가 올바르지 않습니다.' } };
  }
  user.active = false;
  saveAll(STORAGE_KEYS.USERS, users);
  logout();
  return { ok: true, data: null };
}

// 로그인한 본인인지 확인. 문제가 있으면 실패 결과를, 괜찮으면 null을 돌려준다
function checkSelf(userId) {
  const me = getCurrentUser();
  if (!me) return { ok: false, message: MESSAGES.LOGIN_REQUIRED };
  if (me.userId !== userId) return { ok: false, message: MESSAGES.FORBIDDEN };
  return null;
}

function withoutPassword(user) {
  const { password, ...rest } = user;
  return rest;
}
