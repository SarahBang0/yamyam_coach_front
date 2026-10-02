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
    diseaseInfo: formatDiseases(user),
    remainKcal: Math.max(0, round(day.targetKcal - day.total.calorie, 0)),
  });

  const filter = $('#recommend-filter');
  fillForm(filter, { mealType: getNextMealType(todayMeals) });
  const render = () => renderRecommendations(user, readForm(filter).mealType || getNextMealType(todayMeals));
  filter?.addEventListener('change', render);
  render();
}

// 카드에는 꼭 필요한 것만: 등급, 음식 이름, 열량, 추천 이유 한 줄
function renderRecommendations(user, mealType) {
  renderList($('#recommend-list'), $('#recommend-item'), recommendMeals(user, mealType), {
    toFields: ({ foods, analysis, highlights }) => ({
      grade: analysis.grade,
      foodNames: foods.map((f) => f.foodName.replace(/_/g, ' ')).join(' · '),
      calorie: Math.round(analysis.calorie),
      // '목표 열량의 N%'는 열량 숫자와 겹치므로 빼고 나머지 이유만
      reason: highlights.filter((text) => !text.startsWith('목표 열량')).slice(0, 2).join(' · '),
    }),
    onRow: (row, item, index) => {
      fillFields(row, { rank: index + 1 });
      $('[data-action="record"]', row)?.addEventListener('click', (event) => {
        event.preventDefault();
        recordMeal(mealType, item.foods);
      });
    },
  });
}

function recordMeal(mealType, foods) {
  const result = createMeal({ date: today(), mealType, foods });
  if (!result.ok) {
    alert(result.message ?? Object.values(result.errors).join('\n'));
    return;
  }
  go(pageUrl(`meal-detail.html?id=${result.data.mealId}`));
}
