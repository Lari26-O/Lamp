// "Search by idea": topics with words people might type (in 4 languages) and the key passages.
// The daily-plan themes are added automatically with their readings.
import { DAILY_THEMES } from './daily-plans.js';

const K = (en, fr, pt, es) => ({ en, fr, pt, es });
const I = (id, title, keys, refs) => ({ id, title, keys, refs });

const EXTRA = [
  I('loveoneanother', K('Loving one another', 'S’aimer les uns les autres', 'Amar uns aos outros', 'Amarse unos a otros'),
    K('love one another, love each other, loving others, love others, love your neighbor, love neighbour, care for others, brotherly love', 'aimer les uns les autres, aimez-vous, aimer son prochain, amour fraternel, aimer les autres', 'amar uns aos outros, amai-vos, amar o próximo, amor fraternal, amar os outros', 'amarse unos a otros, amaos, amar al prójimo, amor fraternal, amar a los demás'),
    ['John 13:34-35', '1 John 4:7-12', 'John 15:12-17', 'Romans 13:8-10', '1 Peter 4:8-10', 'Romans 12:9-10', 'Galatians 5:13-14', '1 Corinthians 13:4-7', 'Matthew 22:37-40', '1 John 3:16-18', 'Leviticus 19:18', '1 Thessalonians 4:9-10']),
  I('salvation', K('How to be saved', 'Comment être sauvé', 'Como ser salvo', 'Cómo ser salvo'),
    K('saved, salvation, how to be saved, eternal life, born again, believe in jesus', 'salut, être sauvé, vie éternelle, naître de nouveau, croire en jésus', 'salvação, ser salvo, vida eterna, nascer de novo, crer em jesus', 'salvación, ser salvo, vida eterna, nacer de nuevo, creer en jesús'),
    ['John 3:1-17', 'Romans 10:9-13', 'Ephesians 2:8-10', 'Acts 16:29-34', 'Romans 6:23', 'Titus 3:4-7', 'John 1:12-13', 'Acts 4:12']),
  I('faith', K('Faith', 'La foi', 'Fé', 'La fe'),
    K('faith, believe, believing, trust god, have faith', 'foi, croire, avoir la foi', 'fé, crer, acreditar, ter fé', 'fe, creer, tener fe'),
    ['Hebrews 11:1-6', 'Mark 11:22-24', 'Romans 10:17', 'James 2:14-26', 'Matthew 17:20', 'Ephesians 6:16', 'Galatians 2:20']),
  I('sin', K('Sin and forgiveness from God', 'Le péché et le pardon de Dieu', 'O pecado e o perdão de Deus', 'El pecado y el perdón de Dios'),
    K('sin, sins, confess, repent, repentance, god forgives me, forgiveness of sins', 'péché, péchés, confesser, repentance, se repentir, dieu pardonne', 'pecado, pecados, confessar, arrependimento, arrepender, deus perdoa', 'pecado, pecados, confesar, arrepentimiento, arrepentirse, dios perdona'),
    ['1 John 1:8-10', 'Psalms 51:1-12', 'Psalms 103:8-12', 'Isaiah 1:18', 'Acts 3:19', 'Romans 3:23-26', 'Luke 15:11-24']),
  I('healing', K('Healing', 'La guérison', 'Cura', 'Sanidad'),
    K('healing, heal, healed, sick, sickness, illness, health', 'guérison, guérir, malade, maladie, santé', 'cura, curar, doente, doença, saúde', 'sanidad, sanar, enfermo, enfermedad, salud'),
    ['James 5:13-16', 'Psalms 103:1-5', 'Isaiah 53:4-5', 'Mark 5:25-34', 'Jeremiah 17:14', 'Matthew 8:1-17', 'Psalms 147:3']),
  I('anger', K('Anger and self-control', 'La colère et la maîtrise de soi', 'Raiva e domínio próprio', 'El enojo y el dominio propio'),
    K('anger, angry, mad, temper, self control, calm down', 'colère, en colère, fâché, maîtrise de soi, se calmer', 'raiva, ira, bravo, domínio próprio, se acalmar', 'enojo, ira, enojado, dominio propio, calmarse'),
    ['Ephesians 4:26-32', 'James 1:19-20', 'Proverbs 15:1', 'Proverbs 16:32', 'Colossians 3:8-14', 'Galatians 5:22-23', 'Proverbs 29:11']),
  I('honesty', K('Honesty and telling the truth', 'L’honnêteté et la vérité', 'Honestidade e falar a verdade', 'Honestidad y decir la verdad'),
    K('honest, honesty, truth, lie, lying, liar, telling the truth', 'honnête, honnêteté, vérité, mentir, mensonge', 'honesto, honestidade, verdade, mentir, mentira', 'honesto, honestidad, verdad, mentir, mentira'),
    ['Ephesians 4:25', 'Proverbs 12:22', 'Colossians 3:9-10', 'Exodus 20:16', 'Psalms 15', 'Zechariah 8:16', 'John 8:31-32']),
  I('jealousy', K('Jealousy and contentment', 'La jalousie et le contentement', 'Inveja e contentamento', 'Celos y contentamiento'),
    K('jealous, jealousy, envy, envious, compare, contentment, content', 'jalousie, jaloux, envie, contentement', 'inveja, ciúme, invejoso, contentamento', 'celos, envidia, envidioso, contentamiento'),
    ['Philippians 4:10-13', 'James 3:13-18', 'Proverbs 14:30', 'Galatians 5:24-26', '1 Timothy 6:6-8', 'Hebrews 13:5', 'Genesis 37:1-11']),
  I('death', K('Death and eternal life', 'La mort et la vie éternelle', 'A morte e a vida eterna', 'La muerte y la vida eterna'),
    K('death, die, dying, someone died, losing someone, afterlife, eternal life, resurrection', 'mort, mourir, deuil, vie éternelle, résurrection', 'morte, morrer, luto, vida eterna, ressurreição', 'muerte, morir, duelo, vida eterna, resurrección'),
    ['John 11:25-27', '1 Thessalonians 4:13-18', '1 Corinthians 15:50-57', 'Revelation 21:3-5', 'Psalms 23', 'John 14:1-3', '2 Corinthians 5:1-8']),
  I('angels', K('Angels', 'Les anges', 'Anjos', 'Ángeles'),
    K('angel, angels, guardian angel', 'ange, anges, ange gardien', 'anjo, anjos, anjo da guarda', 'ángel, ángeles, ángel de la guarda'),
    ['Psalms 91:9-12', 'Hebrews 1:14', 'Luke 2:8-14', 'Matthew 18:10', 'Daniel 6:20-22', 'Acts 12:6-11', 'Hebrews 13:2']),
  I('cross', K('Why Jesus died on the cross', 'Pourquoi Jésus est mort sur la croix', 'Por que Jesus morreu na cruz', 'Por qué Jesús murió en la cruz'),
    K('cross, jesus died, crucifixion, crucified, sacrifice, blood of jesus', 'croix, jésus est mort, crucifixion, crucifié, sacrifice', 'cruz, jesus morreu, crucificação, crucificado, sacrifício', 'cruz, jesús murió, crucifixión, crucificado, sacrificio'),
    ['Isaiah 53:3-6', 'John 19:16-30', 'Romans 5:6-11', '1 Peter 2:24', '2 Corinthians 5:21', 'John 3:16', 'Colossians 2:13-15']),
  I('return', K('Jesus coming back', 'Le retour de Jésus', 'A volta de Jesus', 'El regreso de Jesús'),
    K('second coming, jesus coming back, return of jesus, end times, end of the world, rapture', 'retour de jésus, fin des temps, fin du monde', 'volta de jesus, segunda vinda, fim dos tempos, fim do mundo', 'regreso de jesús, segunda venida, fin de los tiempos, fin del mundo'),
    ['Acts 1:9-11', 'John 14:1-3', '1 Thessalonians 4:16-18', 'Matthew 24:36-44', 'Revelation 22:12-21', 'Titus 2:11-14', '2 Peter 3:8-13']),
  I('marriage', K('Marriage', 'Le mariage', 'Casamento', 'El matrimonio'),
    K('marriage, married, husband, wife, wedding, spouse', 'mariage, marié, mari, femme, épouse, noces', 'casamento, casado, marido, esposa, casar', 'matrimonio, casado, esposo, esposa, boda'),
    ['Genesis 2:18-24', 'Ephesians 5:21-33', '1 Corinthians 13:4-7', 'Ecclesiastes 4:9-12', 'Colossians 3:12-19', 'Mark 10:6-9']),
  I('children', K('Children and parents', 'Les enfants et les parents', 'Filhos e pais', 'Hijos y padres'),
    K('children, kids, child, parents, obey parents, honor father and mother', 'enfants, enfant, parents, obéir aux parents, honorer père et mère', 'filhos, crianças, criança, pais, obedecer aos pais, honrar pai e mãe', 'hijos, niños, niño, padres, obedecer a los padres, honrar padre y madre'),
    ['Ephesians 6:1-4', 'Colossians 3:20-21', 'Exodus 20:12', 'Psalms 127:3-5', 'Proverbs 22:6', 'Mark 10:13-16', 'Deuteronomy 6:4-9']),
  I('work', K('Work and doing your best', 'Le travail et faire de son mieux', 'Trabalho e dar o seu melhor', 'El trabajo y dar lo mejor'),
    K('work, job, working hard, lazy, school work, do your best', 'travail, travailler, paresse, faire de son mieux', 'trabalho, trabalhar, preguiça, dar o melhor', 'trabajo, trabajar, pereza, dar lo mejor'),
    ['Colossians 3:23-24', 'Proverbs 6:6-11', 'Proverbs 16:3', 'Ecclesiastes 9:10', '2 Thessalonians 3:10-13', 'Proverbs 22:29']),
  I('lonely', K('When you feel lonely', 'Quand on se sent seul', 'Quando você se sente sozinho', 'Cuando te sientes solo'),
    K('lonely, alone, loneliness, no friends, left out', 'seul, solitude, sans amis, mis à l’écart', 'sozinho, solidão, sem amigos, excluído', 'solo, soledad, sin amigos, excluido'),
    ['Deuteronomy 31:6-8', 'Psalms 68:5-6', 'Isaiah 41:10', 'Matthew 28:20', 'Psalms 25:16-18', 'Hebrews 13:5-6', 'John 14:16-18']),
  I('baptism', K('Baptism', 'Le baptême', 'Batismo', 'El bautismo'),
    K('baptism, baptized, baptize, be baptized', 'baptême, baptisé, baptiser', 'batismo, batizado, batizar', 'bautismo, bautizado, bautizar'),
    ['Matthew 3:13-17', 'Matthew 28:18-20', 'Acts 2:37-41', 'Romans 6:3-4', 'Acts 8:35-39', 'Galatians 3:26-27']),
  I('christmas', K('The birth of Jesus', 'La naissance de Jésus', 'O nascimento de Jesus', 'El nacimiento de Jesús'),
    K('christmas, birth of jesus, jesus was born, nativity, baby jesus, manger', 'noël, naissance de jésus, jésus est né, crèche, bébé jésus', 'natal, nascimento de jesus, jesus nasceu, presépio, bebê jesus', 'navidad, nacimiento de jesús, jesús nació, pesebre, niño jesús'),
    ['Luke 2:1-20', 'Matthew 1:18-25', 'Matthew 2:1-12', 'Isaiah 9:6-7', 'Micah 5:2', 'John 1:1-14']),
];

