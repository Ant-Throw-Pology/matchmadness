import readline from "readline";

const singleTiles = ["x", "o", "+", "#", "*"];

const pieces: string[][] = [
    ["xx", "+o", "*#", "+*"],
    ["oo", "+#", "*x", "#*"],
    ["++", "ox", "#o", "x*"],
    ["##", "*o", "+x", "o+"],
    ["**", "ox", "#+", "x#"]
];

const colorful: {[x: string]: string} = {
    "x": "\x1b[97;48;5;53mx\x1b[39;49m",
    "o": "\x1b[97;48;5;196mo\x1b[39;49m",
    "+": "\x1b[97;48;5;27m+\x1b[39;49m",
    "#": "\x1b[97;48;5;208m#\x1b[39;49m",
    "*": "\x1b[97;48;5;34m*\x1b[39;49m",
    " ": " "
};

const colorfulBig: {[x: string]: string} = {
    "x": "\x1b[97;48;5;53mx \x1b[39;49m",
    "o": "\x1b[97;48;5;196mo \x1b[39;49m",
    "+": "\x1b[97;48;5;27m+ \x1b[39;49m",
    "#": "\x1b[97;48;5;208m# \x1b[39;49m",
    "*": "\x1b[97;48;5;34m* \x1b[39;49m",
};

const colorfulSelected: {[x: string]: string} = {
    "x": "\x1b[1;97;48;5;53mx\x1b[39;49;22m",
    "o": "\x1b[1;97;48;5;196mo\x1b[39;49;22m",
    "+": "\x1b[1;97;48;5;27m+\x1b[39;49;22m",
    "#": "\x1b[1;97;48;5;208m#\x1b[39;49;22m",
    "*": "\x1b[1;97;48;5;34m*\x1b[39;49;22m",
    " ": "\x1b[48;5;246m \x1b[49m"
};

const originalLayout: string[][] = [
    [" "]
];

let layoutCursor = [0, 0];

let lastLayoutHeight = 0;

