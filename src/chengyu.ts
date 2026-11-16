/**
 * Chinese Idioms (成语 Chengyu) Origin Stories & Metaphors
 * Features curated classic idiom fables + dynamic online fetching capability.
 */

import { requestUrl } from "obsidian";

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
  "胸有成竹": {
    idiom: "胸有成竹",
    literal: "Иметь готовый бамбук в сердце",
    figurative: "Иметь четкий продуманный план заранее; быть полностью уверенным в успехе.",
    storyRu: "Художник Вэнь Тун славился мастерством рисования бамбука. Прежде чем взять кисть в руки, он подолгу наблюдал за бамбуком во все времена года, в дождь и ветер. Когда его спросили о секрете мастерства, поэт Су Ши ответил: «Когда Вэнь Тун рисует бамбук, у него в сердце бамбук уже полностью созрел».",
    storyEn: "The painter Wen Tong spent years observing bamboo in all seasons. When asked his secret, poet Su Shi noted: 'Before he ever touched a brush, the fully formed bamboo was already grown in his heart.'",
    dynasty: "Династия Сун (宋朝)",
  },
  "望梅止渴": {
    idiom: "望梅止渴",
    literal: "Утолять жажду взглядом на сливы",
    figurative: "Утешать себя иллюзиями; подбадривать мечтами о скором благе.",
    storyRu: "Полководец Цао Цао вел армию по безводной пустыне под палящим солнцем. Солдаты изнемогали от жажды и падали без сил. Тогда Цао Цао выехал вперед и крикнул: «Впереди за холмом растет огромный лес кислых слив!» При мысли о кислых сливах у солдат выделилась слюна, жажда отступила, и войско смогло дойти до настоящего источника воды.",
    storyEn: "Cao Cao led his parched soldiers across a hot desert. Seeing them collapse from thirst, he pointed ahead and announced an orchard of sour plums. Imagining the tart fruit caused their mouths to water, refreshing them enough to reach water.",
    dynasty: "Троецарствие (三国)",
  },
  "破釜沉舟": {
    idiom: "破釜沉舟",
    literal: "Разбить котлы и потопить лодки",
    figurative: "Сжечь за собой мосты; решиться на отчаянный шаг, отрезав все пути к отступлению.",
    storyRu: "Полководец Сян Юй переправил войско через реку Чжан для битвы с превосходящей армией Цинь. Переправившись, он приказал потопить все лодки, разбить все походные котлы и взять сухой паек всего на три дня. Солдаты поняли: либо победить, либо умереть. Они сражались с невиданной яростью и одержали сокрушительную победу.",
    storyEn: "General Xiang Yu crossed the river to battle Qin forces, ordering his men to sink their own ships and smash their cooking cauldrons, carrying only three days of food. With retreat impossible, his army fought furiously and won.",
    dynasty: "Династия Цинь / Хань (秦汉)",
  },
  "画龙点睛": {
    idiom: "画龙点睛",
    literal: "Дорисовать дракону зрачки",
    figurative: "Нанести решающий завершающий штрих, оживляющий всё произведение или замысел.",
    storyRu: "Знаменитый художник Чжан Сэнъяо нарисовал четырех драконов на стене храма, но намеренно не стал рисовать им зрачки. Он объяснил: «Если пририсовать глаза, драконы оживут и улетят». Зрители посчитали это бахвальством и стали настаивать. Тогда мастер дорисовал зрачки двум драконам. В тот же миг грянул гром, сверкнула молния, стена раскололась, и два дракона взмыли в грозовые облака.",
    storyEn: "Artist Zhang Sengyao painted four dragons without pupils, claiming they would come alive and fly away if finished. Under pressure from disbelief, he dotted the eyes of two; thunder struck, and they broke from the wall and flew into the sky.",
    dynasty: "Южные династии (南朝)",
  },
  "狐假虎威": {
    idiom: "狐假虎威",
    literal: "Лиса пользуется могуществом тигра",
    figurative: "Кичиться чужим авторитетом; запугивать других, прикрываясь покровителем.",
    storyRu: "Тигр поймал лису и собрался ее съесть. Хитница заявила: «Ты не смеешь есть меня! Небесный владыка назначил меня повелительницей всех зверей. Если не веришь, иди позади меня и посмотри, как звери будут трепетать от страха». Лиса пошла впереди, а тигр за ней. Все лесные звери в ужасе разбегались при виде тигра, но глупый хищник думал, что они боятся лисы.",
    storyEn: "A tiger caught a fox, who claimed Heaven had crowned her king of all beasts. She challenged the tiger to walk behind her through the forest. When all the animals fled in terror from the tiger, the tiger foolishly believed they were terrified of the fox.",
    dynasty: "Период Сражающихся царств (战国)",
  },
  "盲人摸象": {
    idiom: "盲人摸象",
    literal: "Слепые ощупывают слона",
    figurative: "Судить о целом по отдельной детали; близорукий однобокий взгляд.",
    storyRu: "Несколько незрячих людей решили узнать, что такое слон. Первый потрогал хобот и сказал: «Слон похож на толстый канат». Второй потрогал ногу: «Нет, слон — как колонна». Третий ощупал живот: «Слон плоский, как стена!» Четвертый потрогал хвост: «Вы все ошибаетесь, слон похож на метлу». Каждый считал свою часть абсолютной истиной.",
    storyEn: "Blind men examined an elephant. Touching the trunk, one called it a thick rope; touching the leg, another called it a pillar; touching the flank, a third called it a wall. Each mistook a single part for the complete truth.",
    dynasty: "Буддийская сутра (佛经)",
  },
  "亡羊补牢": {
    idiom: "亡羊补牢",
    literal: "Чинить загон после пропажи овцы",
    figurative: "Лучше поздно, чем никогда; принять меры во избежание дальнейших потерь.",
    storyRu: "У пастуха пропала овца из-за дыры в заборе. Соседи посоветовали починить загон, но он отмахнулся: «Овца уже пропала, зачем чинить?» На следующую ночь волк утащил еще одну овцу. Тогда пастух раскаялся, заделал дыру в заборе, и больше волки не могли проникнуть в овчарню.",
    storyEn: "A shepherd lost a sheep through a gap in the pen. He ignored advice to fix it until a second sheep was taken. He then repaired the pen, preventing any future losses.",
    dynasty: "Период Сражающихся царств (战国)",
  },
  "南辕北辙": {
    idiom: "南辕北辙",
    literal: "Оглобли на юг, а колея на север",
    figurative: "Действовать вопреки своей цели; двигаться в противоположную от успеха сторону.",
    storyRu: "Путник ехал в южное царство Чу, но его повозка двигалась на север. Прохожий спросил: «Царство Чу на юге, почему ты едешь на север?» Путник ответил: «У меня отличные кони, опытный кучер и много денег!» Прохожий покачал головой: «Чем лучше твои кони и больше денег, тем дальше ты уедешь от своей цели».",
    storyEn: "A traveler bound for the southern state of Chu was driving north. Boasting of his fast horses, skilled driver, and abundant funds, he failed to see that the better his resources, the farther he drove from his destination.",
    dynasty: "Период Сражающихся царств (战国)",
  },
  "杯弓蛇影": {
    idiom: "杯弓蛇影",
    literal: "Тень лука в чаше кажется змеей",
    figurative: "Мнительность; пугаться несуществующей опасности из-за собственной тревожности.",
    storyRu: "Человек пил вино в гостях у друга и заметил в чаше маленькую змею. Из вежливости он допил вино, но дома слег от страха и тошноты, решив, что проглотил змею. Друг пришел навестить его и понял в чем дело: на стене висел красный лук, тень которого падала в чашу. Он показал это больному, и тот мгновенно выздоровел.",
    storyEn: "A guest drank wine, mistaking the reflection of a wall-mounted bow for a snake. He fell seriously ill from anxiety until his host demonstrated the optical illusion, instantly curing his worry.",
    dynasty: "Династия Хань (汉朝)",
  },
  "叶公好龙": {
    idiom: "叶公好龙",
    literal: "Господин Е любит драконов",
    figurative: "Показная любовь на словах; любить видимость, но бояться реального дела.",
    storyRu: "Господин Е всем рассказывал, как страстно он любит драконов. Он приказал вырезать драконов на балках дома и выткать на всей одежде. Небесный настоящий дракон был тронут такой преданностью и спустился навестить господина Е. Увидев гигантскую пасть в окне и хвост в дверях, господин Е побледнел от ужаса и в панике убежал.",
    storyEn: "Lord Ye professed to adore dragons, decorating his home with carvings of them. Touched by this, a real dragon visited him; terrified out of his wits, Lord Ye fled in panic.",
    dynasty: "Период Сражающихся царств (战国)",
  },
  "买椟还珠": {
    idiom: "买椟还珠",
    literal: "Купить шкатулку и вернуть жемчужину",
    figurative: "Пренебречь сутью ради мишуры; не уметь отличать главное от второстепенного.",
    storyRu: "Торговец из царства Чу продавал редкую жемчужину. Он сделал для нее роскошную шкатулку из сандала, инкрустировал золотом и нефритом. Покупатель из царства Чжэн восхитился мастерством, заплатил высокую цену, забрал шкатулку, а саму жемчужину вынул и вернул торговцу.",
    storyEn: "A merchant placed a precious pearl inside an exquisitely carved sandalwood box. A customer bought the item, kept the fancy box, and handed the priceless pearl back to the seller.",
    dynasty: "Период Хань Фэй-цзы (韩非子)",
  },
  "刻舟求剑": {
    idiom: "刻舟求剑",
    literal: "Сделать зарубку на борту лодки в поисках упавшего меча",
    figurative: "Упрямый догматизм; не учитывать изменившиеся обстоятельства и время.",
    storyRu: "Человек переправлялся на лодке через реку и случайно выронил драгоценный меч в воду. Он не стал сразу нырять, а спокойно достал нож и вырезал зарубку на борту лодки: «Здесь упал мой меч». Когда лодка причалила к другому берегу, он прыгнул в воду ровно под зарубкой. Лодка проплыла километры, а меч остался на середине реки.",
    storyEn: "A man dropped his sword into a river from a moving boat. He carved a notch on the boat's edge to mark the spot. When the boat docked miles downstream, he dived in under the notch, surprised not to find his sword.",
    dynasty: "Люйши Чуньцю (吕氏春秋)",
  },
};

