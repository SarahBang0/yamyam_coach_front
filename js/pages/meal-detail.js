// 식단 상세·분석 (docs/화면설계.md 6-3)
// 주소: meal-detail.html?id=3

import { requireLogin } from '../core/auth.js';
import { MESSAGES } from '../core/constants.js';
import { getQueryParam, pageUrl } from '../core/utils.js';
import { $, initLayout, fillFields, renderList, setBar, setLink, go } from '../core/ui.js';
import { getMealById, deleteMeal } from '../services/mealService.js';
import { analyzeMeal } from '../services/analysisService.js';

if (requireLogin()) {
  const user = initLayout();
  const meal = getMealById(getQueryParam('id'));
  if (meal) {
    renderMeal(meal, user);
  } else {
    alert(MESSAGES.MEAL_NOT_FOUND);
    go(pageUrl('meal-list.html'));
  }
}

function renderMeal(meal, user) {
  const analysis = analyzeMeal(meal, user);

  // 화면 전체를 먼저 채운 뒤 음식 표를 그린다 (표 안의 calorie 등이 덮어써지지 않게)
  fillFields(document, {
    date: meal.date,
    mealType: meal.mealType,
    score: analysis.score,
    grade: analysis.grade,
    calorie: analysis.calorie,
    targetKcal: analysis.targetKcal,
    kcalRate: analysis.kcalRate,
  });
  fillFields($('#food-total'), toTableRow(analysis.total));
  renderList($('#food-rows'), $('#food-row'), meal.foods, { toFields: toTableRow });

  ['carb', 'protein', 'fat'].forEach((key) => {
    const el = $(`#macro-${key}`);
    fillFields(el, { value: analysis.ratio[key] });
    setBar(el, analysis.ratio[key]);
  });

  $('#advice-list')?.replaceChildren(...analysis.advice.map(adviceItem));

  setLink($('#edit-btn'), pageUrl(`meal-form.html?id=${meal.mealId}`));
  $('#delete-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!confirm('이 식단을 삭제할까요?')) return;
    const result = deleteMeal(meal.mealId);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    go(pageUrl('meal-list.html'));
  });
}

// 표에 넣을 값: 영양 숫자를 모두 소수 한 자리로 맞춘다 (395.6 / 0.0 처럼 소수점 자리가 세로로 맞도록)
function toTableRow(food) {
  const row = { ...food };
  ['calorie', 'carbohydrate', 'protein', 'fat', 'sodium', 'sugar'].forEach((key) => {
    row[key] = Number(food[key] ?? 0).toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  });
  return row;
}

// 조언 한 줄 → <li>. '**…**' 부분은 <strong>으로 감싸 강조한다 (글자 노드로 만들어 HTML이 섞이지 않게)
function adviceItem(text) {
  const li = document.createElement('li');
  text.split('**').forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) {
      const strong = document.createElement('strong');
      strong.textContent = part;
      li.append(strong);
    } else {
      li.append(part);
    }
  });
  return li;
}
