import {A, F, flow, pipe, S} from '@mobily/ts-belt';
import {loadInput, makeDeepWritable} from '../util';

type Assignment = {from: number; to: number};

const isContaining = (a1: Assignment, a2: Assignment) => {
    return a1.from <= a2.from && a2.to <= a1.to;
};

const isOverlapping = (a1: Assignment, a2: Assignment) => {
    return (
        (a1.from <= a2.from && a2.from <= a1.to) ||
        (a1.from <= a2.to && a2.to <= a1.to)
    );
};

const countFilter = (predicate: (a1: Assignment, a2: Assignment) => boolean) =>
    flow(
        A.filter(
            ({first, second}) =>
                predicate(first, second) || predicate(second, first),
        ),
        A.length,
    );

const part1 = countFilter(isContaining);
const part2 = countFilter(isOverlapping);

const parse = () => {
    return pipe(
        loadInput('2022-04'),
        A.map(
            flow(
                S.split(','),
                A.map(
                    flow(S.split('-'), A.map(Number), ([from, to]) => ({
                        from,
                        to,
                    })),
                ),
                ([first, second]) => ({first, second}),
            ),
        ),
        makeDeepWritable,
    );
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
