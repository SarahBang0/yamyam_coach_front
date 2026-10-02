// 냠냠코치 더미 데이터
// - FOODS: 제공된 foods.csv(식약처 음식 DB)에서 20개를 골라 옮김. 영양값은 100g 기준, servingSize는 1회 제공량(g)
// - USERS / MEALS / CUSTOM_FOODS: 제공된 users.json, meals.json, custom_foods.json과 같은 형식
//   (MEALS의 영양값은 FOODS의 1회 제공량 기준으로 다시 계산한 값)
// 처음 실행할 때 storage.js의 seedIfEmpty()가 USERS·MEALS·CUSTOM_FOODS를 LocalStorage에 한 번 넣는다.

export const FOODS = [
  {
    foodCode: "D301-022000000-0001",
    foodName: "쌀밥",
    servingSize: 100.0,
    calorie: 166.0,
    carbohydrate: 37.33,
    protein: 3.36,
    fat: 0.32,
    sodium: 0.0,
    sugar: 0.02
  },
  {
    foodCode: "D101-050000000-0001",
    foodName: "현미밥",
    servingSize: 230.0,
    calorie: 172.0,
    carbohydrate: 38.9,
    protein: 3.1,
    fat: 0.47,
    sodium: 2.0,
    sugar: 0.0
  },
  {
    foodCode: "D101-032000000-0001",
    foodName: "잡곡밥",
    servingSize: 200.0,
    calorie: 146.0,
    carbohydrate: 29.33,
    protein: 5.3,
    fat: 0.87,
    sodium: 3.0,
    sugar: 0.32
  },
  {
    foodCode: "D101-018000000-0001",
    foodName: "비빔밥",
    servingSize: 450.0,
    calorie: 142.0,
    carbohydrate: 18.84,
    protein: 6.86,
    fat: 4.32,
    sodium: 232.0,
    sugar: 0.05
  },
  {
    foodCode: "D101-007000000-0001",
    foodName: "김밥",
    servingSize: 230.0,
    calorie: 140.0,
    carbohydrate: 19.98,
    protein: 4.84,
    fat: 4.55,
    sodium: 307.0,
    sugar: 0.0
  },
  {
    foodCode: "D105-223000000-0001",
    foodName: "미역국",
    servingSize: 400.0,
    calorie: 12.0,
    carbohydrate: 0.87,
    protein: 0.65,
    fat: 0.61,
    sodium: 168.0,
    sugar: 0.27
  },
  {
    foodCode: "D106-275000000-0001",
    foodName: "된장찌개",
    servingSize: 200.0,
    calorie: 46.0,
    carbohydrate: 4.44,
    protein: 3.38,
    fat: 1.63,
    sodium: 318.0,
    sugar: 0.0
  },
  {
    foodCode: "D106-266100000-0001",
    foodName: "김치찌개_돼지고기",
    servingSize: 200.0,
    calorie: 45.0,
    carbohydrate: 1.04,
    protein: 4.25,
    fat: 2.71,
    sodium: 207.0,
    sugar: 0.05
  },
  {
    foodCode: "D108-386000000-0001",
    foodName: "소불고기",
    servingSize: 200.0,
    calorie: 170.0,
    carbohydrate: 4.26,
    protein: 16.41,
    fat: 9.66,
    sodium: 418.0,
    sugar: 3.24
  },
  {
    foodCode: "D110-465000000-0001",
    foodName: "돼지고기볶음(제육볶음)",
    servingSize: 250.0,
    calorie: 195.0,
    carbohydrate: 4.73,
    protein: 12.15,
    fat: 14.19,
    sodium: 501.0,
    sugar: 0.38
  },
  {
    foodCode: "D308-388000000-0001",
    foodName: "연어구이",
    servingSize: 100.0,
    calorie: 234.0,
    carbohydrate: 0.2,
    protein: 24.78,
    fat: 14.94,
    sodium: 158.0,
    sugar: 0.55
  },
  {
    foodCode: "D111-517000000-0001",
    foodName: "두부조림",
    servingSize: 50.0,
    calorie: 143.0,
    carbohydrate: 4.4,
    protein: 9.64,
    fat: 9.66,
    sodium: 161.0,
    sugar: 3.64
  },
  {
    foodCode: "D309-433000000-0001",
    foodName: "스크램블드에그",
    servingSize: 100.0,
    calorie: 149.0,
    carbohydrate: 1.61,
    protein: 9.99,
    fat: 10.98,
    sodium: 145.0,
    sugar: 1.39
  },
  {
    foodCode: "D113-586000000-0001",
    foodName: "시금치나물",
    servingSize: 50.0,
    calorie: 69.0,
    carbohydrate: 3.36,
    protein: 3.74,
    fat: 4.46,
    sodium: 136.0,
    sugar: 0.1
  },
  {
    foodCode: "D113-597000000-0001",
    foodName: "콩나물무침",
    servingSize: 50.0,
    calorie: 69.0,
    carbohydrate: 3.2,
    protein: 3.86,
    fat: 4.54,
    sodium: 387.0,
    sugar: 0.5
  },
  {
    foodCode: "D110-477000000-0001",
    foodName: "브로콜리볶음",
    servingSize: 90.0,
    calorie: 51.0,
    carbohydrate: 5.53,
    protein: 4.42,
    fat: 1.28,
    sodium: 94.0,
    sugar: 1.42
  },
  {
    foodCode: "D315-670000000-0001",
    foodName: "배추김치",
    servingSize: 100.0,
    calorie: 38.0,
    carbohydrate: 6.49,
    protein: 1.98,
    fat: 0.43,
    sodium: 551.0,
    sugar: 2.4
  },
  {
    foodCode: "D114-640080000-0001",
    foodName: "샐러드_닭가슴살",
    servingSize: 150.0,
    calorie: 135.0,
    carbohydrate: 5.36,
    protein: 7.17,
    fat: 9.49,
    sodium: 88.0,
    sugar: 3.25
  },
  {
    foodCode: "D107-128180000-0001",
    foodName: "고구마_찐고구마",
    servingSize: 200.0,
    calorie: 139.0,
    carbohydrate: 32.47,
    protein: 1.67,
    fat: 0.24,
    sodium: 10.0,
    sugar: 16.32
  },
  {
    foodCode: "D110-467000000-0001",
    foodName: "떡볶이",
    servingSize: 180.0,
    calorie: 144.0,
    carbohydrate: 25.96,
    protein: 3.51,
    fat: 2.96,
    sodium: 391.0,
    sugar: 4.4
  }
];

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