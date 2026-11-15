// Children's mode content (Pre-K – 3rd grade). Each story teaches one simple
// truth, focused on Jesus and on loving one another. Verse lines are short,
// child-friendly wordings with their reference.
import { OT_STORIES } from './kids-stories-ot.js';
import T1 from './kids-tales-1.js';
import T2 from './kids-tales-2.js';
import T3 from './kids-tales-3.js';
import T4 from './kids-tales-4.js';
import T5 from './kids-tales-5.js';
const TALES = { ...T1, ...T2, ...T3, ...T4, ...T5 };
import { hasArt, hasPic } from './kids-art.js';
const S = (en, fr, pt, es) => ({ en, fr, pt, es });

const BASE_STORIES = [
  { id: 'creation', scene: 'creation', ref: 'Genesis 1:1-31', sticker: 'sun', color: '#00b894',
    title: S('God made everything', 'Dieu a tout créé', 'Deus fez tudo', 'Dios hizo todo'),
    pages: [
      S('In the beginning, God made the sky and the sun.', 'Au commencement, Dieu a créé le ciel et le soleil.', 'No começo, Deus fez o céu e o sol.', 'Al principio, Dios hizo el cielo y el sol.'),
      S('God made trees, flowers, fish and animals.', 'Dieu a créé les arbres, les fleurs, les poissons et les animaux.', 'Deus fez as árvores, as flores, os peixes e os animais.', 'Dios hizo los árboles, las flores, los peces y los animales.'),
      S('Then God made people. God made you!', 'Puis Dieu a créé les hommes. Dieu t’a créé, toi !', 'Depois Deus fez as pessoas. Deus fez você!', 'Luego Dios hizo a las personas. ¡Dios te hizo a ti!'),
      S('God looked at everything and said: it is very good.', 'Dieu a regardé tout ce qu’il avait fait et a dit : c’est très bon.', 'Deus olhou tudo e disse: é muito bom.', 'Dios miró todo y dijo: es muy bueno.'),
    ],
    truth: S('God made me and God loves me.', 'Dieu m’a créé et Dieu m’aime.', 'Deus me fez e Deus me ama.', 'Dios me hizo y Dios me ama.'),
    verse: { ref: 'Genesis 1:1', text: S('In the beginning God made the heavens and the earth.', 'Au commencement, Dieu créa les cieux et la terre.', 'No princípio Deus criou os céus e a terra.', 'En el principio Dios creó los cielos y la tierra.') },
    talk: S('What is your favorite thing that God made?', 'Quelle est ta chose préférée que Dieu a créée ?', 'Qual é a sua coisa favorita que Deus fez?', '¿Qué es lo que más te gusta de lo que Dios hizo?'),
    quiz: [
      { q: S('Who made the sun?', 'Qui a créé le soleil ?', 'Quem fez o sol?', '¿Quién hizo el sol?'), a: 'sun', opts: ['sun', 'boat', 'bread'], say: S('God made the sun!', 'Dieu a créé le soleil !', 'Deus fez o sol!', '¡Dios hizo el sol!') },
      { q: S('Tap something God made.', 'Touche une chose que Dieu a créée.', 'Toque em algo que Deus fez.', 'Toca algo que Dios hizo.'), a: 'tree', opts: ['tree', 'house', 'boat'] },
    ] },
  { id: 'christmas', scene: 'christmas', ref: 'Luke 2:1-20', sticker: 'star', color: '#6c5ce7',
    title: S('Baby Jesus is born', 'Bébé Jésus est né', 'O bebê Jesus nasceu', 'Nace el bebé Jesús'),
    pages: [
      S('Mary and Joseph went on a long trip to Bethlehem.', 'Marie et Joseph ont fait un long voyage jusqu’à Bethléhem.', 'Maria e José fizeram uma longa viagem até Belém.', 'María y José hicieron un largo viaje a Belén.'),
      S('There was no room, so they stayed with the animals.', 'Il n’y avait pas de place, alors ils sont restés avec les animaux.', 'Não havia lugar, então ficaram com os animais.', 'No había lugar, así que se quedaron con los animales.'),
      S('Baby Jesus was born and laid in a manger.', 'Bébé Jésus est né et a été couché dans une mangeoire.', 'O bebê Jesus nasceu e foi colocado numa manjedoura.', 'Nació el bebé Jesús y lo acostaron en un pesebre.'),
      S('Angels sang: Good news! A Savior is born!', 'Les anges ont chanté : Bonne nouvelle ! Un Sauveur est né !', 'Os anjos cantaram: Boas notícias! Nasceu um Salvador!', 'Los ángeles cantaron: ¡Buenas noticias! ¡Ha nacido un Salvador!'),
    ],
    truth: S('Jesus is God’s Son. He came because God loves us.', 'Jésus est le Fils de Dieu. Il est venu parce que Dieu nous aime.', 'Jesus é o Filho de Deus. Ele veio porque Deus nos ama.', 'Jesús es el Hijo de Dios. Vino porque Dios nos ama.'),
    verse: { ref: 'Luke 2:11', text: S('A Savior has been born to you; he is Christ the Lord.', 'Il vous est né un Sauveur, qui est le Christ, le Seigneur.', 'Nasceu para vocês o Salvador, que é Cristo, o Senhor.', 'Os ha nacido un Salvador, que es Cristo el Señor.') },
    talk: S('How do you think Mary felt holding baby Jesus?', 'Comment Marie se sentait-elle en tenant bébé Jésus ?', 'Como você acha que Maria se sentiu segurando o bebê Jesus?', '¿Cómo crees que se sintió María al cargar al bebé Jesús?'),
    quiz: [
      { q: S('Where did baby Jesus sleep?', 'Où dormait bébé Jésus ?', 'Onde o bebê Jesus dormiu?', '¿Dónde durmió el bebé Jesús?'), a: 'baby', opts: ['baby', 'boat', 'tree'] },
      { q: S('What shone in the sky?', 'Qu’est-ce qui brillait dans le ciel ?', 'O que brilhava no céu?', '¿Qué brillaba en el cielo?'), a: 'star', opts: ['fish', 'star', 'house'] },
    ] },
  { id: 'friends', scene: 'friends', ref: 'Luke 5:1-11', sticker: 'fish', color: '#0984e3',
    title: S('Jesus picks his friends', 'Jésus choisit ses amis', 'Jesus escolhe seus amigos', 'Jesús elige a sus amigos'),
    pages: [
      S('Peter and his friends fished all night, but caught nothing.', 'Pierre et ses amis ont pêché toute la nuit, sans rien attraper.', 'Pedro e seus amigos pescaram a noite toda e não pegaram nada.', 'Pedro y sus amigos pescaron toda la noche y no pescaron nada.'),
      S('Jesus said: Try again! And the net filled with fish.', 'Jésus a dit : Essayez encore ! Et le filet s’est rempli de poissons.', 'Jesus disse: Tentem de novo! E a rede se encheu de peixes.', 'Jesús dijo: ¡Inténtenlo otra vez! Y la red se llenó de peces.'),
      S('Jesus said: Come, follow me!', 'Jésus a dit : Venez, suivez-moi !', 'Jesus disse: Venham, sigam-me!', 'Jesús dijo: ¡Vengan, síganme!'),
      S('And they became Jesus’ friends.', 'Et ils sont devenus les amis de Jésus.', 'E eles se tornaram amigos de Jesus.', 'Y se hicieron amigos de Jesús.'),
    ],
    truth: S('Jesus wants me to be his friend.', 'Jésus veut que je sois son ami.', 'Jesus quer que eu seja amigo dele.', 'Jesús quiere que yo sea su amigo.'),
    verse: { ref: 'Matthew 4:19', text: S('Jesus said: Come, follow me.', 'Jésus dit : Venez, suivez-moi.', 'Jesus disse: Venham, sigam-me.', 'Jesús dijo: Vengan, síganme.') },
    talk: S('What can you do with Jesus, your friend?', 'Que peux-tu faire avec Jésus, ton ami ?', 'O que você pode fazer com Jesus, seu amigo?', '¿Qué puedes hacer con Jesús, tu amigo?'),
    quiz: [{ q: S('What filled the net?', 'Qu’est-ce qui a rempli le filet ?', 'O que encheu a rede?', '¿Qué llenó la red?'), a: 'fish', opts: ['fish', 'bread', 'star'] }] },
  { id: 'storm', scene: 'storm', ref: 'Mark 4:35-41', sticker: 'boat', color: '#2d3561',
    title: S('Jesus stops the storm', 'Jésus calme la tempête', 'Jesus acalma a tempestade', 'Jesús calma la tormenta'),
    pages: [
      S('Jesus and his friends were in a boat.', 'Jésus et ses amis étaient dans un bateau.', 'Jesus e seus amigos estavam num barco.', 'Jesús y sus amigos estaban en una barca.'),
      S('A big storm came. Whoosh! The waves were huge!', 'Une grosse tempête est arrivée. Whoosh ! Les vagues étaient énormes !', 'Veio uma grande tempestade. Uuuh! As ondas eram enormes!', 'Llegó una gran tormenta. ¡Fiu! ¡Las olas eran enormes!'),
      S('His friends were scared. Jesus stood up and said: Be still!', 'Ses amis avaient peur. Jésus s’est levé et a dit : Silence, calme-toi !', 'Os amigos ficaram com medo. Jesus se levantou e disse: Acalme-se!', 'Sus amigos tenían miedo. Jesús se levantó y dijo: ¡Calma!'),
      S('The wind stopped. The sea was calm.', 'Le vent s’est arrêté. La mer est devenue calme.', 'O vento parou. O mar ficou calmo.', 'El viento se detuvo. El mar quedó en calma.'),
    ],
    truth: S('Jesus can do anything. I don’t have to be afraid.', 'Jésus peut tout faire. Je n’ai pas besoin d’avoir peur.', 'Jesus pode fazer tudo. Não preciso ter medo.', 'Jesús puede hacer todo. No tengo que tener miedo.'),
    verse: { ref: 'Psalms 56:3', text: S('When I am afraid, I will trust in you.', 'Quand j’ai peur, je me confie en toi.', 'Quando eu tiver medo, confiarei em ti.', 'Cuando tengo miedo, confío en ti.') },
    talk: S('What makes you scared? Jesus is with you.', 'Qu’est-ce qui te fait peur ? Jésus est avec toi.', 'O que te dá medo? Jesus está com você.', '¿Qué te da miedo? Jesús está contigo.'),
    quiz: [{ q: S('Where were Jesus and his friends?', 'Où étaient Jésus et ses amis ?', 'Onde estavam Jesus e seus amigos?', '¿Dónde estaban Jesús y sus amigos?'), a: 'boat', opts: ['house', 'boat', 'tree'] }] },
  { id: 'feeding', scene: 'feeding', ref: 'John 6:1-14', sticker: 'bread', color: '#e17055',
    title: S('A boy shares his lunch', 'Un garçon partage son repas', 'Um menino reparte seu lanche', 'Un niño comparte su almuerzo'),
    pages: [
      S('Lots and lots of people came to hear Jesus.', 'Beaucoup, beaucoup de gens sont venus écouter Jésus.', 'Muitas, muitas pessoas vieram ouvir Jesus.', 'Muchísima gente vino a escuchar a Jesús.'),
      S('Everyone was hungry. A boy had five breads and two fish.', 'Tout le monde avait faim. Un garçon avait cinq pains et deux poissons.', 'Todos estavam com fome. Um menino tinha cinco pães e dois peixes.', 'Todos tenían hambre. Un niño tenía cinco panes y dos peces.'),
      S('He gave them to Jesus. Jesus said thank you to God.', 'Il les a donnés à Jésus. Jésus a dit merci à Dieu.', 'Ele deu tudo a Jesus. Jesus agradeceu a Deus.', 'Se los dio a Jesús. Jesús le dio gracias a Dios.'),
      S('Jesus shared the food, and everyone had enough!', 'Jésus a partagé la nourriture, et tout le monde en a eu assez !', 'Jesus repartiu a comida, e todos comeram até ficar satisfeitos!', '¡Jesús repartió la comida y todos comieron hasta quedar satisfechos!'),
    ],
    truth: S('When I share, Jesus can do great things.', 'Quand je partage, Jésus peut faire de grandes choses.', 'Quando eu reparto, Jesus pode fazer grandes coisas.', 'Cuando comparto, Jesús puede hacer grandes cosas.'),
    verse: { ref: 'Hebrews 13:16', text: S('Do good and share with others.', 'Faites le bien et partagez avec les autres.', 'Façam o bem e repartam com os outros.', 'Hagan el bien y compartan con los demás.') },
    talk: S('What is something you can share today?', 'Qu’est-ce que tu peux partager aujourd’hui ?', 'O que você pode repartir hoje?', '¿Qué puedes compartir hoy?'),
    quiz: [{ q: S('What did the boy share?', 'Qu’est-ce que le garçon a partagé ?', 'O que o menino repartiu?', '¿Qué compartió el niño?'), a: 'basket', opts: ['basket', 'boat', 'star'] }] },
  { id: 'children', scene: 'children', ref: 'Mark 10:13-16', sticker: 'heart', color: '#fd79a8',
    title: S('Jesus loves children', 'Jésus aime les enfants', 'Jesus ama as crianças', 'Jesús ama a los niños'),
    pages: [
      S('Moms and dads brought their children to see Jesus.', 'Des mamans et des papas ont amené leurs enfants voir Jésus.', 'Mães e pais levaram seus filhos para ver Jesus.', 'Mamás y papás llevaron a sus hijos a ver a Jesús.'),
      S('Some people said: Go away, Jesus is too busy!', 'Certains ont dit : Partez, Jésus est trop occupé !', 'Alguns disseram: Vão embora, Jesus está ocupado!', 'Algunos dijeron: ¡Váyanse, Jesús está ocupado!'),
      S('But Jesus said: Let the children come to me!', 'Mais Jésus a dit : Laissez les enfants venir à moi !', 'Mas Jesus disse: Deixem as crianças virem a mim!', 'Pero Jesús dijo: ¡Dejen que los niños vengan a mí!'),
      S('Jesus hugged them and blessed them.', 'Jésus les a pris dans ses bras et les a bénis.', 'Jesus os abraçou e os abençoou.', 'Jesús los abrazó y los bendijo.'),
    ],
    truth: S('Jesus always has time for me.', 'Jésus a toujours du temps pour moi.', 'Jesus sempre tem tempo para mim.', 'Jesús siempre tiene tiempo para mí.'),
    verse: { ref: 'Matthew 19:14', text: S('Let the little children come to me.', 'Laissez les petits enfants venir à moi.', 'Deixem vir a mim as crianças.', 'Dejen que los niños vengan a mí.') },
    talk: S('What would you like to tell Jesus today?', 'Qu’aimerais-tu dire à Jésus aujourd’hui ?', 'O que você gostaria de contar para Jesus hoje?', '¿Qué te gustaría decirle a Jesús hoy?'),
    quiz: [{ q: S('Who does Jesus love?', 'Qui Jésus aime-t-il ?', 'Quem Jesus ama?', '¿A quién ama Jesús?'), a: 'people', opts: ['people', 'fish', 'sun'], say: S('Jesus loves everyone — and you!', 'Jésus aime tout le monde — et toi !', 'Jesus ama todo mundo — e você!', '¡Jesús ama a todos — y a ti!') }] },
  { id: 'samaritan', scene: 'samaritan', ref: 'Luke 10:25-37', sticker: 'bandage', color: '#00cec9',
    title: S('The kind helper', 'Le gentil voisin', 'O bom vizinho', 'El buen vecino'),
    pages: [
      S('Jesus told a story about a man who got hurt on the road.', 'Jésus a raconté l’histoire d’un homme blessé sur la route.', 'Jesus contou a história de um homem que se machucou na estrada.', 'Jesús contó la historia de un hombre herido en el camino.'),
      S('Two people walked by and did not stop.', 'Deux personnes sont passées sans s’arrêter.', 'Duas pessoas passaram e não pararam.', 'Dos personas pasaron y no se detuvieron.'),
      S('Then a man from another country stopped to help him.', 'Puis un homme d’un autre pays s’est arrêté pour l’aider.', 'Então um homem de outro país parou para ajudar.', 'Entonces un hombre de otro país se detuvo a ayudarlo.'),
      S('Jesus said: Be kind like him. Love your neighbor!', 'Jésus a dit : Sois gentil comme lui. Aime ton prochain !', 'Jesus disse: Seja bondoso como ele. Ame o seu próximo!', 'Jesús dijo: Sé bueno como él. ¡Ama a tu prójimo!'),
    ],
    truth: S('Jesus wants me to help everyone, not just my friends.', 'Jésus veut que j’aide tout le monde, pas seulement mes amis.', 'Jesus quer que eu ajude todo mundo, não só meus amigos.', 'Jesús quiere que ayude a todos, no solo a mis amigos.'),
    verse: { ref: 'Luke 10:27', text: S('Love your neighbor as yourself.', 'Aime ton prochain comme toi-même.', 'Ame o seu próximo como a si mesmo.', 'Ama a tu prójimo como a ti mismo.') },
    talk: S('Who can you help this week?', 'Qui peux-tu aider cette semaine ?', 'Quem você pode ajudar esta semana?', '¿A quién puedes ayudar esta semana?'),
    quiz: [{ q: S('What did the kind man use to help?', 'Qu’a utilisé le gentil homme pour aider ?', 'O que o bom homem usou para ajudar?', '¿Qué usó el buen hombre para ayudar?'), a: 'bandage', opts: ['bandage', 'boat', 'star'] }] },
  { id: 'blind', scene: 'blind', ref: 'Mark 10:46-52', sticker: 'sun', color: '#fdcb6e',
    title: S('Jesus helps a man see', 'Jésus guérit un aveugle', 'Jesus ajuda um homem a ver', 'Jesús ayuda a un hombre a ver'),
    pages: [
      S('Bartimaeus could not see. He sat by the road.', 'Bartimée ne pouvait pas voir. Il était assis au bord de la route.', 'Bartimeu não podia ver. Ele ficava sentado na beira da estrada.', 'Bartimeo no podía ver. Estaba sentado junto al camino.'),
      S('He heard Jesus coming and shouted: Jesus, help me!', 'Il a entendu Jésus arriver et a crié : Jésus, aide-moi !', 'Ele ouviu Jesus chegando e gritou: Jesus, me ajude!', 'Oyó que Jesús venía y gritó: ¡Jesús, ayúdame!'),
      S('Jesus stopped and asked: What do you want?', 'Jésus s’est arrêté et a demandé : Que veux-tu ?', 'Jesus parou e perguntou: O que você quer?', 'Jesús se detuvo y preguntó: ¿Qué quieres?'),
      S('I want to see! And right away, he could see!', 'Je veux voir ! Et tout de suite, il a vu !', 'Eu quero ver! E na mesma hora ele passou a ver!', '¡Quiero ver! ¡Y en ese momento pudo ver!'),
    ],
    truth: S('Jesus hears me when I call him.', 'Jésus m’entend quand je l’appelle.', 'Jesus me ouve quando eu o chamo.', 'Jesús me escucha cuando lo llamo.'),
    verse: { ref: 'Psalms 34:6', text: S('I called to the Lord, and he heard me.', 'J’ai appelé le Seigneur, et il m’a entendu.', 'Clamei ao Senhor, e ele me ouviu.', 'Clamé al Señor, y él me escuchó.') },
    talk: S('You can talk to Jesus anytime. What would you ask him?', 'Tu peux parler à Jésus à tout moment. Que lui demanderais-tu ?', 'Você pode falar com Jesus a qualquer hora. O que você pediria a ele?', 'Puedes hablar con Jesús en cualquier momento. ¿Qué le pedirías?'),
    quiz: [{ q: S('Who helped Bartimaeus?', 'Qui a aidé Bartimée ?', 'Quem ajudou Bartimeu?', '¿Quién ayudó a Bartimeo?'), a: 'jesus', opts: ['jesus', 'house', 'fish'] }] },
  { id: 'zacchaeus', scene: 'zacchaeus', ref: 'Luke 19:1-10', sticker: 'tree', color: '#55efc4',
    title: S('Zacchaeus climbs a tree', 'Zachée grimpe dans un arbre', 'Zaqueu sobe na árvore', 'Zaqueo sube a un árbol'),
    pages: [
      S('Zacchaeus was very short, and he took people’s money.', 'Zachée était tout petit, et il prenait l’argent des gens.', 'Zaqueu era bem baixinho e pegava o dinheiro das pessoas.', 'Zaqueo era muy bajito y quitaba el dinero a la gente.'),
      S('He climbed a tree to see Jesus.', 'Il a grimpé dans un arbre pour voir Jésus.', 'Ele subiu numa árvore para ver Jesus.', 'Se subió a un árbol para ver a Jesús.'),
      S('Jesus looked up and said: Zacchaeus, come down! I’m coming to your house!', 'Jésus a levé les yeux et a dit : Zachée, descends ! Je viens chez toi !', 'Jesus olhou para cima e disse: Zaqueu, desça! Vou à sua casa!', 'Jesús miró hacia arriba y dijo: ¡Zaqueo, baja! ¡Voy a tu casa!'),
      S('Zacchaeus said sorry and gave the money back.', 'Zachée a demandé pardon et a rendu l’argent.', 'Zaqueu pediu desculpas e devolveu o dinheiro.', 'Zaqueo pidió perdón y devolvió el dinero.'),
    ],
    truth: S('Jesus loves me even when I do wrong. I can say sorry.', 'Jésus m’aime même quand je fais des bêtises. Je peux demander pardon.', 'Jesus me ama mesmo quando eu erro. Eu posso pedir desculpas.', 'Jesús me ama aunque me equivoque. Puedo pedir perdón.'),
    verse: { ref: 'Luke 19:10', text: S('Jesus came to find and save the lost.', 'Jésus est venu chercher et sauver ceux qui étaient perdus.', 'Jesus veio buscar e salvar o perdido.', 'Jesús vino a buscar y salvar a los perdidos.') },
    talk: S('Is there someone you need to say sorry to?', 'Y a-t-il quelqu’un à qui tu dois demander pardon ?', 'Tem alguém a quem você precisa pedir desculpas?', '¿Hay alguien a quien necesites pedir perdón?'),
    quiz: [{ q: S('Where did Zacchaeus climb?', 'Où Zachée a-t-il grimpé ?', 'Onde Zaqueu subiu?', '¿Dónde subió Zaqueo?'), a: 'tree', opts: ['boat', 'tree', 'house'] }] },
  { id: 'sheep', scene: 'sheep', ref: 'Luke 15:3-7', sticker: 'sheep', color: '#a3cb38',
    title: S('The lost sheep', 'La brebis perdue', 'A ovelha perdida', 'La oveja perdida'),
    pages: [
      S('A shepherd had one hundred sheep.', 'Un berger avait cent brebis.', 'Um pastor tinha cem ovelhas.', 'Un pastor tenía cien ovejas.'),
      S('One little sheep got lost.', 'Une petite brebis s’est perdue.', 'Uma ovelhinha se perdeu.', 'Una ovejita se perdió.'),
      S('The shepherd looked and looked until he found it.', 'Le berger a cherché, cherché, jusqu’à la retrouver.', 'O pastor procurou e procurou até encontrá-la.', 'El pastor buscó y buscó hasta encontrarla.'),
      S('He carried it home and had a party!', 'Il l’a portée à la maison et a fait la fête !', 'Ele a levou para casa e fez uma festa!', '¡La llevó a casa e hizo una fiesta!'),
    ],
    truth: S('Jesus is my good shepherd. He never stops looking for me.', 'Jésus est mon bon berger. Il ne cesse jamais de me chercher.', 'Jesus é meu bom pastor. Ele nunca desiste de mim.', 'Jesús es mi buen pastor. Nunca deja de buscarme.'),
    verse: { ref: 'John 10:11', text: S('Jesus said: I am the good shepherd.', 'Jésus dit : Je suis le bon berger.', 'Jesus disse: Eu sou o bom pastor.', 'Jesús dijo: Yo soy el buen pastor.') },
    talk: S('How does it feel to know Jesus will always find you?', 'Comment te sens-tu en sachant que Jésus te retrouvera toujours ?', 'Como é saber que Jesus sempre vai te encontrar?', '¿Cómo te sientes al saber que Jesús siempre te encontrará?'),
    quiz: [{ q: S('What got lost?', 'Qui s’est perdu ?', 'O que se perdeu?', '¿Qué se perdió?'), a: 'sheep', opts: ['fish', 'sheep', 'star'] }] },
  { id: 'love', scene: 'love', ref: 'John 13:1-17,34-35', sticker: 'heart', color: '#e84393',
    title: S('Love one another', 'Aimez-vous les uns les autres', 'Amem uns aos outros', 'Ámense unos a otros'),
    pages: [
      S('Jesus had dinner with his friends.', 'Jésus a dîné avec ses amis.', 'Jesus jantou com seus amigos.', 'Jesús cenó con sus amigos.'),
      S('He took a bowl of water and washed their dusty feet.', 'Il a pris une bassine d’eau et a lavé leurs pieds poussiéreux.', 'Ele pegou uma bacia de água e lavou os pés sujos deles.', 'Tomó un recipiente con agua y lavó sus pies sucios.'),
      S('Jesus said: I helped you. Now help each other.', 'Jésus a dit : Je vous ai servis. Maintenant, servez-vous les uns les autres.', 'Jesus disse: Eu ajudei vocês. Agora ajudem uns aos outros.', 'Jesús dijo: Yo los ayudé. Ahora ayúdense unos a otros.'),
      S('Love one another, just like I love you.', 'Aimez-vous les uns les autres, comme je vous aime.', 'Amem uns aos outros, assim como eu amo vocês.', 'Ámense unos a otros, así como yo los amo.'),
    ],
    truth: S('I can show love by helping others.', 'Je peux montrer de l’amour en aidant les autres.', 'Eu posso mostrar amor ajudando os outros.', 'Puedo mostrar amor ayudando a los demás.'),
    verse: { ref: 'John 13:34', text: S('Love one another, as I have loved you.', 'Aimez-vous les uns les autres, comme je vous ai aimés.', 'Amem uns aos outros, como eu amei vocês.', 'Ámense unos a otros, como yo los he amado.') },
    talk: S('What is one way you can help someone at home?', 'Comment peux-tu aider quelqu’un à la maison ?', 'Como você pode ajudar alguém em casa?', '¿Cómo puedes ayudar a alguien en casa?'),
    quiz: [{ q: S('Jesus wants us to…', 'Jésus veut que nous…', 'Jesus quer que nós…', 'Jesús quiere que nosotros…'), a: 'heart', opts: ['heart', 'boat', 'tomb'], say: S('Love one another!', 'Aimons-nous les uns les autres !', 'Amemos uns aos outros!', '¡Amarnos unos a otros!') }] },
  { id: 'easter', scene: 'easter', ref: 'Luke 24:1-12', sticker: 'tomb', color: '#fab1a0',
    title: S('Jesus is alive!', 'Jésus est vivant !', 'Jesus está vivo!', '¡Jesús está vivo!'),
    pages: [
      S('Some people did not like Jesus, and Jesus died on a cross.', 'Certaines personnes n’aimaient pas Jésus, et Jésus est mort sur une croix.', 'Algumas pessoas não gostavam de Jesus, e Jesus morreu numa cruz.', 'Algunas personas no querían a Jesús, y Jesús murió en una cruz.'),
      S('He did it to take away our wrong things, because he loves us.', 'Il l’a fait pour enlever nos fautes, parce qu’il nous aime.', 'Ele fez isso para tirar nossos erros, porque nos ama.', 'Lo hizo para quitar nuestras cosas malas, porque nos ama.'),
      S('His friends were very sad. They put him in a tomb.', 'Ses amis étaient très tristes. Ils l’ont mis dans un tombeau.', 'Seus amigos ficaram muito tristes. Colocaram-no num túmulo.', 'Sus amigos estaban muy tristes. Lo pusieron en una tumba.'),
      S('On Sunday the tomb was empty. Jesus is alive!', 'Le dimanche, le tombeau était vide. Jésus est vivant !', 'No domingo o túmulo estava vazio. Jesus está vivo!', 'El domingo la tumba estaba vacía. ¡Jesús está vivo!'),
    ],
    truth: S('Jesus died for me and rose again. He is alive!', 'Jésus est mort pour moi et il est ressuscité. Il est vivant !', 'Jesus morreu por mim e ressuscitou. Ele está vivo!', 'Jesús murió por mí y resucitó. ¡Está vivo!'),
    verse: { ref: 'Luke 24:6', text: S('He is not here; he has risen!', 'Il n’est pas ici, il est ressuscité !', 'Ele não está aqui; ressuscitou!', '¡No está aquí; ha resucitado!') },
    talk: S('Why do you think Jesus’ friends were so happy?', 'Pourquoi les amis de Jésus étaient-ils si heureux ?', 'Por que os amigos de Jesus ficaram tão felizes?', '¿Por qué crees que los amigos de Jesús estaban tan felices?'),
    quiz: [{ q: S('What was empty on Sunday?', 'Qu’est-ce qui était vide le dimanche ?', 'O que estava vazio no domingo?', '¿Qué estaba vacío el domingo?'), a: 'tomb', opts: ['basket', 'tomb', 'boat'] }] },
  { id: 'always', scene: 'always', ref: 'Matthew 28:16-20', sticker: 'dove', color: '#74b9ff',
    title: S('Jesus is always with me', 'Jésus est toujours avec moi', 'Jesus está sempre comigo', 'Jesús siempre está conmigo'),
    pages: [
      S('Jesus met his friends on a mountain.', 'Jésus a retrouvé ses amis sur une montagne.', 'Jesus encontrou seus amigos num monte.', 'Jesús se encontró con sus amigos en un monte.'),
      S('He said: Tell everyone about me!', 'Il a dit : Parlez de moi à tout le monde !', 'Ele disse: Contem a todos sobre mim!', 'Él dijo: ¡Hablen de mí a todo el mundo!'),
      S('Then Jesus went up to heaven.', 'Puis Jésus est monté au ciel.', 'Depois Jesus subiu ao céu.', 'Después Jesús subió al cielo.'),
      S('He promised: I am with you always!', 'Il a promis : Je suis avec vous tous les jours !', 'Ele prometeu: Estou com vocês todos os dias!', 'Él prometió: ¡Estoy con ustedes siempre!'),
    ],
    truth: S('Jesus is with me everywhere I go.', 'Jésus est avec moi partout où je vais.', 'Jesus está comigo aonde eu for.', 'Jesús está conmigo a donde vaya.'),
    verse: { ref: 'Matthew 28:20', text: S('I am with you always.', 'Je suis avec vous tous les jours.', 'Estou com vocês todos os dias.', 'Yo estoy con ustedes siempre.') },
    talk: S('Who can you tell about Jesus?', 'À qui peux-tu parler de Jésus ?', 'Para quem você pode contar sobre Jesus?', '¿A quién puedes hablarle de Jesús?'),
    quiz: [{ q: S('Who is always with you?', 'Qui est toujours avec toi ?', 'Quem está sempre com você?', '¿Quién está siempre contigo?'), a: 'jesus', opts: ['jesus', 'boat', 'tree'] }] },
];

