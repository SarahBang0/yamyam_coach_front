// 로그인 상태 관리 (세션은 LocalStorage의 nn_session에 { userId }로 저장)

import { STORAGE_KEYS } from './constants.js';
import { getAll, getItem, setItem, removeItem } from './storage.js';

// 로그인: 성공하면 { ok: true, data: 회원(비밀번호 제외) }
export function login(userId, password) {
  const user = getAll(STORAGE_KEYS.USERS).find(
    (u) => u.userId === userId && u.password === password && u.active,
  );
  if (!user) {
    return { ok: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' };
  }
  setItem(STORAGE_KEYS.SESSION, { userId: user.userId });
  return { ok: true, data: withoutPassword(user) };
}

export function logout() {
  removeItem(STORAGE_KEYS.SESSION);
}

// 지금 로그인한 회원 (비밀번호 제외), 없거나 탈퇴했으면 null
export function getCurrentUser() {
  const session = getItem(STORAGE_KEYS.SESSION);
  if (!session) return null;
  const user = getAll(STORAGE_KEYS.USERS).find((u) => u.userId === session.userId);
  if (!user || !user.active) {
    logout();
    return null;
  }
  return withoutPassword(user);
}

export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// 회원 전용 화면 맨 위에서 호출: 비로그인이면 로그인 화면으로 보낸다
export function requireLogin() {
  if (isLoggedIn()) return true;
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${pagesPath()}login.html?redirect=${redirect}`;
  return false;
}

// 로그인·회원가입 화면 맨 위에서 호출: 이미 로그인했으면 메인으로 보낸다
export function requireGuest() {
  if (!isLoggedIn()) return true;
  window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
  return false;
}

// index.html(루트)에서는 'pages/', pages 폴더 안에서는 '' 를 붙여야 경로가 맞는다
function pagesPath() {
  return window.location.pathname.includes('/pages/') ? '' : 'pages/';
}

function withoutPassword(user) {
  const { password, ...rest } = user;
  return rest;
}
