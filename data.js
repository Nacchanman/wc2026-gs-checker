// 2026 FIFA ワールドカップ(カナダ・メキシコ・アメリカ大会)データ
// 試合結果の更新方法: 下の MATCHES の score を [ホーム得点, アウェイ得点] に書き換えて
// git push すると、サイト上の突破条件が自動で再計算されます。
// 例) { id: "F1", ... score: null } → { id: "F1", ... score: [1, 2] }

const TEAMS = [
  // Group A
  { id: "MEX", ja: "メキシコ", en: "Mexico", flag: "🇲🇽", group: "A" },
  { id: "RSA", ja: "南アフリカ", en: "South Africa", flag: "🇿🇦", group: "A" },
  { id: "KOR", ja: "韓国", en: "South Korea", flag: "🇰🇷", group: "A" },
  { id: "CZE", ja: "チェコ", en: "Czech Republic", flag: "🇨🇿", group: "A" },
  // Group B
  { id: "CAN", ja: "カナダ", en: "Canada", flag: "🇨🇦", group: "B" },
  { id: "BIH", ja: "ボスニア・ヘルツェゴビナ", en: "Bosnia and Herzegovina", flag: "🇧🇦", group: "B" },
  { id: "QAT", ja: "カタール", en: "Qatar", flag: "🇶🇦", group: "B" },
  { id: "SUI", ja: "スイス", en: "Switzerland", flag: "🇨🇭", group: "B" },
  // Group C
  { id: "BRA", ja: "ブラジル", en: "Brazil", flag: "🇧🇷", group: "C" },
  { id: "MAR", ja: "モロッコ", en: "Morocco", flag: "🇲🇦", group: "C" },
  { id: "HAI", ja: "ハイチ", en: "Haiti", flag: "🇭🇹", group: "C" },
  { id: "SCO", ja: "スコットランド", en: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },
  // Group D
  { id: "USA", ja: "アメリカ", en: "United States", flag: "🇺🇸", group: "D" },
  { id: "PAR", ja: "パラグアイ", en: "Paraguay", flag: "🇵🇾", group: "D" },
  { id: "AUS", ja: "オーストラリア", en: "Australia", flag: "🇦🇺", group: "D" },
  { id: "TUR", ja: "トルコ", en: "Turkey", flag: "🇹🇷", group: "D" },
  // Group E
  { id: "GER", ja: "ドイツ", en: "Germany", flag: "🇩🇪", group: "E" },
  { id: "CUW", ja: "キュラソー", en: "Curacao", flag: "🇨🇼", group: "E" },
  { id: "CIV", ja: "コートジボワール", en: "Ivory Coast", flag: "🇨🇮", group: "E" },
  { id: "ECU", ja: "エクアドル", en: "Ecuador", flag: "🇪🇨", group: "E" },
  // Group F
  { id: "NED", ja: "オランダ", en: "Netherlands", flag: "🇳🇱", group: "F" },
  { id: "JPN", ja: "日本", en: "Japan", flag: "🇯🇵", group: "F" },
  { id: "SWE", ja: "スウェーデン", en: "Sweden", flag: "🇸🇪", group: "F" },
  { id: "TUN", ja: "チュニジア", en: "Tunisia", flag: "🇹🇳", group: "F" },
  // Group G
  { id: "BEL", ja: "ベルギー", en: "Belgium", flag: "🇧🇪", group: "G" },
  { id: "EGY", ja: "エジプト", en: "Egypt", flag: "🇪🇬", group: "G" },
  { id: "IRN", ja: "イラン", en: "Iran", flag: "🇮🇷", group: "G" },
  { id: "NZL", ja: "ニュージーランド", en: "New Zealand", flag: "🇳🇿", group: "G" },
  // Group H
  { id: "ESP", ja: "スペイン", en: "Spain", flag: "🇪🇸", group: "H" },
  { id: "CPV", ja: "カーボベルデ", en: "Cape Verde", flag: "🇨🇻", group: "H" },
  { id: "KSA", ja: "サウジアラビア", en: "Saudi Arabia", flag: "🇸🇦", group: "H" },
  { id: "URU", ja: "ウルグアイ", en: "Uruguay", flag: "🇺🇾", group: "H" },
  // Group I
  { id: "FRA", ja: "フランス", en: "France", flag: "🇫🇷", group: "I" },
  { id: "SEN", ja: "セネガル", en: "Senegal", flag: "🇸🇳", group: "I" },
  { id: "IRQ", ja: "イラク", en: "Iraq", flag: "🇮🇶", group: "I" },
  { id: "NOR", ja: "ノルウェー", en: "Norway", flag: "🇳🇴", group: "I" },
  // Group J
  { id: "ARG", ja: "アルゼンチン", en: "Argentina", flag: "🇦🇷", group: "J" },
  { id: "ALG", ja: "アルジェリア", en: "Algeria", flag: "🇩🇿", group: "J" },
  { id: "AUT", ja: "オーストリア", en: "Austria", flag: "🇦🇹", group: "J" },
  { id: "JOR", ja: "ヨルダン", en: "Jordan", flag: "🇯🇴", group: "J" },
  // Group K
  { id: "POR", ja: "ポルトガル", en: "Portugal", flag: "🇵🇹", group: "K" },
  { id: "COD", ja: "コンゴ民主共和国", en: "DR Congo", flag: "🇨🇩", group: "K" },
  { id: "UZB", ja: "ウズベキスタン", en: "Uzbekistan", flag: "🇺🇿", group: "K" },
  { id: "COL", ja: "コロンビア", en: "Colombia", flag: "🇨🇴", group: "K" },
  // Group L
  { id: "ENG", ja: "イングランド", en: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { id: "CRO", ja: "クロアチア", en: "Croatia", flag: "🇭🇷", group: "L" },
  { id: "GHA", ja: "ガーナ", en: "Ghana", flag: "🇬🇭", group: "L" },
  { id: "PAN", ja: "パナマ", en: "Panama", flag: "🇵🇦", group: "L" },
];

const MATCHES = [
  // Group A
  { id: "A1", group: "A", md: 1, date: "2026-06-11", home: "MEX", away: "RSA", venue: "エスタディオ・アステカ(メキシコシティ)", score: null },
  { id: "A2", group: "A", md: 1, date: "2026-06-11", home: "KOR", away: "CZE", venue: "エスタディオ・アクロン(グアダラハラ)", score: null },
  { id: "A3", group: "A", md: 2, date: "2026-06-18", home: "CZE", away: "RSA", venue: "メルセデス・ベンツ・スタジアム(アトランタ)", score: null },
  { id: "A4", group: "A", md: 2, date: "2026-06-18", home: "MEX", away: "KOR", venue: "エスタディオ・アクロン(グアダラハラ)", score: null },
  { id: "A5", group: "A", md: 3, date: "2026-06-24", home: "CZE", away: "MEX", venue: "エスタディオ・アステカ(メキシコシティ)", score: null },
  { id: "A6", group: "A", md: 3, date: "2026-06-24", home: "RSA", away: "KOR", venue: "エスタディオBBVA(モンテレイ)", score: null },
  // Group B
  { id: "B1", group: "B", md: 1, date: "2026-06-12", home: "CAN", away: "BIH", venue: "BMOフィールド(トロント)", score: null },
  { id: "B2", group: "B", md: 1, date: "2026-06-13", home: "QAT", away: "SUI", venue: "リーバイス・スタジアム(サンフランシスコ近郊)", score: null },
  { id: "B3", group: "B", md: 2, date: "2026-06-18", home: "SUI", away: "BIH", venue: "SoFiスタジアム(ロサンゼルス)", score: null },
  { id: "B4", group: "B", md: 2, date: "2026-06-18", home: "CAN", away: "QAT", venue: "BCプレイス(バンクーバー)", score: null },
  { id: "B5", group: "B", md: 3, date: "2026-06-24", home: "SUI", away: "CAN", venue: "BCプレイス(バンクーバー)", score: null },
  { id: "B6", group: "B", md: 3, date: "2026-06-24", home: "BIH", away: "QAT", venue: "ルーメン・フィールド(シアトル)", score: null },
  // Group C
  { id: "C1", group: "C", md: 1, date: "2026-06-13", home: "BRA", away: "MAR", venue: "メットライフ・スタジアム(ニューヨーク近郊)", score: null },
  { id: "C2", group: "C", md: 1, date: "2026-06-13", home: "HAI", away: "SCO", venue: "ジレット・スタジアム(ボストン近郊)", score: null },
  { id: "C3", group: "C", md: 2, date: "2026-06-19", home: "SCO", away: "MAR", venue: "ジレット・スタジアム(ボストン近郊)", score: null },
  { id: "C4", group: "C", md: 2, date: "2026-06-19", home: "BRA", away: "HAI", venue: "リンカーン・ファイナンシャル・フィールド(フィラデルフィア)", score: null },
  { id: "C5", group: "C", md: 3, date: "2026-06-24", home: "SCO", away: "BRA", venue: "ハードロック・スタジアム(マイアミ)", score: null },
  { id: "C6", group: "C", md: 3, date: "2026-06-24", home: "MAR", away: "HAI", venue: "メルセデス・ベンツ・スタジアム(アトランタ)", score: null },
  // Group D
  { id: "D1", group: "D", md: 1, date: "2026-06-12", home: "USA", away: "PAR", venue: "SoFiスタジアム(ロサンゼルス)", score: null },
  { id: "D2", group: "D", md: 1, date: "2026-06-13", home: "AUS", away: "TUR", venue: "BCプレイス(バンクーバー)", score: null },
  { id: "D3", group: "D", md: 2, date: "2026-06-19", home: "USA", away: "AUS", venue: "ルーメン・フィールド(シアトル)", score: null },
  { id: "D4", group: "D", md: 2, date: "2026-06-19", home: "TUR", away: "PAR", venue: "リーバイス・スタジアム(サンフランシスコ近郊)", score: null },
  { id: "D5", group: "D", md: 3, date: "2026-06-25", home: "TUR", away: "USA", venue: "SoFiスタジアム(ロサンゼルス)", score: null },
  { id: "D6", group: "D", md: 3, date: "2026-06-25", home: "PAR", away: "AUS", venue: "リーバイス・スタジアム(サンフランシスコ近郊)", score: null },
  // Group E
  { id: "E1", group: "E", md: 1, date: "2026-06-14", home: "GER", away: "CUW", venue: "NRGスタジアム(ヒューストン)", score: null },
  { id: "E2", group: "E", md: 1, date: "2026-06-14", home: "CIV", away: "ECU", venue: "リンカーン・ファイナンシャル・フィールド(フィラデルフィア)", score: null },
  { id: "E3", group: "E", md: 2, date: "2026-06-20", home: "GER", away: "CIV", venue: "BMOフィールド(トロント)", score: null },
  { id: "E4", group: "E", md: 2, date: "2026-06-20", home: "ECU", away: "CUW", venue: "アローヘッド・スタジアム(カンザスシティ)", score: null },
  { id: "E5", group: "E", md: 3, date: "2026-06-25", home: "CUW", away: "CIV", venue: "リンカーン・ファイナンシャル・フィールド(フィラデルフィア)", score: null },
  { id: "E6", group: "E", md: 3, date: "2026-06-25", home: "ECU", away: "GER", venue: "メットライフ・スタジアム(ニューヨーク近郊)", score: null },
  // Group F
  { id: "F1", group: "F", md: 1, date: "2026-06-14", home: "NED", away: "JPN", venue: "AT&Tスタジアム(ダラス)", score: null },
  { id: "F2", group: "F", md: 1, date: "2026-06-14", home: "SWE", away: "TUN", venue: "エスタディオBBVA(モンテレイ)", score: null },
  { id: "F3", group: "F", md: 2, date: "2026-06-20", home: "NED", away: "SWE", venue: "NRGスタジアム(ヒューストン)", score: null },
  { id: "F4", group: "F", md: 2, date: "2026-06-20", home: "TUN", away: "JPN", venue: "エスタディオBBVA(モンテレイ)", score: null },
  { id: "F5", group: "F", md: 3, date: "2026-06-25", home: "JPN", away: "SWE", venue: "AT&Tスタジアム(ダラス)", score: null },
  { id: "F6", group: "F", md: 3, date: "2026-06-25", home: "TUN", away: "NED", venue: "アローヘッド・スタジアム(カンザスシティ)", score: null },
  // Group G
  { id: "G1", group: "G", md: 1, date: "2026-06-15", home: "BEL", away: "EGY", venue: "ルーメン・フィールド(シアトル)", score: null },
  { id: "G2", group: "G", md: 1, date: "2026-06-15", home: "IRN", away: "NZL", venue: "SoFiスタジアム(ロサンゼルス)", score: null },
  { id: "G3", group: "G", md: 2, date: "2026-06-21", home: "BEL", away: "IRN", venue: "SoFiスタジアム(ロサンゼルス)", score: null },
  { id: "G4", group: "G", md: 2, date: "2026-06-21", home: "NZL", away: "EGY", venue: "BCプレイス(バンクーバー)", score: null },
  { id: "G5", group: "G", md: 3, date: "2026-06-26", home: "EGY", away: "IRN", venue: "ルーメン・フィールド(シアトル)", score: null },
  { id: "G6", group: "G", md: 3, date: "2026-06-26", home: "NZL", away: "BEL", venue: "BCプレイス(バンクーバー)", score: null },
  // Group H
  { id: "H1", group: "H", md: 1, date: "2026-06-15", home: "ESP", away: "CPV", venue: "メルセデス・ベンツ・スタジアム(アトランタ)", score: null },
  { id: "H2", group: "H", md: 1, date: "2026-06-15", home: "KSA", away: "URU", venue: "ハードロック・スタジアム(マイアミ)", score: null },
  { id: "H3", group: "H", md: 2, date: "2026-06-21", home: "ESP", away: "KSA", venue: "メルセデス・ベンツ・スタジアム(アトランタ)", score: null },
  { id: "H4", group: "H", md: 2, date: "2026-06-21", home: "URU", away: "CPV", venue: "ハードロック・スタジアム(マイアミ)", score: null },
  { id: "H5", group: "H", md: 3, date: "2026-06-26", home: "CPV", away: "KSA", venue: "NRGスタジアム(ヒューストン)", score: null },
  { id: "H6", group: "H", md: 3, date: "2026-06-26", home: "URU", away: "ESP", venue: "エスタディオ・アクロン(グアダラハラ)", score: null },
  // Group I
  { id: "I1", group: "I", md: 1, date: "2026-06-16", home: "FRA", away: "SEN", venue: "メットライフ・スタジアム(ニューヨーク近郊)", score: null },
  { id: "I2", group: "I", md: 1, date: "2026-06-16", home: "IRQ", away: "NOR", venue: "ジレット・スタジアム(ボストン近郊)", score: null },
  { id: "I3", group: "I", md: 2, date: "2026-06-22", home: "FRA", away: "IRQ", venue: "リンカーン・ファイナンシャル・フィールド(フィラデルフィア)", score: null },
  { id: "I4", group: "I", md: 2, date: "2026-06-22", home: "NOR", away: "SEN", venue: "メットライフ・スタジアム(ニューヨーク近郊)", score: null },
  { id: "I5", group: "I", md: 3, date: "2026-06-26", home: "NOR", away: "FRA", venue: "ジレット・スタジアム(ボストン近郊)", score: null },
  { id: "I6", group: "I", md: 3, date: "2026-06-26", home: "SEN", away: "IRQ", venue: "BMOフィールド(トロント)", score: null },
  // Group J
  { id: "J1", group: "J", md: 1, date: "2026-06-16", home: "ARG", away: "ALG", venue: "アローヘッド・スタジアム(カンザスシティ)", score: null },
  { id: "J2", group: "J", md: 1, date: "2026-06-16", home: "AUT", away: "JOR", venue: "リーバイス・スタジアム(サンフランシスコ近郊)", score: null },
  { id: "J3", group: "J", md: 2, date: "2026-06-22", home: "ARG", away: "AUT", venue: "AT&Tスタジアム(ダラス)", score: null },
  { id: "J4", group: "J", md: 2, date: "2026-06-22", home: "JOR", away: "ALG", venue: "リーバイス・スタジアム(サンフランシスコ近郊)", score: null },
  { id: "J5", group: "J", md: 3, date: "2026-06-27", home: "ALG", away: "AUT", venue: "アローヘッド・スタジアム(カンザスシティ)", score: null },
  { id: "J6", group: "J", md: 3, date: "2026-06-27", home: "JOR", away: "ARG", venue: "AT&Tスタジアム(ダラス)", score: null },
  // Group K
  { id: "K1", group: "K", md: 1, date: "2026-06-17", home: "POR", away: "COD", venue: "NRGスタジアム(ヒューストン)", score: null },
  { id: "K2", group: "K", md: 1, date: "2026-06-17", home: "UZB", away: "COL", venue: "エスタディオ・アステカ(メキシコシティ)", score: null },
  { id: "K3", group: "K", md: 2, date: "2026-06-23", home: "POR", away: "UZB", venue: "NRGスタジアム(ヒューストン)", score: null },
  { id: "K4", group: "K", md: 2, date: "2026-06-23", home: "COL", away: "COD", venue: "エスタディオ・アクロン(グアダラハラ)", score: null },
  { id: "K5", group: "K", md: 3, date: "2026-06-27", home: "COL", away: "POR", venue: "ハードロック・スタジアム(マイアミ)", score: null },
  { id: "K6", group: "K", md: 3, date: "2026-06-27", home: "COD", away: "UZB", venue: "メルセデス・ベンツ・スタジアム(アトランタ)", score: null },
  // Group L
  { id: "L1", group: "L", md: 1, date: "2026-06-17", home: "ENG", away: "CRO", venue: "AT&Tスタジアム(ダラス)", score: null },
  { id: "L2", group: "L", md: 1, date: "2026-06-17", home: "GHA", away: "PAN", venue: "BMOフィールド(トロント)", score: null },
  { id: "L3", group: "L", md: 2, date: "2026-06-23", home: "ENG", away: "GHA", venue: "ジレット・スタジアム(ボストン近郊)", score: null },
  { id: "L4", group: "L", md: 2, date: "2026-06-23", home: "PAN", away: "CRO", venue: "BMOフィールド(トロント)", score: null },
  { id: "L5", group: "L", md: 3, date: "2026-06-27", home: "PAN", away: "ENG", venue: "メットライフ・スタジアム(ニューヨーク近郊)", score: null },
  { id: "L6", group: "L", md: 3, date: "2026-06-27", home: "CRO", away: "GHA", venue: "リンカーン・ファイナンシャル・フィールド(フィラデルフィア)", score: null },
];

const DATA_UPDATED = "2026-06-11";
