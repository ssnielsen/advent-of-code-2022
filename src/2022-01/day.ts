import {A, N, pipe, S, flow} from '@mobily/ts-belt';
import {loadRawInput} from '../util';

const sum = A.reduce(0, N.add);

const sumElves = flow(A.map(sum), A.sort(flow(N.subtract, N.multiply(-1))));

const part1 = flow(sumElves, A.head);

const part2 = flow(sumElves, A.take(3), sum);

const parse = () => {
    return pipe(
        loadRawInput('2022-01'),
        S.split('\n\n'),
        A.map(flow(S.trim, S.split('\n'), A.map(Number))),
    );
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
