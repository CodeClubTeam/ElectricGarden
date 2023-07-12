import ucollections

def _getframe():
  MyTuple = ucollections.namedtuple("MyTuple", ("f_lineno"))
  return MyTuple("0")
  

