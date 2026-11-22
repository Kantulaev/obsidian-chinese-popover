/**
 * Multilingual Kangxi Radicals (1-214) Translation Table
 * Generates src/radicals-data.ts containing authentic names & translations across all 20 languages.
 */

import { KANGXI_RADICALS } from "../src/radicals.ts";
import { ZH_NAMES, JA_NAMES, KO_NAMES, VI_NAMES } from "./build-radicals-data.ts";

export interface LangTuple {
  de: string;
  fr: string;
  es: string;
  it: string;
  pt: string;
  id: string;
  th: string;
  ar: string;
  tr: string;
  pl: string;
  nl: string;
  uk: string;
  hi: string;
}

// Radical translations 1 to 214 in the 13 non-CJKV/RU/EN languages
export const REST_LANGS: Record<number, LangTuple> = {
  1: { de: "eins, Strich", fr: "un, trait", es: "uno, trazo", it: "uno, linea", pt: "um, traço", id: "satu, garis", th: "หนึ่ง, ขีดนอน", ar: "واحد, خط أفقي", tr: "bir, yatay çizgi", pl: "jeden, kreska", nl: "één, streep", uk: "один, горизонтальна риска", hi: "एक, आड़ी रेखा" },
  2: { de: "senkrechter Strich", fr: "ligne verticale", es: "línea vertical", it: "linea verticale", pt: "linha vertical", id: "garis vertikal", th: "เส้นตั้ง", ar: "خط عمودي", tr: "dikey çizgi", pl: "kreska pionowa", nl: "verticale streep", uk: "вертикальна риска", hi: "खड़ी रेखा" },
  3: { de: "Punkt", fr: "point", es: "punto", it: "punto", pt: "ponto", id: "titik", th: "จุด", ar: "نقطة", tr: "nokta", pl: "kropka", nl: "punt", uk: "крапка", hi: "बिंदु" },
  4: { de: "Schrägstrich links", fr: "oblique gauche", es: "trazo oblicuo", it: "tratto obliquo", pt: "traço oblíquo", id: "garis miring kiri", th: "เส้นเฉียงซ้าย", ar: "خط مائل يسار", tr: "sola eğik çizgi", pl: "kreska ukośna", nl: "schuine streep", uk: "відкидна ліворуч", hi: "तिरछी रेखा" },
  5: { de: "zweiter, Kurve", fr: "second, courbé", es: "segundo, curvo", it: "secondo, curvo", pt: "segundo, curvo", id: "kedua, lengkung", th: "อันดับสอง, โค้ง", ar: "ثان, منحنٍ", tr: "ikinci, kıvrık", pl: "drugi, krzywa", nl: "tweede, gebogen lijn", uk: "другий, вигнута", hi: "दूसरा, मुड़ी हुई रेखा" },
  6: { de: "Haken", fr: "crochet", es: "gancho", it: "gancio", pt: "gancho", id: "kait", th: "ขีดตะขอ", ar: "خطاف", tr: "çengel", pl: "haczyk", nl: "haak", uk: "гачок", hi: "हुक" },
  7: { de: "zwei", fr: "deux", es: "dos", it: "due", pt: "dois", id: "dua", th: "สอง", ar: "اثنان", tr: "iki", pl: "dwa", nl: "twee", uk: "два", hi: "दो" },
  8: { de: "Deckel", fr: "couvercle", es: "tapa, techo", it: "coperchio", pt: "tampa, topo", id: "penutup atas", th: "ฝาครอบบน", ar: "غطاء علوي", tr: "kapak", pl: "pokrywka", nl: "deksel", uk: "верхівка, кришка", hi: "ढक्कन, शीर्ष" },
  9: { de: "Mensch (亻)", fr: "personne (亻)", es: "persona (亻)", it: "persona (亻)", pt: "pessoa (亻)", id: "orang (亻)", th: "คน (亻)", ar: "إنسان (亻)", tr: "insan (亻)", pl: "człowiek (亻)", nl: "mens (亻)", uk: "людина (亻)", hi: "मनुष्य (亻)" },
  10: { de: "Beine, Sohn", fr: "jambes, fils", es: "piernas, hijo", it: "gambe, figlio", pt: "pernas, filho", id: "kaki orang, anak", th: "ขาคน, ลูกชาย", ar: "أرجل, ابن", tr: "bacaklar, oğul", pl: "nogi, syn", nl: "benen, zoon", uk: "ніжки, син", hi: "पैर, बेटा" },
  11: { de: "eintreten", fr: "entrer", es: "entrar", it: "entrare", pt: "entrar", id: "masuk", th: "เข้า", ar: "دخول", tr: "girmek", pl: "wchodzić", nl: "binnengaan", uk: "входити", hi: "प्रवेश करना" },
  12: { de: "acht, teilen", fr: "huit, diviser", es: "ocho, dividir", it: "otto, dividere", pt: "oito, dividir", id: "delapan, membagi", th: "แปด, แบ่ง", ar: "ثمانية, تقسيم", tr: "sekiz, bölmek", pl: "osiem, dzielić", nl: "acht, splitsen", uk: "вісім, ділити", hi: "आठ, विभाजित" },
  13: { de: "offener Kasten, Grenze", fr: "boîte inversée, frontière", es: "caja abierta abajo, frontera", it: "aperto in basso, confine", pt: "caixa aberta abaixo, fronteira", id: "kotak terbuka bawah, batas", th: "กรอบเปิดล่าง, ขอบเขต", ar: "إطار مفتوح للأسفل, حدود", tr: "açık kutu alt, sınır", pl: "otwarta skrzynka, granica", nl: "open kader onder, grens", uk: "кордон, окраїна", hi: "नीचे खुला घेरा, सीमा" },
  14: { de: "Abdeckung", fr: "couverture", es: "cubierta", it: "copertura", pt: "cobertura", id: "tutup kepala", th: "ผ้าคลุม", ar: "غطاء", tr: "örtü", pl: "nakrycie", nl: "bedekking", uk: "покривало", hi: "आवरण" },
  15: { de: "Eis (冫)", fr: "glace (冫)", es: "hielo (冫)", it: "ghiaccio (冫)", pt: "gelo (冫)", id: "es (冫)", th: "น้ำแข็ง (冫)", ar: "جليد (冫)", tr: "buz (冫)", pl: "lód (冫)", nl: "ijs (冫)", uk: "лід (冫)", hi: "बर्फ (冫)" },
  16: { de: "Tischchen", fr: "petite table", es: "mesita", it: "tavolino", pt: "mesinha", id: "meja kecil", th: "โต๊ะเตี้ย", ar: "طاولة صغيرة", tr: "sehpa, masa", pl: "stolik", nl: "tafeltje", uk: "столик", hi: "छोटी मेज" },
  17: { de: "Behälter, Grube", fr: "réceptacle, fosse", es: "recipiente, fosa", it: "recipiente, fossa", pt: "recipiente, cova", id: "wadah terbuka atas", th: "หลุม, ภาชนะเปิดบน", ar: "وعاء مفتوح, حفرة", tr: "açık kap, çukur", pl: "pojemnik, dół", nl: "kuil, open bak", uk: "яма, вмістилище", hi: "गड्ढा, खुला बर्तन" },
  18: { de: "Messer, Schwert (刂)", fr: "couteau (刂)", es: "cuchillo (刂)", it: "coltello (刂)", pt: "faca, espada (刂)", id: "pisau (刂)", th: "มีด (刂)", ar: "سكين (刂)", tr: "bıçak (刂)", pl: "nóż, miecz (刂)", nl: "mes, zwaard (刂)", uk: "ніж, меч (刂)", hi: "चाकू (刂)" },
  19: { de: "Kraft", fr: "force", es: "fuerza", it: "forza", pt: "força", id: "kekuatan", th: "พลัง", ar: "قوة", tr: "güç", pl: "siła", nl: "kracht", uk: "сила", hi: "शक्ति, बल" },
  20: { de: "einwickeln", fr: "envelopper", es: "envolver", it: "avvolgere", pt: "embrulhar", id: "membungkus", th: "ห่อ", ar: "تغليف", tr: "sarmak", pl: "owijać", nl: "omwikkelen", uk: "огортати", hi: "लपेटना" },
  21: { de: "Löffel, Dolch", fr: "cuillère, dague", es: "cuchara, daga", it: "cucchiaio, pugnale", pt: "colher, punhal", id: "sendok, belati", th: "ช้อน, กริช", ar: "ملعقة, خنجر", tr: "kaşık, hançer", pl: "łyżka, sztylet", nl: "lepel, dolk", uk: "ложка, кинджал", hi: "चम्मच, खंजर" },
  22: { de: "Kasten", fr: "boîte", es: "caja", it: "scatola", pt: "caixa", id: "kotak", th: "กล่อง", ar: "صندوق", tr: "kutu", pl: "skrzynka", nl: "kist", uk: "ящик, короб", hi: "बक्सा" },
  23: { de: "verstecken", fr: "cacher", es: "esconder", it: "nascondere", pt: "esconder", id: "menyembunyikan", th: "ซ่อน", ar: "إخفاء", tr: "gizlemek", pl: "ukrywać", nl: "verbergen", uk: "ховати", hi: "छिपाना" },
  24: { de: "zehn", fr: "dix", es: "diez", it: "dieci", pt: "dez", id: "sepuluh", th: "สิบ", ar: "عشرة", tr: "on", pl: "dziesięć", nl: "tien", uk: "десять", hi: "दस" },
  25: { de: "Wahrsagung", fr: "divination", es: "adivinación", it: "divinazione", pt: "adivinhação", id: "ramalan", th: "การทำนาย", ar: "عرافة, تنبؤ", tr: "kehanet, fal", pl: "wróżenie", nl: "waarzeggerij", uk: "ворожіння", hi: "भविष्यवाणी" },
  26: { de: "Siegel (阝)", fr: "sceau (阝)", es: "sello (阝)", it: "sigillo (阝)", pt: "selo (阝)", id: "segel (阝)", th: "ตราประทับ (阝)", ar: "ختم (阝)", tr: "mühür (阝)", pl: "pieczęć (阝)", nl: "zegel (阝)", uk: "печатка (阝)", hi: "मुहर (阝)" },
  27: { de: "Klippe", fr: "falaise", es: "acantilado", it: "scogliera", pt: "penhasco", id: "tebing", th: "หน้าผา", ar: "منحدر صخري", tr: "uçurum", pl: "urwisko", nl: "klif", uk: "обрив, скеля", hi: "चट्टान" },
  28: { de: "privat", fr: "privé", es: "privado", it: "privato", pt: "privado", id: "pribadi", th: "ส่วนตัว", ar: "خاص", tr: "özel", pl: "prywatny", nl: "privé", uk: "приватний", hi: "निजी" },
  29: { de: "wieder, rechte Hand", fr: "de nouveau, main droite", es: "de nuevo, mano derecha", it: "di nuovo, mano destra", pt: "novamente, mão direita", id: "lagi, tangan kanan", th: "อีกครั้ง, มือขวา", ar: "مرة أخرى, يد يمنى", tr: "yine, sağ el", pl: "znowu, prawa ręka", nl: "weer, rechterhand", uk: "знову, права рука", hi: "फिर से, दाहिना हाथ" },
  30: { de: "Mund", fr: "bouche", es: "boca", it: "bocca", pt: "boca", id: "mulut", th: "ปาก", ar: "فم", tr: "ağız", pl: "usta", nl: "mond", uk: "рот", hi: "मुंह" },
  31: { de: "Umzäunung, Rahmen", fr: "enclos, cadre", es: "cercado, marco", it: "recinto, cornice", pt: "cercado, moldura", id: "pagar, kurungan", th: "ขอบเขต, ล้อมกรอบ", ar: "إحاطة, سياج", tr: "çevre, çerçeve", pl: "ogrodzenie", nl: "omheining, kader", uk: "огорожа, рамка", hi: "बाड़, घेरा" },
  32: { de: "Erde, Boden", fr: "terre, sol", es: "tierra, suelo", it: "terra, suolo", pt: "terra, solo", id: "bumi, tanah", th: "ดิน", ar: "أرض, تراب", tr: "toprak", pl: "ziemia, gleba", nl: "aarde, grond", uk: "земля, ґрунт", hi: "मिट्टी, धरती" },
  33: { de: "Gelehrter, Krieger", fr: "lettré, guerrier", es: "erudito, guerrero", it: "studioso, guerriero", pt: "erudito, guerreiro", id: "cendekiawan, prajurit", th: "บัณฑิต, นักรบ", ar: "عالم, محارب", tr: "bilgin, savaşçı", pl: "uczony, wojownik", nl: "geleerde, krijger", uk: "учений, воїн", hi: "विद्वान, योद्धा" },
  34: { de: "nachfolgen, langsam gehen", fr: "suivre lentement", es: "seguir lentamente", it: "seguire lentamente", pt: "seguir lentamente", id: "berjalan lambat", th: "เดินช้า, เดินตาม", ar: "مشي بطيء, تتبع", tr: "yavaş yürümek", pl: "iść powoli z tyłu", nl: "langzaam volgen", uk: "іти слідом, повільно", hi: "धीरे चलना, पीछे चलना" },
  35: { de: "langsamer Schritt", fr: "marche lente", es: "paso lento", it: "passo lento", pt: "passo lento", id: "langkah perlahan", th: "ก้าวช้า", ar: "خطوة بطيئة", tr: "ağır adım", pl: "powolny krok", nl: "langzame pas", uk: "повільна хода", hi: "मंथर गति" },
  36: { de: "Abend", fr: "soir", es: "tarde, noche", it: "sera", pt: "noite, entardecer", id: "sore, malam", th: "ยามเย็น", ar: "مساء", tr: "akşam", pl: "wieczór", nl: "avond", uk: "вечір", hi: "शाम" },
  37: { de: "groß", fr: "grand", es: "grande", it: "grande", pt: "grande", id: "besar", th: "ใหญ่", ar: "كبير", tr: "büyük", pl: "duży", nl: "groot", uk: "великий", hi: "बड़ा" },
  38: { de: "Frau", fr: "femme", es: "mujer", it: "donna", pt: "mulher", id: "wanita, perempuan", th: "ผู้หญิง", ar: "امرأة", tr: "kadın", pl: "kobieta", nl: "vrouw", uk: "жінка", hi: "महिला" },
  39: { de: "Kind, Sohn", fr: "enfant, fils", es: "niño, hijo", it: "bambino, figlio", pt: "criança, filho", id: "anak", th: "เด็ก, บุตร", ar: "طفل, ابن", tr: "çocuk, oğul", pl: "dziecko, syn", nl: "kind, zoon", uk: "дитина, син", hi: "बच्चा, पुत्र" },
  40: { de: "Dach mit Punkt", fr: "toit avec point", es: "techo con punto", it: "tetto con punto", pt: "telhado com ponto", id: "atap berbintik", th: "หลังคามีจุด", ar: "سقف بنقطة", tr: "noktalı çatı", pl: "dach z kropką", nl: "dak met punt", uk: "дах з крапкою", hi: "बिंदुदार छत" },
  41: { de: "Zoll, Daumenbreite", fr: "pouce chinois", es: "pulgada china", it: "pollice cinese", pt: "polegada chinesa", id: "inci Tiongkok", th: "หนึ่งนิ้วจีน", ar: "بوصة صينية", tr: "Çin inçi", pl: "cal chiński", nl: "Chinese duim", uk: "вершок, дюйм", hi: "चीनी इंच" },
  42: { de: "klein", fr: "petit", es: "pequeño", it: "piccolo", pt: "pequeno", id: "kecil", th: "เล็ก", ar: "صغير", tr: "küçük", pl: "mały", nl: "klein", uk: "маленький", hi: "छोटा" },
  43: { de: "lahm, krumm", fr: "boiteux", es: "cojo", it: "zoppo", pt: "coxo", id: "pincang", th: "กะปลกกะเปลี้ย", ar: "أعرج", tr: "topal", pl: "kulawy", nl: "lam, kreupel", uk: "кульгавий", hi: "लंगड़ा" },
  44: { de: "Leiche, Körper", fr: "cadavre, corps", es: "cadáver, cuerpo", it: "cadavere, corpo", pt: "cadáver, corpo", id: "mayat, badan", th: "ศพ, ร่างกาย", ar: "جثة, جسد", tr: "ceset, beden", pl: "zwłoki, ciało", nl: "lijk, lichaam", uk: "труп, тіло", hi: "शव, शरीर" },
  45: { de: "Spross, Keim", fr: "pousse, germe", es: "brote", it: "germoglio", pt: "broto", id: "tunas", th: "หน่ออ่อน", ar: "برعم", tr: "filiz", pl: "kiełek", nl: "scheut, kiem", uk: "паросток", hi: "अंकुर" },
  46: { de: "Berg", fr: "montagne", es: "montaña", it: "montagna", pt: "montanha", id: "gunung", th: "ภูเขา", ar: "جبل", tr: "dağ", pl: "góra", nl: "berg", uk: "гора", hi: "पहाड़" },
  47: { de: "Fluss (川)", fr: "rivière (川)", es: "río (川)", it: "fiume (川)", pt: "rio (川)", id: "sungai (川)", th: "แม่น้ำ (川)", ar: "نهر (川)", tr: "nehir (川)", pl: "rzeka (川)", nl: "rivier (川)", uk: "річка (川)", hi: "नदी (川)" },
  48: { de: "Arbeit, Handwerk", fr: "travail, artisanat", es: "trabajo, oficio", it: "lavoro, mestiere", pt: "trabalho, ofício", id: "pekerjaan, kriya", th: "งาน, ช่าง", ar: "عمل, حرفة", tr: "iş, zanaat", pl: "praca, rzemiosło", nl: "werk, ambacht", uk: "робота, ремесло", hi: "कार्य, शिल्प" },
  49: { de: "selbst", fr: "soi-même", es: "uno mismo", it: "se stesso", pt: "si mesmo", id: "diri sendiri", th: "ตัวเอง", ar: "نفس, ذات", tr: "kendi", pl: "sam, siebie", nl: "zichzelf", uk: "сам, себе", hi: "स्वयं" },
  50: { de: "Tuch, Stoff", fr: "tissu, serviette", es: "tela, pañuelo", it: "stoffa, fazzoletto", pt: "tecido, pano", id: "kain, saputangan", th: "ผ้า, ผ้าเช็ดหน้า", ar: "قماش, منديل", tr: "kumaş, mendil", pl: "tkanina, chusta", nl: "doek, stof", uk: "полотно, тканина", hi: "कपड़ा, तौलिया" },
  51: { de: "Schild", fr: "bouclier", es: "escudo", it: "scudo", pt: "escudo", id: "perisai", th: "โล่", ar: "درع", tr: "kalkan", pl: "tarcza", nl: "schild", uk: "щит", hi: "ढाल" },
  52: { de: "winzig", fr: "minuscule", es: "diminuto", it: "minuscolo", pt: "minúsculo", id: "sangat kecil", th: "จิ๋ว", ar: "ضئيل", tr: "küçücük", pl: "maleńki", nl: "piepklein", uk: "крихітний", hi: "नन्हा" },
  53: { de: "Unterstand", fr: "abri, hangar", es: "cobertizo", it: "tettoia", pt: "abrigo", id: "naungan", th: "เพิง", ar: "مأوى", tr: "barınak", pl: "schronienie", nl: "afdak", uk: "навіс", hi: "आश्रय" },
  54: { de: "weiter Schritt", fr: "enjambée", es: "zancada larga", it: "passo lungo", pt: "passo largo", id: "langkah panjang", th: "ก้าวยาว", ar: "خطوة واسعة", tr: "uzun adım", pl: "długi krok", nl: "grote pas", uk: "довгий крок", hi: "लंबा कदम" },
  55: { de: "zusammengelegte Hände", fr: "mains jointes", es: "manos juntas", it: "mani giunte", pt: "mãos dadas", id: "tangan berpadu", th: "สองมือประสาน", ar: "أيد مشبوكة", tr: "birleşmiş eller", pl: "złożone dłonie", nl: "gevouwen handen", uk: "складені руки", hi: "जुड़े हाथ" },
  56: { de: "Wurfpfeil", fr: "flèche attachée", es: "flecha con cuerda", it: "dardo legato", pt: "dardo com corda", id: "panah bertali", th: "ลูกศรผูกเชือก", ar: "سهم بحبل", tr: "bağlı ok", pl: "strzała na uwięzi", nl: "pijl aan touw", uk: "стріла з мотузкою", hi: "डोर बंधी तीर" },
  57: { de: "Bogen", fr: "arc", es: "arco", it: "arco", pt: "arco", id: "busur", th: "ธนู", ar: "قوس", tr: "yay", pl: "łuk", nl: "boog", uk: "лук", hi: "धनुष" },
  58: { de: "Schweineschnauze", fr: "groin", es: "hocico", it: "grugno", pt: "focinho", id: "moncong babi", th: "หัวหมู", ar: "خطم خنزير", tr: "domuz burnu", pl: "ryj świni", nl: "varkenssnuit", uk: "морда свині", hi: "थूथन" },
  59: { de: "Borste, Striche", fr: "poils, hachures", es: "cerdas, rayas", it: "setole, tratti", pt: "cerdas, traços", id: "bulu halus, guratan", th: "ขนแปรง, ลายริ้ว", ar: "شعر خشن, شرطات", tr: "kıl fırça, çizgiler", pl: "włosie, pociągnięcia", nl: "borstels, streepjes", uk: "ворс, штрихи", hi: "बाल, लकीरें" },
  60: { de: "Schritt (彳)", fr: "petit pas (彳)", es: "paso (彳)", it: "passo (彳)", pt: "passo (彳)", id: "langkah kaki (彳)", th: "ก้าวเดิน (彳)", ar: "خطوة (彳)", tr: "adım (彳)", pl: "krok (彳)", nl: "pas links (彳)", uk: "крок (彳)", hi: "कदम (彳)" },
  61: { de: "Herz (忄)", fr: "cœur (忄)", es: "corazón (忄)", it: "cuore (忄)", pt: "coração (忄)", id: "hati (忄)", th: "หัวใจ (忄)", ar: "قلب (忄)", tr: "kalp (忄)", pl: "serce (忄)", nl: "hart (忄)", uk: "серце (忄)", hi: "हृदय (忄)" },
  62: { de: "Hellebarde", fr: "hallebarde", es: "alabarda", it: "alabarda", pt: "alabarda", id: "tombak halberd", th: "ง้าว", ar: "فأس حربي", tr: "balta mızrak", pl: "halabarda", nl: "hellebaard", uk: "алебарда, спис", hi: "भाला, बरछी" },
  63: { de: "Tür (户)", fr: "porte (户)", es: "puerta (户)", it: "porta (户)", pt: "porta (户)", id: "pintu (户)", th: "ประตู (户)", ar: "باب (户)", tr: "kapı (户)", pl: "drzwi (户)", nl: "deur (户)", uk: "двері (户)", hi: "दरवाजा (户)" },
  64: { de: "Hand (扌)", fr: "main (扌)", es: "mano (扌)", it: "mano (扌)", pt: "mão (扌)", id: "tangan (扌)", th: "มือ (扌)", ar: "يد (扌)", tr: "el (扌)", pl: "ręka (扌)", nl: "hand (扌)", uk: "рука (扌)", hi: "हाथ (扌)" },
  65: { de: "Zweig", fr: "branche", es: "rama", it: "ramo", pt: "galho", id: "cabang, dahan", th: "กิ่งไม้", ar: "غصن", tr: "dal", pl: "gałąź", nl: "tak", uk: "гілка", hi: "शाखा, डाली" },
  66: { de: "schlagen (攵)", fr: "frapper doucement (攵)", es: "golpear (攵)", it: "battere (攵)", pt: "bater (攵)", id: "memukul ringan (攵)", th: "เคาะ, ตี (攵)", ar: "ضرب خفيف (攵)", tr: "vurmak (攵)", pl: "uderzać (攵)", nl: "slaan (攵)", uk: "бити (攵)", hi: "थपथपाना (攵)" },
  67: { de: "Schrift, Kultur", fr: "texte, culture", es: "texto, cultura", it: "scrittura, cultura", pt: "escrita, cultura", id: "tulisan, budaya", th: "อักษร, วัฒนธรรม", ar: "كتابة, ثقافة", tr: "yazı, kültür", pl: "pismo, kultura", nl: "schrift, cultuur", uk: "текст, культура", hi: "साहित्य, संस्कृति" },
  68: { de: "Schöpfkelle", fr: "louche, boisseau", es: "cucharón", it: "mestolo", pt: "concha, medida", id: "gayung", th: "กระบวย", ar: "مغرفة", tr: "kepçe", pl: "chochla, miara", nl: "lepel, schepmaat", uk: "ківш, міра", hi: "करछुल" },
  69: { de: "Axt", fr: "hache", es: "hacha", it: "ascia", pt: "machado", id: "kapak", th: "ขวาน", ar: "فأس", tr: "balta", pl: "topór", nl: "bijl", uk: "сокира", hi: "कुल्हाड़ी" },
  70: { de: "Quadrat, Richtung", fr: "carré, direction", es: "cuadrado, dirección", it: "quadrato, direzione", pt: "quadrado, direção", id: "persegi, arah", th: "สี่เหลี่ยม, ทิศทาง", ar: "مربع, اتجاه", tr: "kare, yön", pl: "kwadrat, strona", nl: "vierkant, richting", uk: "квадрат, напрямок", hi: "चौकोर, दिशा" },
  71: { de: "nicht, ohne", fr: "sans, néant", es: "sin, no", it: "senza, non", pt: "sem, não", id: "tiada, tanpa", th: "ไม่มี", ar: "بلا, ليس", tr: "yok, -siz", pl: "bez, nie ma", nl: "zonder, niet", uk: "без, нема", hi: "बिना, नहीं" },
  72: { de: "Sonne, Tag", fr: "soleil, jour", es: "sol, día", it: "sole, giorno", pt: "sol, dia", id: "matahari, hari", th: "ดวงอาทิตย์, วัน", ar: "شمس, يوم", tr: "güneş, gün", pl: "słońce, dzień", nl: "zon, dag", uk: "сонце, день", hi: "सूर्य, दिन" },
  73: { de: "sagen", fr: "dire", es: "decir", it: "dire", pt: "dizer", id: "berkata", th: "กล่าวว่า", ar: "قال", tr: "söylemek", pl: "mówić", nl: "zeggen", uk: "казати, мовити", hi: "कहना" },
  74: { de: "Mond, Monat", fr: "lune, mois", es: "luna, mes", it: "luna, mese", pt: "lua, mês", id: "bulan", th: "ดวงจันทร์, เดือน", ar: "قمر, شهر", tr: "ay", pl: "księżyc, miesiąc", nl: "maan, maand", uk: "місяць", hi: "चंद्रमा, महीना" },
  75: { de: "Baum, Holz", fr: "arbre, bois", es: "árbol, madera", it: "albero, legno", pt: "árvore, madeira", id: "pohon, kayu", th: "ต้นไม้, ไม้", ar: "شجرة, خشب", tr: "ağaç, tahta", pl: "drzewo", nl: "boom, hout", uk: "дерево", hi: "पेड़, लकड़ी" },
  76: { de: "gähnen, fehlen", fr: "bâiller, manquer", es: "bostezar, carecer", it: "sbadigliare, mancare", pt: "bocejar, carecer", id: "menguap, kurang", th: "หาว, ขาดแคลน", ar: "تثاؤب, نقص", tr: "esnemek, eksiklik", pl: "ziewać, brak", nl: "geeuwen, ontbreken", uk: "позіхати, бракнути", hi: "जम्हाई, कमी" },
  77: { de: "anhalten", fr: "s'arrêter", es: "detenerse", it: "fermarsi", pt: "parar", id: "berhenti", th: "หยุด", ar: "توقف", tr: "durmak", pl: "zatrzymać się", nl: "stoppen", uk: "зупинитися", hi: "रुकना" },
  78: { de: "Tod, Verfall", fr: "mort, péril", es: "muerte, decadencia", it: "morte, decadenza", pt: "morte, ruína", id: "kematian, buruk", th: "ความตาย", ar: "موت, هلاك", tr: "ölüm, fena", pl: "śmierć, zły", nl: "dood, verderf", uk: "смерть, лихий", hi: "मृत्यु, विनाश" },
  79: { de: "Waffe, Spieß", fr: "lance, pique", es: "lanza, pica", it: "lancia, picca", pt: "lança, vara", id: "tombak bambu", th: "หอกยาว", ar: "رمح", tr: "kargı, mızrak", pl: "dzida, broń", nl: "lans, spies", uk: "спис, зброя", hi: "भाला, अस्त्र" },
  80: { de: "nicht dürfen, Mutter", fr: "ne pas, mère", es: "no deber, madre", it: "non dovere, madre", pt: "não dever, mãe", id: "jangan, ibu", th: "อย่า, มารดา", ar: "لا تفعل, أم", tr: "yapma, anne", pl: "nie wolno, matka", nl: "niet mogen, moeder", uk: "не можна, мати", hi: "मत करो, माता" },
  81: { de: "vergleichen", fr: "comparer", es: "comparar", it: "confrontare", pt: "comparar", id: "membandingkan", th: "เปรียบเทียบ", ar: "مقارنة", tr: "karşılaştırmak", pl: "porównywać", nl: "vergelijken", uk: "порівнювати", hi: "तुलना करना" },
  82: { de: "Fell, Haar", fr: "poil, plume", es: "pelaje, vello", it: "pelo, pelliccia", pt: "pelo, lã", id: "bulu", th: "ขนสัตว์, ผม", ar: "شعر, صوف", tr: "tüy, kıl", pl: "sierść, włos", nl: "vacht, haar", uk: "шерсть, хутро", hi: "रोआं, बाल" },
  83: { de: "Sippe, Familie", fr: "clan, lignée", es: "clan, linaje", it: "clan, stirpe", pt: "clã, linhagem", id: "marga, klan", th: "ตระกูล", ar: "عشيرة, نسب", tr: "klan, soy", pl: "ród, klan", nl: "clan, geslacht", uk: "рід, клан", hi: "कुल, वंश" },
  84: { de: "Dampf, Luft, Qi", fr: "vapeur, souffle, Qi", es: "vapor, aire, Qi", it: "vapore, aria, Qi", pt: "vapor, ar, Qi", id: "uap, udara, Qi", th: "ไอระเหย, พลังปราณ", ar: "بخار, هواء, طاقة تشي", tr: "buhar, nefes, Qi", pl: "para, powietrze, Qi", nl: "stoom, lucht, Qi", uk: "пара, повітря, ці", hi: "भाप, हवा, ची" },
  85: { de: "Wasser (氵)", fr: "eau (氵)", es: "agua (氵)", it: "acqua (氵)", pt: "água (氵)", id: "air (氵)", th: "น้ำ (氵)", ar: "ماء (氵)", tr: "su (氵)", pl: "woda (氵)", nl: "water (氵)", uk: "вода (氵)", hi: "जल (氵)" },
  86: { de: "Feuer (灬)", fr: "feu (灬)", es: "fuego (灬)", it: "fuoco (灬)", pt: "fogo (灬)", id: "api (灬)", th: "ไฟ (灬)", ar: "نار (灬)", tr: "ateş (灬)", pl: "ogień (灬)", nl: "vuur (灬)", uk: "вогонь (灬)", hi: "अग्नि (灬)" },
  87: { de: "Kralle (爫)", fr: "griffe (爫)", es: "garra (爫)", it: "artiglio (爫)", pt: "garra (爫)", id: "cakar (爫)", th: "กรงเล็บ (爫)", ar: "مخلب (爫)", tr: "pençe (爫)", pl: "pazur (爫)", nl: "klauw (爫)", uk: "кіготь, лапа (爫)", hi: "पंजा (爫)" },
  88: { de: "Vater", fr: "père", es: "padre", it: "padre", pt: "pai", id: "ayah", th: "พ่อ, บิดา", ar: "أب", tr: "baba", pl: "ojciec", nl: "vader", uk: "батько", hi: "पिता" },
  89: { de: "Trigrammstrich", fr: "traits du Yi Jing", es: "trazos del I Ching", it: "linee dei trigrammi", pt: "linhas dos trigramas", id: "garis trigram", th: "เส้นตรีลักษณ์", ar: "خطوط الأشكال الثمانية", tr: "trigram çizgisi", pl: "linie heksagramu", nl: "trigramstrepen", uk: "риса триграми", hi: "त्रिग्राम रेखा" },
  90: { de: "gespaltenes Holz (丬)", fr: "bois fendu (丬)", es: "madera partida (丬)", it: "legno spaccato (丬)", pt: "madeira fendida (丬)", id: "belahan kayu (丬)", th: "ไม้ซีก (丬)", ar: "لوح خشبي مشقوق (丬)", tr: "yarık tahta (丬)", pl: "rozszczepione drewno (丬)", nl: "gekliefd hout (丬)", uk: "дощечка (丬)", hi: "कटा तख्ता (丬)" },
  91: { de: "Scheibe, Span", fr: "tranche, éclat", es: "lámina, astilla", it: "fetta, scaglia", pt: "fatia, lasca", id: "lempeng, serpihan", th: "แผ่นไม้, ชิ้นส่วน", ar: "شريحة, فلقة", tr: "dilim, kıymık", pl: "płatek, szczapka", nl: "plak, splinter", uk: "пластинка, шматочок", hi: "टुकड़ा, फांक" },
  92: { de: "Fangzahn", fr: "croc, canine", es: "colmillo", it: "zanna", pt: "presa, canino", id: "taring", th: "เขี้ยว", ar: "ناب", tr: "azı dişi, köpek dişi", pl: "kieł", nl: "hoektand", uk: "ікло", hi: "दाढ़, नुकीला दांत" },
  93: { de: "Kuh, Rind (牜)", fr: "vache, bœuf (牜)", es: "vaca, buey (牜)", it: "bue, mucca (牜)", pt: "vaca, boi (牜)", id: "sapi, lembu (牜)", th: "วัว (牜)", ar: "بقرة, ثور (牜)", tr: "sığır, inek (牜)", pl: "byk, krowa (牜)", nl: "koe, rund (牜)", uk: "бик, корова (牜)", hi: "गाय, बैल (牜)" },
  94: { de: "Hund (犭)", fr: "chien (犭)", es: "perro (犭)", it: "cane (犭)", pt: "cão (犭)", id: "anjing (犭)", th: "สุนัข (犭)", ar: "كلب (犭)", tr: "köpek (犭)", pl: "pies (犭)", nl: "hond (犭)", uk: "собака (犭)", hi: "कुत्ता (犭)" },
  95: { de: "tiefgründig, dunkel", fr: "profond, mystérieux", es: "profundo, oscuro", it: "profondo, oscuro", pt: "profundo, misterioso", id: "mendalam, misterius", th: "ลึกซึ้ง, ลึกลับ", ar: "عميق, غامض", tr: "derin, gizemli", pl: "głęboki, mroczny", nl: "diepzinnig, duister", uk: "глибокий, таємничий", hi: "गहरा, रहस्यमय" },
  96: { de: "Jade (王)", fr: "jade (王)", es: "jade (王)", it: "giada (王)", pt: "jade (王)", id: "giok (王)", th: "หยก (王)", ar: "يشم (王)", tr: "yeşim taşı (王)", pl: "nefryt (王)", nl: "jade (王)", uk: "нефрит (王)", hi: "हरिताश्म, जेड (王)" },
  97: { de: "Melone", fr: "melon, courge", es: "melón, calabaza", it: "melone, zucca", pt: "melão, abóbora", id: "melon, labu", th: "แตง, ฟัก", ar: "شمام, بطيخ", tr: "kavun", pl: "melon, dynia", nl: "meloen", uk: "гарбуз, диня", hi: "खरबूजा" },
  98: { de: "Ziegel", fr: "tuile", es: "teja", it: "tegola", pt: "telha", id: "genteng, tembikar", th: "กระเบื้อง", ar: "قرميد", tr: "kiremit", pl: "dachówka", nl: "dakpan", uk: "черепиця", hi: "खपरैल" },
  99: { de: "süß", fr: "doux, sucré", es: "dulce", it: "dolce", pt: "doce", id: "manis", th: "หวาน", ar: "حلو", tr: "tatlı", pl: "słodki", nl: "zoet", uk: "солодкий", hi: "मीठा" },
  100: { de: "Leben, Geburt", fr: "vie, naissance", es: "vida, nacer", it: "vita, nascita", pt: "vida, nascer", id: "kehidupan, lahir", th: "ชีวิต, กำเนิด", ar: "حياة, ولادة", tr: "yaşam, doğum", pl: "życie, narodziny", nl: "leven, geboorte", uk: "життя, народження", hi: "जीवन, जन्म" },
  101: { de: "benutzen, nützen", fr: "utiliser, utilité", es: "usar, utilidad", it: "usare, utilità", pt: "usar, utilidade", id: "menggunakan, manfaat", th: "ใช้, ประโยชน์", ar: "استخدام, فائدة", tr: "kullanmak, yarar", pl: "używać, pożytek", nl: "gebruiken, nut", uk: "застосовувати, користь", hi: "उपयोग, लाभ" },
  102: { de: "Feld", fr: "champ", es: "campo", it: "campo", pt: "campo", id: "sawah, ladang", th: "ทุ่งนา", ar: "حقل", tr: "tarla", pl: "pole", nl: "veld, akker", uk: "поле", hi: "खेत" },
  103: { de: "Stoffballen, Bein", fr: "pièce d'étoffe, jambe", es: "rollo de tela, pierna", it: "pezza di stoffa, gamba", pt: "rolo de pano, perna", id: "gulungan kain, kaki", th: "ม้วนผ้า, ขา", ar: "لفة قماش, ساق", tr: "kumaş topu, bacak", pl: "bela tkaniny, noga", nl: "rol stof, been", uk: "сувій тканини, нога", hi: "कपड़े का थान, पैर" },
  104: { de: "Krankheit (疒)", fr: "maladie (疒)", es: "enfermedad (疒)", it: "malattia (疒)", pt: "doença (疒)", id: "penyakit (疒)", th: "โรคภัย (疒)", ar: "مرض (疒)", tr: "hastalık (疒)", pl: "choroba (疒)", nl: "ziekte (疒)", uk: "хвороба (疒)", hi: "रोग, बीमारी (疒)" },
  105: { de: "Schritte, gespreizte Beine", fr: "pas, jambes écartées", es: "pasos, piernas abiertas", it: "passi, gambe divaricate", pt: "passos, pernas abertas", id: "langkah, kaki terbuka", th: "ก้าวเดิน, ขากาง", ar: "خطوات, سيقان منفرجة", tr: "adımlar, açık bacaklar", pl: "kroki, rozstawione nogi", nl: "voetstappen", uk: "кроки, розставлені ноги", hi: "कदम, फैले पैर" },
  106: { de: "weiß", fr: "blanc", es: "blanco", it: "bianco", pt: "branco", id: "putih", th: "สีขาว", ar: "أبيض", tr: "beyaz", pl: "biały", nl: "wit", uk: "білий", hi: "सफेद" },
  107: { de: "Haut, Leder", fr: "peau, cuir", es: "piel, cuero", it: "pelle, cuoio", pt: "pele, couro", id: "kulit", th: "ผิวหนัง, หนังสัตว์", ar: "جلد, بشرة", tr: "deri, ten", pl: "skóra", nl: "huid, leer", uk: "шкіра", hi: "त्वचा, चमड़ा" },
  108: { de: "Schale, Gefäß", fr: "plat, vaisselle", es: "plato, vasija", it: "piatto, stoviglie", pt: "prato, vasilha", id: "piring, bejana", th: "จานชาม, ภาชนะ", ar: "صحن, وعاء", tr: "tabak, kap", pl: "miska, naczynie", nl: "schaal, vaatwerk", uk: "посуд, таріль", hi: "बर्तन, थाली" },
  109: { de: "Auge", fr: "œil", es: "ojo", it: "occhio", pt: "olho", id: "mata", th: "ดวงตา", ar: "عين", tr: "göz", pl: "oko", nl: "oog", uk: "око", hi: "आंख" },
  110: { de: "Speer", fr: "lance", es: "lanza", it: "lancia", pt: "lança", id: "tombak", th: "หอก", ar: "رمح", tr: "mızrak", pl: "włócznia", nl: "speer", uk: "спис", hi: "भाला" },
  111: { de: "Pfeil", fr: "flèche", es: "flecha", it: "freccia", pt: "flecha", id: "panah", th: "ลูกศร", ar: "سهم", tr: "ok", pl: "strzała", nl: "pijl", uk: "стріла", hi: "तीर" },
  112: { de: "Stein", fr: "pierre", es: "piedra", it: "pietra", pt: "pedra", id: "batu", th: "หิน", ar: "حجر", tr: "taş", pl: "kamień", nl: "steen", uk: "камінь", hi: "पत्थर" },
  113: { de: "Geist, Altar (礻)", fr: "esprit, autel (礻)", es: "espíritu, altar (礻)", it: "spirito, altare (礻)", pt: "espírito, altar (礻)", id: "roh, altar (礻)", th: "เทพารักษ์, แท่นบูชา (礻)", ar: "روح, مذبح (礻)", tr: "ruh, sunak (礻)", pl: "duch, ołtarz (礻)", nl: "geest, altaar (礻)", uk: "дух, вівтар (礻)", hi: "आत्मा, वेदी (礻)" },
  114: { de: "Tierspur", fr: "empreinte d'animal", es: "rastro de animal", it: "orma di animale", pt: "rastro de animal", id: "jejak kaki hewan", th: "รอยเท้าสัตว์", ar: "أثر حيوان", tr: "hayvan izi", pl: "trop zwierzęcy", nl: "dierspoor", uk: "слід звіра", hi: "जानवर के पदचिह्न" },
  115: { de: "Getreide, Ähre", fr: "céréale, grain", es: "cereal, grano", it: "cereale, spiga", pt: "cereal, grão", id: "padi-padian, biji", th: "รวงข้าว, พืชไร่", ar: "حبوب, سنبلة", tr: "tahıl, başak", pl: "zboże, kłos", nl: "graan, aar", uk: "злак, колос", hi: "अनाज, बाली" },
  116: { de: "Höhle", fr: "caverne, grotte", es: "cueva", it: "caverna", pt: "caverna", id: "gua", th: "ถ้ำ", ar: "كهف", tr: "mağara", pl: "jaskinia", nl: "grot, hol", uk: "печера, нора", hi: "गुफा" },
  117: { de: "stehen", fr: "se tenir debout", es: "estar de pie", it: "stare in piedi", pt: "ficar de pé", id: "berdiri", th: "ยืน", ar: "وقوف", tr: "ayakta durmak", pl: "stać", nl: "staan", uk: "стояти", hi: "खड़े होना" },
  118: { de: "Bambus (⺮)", fr: "bambou (⺮)", es: "bambú (⺮)", it: "bambù (⺮)", pt: "bambu (⺮)", id: "bambu (⺮)", th: "ไผ่ (⺮)", ar: "خيزران (⺮)", tr: "bambu (⺮)", pl: "bambus (⺮)", nl: "bamboe (⺮)", uk: "бамбук (⺮)", hi: "बांस (⺮)" },
  119: { de: "Reis", fr: "riz", es: "arroz", it: "riso", pt: "arroz", id: "beras", th: "ข้าว", ar: "أرز", tr: "pirinç", pl: "ryż", nl: "rijst", uk: "рис", hi: "चावल" },
  120: { de: "Seide, Faden (纟)", fr: "soie, fil (纟)", es: "seda, hilo (纟)", it: "seta, filo (纟)", pt: "seda, fio (纟)", id: "sutra, benang (纟)", th: "ไหม, เส้นด้าย (纟)", ar: "حرير, خيط (纟)", tr: "ipek, iplik (纟)", pl: "jedwab, nić (纟)", nl: "zijde, draad (纟)", uk: "шовк, нитка (纟)", hi: "रेशम, धागा (纟)" },
  121: { de: "Krug, Tongefäß", fr: "jarre, poterie", es: "jarra, vasija de barro", it: "giara, vaso di terracotta", pt: "jarro, cerâmica", id: "guci tanah liat", th: "ไหดินเผา", ar: "جرة فخارية", tr: "toprak testi", pl: "dzban gliniany", nl: "kruik, aarden pot", uk: "глечик, посудина", hi: "मिट्टी का घड़ा" },
  122: { de: "Netz (罒)", fr: "filet (罒)", es: "red (罒)", it: "rete (罒)", pt: "rede (罒)", id: "jaring (罒)", th: "ตาข่าย (罒)", ar: "شبكة (罒)", tr: "ağ (罒)", pl: "sieć (罒)", nl: "net (罒)", uk: "сітка (罒)", hi: "जाल (罒)" },
  123: { de: "Schaf, Widder (⺶)", fr: "mouton, bélier (⺶)", es: "oveja, carnero (⺶)", it: "pecora, ariete (⺶)", pt: "ovelha, carneiro (⺶)", id: "domba, kambing (⺶)", th: "แกะ, แพะ (⺶)", ar: "خروف, كبش (⺶)", tr: "koyun, koç (⺶)", pl: "owca, baran (⺶)", nl: "schaap, ram (⺶)", uk: "вівця, баран (⺶)", hi: "भेड़ (⺶)" },
  124: { de: "Feder, Flügel", fr: "plume, ailes", es: "pluma, alas", it: "piuma, ali", pt: "pena, asas", id: "bulu unggas, sayap", th: "ขนนก, ปีก", ar: "ريش, أجنحة", tr: "tüy, kanat", pl: "pióro, skrzydła", nl: "veer, vleugels", uk: "перо, крила", hi: "पंख" },
  125: { de: "alt (耂)", fr: "vieux, âgé (耂)", es: "viejo, anciano (耂)", it: "vecchio, anziano (耂)", pt: "velho, idoso (耂)", id: "tua, lansia (耂)", th: "แก่, ผู้สูงวัย (耂)", ar: "مسن, شيخ (耂)", tr: "yaşlı (耂)", pl: "stary, sędziwy (耂)", nl: "oud, bejaard (耂)", uk: "старий, літній (耂)", hi: "बूढ़ा, वृद्ध (耂)" },
  126: { de: "Bart, und", fr: "barbe, et", es: "barba, y", it: "barba, e", pt: "barba, e", id: "janggut, dan", th: "เครา, และ", ar: "لحية, و", tr: "sakal, ve", pl: "broda, oraz", nl: "baard, en", uk: "борода, сполучник 'і'", hi: "दाढ़ी, और" },
  127: { de: "Pflug", fr: "charrue", es: "arado", it: "aratro", pt: "arado", id: "bajak tanah", th: "คันไถ", ar: "محراث", tr: "saban", pl: "pług", nl: "ploeg", uk: "плуг, соха", hi: "हल" },
  128: { de: "Ohr", fr: "oreille", es: "oreja", it: "orecchio", pt: "orelha", id: "telinga", th: "หู", ar: "أذن", tr: "kulak", pl: "ucho", nl: "oor", uk: "вухо", hi: "कान" },
  129: { de: "Schreibpinsel", fr: "pinceau d'écriture", es: "pincel de caligrafía", it: "pennello per scrittura", pt: "pincel de escrita", id: "kuas tulis", th: "พู่กันเขียนหนังสือ", ar: "فرشاة كتابة", tr: "yazı fırçası", pl: "pędzel do pisania", nl: "schrijfpenseel", uk: "пензель для письма", hi: "लेखनी, ब्रश" },
  130: { de: "Fleisch (月)", fr: "chair, viande (月)", es: "carne, cuerpo (月)", it: "carne, corpo (月)", pt: "carne, corpo (月)", id: "daging (月)", th: "เนื้อ (月)", ar: "لحم (月)", tr: "et (月)", pl: "mięso, ciało (月)", nl: "vlees (月)", uk: "м'ясо, тіло (月)", hi: "मांस, शरीर (月)" },
  131: { de: "Minister, Untertan", fr: "ministre, sujet", es: "ministro, vasallo", it: "ministro, suddito", pt: "ministro, súdito", id: "menteri, abdi", th: "เสนาบดี, ข้าราชบริพาร", ar: "وزير, تابع", tr: "bakan, tebaa", pl: "minister, poddany", nl: "minister, onderdaan", uk: "міністр, підданий", hi: "मंत्री, दरबारी" },
  132: { de: "selbst, Nase", fr: "soi-même, nez", es: "uno mismo, nariz", it: "se stesso, naso", pt: "si mesmo, nariz", id: "diri sendiri, hidung", th: "ตนเอง, จมูก", ar: "نفس, أنف", tr: "kendi, burun", pl: "sam, nos", nl: "zelf, neus", uk: "сам, ніс", hi: "स्वयं, नाक" },
  133: { de: "ankommen, erreichen", fr: "arriver, atteindre", es: "llegar, alcanzar", it: "arrivare, giungere", pt: "chegar, alcançar", id: "tiba, sampai", th: "มาถึง, บรรลุ", ar: "وصول, بلوغ", tr: "varmak, ulaşmak", pl: "przybywać, osiągać", nl: "aankomen, bereiken", uk: "досягати, прибувати", hi: "पहुंचना" },
  134: { de: "Mörser", fr: "mortier", es: "mortero", it: "mortaio", pt: "pilão, almofariz", id: "lesung", th: "ครก", ar: "هاون", tr: "havan", pl: "moździerz", nl: "vijzel, mortier", uk: "ступа", hi: "ओखली" },
  135: { de: "Zunge", fr: "langue", es: "lengua", it: "lingua", pt: "língua", id: "lidah", th: "ลิ้น", ar: "لسان", tr: "dil", pl: "język", nl: "tong", uk: "язик", hi: "जीभ" },
  136: { de: "Gegensatz, Fehler", fr: "opposition, erreur", es: "oponerse, error", it: "opporsi, errore", pt: "opor-se, erro", id: "pertentangan, keliru", th: "ตรงข้าม, คลาดเคลื่อน", ar: "تعارض, خطأ", tr: "zıtlık, hata", pl: "przeciwieństwo, błąd", nl: "tegenstelling, fout", uk: "протилежність, помилка", hi: "विरोध, त्रुटि" },
  137: { de: "Boot, Schiff", fr: "bateau, barque", es: "barco, bote", it: "barca, nave", pt: "barco, navio", id: "perahu, kapal", th: "เรือ", ar: "قارب, سفينة", tr: "kayık, tekne", pl: "łódź, statek", nl: "boot, schip", uk: "човен, судно", hi: "नाव, नौका" },
  138: { de: "anhalten, standhaft", fr: "s'arrêter, inflexible", es: "detenerse, firme", it: "fermarsi, saldo", pt: "parar, firme", id: "berhenti, teguh", th: "หยุดยั้ง, หนักแน่น", ar: "توقف, صلابة", tr: "durmak, dirençli", pl: "zatrzymanie, twardy", nl: "stilstaan, standvastig", uk: "зупинка, твердий", hi: "ठहराव, दृढ़" },
  139: { de: "Farbe", fr: "couleur", es: "color", it: "colore", pt: "cor", id: "warna", th: "สีสัน", ar: "لون", tr: "renk", pl: "kolor", nl: "kleur", uk: "колір", hi: "रंग" },
  140: { de: "Gras (艹)", fr: "herbe (艹)", es: "hierba (艹)", it: "erba (艹)", pt: "grama, erva (艹)", id: "rumput (艹)", th: "หญ้า (艹)", ar: "عشب (艹)", tr: "ot, çimen (艹)", pl: "trawa (艹)", nl: "gras (艹)", uk: "трава (艹)", hi: "घास (艹)" },
  141: { de: "Tiger", fr: "tigre", es: "tigre", it: "tigre", pt: "tigre", id: "harimau", th: "เสือ", ar: "نمر", tr: "kaplan", pl: "tygrys", nl: "tijger", uk: "тигр", hi: "बाघ" },
  142: { de: "Insekt, Wurm", fr: "insecte, ver", es: "insecto, gusano", it: "insetto, verme", pt: "inseto, verme", id: "serangga, cacing", th: "แมลง, หนอน", ar: "حشرة, دودة", tr: "böcek, solucan", pl: "owad, robak", nl: "insect, worm", uk: "комаха, черв'як", hi: "कीड़ा, कीट" },
  143: { de: "Blut", fr: "sang", es: "sangre", it: "sangue", pt: "sangue", id: "darah", th: "เลือด", ar: "دم", tr: "kan", pl: "krew", nl: "bloed", uk: "кров", hi: "रक्त, खून" },
  144: { de: "gehen, Reihe", fr: "marcher, rangée", es: "ir, fila", it: "camminare, fila", pt: "andar, fila", id: "berjalan, barisan", th: "เดิน, แถว", ar: "سير, صف", tr: "yürümek, sıra", pl: "iść, szereg", nl: "lopen, rij", uk: "йти, ряд", hi: "चलना, पंक्ति" },
  145: { de: "Kleidung (衤)", fr: "vêtement (衤)", es: "ropa (衤)", it: "vestito (衤)", pt: "roupa (衤)", id: "pakaian (衤)", th: "เสื้อผ้า (衤)", ar: "ملابس (衤)", tr: "giysi (衤)", pl: "odzież (衤)", nl: "kleding (衤)", uk: "одяг (衤)", hi: "वस्त्र (衤)" },
  146: { de: "Abdeckung, Westen (覀)", fr: "couvrir, ouest (覀)", es: "cubrir, oeste (覀)", it: "coprire, ovest (覀)", pt: "cobrir, oeste (覀)", id: "menutup, barat (覀)", th: "ปกคลุม, ตะวันตก (覀)", ar: "تغطية, غرب (覀)", tr: "örtmek, batı (覀)", pl: "przykrywać, zachód (覀)", nl: "bedekken, westen (覀)", uk: "покривати, захід (覀)", hi: "ढकना, पश्चिम (覀)" },
  147: { de: "sehen (见)", fr: "voir (见)", es: "ver (见)", it: "vedere (见)", pt: "ver (见)", id: "melihat (见)", th: "มองเห็น (见)", ar: "رؤية (见)", tr: "görmek (见)", pl: "widzieć (见)", nl: "zien (见)", uk: "бачити (见)", hi: "देखना (见)" },
  148: { de: "Horn, Ecke", fr: "corne, angle", es: "cuerno, esquina", it: "corno, angolo", pt: "chifre, canto", id: "tanduk, sudut", th: "เขา動, มุม", ar: "قرن, زاوية", tr: "boynuz, köşe", pl: "róg, kąt", nl: "hoorn, hoek", uk: "ріг, кут", hi: "सींग, कोना" },
  149: { de: "Sprache, Wort (讠)", fr: "parole, mot (讠)", es: "palabra, habla (讠)", it: "parola, discorso (讠)", pt: "fala, palavra (讠)", id: "kata, bicara (讠)", th: "คำพูด, วาจา (讠)", ar: "كلام, لغة (讠)", tr: "söz, konuşma (讠)", pl: "słowo, mowa (讠)", nl: "spraak, woord (讠)", uk: "мова, слово (讠)", hi: "वाणी, शब्द (讠)" },
  150: { de: "Tal, Schlucht", fr: "vallée, gorge", es: "valle", it: "valle", pt: "vale", id: "lembah", th: "หุบเขา", ar: "وادي", tr: "vadi", pl: "dolina", nl: "vallei, dal", uk: "долина, ущелина", hi: "घाटी" },
  151: { de: "Bohne, Gefäß", fr: "haricot, vase", es: "frijol, vasija", it: "fagiolo, vaso", pt: "feijão, vaso", id: "kacang, wadah", th: "ถั่ว, ถ้วยโบราณ", ar: "فول, إناء", tr: "fasulye, çanak", pl: "fasola, naczynie", nl: "boon, vat", uk: "біб, посудина", hi: "सेम, पात्र" },
  152: { de: "Schwein", fr: "porc, cochon", es: "cerdo", it: "maiale", pt: "porco", id: "babi", th: "สุกร, หมู", ar: "خنزير", tr: "domuz", pl: "świnia", nl: "varken", uk: "свиня", hi: "सूअर" },
  153: { de: "Raubtier, Dachs", fr: "blaireau, bête", es: "tejón, fiera", it: "tasso, fiera", pt: "texugo, fera", id: "binatang buas", th: "สัตว์ร้าย, แบดเจอร์", ar: "غرير, وحش", tr: "porsuk, canavar", pl: "borsuk, bestia", nl: "das, roofdier", uk: "хижий звір, борсук", hi: "बिज्जू, हिंसक पशु" },
  154: { de: "Muschel, Geld (贝)", fr: "coquillage, monnaie (贝)", es: "concha, dinero (贝)", it: "conchiglia, denaro (贝)", pt: "concha, dinheiro (贝)", id: "kerang, uang (贝)", th: "เปลือกหอย, เงินตรา (贝)", ar: "صدفة, مال (贝)", tr: "deniz kabuğu, para (贝)", pl: "muszla, pieniądze (贝)", nl: "schelp, geld (贝)", uk: "черепашка, гроші (贝)", hi: "शंख, धन (贝)" },
  155: { de: "rot", fr: "rouge", es: "rojo", it: "rosso", pt: "vermelho", id: "merah", th: "สีแดง", ar: "أحمر", tr: "kırmızı", pl: "czerwony", nl: "rood", uk: "червоний", hi: "लाल" },
  156: { de: "laufen, gehen", fr: "courir, marcher", es: "correr, caminar", it: "correre, andare", pt: "correr, andar", id: "berlari, berjalan", th: "วิ่ง, เดิน", ar: "ركض, مشي", tr: "koşmak, yürümek", pl: "biec, iść", nl: "rennen, lopen", uk: "бігти, йти", hi: "दौड़ना, चलना" },
  157: { de: "Fuß (⻊)", fr: "pied, jambe (⻊)", es: "pie, pata (⻊)", it: "piede (⻊)", pt: "pé (⻊)", id: "kaki (⻊)", th: "เท้า (⻊)", ar: "قدم (⻊)", tr: "ayak (⻊)", pl: "stopa, noga (⻊)", nl: "voet (⻊)", uk: "нога, стопа (⻊)", hi: "पैर (⻊)" },
  158: { de: "Körper", fr: "corps", es: "cuerpo", it: "corpo", pt: "corpo", id: "tubuh, badan", th: "ร่างกาย", ar: "جسد", tr: "vücut, beden", pl: "ciało", nl: "lichaam", uk: "тіло", hi: "शरीर" },
  159: { de: "Wagen, Auto (车)", fr: "véhicule, char (车)", es: "carro, coche (车)", it: "carro, auto (车)", pt: "carro, carruagem (车)", id: "kereta, gerobak (车)", th: "เกวียน, รถ (车)", ar: "عربة, سيارة (车)", tr: "araba, vagon (车)", pl: "wóz, pojazd (车)", nl: "wagen, auto (车)", uk: "віз, візок, машина (车)", hi: "गाड़ी, रथ (车)" },
  160: { de: "bitter, scharf", fr: "amer, piquant", es: "amargo, picante", it: "amaro, piccante", pt: "amargo, picante", id: "pahit, pedas", th: "เผ็ดร้อน, ขมขื่น", ar: "مر, لاذع", tr: "acı, sert", pl: "gorzki, ostry", nl: "bitter, scherp", uk: "гіркий, тяжкий", hi: "कड़वा, तीखा" },
  161: { de: "Morgen, Tierkreiszeichen", fr: "matin, signe céleste", es: "mañana, signo zodiacal", it: "mattino, segno zodiacale", pt: "manhã, signo zodiacal", id: "pagi, tanda zodiak", th: "ยามเช้า, ยามมะโรง", ar: "صباح, علامة البروج", tr: "sabah, burç işareti", pl: "poranek, znak zodiaku", nl: "morgen, sterrenbeeld", uk: "ранок, знак зодіаку", hi: "सवेरा, राशि चिह्न" },
  162: { de: "gehen, Bewegung (辶)", fr: "marcher, mouvement (辶)", es: "caminar, avance (辶)", it: "camminare, moto (辶)", pt: "caminhar, movimento (辶)", id: "berjalan, bergerak (辶)", th: "เดินก้าวหน้า (辶)", ar: "سير, حركة (辶)", tr: "yürümek, hareket (辶)", pl: "iść, ruch (辶)", nl: "lopen, beweging (辶)", uk: "рух, іти (辶)", hi: "चलना, गति (辶)" },
  163: { de: "Stadt (阝 rechts)", fr: "ville (阝 droite)", es: "ciudad (阝 derecha)", it: "città (阝 destra)", pt: "cidade (阝 direita)", id: "kota (阝 kanan)", th: "เมือง (阝 ขวา)", ar: "مدينة (阝 يمين)", tr: "şehir (阝 sağ)", pl: "miasto (阝 z prawej)", nl: "stad (阝 rechts)", uk: "місто (阝 справа)", hi: "नगर (阝 दायां)" },
  164: { de: "Wein, Weinkrug", fr: "vin, cruche", es: "vino, vasija de vino", it: "vino, vaso da vino", pt: "vinho, jarro de vinho", id: "arak, wadah tuak", th: "เหล้า, ไหเหล้า", ar: "نبيذ, جرة خمر", tr: "şarap, içki testisi", pl: "wino, dzban wina", nl: "wijn, wijnkruik", uk: "вино, посудина з вином", hi: "मदिरा, शराब का पात्र" },
  165: { de: "unterscheiden", fr: "distinguer", es: "distinguir", it: "distinguere", pt: "distinguir", id: "membedakan", th: "จำแนกแยกแยะ", ar: "تمييز", tr: "ayırt etmek", pl: "rozróżniać", nl: "onderscheiden", uk: "розрізняти", hi: "भेद करना" },
  166: { de: "Dorf, Meile", fr: "village, li chinois", es: "pueblo, milla china", it: "villaggio, li", pt: "vila, légua chinesa", id: "desa, li Tiongkok", th: "หมู่บ้าน, ลี้", ar: "قرية, ميل صيني", tr: "köy, Çin mili", pl: "wieś, chińska mila", nl: "dorp, Chinese mijl", uk: "село, китайська верста", hi: "गांव, चीनी मील" },
  167: { de: "Metall, Gold (钅)", fr: "métal, or (钅)", es: "metal, oro (钅)", it: "metallo, oro (钅)", pt: "metal, ouro (钅)", id: "logam, emas (钅)", th: "โลหะ, ทอง (钅)", ar: "معدن, ذهب (钅)", tr: "metal, altın (钅)", pl: "metal, złoto (钅)", nl: "metaal, goud (钅)", uk: "метал, золото (钅)", hi: "धातु, सोना (钅)" },
  168: { de: "lang, wachsen (长)", fr: "long, grandir (长)", es: "largo, crecer (长)", it: "lungo, crescere (长)", pt: "longo, crescer (长)", id: "panjang, tumbuh (长)", th: "ยาว, เติบโต (长)", ar: "طويل, نمو (长)", tr: "uzun, büyümek (长)", pl: "długi, rosnąć (长)", nl: "lang, groeien (长)", uk: "довгий, рости (长)", hi: "लंबा, बढ़ना (长)" },
  169: { de: "Tor, Tür (门)", fr: "porte, portail (门)", es: "puerta, portal (门)", it: "porta, portone (门)", pt: "portão, porta (门)", id: "gerbang, pintu (门)", th: "ประตูใหญ่ (门)", ar: "بوابة, باب (门)", tr: "kapı, geçit (门)", pl: "brama, drzwi (门)", nl: "poort, hek (门)", uk: "ворота, двері (门)", hi: "द्वार, फाटक (门)" },
  170: { de: "Hügel (阝 links)", fr: "colline (阝 gauche)", es: "colina (阝 izquierda)", it: "collina (阝 sinistra)", pt: "colina (阝 esquerda)", id: "bukit (阝 kiri)", th: "เนินเขา (阝 ซ้าย)", ar: "تلة (阝 يسار)", tr: "tepe (阝 sol)", pl: "wzgórze (阝 z lewej)", nl: "heuvel (阝 links)", uk: "пагорб (阝 зліва)", hi: "टीला, पहाड़ी (阝 बायां)" },
  171: { de: "Sklave, erreichen", fr: "esclave, atteindre", es: "esclavo, alcanzar", it: "schiavo, raggiungere", pt: "escravo, alcançar", id: "hamba, menjangkau", th: "ทาส, เอื้อมถึง", ar: "عبد, وصول", tr: "köle, ulaşmak", pl: "niewolnik, sięgać", nl: "slaaf, bereiken", uk: "раб, слуга", hi: "दास, पहुंचना" },
  172: { de: "kurzschwänziger Vogel", fr: "oiseau à queue courte", es: "pájaro de cola corta", it: "uccello a coda corta", pt: "pássaro de cauda curta", id: "burung berekor pendek", th: "นกหางสั้น", ar: "طائر قصير الذيل", tr: "kısa kuyruklu kuş", pl: "krótkosterny ptak", nl: "kortstaartige vogel", uk: "короткохвостий птах", hi: "छोटी पूंछ वाला पक्षी" },
  173: { de: "Regen (⻗)", fr: "pluie (⻗)", es: "lluvia (⻗)", it: "pioggia (⻗)", pt: "chuva (⻗)", id: "hujan (⻗)", th: "ฝน (⻗)", ar: "مطر (⻗)", tr: "yağmur (⻗)", pl: "deszcz (⻗)", nl: "regen (⻗)", uk: "дощ (⻗)", hi: "वर्षा, बारिश (⻗)" },
  174: { de: "blau-grün (青)", fr: "bleu-vert (青)", es: "azul-verdoso (青)", it: "blu-verde (青)", pt: "azul-esverdeado (青)", id: "biru-hijau (青)", th: "เขียวคราม (青)", ar: "أزرق مخضر (青)", tr: "mavi-yeşil (青)", pl: "niebiesko-zielony (青)", nl: "blauw-groen (青)", uk: "синьо-зелений (青)", hi: "नीला-हरा (青)" },
  175: { de: "nicht sein, Fehler", fr: "ne pas être, faux", es: "no ser, error", it: "non essere, errore", pt: "não ser, erro", id: "bukan, salah", th: "ไม่ใช่, ผิด", ar: "ليس, خطأ", tr: "değil, hata", pl: "nie być, błąd", nl: "niet zijn, fout", uk: "не бути, хиба", hi: "नहीं होना, भूल" },
  176: { de: "Gesicht, Oberfläche", fr: "visage, surface", es: "cara, superficie", it: "faccia, superficie", pt: "rosto, superfície", id: "wajah, permukaan", th: "ใบหน้า, พื้นผิว", ar: "وجه, سطح", tr: "yüz, yüzey", pl: "twarz, powierzchnia", nl: "gezicht, oppervlak", uk: "обличчя, поверхня", hi: "चेहरा, सतह" },
  177: { de: "Rohleder", fr: "cuir brut", es: "cuero crudo", it: "cuoio grezzo", pt: "couro cru", id: "kulit mentah", th: "หนังดิบ", ar: "جلد خام", tr: "ham deri", pl: "surowa skóra", nl: "onbewerkt leer", uk: "сиром'ятна шкіра", hi: "कच्चा चमड़ा" },
  178: { de: "gegerbtes Leder (韦)", fr: "cuir tanné (韦)", es: "cuero curtido (韦)", it: "cuoio conciato (韦)", pt: "couro curtido (韦)", id: "kulit samak (韦)", th: "หนังฟอก (韦)", ar: "جلد مدبوغ (韦)", tr: "tabaklanmış deri (韦)", pl: "wyprawiona skóra (韦)", nl: "gelooid leer (韦)", uk: "вичинена шкіра (韦)", hi: "पकाया चमड़ा (韦)" },
  179: { de: "Lauch", fr: "poireau", es: "puerro", it: "porro", pt: "alho-poró", id: "kucai", th: "กุยช่าย", ar: "كراث", tr: "pırasa", pl: "por", nl: "prei", uk: "цибуля-порей", hi: "लहसुन-प्याज, लीक" },
  180: { de: "Ton, Laut, Musik", fr: "son, musique", es: "sonido, música", it: "suono, musica", pt: "som, música", id: "suara, musik", th: "เสียง, ดนตรี", ar: "صوت, نغمة", tr: "ses, müzik", pl: "dźwięk, muzyka", nl: "geluid, klank", uk: "звук, музика", hi: "ध्वनि, स्वर" },
  181: { de: "Seite, Kopf (页)", fr: "page, tête (页)", es: "página, cabeza (页)", it: "pagina, testa (页)", pt: "página, cabeça (页)", id: "halaman, kepala (页)", th: "หน้ากระดาษ, ศีรษะ (页)", ar: "صفحة, رأس (页)", tr: "sayfa, baş (页)", pl: "strona, głowa (页)", nl: "pagina, hoofd (页)", uk: "сторінка, голова (页)", hi: "पृष्ठ, सिर (页)" },
  182: { de: "Wind (风)", fr: "vent (风)", es: "viento (风)", it: "vento (风)", pt: "vento (风)", id: "angin (风)", th: "ลม (风)", ar: "ريح (风)", tr: "rüzgar (风)", pl: "wiatr (风)", nl: "wind (风)", uk: "вітер (风)", hi: "पवन, हवा (风)" },
  183: { de: "fliegen (飞)", fr: "voler (飞)", es: "volar (飞)", it: "volare (飞)", pt: "voar (飞)", id: "terbang (飞)", th: "บิน (飞)", ar: "طيران (飞)", tr: "uçmak (飞)", pl: "latać (飞)", nl: "vliegen (飞)", uk: "літати (飞)", hi: "उड़ना (飞)" },
  184: { de: "Nahrung, Essen (饣)", fr: "nourriture, manger (饣)", es: "comida, alimento (饣)", it: "cibo, mangiare (饣)", pt: "comida, alimento (饣)", id: "makanan (饣)", th: "อาหาร, รับประทาน (饣)", ar: "طعام, أكل (饣)", tr: "yemek, yiyecek (饣)", pl: "jedzenie, posiłek (饣)", nl: "voedsel, eten (饣)", uk: "їжа, харч (饣)", hi: "भोजन, खाना (饣)" },
  185: { de: "Kopf, Anführer", fr: "tête, chef", es: "cabeza, líder", it: "testa, capo", pt: "cabeça, líder", id: "kepala, pemimpin", th: "ศีรษะ, ผู้นำ", ar: "رأس, زعيم", tr: "baş, lider", pl: "głowa, wódz", nl: "hoofd, leider", uk: "голова, ватажок", hi: "सिर, प्रमुख" },
  186: { de: "duftend", fr: "parfumé, odorant", es: "fragante, aromático", it: "profumato, fragrante", pt: "fragrante, aromático", id: "harum, wangi", th: "หอม", ar: "عطر, زكي", tr: "kokulu, hoş koku", pl: "pachnący", nl: "geurig", uk: "запашний, ароматний", hi: "सुगंधित" },
  187: { de: "Pferd (马)", fr: "cheval (马)", es: "caballo (马)", it: "cavallo (马)", pt: "cavalo (马)", id: "kuda (马)", th: "ม้า (马)", ar: "حصان (马)", tr: "at (马)", pl: "koń (马)", nl: "paard (马)", uk: "кінь (马)", hi: "घोड़ा (马)" },
  188: { de: "Knochen", fr: "os", es: "hueso", it: "osso", pt: "osso", id: "tulang", th: "กระดูก", ar: "عظم", tr: "kemik", pl: "kość", nl: "bot, been", uk: "кістка", hi: "हड्डी" },
  189: { de: "hoch, groß", fr: "haut, grand", es: "alto", it: "alto", pt: "alto", id: "tinggi", th: "สูง", ar: "عالي, مرتفع", tr: "yüksek", pl: "wysoki", nl: "hoog", uk: "високий", hi: "ऊंचा" },
  190: { de: "langes Haar", fr: "cheveux longs", es: "cabello largo", it: "capelli lunghi", pt: "cabelo comprido", id: "rambut panjang", th: "ผมยาว", ar: "شعر طويل", tr: "uzun saç", pl: "długie włosy", nl: "lang haar", uk: "довге волосся", hi: "लंबे बाल" },
  191: { de: "kämpfen, Streit", fr: "combattre, lutte", es: "luchar, combate", it: "combattere, lotta", pt: "lutar, combate", id: "bertarung, bertikai", th: "ต่อสู้", ar: "قتال, صراع", tr: "dövüşmek, kavga", pl: "walczyć", nl: "vechten, strijd", uk: "боротися, битися", hi: "लड़ना, संघर्ष" },
  192: { de: "Opferwein", fr: "vin sacrificiel", es: "vino de sacrificio", it: "vino sacrificale", pt: "vinho sacrificial", id: "arak persembahan", th: "สุราบูชายัญ", ar: "خمر القرابين", tr: "adak şarabı", pl: "wino ofiarne", nl: "offerwijn", uk: "жертовне вино", hi: "यज्ञ की मदिरा" },
  193: { de: "dreibeiniger Kessel", fr: "chaudron", es: "caldero", it: "calderone", pt: "caldeirão", id: "kuali berkaki", th: "หม้อสามขาโบราณ", ar: "مرجل", tr: "üç ayaklı kazan", pl: "kocioł", nl: "kookketel", uk: "глиняний казан", hi: "कड़ाही" },
  194: { de: "Geist, Dämon", fr: "fantôme, démon", es: "fantasma, demonio", it: "fantasma, demone", pt: "fantasma, demônio", id: "hantu, setan", th: "ผี, ปีศาจ", ar: "شبح, روح", tr: "hayalet, iblis", pl: "duch, demon", nl: "geest, spook", uk: "привид, біс", hi: "भूत, प्रेत" },
  195: { de: "Fisch (鱼)", fr: "poisson (鱼)", es: "pez, pescado (鱼)", it: "pesce (鱼)", pt: "peixe (鱼)", id: "ikan (鱼)", th: "ปลา (鱼)", ar: "سمك (鱼)", tr: "balık (鱼)", pl: "ryba (鱼)", nl: "vis (鱼)", uk: "риба (鱼)", hi: "मछली (鱼)" },
  196: { de: "Vogel (鸟)", fr: "oiseau (鸟)", es: "pájaro, ave (鸟)", it: "uccello (鸟)", pt: "pássaro, ave (鸟)", id: "burung (鸟)", th: "นก (鸟)", ar: "طائر (鸟)", tr: "kuş (鸟)", pl: "ptak (鸟)", nl: "vogel (鸟)", uk: "птах (鸟)", hi: "पक्षी, चिड़िया (鸟)" },
  197: { de: "Salzland, Salz (卤)", fr: "terre saline, sel (卤)", es: "salitre, sal (卤)", it: "salina, sale (卤)", pt: "salina, sal (卤)", id: "tanah asin, garam (卤)", th: "ดินเค็ม, เกลือ (卤)", ar: "أرض ملحية, ملح (卤)", tr: "çorak toprak, tuz (卤)", pl: "sól, solnisko (卤)", nl: "zoutland, zout (卤)", uk: "солончак, сіль (卤)", hi: "नमक, खारी मिट्टी (卤)" },
  198: { de: "Hirsch", fr: "cerf", es: "ciervo", it: "cervo", pt: "cervo, veado", id: "rusa", th: "กวาง", ar: "غزال, أيل", tr: "geyik", pl: "jeleń", nl: "hert", uk: "олень", hi: "हिरण" },
  199: { de: "Weizen (麦)", fr: "blé (麦)", es: "trigo (麦)", it: "grano, frumento (麦)", pt: "trigo (麦)", id: "gandum (麦)", th: "ข้าวสาลี (麦)", ar: "قمح (麦)", tr: "buğday (麦)", pl: "pszenica (麦)", nl: "tarwe (麦)", uk: "пшениця (麦)", hi: "गेहूं (麦)" },
  200: { de: "Hanf, Flachs", fr: "chanvre, lin", es: "cáñamo, lino", it: "canapa, lino", pt: "cânhamo, linho", id: "rami, ganja", th: "ป่าน, กัญชา", ar: "قنب, كتان", tr: "kenevir, keten", pl: "konopie, len", nl: "hennep, vlas", uk: "коноплі, льон", hi: "भांग, सन" },
  201: { de: "gelb (黄)", fr: "jaune (黄)", es: "amarillo (黄)", it: "giallo (黄)", pt: "amarelo (黄)", id: "kuning (黄)", th: "สีเหลือง (黄)", ar: "أصفر (黄)", tr: "sarı (黄)", pl: "żółty (黄)", nl: "geel (黄)", uk: "жовтий (黄)", hi: "पीला (黄)" },
  202: { de: "Hirse", fr: "millet", es: "mijo", it: "miglio", pt: "painço, milheto", id: "sekoi, milet", th: "ข้าวฟ่าง", ar: "دخن", tr: "darı", pl: "proso", nl: "gierst", uk: "просо", hi: "बाजरा" },
  203: { de: "schwarz", fr: "noir", es: "negro", it: "nero", pt: "preto", id: "hitam", th: "สีดำ", ar: "أسود", tr: "siyah, kara", pl: "czarny", nl: "zwart", uk: "чорний", hi: "काला" },
  204: { de: "Stickerei", fr: "broderie", es: "bordado", it: "ricamo", pt: "bordado", id: "sulaman", th: "การเย็บปัก", ar: "تطريز", tr: "nakış", pl: "haft", nl: "borduurwerk", uk: "вишивка", hi: "कढ़ाई" },
  205: { de: "Frosch, Kröte (黾)", fr: "grenouille, crapaud (黾)", es: "rana, sapo (黾)", it: "rana, rospo (黾)", pt: "rã, sapo (黾)", id: "katak (黾)", th: "กบ, คางคก (黾)", ar: "ضفدع (黾)", tr: "kurbağa (黾)", pl: "żaba, ropucha (黾)", nl: "kikker, pad (黾)", uk: "жаба (黾)", hi: "मेंढक (黾)" },
  206: { de: "Dreifuß, Kessel", fr: "trépied sacrificiel", es: "trípode de bronce", it: "tripode", pt: "tripé de bronze", id: "bejana berkaki tiga", th: "กระถางสามขา", ar: "مرجل ثلاثي القوائم", tr: "üç ayaklı kazan", pl: "trójnóg", nl: "drievoet", uk: "триніжок", hi: "तिपाई" },
  207: { de: "Trommel", fr: "tambour", es: "tambor", it: "tamburo", pt: "tambor", id: "gendang, genderang", th: "กลอง", ar: "طبل", tr: "davul", pl: "bęben", nl: "trommel", uk: "барабан", hi: "ढोल, नगाड़ा" },
  208: { de: "Maus, Ratte", fr: "souris, rat", es: "ratón, rata", it: "topo, ratto", pt: "rato", id: "tikus", th: "หนู", ar: "فأر", tr: "fare, sıçan", pl: "mysz, szczur", nl: "muis, rat", uk: "миша, пацюк", hi: "चूहा" },
  209: { de: "Nase", fr: "nez", es: "nariz", it: "naso", pt: "nariz", id: "hidung", th: "จมูก", ar: "أنف", tr: "burun", pl: "nos", nl: "neus", uk: "ніс", hi: "नाक" },
  210: { de: "gleichmäßig (齐)", fr: "égal, uniforme (齐)", es: "igual, uniforme (齐)", it: "uguale, uniforme (齐)", pt: "igual, uniforme (齐)", id: "seragam, rapi (齐)", th: "เสมอกัน, พร้อมเพรียง (齐)", ar: "متساو, منتظم (齐)", tr: "eşit, düzenli (齐)", pl: "równy (齐)", nl: "gelijk, effen (齐)", uk: "рівний, однаковий (齐)", hi: "समान, एकसार (齐)" },
  211: { de: "Zahn (齿)", fr: "dent (齿)", es: "diente (齿)", it: "dente (齿)", pt: "dente (齿)", id: "gigi (齿)", th: "ฟัน (齿)", ar: "سن (齿)", tr: "diş (齿)", pl: "ząb (齿)", nl: "tand (齿)", uk: "зуб (齿)", hi: "दांत (齿)" },
  212: { de: "Drache (龙)", fr: "dragon (龙)", es: "dragón (龙)", it: "drago (龙)", pt: "dragão (龙)", id: "naga (龙)", th: "มังกร (龙)", ar: "تنين (龙)", tr: "ejderha (龙)", pl: "smok (龙)", nl: "draak (龙)", uk: "дракон (龙)", hi: "ड्रैगन (龙)" },
  213: { de: "Schildkröte (龟)", fr: "tortue (龟)", es: "tortuga (龟)", it: "tartaruga (龟)", pt: "tartaruga (龟)", id: "kura-kura (龟)", th: "เต่า (龟)", ar: "سلحفاة (龟)", tr: "kaplumbağa (龟)", pl: "żółw (龟)", nl: "schildpad (龟)", uk: "черепаха (龟)", hi: "कछुआ (龟)" },
  214: { de: "Flöte", fr: "flûte", es: "flauta", it: "flauto", pt: "flauta", id: "seruling", th: "ขลุ่ย", ar: "مزمار, ناي", tr: "flüt", pl: "flet", nl: "fluit", uk: "флейта", hi: "बांसुरी" },
};

