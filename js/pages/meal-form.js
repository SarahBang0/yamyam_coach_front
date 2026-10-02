// 식단 작성·수정 (docs/화면설계.md 6-2)
// 주소에 ?id=가 있으면 수정, 없으면 작성

import { requireLogin } from '../core/auth.js';
import { MESSAGES } from '../core/constants.js';
import { today, debounce, getQueryParam, pageUrl } from '../core/utils.js';
import { $, initLayout, fillFields, fillForm, readForm, renderList, setLink, setMessage, showResult, go } from '../core/ui.js';
import { createMeal, getMealById, updateMeal } from '../services/mealService.js';
import { searchFoods, addCustomFood } from '../services/foodService.js';
import { sumNutrition } from '../services/analysisService.js';

const mealId = getQueryParam('id');
let foods = []; // 지금까지 담은 음식 (MealFood 배열)

if (requireLogin()) {
  initLayout();
  init();
}

function init() {
  const form = $('#meal-form');
  const dateInput = form?.elements.namedItem('date');
  if (dateInput) dateInput.max = today();

  if (mealId) {
    const meal = getMealById(mealId);
    if (!meal) {
      alert(MESSAGES.MEAL_NOT_FOUND);
      go(pageUrl('meal-list.html'));
      return;
    }
    fillFields(document, { title: '식단 수정' });
    fillForm(form, { date: meal.date, mealType: meal.mealType });
    foods = meal.foods.map((food) => ({ ...food }));
  } else {
    fillForm(form, { date: today() });
  }

  setLink($('#cancel-btn'), mealId ? pageUrl(`meal-detail.html?id=${mealId}`) : pageUrl('meal-list.html'));
  renderSelected();
  setupSearch();
  setupCustomFood();

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = { ...readForm(form), foods };
    const result = mealId ? updateMeal(mealId, data) : createMeal(data);
    if (showResult(form, result)) return;
    go(pageUrl(`meal-detail.html?id=${result.data.mealId}`));
  });
}

// 담은 음식 목록과 합계 열량을 다시 그린다
function renderSelected() {
  renderList($('#selected-foods'), $('#selected-food-item'), foods, {
    empty: $('#selected-empty'),
    onRow: (row, food, index) => {
      $('[data-action="remove"]', row)?.addEventListener('click', (event) => {
        event.preventDefault();
        foods.splice(index, 1);
        renderSelected();
      });
    },
  });
  fillFields(document, { totalCalorie: sumNutrition(foods).calorie });
}

function addFood(food) {
  foods.push({ ...food });
  setMessage($('#meal-form'), 'foods', '');
  renderSelected();
}

// 음식 검색: 입력을 멈추면 0.3초 뒤 검색, 처음에는 전체 목록
function setupSearch() {
  const input = $('#food-search');
  const search = () => renderResults(input?.value ?? '');

  input?.addEventListener('input', debounce(search, 300));
  // 검색창이 식단 폼 안에 있어도 엔터를 누르면 식단이 저장되지 않고 검색만 하게
  input?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    search();
  });
  search();
}

function renderResults(keyword) {
  renderList($('#food-results'), $('#food-result-item'), searchFoods(keyword), {
    empty: $('#food-results-empty'),
    onRow: (row, item) => {
      $('[data-action="add"]', row)?.addEventListener('click', (event) => {
        event.preventDefault();
        addFood(item.mealFood);
      });
    },
  });
}

// 음식 직접 입력: 열기 버튼으로 폼을 열고 닫는다. 저장하면 바로 담는다
function setupCustomFood() {
  const form = $('#custom-food-form');
  if (!form) return;

  $('#custom-food-open')?.addEventListener('click', (event) => {
    event.preventDefault();
    form.hidden = !form.hidden;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = addCustomFood(readForm(form));
    if (showResult(form, result)) return;

    addFood(result.data);
    form.reset();
    renderResults($('#food-search')?.value ?? '');
  });
}
