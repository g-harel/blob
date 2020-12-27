import {addCanvas, colors} from "./internal/layout";
import {
    rotateAround,
    point,
    drawOpen,
    calcBouncePercentage,
    drawLine,
    drawPoint,
    tempStyles,
    drawClosed,
} from "./internal/canvas";
import {split, expandHandle, splitLine, forPoints, mapPoints, coordPoint} from "../internal/util";
import {timingFunctions} from "../internal/animate/timing";
import {Coord, Point} from "../internal/types";
import {rand} from "../internal/rand";
import {genFromOptions} from "../internal/gen";
import {BlobOptions} from "../public/blobs";

addCanvas(
    1.3,
    // Pixelated circle.
    (ctx, width, height) => {
        const angle = Math.PI / 16;
        const pt = width * 0.03;
        const quadrant = [0, 1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 9, 9];
        const cx = width * 0.55;
        const cy = height * 0.5;

        rotateAround({ctx, cx, cy, angle}, () => {
            for (let i = 0; i < quadrant.length; i++) {
                const gridX = quadrant[i];
                const gridY = quadrant[quadrant.length - 1 - i];
                ctx.fillStyle = colors.highlight;
                ctx.fillRect(gridX * pt, gridY * pt, pt + 1, pt + 1);
                ctx.fillRect(-(gridX + 1) * pt, gridY * pt, pt + 1, pt + 1);
                ctx.fillRect(gridX * pt, -(gridY + 1) * pt, pt + 1, pt + 1);
                ctx.fillRect(-(gridX + 1) * pt, -(gridY + 1) * pt, pt + 1, pt + 1);
            }
        });

        return `Traditional raster images are made up of pixels and have a fixed
        resolution.`;
    },
    // Smooth circle.
    (ctx, width, height) => {
        const pt = width * 0.03;
        const shapeSize = width * 0.6;
        const cx = width * 0.35;
        const cy = height * 0.45;

        ctx.beginPath();
        ctx.arc(cx, cy, shapeSize / 2, 0, 2 * Math.PI);
        ctx.lineWidth = pt;
        ctx.strokeStyle = colors.highlight;
        ctx.stroke();

        return `Vector formats use math equations to draw
        the image at any scale. This makes it ideal for artwork that has sharp
        lines and will be viewed at varying sizes like logos and fonts.`;
    },
);

addCanvas(2, (ctx, width, height, animate) => {
    const startPeriod = Math.E * 1000;
    const endPeriod = Math.PI * 1000;

    animate((frameTime) => {
        const startPercentage = calcBouncePercentage(startPeriod, timingFunctions.ease, frameTime);
        const startAngle = split(startPercentage, -45, +45);
        const start = point(width * 0.2, height * 0.5, 0, 0, startAngle, width * 0.25);

        const endPercentage = calcBouncePercentage(endPeriod, timingFunctions.ease, frameTime);
        const endAngle = split(endPercentage, 135, 225);
        const end = point(width * 0.8, height * 0.5, endAngle, width * 0.25, 0, 0);

        drawOpen(ctx, start, end, true);
    });

    return `A common way to define these vector shapes is using Bezier curves. The cubic bezier below
        is made up of four coordinates: the start/end points and the corresponding "handles".
        These handles can be thought of as defining the direction and momentum of the line.`;
});

addCanvas(2, (ctx, width, height, animate) => {
    const period = Math.PI * Math.E * 1000;
    const start = point(width * 0.3, height * 0.8, 0, 0, -105, width * 0.32);
    const end = point(width * 0.7, height * 0.8, -75, width * 0.25, 0, 0);

    const a0: Coord = start;
    const a1 = expandHandle(start, start.handleOut);
    const a2 = expandHandle(end, end.handleIn);
    const a3: Coord = end;

    animate((frameTime) => {
        const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);

        const b0 = splitLine(percentage, a0, a1);
        const b1 = splitLine(percentage, a1, a2);
        const b2 = splitLine(percentage, a2, a3);
        const c0 = splitLine(percentage, b0, b1);
        const c1 = splitLine(percentage, b1, b2);
        const d0 = splitLine(percentage, c0, c1);

        tempStyles(ctx, () => {
            ctx.fillStyle = colors.secondary;
            ctx.strokeStyle = colors.secondary;

            drawLine(ctx, a0, a1, 1);
            drawLine(ctx, a1, a2, 1);
            drawLine(ctx, a2, a3, 1);
            drawLine(ctx, b0, b1, 1);
            drawLine(ctx, b1, b2, 1);
            drawLine(ctx, c0, c1, 1);

            drawPoint(ctx, a0, 1.3, "a0");
            drawPoint(ctx, a1, 1.3, "a1");
            drawPoint(ctx, a2, 1.3, "a2");
            drawPoint(ctx, a3, 1.3, "a3");
            drawPoint(ctx, b0, 1.3, "b0");
            drawPoint(ctx, b1, 1.3, "b1");
            drawPoint(ctx, b2, 1.3, "b2");
            drawPoint(ctx, c0, 1.3, "c0");
            drawPoint(ctx, c1, 1.3, "c1");
        });

        drawOpen(ctx, start, end, false);

        tempStyles(ctx, () => {
            ctx.fillStyle = colors.highlight;
            drawPoint(ctx, d0, 3);
        });
    });
});

