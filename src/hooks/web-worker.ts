import { useState, useEffect, useRef } from 'react';
import {
    default as Worker,
    TWorkerArgs,
    TWorkerFunction,
    TWebWorkerReturn
} from '../services/web-worker';

//function to execute worker type
type TRunWorkerFunction<T> = (
    fn: TWorkerFunction<T>,
    args?: TWorkerArgs
) => void;

//hook return type
type TState<T> = {
    status: 'busy' | 'success' | 'error';
    data: T | null | undefined;
    error: Error | null;
};

//dependencies for hook type
type TDependency = any[] | null | undefined;

const useWorker = <T>(
    fn?: TWorkerFunction<T>,
    dependencies?: TDependency,
    args?: TWorkerArgs
): [
    status: TState<T>['status'],
    data: TState<T>['data'],
    error: TState<T>['error'],
    runWorker: TRunWorkerFunction<T>
] => {
    const [state, setState] = useState<TState<T>>({
        status: 'busy',
        data: null,
        error: null,
    });
    const worker = useRef<TWebWorkerReturn<T>>();

    const onError = (e: any) =>
        setState({ status: 'error', error: e, data: null });

    const onMsg = (e: any) =>
        setState({ status: 'success', error: null, data: e.data });

    const runWorker: TRunWorkerFunction<T> = (fn, args) => {
        if (window.Worker) {
            worker.current = Worker(onMsg, onError, fn, args);
            worker.current.execute();
        } else {
            setState({
                status: 'error',
                error: new Error('Web Worker Not supported'),
                data: null,
            });
        }
    };

    useEffect(() => {
        if (fn) runWorker(fn, args);
        
        //cleanup
        return () => {
            worker.current?.cleanup();
            worker.current = undefined;
        };
    }, dependencies ?? []);

    return [state.status, state.data, state.error, runWorker];
};

export default useWorker;
