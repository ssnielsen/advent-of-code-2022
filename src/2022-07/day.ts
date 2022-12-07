import {A, pipe} from '@mobily/ts-belt';
import {hasValue, loadInput} from '../util';

type ChangeDirectory =
    | {
          type: 'in';
          to: string;
      }
    | {
          type: 'out';
      }
    | {
          type: 'root';
      };

type List =
    | {
          type: 'directory';
          name: string;
      }
    | {
          type: 'file';
          name: string;
          size: number;
      };

type Command =
    | {
          command: 'cd';
          type: ChangeDirectory;
      }
    | {
          command: 'ls';
          result: List[];
      };

type Directory = {
    name: string;
    parent: string;
    subdirectories: string[];
    files: [string, number][];
};

type Tree = {
    nodes: Map<string, Directory>;
    currentNode: string;
};

type Input = Command[];

const addToTree = (tree: Tree, item: Command) => {
    console.log(tree);
    console.log('------------------------');
    console.log(item);

    switch (item.command) {
        case 'cd':
            switch (item.type.type) {
                case 'in':
                    return {
                        ...tree,
                        currentNode: item.type.to,
                    };
                case 'out':
                    return {
                        ...tree,
                        currentNode: tree.nodes.get(tree.currentNode)!.parent,
                    };
                case 'root': {
                    return {
                        ...tree,
                        currentNode: '/',
                    };
                }
            }
        case 'ls':
            return item.result.reduce((current, listResult) => {
                switch (listResult.type) {
                    case 'directory':
                        if (current.nodes.has(listResult.name)) {
                            return current;
                        }

                        return {
                            ...current,
                            nodes: current.nodes
                                .set(listResult.name, {
                                    files: [],
                                    name: listResult.name,
                                    parent: current.currentNode,
                                    subdirectories: [],
                                })
                                .set(current.currentNode, {
                                    ...current.nodes.get(current.currentNode)!,
                                    subdirectories: [
                                        ...current.nodes.get(
                                            current.currentNode,
                                        )!.subdirectories,
                                        listResult.name,
                                    ],
                                }),
                        };
                    case 'file':
                        const node = current.nodes.get(
                            current.currentNode,
                        ) as Directory;

                        return {
                            ...current,
                            nodes: current.nodes.set(current.currentNode, {
                                ...node,
                                files: [
                                    ...node.files,
                                    [listResult.name, listResult.size],
                                ],
                            }),
                        };
                    default:
                        throw Error();
                }
            }, tree);
    }
};

const part1 = (input: Input) => {
    const resultingTree = A.reduce(
        input,
        {
            currentNode: '/',
            nodes: new Map<string, Directory>().set('/', {
                files: [],
                name: '/',
                parent: '',
                subdirectories: [],
            }),
        },
        (current, command) => {
            return addToTree(current, command);
        },
    );

    console.log(resultingTree);

    return resultingTree.nodes.keys();
};

type ParsingState = Extract<Command, {command: 'ls'}> | null;

const parse = () => {
    const input = loadInput('2022-07');

    const X = A.reduce<string, {state: ParsingState; result: Command[]}>(
        input,
        {
            state: null,
            result: [],
        },
        (result, line) => {
            if (line.startsWith('$ ')) {
                const [command, arg] = line.replace('$ ', '').split(' ');

                const current = result.state;

                switch (command) {
                    case 'cd':
                        switch (arg) {
                            case '..':
                                return {
                                    state: null,
                                    result: [
                                        ...result.result,
                                        current,
                                        {
                                            command: 'cd' as const,
                                            type: {type: 'out' as const},
                                        },
                                    ].filter(hasValue),
                                };
                            case '/':
                                return {
                                    state: null,
                                    result: [
                                        ...result.result,
                                        current,
                                        {
                                            command: 'cd' as const,
                                            type: {type: 'root' as const},
                                        },
                                    ].filter(hasValue),
                                };
                            default:
                                return {
                                    state: null,
                                    result: [
                                        ...result.result,
                                        current,
                                        {
                                            command: 'cd' as const,
                                            type: {
                                                type: 'in' as const,
                                                to: arg,
                                            },
                                        },
                                    ].filter(hasValue),
                                };
                        }
                    case 'ls':
                        return {
                            state: {
                                command: 'ls' as const,
                                result: [],
                            },
                            result: result.result,
                        };
                    default:
                        throw new Error(`Unknown command: ${command}`);
                }
            } else {
                // List results
                const [fst, name] = line.split(' ');

                if (fst === 'dir') {
                    return {
                        result: result.result,
                        state: {
                            command: 'ls' as const,
                            result: [
                                ...result.state!.result,
                                {type: 'directory', name},
                            ],
                        },
                    };
                } else {
                    return {
                        result: result.result,
                        state: {
                            command: 'ls' as const,
                            result: [
                                ...result.state!.result,
                                {type: 'file', name, size: Number(fst)},
                            ],
                        },
                    };
                }
            }
        },
    );

    return [...X.result, X.state].filter(hasValue);
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
};
