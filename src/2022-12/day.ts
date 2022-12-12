import {A, F, flow, O, pipe, S} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Input = {
    grid: number[][];
    source: readonly [number, number];
    destination: readonly [number, number];
};

const getVerticeNumber = (x: number, y: number, width: number) => {
    return x * width + y;
};

const getCoordinate = (vertice: number, width: number) => {
    const x = Math.floor(vertice / width);

    return [x, vertice % width];
};

const findPaths = (
    input: Input,
    canTakeStep: (from: number, to: number) => boolean,
) => {
    const {grid, source} = input;

    const height = grid.length;
    const width = grid[0].length;

    const allVertices = A.range(0, height * width - 1) as number[];

    const getDistance = (a: number, b: number) => 1;
    const getNeighbors = (vertice: number) => {
        const [x, y] = getCoordinate(vertice, width);

        const currentValue = grid[x][y];

        const possibleNeighbors = [
            [x, y - 1],
            [x, y + 1],
            [x - 1, y],
            [x + 1, y],
        ].filter(([nX, nY]) => {
            if (nX < 0 || nY < 0 || nX >= height || nY >= width) {
                return false;
            }

            const neighborValue = grid[nX][nY];

            return canTakeStep(currentValue, neighborValue);
        });

        return possibleNeighbors.map(([nX, nY]) =>
            getVerticeNumber(nX, nY, width),
        );
    };

    const [dist] = dijkstra(
        allVertices,
        getDistance,
        getNeighbors,
        getVerticeNumber(source[0], source[1], width),
    );

    return dist;
};

const part1 = (input: Input) => {
    const {destination, grid} = input;
    const width = grid[0].length;
    const dist = findPaths(input, (from, to) => to - 1 <= from);
    const result =
        dist[getVerticeNumber(destination[0], destination[1], width)];

    return result;
};

const part2 = (input: Input) => {
    const {grid} = input;
    const height = grid.length;
    const width = grid[0].length;

    const dist = findPaths(
        {
            ...input,

            // Flip the source and destination - now we're interested in all the shorts paths from the destination
            destination: input.source,
            source: input.destination,
        },
        (from, to) => from - 1 <= to,
    );

    const result = pipe(
        A.range(0, height * width - 1),
        A.filter(vertice => {
            const [x, y] = getCoordinate(vertice, width);

            return grid[x][y] === 1;
        }),
        A.map(vertice => {
            const [x, y] = getCoordinate(vertice, width);

            const distance = dist[getVerticeNumber(x, y, width)];
            if (distance === null) {
                throw Error('Not found');
            }

            return distance;
        }),
        A.filter(a => a !== Infinity), // Apparently we couldn't reach all of the positions marked 'a'
        A.sort((a, b) => a - b),
        A.head,
    );

    return result;
};

const findLetterInGrid = (
    grid: readonly (readonly string[])[],
    toFind: string,
) => {
    const [x, y] = A.reduceWithIndex(
        grid,
        [-1, -1] as [number, number],
        (current, line, indexX) => {
            const indexY = A.getIndexBy(line, letter => letter === toFind);

            return pipe(
                O.mapWithDefault(
                    indexY,
                    current,
                    indexY => [indexX, indexY] as const,
                ),
                F.toMutable,
            );
        },
    );

    return [x, y] as const;
};

const letterToNumber = (letter: string) => {
    return letter.charCodeAt(0) - 96;
};

const parse = () => {
    return pipe(loadInput('2022-12'), A.map(S.split('')), grid => {
        const source = findLetterInGrid(grid, 'S');
        const destination = findLetterInGrid(grid, 'E');

        const mappedGrid = pipe(
            grid,
            A.map(flow(A.map(letterToNumber), F.toMutable)),
            F.toMutable,
        );

        mappedGrid[source[0]][source[1]] = letterToNumber('a');
        mappedGrid[destination[0]][destination[1]] = letterToNumber('z');

        return {
            grid: mappedGrid,
            source,
            destination,
        };
    });
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};

const input1 = `
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi
`
    .trim()
    .split('\n');

/*

 1  function Dijkstra(Graph, source):
 2
 3      for each vertex v in Graph.Vertices:
 4          dist[v] ← INFINITY
 5          prev[v] ← UNDEFINED
 6          add v to Q
 7      dist[source] ← 0
 8
 9      while Q is not empty:
10          u ← vertex in Q with min dist[u]
11          remove u from Q
12
13          for each neighbor v of u still in Q:
14              alt ← dist[u] + Graph.Edges(u, v)
15              if alt < dist[v]:
16                  dist[v] ← alt
17                  prev[v] ← u
18
19      return dist[], prev[]
*/
const dijkstra = (
    vertices: number[],
    getDistance: (from: number, to: number) => number,
    getNeighbors: (from: number) => number[],
    source: number,
) => {
    const dist: number[] = [];
    const prev: (number | null)[] = [];
    var queue: number[] = [];

    vertices.forEach(v => {
        dist[v] = Infinity;
        prev[v] = null;
        queue = [...queue, v];
    });

    dist[source] = 0;

    while (queue.length !== 0) {
        const u = pipe(
            queue,
            A.map(v => [v, dist[v]] as const),
            A.sort(([, a], [, b]) => a - b),
            A.head,
            O.getExn,
            A.head,
            O.getExn,
        );

        queue = queue.filter(q => q !== u);
        const neighbors = getNeighbors(u);

        const unvisited = neighbors.filter(v => {
            return queue.includes(v);
        });

        unvisited.forEach(v => {
            const alt = dist[u] + getDistance(u, v);
            if (alt < dist[v]) {
                dist[v] = alt;
                prev[v] = u;
            }
        });
    }

    return [dist, prev];
};
