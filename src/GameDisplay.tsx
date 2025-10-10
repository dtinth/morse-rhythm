import { useEffect, useRef } from "react";
import styles from "./Game.module.css";
import type { GameController, TapGroup } from "./GameController";

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function GameDisplay(props: { controller: GameController }) {
  const { controller } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    const debug = false;

    const redraw = (frameCount: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "white";
      if (debug) {
        ctx.font = "20px sans-serif";
        ctx.fillText(`Frame: ${frameCount}`, 10, 30);
      }

      const visualization = controller.visualization;
      ctx.save();
      ctx.fillStyle = "#2A9D8E";
      ctx.fillRect(0, h - 10, w, 1);
      ctx.fillRect(0, h - 1, w, 1);
      const currentUnit = controller.timing.secondsToUnits(
        controller.timer.time
      );
      ctx.save();
      {
        const begin = ~~(currentUnit - 40);
        const end = ~~(currentUnit + 40);
        const unitWidth = 8;
        ctx.translate(w / 2 - currentUnit * unitWidth, 0);
        for (let i = begin; i <= end; i++) {
          const x = i * unitWidth;
          if (visualization[i]) {
            ctx.fillRect(x, h - 10, unitWidth + 1, 10);
          }
        }
      }
      ctx.restore();
      ctx.fillStyle = "#e9c46b";
      ctx.fillRect(w / 2 - 1, h - 10 + 1, 2, 8);
      ctx.restore();

      const keypad = controller.keypad;
      let groupX = 20;
      let groupY = 20;
      const groups = keypad.groups;
      for (const [index, group] of groups.entries()) {
        const nextGroup = groups[index + 1];
        drawGroup(group, groupX, groupY);
        groupX += 12;
        if (group.finishedAt != null && nextGroup) {
          const gap = nextGroup.startedAt - group.finishedAt;
          if (gap > controller.timing.unitsToSeconds(9)) {
            groupX = 20;
            groupY += 24;
          } else if (gap > controller.timing.unitsToSeconds(5)) {
            groupX += 12;
            if (groupX > w - 128) {
              groupX = 20 + 24;
              groupY += 24;
            }
          }
        }
      }
    };

    const drawGroup = (group: TapGroup, targetX: number, targetY: number) => {
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

      ctx.save();

      const activeX = (w - groupWidth) / 2;
      const activeY = h - 32 - groupHeight;
      const activeScale = 1;
      const timeSinceFinished =
        group.finishedAt == null ? 0 : t - group.finishedAt;
      const finishInfluence = Math.exp(-(timeSinceFinished ** 2) * 3);
      const finishedScale = 1 / 16;
      const scale = lerp(finishedScale, activeScale, finishInfluence);
      ctx.translate(
        lerp(targetX, activeX, finishInfluence),
        lerp(targetY, activeY, finishInfluence)
      );
      ctx.scale(scale, scale);

      let x = 0;
      for (const tap of processed) {
        const tapWidth = tap.durationUnits * groupHeight;
        ctx.fillRect(x, 0, tapWidth, groupHeight);
        x += tapWidth;
        const gapWidth = tap.gapAfterUnits * groupHeight;
        x += gapWidth;
      }
      if (timeSinceFinished > 0) {
        const interpretation = group.interpretation;
        if (interpretation) {
          const alpha = 1 - Math.exp(-timeSinceFinished * 3);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = "bold 256px monospace";
          ctx.fillText(interpretation.char, 0, alpha * -32);
          ctx.restore();
        }
      }
      ctx.restore();
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
