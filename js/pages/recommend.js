// 추천식단 (docs/화면설계.md 6-4)
// 끼니를 고르면 그 끼니에 맞는 식단 3개를 보여주고, '이 식단으로 기록하기'를 누르면 오늘 식단으로 저장한다

import { requireLogin } from '../core/auth.js';
import { today, round, pageUrl, formatDiseases } from '../core/utils.js';
import { $, initLayout, fillFields, fillForm, readForm, renderList, go } from '../core/ui.js';
import { getMeals, createMeal } from '../services/mealService.js';
import { analyzeDay } from '../services/analysisService.js';
import { recommendMeals, getNextMealType } from '../services/recommendService.js';

if (requireLogin()) {
  const user = initLayout();
  const todayMeals = getMeals({ date: today() });
  const day = analyzeDay(todayMeals, user);
  fillFields(document, {
    name: user.name,
    diseaseInfo: formatDiseases(user),
    remainKcal: Math.max(0, round(day.targetKcal - day.total.calorie, 0)),
  });

  const filter = $('#recommend-filter');
  fillForm(filter, { mealType: getNextMealType(todayMeals) });
  const render = () => renderRecommendations(user, readForm(filter).mealType || getNextMealType(todayMeals));
  filter?.addEventListener('change', render);
  render();
}

function renderRecommendations(user, mealType) {
  fillFields(document, { mealType });
  renderList($('#recommend-list'), $('#recommend-item'), recommendMeals(user, mealType), {
    toFields: ({ analysis }) => ({
      calorie: analysis.calorie,
      score: analysis.score,
      grade: analysis.grade,
      sodium: analysis.total.sodium,
      protein: analysis.total.protein,
    }),
    onRow: (row, item, index) => {
      fillFields(row, { rank: index + 1 });
      fillChips($('[data-list="foods"]', row), item.foods.map((f) => f.foodName));
      fillChips($('[data-list="highlights"]', row), item.highlights);
      $('[data-action="record"]', row)?.addEventListener('click', (event) => {
        event.preventDefault();
        recordMeal(mealType, item.foods);
      });
    },
  });
}

// 글자 목록 → <li> 여러 개
function fillChips(list, texts) {
  list?.replaceChildren(
    ...texts.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }),
  );
}

function recordMeal(mealType, foods) {
  const result = createMeal({ date: today(), mealType, foods });
  if (!result.ok) {
    alert(result.message ?? Object.values(result.errors).join('\n'));
    return;
  }
  go(pageUrl(`meal-detail.html?id=${result.data.mealId}`));
}
