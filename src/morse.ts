const morseDB = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
};

export const forwardMorseDB = new Map<string, string>(
  Object.entries(morseDB).map(([char, morse]) => [char.toUpperCase(), morse])
);
export const reverseMorseDB = new Map<string, string>(
  Object.entries(morseDB).map(([char, morse]) => [morse, char.toUpperCase()])
);
