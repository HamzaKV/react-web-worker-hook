import { useEffect, useRef, useState } from 'react';
import {
    default as Worker,
    TSharedWebWorkerReturn,
} from '../services/shared-worker';

const useSharedWorker = (
    workerName: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    sharedObj?: any,
    fn?: (e: any, sharedObj: any) => any
): [
    string,
    any,
    Error | null,
    TSharedWebWorkerReturn['dispatch']
] => {
    const [state, setState] = useState({
        status: 'idle',
        data: null,
        error: null,
    });
    const worker = useRef<TSharedWebWorkerReturn>();

    const onMsg = (e: any) => 
        setState({ status: 'success', error: null, data: e.data });

    const onError = (e: any) => 
        setState({ status: 'error', error: e, data: null });

    useEffect(() => {
        worker.current = Worker();
        worker.current.create(onMsg, onError, workerName, sharedObj, fn);
        worker.current.execute();

        //cleanup
        return () => {
            worker.current?.cleanup();
        };
    }, []);

    const dispatch: TSharedWebWorkerReturn['dispatch'] = (message: any) => {
        setState(prev => ({ ...prev, status: 'sending' }));
        if (worker.current)
            worker.current?.dispatch(message);
        setTimeout(() => {
            setState(prev => ({ ...prev, status: 'sent' }));
        }, 100);
    };

    return [state.status, state.data, state.error, dispatch];
};

export default useSharedWorker;
