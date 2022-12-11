import {A, D, flow, N, pipe, S} from '@mobily/ts-belt';
import {loadInput} from '../util';

type Instruction =
    | {
          name: 'addx';
          value: number;
      }
    | {
          name: 'noop';
      };

type Input = readonly Instruction[];

type State = {
    X: number;
    cycle: number;
    recordings: number[];
};

const next = <S extends State>(state: S, instruction: Instruction): S => {
    switch (instruction.name) {
        case 'addx':
            return {
                ...state,
                X: state.X + instruction.value,
                cycle: state.cycle + 1,
            };
        case 'noop':
            return {
                ...state,
                cycle: state.cycle + 1,
            };
    }
};

const part1 = (input: Input) => {
    const recordAt = [20, 60, 100, 140, 180, 220];

    return pipe(
        input,
        A.reduce(
            {
                X: 1,
                cycle: 1,
                recordings: [],
            },
            (state: State, instruction) => {
                const nextState = next(state, instruction);

                if (recordAt.includes(nextState.cycle)) {
                    return {
                        ...nextState,
                        recordings: [
                            ...nextState.recordings,
                            nextState.X * nextState.cycle,
                        ],
                    };
                } else {
                    return nextState;
                }
            },
        ),
        D.getUnsafe('recordings'),
        A.reduce(0, N.add),
    );
};

const part2 = (input: Input) => {
    return pipe(
        input,
        A.reduce(
            {
                X: 1,
                cycle: 0,
                recordings: [],
            },
            (state: State, instruction) => {
                const linePos = state.cycle % 40;

                const sprite = [state.X - 1, state.X, state.X + 1];

                const nextState = next(state, instruction);

                const newRecordings = [
                    ...state.recordings,
                    sprite.includes(linePos) ? 1 : 0,
                ];

                return {
                    ...nextState,
                    recordings: newRecordings,
                };
            },
        ),
        D.getUnsafe('recordings'),
        A.splitEvery(40),
        A.map(
            flow(
                A.map(n => (n === 1 ? '#' : ' ')),
                A.join(''),
            ),
        ),
        A.join('\n'),
    );
};

const input1 = `noop
addx 3
addx -5
`
    .trim()
    .split('\n');

const input2 = `addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop
`
    .trim()
    .split('\n');

const parse = () => {
    return pipe(
        loadInput('2022-10'),
        A.map(
            flow(S.split(' '), ([name, arg]) => {
                switch (name) {
                    case 'addx':
                        return [
                            {name: 'noop' as const}, // Inserting fake noop to avoid having to account for different cycle counts
                            {
                                name,
                                value: Number(arg),
                            },
                        ];
                    case 'noop':
                        return [{name}];
                    default:
                        throw Error(`Unrecognized operation ${name}`);
                }
            }),
        ),
        A.flat,
    );
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
