// One challenge per day. "app" challenges complete automatically when you do
// the activity; "life" challenges are things to do in real life.
import { load, save, getProgress, markActivity, today } from './store.js';
import { isKids, L } from './profile.js';
import { dayOfYear } from './util.js';

const S = (en, fr, pt, es) => ({ en, fr, pt, es });
const C = (id, kind, icon, text, check, link) => ({ id, kind, icon, text, check, link });

export const CHALLENGES = [
  C('read1', 'app', 'book', S('Read one chapter of the Bible today.', 'Lisez un chapitre de la Bible aujourd’hui.', 'Leia um capítulo da Bíblia hoje.', 'Lee un capítulo de la Biblia hoy.'), 'read', '#/read'),
  C('tellJesus', 'life', 'chat', S('Tell someone what Jesus means to you — a friend, a coworker or even a stranger.', 'Dites à quelqu’un ce que Jésus représente pour vous — un ami, un collègue ou même un inconnu.', 'Conte a alguém o que Jesus significa para você — um amigo, um colega ou até um desconhecido.', 'Cuéntale a alguien lo que Jesús significa para ti — un amigo, un compañero o incluso un desconocido.')),
  C('lesson', 'app', 'path', S('Finish one lesson in your learning path.', 'Terminez une leçon de votre parcours.', 'Conclua uma lição da sua trilha.', 'Termina una lección de tu ruta.'), 'lesson', '#/learn'),
  C('encourage', 'life', 'heart', S('Send an encouraging message to someone who is having a hard time.', 'Envoyez un message d’encouragement à quelqu’un qui traverse un moment difficile.', 'Mande uma mensagem de encorajamento para alguém que está passando por um momento difícil.', 'Envía un mensaje de ánimo a alguien que lo está pasando mal.')),
  C('pray3', 'app', 'hand', S('Pray for three people by name (use your prayer list).', 'Priez pour trois personnes par leur nom (utilisez votre liste de prière).', 'Ore por três pessoas pelo nome (use sua lista de oração).', 'Ora por tres personas por su nombre (usa tu lista de oración).'), 'prayer', '#/prayer'),
  C('thanks', 'life', 'star', S('Write down five things you are thankful for today.', 'Notez cinq choses pour lesquelles vous êtes reconnaissant aujourd’hui.', 'Escreva cinco coisas pelas quais você é grato hoje.', 'Escribe cinco cosas por las que estás agradecido hoy.')),
  C('memorize', 'app', 'brain', S('Practice a memory verse (any game counts).', 'Entraînez-vous sur un verset (n’importe quel jeu compte).', 'Pratique um versículo (qualquer jogo vale).', 'Practica un versículo (cualquier juego cuenta).'), 'game', '#/memory'),
  C('serve', 'life', 'people', S('Do a chore or a kind act for someone without being asked.', 'Rendez un service ou faites un geste gentil sans qu’on vous le demande.', 'Faça uma tarefa ou um gesto gentil para alguém sem que peçam.', 'Haz una tarea o un acto amable por alguien sin que te lo pidan.')),
  C('quiz', 'app', 'quiz', S('Take today’s daily quiz.', 'Faites le quiz du jour.', 'Faça o quiz diário de hoje.', 'Haz el quiz diario de hoy.'), 'quiz', '#/quiz'),
  C('forgive', 'life', 'anchor', S('Forgive someone in your heart — and tell God about it.', 'Pardonnez à quelqu’un dans votre cœur — et parlez-en à Dieu.', 'Perdoe alguém no seu coração — e conte isso a Deus.', 'Perdona a alguien en tu corazón — y díselo a Dios.')),
  C('plan', 'app', 'calendar', S('Do today’s reading in a reading plan.', 'Faites la lecture du jour d’un plan de lecture.', 'Faça a leitura de hoje num plano de leitura.', 'Haz la lectura de hoy en un plan de lectura.'), 'plan', '#/plans'),
  C('call', 'life', 'chat', S('Call a parent, grandparent or old friend just to say you love them.', 'Appelez un parent, un grand-parent ou un vieil ami juste pour lui dire que vous l’aimez.', 'Ligue para um pai, avô ou velho amigo só para dizer que o ama.', 'Llama a un padre, abuelo o viejo amigo solo para decirle que lo quieres.')),
  C('note', 'app', 'pen', S('Highlight a verse and write what it means to you.', 'Surlignez un verset et écrivez ce qu’il signifie pour vous.', 'Destaque um versículo e escreva o que ele significa para você.', 'Resalta un versículo y escribe lo que significa para ti.'), 'mark', '#/read'),
  C('give', 'life', 'bolt', S('Give something away: food, clothes, time or money to someone in need.', 'Donnez quelque chose : nourriture, vêtements, temps ou argent à quelqu’un dans le besoin.', 'Doe algo: comida, roupa, tempo ou dinheiro a alguém que precisa.', 'Regala algo: comida, ropa, tiempo o dinero a alguien que lo necesite.')),
  C('study', 'app', 'compass', S('Do a guided study on a passage.', 'Faites une étude guidée d’un passage.', 'Faça um estudo guiado de uma passagem.', 'Haz un estudio guiado de un pasaje.'), 'study', '#/study'),
  C('phone', 'life', 'timer', S('Put your phone away for one hour and spend it with God or with people.', 'Rangez votre téléphone pendant une heure et passez-la avec Dieu ou avec d’autres.', 'Guarde o celular por uma hora e passe esse tempo com Deus ou com pessoas.', 'Guarda el teléfono una hora y pásala con Dios o con otras personas.')),
  C('share', 'life', 'share', S('Share a Bible verse with someone today (make a verse image!).', 'Partagez un verset avec quelqu’un aujourd’hui (créez une image de verset !).', 'Compartilhe um versículo com alguém hoje (faça uma imagem de versículo!).', 'Comparte un versículo con alguien hoy (¡haz una imagen del versículo!).')),
  C('listen', 'life', 'people', S('Really listen to someone today — ask how they are and wait for the answer.', 'Écoutez vraiment quelqu’un aujourd’hui — demandez-lui comment il va et attendez la réponse.', 'Escute alguém de verdade hoje — pergunte como está e espere a resposta.', 'Escucha de verdad a alguien hoy — pregúntale cómo está y espera la respuesta.')),
  C('psalm', 'life', 'heart', S('Read a psalm out loud as a prayer.', 'Lisez un psaume à voix haute comme une prière.', 'Leia um salmo em voz alta como oração.', 'Lee un salmo en voz alta como oración.'), null, '#/read/18/23'),
  C('invite', 'life', 'house', S('Invite someone to church or to a meal.', 'Invitez quelqu’un à l’église ou à un repas.', 'Convide alguém para a igreja ou para uma refeição.', 'Invita a alguien a la iglesia o a comer.')),
  C('thankGod', 'life', 'sun', S('Before every meal today, stop and thank God.', 'Avant chaque repas aujourd’hui, arrêtez-vous et remerciez Dieu.', 'Antes de cada refeição hoje, pare e agradeça a Deus.', 'Antes de cada comida hoy, detente y da gracias a Dios.')),
];

