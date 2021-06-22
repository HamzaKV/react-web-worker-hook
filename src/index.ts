import { useState, useEffect, useRef } from 'react';

const useWorker = <T>(
    fn?: (e: any) => void
): [
    status: string,
    data: T | null,
    error: Error | null,
    runWorker: () => void
] => {
    const [state, setState] = useState<{
        status: string;
        data: T | null;
        error: Error | null;
    }>({
        status: '',
        data: null,
        error: null,
    });
    const worker = useRef<Worker>();

    const onError = (e: any) =>
        setState({ status: 'error', error: e, data: null });

    const onMsg = (e: any) =>
        setState({ status: 'success', error: null, data: e.data });

    const runWorker = (fn?: (e: any) => void) => {
        const blob = new Blob([
            `onmessage = (e) => { const data = ${fn}(e); postMessage(data); };`,
        ]);
        // Obtain a blob URL reference to our worker 'file'.
        const blobURL = window.URL.createObjectURL(blob);
        worker.current = new Worker(blobURL);
        worker.current.addEventListener('message', onMsg, false);
        worker.current.addEventListener('error', onError, false);
        worker.current.postMessage('');
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