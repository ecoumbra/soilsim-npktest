// УВАГА: бібліографію заповнює викладач/автор вручну. Не додавати вигадані DOI, авторів чи сторінки.
export interface Reference {
  id: string;
  kind: 'textbook' | 'manual' | 'standard' | 'paper' | 'web';
  status: 'todo' | 'secondary' | 'verified';
  note: string;
  url?: string;
}

export const references: Reference[] = [
  {
    id: 'ref-analytical',
    kind: 'textbook',
    status: 'verified',
    note: 'Кичкирук О. Ю., Шляніна А. В., Кусяк Н. В. Аналітична хімія : навчальний посібник. Житомир : ЖДУ імені Івана Франка, ПП «Євро-Волинь», 2022. 240 с. (Частина І «Якісний аналіз», с. 7–86 — аналіз катіонів І–ІІ груп та аніонів І–ІІІ груп).',
    url: 'https://eprints.zu.edu.ua/34306/1/%D0%9D%D0%B0%D0%B2%D1%87%20%D0%BF%D0%BE%D1%81%D1%96%D0%B1%D0%BD%D0%B8%D0%BA%20%D0%90%D0%BD%D0%B0%D0%BB%D1%96%D1%82%D0%B8%D1%87%D0%BD%D0%B0%20_2022.pdf',
  },
  {
    id: 'ref-qualitative',
    kind: 'manual',
    status: 'verified',
    note: "Том'юк Б. П. Агрохімічний аналіз : Навч. посіб. / Б. П. Том'юк, В. А. Нікорич; Чернів. держ. ун-т ім. Ю. Федьковича. – Чернівці : Рута, 2000. – 92 с. (Лабораторна робота з якісного хімічного аналізу мінеральних добрив).",
  },
  {
    id: 'ref-agrochem',
    kind: 'textbook',
    status: 'verified',
    note: 'Чорний С. Г. Основи агрономічної хімії : навчальний посібник. Миколаїв : МНАУ, 2020. 284 с. (Розділи 10–16, с. 104–194 — класифікація, хімічний склад та властивості мінеральних добрив).',
    url: 'https://dspace.mnau.edu.ua/jspui/bitstream/123456789/10074/1/%D0%9E%D1%81%D0%BD%D0%BE%D0%B2%D0%B8_%D0%B0%D0%B3%D1%80%D0%BE%D1%85%D1%96%D0%BC%D1%96%D1%97.pdf',
  },
  {
    id: 'ref-agrochem-hospodarenko',
    kind: 'textbook',
    status: 'verified',
    note: 'Господаренко Г. М. Агрохімія : підручник. Київ : ТОВ «СІК ГРУП УКРАЇНА», 2018. 560 с.; Геркіял О. М., Господаренко Г. М., Коларьков Ю. В. Агрохімія : навчальний посібник. Умань, 2008. 300 с.',
  },
  {
    id: 'ref-fertilizer-practicum',
    kind: 'manual',
    status: 'verified',
    note: 'Мінеральні добрива: класифікація, властивості, застосування (Навчально-методичний посібник) : [текст] / Хацевич О. М., Джус Р. Р. / Факультет природничих наук; Прикарпатський національний університет імені Василя Стефаника. – Івано-Франківськ, 2018. – 80 с. (Розділи 2 і 4 — якісний та кількісний аналіз добрив).',
    url: 'https://kc.cnu.edu.ua/wp-content/uploads/sites/11/2021/02/Practicum-Mineral-Fertilizers.pdf',
  },
  {
    id: 'ref-fertilizer-tech',
    kind: 'textbook',
    status: 'verified',
    note: 'Волошин М. Д., Черненко Я. М., Іванченко А. В., Олійник М. А. Технологія неорганічних речовин. Частина 3. Мінеральні добрива : навчальний посібник. Дніпродзержинськ : ДДТУ, 2016. 354 с. (Фізико-хімічні властивості та технологія виробництва карбаміду, селітр, амоній сульфату, суперфосфатів та амофосу).',
    url: 'https://www.dstu.dp.ua/Portal/Data/5/7/z2-7-b6.pdf',
  },
  {
    id: 'ref-fertilizer-methods',
    kind: 'standard',
    status: 'verified',
    note: 'Національні стандарти України на методи аналізу добрив: ДСТУ EN 15475:2015, ДСТУ EN 15476:2015, ДСТУ EN 15478:2015, ДСТУ 7879:2015 (форми азоту); ДСТУ EN 15956:2015, ДСТУ EN 15958:2015 (фосфор); ДСТУ EN 15477:2015 (калій); ДСТУ EN 15962:2015 (мікроелементи); ДСТУ 7911:2015 (органо-мінеральні добрива).',
  },
  // ---- джерела для тесту «Фізичні властивості» ----
  {
    id: 'ref-crh-adams',
    kind: 'web',
    status: 'secondary',
    note: 'Critical relative humidity (Wikipedia) — довідкова зведена таблиця значень критичної відносної вологості (CRH) для мінеральних солей і добрив при 30 °C.',
    url: 'https://en.wikipedia.org/wiki/Critical_relative_humidity',
  },
  {
    id: 'ref-solubility-table',
    kind: 'web',
    status: 'secondary',
    note: 'Solubility table (Wikipedia) — довідкова компіляція розчинності неорганічних солей у воді при 20 °C.',
    url: 'https://en.wikipedia.org/wiki/Solubility_table',
  },
  {
    id: 'ref-map-ph',
    kind: 'web',
    status: 'secondary',
    note: 'Nutrient Source Specifics: Monoammonium phosphate (MAP) — pH розчину 4–4,5, розчинність ≈ 370 г/л (20 °C).',
    url: 'https://www.cropnutrition.com/resource-library/monoammonium-phosphate-map/',
  },
  {
    id: 'ref-dap-ph',
    kind: 'web',
    status: 'secondary',
    note: 'Nutrient Source Specifics: Diammonium phosphate (DAP) — pH розчину 7,5–8.',
    url: 'https://www.cropnutrition.com/resource-library/diammonium-phosphate',
  },
  {
    id: 'ref-colour',
    kind: 'web',
    status: 'secondary',
    note: 'Colorants in the Fertilizer Industry, Fertilizer International 510 (Arkema/ArrMaz) — колір суперфосфату і DAP залежить від сировини.',
    url: 'https://specialtysurfactants.arkema.com/en/media/news/non-global/sites/specialitysurfactants/fertilizer-international-publication-spotlights-jervis-bao/',
  },
  {
    id: 'ref-crh-conflict',
    kind: 'web',
    status: 'todo',
    note: 'УВАГА: для MAP і DAP значення CRH у джерелах суперечать одне одному (91,6 % і 82,5 % проти 70–75 % і <70 % у технічному листку Incitec Pivot). У числових завданнях не використовуються до уточнення.',
    url: 'https://www.incitecpivotfertilisers.com.au/siteassets/assets/fact-sheets/18368---fact-sheet---map-and-dap.pdf',
  },
];