import {A, N, pipe, S} from '@mobily/ts-belt';
import {loadRawInput, makeDeepWritable} from '../util';

type Calories = number;

type Elf = Calories[];

type Input = Elf[];

const sum = A.reduce(0, N.add);

const sumElves = (input: Input) => {
    return pipe(
        input,
        A.map(sum),
        A.sort((a, b) => b - a),
    );
};

const part1 = (input: Input) => {
    return pipe(input, sumElves, A.head);
};

const part2 = (input: Input) => {
    return pipe(input, sumElves, A.take(3), sum);
};

const parse = () => {
    return pipe(
        loadRawInput('2022-01'),
        S.split('\n\n'),
        A.map(elf => pipe(elf, S.trim, S.split('\n'), A.map(Number), makeDeepWritable)),
        makeDeepWritable,
    );
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
