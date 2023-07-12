class Pycom:
  def __init__(self):
    self.Store = {}

  def nvs_set(self,key,value):
    self.Store.update( {key : value} )

  def nvs_get(self,key):
    return self.Store.get(key)

  def nvs_erase(self,key):
    del self.Store[key]

  def nvs_erase_all(self):
    self.Store.clear()

  def nvs_load(self,values):
    for key in values.keys():
      self.Store.update( {key : values[key]} )
