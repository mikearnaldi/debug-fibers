## Description

The file `main.mjs` showcase a minimized example of a program that uses a fiber runtime to perform execution in a stack safe a contention protected manner, there are 3 key components to the example:

1) primitives and api definition
2) program definition
3) runtime

When the runtime executes the program it keeps the stack in an array and progressively executes operations one by one, every `n` operations the runtime suspend execution to give space to other fibers or other operations like timers to execute.

In short a program like:

```js
export const program = pipe(
    sync(() => console.log("hello")),
    flatMap(() => program)
)
```

Would neither prevent other programs to execute nor blow up for a maximum number of stack frames.

## Debugging

Debugging such program is hard for 2 reasons:

1) the fiber can suspend at any time
2) the stack is held in memory and not in the call stack

Due to those reasons current DevTools are pretty much irrelevant, in order to provide both Execution Tracing (trace what's currently running) and Stack Tracing (trace what's left to do) we would need a way of knowing where specific functions (and potentially objects) were defined in source code (potentially source mapped).

Assuming that such api is exposed we would be able to log or tell to a debugger what's currently running and we would be able to produce proper stack-like traces in case of errors, both of which are impossible to obtain at the moment.

## Differences from React Fiber

The React Fiber will have only the issue 1, it won't have 2 as the component stack is a call stack and suspension happens via throwing and catching, note that the design of such a fiber is highly inefficient as a suspended computation will need to re-execute from the beginning (catch point) and it won't be able to provide stack safety