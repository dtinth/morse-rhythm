import { useEffect, useRef } from "react";
import styles from "./Game.module.css";
import type { GameController, TapGroup } from "./GameController";

export function GameDisplay(props: { controller: GameController }) {
  const { controller } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;

    const redraw = (frameCount: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "white";
      ctx.font = "20px sans-serif";
      ctx.fillText(`Frame: ${frameCount}`, 10, 30);

      const keypad = controller.keypad;
      const currentGroup = keypad.currentGroup;
      if (currentGroup) {
        drawGroup(currentGroup);
      }
    };

    const drawGroup = (group: TapGroup) => {
      const t = controller.timer.time;
      const groupHeight = 16;
      const timing = controller.timing;

      const processed = group.taps.map((tap) => {
        const actualDurationUnits = timing.secondsToUnits(tap.durationSeconds);
        const actualGapAfterUnits = timing.secondsToUnits(tap.gapAfterSeconds);

        const releaseTime = tap.releasedAt ?? t;
        const targetDurationUnits = actualDurationUnits > 2 ? 3 : 1;
        const targetGapAfterUnits =
          actualGapAfterUnits > 5 ? 7 : actualGapAfterUnits > 2 ? 3 : 1;

        const influence =
          1 -
          Math.exp(Math.min(0, releaseTime - t + timing.unitsToSeconds(5)) * 3);
        const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

        return {
          durationUnits: lerp(
            actualDurationUnits,
            targetDurationUnits,
            influence
          ),
          gapAfterUnits: lerp(
            actualGapAfterUnits,
            targetGapAfterUnits,
            influence
          ),
        };
      });

      let sumUnits = 0;
      for (const tap of processed) {
        sumUnits += tap.durationUnits + tap.gapAfterUnits;
      }
      const groupWidth = sumUnits * groupHeight;
      let x = (w - groupWidth) / 2;
      const y = h - 100;
      for (const tap of processed) {
        const tapWidth = tap.durationUnits * groupHeight;
        ctx.fillRect(x, y, tapWidth, groupHeight);
        x += tapWidth;
        const gapWidth = tap.gapAfterUnits * groupHeight;
        x += gapWidth;
      }
    };

    return controller.$frameCount.subscribe(redraw);
  }, [controller]);
  return (
    <div>
      <canvas
        ref={canvasRef}
        className={styles.gameDisplay}
        width={360}
        height={320}
      />
    </div>
  );
}
