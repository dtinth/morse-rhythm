import type { LevelInfo } from "./LevelInfo";

export const forgottenland: LevelInfo = {
  bpm: 136,
  songName: "forgottenland",
  artist: "airtone",
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

export const levels = new Map<string, LevelInfo>([
  ["forgottenland", forgottenland],
  ["intergalactic_bliss", intergalacticBliss],
]);
