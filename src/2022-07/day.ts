import {A, N, pipe} from '@mobily/ts-belt';
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
    subdirectories: string[];
    files: number[];
};

type Tree = {
    nodes: Map<string, Directory>;
    currentPath: string[];
};

type Input = Command[];

const buildPath = (elements: string[]) => elements.join('/');

const addToTree = (tree: Tree, item: Command) => {
    switch (item.command) {
        case 'cd':
            switch (item.type.type) {
                case 'in':
                    return {
                        ...tree,
                        currentPath: [...tree.currentPath, item.type.to],
                    };
                case 'out':
                    return {
                        ...tree,
                        currentPath: pipe(
                            tree.currentPath,
                            A.reverse,
                            A.drop(1),
                            A.reverse,
                        ) as string[],
                    };
                case 'root': {
                    return {
                        ...tree,
                        currentPath: ['/'],
                    };
                }
            }
        case 'ls':
            return item.result.reduce((current, listResult) => {
                const currentCacheKey = buildPath(current.currentPath);

                switch (listResult.type) {
                    case 'directory':
                        const newDirectoryCacheKey = buildPath([
                            ...current.currentPath,
                            listResult.name,
                        ]);

                        const newDirectory = {
                            subdirectories: new Array<string>(),
                            files: new Array<number>(),
                        };

                        const currentDirectory =
                            current.nodes.get(currentCacheKey);

                        if (!currentDirectory) {
                            throw new Error('Test');
                        }

                        const updatedCurrentDirectory = {
                            ...currentDirectory,
                            subdirectories: [
                                ...currentDirectory.subdirectories,
                                listResult.name,
                            ],
                        };

                        return {
                            ...current,
                            nodes: current.nodes
                                .set(newDirectoryCacheKey, newDirectory)
                                .set(currentCacheKey, updatedCurrentDirectory),
                        };
                    case 'file':
                        const node = current.nodes.get(currentCacheKey);

                        if (!node) {
                            throw Error('Did not find a node!');
                        }

                        return {
                            ...current,
                            nodes: current.nodes.set(currentCacheKey, {
                                ...node,
                                files: [...node.files, listResult.size],
                            }),
                        };
                    default:
                        throw Error();
                }
            }, tree);
    }
};

const sumFiles = (files: Directory['files']) => {
    return A.reduce(files, 0, (totalSize, fileSize) => totalSize + fileSize);
};

const calculateFolder = (path: string[], tree: Tree): number => {
    const cacheKey = buildPath(path);

    const node = tree.nodes.get(cacheKey);

    if (!node) {
        throw Error(`Unknown node: ${path}`);
    }

    return (
        sumFiles(node.files) +
        A.reduce(
            node.subdirectories,
            0,
            (totalSize, subdirectory) =>
                totalSize + calculateFolder([...path, subdirectory], tree),
        )
    );
};

const makeTree = (input: Input) => {
    return A.reduce(
        input,
        {
            currentPath: ['/'],
            nodes: new Map<string, Directory>().set('/', {
                files: [],
                subdirectories: [],
            }),
        },
        (current, command) => {
            return addToTree(current, command);
        },
    );
};

const calculateFolderSizes = (tree: Tree) => {
    return [...tree.nodes.keys()].map(nodeName => {
        return calculateFolder([nodeName], tree);
    });
};

const part1 = (input: Input) => {
    const tree = makeTree(input);

    const result = calculateFolderSizes(tree)
        .filter(size => size <= 100000)
        .reduce((a, b) => a + b, 0);

    return result;
};

const part2 = (input: Input) => {
    const totalAvailableSpace = 70_000_000;
    const neededSpace = 30_000_000;

    const tree = makeTree(input);

    const directorySizes = calculateFolderSizes(tree);

    const totalSize = calculateFolder(['/'], tree);

    const unusedSpace = totalAvailableSpace - totalSize;

    const spaceWeNeedToFind = neededSpace - unusedSpace;

    return pipe(
        directorySizes,
        A.sort(N.subtract),
        A.find(size => size > spaceWeNeedToFind),
    );
};

type ParsingState = Extract<Command, {command: 'ls'}> | null;

const parse = () => {
    const input = loadInput('2022-07');

    const {state, result} = A.reduce<
        string,
        {state: ParsingState; result: Command[]}
    >(
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

    return [...result, state].filter(hasValue);
};

export const run = () => {
    const input = parse();

    console.log(part1(input));
    console.log(part2(input));
};
