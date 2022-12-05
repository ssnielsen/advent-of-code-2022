import {readFileSync} from 'fs';
import {transpose} from 'ramda';
import {A, B, flow, O, pipe, S} from '@mobily/ts-belt';
import {makeDeepWritable} from '../util';

type Crate = string;
type Stack = readonly Crate[];
type Supplies = readonly Stack[];

type Instruction = {
    amount: number;
    from: number;
    to: number;
};

type Input = {
    initialState: Supplies;
    instructions: readonly Instruction[];
};

const moveN =
    (crates: number) => (state: Supplies, from: number, to: number) => {
        return pipe(state, state =>
            pipe(
                A.splitAt(state[from - 1], crates),
                O.getExn,
                ([cratesToMove, restOfStack]) => {
                    return pipe(
                        state,
                        A.updateAt(from - 1, () => restOfStack),
                        A.updateAt(to - 1, crates => [
                            ...cratesToMove,
                            ...crates,
                        ]),
                    );
                },
            ),
        );
    };

const movePart1 = (state: Supplies, {amount, from, to}: Instruction) => {
    const moveOne = moveN(1);

    return pipe(
        amount,
        A.repeat(0),
        A.reduce(state, state => moveOne(state, from, to)),
    );
};

const movePart2 = (state: Supplies, {amount, from, to}: Instruction) => {
    return moveN(amount)(state, from, to);
};

const makeProgram =
    (
        moveFunction: (
            supplies: Supplies,
            instruction: Instruction,
        ) => Supplies,
    ) =>
    ({initialState, instructions}: Input) => {
        return pipe(
            instructions,
            A.reduce(initialState, moveFunction),
            A.map(A.getUnsafe(0)),
            A.join(''),
        );
    };

const part1 = makeProgram(movePart1);

const part2 = makeProgram(movePart2);

const parseInstructions = flow(
    S.trim,
    S.split('\n'),
    A.map(
        flow(
            S.split(' '),
            A.map(Number),
            A.filter(flow(isNaN, B.not)),
            ([amount, from, to]) => {
                return {amount, from, to};
            },
        ),
    ),
);

const letters = /[A-Z]/;

const parseStacks = flow(
    S.split('\n'),
    A.map(S.split('')),
    A.reverse,
    A.drop(1),
    A.reverse,
    A.map(makeDeepWritable),
    transpose,
    A.map(A.filter(flow(S.match(letters), Boolean))),
    A.filter(flow(A.isEmpty, B.not)),
);

const parse = flow(
    () => `${__dirname}/input`,
    filename => readFileSync(filename, 'utf-8'),
    S.split('\n\n'),
    ([stacks, instructions]) => {
        return {
            initialState: parseStacks(stacks),
            instructions: parseInstructions(instructions),
        };
    },
);

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
