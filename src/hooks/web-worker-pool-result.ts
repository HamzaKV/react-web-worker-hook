import { useState, useEffect } from 'react';
import { TWorkerArgs, TWorkerFunction } from '../services/web-worker';
import {
    default as useWorkerPool,
    TRunWorkerFunction,
    TDependency
} from './web-worker-pool';

//hook return type
type TState<T> = {
    status: 'busy' | 'success' | 'error';
    data: (T | null | undefined)[];
    error: Error | null;
};

const useWorkerPoolResult = <T>(
    fn?: TWorkerFunction<T>,
    dependencies?: TDependency,
    args?: TWorkerArgs,
    workers?: number
): [
    status: TState<T>['status'],
    data: TState<T>['data'],
    error: TState<T>['error'],
    runWorker: TRunWorkerFunction<T>
] => {
    const [state, setState] = useState<TState<T>>({
        status: 'busy',
        error: null,
        data: [],
    });

    const [poolState, runWorkerPool] = useWorkerPool(
        fn,
        dependencies,
        args,
        workers
    );

    useEffect(() => {
        let bool = true;
        for (const worker of poolState) {
            if (worker?.status === 'error') {
                setState({
                    status: 'error',
                    error: worker.error,
                    data: [],
                });
                bool = false;
                break;
            }
        }
        if (poolState.length === workers && bool) {
            setState({
                status: 'success',
                error: null,
                data: poolState.map((d) => d?.data),
            });
        }
    }, [poolState]);

    return [state.status, state.data, state.error, runWorkerPool];
};

export default useWorkerPoolResult;
