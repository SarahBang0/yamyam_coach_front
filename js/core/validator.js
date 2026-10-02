// 입력값 검사 (명세서 9장 규칙)
// 모든 함수는 { 필드명: 오류 메시지 } 객체를 돌려준다. 빈 객체면 통과.
// 폼에서 읽은 값은 문자열이라 숫자도 문자열로 들어와도 된다.

import { MEAL_TYPES, DISEASES, NUTRIENT_KEYS } from './constants.js';
import { today, isNumeric } from './utils.js';

// 회원 가입·수정
// mode: 'signup' | 'update' (수정 때는 userId 검사 안 함, 비밀번호는 입력했을 때만 검사)
export function validateUser(data, mode = 'signup') {
  const errors = {};
  const userId = (data.userId ?? '').trim();
  const password = data.password ?? '';
  const name = (data.name ?? '').trim();

  if (mode === 'signup' && !/^[a-z0-9]{4,16}$/.test(userId)) {
    errors.userId = '아이디는 영문 소문자와 숫자 4~16자로 입력하세요.';
  }

  const mustCheckPassword = mode === 'signup' || password !== '';
  if (mustCheckPassword) {
    if (password.length < 4 || password.length > 20) {
      errors.password = '비밀번호는 4~20자로 입력하세요.';
    } else if (password !== (data.passwordConfirm ?? '')) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
  }

  if (name.length < 1) {
    errors.name = '이름을 입력하세요.';
  } else if (name.length > 20) {
    errors.name = '이름은 20자 이하로 입력하세요.';
  }
  if (!inRange(data.height, 100, 250)) {
    errors.height = '키는 100~250cm 사이로 입력하세요.';
  }
  if (!inRange(data.weight, 20, 300)) {
    errors.weight = '몸무게는 20~300kg 사이로 입력하세요.';
  }
  if (!DISEASES.includes(data.diseaseInfo)) {
    errors.diseaseInfo = '질환 정보를 선택하세요.';
  }
  return errors;
}

// 로그인 폼 (빈칸만 검사, 일치 여부는 auth.login이 판단)
export function validateLogin(data) {
  const errors = {};
  if (!(data.userId ?? '').trim()) errors.userId = '아이디를 입력하세요.';
  if (!(data.password ?? '')) errors.password = '비밀번호를 입력하세요.';
  return errors;
}

// 식단 { date, mealType, foods }
export function validateMeal(data) {
  const errors = {};
  const date = data.date ?? '';

  if (!isValidDate(date) || date > today()) {
    errors.date = '날짜를 확인하세요. 미래 날짜는 기록할 수 없습니다.';
  }
  if (!MEAL_TYPES.includes(data.mealType)) {
    errors.mealType = '끼니를 선택하세요.';
  }
  if (!Array.isArray(data.foods) || data.foods.length === 0) {
    errors.foods = '음식을 1개 이상 추가하세요.';
  } else if (data.foods.some((f) => !f || !String(f.foodName ?? '').trim())) {
    errors.foods = '음식 이름이 비어 있는 항목이 있습니다.';
  }
  return errors;
}

// 음식 직접 입력 { foodName, calorie, carbohydrate, protein, fat, sodium, sugar }
export function validateCustomFood(data) {
  const errors = {};
  const foodName = (data.foodName ?? '').trim();

  if (foodName.length < 1 || foodName.length > 30) {
    errors.foodName = '음식 이름을 입력하세요.';
  }
  NUTRIENT_KEYS.forEach((key) => {
    if (!isNumeric(data[key]) || Number(data[key]) < 0) {
      errors[key] = '0 이상의 숫자를 입력하세요.';
    }
  });
  return errors;
}

// 'YYYY-MM-DD' 형식이고 실제로 있는 날짜인지 (2026-02-31 같은 날짜는 거른다)
function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function inRange(value, min, max) {
  return isNumeric(value) && Number(value) >= min && Number(value) <= max;
}
