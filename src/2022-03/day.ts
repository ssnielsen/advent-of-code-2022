import {A, flow, N, pipe, S} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Compartment = string;

type Knapsack = [Compartment, Compartment];

type Input = Knapsack[];

const scoreItem = (item: string) => {
    if (item.length !== 1) {
        throw Error(`Unexpected item, ${item}`);
    }

    const charCode = item.charCodeAt(0);

    if (97 <= charCode && charCode <= 122) {
        return charCode - 96;
    } else if (65 <= charCode && charCode <= 90) {
        return charCode - 38;
    } else {
        throw Error(`Unexpected item, ${item}`);
    }
};

const findCommonItem = (knapsack: Knapsack) => {
    const [c1, c2] = knapsack;

    const X = A.intersection(S.split(c1, ''), S.split(c2, ''));

    return X[0];
};

const sum = A.reduce(0, N.add);

const part1 = flow(A.map(flow(findCommonItem, scoreItem)), sum);

const part2 = flow(
    A.map(([a, b]: [string, string]) => S.concat(a, b)),
    A.splitEvery(3),
    A.map(
        flow(
            A.map(S.split('')),
            ([a, b, c]) => A.intersection(a, A.intersection(b, c))[0],
            scoreItem,
        ),
    ),
    sum,
);

const parse = () => {
    return pipe(
        loadInput('2022-03'),
        A.map(s => S.splitAt(s, s.length / 2)),
    ) as Input;
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
