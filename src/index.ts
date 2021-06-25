import { useState, useEffect, useRef } from 'react';

type TWorkerFunctionReturn<T> = T | null | void;
type TWorkerFunction<T> = (
    e: any
) => TWorkerFunctionReturn<T> | Promise<TWorkerFunctionReturn<T>>;
type TRunWorkerFunction<T> = (fn: TWorkerFunction<T>) => void;
type TState<T> = {
    status: 'busy' | 'success' | 'error';
    data: T | null | undefined;
    error: Error | null;
};

const useWorker = <T>(
    fn?: TWorkerFunction<T>
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

    const runWorker: TRunWorkerFunction<T> = (fn) => {
        // eslint-disable-next-line max-len
        const blob = new Blob([`onmessage = async (e) => { const fn = ${fn}; const data = await fn(e); postMessage(data); };`,]);
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
        if (fn) runWorker(fn);

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