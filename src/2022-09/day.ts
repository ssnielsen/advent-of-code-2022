import {A, D, F, flow, N, O, pipe, S} from '@mobily/ts-belt';
import {reverse, transpose} from 'ramda';
import {exhaustiveCheck, loadInput, log} from '../util';

type Direction = 'U' | 'D' | 'R' | 'L';

type Instruction = [Direction, number];

type Location = [x: number, y: number];

type State = {
    head: Location;
    tail: readonly Location[];
    tailVisited: readonly Location[];
};

type Input = readonly Instruction[];

const moveHead = (
    {head: [x, y], ...state}: State,
    direction: Direction,
): State => {
    switch (direction) {
        case 'U':
            return {
                ...state,
                head: [x, y + 1],
            };
        case 'D':
            return {
                ...state,
                head: [x, y - 1],
            };
        case 'R':
            return {
                ...state,
                head: [x + 1, y],
            };
        case 'L':
            return {
                ...state,
                head: [x - 1, y],
            };
        default:
            exhaustiveCheck(direction);
            throw Error(`Unrecognized direction: ${direction}`);
    }
};

const getNewKnotPosition = (knot: Location, previous: Location): Location => {
    const [headX, headY] = previous;
    const [tailX, tailY] = knot;

    const deltaX = headX - tailX;
    const deltaY = headY - tailY;

    if (deltaY === 2) {
        const newTailY = tailY + 1;

        if (deltaX === 0) {
            return [tailX, newTailY];
        } else if (deltaX === -1) {
            return [tailX - 1, newTailY];
        } else if (deltaX === 1) {
            return [tailX + 1, newTailY];
        } else if (deltaX === -2) {
            return [tailX - 2, newTailY];
        } else if (deltaX === 2) {
            return [tailX + 2, newTailY];
        }
    }

    if (deltaY === -2) {
        const newTailY = tailY - 1;

        if (deltaX === 0) {
            return [tailX, newTailY];
        } else if (deltaX === -1) {
            return [tailX - 1, newTailY];
        } else if (deltaX === 1) {
            return [tailX + 1, newTailY];
        } else if (deltaX === -2) {
            return [tailX - 2, newTailY];
        } else if (deltaX === 2) {
            return [tailX + 2, newTailY];
        }
    }

    if (deltaX === 2) {
        const newTailX = tailX + 1;

        if (deltaY === 0) {
            return [newTailX, tailY];
        } else if (deltaY === -1) {
            return [newTailX, tailY - 1];
        } else if (deltaY === 1) {
            return [newTailX, tailY + 1];
        } else if (deltaY === -2) {
            return [newTailX, tailY - 2];
        } else if (deltaY === 2) {
            return [newTailX, tailY + 2];
        }
    }

    if (deltaX === -2) {
        const newTailX = tailX - 1;

        if (deltaY === 0) {
            return [newTailX, tailY];
        } else if (deltaY === -1) {
            return [newTailX, tailY - 1];
        } else if (deltaY === 1) {
            return [newTailX, tailY + 1];
        } else if (deltaY === -2) {
            return [newTailX, tailY - 2];
        } else if (deltaY === 2) {
            return [newTailX, tailY + 2];
        }
    }

    return [tailX, tailY];
};

const step = (state: State, [direction, distance]: Instruction) => {
    console.log(direction, distance);

    return pipe(
        A.repeat(distance, 1),
        A.reduce(state, (state, _) => {
            // First move head
            const stateAfterMovingHead = moveHead(state, direction);

            // Then figure out how to move the tail (if necessary)
            const newTailPositions = pipe(
                state.tail,
                A.reduce([stateAfterMovingHead.head], (current, knot) => {
                    return [
                        ...current,
                        getNewKnotPosition(knot, O.getExn(A.last(current))),
                    ];
                }),
                log,
                A.drop(1),
            );

            // visualize(newTailPositions);

            return {
                ...stateAfterMovingHead,
                tail: newTailPositions,
                tailVisited: [
                    ...state.tailVisited,
                    O.getExn(A.last(newTailPositions)),
                ],
            };
        }),
    );
};

const part1 = (input: Input) => {
    const result = pipe(
        input,
        A.reduce(
            {
                head: [0, 0],
                tail: A.repeat(1, [0, 0] as Location),
                tailVisited: [],
            },
            step,
        ),
        D.getUnsafe('tailVisited'),
        A.uniq,
        A.length,
    );

    return result;
};

const part2 = (input: Input) => {
    const result = pipe(
        input,
        A.reduce(
            {
                head: [0, 0],
                tail: A.repeat(9, [0, 0] as Location),
                tailVisited: [],
            },
            step,
        ),
        D.getUnsafe('tailVisited'),
        A.uniq,
        // F.tap(a => {
        //     visualize(a);
        // }),
        // log,
        A.length,
        // N.add(1),
    );

    return result;
};

const testInput = `
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
`
    .trim()
    .split('\n');

const testInput2 = `
R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20
`
    .trim()
    .split('\n');

const parse = () => {
    return pipe(
        loadInput('2022-09'),
        // testInput2,
        A.map(
            flow(S.split(' '), ([direction, distance]) => {
                return [direction, Number(distance)] as Instruction;
            }),
        ),
    );
};

export const run = () => {
    const input = parse();

    // console.log(part1(input));
    console.log(part2(input));
};

const visualize = (coordinates: readonly Location[]) => {
    // Define the coordinates of the path

    // Create an empty grid
    const grid = [];
    for (let i = 0; i < 200; i++) {
        grid[i] = [];
        for (let j = 0; j < 200; j++) {
            // @ts-ignore
            grid[i][j] = ' ';
        }
    }

    // Loop through the coordinates and add them to the grid
    for (const coord of coordinates) {
        // @ts-ignore
        grid[coord[0] + 100][coord[1] + 100] = '*';
    }

    // Print the grid to the terminal
    for (const row of reverse(transpose(grid))) {
        console.log(row.join(' '));
    }
};
