// User profile: name, age group and goals. Age shapes the AI's tone, quiz
// difficulty, suggested questions, recommended plans and the first book to learn.
import { load, save } from './store.js';
import { LANG } from './i18n.js';

export const L = o => (o && (o[LANG] ?? o.en)) ?? '';

export const AGES = [
  { id: 'little', kids: true, preReader: true, level: 1, book: 40, plans: ['jesus-kids7', 'heroes10'],
    range: { en: 'Pre-K – 1st grade', fr: 'Maternelle – CP', pt: 'Pré-escola – 1º ano', es: 'Preescolar – 1.º' },
    name: { en: 'Little ones', fr: 'Tout-petits', pt: 'Pequeninos', es: 'Pequeñitos' },
    tone: 'The reader is a small child aged 4 to 6 who may not read yet; answers will be read aloud. Use very short sentences and the simplest words, a warm and joyful tone, and focus on God’s love and Jesus. Avoid any frightening details.' },
  { id: 'kids', kids: true, level: 1, book: 31, plans: ['jesus-kids7', 'heroes10', 'mark16'],
    range: { en: '2nd – 3rd grade', fr: 'CE1 – CE2', pt: '2º – 3º ano', es: '2.º – 3.º' },
    name: { en: 'Kids', fr: 'Enfants', pt: 'Crianças', es: 'Niños' },
    tone: 'The reader is a child aged 7 to 8. Use very simple words and short sentences, a warm and encouraging tone, and concrete examples from home and school. Avoid graphic details.' },
  { id: 'preteen', level: 1, book: 31, plans: ['heroes10', 'mark16', 'proverbs31'],
    range: { en: '4th – 6th grade', fr: 'CM1 – 6e', pt: '4º – 6º ano', es: '4.º – 6.º' },
    name: { en: 'Preteens', fr: 'Préados', pt: 'Pré-adolescentes', es: 'Preadolescentes' },
    tone: 'The reader is 9 to 12 years old. Use clear, simple language, relate to friends, family and school, and keep answers short and encouraging.' },
  { id: 'teen', level: 2, book: 63, plans: ['identity7', 'anxiety7', 'john21'],
    range: { en: '13–17', fr: '13–17', pt: '13–17', es: '13–17' },
    name: { en: 'Teens', fr: 'Ados', pt: 'Adolescentes', es: 'Adolescentes' },
    tone: 'The reader is a teenager (13 to 17). Be honest and relatable — friendships, identity, pressure, doubts, social media — and never preachy. Keep it concise.' },
  { id: 'young', level: 2, book: 49, plans: ['purpose7', 'john21', 'nt90'],
    range: { en: '18–25', fr: '18–25', pt: '18–25', es: '18–25' },
    name: { en: 'Young adults', fr: 'Jeunes adultes', pt: 'Jovens adultos', es: 'Jóvenes adultos' },
    tone: 'The reader is a young adult (18 to 25). Engage thoughtfully with purpose, calling, relationships, work and doubt. Offer depth and practical next steps.' },
  { id: 'adult', level: 3, book: 58, plans: ['bible365', 'romans16', 'prayer7'],
    range: { en: '26–59', fr: '26–59', pt: '26–59', es: '26–59' },
    name: { en: 'Adults', fr: 'Adultes', pt: 'Adultos', es: 'Adultos' },
    tone: 'The reader is an adult. Give depth: historical and literary context, original-language insight when confident, and practical application for family, work and suffering.' },
  { id: 'senior', level: 2, book: 7, plans: ['psalms30', 'hope7', 'gospels40'],
    range: { en: '60+', fr: '60+', pt: '60+', es: '60+' },
    name: { en: 'Seniors', fr: 'Seniors', pt: 'Idosos', es: 'Mayores' },
    tone: 'The reader is 60 or older. Be respectful, clear and warm. Questions often touch hope, heaven, legacy, health, grief and passing faith to the next generation.' },
];
export const ageById = id => AGES.find(a => a.id === id) || AGES[4];

