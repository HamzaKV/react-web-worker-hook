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

export type TSharedWebWorkerReturn<T> = {
    create: (
        onMsg: TOnMsgFunc,
        onError: TOnErrorFunc,
        fn: TWorkerFunction<T>,
        args?: TWorkerArgs
    ) => void;
    execute: () => void;
    cleanup: () => void;
};

const SharedWebWorker = <T>(
    onMsg?: TOnMsgFunc,
    onError?: TOnErrorFunc
): TSharedWebWorkerReturn<T> => {
    let _onMsg: TOnMsgFunc;
    let _onError: TOnErrorFunc;
    let worker: SharedWorker;

    const create = (
        onMsg: TOnMsgFunc, 
        onError: TOnErrorFunc, 
        sharedObj: any
    ) => {
        _onMsg = onMsg;
        _onError = onError;

        const privateObj = {
            connections: 0
        };

        const onconnect = (e: any, privateObj: any, sharedObj: any) => {
            let { connections } = privateObj;
            const [port] = e.ports;
            connections++;
            port.postMessage('Worker ' + connections + ' connected');

            // port.addEventListener(
            //     'message',
            //     (eventM: any) => {
            //         const data = eventM.data;
            //         port.postMessage(
            //             'from "clientPort": ' +
            //                 clientPort.toString() +
            //                 ', with love :)'
            //         );
            //     },
            //     false
            // );

            port.start();
        };

        const blob = new Blob([
            `const privateObj = ${
                JSON.stringify(privateObj)
            }; const sharedObj = ${JSON.stringify(
                sharedObj
            )}; onconnect = async (e) => { const fn = ${
                onconnect
            }; await fn(e, privateObj, sharedObj); } `,
        ]);

        const blobURL = window.URL.createObjectURL(blob);

        worker = new SharedWorker(blobURL);

        worker.port.onmessage = _onMsg;

        worker.port.addEventListener('error', _onError,false);
    };

    // if (onMsg && onError) create(onMsg, onError);

    const execute = () => {
        worker.port.start();
    };

    const cleanup = () => {
        worker.port.removeEventListener('message', _onMsg);
        worker.port.removeEventListener('error', _onError);
        worker.port.close();
    };

    return {
        create,
        execute,
        cleanup,
    };
};

export default SharedWebWorker;
