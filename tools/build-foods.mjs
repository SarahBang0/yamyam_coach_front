// 음식 DB 변환: js/data/foods.csv (식약처 음식 DB, 탭 구분) → js/data/foods.js
//
// 실행 (프로젝트 폴더에서):  node tools/build-foods.mjs
// foods.csv를 새로 받으면 다시 실행하면 된다. 화면 코드는 고칠 필요 없음.
//
// 만들어지는 FOODS 항목 (영양값은 100g 또는 100ml 기준):
//   { foodCode, foodName, category, servingSize, servingUnit, calorie, carbohydrate, protein, fat, sodium, sugar }
//   - category: 식품대분류명 (밥류, 국 및 탕류, …) → 추천식단의 역할 나누기에 쓴다
//   - servingSize / servingUnit: 1회 제공량 (식품중량 열, 예: 230 / 'g')
//   - 빈 칸('', '-')은 0으로 둔다
//   - 같은 이름은 하나만 남긴다 (g 단위 일반 1인분 우선)

import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'js/data/foods.csv';
const OUT = 'js/data/foods.js';

// CSV 열 이름 → 우리 필드 이름
const COLUMNS = {
  foodCode: '식품코드',
  foodName: '식품명',
  category: '식품대분류명',
  basis: '영양성분함량기준량',
  calorie: '에너지(kcal)',
  carbohydrate: '탄수화물(g)',
  protein: '단백질(g)',
  fat: '지방(g)',
  sodium: '나트륨(mg)',
  sugar: '당류(g)',
  serving: '식품중량',
};
const NUTRIENTS = ['calorie', 'carbohydrate', 'protein', 'fat', 'sodium', 'sugar'];

const lines = readFileSync(SRC, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
const header = lines[0].split('\t');
const at = Object.fromEntries(
  Object.entries(COLUMNS).map(([key, name]) => {
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`foods.csv에 '${name}' 열이 없습니다.`);
    return [key, index];
  }),
);

const toNumber = (text) => {
  const n = Number(String(text ?? '').trim());
  return Number.isFinite(n) ? n : 0;
};
// '230g' → [230, 'g'], '250ml' → [250, 'ml'], 해당없음·빈칸 → [100, 기준량 단위]
const parseServing = (text, basisUnit) => {
  const m = String(text ?? '').trim().match(/^([\d.]+)\s*(g|ml)$/i);
  return m ? [Number(m[1]), m[2].toLowerCase()] : [100, basisUnit];
};
// 생채ᆞ무침류처럼 옛 한글 가운뎃점이 섞인 분류 이름을 하나로 맞춘다
const cleanCategory = (text) => text.trim().replace(/ᆞ/g, '·');

const rows = lines.slice(1).map((line) => {
  const c = line.split('\t');
  const basisUnit = /ml/i.test(c[at.basis]) ? 'ml' : 'g';
  const [servingSize, servingUnit] = parseServing(c[at.serving], basisUnit);
  return [
    c[at.foodCode].trim(),
    c[at.foodName].trim(),
    cleanCategory(c[at.category]),
    servingSize,
    servingUnit,
    ...NUTRIENTS.map((key) => toNumber(c[at[key]])),
  ];
});

// 같은 이름의 음식이 출처별로 여러 번 들어 있다 (예: 김밥 230g / 급식용 168ml / 330ml)
// 이름마다 하나만 남긴다: g 단위(일반 1인분) 우선, 그다음 식품코드 앞자리 순서(일반 음식 D1·D3 먼저)
const SOURCE_ORDER = ['D1', 'D3', 'D2', 'D7', 'D4', 'D5', 'D6'];
const priority = (row) => (row[4] === 'g' ? 0 : 100) + Math.max(0, SOURCE_ORDER.indexOf(row[0].slice(0, 2)));
const byName = new Map();
rows.forEach((row) => {
  const kept = byName.get(row[1]);
  if (!kept || priority(row) < priority(kept)) byName.set(row[1], row);
});
const uniqueRows = [...byName.values()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`같은 이름 정리: ${rows.length}개 → ${uniqueRows.length}개`);

// 파일 크기를 줄이려고 객체 대신 배열로 저장하고, 불러올 때 객체로 바꾼다
const FIELDS = ['foodCode', 'foodName', 'category', 'servingSize', 'servingUnit', ...NUTRIENTS];
const body = `// 자동 생성 파일: 직접 고치지 말고 tools/build-foods.mjs로 다시 만드세요.
// 원본: ${SRC} (${rows.length}개 중 같은 이름을 하나씩만 남긴 ${uniqueRows.length}개, 영양값은 100g 또는 100ml 기준)

const FIELDS = ${JSON.stringify(FIELDS)};
const ROWS = [
${uniqueRows.map((r) => JSON.stringify(r)).join(',\n')}
];

export const FOODS = ROWS.map((row) => Object.fromEntries(FIELDS.map((field, i) => [field, row[i]])));
`;
writeFileSync(OUT, body);
console.log(`${OUT}: ${uniqueRows.length}개 음식, ${(Buffer.byteLength(body) / 1024 / 1024).toFixed(2)}MB`);
