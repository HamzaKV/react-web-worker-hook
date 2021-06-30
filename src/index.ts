import { useState, useEffect, useRef } from 'react';

//arguments to be passed to worker function type
type TWorkerArgs = {
    [key: string]:
        | string
        | number
        | TWorkerArgs
        | Array<string | number | TWorkerArgs>;
} | null | undefined;

//return type of function to be executed within worker
type TWorkerFunctionReturn<T> = T | null | void;

//function to be executed within worker type
type TWorkerFunction<T> = (
    e?: any,
    args?: TWorkerArgs
) => TWorkerFunctionReturn<T> | Promise<TWorkerFunctionReturn<T>>;

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
    const worker = useRef<Worker>();

    const onError = (e: any) =>
        setState({ status: 'error', error: e, data: null });

    const onMsg = (e: any) =>
        setState({ status: 'success', error: null, data: e.data });

    const runWorker: TRunWorkerFunction<T> = (fn, args) => {
        // eslint-disable-next-line max-len
        const blob = new Blob([`onmessage = async (e) => { const args = ${args ? JSON.stringify(args) : null}; const fn = ${fn}; const data = await fn(e, args); postMessage(data); };`,]);
        // Obtain a blob URL reference to our worker 'file'.
        const blobURL = window.URL.createObjectURL(blob);
        if (window.Worker) {
            worker.current = new Worker(blobURL);
            worker.current.addEventListener('message', onMsg, false);
            worker.current.addEventListener('error', onError, false);
            worker.current.postMessage('');
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
    }, dependencies ?? []);

    useEffect(() => {
        //cleanup
        return () => {
            if (worker.current) {
                worker.current.removeEventListener('error', onError, false);
                worker.current.removeEventListener('message', onMsg, false);
                worker.current.terminate();
            }
        };
    }, []);

    return [state.status, state.data, state.error, runWorker];
};

export default useWorker;
