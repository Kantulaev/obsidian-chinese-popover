/**
 * Chinese Idioms (成语 Chengyu) Origin Stories & Metaphors
 */

export interface ChengyuStory {
  idiom: string;
  literal: string;
  figurative: string;
  storyRu: string;
  storyEn: string;
  dynasty?: string;
}

export const CHENGYU_DATABASE: Record<string, ChengyuStory> = {
  "画蛇添足": {
    idiom: "画蛇添足",
    literal: "Пририсовать змее ноги",
    figurative: "Сделать ненужное добавление, испортить дело лишним усердием (перестараться).",
    storyRu: "В царстве Чу после жертвоприношения слугам пожаловали кувшин вина. Они решили: кто быстрее нарисует змею на земле, тому и достанется вино. Один слуга закончил первым, но, возгордившись, сказал: «Я успею даже пририсовать ей ноги!» Пока он рисовал ноги, другой слуга закончил свою змею, выхватил кувшин и сказал: «У змей нет ног! Ты нарисовал не змею».",
    storyEn: "In the State of Chu, servants competed for a pot of wine by drawing a snake on the ground. The fastest finisher had time to spare and bragged: 'I can even add feet to mine!' While he drew legs, another servant finished, took the wine, and said: 'Snakes don't have feet!'",
    dynasty: "Период Сражающихся царств (战国)",
  },
  "拔苗助长": {
    idiom: "拔苗助长",
    literal: "Тянуть ростки вверх, помогая им расти",
    figurative: "Оказать медвежью услугу; спешкой только навредить естественному процессу.",
    storyRu: "Один нетерпеливый крестьянин из царства Сун переживал, что его посевы растут слишком медленно. Он пошел в поле и целый день вручную вытягивал каждый росток на несколько сантиметров из земли. Довольный, он вернулся домой и сказал семье: «Я так устал, но помог рису подрасти!» На следующий день его сын побежал в поле и увидел, что все посевы засохли.",
    storyEn: "An impatient farmer in the Song State pulled each sprout of his rice crops up by an inch to help them grow faster. He returned home exhausted but proud. The next morning, his son ran to the field only to find that all the seedlings had withered and died.",
    dynasty: "Период Вёсен и Осеней (春秋)",
  },
  "掩耳盗铃": {
    idiom: "掩耳盗铃",
    literal: "Затыкать уши, воруя колокол",
    figurative: "Заниматься самообманом; прятать голову в песок, думая, что другие ничего не замечают.",
    storyRu: "Вор решил украсть тяжелый бронзовый колокол. Поднять его целиком не получалось, и он решил разбить колокол молотом. При первом же ударе раздался оглушительный звон. Испугавшись, что сбегутся люди, вор заткнул себе уши ватой, решив: «Раз я ничего не слышу, значит, и никто не слышит!» И продолжил колотить.",
    storyEn: "A thief tried to steal a huge bronze bell by smashing it with a hammer. The first strike rang out loudly. Terrified of being caught, he plugged his own ears, assuming that if he couldn't hear the clang, no one else could either.",
    dynasty: "Династия Хань (汉朝)",
  },
  "井底之蛙": {
    idiom: "井底之蛙",
    literal: "Лягушка на дне колодца",
    figurative: "Человек с крайне узким кругозором и ограниченным мышлением, считающий свой мирок всем миром.",
    storyRu: "Лягушка жила на дне заброшенного колодца и считала себя хозяйкой вселенной: «Какая прекрасная жизнь! Весь колодец мой, и небо у меня над головой». Однажды к колодцу подошла огромная морская черепаха из Восточного моря. Лягушка позвала ее в гости, но черепаха даже не смогла протиснуть лапу в узкий колодец и рассказала лягушке о бескрайней ширине и глубине океана. Лягушка онемела от изумления и стыда.",
    storyEn: "A frog lived inside an abandoned well, boasting that he ruled the world. When a giant sea turtle visited and described the boundless expanse of the ocean, the frog was left speechless with shock at how narrow his perspective truly was.",
    dynasty: "Период Чжуан-цзы (庄子)",
  },
  "塞翁失马": {
    idiom: "塞翁失马",
    literal: "Старик с границы потерял лошадь",
    figurative: "Нет худа без добра; временная потеря может обернуться неожиданной удачей.",
    storyRu: "У старика с северной границы убежала прекрасная лошадь. Соседи пришли утешать его, но он сказал: «А вдруг это к добру?» Через пару месяцев лошадь вернулась, ведя за собой табун диких скакунов. Соседи стали поздравлять старика, а он ответил: «А вдруг это к беде?» Сын старика полюбил кататься на диких лошадях, упал и сломал ногу. Соседи вновь пришли сочувствовать: «А вдруг это к счастью?» Вскоре началась война, всех юношей забрали на фронт, где большинство погибло, а хромой сын остался жив.",
    storyEn: "An old frontiersman lost his horse. When neighbors sympathized, he said: 'Who knows if this isn't a blessing?' Later, the horse returned with a fine herd of steeds. When neighbors celebrated, he cautioned: 'Who knows if this isn't a disaster?' His son fell from a horse and became lame, sparing him from conscription in a bloody war.",
    dynasty: "Хуайнань-цзы (淮南子)",
  },
  "对牛弹琴": {
    idiom: "对牛弹琴",
    literal: "Играть на лютне перед коровой",
    figurative: "Метать бисер перед свиньями; тратить мудрые слова на того, кто не способен их понять.",
    storyRu: "Знаменитый музыкант Гунмин И однажды увидел на лугу корову и решил сыграть для нее на цине самые изысканные классические мелодии. Корова продолжала спокойно щипать траву, не обращая внимания. Тогда музыкант сымитировал на струнах жужжание слепня и жалобный писк теленка — корова тут же насторожила уши и замахала хвостом.",
    storyEn: "The famous musician Gongming Yi played sublime classical music to a grazing cow. The cow ignored him. When he imitated the buzzing of flies and the cry of a calf, the cow immediately twitched its ears and listened.",
    dynasty: "Хань (汉朝)",
  },
  "守株待兔": {
    idiom: "守株待兔",
    literal: "Сторожить пень в ожидании зайца",
    figurative: "Ждать у моря погоды; надеяться на случайную удачу вместо честного труда.",
    storyRu: "Крестьянин пахал поле и увидел, как испуганный заяц со всего размаха врезался в древесный пень и сломал шею. Крестьянин обрадовался легкой добыче, бросил плуг и стал целыми днями сидеть у пня в ожидании нового зайца. Поле заросло сорняками, а крестьянин стал всеобщим посмешищем.",
    storyEn: "A farmer saw a rabbit accidentally run into a tree stump and break its neck. Delighted with the free meal, he abandoned his farming tools and sat by the stump every day waiting for more rabbits, while his crops were overgrown with weeds.",
    dynasty: "Хань Фэй-цзы (韩非子)",
  },
  "自相矛盾": {
    idiom: "自相矛盾",
    literal: "Копье против своего же щита",
    figurative: "Впадать в противоречие; несоответствие слов действительности.",
    storyRu: "Торговец оружием расхваливал свои товары на базаре: «Мои щиты столь прочны, что ничто в мире не может пробить их!» Следом он поднял копье: «А мои копья столь остры, что пронзят абсолютно любой предмет!» Прохожий подошел и спросил: «А что случится, если твоим копьем ударить по твоему же щиту?» Торговец не нашел что ответить.",
    storyEn: "A vendor boasted that his shields were impenetrable to any weapon, and then claimed his spears could pierce anything. A bystander asked: 'What happens if your spear strikes your shield?' The vendor had no answer.",
    dynasty: "Хань Фэй-цзы (韩非子)",
  },
};

/**
 * Checks if a word is an idiom with an ancient story
 */
export function getChengyuStory(word: string): ChengyuStory | null {
  if (!word) return null;
  return CHENGYU_DATABASE[word.trim()] || null;
}
