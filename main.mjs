//
// Primitives
//

export class OpSync {
    constructor(thunk) {
        this.thunk = thunk;
    }
}

export class OpMap {
    constructor(self, f) {
        this.self = self;
        this.f = f;
    }
}

export class OpFlatMap {
    constructor(self, f) {
        this.self = self;
        this.f = f;
    }
}

//
// API
//

export function pipe(...args) {
    let r = args[0]
    for (let i = 1; i < args.length; i++) {
        r = args[i](r)
    }
    return r;
}

export function sync(thunk) {
    return new OpSync(thunk)
}

export function map(f) {
    return (self) => new OpMap(self, f)
}

export function flatMap(f) {
    return (self) => new OpFlatMap(self, f)
}

//
// Runtime
//

export function run(self, onDone, stack = [], result = undefined) {
    let current = self
    let ops = 0
    while (current) {
        ops++
        if (ops > 2) {
            setTimeout(() => {
                run(current, onDone, stack, result)
            }, 0);
            return
        }
        else if (current instanceof OpSync) {
            result = current.thunk()
            current = undefined
        }
        else if (current instanceof OpMap) {
            stack.push(current)
            current = current.self;
        }
        else if (current instanceof OpFlatMap) {
            stack.push(current)
            current = current.self;
        }
        if (!current) {
            while (stack.length > 0) {
                const cont = stack.pop()
                if (cont instanceof OpMap) {
                    result = cont.f(result)
                }
                else if (cont instanceof OpFlatMap) {
                    current = cont.f(result)
                    break;
                }
            }
        }
    }
    onDone(result)
}

//
// Program Definition
//

export const program = pipe(
    sync(() => Math.random()),
    flatMap((n) => sync(() => n + Math.random())),
    flatMap((n) => sync(() => n + Math.random())),
    map((n) => `n: ${n}`)
)

//
// Execution
//

run(program, (exit) => console.log(exit))