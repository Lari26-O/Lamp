// Picture descriptions used to make Lamp's kids illustrations (see tools/make-art.py).
// One shared style + recurring character descriptions keep every picture consistent.
export const STYLE = "2D cartoon illustration for a children's Bible storybook app, clean bold dark-brown outlines, soft cel shading, vibrant warm colors, cute friendly characters with big expressive eyes, ancient Middle East Bible-times setting, any people shown wear simple tunics, robes, head scarves and sandals, only the characters described, lush detailed background, joyful, wholesome, no text, no letters, no words, no watermark";
const JESUS = 'Jesus (kind man with long brown hair and a short brown beard, white robe with a red sash, warm smile)';
const MARY = 'Mary (young woman in a white dress and a blue head veil)';
const JOSEPH = 'Joseph (man with a short dark beard in a brown robe)';
const PETER = 'Peter (fisherman with a black beard in an orange robe)';
const KIDS = 'happy little children of different skin colors in colorful Bible-times tunics';
const MOSES = 'Moses (man with a gray-brown beard in a red-brown robe holding a wooden staff)';
const DAVID = 'David (a shepherd boy with curly red-brown hair in a light blue tunic)';

export const SCENES = {
  creation: [
    'bright light bursting out of darkness over a new world, swirling sparkles, beautiful sunrise, nature only, no people, no humans',
    'blue sky, ocean waves meeting a green land with hills, fluffy clouds, nature only, no people, no humans',
    'trees, colorful flowers, a smiling sun in the sky, and a crescent moon with stars on the other side, day meets night, nature only, no people, no humans',
    'happy animals: an elephant, a giraffe, a lion, rabbits, colorful birds flying, fish jumping in a river, nature only, no people, no humans',
    'a happy man and woman (Adam and Eve, in simple tunics made of leaves) in a beautiful garden with gentle animals',
    'a wide beautiful garden world full of animals, flowers, a rainbow and a waterfall, everything glowing, nature only, no people, no humans',
  ],
  christmas: [
    `a glowing friendly angel with white wings appearing to ${MARY} in a small house, she is surprised and happy`,
    `${MARY} riding a little gray donkey led by ${JOSEPH} on a road toward the town of Bethlehem at sunset`,
    `${MARY} and ${JOSEPH} at a cozy wooden stable with a cow, sheep and a donkey, the town behind them full of houses`,
    `baby Jesus sleeping in a hay manger, ${MARY} and ${JOSEPH} smiling, warm lantern light, big bright star shining above the stable`,
    'friendly angels singing in a starry night sky above surprised shepherds and sheep on a hill',
    `shepherds kneeling happily around baby Jesus in the manger with ${MARY} and ${JOSEPH}, sheep nearby, starlight`,
  ],
  friends: [
    `${PETER} and his fishermen friends in a wooden fishing boat at dawn, pulling up an empty net, looking tired`,
    `${JESUS} walking along the shore of a lake in the morning, a crowd of people following him`,
    `${JESUS} sitting in a wooden boat near the shore, teaching a crowd of people on the beach`,
    `${JESUS} in the boat pointing to the water, ${PETER} holding a net, looking unsure`,
    `fishermen in a boat pulling a net bursting with shiny jumping fish, amazed happy faces, ${JESUS} smiling`,
    `${JESUS} walking on the beach with ${PETER} and other fishermen following him, boats left behind on the sand`,
  ],
  storm: [
    `${JESUS} and his friends getting into a wooden sailing boat on a calm lake at sunset`,
    `${JESUS} sleeping peacefully on a pillow at the back of a wooden boat, friends rowing, evening sky`,
    'a small wooden boat tossed on big rolling waves in a storm, dark clouds, rain and lightning, cartoon style, not scary',
    `scared friends in the boat waking up ${JESUS}, waves splashing over the side, wind and rain`,
    `${JESUS} standing in a wooden boat on the lake with one hand raised, the waves calming down, sunlight breaking through gray clouds, his friends amazed`,
    `a wooden boat on a calm peaceful lake under a clear sky with a rainbow, ${JESUS} and amazed smiling friends`,
  ],
  feeding: [
    `${JESUS} sitting on a green hillside talking to a huge happy crowd of families`,
    'a big crowd of families on a hillside in the late afternoon, tired and hungry, rubbing their tummies',
    `${JESUS}'s friends looking worried, holding out empty hands, a big crowd behind them`,
    `a smiling little boy holding a basket with five round loaves of bread and two fish, offering it`,
    `${JESUS} holding up the bread and fish and praying, looking up to the sky, the boy beside him`,
    'a huge happy crowd eating bread and fish together on a green hillside, twelve baskets full of leftovers',
  ],
  children: [
    `moms and dads walking with ${KIDS} along a village path, excited`,
    `${KIDS} skipping and running down a dirt path toward a crowd, laughing`,
    `grown-up disciples frowning and holding up their hands to stop ${KIDS}`,
    `${KIDS} looking sad, standing by a path, a crowd of grown-ups in the way`,
    `${JESUS} kneeling with open arms, welcoming ${KIDS} running to him`,
    `${JESUS} hugging and blessing happy ${KIDS} in a sunny flower meadow, hearts of joy`,
  ],
  samaritan: [
    `${JESUS} sitting on a rock telling a story to a group of curious people`,
    'a traveler with a bandage on his head sitting hurt by a rocky desert road, sad but safe, gentle cartoon, no blood',
    'a priest in fancy robes walking past a hurt man on a desert road, looking away',
    'another traveler walking past on the other side of the desert road, not stopping',
    'a kind traveler in a green robe kneeling to help a hurt man, giving water and a bandage, his donkey waiting',
    'the kind traveler helping the hurt man ride a donkey to a cozy inn, the innkeeper welcoming them',
  ],
  blind: [
    'a man (Bartimaeus) with closed eyes sitting by a dusty road outside a town gate, holding a cup, people walking by',
    'Bartimaeus with closed eyes listening, a crowd coming down the road in the distance',
    'Bartimaeus with closed eyes shouting with his hands raised as a crowd walks by',
    'people in the crowd telling Bartimaeus to be quiet, he keeps calling out',
    `${JESUS} kneeling kindly in front of Bartimaeus, gently talking to him`,
    `Bartimaeus with wide open happy eyes jumping for joy, following ${JESUS}, bright colorful world`,
  ],
  zacchaeus: [
    'a short man (Zacchaeus) in a fancy blue robe counting a pile of coins at a table, unhappy people waiting',
    'Zacchaeus, a very short man, standing alone while people turn away from him in a busy street',
    'Zacchaeus the short man climbing a big leafy sycamore tree to see over a crowd',
    `${JESUS} looking up and smiling at Zacchaeus sitting in a tree branch`,
    `Zacchaeus climbing down the tree happily, ${JESUS} waiting with open arms`,
    'a happy Zacchaeus giving coins back to smiling villagers in front of his house',
  ],
  sheep: [
    `${JESUS} telling a story to children sitting on the grass`,
    'a kind shepherd with a staff counting a big flock of fluffy white sheep at sunset',
    'one little lost fluffy lamb alone among big rocks and bushes, looking around',
    'a shepherd searching over hills and behind bushes, calling out',
    'a happy shepherd carrying a little lamb on his shoulders home',
    'the shepherd and his friends having a happy party with the sheep, music and food',
  ],
  love: [
    `${JESUS} sharing dinner with his friends at a long low wooden table with bread and cups, lamplight`,
    'friends at a table looking at their dusty feet, a water jar and towel nearby, nobody moving',
    `${JESUS} standing up with a towel around his waist, carrying a bowl of water`,
    `${JESUS} kneeling with a bowl of water, washing ${PETER}'s feet, Peter surprised`,
    `${JESUS} talking gently to his friends around the table, everyone listening`,
    `${KIDS} helping each other, sharing and hugging, hearts floating in the air`,
  ],
  easter: [
    `${JESUS} teaching in a city while some grumpy men in fancy robes whisper together, gentle for children`,
    'three empty wooden crosses on a quiet hill at sunset, soft colors, peaceful, gentle for children',
    'sad friends rolling a big round stone in front of a garden tomb, evening light',
    'women carrying jars arriving at a garden tomb at sunrise, the big stone rolled away',
    'a shining angel sitting on the rolled-away stone, telling surprised women the good news',
    `${JESUS} alive and smiling with open arms greeting his amazed happy friends, bright morning light, flowers`,
  ],
  always: [
    `${JESUS} with his friends on a green mountain top under a blue sky`,
    `${JESUS} pointing to faraway towns, telling his friends to go and tell everyone`,
    `${JESUS} rising up into bright clouds with his arms open, friends looking up in wonder`,
    'friends looking up at the sky, two angels in white standing beside them',
    'friends happily telling people from many countries about Jesus in a busy market',
    `${JESUS} with ${KIDS} around him, golden light, hearts, peaceful and happy`,
  ],
  noah: [
    'Noah (old man with a white beard in a brown robe) praying under the sky while people nearby ignore God',
    'Noah hammering wood to build a giant wooden ark, his family helping',
    'animals walking two by two up a ramp into a giant wooden ark: lions, giraffes, elephants, zebras, rabbits',
    'the big wooden ark floating on a rainy sea, animals peeking out of the windows, cozy and safe',
    'a white dove with a green olive leaf flying to Noah at the ark window, sun coming out',
    'Noah, his family and the animals on green land under a huge beautiful rainbow',
  ],
  abraham: [
    'Abraham (man with a gray beard in a blue robe) and Sarah (woman in a pink veil) in front of a busy ancient city, looking up as God speaks',
    'Abraham and Sarah packing tents onto camels, ready for a long trip',
    'Abraham and Sarah walking with camels, sheep and tents across a wide golden land',
    'Abraham and Sarah sitting sadly outside their tent in the evening',
    'Abraham looking up at a sky full of countless shining stars at night, amazed',
    'Abraham and Sarah laughing with joy holding their baby boy Isaac outside their tent',
  ],
  joseph: [
    'a happy boy (Joseph) wearing a beautiful coat with many colors, his father hugging him, brothers watching',
    'jealous brothers frowning, a caravan with camels taking young Joseph far away',
    'Joseph alone in Egypt near pyramids, looking up, a warm light around him showing God is with him',
    'Joseph as a grown leader in fine Egyptian clothes, storing grain in big granaries, people bringing food',
    'hungry brothers bowing in front of Joseph the leader in a palace, they do not recognize him',
    'Joseph hugging his brothers with tears of joy, sharing food with them',
  ],
  babymoses: [
    'a grumpy Egyptian king on a throne giving orders, palace with columns, gentle for children',
    'a mother in a simple dress cuddling a cute baby boy at home, warm light',
    'the mother gently placing the baby in a little woven basket among the tall reeds of a river',
    'a girl (Miriam) hiding in tall river grass watching the little basket float',
    'a kind Egyptian princess finding the baby in the basket at the river, smiling',
    'the princess holding baby Moses lovingly in the palace garden, Miriam smiling nearby',
  ],
  redsea: [
    `${MOSES} standing on a hill, light from the sky, people gathered below`,
    'many families walking out of Egypt with children, sheep, goats and carts',
    'the people stopped in front of a big sea, chariots in the distance behind them, worried faces',
    `${MOSES} lifting his staff as the sea splits open into two walls of water`,
    'families walking on a dry path between two giant walls of blue water with fish visible inside',
    'Miriam playing a tambourine, people dancing and singing on the beach on the other side',
  ],
  jericho: [
    'Joshua (man in armor with a short beard) looking at the big walled city of Jericho',
    'Joshua listening to God, light shining down, his people waiting',
    'people quietly marching around the big walls of Jericho with fingers on their lips',
    'priests blowing ram horn trumpets in front of the city walls',
    'all the people shouting with raised arms near the walls of Jericho',
    'the big walls of Jericho falling down in a dusty crash, people cheering, gentle for children',
  ],
  ruth: [
    'an older woman (Naomi) in a gray veil looking sad, sitting alone',
    'a young woman (Ruth) in a green dress hugging Naomi on a road',
    'Ruth and Naomi walking together on a long road toward Bethlehem',
    'Ruth gathering wheat in a golden field at harvest time',
    'a kind farmer (Boaz) talking to Ruth in the wheat field, offering her grain',
    'Boaz, Ruth and Naomi smiling together with a new baby, happy family',
  ],
  samuel: [
    'a little boy (Samuel) in a simple robe helping an old priest (Eli) with a white beard in a temple',
    'Samuel lying on a mat at night in the temple, an oil lamp glowing, waking up to a voice',
    'Samuel running to old Eli at night, Eli sleepy in bed',
    'old Eli explaining to Samuel kindly, both in lamplight',
    'Samuel lying down listening, hands together, a soft heavenly light around him',
    'Samuel as a happy older boy praying in the morning sun',
  ],
  david: [
    `${DAVID} playing a harp and singing on a hill, sheep around him`,
    `${DAVID} looking up at a huge giant soldier (Goliath) in armor in a valley, soldiers on both sides`,
    'a giant in armor (Goliath) shouting, soldiers hiding behind shields, cartoon not scary',
    `${DAVID} talking bravely to the king, pointing up to the sky`,
    `${DAVID} picking five smooth stones from a little stream, holding a sling`,
    `${DAVID} cheering after the giant fell down, soldiers celebrating, gentle cartoon, no blood`,
  ],
  jonah: [
    'Jonah (man with a short brown beard in a green robe) hearing God, light from the sky',
    'Jonah running away onto a ship at a port',
    'a big friendly whale-like fish swallowing Jonah in a stormy sea, cartoon not scary',
    'Jonah praying inside the belly of the big fish, dark but cozy with a little light',
    'the big fish spitting Jonah out onto a sunny beach',
    'Jonah talking to the people of the big city of Nineveh, people listening and kneeling',
  ],
  daniel: [
    'Daniel (young man with dark hair in a purple robe) praying at an open window three times a day',
    'jealous men whispering to the king on his throne, gentle for children',
    'Daniel praying calmly at his window while men peek from behind a door',
    'Daniel being lowered into a pit with big lions, the king looking sad, cartoon not scary',
    'Daniel sitting peacefully in the pit with sleepy friendly lions lying around him like big kitties, a glowing angel',
    'the happy king pulling Daniel out of the lion pit in the morning sunshine',
  ],
  esther: [
    'a beautiful young queen (Esther) with dark hair and a golden crown, the king choosing her in a palace',
    'a grumpy man in fancy clothes (Haman) frowning, plotting, gentle for children',
    'Esther listening to her cousin Mordecai (man with a gray beard) in a palace garden',
    'Esther kneeling and praying for courage in her room',
    'the king on his throne smiling and holding out a golden scepter to Esther',
    'God\'s people celebrating and dancing happily in the streets, Esther smiling',
  ],
};

