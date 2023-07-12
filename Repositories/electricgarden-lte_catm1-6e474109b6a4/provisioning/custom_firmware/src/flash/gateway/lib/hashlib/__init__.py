try:
    raise ImportError("""
        Don't use MicroPython Hash Library, it only supports one hash object (It cannot maintain simultaneous hashing functions).
        This means HMAC fails to create both an inner and outer digest. TODO: Find a way to redesign HMAC, or find a fix for 
        MicroPython. Either way - using the software library instead works for now.

        https://github.com/pycom/pycom-micropython-sigfox/blob/76c694902910935eebe59e614a5483afdf66b32c/esp32/mods/moduhashlib.c#L181-L183
    """)
    import uhashlib
except ImportError:
    uhashlib = None

def init():
    for i in ("sha256",):
        c = getattr(uhashlib, i, None)
        if not c:
            c = __import__("_" + i, None, None, (), 1)
            c = getattr(c, i)
        globals()[i] = c

init()


def new(algo, data=b""):
    try:
        c = globals()[algo]
        return c(data)
    except KeyError:
        raise ValueError(algo)