const makePoly = (pointCount: number, radius: number, center: Coord): Point[] => {
    const angle = (2 * Math.PI) / pointCount;
    const points: Point[] = [];
    const nullHandle = {angle: 0, length: 0};
    for (let i = 0; i < pointCount; i++) {
        const coord = expandHandle(center, {angle: i * angle, length: radius});
        points.push({...coord, handleIn: nullHandle, handleOut: nullHandle});
    }
    return points;
};

addCanvas(
    1.3,
    (ctx, width, height) => {
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const radius = width * 0.3;
        const points = 5;
        const shape = makePoly(points, radius, center);

        // Draw lines from center to each point..
        tempStyles(ctx, () => {
            ctx.fillStyle = colors.secondary;
            ctx.strokeStyle = colors.secondary;

            drawPoint(ctx, center, 2);
            forPoints(shape, ({curr}) => {
                drawLine(ctx, center, curr, 1, 2);
            });
        });

        drawClosed(ctx, shape, false);
    },
    (ctx, width, height, animate) => {
        const period = Math.PI * 1000;
        const center: Coord = {x: width * 0.5, y: height * 0.5};
        const radius = width * 0.3;
        const points = 5;
        const randSeed = "abcd";
        const randStrength = 0.5;

        const shape = makePoly(points, radius, center);

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);
            const rgen = rand(randSeed);

            // Draw original shape.
            tempStyles(ctx, () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;

                drawPoint(ctx, center, 2);
                forPoints(shape, ({curr, next}) => {
                    drawLine(ctx, curr, next(), 1, 2);
                });
            });

            // Draw randomly shifted shape.
            const shiftedShape = shape.map(
                (p): Point => {
                    const randOffset = percentage * (randStrength * rgen() - randStrength / 2);
                    return coordPoint(splitLine(randOffset, p, center));
                },
            );

            drawClosed(ctx, shiftedShape, true);
        });
    },
);

addCanvas(
    1.3,
    (ctx, width, height) => {
        const options: BlobOptions = {
            extraPoints: 2,
            randomness: 6,
            seed: "random",
            size: width * 0.7,
        };
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const polyBlob = mapPoints(genFromOptions(options), ({curr}) => {
            curr.x += center.x - options.size / 2;
            curr.y += center.y - options.size / 2;
            return coordPoint(curr);
        });

        // Draw polygon blob.
        tempStyles(ctx, () => {
            ctx.fillStyle = colors.secondary;
            ctx.strokeStyle = colors.secondary;

            drawPoint(ctx, center, 2);
            forPoints(polyBlob, ({curr}) => {
                drawLine(ctx, center, curr, 1, 2);
            });
        });

        drawClosed(ctx, polyBlob, false);
    },
    (ctx, width, height, animate) => {
        const period = Math.PI * 1000;
        const options: BlobOptions = {
            extraPoints: 2,
            randomness: 6,
            seed: "random",
            size: width * 0.7,
        };
        const center: Coord = {x: width * 0.5, y: height * 0.5};

        const blob = mapPoints(genFromOptions(options), ({curr}) => {
            curr.x += center.x - options.size / 2;
            curr.y += center.y - options.size / 2;
            return curr;
        });

        animate((frameTime) => {
            const percentage = calcBouncePercentage(period, timingFunctions.ease, frameTime);

            // Draw original blob.
            tempStyles(ctx, () => {
                ctx.fillStyle = colors.secondary;
                ctx.strokeStyle = colors.secondary;

                drawPoint(ctx, center, 2);
                forPoints(blob, ({curr, next}) => {
                    drawLine(ctx, curr, next(), 1, 2);
                });
            });

            // Draw animated blob.
            const animatedBlob = mapPoints(blob, ({curr}) => {
                curr.handleIn.length *= percentage;
                curr.handleOut.length *= percentage;
                return curr;
            });

            drawClosed(ctx, animatedBlob, true);
        });
    },
);

// content
//     raster vs pixel-
//     bezier curves
//         demo
//         how to drawn
//     shape smoothing
//         handle angle
//         handle length
//     shape morphing
//         path splitting
