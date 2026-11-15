// Reading plans. Book plans are generated (chapters spread evenly over the days);
// topical plans list passages per day. Titles are in four languages.
import { BOOKS } from './data/books.js';
import { L } from './profile.js';

function seq(from, to, days) {
  const chs = [];
  for (let b = from; b <= to; b++) for (let c = 1; c <= BOOKS[b].ch; c++) chs.push(`${BOOKS[b].name} ${c}`);
  const out = [];
  for (let d = 0; d < days; d++) out.push(chs.slice(Math.round(d * chs.length / days), Math.round((d + 1) * chs.length / days)));
  return out;
}

export const PLAN_CATS = [
  { id: 'foryou', name: { en: 'For you', fr: 'Pour vous', pt: 'Para você', es: 'Para ti' } },
  { id: 'book', name: { en: 'Books', fr: 'Livres', pt: 'Livros', es: 'Libros' } },
  { id: 'topic', name: { en: 'Topics', fr: 'Thèmes', pt: 'Temas', es: 'Temas' } },
  { id: 'whole', name: { en: 'Whole Bible', fr: 'Toute la Bible', pt: 'Bíblia toda', es: 'Toda la Biblia' } },
  { id: 'family', name: { en: 'Kids & family', fr: 'Enfants et famille', pt: 'Crianças e família', es: 'Niños y familia' } },
];

