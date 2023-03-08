
const OPTIONS = {
    requestCount: 5
};

function getHost(url) {
    if (typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        return a.host;
    }
    const urlArray = url.split('//');
    if (urlArray.length < 2) {
        return null;
    }
    let host = urlArray[1];
    host = host.substring(0, host.indexOf('/'));
    return host;
}

let uid = 0;

function uuid() {
    uid++;
    return uid;
}

export class FetchScheduler {
    constructor(options) {
        options = Object.assign({}, OPTIONS, options);
        this.options = options;
        this.hosts = {};
    }

    _checkHost(host) {
        if (!this.hosts[host]) {
            this.hosts[host] = {
                waitQueue: [],
                runingQueue: []
            };
        }
        return this;
    }

    _removePromise(promise) {
        const { host } = promise;
        if (!this.hosts[host]) {
            return this;
        }
        const { waitQueue, runingQueue } = this.hosts[host];
        let index = waitQueue.indexOf(promise);
        if (index > -1) {
            waitQueue.splice(index, 1);
        }
        index = runingQueue.indexOf(promise);
        if (index > -1) {
            runingQueue.splice(index, 1);
        }
        if (waitQueue.length === 0) {
            return this;
        }
        const p = waitQueue[0];
        waitQueue.splice(0, 1);
        runingQueue.push(p);
        p.start();
        p.isRuning = true;
        return this;
    }

    _createPromise(url, host, options) {
        const controller = new AbortController();
        const signal = controller.signal;
        options.signal = signal;
        const uid = uuid();

        let tResolve, tReject;
        const start = () => {
            fetch(url, options).then(res => {
                this._removePromise(promise);
                if (tResolve) {
                    tResolve(res);
                }
            }).catch(err => {
                this._removePromise(promise);
                if (tReject) {
                    tReject(err);
                }
            });
        };
        const promise = new Promise((resolve, reject) => {
            tResolve = resolve;
            tReject = reject;
        });
        promise.cancel = () => {
            if (promise.isRuning) {
                controller.abort();
            }
            this._removePromise(promise);
        };
        promise.start = start;
        promise.remove = () => {
            this.removeFetch(promise);
        };
        promise.uid = uid;
        promise.host = host;
        return promise;
    }

    createFetch(url, options = {}) {
        const host = getHost(url);
        if (!host) {
            console.error('not find host from', url);
            return this;
        }
        this._checkHost(host);
        const promise = this._createPromise(url, host, options);
        const { waitQueue, runingQueue } = this.hosts[host];
        if (runingQueue.length < this.options.requestCount) {
            runingQueue.push(promise);
            promise.start();
            promise.isRuning = true;
            return promise;
        }
        waitQueue.push(promise);
        return promise;
    }

    removeFetch(promise) {
        return this._removePromise(promise);
    }

    getCurrentInfo() {
        const hosts = this.hosts;
        const result = [];
        for (const host in hosts) {
            const info = {
                host,
                waitCount: hosts[host].waitQueue.length
            };
            result.push(info);
        }
        return result;
    }
}
