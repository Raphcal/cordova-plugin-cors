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
    response?: string;
    responseText?: string;
    responseHeaders: {[header: string]: string};
    allResponseHeaders: string;
}

interface FormDataEntry {
    type: 'string' | 'file';
    key: string;
    value: string;
    fileName?: string;
    mimeType?: string;
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
    response: any = null;
    responseText: string = null;
    responseXML: Document = null;

    set responseType(responseType: XMLHttpRequestResponseType) {
        if (this.status >= XHR.LOADING) {
            throw new DOMException('Object state must be unsent, opened or headers received.', 'InvalidStateError');
        }
        this._responseType = responseType.toLowerCase() as XMLHttpRequestResponseType;
    }
    get responseType() {
        return this._responseType;
    }
    private _responseType: XMLHttpRequestResponseType = '';

    // TODO: Support these.
    timeout = 60;
    withCredentials = false;
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
    private requestHeaders: {[header: string]: string} = {'User-Agent': navigator.userAgent};
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

    send(data?: string | Document | FormData | ArrayBufferView | ArrayBuffer | Blob | URLSearchParams | ReadableStream<Uint8Array>) {
        if (this.readyState !== XMLHttpRequest.OPENED) {
            if (this.readyState === XMLHttpRequest.UNSENT) {
                throw new DOMException('State is UNSENT but it should be OPENED.', 'InvalidStateError');
            }
            throw new DOMException('The object is in an invalid state (should be OPENED).', 'InvalidStateError');
        }
        this.readyState = XMLHttpRequest.LOADING;

        let promise: Promise<string | Document | ArrayBufferView | ArrayBuffer | Blob | URLSearchParams | ReadableStream<Uint8Array> | FormDataEntry[]>;
        if (data instanceof FormData) {
            this.requestHeaders['Content-Type'] = 'multipart/form-data';
            promise = this.requestBodyWithFormData(data);
        } else {
            promise = Promise.resolve(data);
        }

        promise.then(body => exec((response: XHRResponse) => {
            this.status = response.status;
            this.statusText = response.statusText;
            this.response = response.responseText;
            this.responseText = response.responseText;
            this.responseHeaders = response.responseHeaders;
            this.allResponseHeaders = response.allResponseHeaders;
            this.readyState = XMLHttpRequest.DONE;

            if (this.responseType === 'arraybuffer') {
                this.response = new Uint8Array(JSON.parse(response.response)).buffer;
            }

            this.dispatchEvent(new ProgressEvent('load'));
            this.dispatchEvent(new ProgressEvent('loadend'));
        }, (error) => {
            this.dispatchEvent(new ProgressEvent('error'));
            this.readyState = XMLHttpRequest.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders, body, this._responseType || 'text']));
    }

    abort() {
        // Ignored.
    }

    overrideMimeType(mimeType: string) {
        throw new Error('overrideMimeType method is not supported');
    }

    setRequestHeader(header: string, value?: string | number) {
        if (value != null) {
            this.requestHeaders[header] = `${value}`;
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

    /**
     * Creates the request body using the given form data.
     *
     * @param formData Form data to send.
     */
    private requestBodyWithFormData(formData: FormData) {
        const promises: Promise<FormDataEntry>[] = [];
        formData.forEach((value, key) => {
            if (XHR.isFile(value)) {
                promises.push(new Promise((resolve, reject) => {
                    const fileReader = new FileReader();
                    fileReader.onload = () => {
                        resolve({
                            type: 'file',
                            key,
                            value: XHR.toBase64(fileReader.result as string),
                            fileName: value.name,
                            mimeType: value.type
                        });
                    };
                    fileReader.onerror = () => {
                        reject(fileReader.error);
                    };
                    fileReader.readAsDataURL(value);
                }));
            } else {
                promises.push(Promise.resolve({
                    type: 'string',
                    key,
                    value
                }));
            }
        });
        return Promise.all(promises);
    }

    /**
     * Convert the given data URL into a properly encoded base64 string.
     * Removes the `data:` prefixe and adds the padding.
     *
     * @param dataURL Data URL to convert.
     */
    private static toBase64(dataURL: string) {
        dataURL = dataURL.replace(/^data:.*?base64,/, '');
        switch (dataURL.length % 4) {
            case 2:
                return dataURL + '==';
            case 3:
                return dataURL + '=';
            default:
                return dataURL;
        }
    }

    /**
     * Returns `true` if `value` is an instance of `File`.
     * Not using `instanceof` because of Cordova custom File type.
     * @see https://github.com/Raphcal/cordova-plugin-cors/issues/5
     *
     * @param value Value to evaluate.
     */
    private static isFile(value: File | string): value is File {
        return typeof value === 'object'
            && 'name' in value
            && 'type' in value;
    }
}

window.XMLHttpRequestEventTarget = XHREventTarget;

module.exports = XHR;
