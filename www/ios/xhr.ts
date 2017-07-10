declare var require: (module: string) => any;
declare var module: {
    exports: any;
};
interface Zone {
    run<T>(callback: Function, applyThis?: any, applyArgs?: any[], source?: string): T;
}
interface ZoneType {
    current: Zone;
}
declare const Zone: ZoneType;

const exec: (
    onsuccess: (value: any) => void,
    onerror: (error: any) => void,
    plugin: string,
    func: string,
    args: any[]) => void = require('cordova/exec');

interface XHRListeners {
    progress: ((event: ProgressEvent) => void)[];
    load: ((event: Event) => void)[];
    loadstart: ((event: Event) => void)[];
    loadend: ((event: ProgressEvent) => void)[];
    readystatechange: ((event: Event) => void)[];
    error: ((event: ErrorEvent) => void)[];
    abort: ((event: Event) => void)[];
    timeout: ((event: ProgressEvent) => void)[];
}

interface XHRResponse {
    status: number;
    statusText: string;
    responseText: string;
    headers: {[header: string]: string};
    allResponseHeaders: string;
}

// TODO: Implement XMLHttpRequest instead of XMLHttpRequestEventTarget
class XHR implements XMLHttpRequestEventTarget {
    UNSENT = 0;
    OPENED = 1;
    HEADERS_RECEIVED = 2;
    LOADING = 3;
    DONE = 4;
    status = 0;
    statusText: string = null;
    get response(): any {
        return this.responseText;
    }
    responseText: string = null;
    responseXML: string = null;
    // TODO: Support these.
    timeout = 60;
    withCredentials = false;

    get readyState(): number {
        return this._readyState;
    }
    set readyState(readyState: number) {
        this._readyState = readyState;
        const event = document.createEvent('Event');
        event.initEvent('readystatechange', false, false);
        this.fireEvent('readystatechange', event);
    }

    onprogress: (event: ProgressEvent) => void = null;
    onload: (event: Event) => void = null;
    onloadstart: (event: Event) => void = null;
    onloadend: (event: ProgressEvent) => void = null;
    onreadystatechange: (event: Event) => void = null;
    onerror: (event: Event) => void = null;
    onabort: (event: Event) => void = null;
    ontimeout: (event: ProgressEvent) => void = null;

    private _readyState = this.UNSENT;
    private path: string = null;
    private method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE' = null;
    private requestHeaders: {[header: string]: string} = {};
    private responseHeaders: {[header: string]: string} = {};
    private allResponseHeaders: string = null;

    private listeners: { [key: string]: ((event: Event | ProgressEvent) => void)[] } = {
        progress: [],
        load: [],
        loadstart: [],
        loadend: [],
        readystatechange: [],
        error: [],
        abort: [],
        timeout: []
    };

    private zone: Zone;

    open(method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE', path: string, async: boolean) {
        if (this.readyState !== this.UNSENT) {
            throw 'XHR is already opened';
        }
        this.readyState = this.OPENED;
        this.path = this.makeAbsolute(path);
        this.method = method;
    }

    send(data: string) {
        if (this.readyState !== this.OPENED) {
            if (this.readyState === this.UNSENT) {
                throw 'XHR is not opened';
            }
            throw 'XHR was already sent';
        }
        this.zone = Zone ? Zone.current : undefined;
        this.readyState = this.LOADING;

        exec((response: XHRResponse) => {
            this.status = response.status;
            this.statusText = response.statusText;
            this.responseText = response.responseText;
            this.responseHeaders = response.headers;
            this.allResponseHeaders = response.allResponseHeaders;
            this.readyState = this.DONE;

            const event = document.createEvent('Event');
            event.initEvent('Load', false, false);
            this.fireEvent('load', event);
            this.fireEvent('loadend', event);
        }, (error) => {
            const event = document.createEvent('Event');
            event.initEvent('error', true, false);
            this.fireEvent('error', event);
            this.readyState = this.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders]);
    }

    abort() {
        // Ignored.
    }

    overrideMimeType(mimeType: string) {
        throw 'Not supported';
    }

    setRequestHeader(header: string, value?: string) {
        if (value) {
            this.requestHeaders[header] = value;
        } else {
            delete this.requestHeaders[header];
        }
    }

    getResponseHeader(header: string): string {
        return this.responseHeaders[header];
    }

    getAllResponseHeaders(): string {
        return this.allResponseHeaders;
    }

    addEventListener(eventName: keyof XHRListeners, listener: (event: Event | ProgressEvent) => void) {
        this.listeners[eventName].push(listener);
    }

    removeEventListener(eventName: keyof XHRListeners) {
        this.listeners[eventName] = [];
    }

    private makeAbsolute(relativeUrl: string): string {
        var anchor = document.createElement('a');
        anchor.href = relativeUrl;
        return anchor.href;
    }

    private fireEvent(eventName: keyof XHRListeners, event: Event | ProgressEvent) {
        this.call(this['on' + eventName], event);
        for (const listener of this.listeners[eventName]) {
            this.call(listener, event);
        }
    }

    private call(func: Function, event: Event) {
        if (!func) {
            return;
        }
        this.zone ? this.zone.run(func, this, [event]) : func.bind(this)(event);
    }
}

module.exports = XHR;
