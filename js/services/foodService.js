// 음식 검색과 직접 입력 (F301)
//
// 음식은 두 종류다.
// 1) FOODS (js/data/foods.js, 식약처 음식 DB): 영양값이 100g(또는 100ml) 기준, servingSize = 1회 제공량
// 2) 직접 입력 음식 (LocalStorage nn_customFoods): 처음부터 1회분 값, servingSize 없음
// 식단에는 둘 다 '1회분 MealFood' 모양으로 담는다:
//   { foodName, calorie, carbohydrate, protein, fat, sodium, sugar }

import { STORAGE_KEYS, NUTRIENT_KEYS } from '../core/constants.js';
import { getAll, saveAll } from '../core/storage.js';
import { validateCustomFood } from '../core/validator.js';
import { round } from '../core/utils.js';
import { FOODS } from '../data/foods.js';

// 음식 1개 → 1회분 MealFood
// servingSize가 있으면(음식 DB) 100g 기준 값을 1회 제공량으로 바꾸고, 없으면(직접 입력) 그대로 쓴다
export function toMealFood(food) {
  const ratio = food.servingSize ? food.servingSize / 100 : 1;
  const mealFood = { foodName: food.foodName };
  NUTRIENT_KEYS.forEach((key) => {
    mealFood[key] = round((Number(food[key]) || 0) * ratio, 1);
  });
  return mealFood;
}

// 분류 보여주는 순서: 식사에 자주 쓰는 분류부터 (목록에 없는 분류는 음식 수가 많은 순으로 뒤에)
const CATEGORY_ORDER = [
  '밥류', '국 및 탕류', '찌개 및 전골류', '면 및 만두류', '죽 및 스프류',
  '구이류', '볶음류', '조림류', '찜류', '전·적 및 부침류', '튀김류',
  '나물·숙채류', '생채·무침류', '김치류', '장아찌·절임류', '젓갈류',
  '빵 및 과자류', '유제품류 및 빙과류', '음료 및 차류',
];
export const CUSTOM_CATEGORY = '직접 입력';

// 분류별 음식 목록 (처음 한 번 만들어 둔다). 분류 안에서는 기본 음식(이름에 '_' 없음) → 이름순
let categoryIndex = null;
function getCategoryIndex() {
  if (categoryIndex) return categoryIndex;
  categoryIndex = new Map();
  FOODS.forEach((food) => {
    if (!categoryIndex.has(food.category)) categoryIndex.set(food.category, []);
    categoryIndex.get(food.category).push(food);
  });
  const isVariant = (food) => (food.foodName.includes('_') ? 1 : 0);
  categoryIndex.forEach((list) => list.sort((a, b) => isVariant(a) - isVariant(b) || a.foodName.localeCompare(b.foodName, 'ko')));
  return categoryIndex;
}

// 분류 목록 [{ name, count }] (보여주는 순서대로)
export function getFoodCategories() {
  const index = getCategoryIndex();
  const known = CATEGORY_ORDER.filter((name) => index.has(name));
  const others = [...index.keys()].filter((name) => !CATEGORY_ORDER.includes(name)).sort((a, b) => index.get(b).length - index.get(a).length);
  return [...known, ...others].map((name) => ({ name, count: index.get(name).length }));
}

// 한 분류의 음식을 앞에서부터 limit개 → { items, total }
export function browseFoods(category, limit = 60) {
  if (category === CUSTOM_CATEGORY) {
    const custom = getCustomFoods();
    return { items: custom.slice(0, limit).map(toCustomItem), total: custom.length };
  }
  const list = getCategoryIndex().get(category) ?? [];
  return { items: list.slice(0, limit).map(toItem), total: list.length };
}

// 음식 검색: 이름에 keyword가 들어간 음식을 잘 맞는 순서로 최대 limit개 (빈칸이면 없음)
// category를 주면 그 분류 안에서만 찾는다
// 순서: 직접 입력 음식 → 이름이 똑같은 것 → 이름이 keyword로 시작하는 것 → 이름이 짧은 것
// 돌려주는 항목: { key, foodName, category, servingText, calorie, mealFood }
//  - key: 목록에서 구분용 ('db:식품코드' 또는 'custom:이름')
//  - servingText, calorie: 목록 template에 보여줄 값 (calorie는 1회 기준)
//  - mealFood: '추가' 버튼을 누르면 식단에 그대로 넣을 값
export function searchFoods(keyword = '', limit = 50, category = '') {
  const word = keyword.trim().toLowerCase();
  if (!word) return [];
  const rank = (name) => {
    const n = name.toLowerCase();
    if (n === word) return 0;
    if (n.startsWith(word)) return 1;
    return 2;
  };
  const byRelevance = (a, b) => rank(a.foodName) - rank(b.foodName) || a.foodName.length - b.foodName.length;
  const matches = (food) => food.foodName.toLowerCase().includes(word);

  const customItems = !category || category === CUSTOM_CATEGORY ? getCustomFoods().filter(matches).map(toCustomItem) : [];
  const pool = category ? (category === CUSTOM_CATEGORY ? [] : getCategoryIndex().get(category) ?? []) : FOODS;
  const dbItems = pool.filter(matches).sort(byRelevance).slice(0, limit).map(toItem);
  return [...customItems, ...dbItems].slice(0, limit);
}

// 음식 DB 한 개 → 목록 항목
function toItem(food) {
  const mealFood = toMealFood(food);
  return {
    key: `db:${food.foodCode}`,
    foodName: food.foodName,
    category: food.category,
    servingText: `1회 ${food.servingSize}${food.servingUnit ?? 'g'}`,
    calorie: mealFood.calorie,
    mealFood,
  };
}

// 직접 입력 음식 한 개 → 목록 항목
function toCustomItem(food) {
  const mealFood = toMealFood(food);
  return { key: `custom:${food.foodName}`, foodName: food.foodName, category: CUSTOM_CATEGORY, servingText: '직접 입력', calorie: mealFood.calorie, mealFood };
}

// 직접 입력한 음식 목록
export function getCustomFoods() {
  return getAll(STORAGE_KEYS.CUSTOM_FOODS);
}

// 음식 직접 입력 → nn_customFoods에 저장하고, 식단에 담을 MealFood를 돌려준다
// 같은 이름이 이미 있으면 새 값으로 덮어쓴다
export function addCustomFood(data) {
  const errors = validateCustomFood(data);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const food = toMealFood({ ...data, foodName: data.foodName.trim() });
  const list = getCustomFoods().filter((f) => f.foodName !== food.foodName);
  list.push(food);
  saveAll(STORAGE_KEYS.CUSTOM_FOODS, list);
  return { ok: true, data: food };
}
