import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  JourneyCurvedPath,
  journeyNodeYOffset,
} from "@/components/journey/journey-curved-path";

/**
 * Geometry tests for the dashed sine path that threads through the
 * journey nodes. Pivot v3 had a regression where the path was drawn in
 * *logical* x coordinates while the nodes rendered at *physical* x in
 * RTL — so the path and dots were horizontal mirror images of each
 * other and the dots no longer sat on the curve.
 *
 * These tests pin both LTR and RTL geometry by parsing the actual SVG
 * `d` attribute and asserting the M (move-to) + every C (cubic-bezier)
 * endpoint matches the expected physical x position for that index.
 *
 * The y values are also asserted to match `journeyNodeYOffset(i)` so
 * the path's wave matches the node placement (same logical-index sine).
 */

const STEP = 320;
const START_X = 360;
const COUNT = 6;
const AMPLITUDE = 22;
const TRACK_WIDTH = (COUNT - 1) * STEP + 2 * START_X; // 6×320 - 320 + 720 = 2320
const CENTER_Y = 290;

interface PathPoint {
  x: number;
  y: number;
}

/**
 * Parse an SVG `d` string of the form `M x y C cx1 cy1, cx2 cy2, x y …`
 * and return the list of [M, C, C, …] endpoints (each segment's
 * destination point).
 */
function parsePathPoints(d: string): PathPoint[] {
  const points: PathPoint[] = [];
  const tokens = d.trim().split(/\s+/);
  let i = 0;
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === "M") {
      points.push({
        x: parseFloat(tokens[i + 1]),
        y: parseFloat(tokens[i + 2]),
      });
      i += 3;
    } else if (cmd === "C") {
      // Skip both control points (4 numbers, possibly comma-suffixed)
      // and read the destination (last 2 numbers of this command).
      const stripComma = (s: string) => s.replace(/,$/, "");
      i += 1;
      // Read 6 numbers.
      const nums: number[] = [];
      while (nums.length < 6 && i < tokens.length) {
        nums.push(parseFloat(stripComma(tokens[i])));
        i += 1;
      }
      points.push({ x: nums[4], y: nums[5] });
    } else {
      i += 1;
    }
  }
  return points;
}

function getPathD(container: HTMLElement): string {
  const path = container.querySelector("path");
  expect(path).not.toBeNull();
  return path?.getAttribute("d") ?? "";
}

describe("JourneyCurvedPath geometry", () => {
  describe("LTR", () => {
    it("places the M at the leftmost node and walks rightward through each x", () => {
      const { container } = render(
        <svg>
          <JourneyCurvedPath
            count={COUNT}
            step={STEP}
            startX={START_X}
            centerY={CENTER_Y}
            amplitude={AMPLITUDE}
            trackWidth={TRACK_WIDTH}
            height={540}
          />
        </svg>,
      );
      const points = parsePathPoints(getPathD(container));
      expect(points.length).toBe(COUNT);

      for (let i = 0; i < COUNT; i += 1) {
        // LTR: physical x === logical x === START_X + i*STEP.
        expect(points[i].x).toBeCloseTo(START_X + i * STEP, 5);
        expect(points[i].y).toBeCloseTo(
          CENTER_Y + journeyNodeYOffset(i, AMPLITUDE),
          5,
        );
      }
    });
  });

  describe("RTL", () => {
    it("places the M at the leftmost physical node (oldest entry, logical i=count-1) and walks rightward to the newest", () => {
      const { container } = render(
        <svg>
          <JourneyCurvedPath
            count={COUNT}
            step={STEP}
            startX={START_X}
            centerY={CENTER_Y}
            amplitude={AMPLITUDE}
            trackWidth={TRACK_WIDTH}
            height={540}
            rtl
          />
        </svg>,
      );
      const points = parsePathPoints(getPathD(container));
      expect(points.length).toBe(COUNT);

      // The path walks k = 0..count-1 in physical-left-to-right order.
      // At step k, the logical index is `count - 1 - k`. The physical x
      // is `trackWidth - (START_X + i*STEP)` = `trackWidth - xLocal(i)`.
      for (let k = 0; k < COUNT; k += 1) {
        const i = COUNT - 1 - k;
        const xLocal = START_X + i * STEP;
        const expectedX = TRACK_WIDTH - xLocal;
        const expectedY = CENTER_Y + journeyNodeYOffset(i, AMPLITUDE);
        expect(points[k].x).toBeCloseTo(expectedX, 5);
        expect(points[k].y).toBeCloseTo(expectedY, 5);
      }
    });

    it("path endpoints match the physical positions of the node-array's first and last entries (regression for pivot v3 mirror bug)", () => {
      const { container } = render(
        <svg>
          <JourneyCurvedPath
            count={COUNT}
            step={STEP}
            startX={START_X}
            centerY={CENTER_Y}
            amplitude={AMPLITUDE}
            trackWidth={TRACK_WIDTH}
            height={540}
            rtl
          />
        </svg>,
      );
      const points = parsePathPoints(getPathD(container));

      // First point = oldest entry (logical i=count-1) = physical-left.
      // Physical-left in RTL = trackWidth - (START_X + (count-1)*STEP)
      //                      = 2320 - 1960 = 360.
      expect(points[0].x).toBeCloseTo(START_X, 5);

      // Last point = newest entry (logical i=0) = physical-right.
      // Physical-right in RTL = trackWidth - START_X = 2320 - 360 = 1960.
      expect(points[points.length - 1].x).toBeCloseTo(
        TRACK_WIDTH - START_X,
        5,
      );

      // The newest's y must match journeyNodeYOffset(0) which is sin(0)=0.
      expect(points[points.length - 1].y).toBeCloseTo(CENTER_Y, 5);
    });
  });

  it("LTR and RTL produce horizontal-mirror-image x sequences for the same logical i", () => {
    // Render both directions, then confirm: physical-x of logical-i in
    // LTR + physical-x of logical-i in RTL = trackWidth (perfect mirror).
    const { container: ltrContainer } = render(
      <svg>
        <JourneyCurvedPath
          count={COUNT}
          step={STEP}
          startX={START_X}
          centerY={CENTER_Y}
          amplitude={AMPLITUDE}
          trackWidth={TRACK_WIDTH}
          height={540}
        />
      </svg>,
    );
    const { container: rtlContainer } = render(
      <svg>
        <JourneyCurvedPath
          count={COUNT}
          step={STEP}
          startX={START_X}
          centerY={CENTER_Y}
          amplitude={AMPLITUDE}
          trackWidth={TRACK_WIDTH}
          height={540}
          rtl
        />
      </svg>,
    );

    const ltrPoints = parsePathPoints(getPathD(ltrContainer));
    const rtlPoints = parsePathPoints(getPathD(rtlContainer));

    // In LTR the i-th point corresponds to logical i.
    // In RTL the k-th point corresponds to logical i = count-1-k, so we
    // reverse the RTL array to align by logical i.
    const rtlByLogicalIndex = [...rtlPoints].reverse();

    for (let i = 0; i < COUNT; i += 1) {
      // ltrPoints[i].x + rtlByLogicalIndex[i].x === trackWidth
      // (mirror about the vertical centerline).
      expect(ltrPoints[i].x + rtlByLogicalIndex[i].x).toBeCloseTo(
        TRACK_WIDTH,
        5,
      );
      // Y values are identical for the same logical i in both directions.
      expect(ltrPoints[i].y).toBeCloseTo(rtlByLogicalIndex[i].y, 5);
    }
  });
});
