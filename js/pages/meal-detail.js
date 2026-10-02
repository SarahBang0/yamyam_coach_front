// 식단 상세·분석 (docs/화면설계.md 6-3)
// 주소: meal-detail.html?id=3

import { requireLogin } from '../core/auth.js';
import { MESSAGES } from '../core/constants.js';
import { getQueryParam, pageUrl } from '../core/utils.js';
import { $, initLayout, fillFields, renderList, setBar, setLink } from '../core/ui.js';
import { getMealById, deleteMeal } from '../services/mealService.js';
import { analyzeMeal } from '../services/analysisService.js';

if (requireLogin()) {
  const user = initLayout();
  const meal = getMealById(getQueryParam('id'));
  if (meal) {
    renderMeal(meal, user);
  } else {
    alert(MESSAGES.MEAL_NOT_FOUND);
    window.location.href = pageUrl('meal-list.html');
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
  fillFields($('#food-total'), analysis.total);
  renderList($('#food-rows'), $('#food-row'), meal.foods);

  ['carb', 'protein', 'fat'].forEach((key) => {
    const el = $(`#macro-${key}`);
    fillFields(el, { value: analysis.ratio[key] });
    setBar(el, analysis.ratio[key]);
  });

  $('#advice-list')?.replaceChildren(
    ...analysis.advice.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }),
  );

  setLink($('#edit-btn'), pageUrl(`meal-form.html?id=${meal.mealId}`));
  $('#delete-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!confirm('이 식단을 삭제할까요?')) return;
    const result = deleteMeal(meal.mealId);
    if (!result.ok) {
      alert(result.message);
      return;
    }
    window.location.href = pageUrl('meal-list.html');
  });
}
