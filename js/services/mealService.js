// 식단 기능 (F301~F304)
// 식단은 로그인한 본인 것만 만들고, 보고, 고치고, 지울 수 있다.

import { STORAGE_KEYS, MEAL_TYPES, MESSAGES, NUTRIENT_KEYS } from '../core/constants.js';
import { getAll, saveAll } from '../core/storage.js';
import { getCurrentUser } from '../core/auth.js';
import { validateMeal } from '../core/validator.js';
import { round } from '../core/utils.js';

// F301 식단 작성
// data: { date, mealType, foods: MealFood[] }
export function createMeal(data) {
  const me = getCurrentUser();
  if (!me) return { ok: false, message: MESSAGES.LOGIN_REQUIRED };

  const errors = validateMeal(data);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const meals = getAll(STORAGE_KEYS.MEALS);
  const meal = {
    mealId: nextMealId(meals),
    userId: me.userId,
    date: data.date,
    mealType: data.mealType,
    foods: data.foods.map(cleanFood),
  };
  meals.push(meal);
  saveAll(STORAGE_KEYS.MEALS, meals);
  return { ok: true, data: meal };
}

// F302 식단 목록 (내 식단만, 날짜 최신순 → 같은 날은 간식·저녁·점심·아침 순)
// filter: { date: 'YYYY-MM-DD' | '', mealType: '아침' | … | '' }  (빈 값이면 거르지 않음)
export function getMeals(filter = {}) {
  const me = getCurrentUser();
  if (!me) return [];

  return getAll(STORAGE_KEYS.MEALS)
    .filter((m) => m.userId === me.userId)
    .filter((m) => !filter.date || m.date === filter.date)
    .filter((m) => !filter.mealType || m.mealType === filter.mealType)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return MEAL_TYPES.indexOf(b.mealType) - MEAL_TYPES.indexOf(a.mealType);
    });
}

// F302 식단 상세 (내 식단이 아니거나 없으면 null)
// mealId는 URL에서 읽은 문자열 '3'이어도 된다
export function getMealById(mealId) {
  const me = getCurrentUser();
  if (!me) return null;
  const meal = getAll(STORAGE_KEYS.MEALS).find((m) => m.mealId === Number(mealId));
  return meal && meal.userId === me.userId ? meal : null;
}

// F303 식단 수정 (날짜·끼니·음식 전체를 새 값으로 바꾼다)
export function updateMeal(mealId, data) {
  const meals = getAll(STORAGE_KEYS.MEALS);
  const found = findMine(meals, mealId);
  if (!found.ok) return found;

  const errors = validateMeal(data);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const meal = found.data;
  meal.date = data.date;
  meal.mealType = data.mealType;
  meal.foods = data.foods.map(cleanFood);
  saveAll(STORAGE_KEYS.MEALS, meals);
  return { ok: true, data: meal };
}

// F304 식단 삭제
export function deleteMeal(mealId) {
  const meals = getAll(STORAGE_KEYS.MEALS);
  const found = findMine(meals, mealId);
  if (!found.ok) return found;

  saveAll(STORAGE_KEYS.MEALS, meals.filter((m) => m !== found.data));
  return { ok: true, data: null };
}

// 목록에서 내 식단 찾기 → { ok: true, data: meal } 또는 실패 결과
function findMine(meals, mealId) {
  const me = getCurrentUser();
  if (!me) return { ok: false, message: MESSAGES.LOGIN_REQUIRED };
  const meal = meals.find((m) => m.mealId === Number(mealId));
  if (!meal) return { ok: false, message: MESSAGES.MEAL_NOT_FOUND };
  if (meal.userId !== me.userId) return { ok: false, message: MESSAGES.FORBIDDEN };
  return { ok: true, data: meal };
}

// 새 번호 = 지금까지 가장 큰 mealId + 1
function nextMealId(meals) {
  return meals.reduce((max, m) => Math.max(max, m.mealId), 0) + 1;
}

// 음식 항목을 정해진 7개 필드만 남기고 숫자로 정리
function cleanFood(food) {
  const clean = { foodName: String(food.foodName) };
  NUTRIENT_KEYS.forEach((key) => {
    clean[key] = round(Number(food[key]) || 0, 1);
  });
  return clean;
}
