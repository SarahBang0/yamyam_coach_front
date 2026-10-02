// LocalStorage 읽기·쓰기
// 이 파일만 localStorage에 직접 접근한다. 다른 파일은 이 함수들을 쓴다.

import { STORAGE_KEYS } from './constants.js';
import { USERS, MEALS, CUSTOM_FOODS } from '../data/dummy.js';

// 배열 데이터 꺼내기 (없으면 빈 배열)
export function getAll(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// 배열 데이터 통째로 저장
export function saveAll(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// 하나짜리 값 꺼내기 (세션 등, 없으면 null)
export function getItem(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

// 처음 실행할 때만 더미 데이터를 넣는다 (회원 키가 아예 없을 때)
// 처음 상태로 돌리려면 개발자도구에서 LocalStorage를 비우고 새로고침
export function seedIfEmpty() {
  if (localStorage.getItem(STORAGE_KEYS.USERS) !== null) return;
  saveAll(STORAGE_KEYS.USERS, USERS);
  saveAll(STORAGE_KEYS.MEALS, MEALS);
  saveAll(STORAGE_KEYS.CUSTOM_FOODS, CUSTOM_FOODS);
}

// 이 파일을 불러오는 순간 한 번 실행 → 어느 화면에서 시작해도 데이터가 준비됨
seedIfEmpty();
