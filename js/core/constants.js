// 앱 전체에서 쓰는 고정 값

// LocalStorage 키
export const STORAGE_KEYS = {
  USERS: 'nn_users',
  MEALS: 'nn_meals',
  CUSTOM_FOODS: 'nn_customFoods',
  SESSION: 'nn_session',
};

// 끼니 (저장·표시 모두 한글 그대로 사용)
export const MEAL_TYPES = ['아침', '점심', '저녁', '간식'];

// 질환 정보
export const DISEASES = ['없음', '고혈압', '당뇨'];

// 식단 한 개에 들어가는 영양 필드 (meals.json의 foods 항목과 같은 이름)
export const NUTRIENT_KEYS = ['calorie', 'carbohydrate', 'protein', 'fat', 'sodium', 'sugar'];

// 공통 오류 메시지
export const MESSAGES = {
  LOGIN_REQUIRED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  MEAL_NOT_FOUND: '식단을 찾을 수 없습니다.',
  USER_NOT_FOUND: '회원 정보를 찾을 수 없습니다.',
};
