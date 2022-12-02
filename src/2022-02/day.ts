import {A, flow, N, pipe, S} from '@mobily/ts-belt';
import {loadInput, UnreachableCaseError, makeDeepWritable} from '../util';

type OpponentPlay = 'A' | 'B' | 'C';
type MyPlay = 'X' | 'Y' | 'Z';
type Shape = 'rock' | 'paper' | 'scissors';
type Outcome = 'win' | 'draw' | 'loss';

const playToShape = (play: OpponentPlay | MyPlay) => {
    switch (play) {
        case 'A':
        case 'X':
            return 'rock';
        case 'B':
        case 'Y':
            return 'paper';
        case 'C':
        case 'Z':
            return 'scissors';
        default:
            throw new UnreachableCaseError(play);
    }
};

const shapeScore = (shape: Shape) => {
    switch (shape) {
        case 'rock':
            return 1;
        case 'paper':
            return 2;
        case 'scissors':
            return 3;
        default:
            throw new UnreachableCaseError(shape);
    }
};

const outcomeScore = (outcome: Outcome) => {
    switch (outcome) {
        case 'win':
            return 6;
        case 'draw':
            return 3;
        case 'loss':
            return 0;
        default:
            throw new UnreachableCaseError(outcome);
    }
};

const determineWinner = (opponent: OpponentPlay, me: MyPlay) => {
    const shapes = `${playToShape(me)}_${playToShape(opponent)}` as const;

    switch (shapes) {
        case 'rock_scissors':
        case 'paper_rock':
        case 'scissors_paper':
            return 'win';
        case 'rock_rock':
        case 'paper_paper':
        case 'scissors_scissors':
            return 'draw';
        case 'scissors_rock':
        case 'rock_paper':
        case 'paper_scissors':
            return 'loss';
        default:
            throw new UnreachableCaseError(shapes);
    }
};

const sum = A.reduce(0, N.add);

const part1 = flow(
    A.map(([opponent, me]: [OpponentPlay, MyPlay]) => {
        return (
            outcomeScore(determineWinner(opponent, me)) +
            shapeScore(playToShape(me))
        );
    }),
    sum,
);

const desiredOutcome = (me: MyPlay) => {
    switch (me) {
        case 'X':
            return 'loss';
        case 'Y':
            return 'draw';
        case 'Z':
            return 'win';
    }
};

const determineShape = (opponent: OpponentPlay, me: MyPlay) => {
    const situation = `${playToShape(opponent)}_${desiredOutcome(me)}` as const;

    switch (situation) {
        case 'rock_win':
            return 'paper';
        case 'rock_draw':
            return 'rock';
        case 'rock_loss':
            return 'scissors';
        case 'paper_win':
            return 'scissors';
        case 'paper_draw':
            return 'paper';
        case 'paper_loss':
            return 'rock';
        case 'scissors_win':
            return 'rock';
        case 'scissors_draw':
            return 'scissors';
        case 'scissors_loss':
            return 'paper';
        default:
            throw new UnreachableCaseError(situation);
    }
};

const part2 = flow(
    A.map(([opponent, me]: [OpponentPlay, MyPlay]) => {
        return (
            shapeScore(determineShape(opponent, me)) +
            outcomeScore(desiredOutcome(me))
        );
    }),
    sum,
);

const parse = () => {
    return pipe(
        loadInput('2022-02'),
        A.map(
            flow(S.split(' '), ([opponent, me]) => {
                return [opponent, me] as [OpponentPlay, MyPlay];
            }),
        ),
        makeDeepWritable,
    );
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