const DYNAMIC_CHENGYU_CACHE = new Map<string, ChengyuStory>();

/**
 * Returns instant synchronous Chengyu story if available in local curated dictionary
 */
export function getChengyuStory(word: string): ChengyuStory | null {
  if (!word) return null;
  const clean = word.trim();
  if (DYNAMIC_CHENGYU_CACHE.has(clean)) {
    return DYNAMIC_CHENGYU_CACHE.get(clean)!;
  }
  return CHENGYU_DATABASE[clean] || null;
}

/**
 * Asynchronously searches for idiom derivation and story from open online archives.
 * Returns null if not an idiom or offline.
 */
export async function fetchDynamicChengyuStory(word: string): Promise<ChengyuStory | null> {
  const clean = word.trim();
  if (!clean || clean.length !== 4) return null;

  if (DYNAMIC_CHENGYU_CACHE.has(clean)) {
    return DYNAMIC_CHENGYU_CACHE.get(clean)!;
  }

  if (CHENGYU_DATABASE[clean]) {
    return CHENGYU_DATABASE[clean];
  }

  // Query summary via Wikipedia REST API fallback
  try {
    const wikiUrl = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`;
    const res = await requestUrl({
      url: wikiUrl,
      headers: { "Accept": "application/json" },
    });

    const json = res.json as { description?: string; extract?: string } | null;
    if (res.status === 200 && json && json.extract) {
      const story: ChengyuStory = {
        idiom: clean,
        literal: json.description || clean,
        figurative: json.extract.slice(0, 120),
        storyRu: json.extract,
        storyEn: json.extract,
        dynasty: "Классическая китайская идиома",
      };
      DYNAMIC_CHENGYU_CACHE.set(clean, story);
      return story;
    }
  } catch {
    // ignore
  }

  return null;
}
