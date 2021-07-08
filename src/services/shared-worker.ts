export type TOnMsgFunc = (e?: any) => void;
export type TOnErrorFunc = (e?: any) => void;

export type TSharedWebWorkerReturn = {
    create: (
        onMsg: TOnMsgFunc,
        onError: TOnErrorFunc,
        workerName: string,
        sharedObj?: any,
        fn?: (e: any, sharedObj: any) => any
    ) => void;
    execute: () => void;
    cleanup: () => void;
    dispatch: (message: any) => void;
};

const sharedWorkers = {};

const SharedWebWorker = (): TSharedWebWorkerReturn => {
    let _onMsg: TOnMsgFunc;
    let _onError: TOnErrorFunc;
    let worker: SharedWorker;

    const create = (
        onMsg: TOnMsgFunc,
        onError: TOnErrorFunc,
        workerName: string,
        sharedObj?: any,
        fn?: (e: any, sharedObj: any) => any
    ) => {
        _onMsg = onMsg;
        _onError = onError;

        let url = sharedWorkers[workerName];

        if (!!!url) {
            if (!!sharedObj && !!fn)
                url = sharedWorkers[workerName] = SWorker(sharedObj, fn);
            else 
                // eslint-disable-next-line max-len
                throw new Error('Trying to create a new worker file however required arguments are missing.');
        }

        //spawn worker
        worker = new SharedWorker(url);
        worker.port.onmessage = _onMsg;
        worker.port.addEventListener('error', _onError, false);
    };

    const execute = () => {
        //start worker
        worker.port.start();
    };

    const dispatch = (message: any ) => {
        worker.port.postMessage(message);
    };

    const cleanup = () => {
        //close worker
        worker.port.removeEventListener('message', _onMsg);
        worker.port.removeEventListener('error', _onError);
        worker.port.close();
    };

    return {
        create,
        execute,
        cleanup,
        dispatch
    };
};

const SWorker = (
    sharedObj: any,
    fn: (e: any, sharedObj: any) => any
): string => {
    const privateObj = {
        connections: 0,
        peers: [],
    };

    const onconnect = (
        e: any,
        privateObj: any,
        sharedObj: any,
        fn: (e: any, sharedObj: any) => any
    ) => {
        let { connections } = privateObj;
        const { peers } = privateObj;
        const [port] = e.ports;

        connections++;
        peers.push({
            connectionId: connections,
            port: port,
        });

        port.postMessage({
            connectionId: connections,
            type: 'CONNECTION',
        });

        port.addEventListener(
            'message',
            async (eventM: any) => {
                const data = await fn(eventM, sharedObj);

                peers
                    .filter((peer: any) => {
                        return peer.connectionId !== eventM.data.port;
                    })
                    .forEach((peer: any) => {
                        peer.port.postMessage({ 
                            data, 
                            sharedObj, 
                            type: 'UPDATE', 
                        });
                    });
            },
            false
        );

        port.start();
    };

    //instantiate worker
    const blob = new Blob([
        `const privateObj = ${JSON.stringify(
            privateObj
        )}; const sharedObj = ${JSON.stringify(
            sharedObj
        )}; onconnect = (e) => { const fn = ${
            onconnect
        }; fn(e, privateObj, sharedObj, ${fn}); } `,
    ]);
    const blobURL = window.URL.createObjectURL(blob);

    return blobURL;
};

export default SharedWebWorker;
