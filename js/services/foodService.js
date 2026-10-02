// 음식 검색과 직접 입력 (F301)
//
// 음식은 두 종류다.
// 1) FOODS (dummy.js 상수, 음식 DB): 영양값이 100g 기준, servingSize = 1회 제공량(g)
// 2) 직접 입력 음식 (LocalStorage nn_customFoods): 처음부터 1회분 값, servingSize 없음
// 식단에는 둘 다 '1회분 MealFood' 모양으로 담는다:
//   { foodName, calorie, carbohydrate, protein, fat, sodium, sugar }

import { STORAGE_KEYS, NUTRIENT_KEYS } from '../core/constants.js';
import { getAll, saveAll } from '../core/storage.js';
import { validateCustomFood } from '../core/validator.js';
import { round } from '../core/utils.js';
import { FOODS } from '../data/dummy.js';

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

// 음식 검색 (이름에 keyword가 들어간 것, 빈칸이면 전체)
// 돌려주는 항목: { key, foodName, servingText, calorie, mealFood }
//  - key: 목록에서 구분용 ('db:식품코드' 또는 'custom:이름')
//  - servingText, calorie: 검색 결과 template에 보여줄 값 (calorie는 1회 기준)
//  - mealFood: '추가' 버튼을 누르면 식단에 그대로 넣을 값
export function searchFoods(keyword = '') {
  const word = keyword.trim().toLowerCase();
  const match = (food) => food.foodName.toLowerCase().includes(word);

  const dbItems = FOODS.filter(match).map((food) => {
    const mealFood = toMealFood(food);
    return {
      key: `db:${food.foodCode}`,
      foodName: food.foodName,
      servingText: `1회 ${food.servingSize}g`,
      calorie: mealFood.calorie,
      mealFood,
    };
  });

  const customItems = getCustomFoods().filter(match).map((food) => {
    const mealFood = toMealFood(food);
    return {
      key: `custom:${food.foodName}`,
      foodName: food.foodName,
      servingText: '직접 입력',
      calorie: mealFood.calorie,
      mealFood,
    };
  });

  return [...dbItems, ...customItems];
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
