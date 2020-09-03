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

class XHREventTarget implements XMLHttpRequestEventTarget {
    onprogress: (event: ProgressEvent) => void = null;
    onload: (event: ProgressEvent) => void = null;
    onloadstart: (event: ProgressEvent) => void = null;
    onloadend: (event: ProgressEvent) => void = null;
    onreadystatechange: (event: ProgressEvent) => void = null;
    onerror: (event: ProgressEvent) => void = null;
    onabort: (event: ProgressEvent) => void = null;
    ontimeout: (event: ProgressEvent) => void = null;

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
    
    addEventListener(eventName: keyof XHRListeners, listener: (event: Event | ProgressEvent) => void) {
        this.listeners[eventName].push(listener);
        if (typeof Zone !== 'undefined') {
            this.zone = Zone.current;
        }
    }

    dispatchEvent(event: Event): boolean {
        this.fireEvent(event.type as keyof XHRListeners, event);
        return true;
    }

    removeEventListener(eventName: keyof XHRListeners) {
        this.listeners[eventName] = [];
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
        !!this.zone ? this.zone.run(func, this, [event]) : func.call(this, event);
    }
}

class XHR extends XHREventTarget implements XMLHttpRequest {
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
        this.dispatchEvent(new ProgressEvent('readystatechange'));
    }

    private _readyState = XMLHttpRequest.UNSENT;
    private path: string = null;
    private method: 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'TRACE' = null;
    private requestHeaders: {[header: string]: string} = {};
    private responseHeaders: {[header: string]: string} = {};
    private allResponseHeaders: string = null;

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
        this.readyState = XMLHttpRequest.LOADING;

        exec((response: XHRResponse) => {
            this.status = response.status;
            this.statusText = response.statusText;
            this.responseText = response.responseText;
            this.responseHeaders = response.responseHeaders;
            this.allResponseHeaders = response.allResponseHeaders;
            this.readyState = XMLHttpRequest.DONE;

            this.dispatchEvent(new ProgressEvent('load'));
            this.dispatchEvent(new ProgressEvent('loadend'));
        }, (error) => {
            this.dispatchEvent(new ProgressEvent('error'));
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

    private makeAbsolute(relativeUrl: string): string {
        var anchor = document.createElement('a');
        anchor.href = relativeUrl;
        return anchor.href;
    }
}

window.XMLHttpRequestEventTarget = XHREventTarget;

module.exports = XHR;
