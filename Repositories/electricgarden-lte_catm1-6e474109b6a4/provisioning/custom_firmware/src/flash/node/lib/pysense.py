from pycoproc import Pycoproc

__version__ = '1.4.0'

class Pysense(Pycoproc):

    def __init__(self, i2c=None, sda='P21', scl='P20'):
        Pycoproc.__init__(self, i2c, sda, scl)