async function main() {
  const result: Record<number, Record<string, string>> = {};

  for (let num = 1; num <= 214; num++) {
    const kx = KANGXI_RADICALS[num];
    if (!kx) {
      throw new Error(`Missing Kangxi radical #${num}`);
    }
    const zh = ZH_NAMES[num] || [kx.radical, kx.radical];
    const ja = JA_NAMES[num] || kx.meaningEn;
    const ko = KO_NAMES[num] || kx.meaningEn;
    const vi = VI_NAMES[num] || kx.meaningEn;
    const rest = REST_LANGS[num];
    if (!rest) {
      throw new Error(`Missing rest languages for radical #${num}`);
    }

    result[num] = {
      en: kx.meaningEn,
      ru: kx.meaningRu,
      de: rest.de,
      fr: rest.fr,
      es: rest.es,
      ja: ja,
      ko: ko,
      vi: vi,
      it: rest.it,
      pt: rest.pt,
      id: rest.id,
      th: rest.th,
      ar: rest.ar,
      tr: rest.tr,
      pl: rest.pl,
      nl: rest.nl,
      uk: rest.uk,
      hi: rest.hi,
      "zh-CN": zh[0],
      "zh-TW": zh[1],
    };
  }

  const fileContent = `/**
 * Complete Multilingual 214 Kangxi Radicals (康熙部首 1 to 214) Dictionary
 * Covers all 20 languages supported by Chinese Popover Dictionary.
 * Generated automatically.
 */

export const RADICAL_MULTILANG: Record<number, Record<string, string>> = ${JSON.stringify(result, null, 2)};
`;

  await Deno.writeTextFile("./src/radicals-data.ts", fileContent);
  console.log("Successfully generated src/radicals-data.ts with all 214 radicals across 20 languages!");
}

if (import.meta.main) {
  await main();
}
