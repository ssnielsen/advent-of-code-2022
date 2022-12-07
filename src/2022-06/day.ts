import {A, flow, N, S} from '@mobily/ts-belt';
import {aperture} from 'ramda';
import {loadRawInput} from '../util';

const allDifferent = (s: string[]) => {
    return A.intersection(s, s).length === s.length;
};

const makeFindMarker = (length: number) =>
    flow(
        S.split(''),
        // @ts-ignore
        aperture(length),
        A.reduceWithIndex(new Array<number>(), (state, seq, index) => {
            if (allDifferent(seq)) {
                return [...state, index];
            } else {
                return state;
            }
        }),
        A.getUnsafe(0),
        N.add(length),
    );

const part1 = makeFindMarker(4);
const part2 = makeFindMarker(14);

const parse = () => {
    return loadRawInput('2022-06');
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
