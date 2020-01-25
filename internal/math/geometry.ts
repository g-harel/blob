import {deg} from "./unit";
import {Coord} from "../shape/types";

export interface Point {
    x: number;
    y: number;
}

// Calculates distance between two points.
export const distance = (a: Point, b: Point): number => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};

// Calculates the angle of the line from a to b in degrees.
export const angle = (a: Point, b: Point): number => {
    return deg(Math.atan2(b.y - a.y, b.x - a.x));
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Coord, b: Coord): Coord => {
    return {
        x: split(percentage, a.x, b.x),
        y: split(percentage, a.y, b.y),
    };
};
