// 냠냠코치 더미 데이터
// - 음식 DB는 js/data/foods.js (foods.csv를 tools/build-foods.mjs로 변환)
// - USERS / MEALS / CUSTOM_FOODS: 제공된 users.json, meals.json, custom_foods.json과 같은 형식
//   (MEALS의 영양값은 FOODS의 1회 제공량 기준으로 다시 계산한 값)
// 처음 실행할 때 storage.js의 seedIfEmpty()가 USERS·MEALS·CUSTOM_FOODS를 LocalStorage에 한 번 넣는다.

export const USERS = [
  {
    userId: "hello",
    password: "hello",
    name: "jieun",
    height: 165.0,
    weight: 45.0,
    diseaseInfo: "없음",
    active: true
  },
  {
    userId: "demo",
    password: "pass1234",
    name: "테스트",
    height: 175.0,
    weight: 65.0,
    diseaseInfo: "고혈압",
    active: true
  },
  {
    userId: "test",
    password: "test",
    name: "test1",
    height: 175.0,
    weight: 65.0,
    diseaseInfo: "없음",
    active: true
  }
];

export const MEALS = [
  {
    mealId: 1,
    userId: "demo",
    date: "2026-09-30",
    mealType: "아침",
    foods: [
      {
        foodName: "현미밥",
        calorie: 395.6,
        carbohydrate: 89.5,
        protein: 7.1,
        fat: 1.1,
        sodium: 4.6,
        sugar: 0.0
      },
      {
        foodName: "스크램블드에그",
        calorie: 149.0,
        carbohydrate: 1.6,
        protein: 10.0,
        fat: 11.0,
        sodium: 145.0,
        sugar: 1.4
      },
      {
        foodName: "시금치나물",
        calorie: 34.5,
        carbohydrate: 1.7,
        protein: 1.9,
        fat: 2.2,
        sodium: 68.0,
        sugar: 0.1
      }
    ]
  },
  {
    mealId: 2,
    userId: "demo",
    date: "2026-09-30",
    mealType: "점심",
    foods: [
      {
        foodName: "비빔밥",
        calorie: 639.0,
        carbohydrate: 84.8,
        protein: 30.9,
        fat: 19.4,
        sodium: 1044.0,
        sugar: 0.2
      },
      {
        foodName: "미역국",
        calorie: 48.0,
        carbohydrate: 3.5,
        protein: 2.6,
        fat: 2.4,
        sodium: 672.0,
        sugar: 1.1
      }
    ]
  },
  {
    mealId: 3,
    userId: "demo",
    date: "2026-09-30",
    mealType: "저녁",
    foods: [
      {
        foodName: "연어구이",
        calorie: 234.0,
        carbohydrate: 0.2,
        protein: 24.8,
        fat: 14.9,
        sodium: 158.0,
        sugar: 0.6
      },
      {
        foodName: "브로콜리볶음",
        calorie: 45.9,
        carbohydrate: 5.0,
        protein: 4.0,
        fat: 1.2,
        sodium: 84.6,
        sugar: 1.3
      },
      {
        foodName: "잡곡밥",
        calorie: 292.0,
        carbohydrate: 58.7,
        protein: 10.6,
        fat: 1.7,
        sodium: 6.0,
        sugar: 0.6
      }
    ]
  },
  {
    mealId: 4,
    userId: "demo",
    date: "2026-10-01",
    mealType: "아침",
    foods: [
      {
        foodName: "샐러드_닭가슴살",
        calorie: 202.5,
        carbohydrate: 8.0,
        protein: 10.8,
        fat: 14.2,
        sodium: 132.0,
        sugar: 4.9
      },
      {
        foodName: "고구마_찐고구마",
        calorie: 278.0,
        carbohydrate: 64.9,
        protein: 3.3,
        fat: 0.5,
        sodium: 20.0,
        sugar: 32.6
      }
    ]
  },
  {
    mealId: 5,
    userId: "demo",
    date: "2026-10-01",
    mealType: "점심",
    foods: [
      {
        foodName: "돼지고기볶음(제육볶음)",
        calorie: 487.5,
        carbohydrate: 11.8,
        protein: 30.4,
        fat: 35.5,
        sodium: 1252.5,
        sugar: 0.9
      },
      {
        foodName: "쌀밥",
        calorie: 166.0,
        carbohydrate: 37.3,
        protein: 3.4,
        fat: 0.3,
        sodium: 0.0,
        sugar: 0.0
      },
      {
        foodName: "배추김치",
        calorie: 38.0,
        carbohydrate: 6.5,
        protein: 2.0,
        fat: 0.4,
        sodium: 551.0,
        sugar: 2.4
      }
    ]
  },
  {
    mealId: 6,
    userId: "demo",
    date: "2026-10-01",
    mealType: "저녁",
    foods: [
      {
        foodName: "김치찌개_돼지고기",
        calorie: 90.0,
        carbohydrate: 2.1,
        protein: 8.5,
        fat: 5.4,
        sodium: 414.0,
        sugar: 0.1
      },
      {
        foodName: "쌀밥",
        calorie: 166.0,
        carbohydrate: 37.3,
        protein: 3.4,
        fat: 0.3,
        sodium: 0.0,
        sugar: 0.0
      },
      {
        foodName: "콩나물무침",
        calorie: 34.5,
        carbohydrate: 1.6,
        protein: 1.9,
        fat: 2.3,
        sodium: 193.5,
        sugar: 0.2
      }
    ]
  },
  {
    mealId: 7,
    userId: "demo",
    date: "2026-10-01",
    mealType: "간식",
    foods: [
      {
        foodName: "떡볶이",
        calorie: 259.2,
        carbohydrate: 46.7,
        protein: 6.3,
        fat: 5.3,
        sodium: 703.8,
        sugar: 7.9
      }
    ]
  },
  {
    mealId: 8,
    userId: "hello",
    date: "2026-10-01",
    mealType: "점심",
    foods: [
      {
        foodName: "김밥",
        calorie: 322.0,
        carbohydrate: 46.0,
        protein: 11.1,
        fat: 10.5,
        sodium: 706.1,
        sugar: 0.0
      },
      {
        foodName: "된장찌개",
        calorie: 92.0,
        carbohydrate: 8.9,
        protein: 6.8,
        fat: 3.3,
        sodium: 636.0,
        sugar: 0.0
      }
    ]
  },
  {
    mealId: 9,
    userId: "hello",
    date: "2026-10-01",
    mealType: "저녁",
    foods: [
      {
        foodName: "소불고기",
        calorie: 340.0,
        carbohydrate: 8.5,
        protein: 32.8,
        fat: 19.3,
        sodium: 836.0,
        sugar: 6.5
      },
      {
        foodName: "현미밥",
        calorie: 395.6,
        carbohydrate: 89.5,
        protein: 7.1,
        fat: 1.1,
        sodium: 4.6,
        sugar: 0.0
      },
      {
        foodName: "두부조림",
        calorie: 71.5,
        carbohydrate: 2.2,
        protein: 4.8,
        fat: 4.8,
        sodium: 80.5,
        sugar: 1.8
      }
    ]
  }
];

export const CUSTOM_FOODS = [
  {
    foodName: "테스트음식",
    calorie: 120.0,
    carbohydrate: 20.0,
    protein: 4.0,
    fat: 2.0,
    sodium: 300.0,
    sugar: 5.0
  }
];