export const PLANS = [
  { id: 'john21', cat: 'book', icon: 'book', color: '#c0392b', days: seq(42, 42, 21),
    title: { en: 'The Gospel of John', fr: 'L’Évangile de Jean', pt: 'O Evangelho de João', es: 'El Evangelio de Juan' },
    desc: { en: 'Meet Jesus through the eyes of “the disciple whom Jesus loved” — one chapter a day for three weeks.', fr: 'Rencontrez Jésus à travers les yeux du « disciple que Jésus aimait » — un chapitre par jour pendant trois semaines.', pt: 'Conheça Jesus pelos olhos do “discípulo amado” — um capítulo por dia durante três semanas.', es: 'Conoce a Jesús a través de los ojos del “discípulo amado” — un capítulo al día durante tres semanas.' } },
  { id: 'mark16', cat: 'book', icon: 'bolt', color: '#7a4fb3', days: seq(40, 40, 16),
    title: { en: 'Mark: Jesus in action', fr: 'Marc : Jésus en action', pt: 'Marcos: Jesus em ação', es: 'Marcos: Jesús en acción' },
    desc: { en: 'The shortest, fastest-moving Gospel in 16 days. Great for a first read.', fr: 'L’Évangile le plus court et le plus vivant, en 16 jours. Idéal pour une première lecture.', pt: 'O Evangelho mais curto e dinâmico em 16 dias. Ótimo para uma primeira leitura.', es: 'El Evangelio más corto y dinámico en 16 días. Ideal para una primera lectura.' } },
  { id: 'acts28', cat: 'book', icon: 'globe', color: '#2f8f4e', days: seq(43, 43, 28),
    title: { en: 'Acts: the church begins', fr: 'Actes : l’Église commence', pt: 'Atos: a igreja começa', es: 'Hechos: comienza la iglesia' },
    desc: { en: 'From Pentecost to Rome — how the good news spread, in 28 days.', fr: 'De la Pentecôte à Rome — comment la bonne nouvelle s’est répandue, en 28 jours.', pt: 'Do Pentecostes a Roma — como as boas-novas se espalharam, em 28 dias.', es: 'De Pentecostés a Roma — cómo se extendieron las buenas nuevas, en 28 días.' } },
  { id: 'genesis50', cat: 'book', icon: 'sun', color: '#8a6d3b', days: seq(0, 0, 50),
    title: { en: 'Genesis: in the beginning', fr: 'Genèse : au commencement', pt: 'Gênesis: no princípio', es: 'Génesis: en el principio' },
    desc: { en: 'Creation, the fall, the flood and the patriarchs — the foundation of the whole story.', fr: 'La création, la chute, le déluge et les patriarches — le fondement de toute l’histoire.', pt: 'A criação, a queda, o dilúvio e os patriarcas — a base de toda a história.', es: 'La creación, la caída, el diluvio y los patriarcas — el fundamento de toda la historia.' } },
  { id: 'romans16', cat: 'book', icon: 'scroll', color: '#1f6f8b', days: seq(44, 44, 16),
    title: { en: 'Romans: the gospel explained', fr: 'Romains : l’Évangile expliqué', pt: 'Romanos: o evangelho explicado', es: 'Romanos: el evangelio explicado' },
    desc: { en: 'Paul’s clearest explanation of grace, faith and new life — one chapter a day.', fr: 'L’explication la plus claire de Paul sur la grâce, la foi et la vie nouvelle — un chapitre par jour.', pt: 'A explicação mais clara de Paulo sobre graça, fé e vida nova — um capítulo por dia.', es: 'La explicación más clara de Pablo sobre la gracia, la fe y la vida nueva — un capítulo al día.' } },
  { id: 'psalms30', cat: 'book', icon: 'heart', color: '#a83279', days: seq(18, 18, 30),
    title: { en: 'Psalms in 30 days', fr: 'Les Psaumes en 30 jours', pt: 'Salmos em 30 dias', es: 'Salmos en 30 días' },
    desc: { en: 'Pray through all 150 psalms — songs of joy, lament, trust and praise.', fr: 'Priez les 150 psaumes — chants de joie, de plainte, de confiance et de louange.', pt: 'Ore todos os 150 salmos — cânticos de alegria, lamento, confiança e louvor.', es: 'Ora los 150 salmos — cantos de gozo, lamento, confianza y alabanza.' } },
  { id: 'proverbs31', cat: 'book', icon: 'compass', color: '#d4a017', days: seq(19, 19, 31),
    title: { en: 'Proverbs: a month of wisdom', fr: 'Proverbes : un mois de sagesse', pt: 'Provérbios: um mês de sabedoria', es: 'Proverbios: un mes de sabiduría' },
    desc: { en: 'One chapter for each day of the month — practical wisdom for everyday life.', fr: 'Un chapitre par jour du mois — une sagesse pratique pour la vie de tous les jours.', pt: 'Um capítulo para cada dia do mês — sabedoria prática para o dia a dia.', es: 'Un capítulo por cada día del mes — sabiduría práctica para la vida diaria.' } },
  { id: 'gospels40', cat: 'whole', icon: 'sun', color: '#c0392b', days: seq(39, 42, 40),
    title: { en: 'The four Gospels in 40 days', fr: 'Les quatre Évangiles en 40 jours', pt: 'Os quatro Evangelhos em 40 dias', es: 'Los cuatro Evangelios en 40 días' },
    desc: { en: 'Matthew, Mark, Luke and John — the whole life of Jesus in about two chapters a day.', fr: 'Matthieu, Marc, Luc et Jean — toute la vie de Jésus en environ deux chapitres par jour.', pt: 'Mateus, Marcos, Lucas e João — a vida de Jesus em cerca de dois capítulos por dia.', es: 'Mateo, Marcos, Lucas y Juan — toda la vida de Jesús en unos dos capítulos al día.' } },
  { id: 'nt90', cat: 'whole', icon: 'layers', color: '#2f8f4e', days: seq(39, 65, 90),
    title: { en: 'New Testament in 90 days', fr: 'Le Nouveau Testament en 90 jours', pt: 'Novo Testamento em 90 dias', es: 'Nuevo Testamento en 90 días' },
    desc: { en: 'All 27 books in three months, about three chapters a day.', fr: 'Les 27 livres en trois mois, environ trois chapitres par jour.', pt: 'Os 27 livros em três meses, cerca de três capítulos por dia.', es: 'Los 27 libros en tres meses, unos tres capítulos al día.' } },
  { id: 'bible365', cat: 'whole', icon: 'book', color: '#9a4a1c', days: seq(0, 65, 365),
    title: { en: 'The Bible in a year', fr: 'La Bible en un an', pt: 'A Bíblia em um ano', es: 'La Biblia en un año' },
    desc: { en: 'Genesis to Revelation in 365 days — about 3 to 4 chapters a day.', fr: 'De la Genèse à l’Apocalypse en 365 jours — environ 3 à 4 chapitres par jour.', pt: 'De Gênesis a Apocalipse em 365 dias — cerca de 3 a 4 capítulos por dia.', es: 'De Génesis a Apocalipsis en 365 días — unos 3 a 4 capítulos al día.' } },
  { id: 'anxiety7', cat: 'topic', icon: 'wind', color: '#4a6fa5',
    days: [['Philippians 4:4-9'], ['Matthew 6:25-34'], ['1 Peter 5:6-11'], ['Psalms 23'], ['Isaiah 41:8-13'], ['John 14:15-27'], ['Psalms 46']],
    title: { en: 'Peace when you are anxious', fr: 'La paix dans l’anxiété', pt: 'Paz na ansiedade', es: 'Paz en la ansiedad' },
    desc: { en: 'Seven days with God’s promises for worried hearts.', fr: 'Sept jours avec les promesses de Dieu pour les cœurs inquiets.', pt: 'Sete dias com as promessas de Deus para corações aflitos.', es: 'Siete días con las promesas de Dios para corazones preocupados.' } },
  { id: 'hope7', cat: 'topic', icon: 'star', color: '#d4a017',
    days: [['Romans 5:1-5'], ['Romans 8:18-28'], ['Lamentations 3:19-26'], ['Psalms 42'], ['Jeremiah 29:10-14'], ['1 Peter 1:3-9'], ['Revelation 21:1-7']],
    title: { en: 'Hope for hard days', fr: 'De l’espérance pour les jours difficiles', pt: 'Esperança para dias difíceis', es: 'Esperanza para días difíciles' },
    desc: { en: 'A week of passages that hold on to hope when life hurts.', fr: 'Une semaine de passages pour garder l’espérance quand la vie fait mal.', pt: 'Uma semana de passagens para manter a esperança quando a vida dói.', es: 'Una semana de pasajes para aferrarse a la esperanza cuando la vida duele.' } },
  { id: 'prayer7', cat: 'topic', icon: 'hand', color: '#7a4fb3',
    days: [['Matthew 6:5-15'], ['Luke 11:1-13'], ['Philippians 4:6-7', '1 Thessalonians 5:16-18'], ['Psalms 51'], ['John 17'], ['James 5:13-18'], ['Daniel 6:10-23']],
    title: { en: 'Learning to pray', fr: 'Apprendre à prier', pt: 'Aprendendo a orar', es: 'Aprender a orar' },
    desc: { en: 'How Jesus and the Bible teach us to talk with God.', fr: 'Comment Jésus et la Bible nous apprennent à parler avec Dieu.', pt: 'Como Jesus e a Bíblia nos ensinam a falar com Deus.', es: 'Cómo Jesús y la Biblia nos enseñan a hablar con Dios.' } },
  { id: 'identity7', cat: 'topic', icon: 'people', color: '#c2477a',
    days: [['Psalms 139:1-18'], ['Genesis 1:26-31'], ['Ephesians 1:3-14'], ['Ephesians 2:1-10'], ['2 Corinthians 5:14-21'], ['1 Peter 2:9-10'], ['Romans 8:14-17']],
    title: { en: 'Who God says you are', fr: 'Qui vous êtes selon Dieu', pt: 'Quem Deus diz que você é', es: 'Quién dice Dios que eres' },
    desc: { en: 'Seven days to discover your identity in Christ.', fr: 'Sept jours pour découvrir votre identité en Christ.', pt: 'Sete dias para descobrir sua identidade em Cristo.', es: 'Siete días para descubrir tu identidad en Cristo.' } },
  { id: 'purpose7', cat: 'topic', icon: 'target', color: '#2f6fb0',
    days: [['Jeremiah 1:4-10'], ['Ephesians 2:10', 'Micah 6:8'], ['Matthew 5:13-16'], ['Romans 12:1-8'], ['Colossians 3:12-17'], ['Matthew 28:16-20'], ['Proverbs 3:1-12']],
    title: { en: 'Purpose and calling', fr: 'But et vocation', pt: 'Propósito e chamado', es: 'Propósito y llamado' },
    desc: { en: 'What does God want me to do with my life? A week to find out.', fr: 'Que veut Dieu que je fasse de ma vie ? Une semaine pour le découvrir.', pt: 'O que Deus quer que eu faça da minha vida? Uma semana para descobrir.', es: '¿Qué quiere Dios que haga con mi vida? Una semana para descubrirlo.' } },
  { id: 'heroes10', cat: 'family', icon: 'crown', color: '#b4582a',
    days: [['Genesis 6:9-22'], ['Genesis 12:1-9'], ['Genesis 45:1-15'], ['Exodus 14:10-31'], ['Joshua 6:1-20'], ['Judges 7:1-22'], ['Ruth 1:6-18'], ['1 Samuel 17:32-50'], ['Daniel 6:10-23'], ['Esther 4:9-17']],
    title: { en: 'Heroes of the Bible', fr: 'Les héros de la Bible', pt: 'Heróis da Bíblia', es: 'Héroes de la Biblia' },
    desc: { en: 'Ten brave people who trusted God — perfect for kids and families.', fr: 'Dix personnes courageuses qui ont fait confiance à Dieu — idéal pour les enfants et les familles.', pt: 'Dez pessoas corajosas que confiaram em Deus — perfeito para crianças e famílias.', es: 'Diez personas valientes que confiaron en Dios — perfecto para niños y familias.' } },
  { id: 'jesus-kids7', cat: 'family', icon: 'sun', color: '#c0392b',
    days: [['Luke 2:1-20'], ['Matthew 3:13-17'], ['Mark 4:35-41'], ['John 6:1-14'], ['Mark 10:13-16'], ['Luke 23:33-47'], ['Luke 24:1-12']],
    title: { en: 'Meet Jesus (for kids)', fr: 'Rencontrer Jésus (enfants)', pt: 'Conheça Jesus (crianças)', es: 'Conoce a Jesús (niños)' },
    desc: { en: 'A week of the best-loved stories about Jesus.', fr: 'Une semaine avec les histoires les plus aimées sur Jésus.', pt: 'Uma semana com as histórias mais amadas sobre Jesus.', es: 'Una semana con las historias más queridas sobre Jesús.' } },
];
export const planTitle = p => L(p.title);
export const planDesc = p => L(p.desc);