// Daily-plan themes become ideas too (title words are the search words).
const THEME_KEYS = {
  peace: K('anxiety, anxious, worry, worried, stress, stressed, peace', 'anxiété, anxieux, inquiet, inquiétude, stress, paix', 'ansiedade, ansioso, preocupação, preocupado, estresse, paz', 'ansiedad, ansioso, preocupación, preocupado, estrés, paz'),
  fear: K('fear, afraid, scared, frightened, nightmare', 'peur, effrayé, cauchemar', 'medo, assustado, pesadelo', 'miedo, asustado, pesadilla'),
  grief: K('sad, sadness, crying, grief, mourning, depressed', 'triste, tristesse, pleurer, deuil, déprimé', 'triste, tristeza, chorar, luto, deprimido', 'triste, tristeza, llorar, duelo, deprimido'),
  forgive: K('forgive, forgiving, forgiveness, grudge, hurt me', 'pardonner, pardon, rancune', 'perdoar, perdão, mágoa, rancor', 'perdonar, perdón, rencor'),
  prayer: K('pray, praying, prayer, talk to god', 'prier, prière, parler à dieu', 'orar, oração, rezar, falar com deus', 'orar, oración, rezar, hablar con dios'),
  thanks: K('thankful, grateful, gratitude, thank you', 'reconnaissant, gratitude, merci', 'grato, gratidão, agradecer, obrigado', 'agradecido, gratitud, gracias'),
  courage: K('brave, courage, bold, strong', 'courage, courageux, fort', 'coragem, corajoso, forte', 'valor, valiente, fuerte'),
  friends: K('friend, friends, friendship', 'ami, amis, amitié', 'amigo, amigos, amizade', 'amigo, amigos, amistad'),
  money: K('money, rich, poor, give, giving, tithe, generous', 'argent, riche, pauvre, donner, dîme, généreux', 'dinheiro, rico, pobre, dar, dízimo, generoso', 'dinero, rico, pobre, dar, diezmo, generoso'),
  rest: K('tired, rest, exhausted, sleep, weary', 'fatigué, repos, épuisé, dormir', 'cansado, descanso, exausto, dormir', 'cansado, descanso, agotado, dormir'),
  identity: K('worth, value, self esteem, who am i, ugly, not enough', 'valeur, estime de soi, qui suis-je', 'valor, autoestima, quem sou eu', 'valor, autoestima, quién soy'),
  temptation: K('temptation, tempted, resist, addiction', 'tentation, tenté, résister', 'tentação, tentado, resistir, vício', 'tentación, tentado, resistir, adicción'),
  hope: K('hope, hopeless, give up, hard times', 'espoir, espérance, désespoir', 'esperança, desesperança, desistir', 'esperanza, desesperanza, rendirse'),
  wisdom: K('wisdom, wise, decision, choose, advice', 'sagesse, sage, décision, conseil', 'sabedoria, sábio, decisão, conselho', 'sabiduría, sabio, decisión, consejo'),
  joy: K('joy, happy, happiness, rejoice', 'joie, heureux, bonheur', 'alegria, feliz, felicidade', 'gozo, alegría, feliz, felicidad'),
  serve: K('serve, serving, help others, humble service', 'servir, aider les autres', 'servir, ajudar os outros', 'servir, ayudar a los demás'),
  words: K('words, gossip, tongue, speech, bad words', 'paroles, commérage, langue', 'palavras, fofoca, língua', 'palabras, chisme, lengua'),
  heaven: K('heaven, paradise, eternity', 'ciel, paradis, éternité', 'céu, paraíso, eternidade', 'cielo, paraíso, eternidad'),
  spirit: K('holy spirit, spirit, gifts of the spirit', 'saint-esprit, esprit', 'espírito santo, espírito', 'espíritu santo, espíritu'),
  patience: K('patience, patient, waiting, wait', 'patience, patient, attendre', 'paciência, paciente, esperar', 'paciencia, paciente, esperar'),
};
const FROM_THEMES = DAILY_THEMES.map(th => I(th.id, th.title, Object.fromEntries(['en', 'fr', 'pt', 'es'].map(l => [l, `${th.title[l]}${THEME_KEYS[th.id] ? ', ' + THEME_KEYS[th.id][l] : ''}`])), th.refs));
export const IDEAS = [...EXTRA, ...FROM_THEMES];

