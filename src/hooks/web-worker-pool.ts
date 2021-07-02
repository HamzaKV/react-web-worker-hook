import { useState, useEffect, useRef } from 'react';
import {
    default as Worker,
    TWorkerArgs,
    TWorkerFunction,
    TWebWorkerReturn,
} from '../services/web-worker';

//function to execute worker type
export type TRunWorkerFunction<T> = (
    workers: number,
    fn: TWorkerFunction<T>,
    args?: TWorkerArgs
) => void;

//hook return type
export type TState<T> = {
    status: 'busy' | 'success' | 'error';
    data: T | null | undefined;
    error: Error | null;
}[];

//dependencies for hook type
export type TDependency = any[] | null | undefined;

const useWorkerPool = <T>(
    fn?: TWorkerFunction<T>,
    dependencies?: TDependency,
    args?: TWorkerArgs,
    workers?: number
): [
    state: TState<T>,
    runWorkerPool: TRunWorkerFunction<T>
] => {
    const [state, setState] = useState<TState<T>>([]);
    const workerPool = useRef<TWebWorkerReturn<T>[]>([]);

    const onError = (i: number, e: any) =>
        setState(prev => {
            const tmp = [...prev];

            tmp[i] = { status: 'error', error: e, data: null };

            return tmp;
        });

    const onMsg = (i: number, e: any) =>
        setState(prev => {
            const tmp = [...prev];

            tmp[i] = { status: 'success', error: null, data: e.data };

            return tmp;
        });

    const runWorkerPool: TRunWorkerFunction<T> = (workers, fn, args) => {
        if (window.Worker && workers > 0) {
            for (let i = 0; i < workers; i++) {
                workerPool.current.push(
                    Worker(
                        (e) => onMsg(i, e),
                        (e) => onError(i, e),
                        fn,
                        args
                    )
                );
                workerPool.current[i].execute();
            }
        } else {
            setState(new Array(workers).fill({
                status: 'error',
                error: new Error('Web Worker Not supported'),
                data: null,
            }));
        }
    };

    useEffect(() => {
        if (fn && workers) runWorkerPool(workers, fn, args);
    }, dependencies ?? []);

    useEffect(() => {
        //cleanup
        return () => {
            for (const worker of workerPool.current) {
                worker.cleanup();
            }
        };
    }, []);

    return [state, runWorkerPool];
};

export default useWorkerPool;
