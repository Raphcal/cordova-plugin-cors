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
    responseHeaders: {[header: string]: string};
    allResponseHeaders: string;
}

class XHR implements XMLHttpRequest {
    static readonly UNSENT = 0;
    static readonly OPENED = 1;
    static readonly HEADERS_RECEIVED = 2;
    static readonly LOADING = 3;
    static readonly DONE = 4;

    readonly UNSENT = 0;
    readonly OPENED = 1;
    readonly HEADERS_RECEIVED = 2;
    readonly LOADING = 3;
    readonly DONE = 4;

    status = 0;
    statusText: string = null;
    get response(): any {
        return this.responseText;
    }
    responseText: string = null;
    responseXML: Document = null;

    // TODO: Support these.
    timeout = 60;
    withCredentials = false;
    responseType: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' = null;
    responseURL: string = null;
    upload: XMLHttpRequestUpload = null;
    msCachingEnabled = () => false;
    msCaching: string = null;
    // ---

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

    private _readyState = XMLHttpRequest.UNSENT;
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

    open(method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE', path: string) {
        if (this.readyState !== XMLHttpRequest.UNSENT) {
            throw 'XHR is already opened';
        }
        this.readyState = XMLHttpRequest.OPENED;
        this.path = this.makeAbsolute(path);
        this.method = method;
    }

    send(data?: Document | string | any) {
        if (this.readyState !== XMLHttpRequest.OPENED) {
            if (this.readyState === XMLHttpRequest.UNSENT) {
                throw new DOMException('State is UNSENT but it should be OPENED.', 'InvalidStateError');
            }
            throw new DOMException('The object is in an invalid state (should be OPENED).', 'InvalidStateError');
        }
        this.zone = typeof Zone !== 'undefined' ? Zone.current : undefined;
        this.readyState = XMLHttpRequest.LOADING;

        exec((response: XHRResponse) => {
            this.status = response.status;
            this.statusText = response.statusText;
            this.responseText = response.responseText;
            this.responseHeaders = response.responseHeaders;
            this.allResponseHeaders = response.allResponseHeaders;
            this.readyState = XMLHttpRequest.DONE;

            const event = document.createEvent('Event');
            event.initEvent('Load', false, false);
            this.fireEvent('load', event);
            this.fireEvent('loadend', event);
        }, (error) => {
            const event = document.createEvent('Event');
            event.initEvent('error', true, false);
            this.fireEvent('error', event);
            this.readyState = XMLHttpRequest.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders, data]);
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

    dispatchEvent(event: Event): boolean {
        this.fireEvent(event.type as 'progress' | 'load' | 'loadstart' | 'loadend' | 'readystatechange' | 'error' | 'abort' | 'timeout',
            event);
        return true;
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
        !!this.zone ? this.zone.run(func, this, [event]) : func.bind(this)(event);
    }
}

const XHREventTarget = function () {
    this.onload = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onreadystatechange = null;
    this.onerror = null;
    this.onabort = null;
    this.ontimeout = null;
};
XHREventTarget.prototype.addEventListener = XHR.prototype.addEventListener;
XHREventTarget.prototype.removeEventListener = XHR.prototype.removeEventListener;
window.XMLHttpRequestEventTarget = XHREventTarget;

module.exports = XHR;