export const GOALS = [
  { id: 'understand', icon: 'search', name: { en: 'Understand the Bible', fr: 'Comprendre la Bible', pt: 'Entender a Bíblia', es: 'Entender la Biblia' } },
  { id: 'habit', icon: 'flame', name: { en: 'Build a daily habit', fr: 'Prendre une habitude quotidienne', pt: 'Criar um hábito diário', es: 'Crear un hábito diario' } },
  { id: 'memorize', icon: 'brain', name: { en: 'Memorize verses', fr: 'Mémoriser des versets', pt: 'Memorizar versículos', es: 'Memorizar versículos' } },
  { id: 'answers', icon: 'quiz', name: { en: 'Find answers to my questions', fr: 'Trouver des réponses à mes questions', pt: 'Achar respostas para minhas perguntas', es: 'Encontrar respuestas a mis preguntas' } },
  { id: 'teach', icon: 'people', name: { en: 'Teach my family or group', fr: 'Enseigner ma famille ou mon groupe', pt: 'Ensinar minha família ou grupo', es: 'Enseñar a mi familia o grupo' } },
];

const DEFAULT = { done: false, name: '', age: '', goals: [], minutes: 10, created: 0 };
export function getProfile() { return { ...DEFAULT, ...load('profile', {}) }; }
export function setProfile(patch) { const p = { ...getProfile(), ...patch }; save('profile', p); window.dispatchEvent(new Event('lamp:data')); return p; }
export const currentAge = () => ageById(getProfile().age);
export const isKids = () => !!currentAge().kids && !!getProfile().age;
export const isPreReader = () => !!currentAge().preReader && !!getProfile().age;

