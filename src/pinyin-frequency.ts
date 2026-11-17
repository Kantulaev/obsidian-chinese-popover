/**
 * Dominant and high-frequency Mandarin Pinyin reading database.
 *
 * Sourced from:
 * 1. Unicode Han Database (Unihan kHanyuPinlu frequency ratings from Xiandai Hanyu Pinlu Cidian)
 * 2. Modern Standard Putonghua Chinese standards (Putonghua Yiducid Shenyinbiao)
 *
 * Ensures that multi-pronunciation characters (duoyinzi / 多音字) prioritize their
 * most common, high-frequency reading rather than random, archaic, or surname readings.
 */

import { DictEntry } from "./dictionary.ts";

export const DOMINANT_PINYIN_MAP: Record<string, string[]> = {
  "上": [
    "shang4",
    "shang5"
  ],
  "下": [
    "xia4",
    "xia5"
  ],
  "不": [
    "bu4",
    "bu5"
  ],
  "与": [
    "yu3",
    "yu4"
  ],
  "个": [
    "ge4",
    "ge5",
    "ge3"
  ],
  "中": [
    "zhong1",
    "zhong4"
  ],
  "丹": [
    "dan1",
    "dan5"
  ],
  "为": [
    "wei4",
    "wei2"
  ],
  "举": [
    "ju3",
    "ju5"
  ],
  "乎": [
    "hu5",
    "hu1"
  ],
  "乐": [
    "le4",
    "yue4"
  ],
  "了": [
    "le5",
    "liao3"
  ],
  "事": [
    "shi4",
    "shi5"
  ],
  "亮": [
    "liang4",
    "liang5"
  ],
  "亲": [
    "qin1",
    "qin5"
  ],
  "人": [
    "ren2",
    "ren5"
  ],
  "什": [
    "shen2",
    "shen5"
  ],
  "从": [
    "cong2",
    "cong1"
  ],
  "付": [
    "fu4",
    "fu5"
  ],
  "仙": [
    "xian5",
    "xian1"
  ],
  "份": [
    "fen4",
    "fen5"
  ],
  "伙": [
    "huo3",
    "huo5"
  ],
  "会": [
    "hui4",
    "kuai4"
  ],
  "传": [
    "chuan2",
    "zhuan4"
  ],
  "伯": [
    "bo2",
    "bo5"
  ],
  "似": [
    "shi4",
    "si4"
  ],
  "供": [
    "gong1",
    "gong4"
  ],
  "便": [
    "bian4",
    "pian2"
  ],
  "個": [
    "ge4",
    "ge5",
    "ge3"
  ],
  "倒": [
    "dao3",
    "dao4"
  ],
  "候": [
    "hou5",
    "hou4"
  ],
  "假": [
    "jia3",
    "jia4"
  ],
  "傳": [
    "chuan2",
    "zhuan4"
  ],
  "儿": [
    "r5",
    "er2"
  ],
  "兄": [
    "xiong1",
    "xiong5"
  ],
  "兒": [
    "r5",
    "er2"
  ],
  "兴": [
    "xing4",
    "xing1"
  ],
  "具": [
    "ju4",
    "ju5"
  ],
  "冲": [
    "chong1",
    "chong4"
  ],
  "几": [
    "ji3",
    "ji1"
  ],
  "分": [
    "fen1",
    "fen4"
  ],
  "切": [
    "qie4",
    "qie1"
  ],
  "划": [
    "hua4",
    "hua2"
  ],
  "创": [
    "chuang4",
    "chuang1"
  ],
  "別": [
    "bie2",
    "bie4"
  ],
  "利": [
    "li4",
    "li5"
  ],
  "别": [
    "bie2",
    "bie4"
  ],
  "到": [
    "dao4",
    "dao5"
  ],
  "刹": [
    "sha1",
    "cha4"
  ],
  "削": [
    "xue1",
    "xiao1"
  ],
  "剎": [
    "sha1",
    "cha4"
  ],
  "創": [
    "chuang4",
    "chuang1"
  ],
  "力": [
    "li4",
    "li5"
  ],
  "务": [
    "wu5",
    "wu4"
  ],
  "势": [
    "shi4",
    "shi5"
  ],
  "務": [
    "wu5",
    "wu4"
  ],
  "勢": [
    "shi4",
    "shi5"
  ],
  "匠": [
    "jiang5",
    "jiang4"
  ],
  "午": [
    "wu3",
    "wu5"
  ],
  "卖": [
    "mai4",
    "mai5"
  ],
  "卷": [
    "juan3",
    "juan4"
  ],
  "参": [
    "can1",
    "shen1"
  ],
  "參": [
    "can1",
    "shen1"
  ],
  "友": [
    "you5",
    "you3"
  ],
  "发": [
    "fa1",
    "fa4"
  ],
  "叔": [
    "shu1",
    "shu5"
  ],
  "口": [
    "kou3",
    "kou5"
  ],
  "只": [
    "zhi3",
    "zhi1"
  ],
  "号": [
    "hao4",
    "hao5",
    "hao2"
  ],
  "吁": [
    "xu1",
    "yu4"
  ],
  "同": [
    "tong2",
    "tong5",
    "tong4"
  ],
  "吐": [
    "tu3",
    "tu4"
  ],
  "吗": [
    "ma5",
    "ma2"
  ],
  "听": [
    "ting1",
    "ting5"
  ],
  "吶": [
    "ne5",
    "na4"
  ],
  "呀": [
    "ya5",
    "ya1"
  ],
  "呐": [
    "ne5",
    "na4"
  ],
  "呢": [
    "ne5",
    "ni2"
  ],
  "呵": [
    "a1",
    "he1"
  ],
  "呼": [
    "hu1",
    "hu5"
  ],
  "和": [
    "he2",
    "huo5",
    "he5",
    "he4"
  ],
  "咱": [
    "zan2",
    "zan5"
  ],
  "咳": [
    "hai1",
    "ke2"
  ],
  "咽": [
    "yan4",
    "ye4",
    "yan1"
  ],
  "哄": [
    "hong1",
    "hong3"
  ],
  "哇": [
    "wa5",
    "wa1"
  ],
  "哟": [
    "yo1",
    "yo5"
  ],
  "哥": [
    "ge1",
    "ge5"
  ],
  "哦": [
    "o2",
    "o4",
    "e2"
  ],
  "哪": [
    "na3",
    "na5"
  ],
  "唤": [
    "huan4",
    "huan5"
  ],
  "啊": [
    "a5",
    "a1"
  ],
  "問": [
    "wen4",
    "wen5"
  ],
  "啦": [
    "la5",
    "la1"
  ],
  "喚": [
    "huan4",
    "huan5"
  ],
  "喝": [
    "he1",
    "he5",
    "he4"
  ],
  "喲": [
    "yo1",
    "yo5"
  ],
  "嗎": [
    "ma5",
    "ma2"
  ],
  "嗯": [
    "n2",
    "n3",
    "n4",
    "ng2",
    "ng3",
    "ng4"
  ],
  "嘛": [
    "ma5",
    "ma2"
  ],
  "圈": [
    "quan1",
    "juan4"
  ],
  "地": [
    "de5",
    "di4"
  ],
  "场": [
    "chang3",
    "chang2"
  ],
  "埋": [
    "mai2",
    "man2"
  ],
  "堂": [
    "tang2",
    "tang5"
  ],
  "場": [
    "chang3",
    "chang2"
  ],
  "塞": [
    "sai1",
    "se4"
  ],
  "士": [
    "shi4",
    "shi5"
  ],
  "声": [
    "sheng1",
    "sheng5"
  ],
  "壳": [
    "ke2",
    "qiao4"
  ],
  "处": [
    "chu4",
    "chu3",
    "chu5"
  ],
  "大": [
    "da4",
    "dai4"
  ],
  "天": [
    "tian1",
    "tian5"
  ],
  "太": [
    "tai4",
    "tai5"
  ],
  "夫": [
    "fu5",
    "fu1"
  ],
  "头": [
    "tou2",
    "tou5"
  ],
  "夹": [
    "jia1",
    "jia2"
  ],
  "夾": [
    "jia1",
    "jia2"
  ],
  "奔": [
    "ben1",
    "ben4"
  ],
  "女": [
    "nu3",
    "nu5"
  ],
  "奶": [
    "nai3",
    "nai5"
  ],
  "好": [
    "hao3",
    "hao4"
  ],
  "妇": [
    "fu4",
    "fu5"
  ],
  "妈": [
    "ma1",
    "ma5"
  ],
  "妨": [
    "fang2",
    "fang1"
  ],
  "妹": [
    "mei4",
    "mei5"
  ],
  "姐": [
    "jie5",
    "jie3"
  ],
  "姑": [
    "gu1",
    "gu5"
  ],
  "娃": [
    "wa2",
    "wa5"
  ],
  "娘": [
    "niang5",
    "niang2"
  ],
  "婆": [
    "po2",
    "po5"
  ],
  "婦": [
    "fu4",
    "fu5"
  ],
  "婶": [
    "shen3",
    "shen5"
  ],
  "媽": [
    "ma1",
    "ma5"
  ],
  "嫂": [
    "sao3",
    "sao5"
  ],
  "嬸": [
    "shen3",
    "shen5"
  ],
  "子": [
    "zi5",
    "zi3"
  ],
  "字": [
    "zi4",
    "zi5"
  ],
  "宁": [
    "ning2",
    "ning4"
  ],
  "宗": [
    "zong1",
    "zong5"
  ],
  "宜": [
    "yi5",
    "yi2"
  ],
  "实": [
    "shi2",
    "shi5"
  ],
  "害": [
    "hai4",
    "hai5"
  ],
  "家": [
    "jia1",
    "jia5"
  ],
  "宿": [
    "su4",
    "xiu3"
  ],
  "實": [
    "shi2",
    "shi5"
  ],
  "寧": [
    "ning2",
    "ning4"
  ],
  "寸": [
    "cun4",
    "cun5"
  ],
  "寻": [
    "xun2",
    "xin2"
  ],
  "将": [
    "jiang1",
    "jiang4"
  ],
  "將": [
    "jiang1",
    "jiang4"
  ],
  "尋": [
    "xun2",
    "xin2"
  ],
  "少": [
    "shao3",
    "shao4"
  ],
  "尚": [
    "shang4",
    "shang5"
  ],
  "尽": [
    "jin3",
    "jin4"
  ],
  "屈": [
    "qu1",
    "qu5"
  ],
  "展": [
    "zhan3",
    "zhan5"
  ],
  "岗": [
    "gang3",
    "gang1"
  ],
  "崗": [
    "gang3",
    "gang1"
  ],
  "差": [
    "cha4",
    "cha1",
    "chai1"
  ],
  "巴": [
    "ba5",
    "ba1"
  ],
  "干": [
    "gan1",
    "gan4"
  ],
  "应": [
    "ying1",
    "ying4",
    "ying5"
  ],
  "度": [
    "du4",
    "du5"
  ],
  "式": [
    "shi4",
    "shi5"
  ],
  "弟": [
    "di4",
    "di5"
  ],
  "強": [
    "qiang2",
    "qiang3"
  ],
  "弹": [
    "dan4",
    "tan2",
    "tan5"
  ],
  "强": [
    "qiang2",
    "qiang3"
  ],
  "彈": [
    "dan4",
    "tan2",
    "tan5"
  ],
  "当": [
    "dang1",
    "dang4"
  ],
  "形": [
    "xing2",
    "xing5"
  ],
  "彩": [
    "cai3",
    "cai5"
  ],
  "往": [
    "wang3",
    "wang4"
  ],
  "得": [
    "de5",
    "de2",
    "dei3"
  ],
  "從": [
    "cong2",
    "cong1"
  ],
  "心": [
    "xin1",
    "xin5"
  ],
  "快": [
    "kuai4",
    "kuai5"
  ],
  "思": [
    "si1",
    "si5"
  ],
  "性": [
    "xing4",
    "xing5"
  ],
  "怨": [
    "yuan4",
    "yuan5"
  ],
  "息": [
    "xi5",
    "xi1"
  ],
  "恶": [
    "e4",
    "wu4"
  ],
  "悶": [
    "men4",
    "men1"
  ],
  "情": [
    "qing2",
    "qing5"
  ],
  "惑": [
    "huo4",
    "huo5"
  ],
  "惡": [
    "e4",
    "wu4"
  ],
  "意": [
    "yi4",
    "yi5"
  ],
  "慌": [
    "huang1",
    "huang5"
  ],
  "應": [
    "ying1",
    "ying4",
    "ying5"
  ],
  "成": [
    "cheng2",
    "cheng5"
  ],
  "戶": [
    "hu4",
    "hu5"
  ],
  "户": [
    "hu4",
    "hu5"
  ],
  "扇": [
    "shan4",
    "shan1"
  ],
  "手": [
    "shou3",
    "shou5"
  ],
  "才": [
    "cai2",
    "cai5"
  ],
  "扎": [
    "zha1",
    "zha2"
  ],
  "打": [
    "da3",
    "da2"
  ],
  "扫": [
    "sao3",
    "sao4"
  ],
  "扭": [
    "niu3",
    "niu5"
  ],
  "扮": [
    "ban5",
    "ban4"
  ],
  "扯": [
    "che3",
    "che5"
  ],
  "折": [
    "zhe2",
    "zhe1",
    "she2"
  ],
  "抹": [
    "mo3",
    "ma1"
  ],
  "担": [
    "dan1",
    "dan4",
    "dan5"
  ],
  "拉": [
    "la1",
    "la5"
  ],
  "拔": [
    "ba2",
    "ba5"
  ],
  "拾": [
    "shi5",
    "shi2"
  ],
  "指": [
    "zhi3",
    "zhi2",
    "zhi1"
  ],
  "挑": [
    "tiao1",
    "tiao3"
  ],
  "挣": [
    "zheng1",
    "zheng4"
  ],
  "掃": [
    "sao3",
    "sao4"
  ],
  "掌": [
    "zhang3",
    "zhang5"
  ],
  "掙": [
    "zheng1",
    "zheng4"
  ],
  "探": [
    "tan4",
    "tan5"
  ],
  "搁": [
    "ge1",
    "ge5"
  ],
  "摸": [
    "mo1",
    "mo5"
  ],
  "撐": [
    "cheng1",
    "cheng5"
  ],
  "撑": [
    "cheng1",
    "cheng5"
  ],
  "撒": [
    "sa1",
    "sa3"
  ],
  "擔": [
    "dan1",
    "dan4",
    "dan5"
  ],
  "擱": [
    "ge1",
    "ge5"
  ],
  "教": [
    "jiao4",
    "jiao1"
  ],
  "散": [
    "san4",
    "san3"
  ],
  "数": [
    "shu4",
    "shu3"
  ],
  "數": [
    "shu4",
    "shu3",
    "shu5"
  ],
  "方": [
    "fang1",
    "fang5"
  ],
  "明": [
    "ming2",
    "ming5"
  ],
  "昏": [
    "hun1",
    "hun2"
  ],
  "是": [
    "shi4",
    "shi5"
  ],
  "晃": [
    "huang5",
    "huang4",
    "huang3"
  ],
  "晨": [
    "chen5",
    "chen2"
  ],
  "曲": [
    "qu1",
    "qu3"
  ],
  "更": [
    "geng4",
    "geng1"
  ],
  "會": [
    "hui4",
    "kuai4"
  ],
  "月": [
    "yue4",
    "yue5"
  ],
  "服": [
    "fu2",
    "fu5"
  ],
  "望": [
    "wang4",
    "wang5"
  ],
  "朝": [
    "chao2",
    "zhao1"
  ],
  "朵": [
    "duo5",
    "duo3"
  ],
  "杆": [
    "gan1",
    "gan3"
  ],
  "材": [
    "cai2",
    "cai5"
  ],
  "格": [
    "ge2",
    "ge5"
  ],
  "框": [
    "kuang1",
    "kuang4"
  ],
  "梁": [
    "liang2",
    "liang5"
  ],
  "棚": [
    "peng2",
    "peng5"
  ],
  "樂": [
    "le4",
    "yue4"
  ],
  "模": [
    "mo2",
    "mu2"
  ],
  "欠": [
    "qian4",
    "qian5"
  ],
  "欢": [
    "huan5",
    "huan1"
  ],
  "歌": [
    "ge1",
    "ge5"
  ],
  "歡": [
    "huan5",
    "huan1"
  ],
  "正": [
    "zheng4",
    "zheng5",
    "zheng1"
  ],
  "殼": [
    "ke2",
    "qiao4"
  ],
  "毛": [
    "mao2",
    "mao5"
  ],
  "气": [
    "qi4",
    "qi5"
  ],
  "氣": [
    "qi4",
    "qi5"
  ],
  "汤": [
    "tang1",
    "tang5"
  ],
  "沉": [
    "chen2",
    "chen1"
  ],
  "沒": [
    "mei2",
    "mo4"
  ],
  "沖": [
    "chong1",
    "chong4"
  ],
  "没": [
    "mei2",
    "mo4"
  ],
  "沫": [
    "mo4",
    "mo5"
  ],
  "沿": [
    "yan2",
    "yan4"
  ],
  "泊": [
    "po1",
    "bo2"
  ],
  "法": [
    "fa3",
    "fa5"
  ],
  "泼": [
    "po5",
    "po1"
  ],
  "活": [
    "huo2",
    "huo5"
  ],
  "涂": [
    "tu5",
    "tu2"
  ],
  "涨": [
    "zhang3",
    "zhang4"
  ],
  "混": [
    "hun4",
    "hun2"
  ],
  "湯": [
    "tang1",
    "tang5"
  ],
  "滑": [
    "hua2",
    "hua5"
  ],
  "漂": [
    "piao4",
    "piao1"
  ],
  "漲": [
    "zhang3",
    "zhang4"
  ],
  "潑": [
    "po5",
    "po1"
  ],
  "激": [
    "ji1",
    "ji5"
  ],
  "灵": [
    "ling2",
    "ling5"
  ],
  "為": [
    "wei4",
    "wei2"
  ],
  "烦": [
    "fan2",
    "fan5"
  ],
  "然": [
    "ran2",
    "ran5"
  ],
  "煩": [
    "fan2",
    "fan5"
  ],
  "爪": [
    "zhao3",
    "zhua3"
  ],
  "爷": [
    "ye5",
    "ye2"
  ],
  "爸": [
    "ba4",
    "ba5"
  ],
  "爺": [
    "ye5",
    "ye2"
  ],
  "片": [
    "pian4",
    "pian1"
  ],
  "物": [
    "wu4",
    "wu5"
  ],
  "猩": [
    "xing1",
    "xing5"
  ],
  "率": [
    "lu4",
    "shuai4"
  ],
  "理": [
    "li3",
    "li5"
  ],
  "甚": [
    "shen2",
    "shen4"
  ],
  "生": [
    "sheng1",
    "sheng5"
  ],
  "用": [
    "yong4",
    "yong5"
  ],
  "甲": [
    "jia3",
    "jia5"
  ],
  "畜": [
    "chu4",
    "xu4"
  ],
  "當": [
    "dang1",
    "dang4",
    "dang5"
  ],
  "發": [
    "fa1",
    "fa5",
    "fa4"
  ],
  "白": [
    "bai2",
    "bai5"
  ],
  "的": [
    "de5",
    "di4",
    "di2"
  ],
  "盖": [
    "gai4",
    "gai5"
  ],
  "盘": [
    "pan2",
    "pan5"
  ],
  "盛": [
    "sheng4",
    "cheng2"
  ],
  "盡": [
    "jin3",
    "jin4"
  ],
  "盤": [
    "pan2",
    "pan5"
  ],
  "相": [
    "xiang1",
    "xiang4"
  ],
  "看": [
    "kan4",
    "kan1"
  ],
  "着": [
    "zhe5",
    "zhao2",
    "zhuo2",
    "zhao1"
  ],
  "睛": [
    "jing5",
    "jing1"
  ],
  "瞭": [
    "liao3",
    "liao4"
  ],
  "磨": [
    "mo2",
    "mo5",
    "mo4"
  ],
  "神": [
    "shen2",
    "shen5"
  ],
  "禁": [
    "jin4",
    "jin1"
  ],
  "种": [
    "zhong3",
    "zhong4"
  ],
  "称": [
    "cheng1",
    "chen4"
  ],
  "種": [
    "zhong3",
    "zhong4"
  ],
  "稱": [
    "cheng1",
    "chen4"
  ],
  "究": [
    "jiu1",
    "jiu5"
  ],
  "空": [
    "kong1",
    "kong4"
  ],
  "笼": [
    "long2",
    "long5",
    "long3"
  ],
  "答": [
    "da2",
    "da1"
  ],
  "算": [
    "suan4",
    "suan5"
  ],
  "籠": [
    "long2",
    "long5",
    "long3"
  ],
  "糊": [
    "hu5",
    "hu2"
  ],
  "系": [
    "xi4",
    "ji4"
  ],
  "索": [
    "suo3",
    "suo5"
  ],
  "累": [
    "lei4",
    "lei3"
  ],
  "結": [
    "jie2",
    "jie1"
  ],
  "給": [
    "gei3",
    "ji3"
  ],
  "經": [
    "jing1",
    "jing5"
  ],
  "縫": [
    "feng4",
    "feng2"
  ],
  "繃": [
    "beng3",
    "beng1"
  ],
  "繞": [
    "rao4",
    "rao3"
  ],
  "繩": [
    "sheng2",
    "sheng5"
  ],
  "经": [
    "jing1",
    "jing5"
  ],
  "结": [
    "jie2",
    "jie1"
  ],
  "绕": [
    "rao4",
    "rao3"
  ],
  "给": [
    "gei3",
    "ji3"
  ],
  "绳": [
    "sheng2",
    "sheng5"
  ],
  "绷": [
    "beng3",
    "beng1"
  ],
  "缝": [
    "feng4",
    "feng2"
  ],
  "罢": [
    "ba5",
    "ba4"
  ],
  "罪": [
    "zui4",
    "zui5"
  ],
  "置": [
    "zhi4",
    "zhi5"
  ],
  "罷": [
    "ba5",
    "ba4"
  ],
  "聲": [
    "sheng1",
    "sheng5"
  ],
  "聽": [
    "ting1",
    "ting5"
  ],
  "股": [
    "gu3",
    "gu5"
  ],
  "背": [
    "bei4",
    "bei1"
  ],
  "脏": [
    "zang4",
    "zang1"
  ],
  "腐": [
    "fu3",
    "fu5"
  ],
  "腾": [
    "teng2",
    "teng5"
  ],
  "臂": [
    "bi4",
    "bei5"
  ],
  "臟": [
    "zang4",
    "zang1"
  ],
  "舅": [
    "jiu4",
    "jiu5"
  ],
  "與": [
    "yu3",
    "yu4"
  ],
  "興": [
    "xing4",
    "xing1"
  ],
  "舉": [
    "ju3",
    "ju5"
  ],
  "舍": [
    "she3",
    "she4"
  ],
  "芦": [
    "lu2",
    "lu5"
  ],
  "花": [
    "hua1",
    "hua5"
  ],
  "茫": [
    "mang2",
    "mang1"
  ],
  "莫": [
    "mo4",
    "mo5"
  ],
  "落": [
    "luo4",
    "la4"
  ],
  "著": [
    "zhe5",
    "zhao2",
    "zhu4",
    "zhuo2",
    "zhao1"
  ],
  "蒙": [
    "meng2",
    "meng1",
    "meng3"
  ],
  "蓋": [
    "gai4",
    "gai5"
  ],
  "薄": [
    "bao2",
    "bo2"
  ],
  "蘆": [
    "lu2",
    "lu5"
  ],
  "虎": [
    "hu3",
    "hu5"
  ],
  "處": [
    "chu4",
    "chu3",
    "chu5"
  ],
  "號": [
    "hao4",
    "hao5",
    "hao2"
  ],
  "血": [
    "xue4",
    "xie3"
  ],
  "行": [
    "xing2",
    "hang2"
  ],
  "袋": [
    "dai4",
    "dai5"
  ],
  "裡": [
    "li5",
    "li3"
  ],
  "西": [
    "xi5",
    "xi1"
  ],
  "要": [
    "yao4",
    "yao1"
  ],
  "見": [
    "jian4",
    "xian4",
    "jian5"
  ],
  "視": [
    "shi4",
    "shi5"
  ],
  "親": [
    "qin1",
    "qin5"
  ],
  "覺": [
    "jue2",
    "jiao4"
  ],
  "见": [
    "jian4",
    "xian4",
    "jian5"
  ],
  "视": [
    "shi4",
    "shi5"
  ],
  "觉": [
    "jue2",
    "jiao4"
  ],
  "角": [
    "jiao3",
    "jue2"
  ],
  "計": [
    "ji4",
    "ji5"
  ],
  "訓": [
    "xun5",
    "xun4"
  ],
  "記": [
    "ji4",
    "ji5"
  ],
  "訴": [
    "su5",
    "su4"
  ],
  "話": [
    "hua4",
    "hua5"
  ],
  "誒": [
    "ei2",
    "ei3",
    "ei4"
  ],
  "誤": [
    "wu4",
    "wu5"
  ],
  "調": [
    "diao4",
    "tiao2"
  ],
  "謀": [
    "mou2",
    "mou5"
  ],
  "謝": [
    "xie4",
    "xie5"
  ],
  "識": [
    "shi5",
    "shi2"
  ],
  "计": [
    "ji4",
    "ji5"
  ],
  "训": [
    "xun5",
    "xun4"
  ],
  "记": [
    "ji4",
    "ji5"
  ],
  "识": [
    "shi5",
    "shi2"
  ],
  "诉": [
    "su5",
    "su4"
  ],
  "话": [
    "hua4",
    "hua5"
  ],
  "误": [
    "wu4",
    "wu5"
  ],
  "诶": [
    "ei2",
    "ei3",
    "ei4"
  ],
  "调": [
    "diao4",
    "tiao2"
  ],
  "谋": [
    "mou2",
    "mou5"
  ],
  "谢": [
    "xie4",
    "xie5"
  ],
  "負": [
    "fu4",
    "fu5"
  ],
  "賣": [
    "mai4",
    "mai5"
  ],
  "负": [
    "fu4",
    "fu5"
  ],
  "踏": [
    "ta4",
    "ta1"
  ],
  "載": [
    "zai4",
    "zai3"
  ],
  "輯": [
    "ji5",
    "ji2"
  ],
  "轉": [
    "zhuan3",
    "zhuan4"
  ],
  "转": [
    "zhuan3",
    "zhuan4"
  ],
  "载": [
    "zai4",
    "zai3"
  ],
  "辑": [
    "ji5",
    "ji2"
  ],
  "辟": [
    "pi4",
    "bi4"
  ],
  "边": [
    "bian1",
    "bian5"
  ],
  "过": [
    "guo4",
    "guo5"
  ],
  "还": [
    "hai2",
    "huan2"
  ],
  "通": [
    "tong1",
    "tong4"
  ],
  "逮": [
    "dai3",
    "dai4"
  ],
  "過": [
    "guo4",
    "guo5"
  ],
  "道": [
    "dao4",
    "dao5"
  ],
  "還": [
    "hai2",
    "huan2"
  ],
  "邊": [
    "bian1",
    "bian5"
  ],
  "都": [
    "dou1",
    "du1"
  ],
  "里": [
    "li3",
    "li5"
  ],
  "重": [
    "zhong4",
    "chong2"
  ],
  "量": [
    "liang4",
    "liang5",
    "liang2"
  ],
  "鋪": [
    "pu4",
    "pu1",
    "pu5"
  ],
  "錢": [
    "qian2",
    "qian5"
  ],
  "钱": [
    "qian2",
    "qian5"
  ],
  "铺": [
    "pu4",
    "pu1",
    "pu5"
  ],
  "長": [
    "zhang3",
    "chang2"
  ],
  "长": [
    "chang2",
    "zhang3"
  ],
  "門": [
    "men2",
    "men5"
  ],
  "間": [
    "jian1",
    "jian5",
    "jian4"
  ],
  "门": [
    "men2",
    "men5"
  ],
  "问": [
    "wen4",
    "wen5"
  ],
  "间": [
    "jian1",
    "jian4"
  ],
  "闷": [
    "men4",
    "men1"
  ],
  "闹": [
    "nao4",
    "nao5"
  ],
  "降": [
    "jiang4",
    "xiang2"
  ],
  "隆": [
    "long2",
    "long1"
  ],
  "难": [
    "nan2",
    "nan5",
    "nan4"
  ],
  "難": [
    "nan2",
    "nan5",
    "nan4"
  ],
  "靈": [
    "ling2",
    "ling5"
  ],
  "静": [
    "jing4",
    "jing5"
  ],
  "靜": [
    "jing4",
    "jing5"
  ],
  "面": [
    "mian4",
    "mian5"
  ],
  "頭": [
    "tou2",
    "tou5"
  ],
  "食": [
    "shi2",
    "shi5"
  ],
  "餅": [
    "bing3",
    "bing5"
  ],
  "饼": [
    "bing3",
    "bing5"
  ],
  "駝": [
    "tuo5",
    "tuo2"
  ],
  "騰": [
    "teng2",
    "teng5"
  ],
  "驼": [
    "tuo5",
    "tuo2"
  ],
  "骨": [
    "gu3",
    "gu2"
  ],
  "鬧": [
    "nao4",
    "nao5"
  ],
  "鮮": [
    "xian1",
    "xian5"
  ],
  "鲜": [
    "xian1",
    "xian5"
  ],
  "麻": [
    "ma2",
    "ma5"
  ],
  "把": [
    "ba3",
    "ba4"
  ],
  "解": [
    "jie3",
    "xie4"
  ]
};

