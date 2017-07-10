var exec = require('cordova/exec');
// TODO: Implement XMLHttpRequest instead of XMLHttpRequestEventTarget
var XHR = (function () {
    function XHR() {
        this.UNSENT = 0;
        this.OPENED = 1;
        this.HEADERS_RECEIVED = 2;
        this.LOADING = 3;
        this.DONE = 4;
        this.status = 0;
        this.statusText = null;
        this.responseText = null;
        this.responseXML = null;
        // TODO: Support these.
        this.timeout = 60;
        this.withCredentials = false;
        this.onprogress = null;
        this.onload = null;
        this.onloadstart = null;
        this.onloadend = null;
        this.onreadystatechange = null;
        this.onerror = null;
        this.onabort = null;
        this.ontimeout = null;
        this._readyState = this.UNSENT;
        this.path = null;
        this.method = null;
        this.requestHeaders = {};
        this.responseHeaders = {};
        this.allResponseHeaders = null;
        this.listeners = {
            progress: [],
            load: [],
            loadstart: [],
            loadend: [],
            readystatechange: [],
            error: [],
            abort: [],
            timeout: []
        };
    }
    Object.defineProperty(XHR.prototype, "response", {
        get: function () {
            return this.responseText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XHR.prototype, "readyState", {
        get: function () {
            return this._readyState;
        },
        set: function (readyState) {
            this._readyState = readyState;
            var event = document.createEvent('Event');
            event.initEvent('readystatechange', false, false);
            this.fireEvent('readystatechange', event);
        },
        enumerable: true,
        configurable: true
    });
    XHR.prototype.open = function (method, path, async) {
        if (this.readyState !== this.UNSENT) {
            throw 'XHR is already opened';
        }
        this.readyState = this.OPENED;
        this.path = this.makeAbsolute(path);
        this.method = method;
    };
    XHR.prototype.send = function (data) {
        var _this = this;
        if (this.readyState !== this.OPENED) {
            if (this.readyState === this.UNSENT) {
                throw 'XHR is not opened';
            }
            throw 'XHR was already sent';
        }
        this.zone = Zone ? Zone.current : undefined;
        this.readyState = this.LOADING;
        exec(function (response) {
            _this.status = response.status;
            _this.statusText = response.statusText;
            _this.responseText = response.responseText;
            _this.responseHeaders = response.headers;
            _this.allResponseHeaders = response.allResponseHeaders;
            _this.readyState = _this.DONE;
            var event = document.createEvent('Event');
            event.initEvent('Load', false, false);
            _this.fireEvent('load', event);
            _this.fireEvent('loadend', event);
        }, function (error) {
            var event = document.createEvent('Event');
            event.initEvent('error', true, false);
            _this.fireEvent('error', event);
            _this.readyState = _this.DONE;
        }, 'CORS', 'send', [this.method, this.path, this.requestHeaders]);
    };
    XHR.prototype.abort = function () {
        // Ignored.
    };
    XHR.prototype.overrideMimeType = function (mimeType) {
        throw 'Not supported';
    };
    XHR.prototype.setRequestHeader = function (header, value) {
        if (value) {
            this.requestHeaders[header] = value;
        }
        else {
            delete this.requestHeaders[header];
        }
    };
    XHR.prototype.getResponseHeader = function (header) {
        return this.responseHeaders[header];
    };
    XHR.prototype.getAllResponseHeaders = function () {
        return this.allResponseHeaders;
    };
    XHR.prototype.addEventListener = function (eventName, listener) {
        this.listeners[eventName].push(listener);
    };
    XHR.prototype.removeEventListener = function (eventName) {
        this.listeners[eventName] = [];
    };
    XHR.prototype.makeAbsolute = function (relativeUrl) {
        var anchor = document.createElement('a');
        anchor.href = relativeUrl;
        return anchor.href;
    };
    XHR.prototype.fireEvent = function (eventName, event) {
        this.call(this['on' + eventName], event);
        for (var _i = 0, _a = this.listeners[eventName]; _i < _a.length; _i++) {
            var listener = _a[_i];
            this.call(listener, event);
        }
    };
    XHR.prototype.call = function (func, event) {
        if (!func) {
            return;
        }
        this.zone ? this.zone.run(func, this, [event]) : func.bind(this)(event);
    };
    return XHR;
}());
module.exports = XHR;
