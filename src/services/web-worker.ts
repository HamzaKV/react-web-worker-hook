export type TOnMsgFunc = (e?: any) => void;
export type TOnErrorFunc = (e?: any) => void;

//arguments to be passed to worker function type
export type TWorkerArgs =
    | {
          [key: string]:
              | string
              | number
              | TWorkerArgs
              | Array<string | number | TWorkerArgs>;
      }
    | null
    | undefined;

//return type of function to be executed within worker
export type TWorkerFunctionReturn<T> = T | null | void;

//function to be executed within worker type
export type TWorkerFunction<T> = (
    e?: any,
    args?: TWorkerArgs
) => TWorkerFunctionReturn<T> | Promise<TWorkerFunctionReturn<T>>;

export type TWebWorkerReturn<T> = {
    create: (
        onMsg: TOnMsgFunc,
        onError: TOnErrorFunc,
        fn: TWorkerFunction<T>,
        args?: TWorkerArgs
    ) => void;
    execute: () => void;
    cleanup: () => void;
    fallback: (fn: TWorkerFunction<T>, args?: TWorkerArgs) => Promise<any>;
};

const WebWorker = <T>(
    onMsg?: TOnMsgFunc,
    onError?: TOnErrorFunc,
    fn?: TWorkerFunction<T>,
    args?: TWorkerArgs
): TWebWorkerReturn<T> => {
    let _onMsg: TOnMsgFunc;
    let _onError: TOnErrorFunc;

    let worker: Worker;

    const create: TWebWorkerReturn<T>['create'] = (
        onMsg,
        onError,
        fn,
        args
    ) => {
        _onMsg = onMsg;
        _onError = onError;

        const blob = new Blob([
            // eslint-disable-next-line max-len
            `onmessage = async (e) => { const args = ${
                args ? JSON.stringify(args) : null
                // eslint-disable-next-line max-len
            }; const fn = ${fn}; const data = await fn(e, args); postMessage(data); };`,
        ]);
        // Obtain a blob URL reference to our worker 'file'.
        const blobURL = window.URL.createObjectURL(blob);
        worker = new Worker(blobURL);
        worker.addEventListener('message', _onMsg, false);
        worker.addEventListener('error', _onError, false);
    };

    // const verify = () => !!window.Worker;

    if (onMsg && onError && fn) create(onMsg, onError, fn, args);

    const execute: TWebWorkerReturn<T>['execute'] = () => {
        worker.postMessage('');
    };

    const cleanup: TWebWorkerReturn<T>['cleanup'] = () => {
        if (worker) {
            worker.removeEventListener('error', _onError, false);
            worker.removeEventListener('message', _onMsg, false);
            worker.terminate();
        }
    };

    const fallback: TWebWorkerReturn<T>['fallback'] = (fn, args) =>
        new Promise((resolve, reject) => {
            try {
                resolve(fn(args));
            } catch (err) {
                reject(err);
            }
        });

    return {
        create,
        execute,
        cleanup,
        fallback,
    };
};

export default WebWorker;