/**
 * Strips tones (both accented marks and trailing numeric tone numbers) from a Pinyin string
 * for toneless base syllable comparison.
 */
export function stripPinyinTones(pinyin: string): string {
  if (!pinyin) return "";
  return pinyin
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[1-5]/g, "")
    .replace(/ü/g, "v")
    .replace(/u:/g, "v")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes Pinyin representation to lowercase with 'u:' for umlaut.
 */
export function normalizePinyin(pinyin: string): string {
  if (!pinyin) return "";
  return pinyin
    .toLowerCase()
    .replace(/ü/g, "u:")
    .replace(/v/g, "u:")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Attempts to extract the exact syllable of `targetChar` from a compound word's full Pinyin.
 * E.g. word = "银行", wordPinyin = "yin2 hang2", targetChar = "行" -> returns "hang2".
 */
export function getCharPinyinFromWordPinyin(
  word: string,
  wordPinyin: string,
  targetChar: string
): string | undefined {
  if (!word || !wordPinyin || !targetChar) return undefined;
  const chars = Array.from(word);
  const charIdx = chars.indexOf(targetChar);
  if (charIdx === -1) return undefined;

  const syllables = wordPinyin.trim().split(/\s+/);
  if (syllables.length === chars.length) {
    return syllables[charIdx];
  }
  return undefined;
}

/**
 * Sorts dictionary entries for a word or character so that the most frequent,
 * standard, and contextually accurate pronunciation is always placed first (index 0).
 */
export function sortEntriesByPinyinFrequency(
  word: string,
  entries: DictEntry[],
  preferredPinyin?: string
): DictEntry[] {
  if (!entries || entries.length <= 1) {
    return entries || [];
  }

  const normPref = preferredPinyin ? normalizePinyin(preferredPinyin) : null;
  const tonelessPref = preferredPinyin ? stripPinyinTones(preferredPinyin) : null;
  const dominantList = DOMINANT_PINYIN_MAP[word];

  return [...entries].sort((a, b) => {
    const aNorm = normalizePinyin(a.pinyin);
    const bNorm = normalizePinyin(b.pinyin);

    // 1. Highest priority: exact match with preferred context Pinyin
    if (normPref) {
      const aMatchesPref = aNorm === normPref;
      const bMatchesPref = bNorm === normPref;
      if (aMatchesPref !== bMatchesPref) {
        return aMatchesPref ? -1 : 1;
      }
    }

    // 2. High priority: toneless match with preferred context Pinyin
    if (tonelessPref) {
      const aMatchesToneless = stripPinyinTones(a.pinyin) === tonelessPref;
      const bMatchesToneless = stripPinyinTones(b.pinyin) === tonelessPref;
      if (aMatchesToneless !== bMatchesToneless) {
        return aMatchesToneless ? -1 : 1;
      }
    }

    // 3. Dominant frequency rating from official kHanyuPinlu dictionary
    if (dominantList && dominantList.length > 0) {
      let aIdx = dominantList.indexOf(aNorm);
      let bIdx = dominantList.indexOf(bNorm);

      // If exact tone number not matched (e.g. tone 5 neutral vs tone 1), try toneless fallback
      if (aIdx === -1) {
        const aBase = aNorm.replace(/[1-5]/g, "");
        aIdx = dominantList.findIndex((d) => d.replace(/[1-5]/g, "") === aBase);
        if (aIdx !== -1) aIdx += 0.5;
      }
      if (bIdx === -1) {
        const bBase = bNorm.replace(/[1-5]/g, "");
        bIdx = dominantList.findIndex((d) => d.replace(/[1-5]/g, "") === bBase);
        if (bIdx !== -1) bIdx += 0.5;
      }

      const aScore = aIdx === -1 ? 999 : aIdx;
      const bScore = bIdx === -1 ? 999 : bIdx;
      if (aScore !== bScore) {
        return aScore - bScore;
      }
    }

    // 4. Deprioritize rare surname entries unless no other entry exists
    const aIsSurname = a.definitions.some((d) => d.toLowerCase().includes("surname "));
    const bIsSurname = b.definitions.some((d) => d.toLowerCase().includes("surname "));
    if (aIsSurname !== bIsSurname) {
      return aIsSurname ? 1 : -1;
    }

    // 5. Deprioritize cross-reference variants (e.g. "variant of ...", "see ...")
    const aIsVariant = a.definitions.some(
      (d) => d.startsWith("variant of ") || d.startsWith("see ") || d.startsWith("also written ")
    );
    const bIsVariant = b.definitions.some(
      (d) => d.startsWith("variant of ") || d.startsWith("see ") || d.startsWith("also written ")
    );
    if (aIsVariant !== bIsVariant) {
      return aIsVariant ? 1 : -1;
    }

    return 0;
  });
}

/**
 * In-place sorts all multi-entry arrays in a loaded DictionaryData object.
 */
export function sortAllDictionaryEntriesInPlace(data: Record<string, DictEntry[]>): void {
  for (const word of Object.keys(data)) {
    const entries = data[word];
    if (entries && entries.length > 1) {
      data[word] = sortEntriesByPinyinFrequency(word, entries);
    }
  }
}
