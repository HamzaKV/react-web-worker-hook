# react-web-worker-hooks
React Hooks for integrating web workers
<br/><br/>
*Experimental*
<br/><br/>

### To install:

`yarn add react-web-worker-hooks`

or

`npm install react-web-worker-hooks`
<br/><br/>

## Specifications

### useWorker
#### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| `fn(e, args)`  | `(e: any, args: any) => T \| null \| void \| Promise<T \| null \| void>` | Function that needs to be run in parallel. *Provides reference to the web worker event and external args.* |
| `dependencies`  | `any[] \| null \| undefined` | Dependencies for hook effect. |
| `args`  | `{ ...[key]: value... }` | Object of arguments to be provided to the worker function. |

#### Returns

| Return | Type | Description |
| -------- | ---- | ----------- |
| `status`  | `'busy' \| 'success' \| 'error'` | Status of worker thread. |
| `data`  | `T \| null \| undefined \| Promise<T \| null \| undefined>` | Data returned from worker thread. *T references Generic type for typescript* |
| `error`  | `Error \| null` | Exception thrown by worker thread. |
| `runWorker`  | `Function` | Function to execute worker. |
<br/>

### useWorkerPool
#### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| `fn(e, args)`  | `(e: any, args: any) => T \| null \| void \| Promise<T \| null \| void>` | Function that needs to be run in parallel. *Provides reference to the web worker event and external args.* |
| `dependencies`  | `any[] \| null \| undefined` | Dependencies for hook effect. |
| `args`  | `{ ...[key]: value... }` | Object of arguments to be provided to the worker function. |
| `workers`  | `number` | Number of workers to be spawned. |

#### Returns

| Return | Type | Description |
| -------- | ---- | ----------- |
| `state`  | `{ status, data, error }` | State of all worker threads. |
| `runWorkerPool`  | `Function` | Function to execute worker pool. |
<br/>

### useWorkerPoolResult
#### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| `fn(e, args)`  | `(e: any, args: any) => T \| null \| void \| Promise<T \| null \| void>` | Function that needs to be run in parallel. *Provides reference to the web worker event and external args.* |
| `dependencies`  | `any[] \| null \| undefined` | Dependencies for hook effect. |
| `args`  | `{ ...[key]: value... }` | Object of arguments to be provided to the worker function. |
| `workers`  | `number` | Number of workers to be spawned. |

#### Returns

| Return | Type | Description |
| -------- | ---- | ----------- |
| `status`  | `'busy' \| 'success' \| 'error'` | Status of worker thread. |
| `data`  | `T[] \| null \| undefined \| Promise<T[] \| null \| undefined>` | Data returned from worker threads. *T references Generic type for typescript* |
| `error`  | `Error \| null` | Exception thrown by first worker thread. |
| `runWorkerPool`  | `Function` | Function to execute worker pool. |
<br/>

## Usage

### useWorker
```
import { useWorker } from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorker((e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = ...

        //expected return value
        return value;
    }, [...dependencies], {...args});

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    ...
};
```

or

```
import { useWorker } from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorker(async (e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = await ...

        //expected return value
        return value;
    }, [...dependencies], {...args});

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    ...
};
```

### useWorkerPool
```
import { useWorkerPool } from 'react-web-worker-hooks';

export default () => {
    ...

    const [state] = useWorkerPool((e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = ...

        //expected return value
        return value;
    }, [...dependencies], {...args}, nWorkers);

    ...
};
```

or

```
import { useWorkerPool } from 'react-web-worker-hooks';

export default () => {
    ...

    const [state] = useWorkerPool(async (e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = await ...

        //expected return value
        return value;
    }, [...dependencies], {...args}, nWorkers);

    ...
};
```

### useWorkerPoolResult
```
import { useWorkerPoolResult } from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorkerPoolResult((e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = ...

        //expected return value
        return value;
    }, [...dependencies], {...args}, nWorkers);

    ...
};
```

or

```
import { useWorkerPoolResult } from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorkerPoolResult(async (e, args) => {
        //code to execute in parallel
        const { ... } = args;

        value = await ...

        //expected return value
        return value;
    }, [...dependencies], {...args}, nWorkers);

    ...
};
```
