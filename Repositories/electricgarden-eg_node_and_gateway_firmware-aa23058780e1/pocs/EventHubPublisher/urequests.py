""" Micropython Requests Lib """
try:
    import socket as usocket # Nominal system
except:
    import usocket # Micropython

class Response:

    def __init__(self, f):
        self.raw = f
        self.encoding = "utf-8"
        self._cached = None

    def close(self):
        if self.raw:
            self.raw.close()
            self.raw = None
        self._cached = None

    @property
    def content(self):
        if self._cached is None:
            try:
                self._cached = self.raw.read()
            finally:
                self.raw.close()
                self.raw = None
        return self._cached

    @property
    def text(self):
        return str(self.content, self.encoding)

    def json(self):
        try:
            import json as ujson 
        except:
            import ujson
        return ujson.loads(self.content)
    
    def __repr__(self):
        status_justify = '[' + str(self.status_code)
        if self.status_code < 200 or self.status_code > 299:
            status_justify += '"' + self.reason + '"'
        status_justify += ']'
        return '<urequests.Response object: %s "%s">' % (status_justify, self.text)


def request(method, url, data=None, headers={}, stream=None):
    try:
        proto, dummy, host, path = url.split("/", 3)
    except ValueError:
        proto, dummy, host = url.split("/", 2)
        path = ""
    if proto == "http:":
        port = 80
    elif proto == "https:":
        try:
            import ssl as ussl 
        except:
            import ussl
        port = 443
    else:
        raise ValueError("Unsupported protocol: " + proto)

    if ":" in host:
        host, port = host.split(":", 1)
        port = int(port)

    ai = usocket.getaddrinfo(host, port, 0, usocket.SOCK_STREAM)
    ai = ai[0]

    s = usocket.socket(ai[0], ai[1], ai[2])
    try:
        s.connect(ai[-1])
        if proto == "https:":
            try:
                s = ussl.wrap_socket(s, server_hostname=host)
            except:
                s = ussl.wrap_socket(s)
        s.write(("%s /%s HTTP/1.0\r\n" % (method, path)).encode('utf-8'))
        if not "Host" in headers:
            s.write(("Host: %s\r\n" % host).encode('utf-8'))
        # Iterate over keys to avoid tuple alloc
        for k in headers:
            s.write(k.encode('utf-8'))
            s.write(b": ")
            s.write(headers[k].encode('utf-8'))
            s.write(b"\r\n")
        if data:
            s.write(b"Content-Length: %d\r\n" % len(data))
        s.write(b"\r\n")
        if data:
            print('Dispatching payload')
            print('Typeof {}'.format(type(data)))
            print('Value {}'.format(data))
            s.write(data)
        linereader = s
        try:
            linereader = linereader.makefile()
        except:
            pass
        l = linereader.readline()
        #print(l)
        l = l.split(None, 2)
        status = int(l[1])
        reason = ""
        if len(l) > 2:
            reason = l[2].rstrip()
        while True:
            l = linereader.readline()
            if type(l) == str:
                l = l.encode('utf-8')
            if not l or l == b"\r\n":
                break
            if l.startswith(b"Transfer-Encoding:"):
                if b"chunked" in l:
                    raise ValueError("Unsupported " + l)
            elif l.startswith(b"Location:") and not 200 <= status <= 299:
                raise NotImplementedError("Redirects not yet supported")
    except OSError:
        s.close()
        raise

    resp = Response(s)
    resp.status_code = status
    resp.reason = reason
    return resp


def head(url, **kw):
    return request("HEAD", url, **kw)

def get(url, **kw):
    return request("GET", url, **kw)

def post(url, **kw):
    return request("POST", url, **kw)

def put(url, **kw):
    return request("PUT", url, **kw)

def patch(url, **kw):
    return request("PATCH", url, **kw)

def delete(url, **kw):
    return request("DELETE", url, **kw)