// Old Testament first (in Bible order), then the life of Jesus.
const OT_ORDER = ['creation', 'noah', 'abraham', 'joseph', 'babymoses', 'redsea', 'jericho', 'ruth', 'samuel', 'david', 'jonah', 'daniel', 'esther'];
const all = [...BASE_STORIES, ...OT_STORIES.map(st => ({ ...st, scene: st.id }))].map(st => ({ ...st, pages: TALES[st.id]?.pages || st.pages, summary: TALES[st.id]?.summary, part: OT_ORDER.includes(st.id) ? 'ot' : 'nt' }));
// A story appears once its pictures exist (painted or drawn) and its quiz pictures exist.
const ok = st => hasArt(st.id) && hasPic(st.sticker) && st.quiz.every(q => q.opts.every(hasPic));
export const STORIES = [...all.filter(st => st.part === 'nt'), ...OT_ORDER.map(id => all.find(st => st.id === id))].filter(ok);

// Words for the picture cards (said aloud in games).
export const PIC_WORDS = {
  star: S('Star', 'Étoile', 'Estrela', 'Estrella'), baby: S('Baby Jesus', 'Bébé Jésus', 'Bebê Jesus', 'Bebé Jesús'), boat: S('Boat', 'Bateau', 'Barco', 'Barca'),
  fish: S('Fish', 'Poisson', 'Peixe', 'Pez'), bread: S('Bread', 'Pain', 'Pão', 'Pan'), sheep: S('Sheep', 'Brebis', 'Ovelha', 'Oveja'), heart: S('Love', 'Amour', 'Amor', 'Amor'),
  tree: S('Tree', 'Arbre', 'Árvore', 'Árbol'), sun: S('Sun', 'Soleil', 'Sol', 'Sol'), dove: S('Dove', 'Colombe', 'Pomba', 'Paloma'), tomb: S('Empty tomb', 'Tombeau vide', 'Túmulo vazio', 'Tumba vacía'),
  basket: S('Lunch basket', 'Panier du repas', 'Cesta de lanche', 'Canasta del almuerzo'), people: S('People', 'Les gens', 'Pessoas', 'Personas'), jesus: S('Jesus', 'Jésus', 'Jesus', 'Jesús'),
  house: S('House', 'Maison', 'Casa', 'Casa'), bandage: S('Bandage', 'Pansement', 'Curativo', 'Venda'),
  ark: S('Big boat', 'Grand bateau', 'Arca', 'Arca'), rainbow: S('Rainbow', 'Arc-en-ciel', 'Arco-íris', 'Arcoíris'), coat: S('Colorful coat', 'Manteau de couleurs', 'Túnica colorida', 'Túnica de colores'),
  reeds: S('Basket on the river', 'Panier sur le fleuve', 'Cestinho no rio', 'Canasta en el río'), staff: S('Shepherd’s stick', 'Bâton', 'Cajado', 'Vara'), trumpet: S('Trumpet', 'Trompette', 'Trombeta', 'Trompeta'),
  wall: S('Wall', 'Muraille', 'Muralha', 'Muralla'), wheat: S('Wheat', 'Blé', 'Trigo', 'Trigo'), lamp: S('Lamp', 'Lampe', 'Lâmpada', 'Lámpara'), sling: S('Sling and stone', 'Fronde et pierre', 'Funda e pedra', 'Honda y piedra'),
  whale: S('Big fish', 'Gros poisson', 'Grande peixe', 'Gran pez'), lion: S('Lion', 'Lion', 'Leão', 'León'), crown: S('Crown', 'Couronne', 'Coroa', 'Corona'),
};

// Life of Jesus in order (for the "put in order" game).
export const JESUS_ORDER = ['christmas', 'friends', 'storm', 'easter', 'always'];
