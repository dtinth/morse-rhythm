import { memo, useDeferredValue, useEffect, useMemo, useState } from "react";
import styles from "./Editor.module.css";
import { toVisualization } from "./toVisualization";

const STORAGE_KEY = "morse-rhythm-editor-text";

export function Editor() {
  const [text, setText] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  });
  const previewText = useDeferredValue(text);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, text);
  }, [text]);

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
        />
      </div>
      <div className={styles.rightPanel}>
        <Preview text={previewText} />
      </div>
    </div>
  );
}

const Preview = memo(function Preview(props: { text: string }) {
  const out = useMemo(() => {
    return toVisualization(props.text);
  }, [props.text]);

  const rows = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < out.length; i += 32) {
      result.push(out.slice(i, i + 32));
    }
    return result;
  }, [out]);

  return (
    <div className={styles.preview}>
      <h2>Preview</h2>
      <div className={styles.visualization}>
        {rows.map((row, rowIndex) => (
          <>
            {rowIndex % 2 === 0 && rowIndex + 1}
            <div
              key={rowIndex}
              className={styles.row}
              data-major={rowIndex % 2 === 0}
            >
              {row.map((isOn, dotIndex) => (
                <div
                  key={dotIndex}
                  className={`${styles.dot} ${isOn ? styles.active : ""}`}
                >
                  {isOn}
                </div>
              ))}
            </div>
          </>
        ))}
      </div>
    </div>
  );
});
