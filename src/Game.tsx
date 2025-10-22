import { useStore } from "@nanostores/react";
import type { ReadableAtom } from "nanostores";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import styles from "./Game.module.css";
import { GameController } from "./GameController";
import { GameDisplay } from "./GameDisplay";

export function Game() {
  const [params] = useSearchParams();
  const level = params.get("level") || "forgottenland";
  return <GameMain level={level} key={level} />;
}

export function GameMain({ level }: { level: string }) {
  const [controller] = useState(() => new GameController(level));
  useEffect(() => {
    let initialized = false;
    const timeout = setTimeout(() => {
      initialized = true;
      controller.init();
      Object.assign(window, { controller });
    });
    return () => {
      clearTimeout(timeout);
      if (initialized) controller.dispose();
    };
  }, [controller]);

  const started = useStore(controller.$started);

  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        controller.down();
      }
      if (e.code === "ArrowLeft" && !e.repeat) {
        e.preventDefault();
        controller.auto(".", true);
      }
      if (e.code === "ArrowRight" && !e.repeat) {
        e.preventDefault();
        controller.auto("-", true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        controller.up();
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        controller.auto(".", false);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        controller.auto("-", false);
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

type ButtonEvent = Pick<React.UIEvent, "preventDefault">;

function GameView(props: { controller: GameController }) {
  const { controller } = props;
  const ready = useStore(controller.$ready);
  const started = useStore(controller.$started);
  const hardMode = useStore(controller.$hardMode);
  const iambic = useStore(controller.$iambic);

  if (!started) {
    const info = controller.levelInfo;
    return (
      <div className={styles.levelInfo}>
        <div
          style={{
            background: "#d7eb9b33",
            display: "flex",
            padding: "3px 4px",
            fontSize: 12,
            textAlign: "left",
            alignSelf: "stretch",
          }}
        >
          <div style={{ flex: "1", fontWeight: "bold" }}>
            <Link to="/levels" className={styles.backLink}>
              ← Back to levels
            </Link>
          </div>
        </div>
        <div className={styles.metadata}>
          <h1>{info.songName}</h1>
          <p className={styles.artist}>by {info.artist}</p>
          <p>
            {info.licenseInfo}
            <br />
            <a
              href={info.attributionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {info.attributionUrl}
            </a>
          </p>
        </div>
        <div>
          <button
            onClick={() => controller.start()}
            className={styles.readyButton}
            disabled={!ready}
          >
            {ready ? "Ready" : "Loading"}
          </button>
          <div className={styles.options}>
            <div className={styles.option}>
              <label>
                <input
                  type="checkbox"
                  title="The visual cue will only show the character, not the morse code."
                  checked={hardMode}
                  onChange={(e) => controller.$hardMode.set(e.target.checked)}
                />
                <span>Hard mode</span>
              </label>
            </div>
            <div className={styles.option}>
              <label>
                <input
                  type="checkbox"
                  title="Use a double-paddle keyer instead of a straight key."
                  checked={iambic}
                  onChange={(e) => controller.$iambic.set(e.target.checked)}
                />
                <span>Iambic</span>
              </label>
            </div>
          </div>
        </div>
        <p className={styles.credits}>{info.additionalCredits}</p>
        <div className={styles.audioNote}>
          <p>
            🔊 Turn on sound
            <br />
            🎧 Avoid wireless audio to minimize latency
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <GameHeader controller={controller} />
      <div style={{ position: "relative" }}>
        <GameDisplay controller={controller} />
        <GameHint controller={controller} />
      </div>
      <div className={styles.gameButtonRows}>
        <div className={styles.gameButtonRow}>
          <GameButton
            $isPressed={controller.$pressed}
            onDown={() => controller.down()}
            onUp={() => controller.up()}
            text="TAP"
          />
        </div>
        {iambic ? (
          <div className={styles.gameButtonRow} style={{ flex: "2 0 0" }}>
            <GameButton
              $isPressed={controller.$autoDit}
              onDown={() => controller.auto(".", true)}
              onUp={() => controller.auto(".", false)}
              text="·"
              secondary
            />
            <GameButton
              $isPressed={controller.$autoDah}
              onDown={() => controller.auto("-", true)}
              onUp={() => controller.auto("-", false)}
              text="—"
              secondary
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GameHeader(props: { controller: GameController }) {
  const { controller } = props;
  const score = useStore(controller.$score);
  const finished = useStore(controller.$finished);
  return (
    <div
      style={{
        background: "#d7eb9b33",
        display: "flex",
        padding: "3px 4px",
        fontSize: 12,
        textAlign: "left",
      }}
    >
      <div style={{ flex: "1", fontWeight: "bold" }}>
        {controller.levelInfo.songName}
      </div>
      <div
        style={{
          flex: "none",
          textAlign: "right",
          transformOrigin: "top right",
          transition: "transform 0.64s ease",
          ...(finished
            ? {
                fontWeight: "bold",
                color: "#d7eb9b",
                transform: "translateY(24px) scale(2)",
              }
            : {}),
        }}
      >
        score: {(score.scoreFraction * 100).toFixed(1)}%
      </div>
    </div>
  );
}

function GameHint(props: { controller: GameController }) {
  const { controller } = props;
  const startTime = controller.startTime;
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasFadedOut, setHasFadedOut] = useState(false);
  useEffect(() => {
    const unsubscribe = controller.$time.subscribe((time) => {
      if (time >= startTime - 1) {
        setIsFadingOut(true);
        setTimeout(() => {
          setHasFadedOut(true);
        }, 4500);
        unsubscribe();
      }
    });
    return unsubscribe;
  }, [controller, startTime]);
  if (hasFadedOut) return null;
  return (
    <>
      <div className={styles.hint} data-fade-out={isFadingOut}>
        <p>
          <strong>Wait for the visual cues.</strong>
        </p>
        <p style={{ textWrap: "balance" }}>
          When they arrive at the indicator in the middle,{" "}
          <strong>tap the button</strong> or <strong>press Space</strong>{" "}
          accordingly to recreate the morse code.
        </p>
      </div>
    </>
  );
}

function GameButton(props: {
  $isPressed: ReadableAtom<boolean>;
  onDown: () => void;
  onUp: () => void;
  text: string;
  secondary?: boolean;
}) {
  const { $isPressed, onDown, onUp } = props;
  const isPressed = useStore($isPressed);

  const handleDown = useCallback(
    (e: ButtonEvent) => {
      e.preventDefault();
      onDown();
    },
    [onDown]
  );

  const handleUp = useCallback(
    (e: ButtonEvent) => {
      e.preventDefault();
      onUp();
    },
    [onUp]
  );

  const handleMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const cancel = (e: Event) => {
      e.preventDefault();
    };
    btn.addEventListener("touchstart", cancel, { passive: false });
    return () => btn.removeEventListener("touchstart", cancel);
  }, []);

  return (
    <button
      className={[
        styles.gameButton,
        isPressed ? styles.pressed : "",
        props.secondary ? styles.secondary : "",
      ].join(" ")}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
      ref={btnRef}
    >
      {props.text}
    </button>
  );
}
