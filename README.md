# react-web-worker-hooks
A React Hook for integrating web workers
<br/><br/>
To install:
- `yarn add react-web-worker-hooks`
- `npm install react-web-worker-hooks`

## Usage
```
import useWorker from 'react-web-worker-hooks';

export default () => {
    ...

    const [status, data, error] = useWorker(() => {
        //code to execute in parallel
        value = ...

        //expected return to use 
        return value;
    });

    useEffect(() => {
        //running tasks based on return value from worker
    }, [status, data, error]);

    ...
};
```

## Specifications

| Argument | Type | Description |
| -------- | ---- | ----------- |
| `fn(e)`  | function | Function that needs to be run in parallel. *Allows access to the websockets event.* |

***IMPORTANT***: function **must** be defined as specified in usage section and not to be passed as reference.