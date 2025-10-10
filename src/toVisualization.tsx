import { forwardMorseDB } from "./morse";

export function toVisualization(text: string) {
  const elements: string[] = [];
  const BLANK = "";
  for (const char of text.toUpperCase()) {
    if (char === "_") {
      elements.push(BLANK, BLANK, BLANK, BLANK);
    } else if (char === "-") {
      elements.push(BLANK, BLANK);
    } else {
      const morse = forwardMorseDB.get(char) || "";
      if (morse) {
        for (const [index, symbol] of Array.from(morse).entries()) {
          const ch = index === 0 ? char : " ";
          if (symbol === ".") {
            elements.push(ch, BLANK);
          } else if (symbol === "-") {
            elements.push(ch, " ", " ", BLANK);
          }
        }
        elements.push(BLANK, BLANK); // gap between letters
      }
    }
  }
  return elements;
}