// One coloring page per story (black-and-white line art).
export const COLOR_STYLE = 'black and white coloring book page for young children, thick clean black outlines only, simple large shapes, no shading, no gray, pure white background, no text';
export const COLOR = {
  creation: 4, christmas: 4, friends: 5, storm: 6, feeding: 4, children: 6, samaritan: 5, blind: 6, zacchaeus: 3, sheep: 5, love: 6, easter: 6, always: 6,
  noah: 3, abraham: 5, joseph: 1, babymoses: 3, redsea: 5, jericho: 4, ruth: 4, samuel: 2, david: 5, jonah: 3, daniel: 5, esther: 5,
};

// Sticker / picture cards.
export const PIC_STYLE = "single cute sticker icon for a children's Bible app, centered, thick clean dark outline, cel shading, vibrant colors, isolated on a plain white background, no text";
export const PICS = {
  star: 'a shiny golden star with a happy glow', baby: 'baby Jesus sleeping in a little hay manger', boat: 'a small wooden sailing boat on little blue waves',
  fish: 'a cute smiling blue fish', bread: 'a round golden loaf of bread', sheep: 'a cute fluffy white lamb', heart: 'a glossy red heart',
  tree: 'a round leafy green tree with red fruit', sun: 'a smiling bright yellow sun', dove: 'a white dove with an olive branch',
  tomb: 'an open stone garden tomb with a round stone and flowers', basket: 'a woven basket with five loaves and two fish', people: 'two happy children holding hands',
  jesus: `${JESUS} smiling with open arms, full body`, house: 'a small Bible-times house with a flat roof and a wooden door', bandage: 'a friendly first-aid bandage',
  ark: "Noah's big wooden ark boat with animals peeking out", rainbow: 'a bright rainbow with two fluffy clouds', coat: 'a coat with many bright colorful stripes',
  reeds: 'a little woven baby basket floating among river reeds', staff: "a wooden shepherd's staff", trumpet: "a ram's horn trumpet",
  wall: 'a big stone city wall with a gate', wheat: 'a bundle of golden wheat', lamp: 'an old clay oil lamp with a small flame',
  sling: 'a leather sling and five smooth stones', whale: 'a big friendly smiling whale', lion: 'a cute friendly lion', crown: 'a golden queen crown with jewels',
};
