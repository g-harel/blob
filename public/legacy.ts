import {rand} from "../internal/rand";
import {renderEditable, XmlElement as InternalXmlElement} from "../internal/render/svg";
import {genBlob} from "../internal/gen";
import {mapPoints} from "../internal/util";

const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");
const isLocalhost = () => location.hostname === "localhost" || location.hostname === "127.0.0.1";
const isFile = () => location.protocol === "file:";
if (!isBrowser() || isLocalhost() || isFile()) {
    console.warn("You are using the legacy blobs API!\nPlease use 'blobs/v2' instead.");
}

export interface PathOptions {
    // Bounding box dimensions.
    size: number;

    // Number of points.
    complexity: number;

    // Amount of randomness.
    contrast: number;

    // Value to seed random number generator.
    seed?: string;
}

export interface BlobOptions extends PathOptions {
    // Fill color.
    color?: string;

    stroke?: {
        // Stroke color.
        color: string;

        // Stroke width.
        width: number;
    };

    // Render points, handles and stroke.
    guides?: boolean;
}

// Generates an svg document string containing a randomized blob.
const blobs = (options: BlobOptions): string => {
    return blobs.editable(options).render();
};

// Generates a randomized blob as an editable data structure which can be rendered to an svg document.
blobs.editable = (options: BlobOptions): XmlElement => {
    if (!options) {
        throw new Error("no options specified");
    }

    // Random number generator.
    const rgen = rand(options.seed || String(Math.random()));

    if (!options.size) {
        throw new Error("no size specified");
    }

    if (!options.stroke && !options.color) {
        throw new Error("no color or stroke specified");
    }

    if (options.complexity <= 0 || options.complexity > 1) {
        throw new Error("complexity out of range ]0,1]");
    }

    if (options.contrast < 0 || options.contrast > 1) {
        throw new Error("contrast out of range [0,1]");
    }

    const count = 3 + Math.floor(14 * options.complexity);
    const offset = (): number => (1 - 0.8 * options.contrast * rgen()) / Math.E;

    const points = mapPoints(genBlob(count, offset), ({curr}) => {
        // Scale.
        curr.x *= options.size;
        curr.y *= options.size;
        curr.handleIn.length *= options.size;
        curr.handleOut.length *= options.size;

        // Flip around x-axis.
        curr.y = options.size - curr.y;
        curr.handleIn.angle *= -1;
        curr.handleOut.angle *= -1;

        return curr;
    });

    return renderEditable(points, {
        closed: true,
        width: options.size,
        height: options.size,
        fill: options.color,
        transform: `rotate(${rgen() * (360 / count)},${options.size / 2},${options.size / 2})`,
        stroke: options.stroke && options.stroke.color,
        strokeWidth: options.stroke && options.stroke.width,
        guides: options.guides,
    });
};

export interface XmlElement {
    tag: string;
    attributes: Record<string, string | number>;
    children: XmlElement[];
    render(): string;
}

// Shortcut to create an XmlElement without "new";
blobs.xml = (tag: string): XmlElement => new InternalXmlElement(tag);

export default blobs;