// Questions people of each age often ask, with verses that speak to them.
export const AGE_QUESTIONS = {
  little: null,
  kids: [
    { q: { en: 'Who made God?', fr: 'Qui a créé Dieu ?', pt: 'Quem criou Deus?', es: '¿Quién hizo a Dios?' }, refs: ['Psalms 90:2', 'Revelation 1:8'] },
    { q: { en: 'Does God hear my prayers?', fr: 'Dieu entend-il mes prières ?', pt: 'Deus ouve minhas orações?', es: '¿Dios escucha mis oraciones?' }, refs: ['1 John 5:14', 'Psalms 34:15'] },
    { q: { en: 'Is Jesus always with me?', fr: 'Jésus est-il toujours avec moi ?', pt: 'Jesus está sempre comigo?', es: '¿Jesús está siempre conmigo?' }, refs: ['Matthew 28:20', 'Joshua 1:9'] },
    { q: { en: 'What do I do when I feel scared?', fr: 'Que faire quand j’ai peur ?', pt: 'O que fazer quando sinto medo?', es: '¿Qué hago cuando tengo miedo?' }, refs: ['Psalms 56:3', 'Isaiah 41:10'] },
    { q: { en: 'Why should I obey my parents?', fr: 'Pourquoi obéir à mes parents ?', pt: 'Por que obedecer aos meus pais?', es: '¿Por qué obedecer a mis padres?' }, refs: ['Ephesians 6:1-3', 'Colossians 3:20'] },
    { q: { en: 'What is heaven like?', fr: 'Comment est le ciel ?', pt: 'Como é o céu?', es: '¿Cómo es el cielo?' }, refs: ['Revelation 21:4', 'John 14:2-3'] },
  ],
  preteen: [
    { q: { en: 'How can I be a good friend?', fr: 'Comment être un bon ami ?', pt: 'Como ser um bom amigo?', es: '¿Cómo puedo ser un buen amigo?' }, refs: ['Proverbs 17:17', 'John 15:12-13'] },
    { q: { en: 'What if someone is mean to me?', fr: 'Et si quelqu’un est méchant avec moi ?', pt: 'E se alguém for mau comigo?', es: '¿Y si alguien es malo conmigo?' }, refs: ['Romans 12:17-21', 'Matthew 5:44'] },
    { q: { en: 'Does God care about my problems at school?', fr: 'Dieu se soucie-t-il de mes problèmes à l’école ?', pt: 'Deus se importa com meus problemas na escola?', es: '¿A Dios le importan mis problemas en la escuela?' }, refs: ['1 Peter 5:7', 'Philippians 4:6-7'] },
    { q: { en: 'Why do I have to forgive?', fr: 'Pourquoi dois-je pardonner ?', pt: 'Por que tenho que perdoar?', es: '¿Por qué tengo que perdonar?' }, refs: ['Ephesians 4:32', 'Matthew 6:14-15'] },
    { q: { en: 'How do I know the Bible is true?', fr: 'Comment savoir que la Bible est vraie ?', pt: 'Como sei que a Bíblia é verdadeira?', es: '¿Cómo sé que la Biblia es verdad?' }, refs: ['2 Timothy 3:16', '2 Peter 1:16'] },
  ],
  teen: [
    { q: { en: 'How do I know God is real?', fr: 'Comment savoir que Dieu existe ?', pt: 'Como sei que Deus é real?', es: '¿Cómo sé que Dios es real?' }, refs: ['Romans 1:20', 'Psalms 19:1', 'Hebrews 11:6'] },
    { q: { en: 'What does the Bible say about anxiety?', fr: 'Que dit la Bible sur l’anxiété ?', pt: 'O que a Bíblia diz sobre ansiedade?', es: '¿Qué dice la Biblia sobre la ansiedad?' }, refs: ['Philippians 4:6-7', 'Matthew 6:34', '1 Peter 5:7'] },
    { q: { en: 'Who am I, really?', fr: 'Qui suis-je vraiment ?', pt: 'Quem eu sou, de verdade?', es: '¿Quién soy realmente?' }, refs: ['Psalms 139:14', 'Ephesians 2:10', '1 Peter 2:9'] },
    { q: { en: 'How should I handle peer pressure?', fr: 'Comment résister à la pression des autres ?', pt: 'Como lidar com a pressão dos amigos?', es: '¿Cómo manejo la presión de grupo?' }, refs: ['Romans 12:2', 'Proverbs 13:20', '1 Corinthians 15:33'] },
    { q: { en: 'What does the Bible say about dating?', fr: 'Que dit la Bible sur les relations amoureuses ?', pt: 'O que a Bíblia diz sobre namoro?', es: '¿Qué dice la Biblia sobre el noviazgo?' }, refs: ['1 Corinthians 13:4-7', '2 Corinthians 6:14', 'Song of Solomon 2:7'] },
    { q: { en: 'Is it okay to have doubts?', fr: 'Est-ce normal d’avoir des doutes ?', pt: 'Tudo bem ter dúvidas?', es: '¿Está bien tener dudas?' }, refs: ['Mark 9:24', 'Jude 1:22', 'John 20:27-29'] },
  ],
  young: [
    { q: { en: 'How do I find God’s will for my life?', fr: 'Comment trouver la volonté de Dieu pour ma vie ?', pt: 'Como encontrar a vontade de Deus para minha vida?', es: '¿Cómo encuentro la voluntad de Dios para mi vida?' }, refs: ['Proverbs 3:5-6', 'Romans 12:1-2', 'Micah 6:8'] },
    { q: { en: 'What does the Bible say about work and career?', fr: 'Que dit la Bible sur le travail et la carrière ?', pt: 'O que a Bíblia diz sobre trabalho e carreira?', es: '¿Qué dice la Biblia sobre el trabajo y la carrera?' }, refs: ['Colossians 3:23-24', 'Proverbs 16:3', 'Ecclesiastes 9:10'] },
    { q: { en: 'How do I choose who to marry?', fr: 'Comment choisir la personne à épouser ?', pt: 'Como escolher com quem casar?', es: '¿Cómo elijo con quién casarme?' }, refs: ['Proverbs 31:30', 'Ephesians 5:25', '2 Corinthians 6:14'] },
    { q: { en: 'Why does God allow suffering?', fr: 'Pourquoi Dieu permet-il la souffrance ?', pt: 'Por que Deus permite o sofrimento?', es: '¿Por qué Dios permite el sufrimiento?' }, refs: ['Romans 8:18', 'Romans 8:28', 'James 1:2-4'] },
    { q: { en: 'How do I handle money well?', fr: 'Comment bien gérer l’argent ?', pt: 'Como cuidar bem do dinheiro?', es: '¿Cómo administro bien el dinero?' }, refs: ['Proverbs 22:7', 'Matthew 6:19-21', '1 Timothy 6:10'] },
    { q: { en: 'How can I grow when I feel far from God?', fr: 'Comment grandir quand je me sens loin de Dieu ?', pt: 'Como crescer quando me sinto longe de Deus?', es: '¿Cómo crecer cuando me siento lejos de Dios?' }, refs: ['James 4:8', 'Psalms 42:11', 'Luke 15:20'] },
  ],
  adult: [
    { q: { en: 'How do I raise my children in faith?', fr: 'Comment élever mes enfants dans la foi ?', pt: 'Como criar meus filhos na fé?', es: '¿Cómo crío a mis hijos en la fe?' }, refs: ['Deuteronomy 6:6-7', 'Proverbs 22:6', 'Ephesians 6:4'] },
    { q: { en: 'What does the Bible say about marriage?', fr: 'Que dit la Bible sur le mariage ?', pt: 'O que a Bíblia diz sobre o casamento?', es: '¿Qué dice la Biblia sobre el matrimonio?' }, refs: ['Genesis 2:24', 'Ephesians 5:21-33', 'Colossians 3:18-19'] },
    { q: { en: 'How do I trust God in hard times?', fr: 'Comment faire confiance à Dieu dans les épreuves ?', pt: 'Como confiar em Deus nos tempos difíceis?', es: '¿Cómo confío en Dios en tiempos difíciles?' }, refs: ['Isaiah 43:2', '2 Corinthians 4:16-18', 'Psalms 46:1'] },
    { q: { en: 'How do I forgive someone who hurt me deeply?', fr: 'Comment pardonner à quelqu’un qui m’a profondément blessé ?', pt: 'Como perdoar alguém que me feriu muito?', es: '¿Cómo perdono a alguien que me hirió profundamente?' }, refs: ['Colossians 3:13', 'Matthew 18:21-22', 'Genesis 50:20'] },
    { q: { en: 'How do I deal with stress and burnout?', fr: 'Comment gérer le stress et l’épuisement ?', pt: 'Como lidar com estresse e esgotamento?', es: '¿Cómo manejo el estrés y el agotamiento?' }, refs: ['Matthew 11:28-30', 'Psalms 23:1-3', 'Mark 6:31'] },
    { q: { en: 'What is the gospel, in a nutshell?', fr: 'Qu’est-ce que l’Évangile, en résumé ?', pt: 'O que é o evangelho, em resumo?', es: '¿Qué es el evangelio, en resumen?' }, refs: ['1 Corinthians 15:3-4', 'John 3:16', 'Ephesians 2:8-9'] },
  ],
  senior: [
    { q: { en: 'What does the Bible say about heaven?', fr: 'Que dit la Bible sur le ciel ?', pt: 'O que a Bíblia diz sobre o céu?', es: '¿Qué dice la Biblia sobre el cielo?' }, refs: ['John 14:1-3', 'Revelation 21:1-4', 'Philippians 1:21-23'] },
    { q: { en: 'How do I pass my faith to my grandchildren?', fr: 'Comment transmettre ma foi à mes petits-enfants ?', pt: 'Como passar minha fé aos meus netos?', es: '¿Cómo transmito mi fe a mis nietos?' }, refs: ['Psalms 71:18', '2 Timothy 1:5', 'Psalms 78:4'] },
    { q: { en: 'How do I find comfort in grief?', fr: 'Comment trouver du réconfort dans le deuil ?', pt: 'Como encontrar consolo no luto?', es: '¿Cómo encuentro consuelo en el duelo?' }, refs: ['Psalms 34:18', '1 Thessalonians 4:13-14', 'Matthew 5:4'] },
    { q: { en: 'Does God still have a purpose for me?', fr: 'Dieu a-t-il encore un plan pour moi ?', pt: 'Deus ainda tem um propósito para mim?', es: '¿Dios todavía tiene un propósito para mí?' }, refs: ['Psalms 92:14', 'Isaiah 46:4', 'Philippians 1:6'] },
    { q: { en: 'How do I face illness with faith?', fr: 'Comment affronter la maladie avec foi ?', pt: 'Como enfrentar a doença com fé?', es: '¿Cómo enfrento la enfermedad con fe?' }, refs: ['2 Corinthians 12:9', 'James 5:14-15', 'Psalms 73:26'] },
    { q: { en: 'What will my resurrection body be like?', fr: 'Comment sera mon corps ressuscité ?', pt: 'Como será meu corpo ressuscitado?', es: '¿Cómo será mi cuerpo resucitado?' }, refs: ['1 Corinthians 15:42-44', 'Philippians 3:20-21'] },
  ],
};
AGE_QUESTIONS.little = AGE_QUESTIONS.kids;
