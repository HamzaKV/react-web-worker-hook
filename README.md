# react-web-worker-hooks
A React Hook for integrating web workers
<br/><br/>
*Experimental*
<br/><br/>

### To install:


`yarn add react-web-worker-hooks`

or

`npm install react-web-worker-hooks`
<br/><br/>

## Usage

### Synchronous
```
import useWorker from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorker((e) => {
        //code to execute in parallel
        value = ...

        //expected return value
        return value;
    });

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    ...
};
```

or

```
import useWorker from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error, runWorker] = useWorker();

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    const handleSubmit = () => {
        runWorker((e) => {
            //code to execute in parallel
            value = ...

            //expected return value
            return value;
        });
    };

    ...
};
```
<br/>

### Asynchronous
```
import useWorker from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorker(async (e) => {
        //code to execute in parallel
        value = await ...

        //expected return value
        return value;
    });

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    ...
};
```

or

```
import useWorker from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error, runWorker] = useWorker();

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    const handleSubmit = () => {
        runWorker(async (e) => {
            //code to execute in parallel
            value = await ...

            //expected return value
            return value;
        });
    };

    ...
};
```
<br/><br/>

## Specifications
### Parameters

| Argument | Type | Description |
| -------- | ---- | ----------- |
| `fn(e)`  | `(e: any) => T \| null \| void \| Promise<T \| null \| void>` | Function that needs to be run in parallel. *Provides reference to the web worker event.* |

<br/>

### Return

| Return | Type | Description |
| -------- | ---- | ----------- |
| `status`  | `'busy' \| 'success' \| 'error'` | Status of worker thread. |
| `data`  | `T \| null \| undefined \| Promise<T \| null \| undefined>` | Data returned from worker thread. *T references Generic type for typescript* |
| `error`  | `Error \| null` | Exception thrown by worker thread. |