function printLayout() {
    process.stdout.write("\x1b[F\x1b[K".repeat(lastLayoutHeight));
    console.log(originalLayout.map((l, row) => l.map((c, col) => row == layoutCursor[0] && col == layoutCursor[1] ? colorfulSelected[c] : colorful[c]).join("")).join("\n"));
    lastLayoutHeight = originalLayout.length;
}
if (process.argv.length > 2) {
    for (const [index, row] of process.argv.slice(2).entries()) {
        originalLayout[index] = row.toLowerCase().replace(/[^xo+#*]/g, " ").split("");
        layoutCursor[0]++;
    }
    printLayout();
    processLayout();
} else {
    interface KeyEvent {
        name: string;
        code: string;
        ctrl: boolean;
        meta: boolean;
        shift: boolean;
        sequence: string;
    }

    let lastKey: string | undefined, lastKeyTime = 0;
    const keyhandler = (ch: string, ev: KeyEvent) => {
        const key = (ev.name || ch).toLowerCase();
        if (lastKey === key && Date.now() < lastKeyTime + 10) return; // ignore weird duplicate events
        lastKey = key;
        lastKeyTime = Date.now();
        if (ev.ctrl && key == "c") process.exit(0);
        if (singleTiles.includes(key)) {
            originalLayout[layoutCursor[0]][layoutCursor[1]] = key;
            layoutCursor[1]++;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "space") {
            originalLayout[layoutCursor[0]][layoutCursor[1]] = " ";
            layoutCursor[1]++;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "right") {
            layoutCursor[1]++;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "left") {
            layoutCursor[1]--;
            if (layoutCursor[1] < 0) layoutCursor[1] = 0;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "down") {
            layoutCursor[0]++;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "up") {
            layoutCursor[0]--;
            if (layoutCursor[0] < 0) layoutCursor[0] = 0;
            originalLayout[layoutCursor[0]][layoutCursor[1]] ??= " ";
        } else if (key == "return") {
            if (layoutCursor[1] == 0 && layoutCursor[0] == originalLayout.length - 1) {
                console.log("\x1b[F\x1b[KProcessing...");
                process.stdin.off("keypress", keyhandler);
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                processLayout();
                process.exit(0);
            } else {
                layoutCursor[0]++;
                layoutCursor[1] = 0;
                originalLayout[layoutCursor[0]] = [" "];
            }
        }
        printLayout();
    };
    process.stdin.on("keypress", keyhandler);
    process.on("exit", () => {
        process.stdout.write("\x1b[0m");
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
    }

    console.log("Enter your puzzle here. [Enter] for new line, [Space] for a blank space, arrows to move around if you made a mistake, and these keys for the tiles: " + Object.values(colorful).filter(v => v.length > 1).join(", ") + ". Focused tiles have bold text or a grey background.");
    printLayout();
}

// https://stackoverflow.com/a/20871714
function permutations<T>(inputArr: T[]) {
    const result: T[][] = [];
    
    function permute(arr: T[], m: T[] = []) {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }
    
    permute(inputArr);
    
    return result;
}

function processLayout() {
    const h_ = originalLayout.findIndex(l => l.every(c => c == " "));
    const h = h_ == -1 ? originalLayout.length : h_;
    const w = Math.max(...originalLayout.map(l => {const i = l.indexOf(" "); return i == -1 ? l.length : i}));
    originalLayout.length = h;
    for (let row = 0; row < h; row++) {
        originalLayout[row].length = w;
        for (let col = 0; col < w; col++) {
            originalLayout[row][col] ??= " ";
        }
    }
    const workingLayout = structuredClone(originalLayout);
    const constantSlots: [number, number, "h" | "v"][] = [];
    for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
            const top = (workingLayout[row - 1]?.[col] ?? " ") === " ";
            const bottom = (workingLayout[row + 1]?.[col] ?? " ") === " ";
            const left = (workingLayout[row]?.[col - 1] ?? " ") === " ";
            const right = (workingLayout[row]?.[col + 1] ?? " ") === " ";
            if ((workingLayout[row]?.[col] ?? " ") === " ") continue;
            const count = +top + +bottom + +left + +right;
            if (count == 4) {
                console.log("Pattern is impossible - found lone tile during slot-constants step.");
                return;
            } else if (count == 3) {
                const neighbor = [right, bottom, left, top].indexOf(false);
                if (neighbor == -1) throw new Error("what?");
                if (neighbor <= 1) {
                    constantSlots.push([row, col, ["h" as "h", "v" as "v"][neighbor]]);
                    workingLayout[row][col] = " ";
                    workingLayout[row + +(neighbor == 1)][col + +(neighbor == 0)] = " ";
                } else {
                    constantSlots.push([row - +(neighbor == 3), col - +(neighbor == 2), ["h" as "h", "v" as "v"][neighbor - 2]]);
                    workingLayout[row][col] = " ";
                    workingLayout[row - +(neighbor == 3)][col - +(neighbor == 2)] = " ";
                }
            }
        }
    }
    const possibleArrangements: [number, number, "h" | "v"][][] = [];
    function f(layout: string[][], slots: [number, number, "h" | "v"][]) {
        let unassignedTiles = 0;
        for (let row = 0; row < h; row++) {
            for (let col = 0; col < w; col++) {
                const top = (layout[row - 1]?.[col] ?? " ") === " ";
                const bottom = (layout[row + 1]?.[col] ?? " ") === " ";
                const left = (layout[row]?.[col - 1] ?? " ") === " ";
                const right = (layout[row]?.[col + 1] ?? " ") === " ";
                if ((layout[row]?.[col] ?? " ") === " ") continue;
                unassignedTiles++;
                const count = +top + +bottom + +left + +right;
                if (count == 4) {
                    return;
                } else if (count == 3) {
                    const neighbor = [right, bottom, left, top].indexOf(false);
                    if (neighbor == -1) throw new Error("what?");
                    if (neighbor <= 1) {
                        slots.push([row, col, ["h" as "h", "v" as "v"][neighbor]]);
                        layout[row][col] = " ";
                        layout[row + +(neighbor == 1)][col + +(neighbor == 0)] = " ";
                    } else {
                        slots.push([row - +(neighbor == 3), col - +(neighbor == 2), ["h" as "h", "v" as "v"][neighbor - 2]]);
                        layout[row][col] = " ";
                        layout[row - +(neighbor == 3)][col - +(neighbor == 2)] = " ";
                    }
                    f(structuredClone(layout), structuredClone(slots));
                    return;
                } else if (count == 2) {
                    const neighbor1 = [right, bottom, left, top].indexOf(false);
                    if (neighbor1 == -1) throw new Error("what?");
                    const neighbor2 = [right, bottom, left, top].indexOf(false, neighbor1 + 1);
                    if (neighbor2 == -1) throw new Error("what?");
                    const layout1 = structuredClone(layout);
                    const layout2 = structuredClone(layout);
                    const slots1 = structuredClone(slots);
                    const slots2 = structuredClone(slots);
                    if (neighbor1 <= 1) {
                        slots1.push([row, col, ["h" as "h", "v" as "v"][neighbor1]]);
                        layout1[row][col] = " ";
                        layout1[row + +(neighbor1 == 1)][col + +(neighbor1 == 0)] = " ";
                    } else {
                        slots1.push([row - +(neighbor1 == 3), col - +(neighbor1 == 2), ["h" as "h", "v" as "v"][neighbor1 - 2]]);
                        layout1[row][col] = " ";
                        layout1[row - +(neighbor1 == 3)][col - +(neighbor1 == 2)] = " ";
                    }
                    f(structuredClone(layout1), structuredClone(slots1));
                    if (neighbor2 <= 1) {
                        slots2.push([row, col, ["h" as "h", "v" as "v"][neighbor2]]);
                        layout2[row][col] = " ";
                        layout2[row + +(neighbor2 == 1)][col + +(neighbor2 == 0)] = " ";
                    } else {
                        slots2.push([row - +(neighbor2 == 3), col - +(neighbor2 == 2), ["h" as "h", "v" as "v"][neighbor2 - 2]]);
                        layout2[row][col] = " ";
                        layout2[row - +(neighbor2 == 3)][col - +(neighbor2 == 2)] = " ";
                    }
                    f(structuredClone(layout2), structuredClone(slots2));
                }
            }
        }
        if (unassignedTiles == 0) possibleArrangements.push(slots);
    }
    f(structuredClone(workingLayout), structuredClone(constantSlots));
    for (const arr of possibleArrangements) {
        arr.sort((a, b) => (a[1] + w * a[0]) - (b[1] + w * b[0]));
    }
    const arrangements = possibleArrangements
        .map(arr => arr.map(slot => slot[0] + slot[2] + slot[1]).join(","))
        .filter((val, idx, arr) => arr.indexOf(val) === idx)
        .map(arr => arr.split(",").map(slot => {
            const m = slot.match(/(\d+)(h|v)(\d+)/);
            if (!m) throw new Error("what?");
            return [+m[1], +m[3], m[2]] as [number, number, "h" | "v"];
        }))
        .filter(arr => arr.length <= pieces.length);
    if (arrangements.length == 0) {
        console.log("Pattern is impossible - no arrangements of the given number of pieces exist");
        return;
    }
    console.log("Arrangements after deduplication:", arrangements.length, `(${possibleArrangements.length} before)`);
    // for (const arr of arrangements) {
    //     const print = Array(h * 2 + 1).fill(undefined).map(() => Array<string>(w * 2 + 1).fill("  "));
    //     for (const slot of arr) {
    //         print[slot[0] * 2 + 1][slot[1] * 2 + 1] = "\x1b[48;5;255m  \x1b[49m";
    //         if (slot[2] == "h") {
    //             print[slot[0] * 2 + 1][slot[1] * 2 + 2] = "\x1b[48;5;246m  \x1b[49m";
    //             print[slot[0] * 2 + 1][slot[1] * 2 + 3] = "\x1b[48;5;255m  \x1b[49m";
    //         } else {
    //             print[slot[0] * 2 + 2][slot[1] * 2 + 1] = "\x1b[48;5;246m  \x1b[49m";
    //             print[slot[0] * 2 + 3][slot[1] * 2 + 1] = "\x1b[48;5;255m  \x1b[49m";
    //         }
    //     }
    //     console.log(print.map(r => r.join("")).join("\n") + "\n" + "-".repeat(w * 4 + 2));
    // }
    const solutions: Map<[number, number, "h" | "v"], [number, string]>[] = [];
    function g(
        arr: [number, number, "h" | "v"][],
        tiles: Map<[number, number, "h" | "v"], string>,
        possible: Map<[number, number, "h" | "v"], number[]>,
        solved: Map<[number, number, "h" | "v"], [number, string]>,
        depth: number
    ) {
        if (solved.size == arr.length) { // we have a solution
            solutions.push(solved);
            return;
        }
        // what pieces go here?
        for (const [slot, possiblePieces] of possible.entries()) {
            if (possiblePieces.length == 1) {
                possible.delete(slot);
                solved.set(slot, [possiblePieces[0], tiles.get(slot)!]);
                for (const [, possiblePieces2] of possible.entries()) {
                    if (possiblePieces === possiblePieces2) continue;
                    const i = possiblePieces2.indexOf(possiblePieces[0]);
                    if (i >= 0) possiblePieces2.splice(i, 1);
                }
                g(arr, tiles, new Map(possible), new Map(solved), depth + 1);
                return;
            }
        }
        
        const possibleReverse = new Map<number, [number, number, "h" | "v"][]>();
        for (const [slot, possiblePieces] of possible.entries()) {
            for (const piece of possiblePieces) {
                if (!possibleReverse.has(piece)) possibleReverse.set(piece, []);
                possibleReverse.get(piece)!.push(slot);
            }
        }
        // where can these pieces go?
        for (const [piece, possibleSlots] of possibleReverse.entries()) {
            if (possibleSlots.length == 1) {
                const slot = possibleSlots[0];
                possible.delete(slot);
                solved.set(slot, [piece, tiles.get(slot)!]);
                g(arr, tiles, new Map(possible), new Map(solved), depth + 1);
                return;
            }
        }
        
        if ([...possible.values()].every(v => v.length > 0)) { // we have two or more solutions for this arrangement
            const pairs = new Map<string, [number, number, "h" | "v"][]>();
            for (const [slot, possiblePieces] of possible.entries()) {
                const pp = possiblePieces.join(",");
                if (!pairs.has(pp)) pairs.set(pp, []);
                pairs.get(pp)!.push(slot);
            }
            for (const [pieces, slots] of pairs.entries()) {
                if (pieces.split(",").length != slots.length) pairs.delete(pieces);
            }
            const pair = pairs.entries().next().value;
            if (pair) { // two tiles that are swappable
                const [pieces_, slots] = pair;
                const pieces = pieces_.split(",").map(v => +v);
                for (const permutation of permutations(pieces)) {
                    const possible2 = new Map([...possible.entries()].map(([k, v]) => [k, structuredClone(v)]));
                    const solved2 = new Map(solved);
                    for (const [index, piece] of permutation.entries()) {
                        const slot = slots[index];
                        possible2.delete(slot);
                        solved2.set(slot, [piece, tiles.get(slot)!]);
                        for (const [, pieces2] of possible2.entries()) {
                            const i = pieces2.indexOf(piece);
                            if (i >= 0) pieces2.splice(i, 1);
                        }
                    }
                    g(arr, tiles, possible2, solved2, depth + 1);
                }
            } else {
                const chains = [];
                A: for (const [slot, pieces] of possible.entries()) {
                    if (pieces.length == 2) {
                        let other = pieces[1];
                        const chain: [[number, number, "h" | "v"], number][] = [[slot, other]];
                        while (true) {
                            const next = [...possible.entries()].find(([slot2, pieces2]) => pieces2.length == 2 && !chain.some(c => c[0] === slot2) && pieces2.includes(other));
                            if (!next) continue A;
                            const i = next[1].indexOf(other);
                            other = next[1][next[1].length - 1 - i];
                            chain.push([next[0], other]);
                            if (other == pieces[0]) break;
                        }
                        chains.push(chain.sort(([a], [b]) => (a[1] + w * a[0]) - (b[1] + w * b[0])));
                    }
                }
                for (const chain of chains.filter((val, idx, arr) => idx === arr.findIndex(val2 => JSON.stringify(val2) === JSON.stringify(val)))) {
                    const possible2 = new Map([...possible.entries()].map(([k, v]) => [k, structuredClone(v)]));
                    const solved2 = new Map(solved);
                    for (const [slot, piece] of chain) {
                        possible2.delete(slot);
                        solved2.set(slot, [piece, tiles.get(slot)!]);
                        for (const [, pieces2] of possible2.entries()) {
                            const i = pieces2.indexOf(piece);
                            if (i >= 0) pieces2.splice(i, 1);
                        }
                    }
                    g(arr, tiles, possible2, solved2, depth + 1);
                }
            }
        }
    }
    for (const arr of arrangements) {
        const tiles = new Map<(typeof arr)[number], string>();
        for (const slot of arr) {
            tiles.set(slot, originalLayout[slot[0]][slot[1]] + originalLayout[slot[0] + +(slot[2] == "v")][slot[1] + +(slot[2] == "h")]);
        }
        const possible = new Map<(typeof arr)[number], number[]>();
        for (const slot of arr) {
            for (const [i, piece] of pieces.entries()) {
                if (piece.includes(tiles.get(slot)!) || piece.includes(tiles.get(slot)!.split("").reverse().join(""))) {
                    if (!possible.has(slot)) possible.set(slot, [i]);
                    else possible.get(slot)!.push(i);
                }
            }
        }
        const solved = new Map<(typeof arr)[number], [number, string]>();
        g(arr, tiles, possible, solved, 0);
    }
    console.log("Solutions:", solutions.length);
    for (const solution of solutions) {
        const print = Array(h * 2 + 1).fill(undefined).map(() => Array<string>(w * 2 + 1).fill("  "));
        for (const [slot, [piece, tiles]] of solution.entries()) {
            print[slot[0] * 2 + 1][slot[1] * 2 + 1] = colorfulBig[tiles[0]];
            if (slot[2] == "h") {
                print[slot[0] * 2 + 1][slot[1] * 2 + 2] = `\x1b[48;5;246m${piece + 1} \x1b[49m`;
                print[slot[0] * 2 + 1][slot[1] * 2 + 3] = colorfulBig[tiles[1]];
            } else {
                print[slot[0] * 2 + 2][slot[1] * 2 + 1] = `\x1b[48;5;246m${piece + 1} \x1b[49m`;
                print[slot[0] * 2 + 3][slot[1] * 2 + 1] = colorfulBig[tiles[1]];
            }
        }
        console.log(print.map(r => r.join("")).join("\n") + "\n" + "-".repeat(w * 4 + 2));
    }
}