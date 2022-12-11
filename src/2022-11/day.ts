import {A, D, flow, N, O, pipe, S} from '@mobily/ts-belt';
import {loadRawInput} from '../util';

type Monkey = {
    items: readonly number[];
    operation: (level: number) => number; // Returns a worry level
    test: (level: number) => number; // Returns a monkey
    inspections: number;
};

type Input = readonly Monkey[];

type State = readonly Monkey[];

const takeTurn = (
    monkeys: State,
    monkeyWithTurn: number,
    reduceRule: Rule,
): State => {
    const monkey = monkeys[monkeyWithTurn];

    const numberOfItems = monkey.items.length;

    const result = pipe(
        monkey.items,
        A.reduce(monkeys, (current, item) => {
            const nextWorry = monkey.operation(item);
            const newWorry =
                reduceRule.rule === 'div'
                    ? Math.floor(monkey.operation(item) / reduceRule.divisor)
                    : nextWorry % reduceRule.divisor;
            const monkeyToReceiveIndex = monkey.test(newWorry);

            return A.updateAt(
                current,
                monkeyToReceiveIndex,
                monkeyToReceive => {
                    return {
                        ...monkeyToReceive,
                        items: [...monkeyToReceive.items, newWorry],
                    };
                },
            );
        }),
    );

    const newMonkey: Monkey = {
        ...monkey,
        inspections: monkey.inspections + numberOfItems,
        items: [],
    };

    return A.updateAt(result, monkeyWithTurn, () => newMonkey);
};

const doRound = (monkeys: State, reduceRule: Rule): State => {
    const result = pipe(
        A.range(0, monkeys.length - 1), // Go through all monkeys
        A.reduce(monkeys, (current, turnNumber) => {
            return takeTurn(current, turnNumber, reduceRule);
        }),
    );

    return result;
};

type Rule =
    | {
          rule: 'div';
          divisor: number;
      }
    | {
          rule: 'mod';
          divisor: number;
      };

const play = (rounds: number, reduceRule: Rule) => (input: Input) => {
    return pipe(
        A.repeat(rounds, 1),
        A.reduce(input, (current: State, _) => {
            return doRound(current, reduceRule);
        }),
        A.map(D.getUnsafe('inspections')),
        A.sort((a, b) => b - a),
        A.take(2),
        ([m1, m2]) => m1 * m2,
    );
};

const part1 = play(20, {rule: 'div', divisor: 3});
const part2 = (allDiv: number) => play(10_000, {rule: 'mod', divisor: allDiv});

const input1 = `
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1
`.trim();

const parseConditionalString = (conditionalString: string) => {
    return pipe(
        conditionalString,
        S.match(/\d+/),
        O.getExn,
        A.getUnsafe(0),
        Number,
    );
};

const parse = () => {
    return pipe(
        loadRawInput('2022-11'),
        S.split('\n\n'),
        A.map(
            flow(
                S.split('\n'),
                ([
                    _, // The heading "Monkey N"
                    itemsString,
                    operationString,
                    testString,
                    testTrueString,
                    testFalseString,
                ]): [Monkey, number] => {
                    const items = pipe(
                        itemsString,
                        S.split(': '),
                        A.getUnsafe(1),
                        S.split(', '),
                        A.map(Number),
                    );
                    const operation = pipe(
                        operationString,
                        S.split(' '),
                        A.reverse,
                        ([operand, operator]) => {
                            switch (operator) {
                                case '+':
                                    return operand === 'old'
                                        ? (level: number) => N.add(level, level)
                                        : N.add(Number(operand));
                                case '*':
                                    return operand === 'old'
                                        ? (level: number) =>
                                              N.multiply(level, level)
                                        : N.multiply(Number(operand));
                                default:
                                    throw Error(
                                        `Unknown operator "${operator}"`,
                                    );
                            }
                        },
                    );
                    const divisibleBy = parseConditionalString(testString);
                    const monkeyTrue = parseConditionalString(testTrueString);
                    const monkeyFalse = parseConditionalString(testFalseString);
                    const test = (level: number) =>
                        level % divisibleBy === 0 ? monkeyTrue : monkeyFalse;

                    return [
                        {
                            items,
                            operation,
                            test,
                            inspections: 0,
                        },
                        divisibleBy,
                    ];
                },
            ),
        ),
        A.unzip,
        ([monkeys, divisors]) =>
            [monkeys, A.reduce(divisors, 1, N.multiply)] as const,
    );
};

export const run = () => {
    const [monkeys, maxDivisor] = parse();

    console.log(part1(monkeys));
    console.log(part2(maxDivisor)(monkeys));
};
