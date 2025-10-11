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
    let currentScrollDown = 0;

    const redraw = (frameCount: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "white";
      if (debug) {
        ctx.font = "20px sans-serif";
        ctx.fillText(`Frame: ${frameCount}`, 10, 30);
      }

      const visualization = controller.visualization;
      ctx.save();
      ctx.fillStyle = "#d7eb9b";
      ctx.fillRect(0, h - 12 - 1, w, 1);
      ctx.fillRect(0, h - 1, w, 1);
      const currentUnit = controller.timing.secondsToUnits(
        controller.timer.time
      );
      ctx.save();
      ctx.font = "20px sans-serif";
      {
        const begin = ~~(currentUnit - 40);
        const end = ~~(currentUnit + 40);
        const hardMode = controller.$hardMode.get();
        const unitWidth = 8;
        ctx.translate(w / 2 - currentUnit * unitWidth, 0);
        for (let i = begin; i <= end; i++) {
          const x = i * unitWidth;
          if (visualization[i]) {
            if (!hardMode) {
              if (i === ~~currentUnit) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(x, h - 11, unitWidth + 1, unitWidth + 1);
                ctx.fillStyle = "#d7eb9b";
              } else {
                ctx.fillRect(x, h - 11, unitWidth + 1, unitWidth + 1);
              }
            }
            if (visualization[i] !== " ") {
              ctx.fillText(visualization[i], x, h - 15);
            }
          }
        }
      }
      ctx.restore();
      ctx.fillStyle = "#d7eb9b";
      ctx.fillRect(w / 2 - 1, h - 12, 2, 12);
      ctx.restore();

      const keypad = controller.keypad;
      let groupX = 20;
      let groupY = 40;
      const groups = keypad.groups;
      const positions: { x: number; y: number }[] = [];
      for (const [index, group] of groups.entries()) {
        const nextGroup = groups[index + 1];
        positions.push({ x: groupX, y: groupY });
        groupX += 12;
        if (group.finishedAt != null && nextGroup) {
          const gap = nextGroup.startedAt - group.finishedAt;
          if (gap > controller.timing.unitsToSeconds(7)) {
            groupX = 20;
            groupY += 24;
          } else if (gap > controller.timing.unitsToSeconds(3)) {
            groupX += 12;
            if (groupX > w - 64) {
              groupX = 20 + 24;
              groupY += 24;
            }
          }
        }
      }
      let scrollDown = 0;
      if (groupY > h - 64) {
        scrollDown = groupY - (h - 64);
      }
      currentScrollDown += (scrollDown - currentScrollDown) * 0.05;
      for (const [index, group] of groups.entries()) {
        const { x: groupX, y: groupY } = positions[index];
        drawGroup(group, groupX, groupY - currentScrollDown);
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

        const durationInfluence =
          1 - Math.exp(Math.min(0, releaseTime - t) * 10);
        const gapInfluence =
          1 -
          Math.exp(
            Math.min(0, releaseTime - t + timing.unitsToSeconds(5)) * 10
          );

        return {
          durationUnits: lerp(
            actualDurationUnits,
            targetDurationUnits,
            durationInfluence
          ),
          gapAfterUnits: lerp(
            actualGapAfterUnits,
            targetGapAfterUnits,
            gapInfluence
          ),
        };
      });

      let sumUnits = 0;
      for (const tap of processed) {
        sumUnits += tap.durationUnits + tap.gapAfterUnits;
      }

      const groupWidth = sumUnits * groupHeight;

      ctx.save();

      const activeX = w / 2;
      const activeY = h - 32 - groupWidth;
      const activeScale = 1;
      const activeRotate = Math.PI / 2;
      const timeSinceFinished =
        group.finishedAt == null ? 0 : t - group.finishedAt;
      const finishInfluence = Math.exp(-(timeSinceFinished ** 2) * 3);
      const finishedScale = 1 / 16;
      const finishedRotate = 0;
      const scale = lerp(finishedScale, activeScale, finishInfluence);
      const rotate = lerp(finishedRotate, activeRotate, finishInfluence);
      ctx.translate(
        lerp(targetX, activeX, finishInfluence),
        lerp(targetY, activeY, finishInfluence)
      );
      ctx.scale(scale, scale);

      let x = 0;
      ctx.save();
      ctx.rotate(rotate);
      for (const tap of processed) {
        const tapWidth = tap.durationUnits * groupHeight;
        ctx.fillRect(x, -groupHeight / 2, tapWidth, groupHeight);
        x += tapWidth;
        const gapWidth = tap.gapAfterUnits * groupHeight;
        x += gapWidth;
      }
      ctx.restore();

      if (timeSinceFinished > 0) {
        const interpretation = group.interpretation;
        if (interpretation) {
          const alpha = 1 - Math.exp(-timeSinceFinished * 3);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = "bold 256px monospace";
          ctx.fillText(
            interpretation.char,
            0,
            alpha * -32 + (1 - alpha) * groupWidth
          );
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
        height={360}
      />
    </div>
  );
}
