import {A, flow, N, pipe, S} from '@mobily/ts-belt';
import {takeWhile} from 'ramda';
import {loadInput} from '../util';

type Tree = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

type Forest = readonly (readonly Tree[])[];

type Location = [x: number, y: number];

const getSightlines = (forest: Forest, [x, y]: Location) => {
    const mapToTree = A.map(([x, y]: [number, number]) => {
        return forest[x][y];
    });

    const fromTop = pipe(
        A.range(0, y - 1),
        A.reverse, // Reversing due to part 2
        A.map(y => [x, y] as Location),
        mapToTree,
    );
    const fromBottom = pipe(
        A.range(y + 1, forest.length - 1),
        A.map(y => [x, y] as Location),
        mapToTree,
    );
    const fromLeft = pipe(
        A.range(0, x - 1),
        A.reverse, // Reversing due to part 2
        A.map(x => [x, y] as Location),
        mapToTree,
    );
    const fromRight = pipe(
        A.range(x + 1, forest[0].length - 1),
        A.map(x => [x, y] as Location),
        mapToTree,
    );

    return [fromLeft, fromTop, fromRight, fromBottom];
};

const canSeeTree = (
    tree: Tree,
    sightlines: ReturnType<typeof getSightlines>,
) => {
    return pipe(
        sightlines,
        A.some(sightline => {
            return pipe(
                sightline,
                A.every(otherTree => otherTree < tree),
            );
        }),
    );
};

const part1 = (forest: Forest) => {
    return pipe(
        forest,
        A.mapWithIndex((x, line) => {
            return A.mapWithIndex(line, (y, tree) => {
                const sightLines = getSightlines(forest, [x, y]);

                return canSeeTree(tree, sightLines) ? 1 : 0;
            });
        }),
        A.reduce(0, (n, line) => {
            return n + A.reduce(line, 0, (m, tree) => m + tree);
        }),
    );
};

const scoreTree = (
    tree: Tree,
    sightlines: ReturnType<typeof getSightlines>,
) => {
    return pipe(
        sightlines,
        A.map(sightline => {
            return pipe(
                sightline,
                takeWhile(otherTree => otherTree < tree), // ts-belt's takeWhile didn't really function as expected
                A.length,
                length => length + (length === sightline.length ? 0 : 1),
            );
        }),
        A.reduce(1, N.multiply),
    );
};

const part2 = (forest: Forest) => {
    const treeScores = pipe(
        forest,
        A.mapWithIndex((x, line) => {
            return pipe(
                line,
                A.mapWithIndex((y, tree) => {
                    const sightlines = getSightlines(forest, [x, y]);

                    return scoreTree(tree, sightlines);
                }),
            );
        }),
        A.flat,
        A.reduce(0, Math.max),
    );

    return treeScores;
};

const parse = () => {
    return pipe(
        loadInput('2022-08'),
        A.map(flow(S.split(''), A.map(Number))),
    ) as Forest;
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