export const KIDS_CHALLENGES = [
  C('k-story', 'app', 'book', S('Listen to a Bible story in the app.', 'Écoute une histoire de la Bible dans l’appli.', 'Ouça uma história da Bíblia no app.', 'Escucha una historia de la Biblia en la app.'), 'kidstory', '#/kids'),
  C('k-hug', 'life', 'heart', S('Give someone in your family a big hug and say: God loves you!', 'Fais un gros câlin à quelqu’un de ta famille et dis : Dieu t’aime !', 'Dê um abraço bem forte em alguém da sua família e diga: Deus te ama!', '¡Dale un abrazo grande a alguien de tu familia y dile: Dios te ama!')),
  C('k-share', 'life', 'bread', S('Share a toy or a snack with someone.', 'Partage un jouet ou un goûter avec quelqu’un.', 'Reparta um brinquedo ou um lanche com alguém.', 'Comparte un juguete o una merienda con alguien.')),
  C('k-pray', 'life', 'hand', S('Say thank you to God before you eat.', 'Dis merci à Dieu avant de manger.', 'Agradeça a Deus antes de comer.', 'Dale gracias a Dios antes de comer.')),
  C('k-game', 'app', 'star', S('Play a Bible game in the app.', 'Joue à un jeu biblique dans l’appli.', 'Jogue um jogo bíblico no app.', 'Juega un juego bíblico en la app.'), 'kidgame', '#/kids/games'),
  C('k-help', 'life', 'house', S('Help clean up without being asked.', 'Aide à ranger sans qu’on te le demande.', 'Ajude a arrumar sem ninguém pedir.', 'Ayuda a recoger sin que te lo pidan.')),
  C('k-kind', 'life', 'people', S('Say something kind to three people today.', 'Dis quelque chose de gentil à trois personnes aujourd’hui.', 'Diga algo gentil para três pessoas hoje.', 'Dile algo bonito a tres personas hoy.')),
  C('k-sorry', 'life', 'anchor', S('If you did something wrong, say sorry.', 'Si tu as fait une bêtise, demande pardon.', 'Se você fez algo errado, peça desculpas.', 'Si hiciste algo malo, pide perdón.')),
  C('k-draw', 'app', 'pen', S('Color a Bible picture in the app.', 'Colorie une image de la Bible dans l’appli.', 'Pinte um desenho da Bíblia no app.', 'Colorea un dibujo de la Biblia en la app.'), 'kidcolor', '#/kids/game/color'),
  C('k-tell', 'life', 'chat', S('Tell your family your favorite Bible story.', 'Raconte à ta famille ton histoire de la Bible préférée.', 'Conte para sua família sua história bíblica favorita.', 'Cuéntale a tu familia tu historia bíblica favorita.')),
  C('k-verse', 'life', 'sun', S('Say today’s verse three times.', 'Répète le verset du jour trois fois.', 'Repita o versículo de hoje três vezes.', 'Repite el versículo de hoy tres veces.')),
  C('k-friend', 'life', 'people', S('Play with someone who is alone.', 'Joue avec quelqu’un qui est tout seul.', 'Brinque com alguém que está sozinho.', 'Juega con alguien que está solo.')),
  C('k-bed', 'life', 'star', S('Pray with a grown-up before bed.', 'Prie avec un adulte avant de dormir.', 'Ore com um adulto antes de dormir.', 'Ora con un adulto antes de dormir.')),
  C('k-thanks', 'life', 'heart', S('Make a thank-you drawing for someone.', 'Fais un dessin de remerciement pour quelqu’un.', 'Faça um desenho de agradecimento para alguém.', 'Haz un dibujo de agradecimiento para alguien.')),
];

const getState = () => ({ done: {}, ...load('challenges', {}) });
export function todayChallenge(date = new Date()) {
  const list = isKids() ? KIDS_CHALLENGES : CHALLENGES;
  const d = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 864e5);
  return list[(d + date.getFullYear()) % list.length];
}
export const challengeText = c => L(c.text);
export function isDone(c = todayChallenge()) {
  const st = getState();
  if (st.done[today()] === c.id) return true;
  if (c.check) { const day = getProgress().days[today()] || {}; if (day[c.check]) return true; }
  return false;
}
export function completeChallenge(c = todayChallenge()) {
  const st = getState();
  if (st.done[today()] === c.id) return;
  st.done[today()] = c.id;
  save('challenges', st);
  markActivity('challenge', 10);
}
export function challengeStreak() {
  const st = getState(); let n = 0; const d = new Date();
  if (!st.done[today(d)]) d.setDate(d.getDate() - 1);
  while (st.done[today(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export const challengeHistory = (days = 7) => { const st = getState(); return Array.from({ length: days }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (days - 1 - i)); return { date: today(d), done: !!st.done[today(d)] }; }); };
