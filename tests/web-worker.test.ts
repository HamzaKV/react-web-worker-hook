import WebWorker from '../src/services/web-worker';

describe('Web Worker', () => {

    it('Test web worker', () => {
        WebWorker((e) => {
            expect(e.data).toBe('result');
        }, (e) => {
            expect(e).toThrowError();
        }, () => 'result').execute();
    });
});