// Small helpers for matching words regardless of form ("loving" ~ "love").
const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(('a an the and or of to in on for with my your our is are be am i me we us you it this that how what why when who about do does can god lord ' +
  'le la les un une des de du et ou en au aux pour avec mon ma mes ton ta tes est sont je tu il elle nous vous comment quoi pourquoi dieu seigneur ' +
  'o os as um uma de do da dos das e ou em no na nos nas para com meu minha seu sua é sao eu voce ele ela nos como que por porque deus senhor ' +
  'el los las un una unos unas de del y o en al para con mi mis tu tus su es son yo tu el ella nosotros como que por porque dios señor senor').split(/\s+/));
export function stem(w) {
  w = fold(w).replace(/[^a-z0-9]/g, '');
  for (const suf of ['ingly', 'ing', 'edly', 'ed', 'ies', 'es', 's', 'ment', 'ness', 'ly', 'ement', 'ons', 'ez', 'er', 'ar', 'ir', 'ando', 'endo', 'ado', 'ido', 'mos']) {
    if (w.length >= suf.length + 3 && w.endsWith(suf)) return w.slice(0, -suf.length);
  }
  return w.length > 4 && /[aeo]$/.test(w) ? w.slice(0, -1) : w;
}
export const keyWords = q => fold(q).split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w)).map(stem).filter(w => w.length > 1);

// Best matching ideas for a query, in the reader's language (falls back to English keys).
export function matchIdeas(q, lang = 'en') {
  const qs = keyWords(q); if (!qs.length) return [];
  const qfold = fold(q);
  return IDEAS.map(idea => {
    const keys = `${idea.keys[lang] || ''}, ${idea.keys.en || ''}, ${idea.title[lang] || ''}, ${idea.title.en}`;
    const phrases = keys.split(',').map(x => fold(x.trim())).filter(Boolean);
    let score = phrases.some(p => p.length > 3 && (qfold.includes(p) || p.includes(qfold))) ? 10 : 0;
    const kw = new Set(keyWords(keys));
    score += qs.filter(w => kw.has(w) || [...kw].some(k => k.length >= 3 && w.length >= 3 && (k.startsWith(w) || w.startsWith(k)))).length * 3;
    return { idea, score: score / Math.max(1, qs.length) };
  }).filter(x => x.score >= 2).sort((a, b) => b.score - a.score).slice(0, 3).map(x => x.idea);
}
