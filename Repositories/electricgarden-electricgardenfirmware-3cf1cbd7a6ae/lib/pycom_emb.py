import pycom


class Pycom:
  def __init__(self):
    pass

  def nvs_set(self,key,value):
    try:
      pycom.nvs_set(key, value)
    except:
      #Log
      return
    return

  def nvs_get(self,key):
    try:
      value = pycom.nvs_get(key)
    except:
      return None
    return value

  def nvs_erase(self,key):
    pycom.nvs_erase(key)
    return

  def nvs_erase_all(self):
    pycom.nvs_erase_all()
    return

  def nvs_load(self,values):
    pass
