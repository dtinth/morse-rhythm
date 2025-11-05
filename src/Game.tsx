import { useStore } from "@nanostores/react";
import type { ReadableAtom } from "nanostores";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import styles from "./Game.module.css";
import { GameController } from "./GameController";
import { GameDisplay } from "./GameDisplay";
import { KeyboardHandler } from "./KeyboardHandler";

export function Game() {
  const [params] = useSearchParams();
  const level = params.get("level") || "forgottenland";
  const [gameKey, setGameKey] = useState(0);
  const navigate = useNavigate();

  const handleReplay = useCallback(() => {
    setGameKey(prev => prev + 1);
  }, []);

  const handleExit = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return <GameMain level={level} key={`${level}-${gameKey}`} onReplay={handleReplay} onExit={handleExit} />;
}

export function GameMain({ level, onReplay, onExit }: { level: string; onReplay: () => void; onExit: () => void }) {
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

    const handler = new KeyboardHandler(controller);

    const tapKeys = new Set<string>([
      "Space",
      "Enter",
      "Minus",
      "Equal",
      "BracketLeft",
      "BracketRight",
      "Semicolon",
      "Quote",
      "Comma",
    ]);
    function isTap(code: string) {
      if (tapKeys.has(code)) return true;
      if (code.startsWith("Key")) return true;
      if (code.startsWith("Digit")) return true;
      return false;
    }
    function isDit(code: string) {
      return code === "ArrowLeft" || code === "KeyZ" || code === "Period" || code === "ControlLeft";
    }
    function isDah(code: string) {
      return code === "ArrowRight" || code === "KeyX" || code === "Slash" || code === "ControlRight";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Control keys for dit/dah, but skip other modifier combinations
      if (e.altKey || e.metaKey || e.shiftKey) return;
      if (!isDit(e.code) && !isDah(e.code) && e.ctrlKey) return;

      if (isDit(e.code)) {
        e.preventDefault();
        controller.auto(".", true);
      } else if (isDah(e.code)) {
        e.preventDefault();
        controller.auto("-", true);
      } else if (isTap(e.code)) {
        e.preventDefault();
        handler.down(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Allow Control keys for dit/dah, but skip other modifier combinations
      if (e.altKey || e.metaKey || e.shiftKey) return;
      if (!isDit(e.code) && !isDah(e.code) && e.ctrlKey) return;

      if (isDit(e.code)) {
        e.preventDefault();
        controller.auto(".", false);
      } else if (isDah(e.code)) {
        e.preventDefault();
        controller.auto("-", false);
      } else if (isTap(e.code)) {
        e.preventDefault();
        handler.up(e.code);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controller, started]);

  return <GameView controller={controller} onReplay={onReplay} onExit={onExit} />;
}

type ButtonEvent = Pick<React.UIEvent, "preventDefault">;

function GameView(props: { controller: GameController; onReplay: () => void; onExit: () => void }) {
  const { controller, onReplay, onExit } = props;
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
          <p className={styles.artist}>
            {info.artist.startsWith("traditional,") ? "" : "by "}
            {info.artist}
          </p>
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
      <div className={styles.navButtonContainer}>
        <button
          onClick={onExit}
          className={styles.navButton}
          title="Exit to song selection"
        >
          Exit
        </button>
        <button
          onClick={onReplay}
          className={styles.navButton}
          title="Replay this song"
        >
          Replay
        </button>
      </div>
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
              onRightDown={() => controller.auto("-", true)}
              onRightUp={() => controller.auto("-", false)}
              text="·"
              secondary
            />
            <GameButton
              $isPressed={controller.$autoDah}
              onDown={() => controller.auto("-", true)}
              onUp={() => controller.auto("-", false)}
              onRightDown={() => controller.auto(".", true)}
              onRightUp={() => controller.auto(".", false)}
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
  onRightDown?: () => void;
  onRightUp?: () => void;
}) {
  const { $isPressed, onDown, onUp, onRightDown, onRightUp } = props;
  const isPressed = useStore($isPressed);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (e.button === 2 && onRightDown) {
        onRightDown();
      } else if (e.button === 0) {
        onDown();
      }
    },
    [onDown, onRightDown]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (e.button === 2 && onRightUp) {
        onRightUp();
      } else if (e.button === 0) {
        onUp();
      }
    },
    [onUp, onRightUp]
  );

  const handleMouseLeave = useCallback(
    () => {
      onUp();
      if (onRightUp) onRightUp();
    },
    [onUp, onRightUp]
  );

  const handleTouchDown = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      onDown();
    },
    [onDown]
  );

  const handleTouchUp = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      onUp();
    },
    [onUp]
  );

  const handleMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchDown}
      onTouchMove={handleMove}
      onTouchEnd={handleTouchUp}
      onContextMenu={handleContextMenu}
      ref={btnRef}
    >
      {props.text}
    </button>
  );
}
