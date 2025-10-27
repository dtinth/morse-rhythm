import { english1k48units } from "./english1k48units";
import { english1k96units } from "./english1k96units";
import type { LevelInfo } from "./LevelInfo";

export const abc: LevelInfo = {
  bpm: 168,
  songName: "ABC (morse code ver.)",
  artist: "traditional, arranged by dtinth",
  description: "A short song to introduce the alphabet in morse code",
  durationMins: 1,
  licenseInfo:
    "Licensed under Creative Commons Attribution Noncommercial (3.0)",
  attributionUrl: "",
  additionalCredits: "level design and key sound by dtinth",
  songUrl: "songs/abc/song2.ogg",
  keyUrl: "songs/abc/key2.ogg",
  targetText: `________________________________
A----B--C-D---E------F--G_____
H---I-----JK--L--M---N----O-
P---------
QR---S------------T-----U---V_____
W_____X____-Y____Z`,
};

export const forgottenland: LevelInfo = {
  bpm: 136,
  songName: "forgottenland",
  artist: "airtone",
  description:
    "A slow, dreamy song to introduce you to the game's mechanic. Practice long sentences and pangrams.",
  durationMins: 4,
  licenseInfo:
    "Licensed under Creative Commons Attribution Noncommercial (3.0)",
  attributionUrl: "https://ccmixter.org/files/airtone/61959",
  additionalCredits: "level design and key sound by dtinth",
  songUrl: "songs/forgottenland/song.ogg",
  keyUrl: "songs/forgottenland/key.ogg",
  targetText: `________________
________________
HELLO_WORLD___-
TAP_ALONG_THE_MUSIC_AND_
VISUAL_CUES_TO_PRODUCE_
MORSE_CODE_SIGNALS__
REPRODUCE_THE_TEXT_
CORRECTLY_TO_GET_PERFECT_SCORE
________-
A_QUICK_BROWN_FOX_
JUMPS_OVER_THE_LAZY_DOG__
JACKDAWS_LOVE_MY_BIG_SPHINX_
OF_QUARTZ`,
};

export const intergalacticBliss: LevelInfo = {
  bpm: 256,
  songName: "Intergalactic Bliss (Trance Mix)",
  artist: "KCentric",
  description:
    "A fast-paced trance song along with an alphabet drill. Practice each letter 8 times and common two-letter words",
  durationMins: 5,
  licenseInfo:
    "Licensed under Creative Commons Attribution Noncommercial (3.0)",
  attributionUrl: "https://ccmixter.org/files/kcentric/48165",
  additionalCredits: "level design and key sound by dtinth",
  songUrl: "songs/intergalactic_bliss/song.ogg",
  keyUrl: "songs/intergalactic_bliss/key.ogg",
  targetText: `
________________ ________________
________________ ________________
________________

HI____ HI____ OK_-OK_-
R_E_A_D_Y________GO_-

A__A__A__A__A__A__A__A__
B--B--B--B--B--B--B--B--
C-C-C-C-C-C-C-C-
D_-D_-D_-D_-D_-D_-D_-D_-
E_E_E_E_E_E_E_E_EEEEEEE_EEEEEEE_
F_F_F_F_F_F_F_F_
G_G_G_G_G_G_G_G_
H_-H_-H_-H_-H_-H_-H_-H_-
I-__I-__I-__I-__I-I-I-I-I-I-I-I-
J____J____JJJJ
K_K_K_K_K_K_K_K_
L_L_L_L_L_L_L_L_
M_-M_-M_-M_-M-M-M-M-M_-
N__N__N__N__NNNNNNNN
O-O-O-O-O-O-O-O-
P-____P-____P-P-P-P-
Q____Q____QQQQ
R_-R_-R_-R_-R_-R_-R_-R_-
S__S__S__S__SSSSSSS__
T__-T__-T__-T__-T-T-T-T-T-T-T-T-
U_-U_-U_-U_-U_-U_-U_-U_-
V_V_V_V_V_V_V_V_
W_W_W_W_W_W_W_W_
X-____X-____X-X-X-X-
Y____Y____YYYY
Z-____Z-____Z-Z-Z-Z-
________
WELL__DONE___
AM___-AN____AS____AT____-
BE____BY--DO__GO_-
IF___-IN____-IS____-IT_____
ME____-MY_-NO__-OF_-
OH__ON__-OR__SO__-
TO___UP__US___-WE____
OK_-END__-FIN_-BYE
`,
};

class WordQueue {
  private queue: string[];
  private nextIndex: number = 0;
  constructor(words: string[]) {
    this.queue = [...words];
    const score = new Map<string, number>(words.map((w) => [w, Math.random()]));
    this.queue.sort((a, b) => (score.get(b) || 0) - (score.get(a) || 0));
  }
  randomWords(n: number) {
    const result = Array.from(
      { length: n },
      () => this.queue[this.nextIndex++ % this.queue.length]
    );
    return result.join("\n");
  }
}

export const ophelia: LevelInfo = {
  bpm: 270,
  songName: "Ophelia's Song (remix)",
  artist: "musetta remixed by pharmacopia",
  description:
    "Transmit a random selection of common English words. Each playthrough is different. (Iambic mode highly recommended)",
  durationMins: 4,
  licenseInfo: "Licensed under Creative Commons Attribution (2.5)",
  attributionUrl: "https://ccmixter.org/files/pharmacopia/6517",
  additionalCredits: "level design and key sound by dtinth",
  songUrl: "songs/ophelia/song2.ogg",
  keyUrl: "songs/ophelia/key3.ogg",
  targetText: () => {
    const shortWords = new WordQueue(english1k48units);
    const longWords = new WordQueue(english1k96units);
    return `
____ ____ ____  ____ ____ ____  ____ ____ ____  ____ ____ ____

${shortWords.randomWords(17)}

${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____

${shortWords.randomWords(16)}
____ ____ ____  ____ ____ ____  ____ ____ ____  ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____
${shortWords.randomWords(1)} ____ ____ ____

${longWords.randomWords(4)}

${shortWords.randomWords(21)}
${longWords.randomWords(6)}
`;
  },
};

export const levels = new Map<string, LevelInfo>([
  ["abc", abc],
  ["forgottenland", forgottenland],
  ["intergalactic_bliss", intergalacticBliss],
  ["ophelia", ophelia],
]);