// Reflection prompts shown each day (rotating).
export const PROMPTS = [
  { en: 'What does this passage show you about God?', fr: 'Que vous montre ce passage sur Dieu ?', pt: 'O que esta passagem mostra sobre Deus?', es: '¿Qué te muestra este pasaje sobre Dios?' },
  { en: 'Which verse stood out to you today, and why?', fr: 'Quel verset vous a marqué aujourd’hui, et pourquoi ?', pt: 'Qual versículo chamou sua atenção hoje, e por quê?', es: '¿Qué versículo te llamó la atención hoy y por qué?' },
  { en: 'Is there a promise to hold on to or a command to obey?', fr: 'Y a-t-il une promesse à retenir ou un commandement à suivre ?', pt: 'Há uma promessa para guardar ou um mandamento para obedecer?', es: '¿Hay una promesa que guardar o un mandato que obedecer?' },
  { en: 'What does this teach you about people — including yourself?', fr: 'Qu’est-ce que cela vous apprend sur les hommes — et sur vous-même ?', pt: 'O que isto ensina sobre as pessoas — inclusive sobre você?', es: '¿Qué te enseña sobre las personas — incluido tú?' },
  { en: 'How can you live this out today?', fr: 'Comment pouvez-vous le vivre aujourd’hui ?', pt: 'Como você pode viver isso hoje?', es: '¿Cómo puedes vivir esto hoy?' },
  { en: 'Turn what you read into a short prayer.', fr: 'Transformez votre lecture en une courte prière.', pt: 'Transforme o que você leu numa oração curta.', es: 'Convierte lo que leíste en una oración corta.' },
  { en: 'Who could you share this with this week?', fr: 'Avec qui pourriez-vous partager cela cette semaine ?', pt: 'Com quem você poderia compartilhar isso esta semana?', es: '¿Con quién podrías compartir esto esta semana?' },
];
