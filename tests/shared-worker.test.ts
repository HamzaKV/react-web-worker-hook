import SharedWorker from '../src/services/shared-worker';

describe('Web Worker', () => {

    it('Test web worker', () => {
        const worker = SharedWorker();
        worker.create((e) => {
            expect(e.data).toBe('result');
        }, (e) => {
            expect(e).toThrowError();
        }, 'worker', {}, () => 'result');
        worker.execute();
    });
});