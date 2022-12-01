import fs from 'fs';
import {pipe, F, S} from '@mobily/ts-belt';

export const loadInput = (day: string) => pipe(loadRawInput(day), S.split('\n'));

export const loadRawInput = (day: string) =>
    pipe(
        `${__dirname}/${day}/input`,
        F.tap(filename => console.log(`Reading file from ${filename}`)),
        filename => fs.readFileSync(filename, 'utf-8'),
        S.trim,
    );

// export const hasValue = <T>(thing: T | undefined | null): thing is T => Boolean(thing);

export const forceUnwrap = <T>(thing: T): NonNullable<T> => thing!;

export function exhaustiveCheck(param: never) {}

// export const cast =
//     <T, U>() =>
//     (thing: T): U =>
//         thing as unknown as U;

export const makeDeepWritable = <T>(t: T) => {
    return t as DeepWriteable<T>;
};

type DeepWriteable<T> = {-readonly [P in keyof T]: DeepWriteable<T[P]>};
