export type Lang = 'uk' | 'en';
// Хімічні формули не перекладаються. Хімічні тексти в src/data/ поки що українською (TODO: EN — етап 8).
export const dict = {
  uk: {
    tagline: 'Цифрова агрохімія: глибше розуміння, ефективніші рішення', subtitle: 'Лабораторний аналіз мінеральних добрив', course: 'Лабораторний практикум з курсу «Агрохімія»', theory: 'Теорія', lab: 'Віртуальна лабораторія', ident: 'Ідентифікація добрив', quiz: 'Перевірка знань',
    safety: 'Правила безпеки', safetyText: 'Усі експерименти віртуальні.\n• Конц. H₂SO₄, луги, розчин NH₃ — їдкі.\n• Солі барію, срібла та кобальту токсичні.\n• Нагрівання — лише під кутом, отвором від людей.\nУ реальній лабораторії — тільки під наглядом викладача й у витяжній шафі.',
    sample: 'Зразок №', newSample: 'Новий невідомий зразок', take: 'Взяти пробу', heat: 'Нагріти', replay: 'Показати реакцію повторно', clean: 'Чиста пробірка',
    journal: 'Лабораторний журнал', empty: 'Журнал порожній — проведіть перше дослідження.', clear: 'Очистити журнал', test: 'Дослідження', obs: 'Спостереження', result: 'Результат',
    positive: 'позитивний', negative: 'негативний', uncertain: 'невизначений', toIdent: 'До ідентифікації', toLab: 'До лабораторії', toExperiment: 'До експерименту',
    answer: 'Ваш висновок', check: 'Перевірити', progress: 'Проведено тестів',
    insufficient: 'Наявних результатів недостатньо для однозначної ідентифікації зразка. Проведіть додаткову якісну реакцію.',
    contradiction: 'Виявлено суперечність між результатами досліджень. Перевірте чистоту пробірки, послідовність операцій і можливі аналітичні перешкоди.',
    unique: 'Результати відповідають одному добриву з бази.',
    indistinguishable: 'Результати відповідають кільком добривам з однаковим йонним складом; цими реакціями їх не розрізнити (MAP і DAP відрізняються pH розчину).',
    correct: 'Правильно!', acceptable: 'Прийнятно за результатами тестів, але справжній зразок —', wrong: 'Неправильно. Справжній зразок —',
    theoryIntro: 'Якісний аналіз відповідає на питання «що міститься у зразку?», кількісний — «скільки?». Реакція виявляє йон, а не добриво: добриво встановлюють за сукупністю результатів.',
    modeGuided: 'Покрокове навчання', modeFree: 'Самостійний режим', target: 'Що перевіряємо', noTarget: '— не обрано —', stepsTitle: 'Протокол', protocolDone: 'Протокол виконано. Запишіть спостереження; для нового тесту візьміть чисту пробірку.',
    nextStep: 'Наступний крок', why: 'Навіщо', freeHint: 'Самостійний режим: підказок немає. Оберіть реактив самі; якщо вказано йон, програма перевірить придатність реактиву.', unknownSample: 'невідоме добриво', newTube: 'Нова пробірка', labChem: 'Якісні реакції', help: 'Довідка', report: 'Звіт', repeat: 'Повторити', physDone: 'Дослідження завершено', labPhys: 'Фізичні властивості', quizChem: 'Тест 1. Якісні реакції', quizPhys: 'Тест 2. Фізичні властивості добрив', quizStart: 'Почати', quizBack: 'До вибору тесту', goggles: 'Окуляри обов’язкові', pour: '🗑 Вилити у відходи',
    quizSoon: 'Модуль контролю знань (4 типи завдань, 10 балів) — Етап 7 у docs/PROGRESS.md.',
  },
  en: {
    tagline: 'Digital agrochemistry: deeper understanding, more effective solutions', subtitle: 'Laboratory Analysis of Mineral Fertilizers', course: 'Laboratory practicum for the course “Agrochemistry”', theory: 'Theory', lab: 'Virtual lab', ident: 'Identification', quiz: 'Knowledge check',
    safety: 'Safety rules', safetyText: 'All experiments are virtual.\n• Conc. H₂SO₄, alkalis and ammonia solution are corrosive.\n• Barium, silver and cobalt compounds are toxic.\n• Heat tubes at an angle, mouth away from people.\nIn a real lab — only under instructor supervision in a fume hood.',
    sample: 'Sample #', newSample: 'New unknown sample', take: 'Take sample', heat: 'Heat', replay: 'Replay reaction', clean: 'Clean tube',
    journal: 'Lab journal', empty: 'Journal is empty — run your first test.', clear: 'Clear journal', test: 'Test', obs: 'Observation', result: 'Result',
    positive: 'positive', negative: 'negative', uncertain: 'uncertain', toIdent: 'Go to identification', toLab: 'Back to lab', toExperiment: 'Open experiment',
    answer: 'Your conclusion', check: 'Check', progress: 'Tests done',
    insufficient: 'The results are not sufficient to identify the sample unambiguously. Run an additional qualitative reaction.',
    contradiction: 'The results contradict each other. Check tube cleanliness, operation order and possible analytical interferences.',
    unique: 'The results match exactly one fertilizer in the database.',
    indistinguishable: 'The results match several fertilizers with identical ionic composition; these tests cannot tell them apart (MAP and DAP differ in solution pH).',
    correct: 'Correct!', acceptable: 'Acceptable given the tests, but the actual sample is', wrong: 'Incorrect. The actual sample is',
    theoryIntro: 'Qualitative analysis answers “what is in the sample?”, quantitative — “how much?”. A reaction detects an ion, not a fertilizer: the fertilizer is established from the combined results.',
    modeGuided: 'Guided learning', modeFree: 'Independent mode', target: 'Testing for', noTarget: '— none —', stepsTitle: 'Protocol', protocolDone: 'Protocol complete. Record your observation; take a clean tube for the next test.',
    nextStep: 'Next step', why: 'Why', freeHint: 'Independent mode: no hints. Choose reagents yourself; if an ion is selected, the program checks the reagent is suitable.', unknownSample: 'unknown fertilizer', newTube: 'New tube', labChem: 'Qualitative reactions', help: 'Help', report: 'Report', repeat: 'Repeat', physDone: 'Investigation complete', labPhys: 'Physical properties', quizChem: 'Test 1. Qualitative reactions', quizPhys: 'Test 2. Physical properties of fertilizers', quizStart: 'Start', quizBack: 'Back to test selection', goggles: 'Goggles required', pour: '🗑 Pour into waste',
    quizSoon: 'Knowledge-check module (4 task types, 10 points) — Stage 7 in docs/PROGRESS.md.',
  },
} as const;
export type Dict = { [K in keyof typeof dict.uk]: string };