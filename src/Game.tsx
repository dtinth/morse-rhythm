import { useStore } from "@nanostores/react";
import type { ReadableAtom } from "nanostores";
import { useEffect, useState } from "react";
import styles from "./Game.module.css";
import { GameController } from "./GameController";
import { GameDisplay } from "./GameDisplay";

export function Game() {
  const [controller] = useState(() => new GameController());
  useEffect(() => {
    const timeout = setTimeout(() => {
      controller.init();
    });
    return () => clearTimeout(timeout);
  }, [controller]);

  const started = useStore(controller.$started);

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        controller.down();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        controller.up();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controller, started]);

  return <GameView controller={controller} />;
}

function GameView(props: { controller: GameController }) {
  const { controller } = props;
  const ready = useStore(controller.$ready);
  const started = useStore(controller.$started);
  if (!ready) {
    return <div>Loading assets...</div>;
  }
  if (!started) {
    return (
      <div>
        <button
          onClick={() => controller.start()}
          className={styles.readyButton}
        >
          Ready
        </button>
      </div>
    );
  }
  return (
    <div>
      <h1>Game</h1>
      <GameDisplay controller={controller} />
      <GameButton
        $isPressed={controller.$pressed}
        onDown={(e: Event) => {
          e.preventDefault();
          controller.down();
        }}
        onUp={(e: Event) => {
          e.preventDefault();
          controller.up();
        }}
      />
    </div>
  );
}

function GameButton(props: {
  $isPressed: ReadableAtom<boolean>;
  onDown: (e: Event) => void;
  onUp: (e: Event) => void;
}) {
  const { $isPressed, onDown, onUp } = props;
  const isPressed = useStore($isPressed);

  return (
    <button
      className={`${styles.gameButton} ${isPressed ? styles.pressed : ""}`}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchEnd={onUp}
    >
      Beep
    </button>
  );
}
