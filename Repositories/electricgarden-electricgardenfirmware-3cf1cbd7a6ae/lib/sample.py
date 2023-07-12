class Sample:

  def TimeToInt(self,Time):
    try:
      Value=int(Time)
    except:
      Value=0x0000

    return int(Value)

  def LuxToInt(self,Lux):
    try:
      Reading=float("%0.0f"%float(Lux))
      Reading=Reading
      Value=int(Reading)
    except:
      Value=0x8000

    return Value #??int()

  def TemperatureToInt(self,Temperature):
    try:
      Reading=float("%0.1f"%float(Temperature))
      Reading=Reading*10
      Value=int(Reading)
    except:
      Value=0x8000

    return int(Value)

  def HumidityToInt(self,Humidity):
    try:
      Reading=float("%0.1f"%float(Humidity))
      Reading=Reading*10
      Value=int(Reading)
    except:
      Value=0x8000

    return int(Value)

  def BatteryToInt(self,Battery):
    try:
      Reading=float("%0.2f"%float(Battery))
      Reading=Reading*100
      Value=int(Reading)
    except:  
      Value=0x8000

    return int(Value)

  def IntToTime(self,Time):
    try:
      Value=str(int(Time))
    except:
      Value=str(0x0000)

    return Value

  def IntToLux(self,Lux):
    try:
      Value=str(float(Lux))
    except:
      Value=''

    return Value

  def IntToTemperature(self,Temperature):
    if Temperature==0x8000:
      return ''

    if Temperature>32767:
      Temperature -= 65536
    
    try:
      Reading=float(Temperature/10)
      Value=str(float("%0.1f"%Reading))
    except:
      Value=''

    return Value

  def IntToTemperatureEnc(self,Temperature):
    if Temperature!=0x8000 and Temperature>32767:
      Temperature -= 65536
    return int(Temperature)

  def IntToHumidity(self,Humidity):
    if Humidity==0x8000:
      return ''
    
    try:
      Reading=float(Humidity/10)
      Value=str(float("%0.1f"%Reading))
    except:
      Value=''

    return Value

  def IntToBattery(self,Battery):
    if Battery==0x8000:
      return ''

    try:   
      Reading=float(Battery/100)
      Value=str(float("%0.2f"%Reading))
    except:
      Value=''

    return Value

  def __init__(self,count='0',time='0',lux='0',ambient_temp='0',ambient_hum='0',soil_temp='0',soil_moisture='0',battery='0'):
    self.Measurements = {}
    self.Measurements['count'] = count
    self.Measurements['time'] = time
    self.Measurements['lux'] = lux
    self.Measurements['ambient_temp'] = ambient_temp
    self.Measurements['ambient_hum'] = ambient_hum
    self.Measurements['soil_temp'] = soil_temp
    self.Measurements['soil_moisture'] = soil_moisture
    self.Measurements['battery'] = battery
  
    self.Encoding = {}
    self.Encoding['count'] = int(count)
    self.Encoding['time'] = self.TimeToInt(time)
    self.Encoding['lux'] = self.LuxToInt(lux)
    self.Encoding['ambient_temp'] = self.TemperatureToInt(ambient_temp)
    self.Encoding['ambient_hum'] = self.HumidityToInt(ambient_hum)
    self.Encoding['soil_temp'] = self.TemperatureToInt(soil_temp)
    self.Encoding['soil_moisture'] = self.HumidityToInt(soil_moisture)
    self.Encoding['battery'] = self.BatteryToInt(battery)

    self.HexEncoding=''

    value=0
    value+=(int(count)&0x0000ffff)<<16
    value+=(self.TimeToInt(time)&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.LuxToInt(lux)&0x0000ffff)<<16
    value+=(self.TemperatureToInt(ambient_temp)&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.HumidityToInt(ambient_hum)&0x0000ffff)<<16
    value+=(self.TemperatureToInt(soil_temp)&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.HumidityToInt(soil_moisture)&0x0000ffff)<<16
    value+=(self.BatteryToInt(battery)&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

  def Load(self,count=0,time=0,lux=0,ambient_temp=0,ambient_hum=0,soil_temp=0,soil_moisture=0,battery=0):
    self.Measurements['count'] = str(count)
    self.Measurements['time'] = self.IntToTime(time)
    self.Measurements['lux'] = self.IntToLux(lux)
    self.Measurements['ambient_temp'] = self.IntToTemperature(ambient_temp)
    self.Measurements['ambient_hum'] = self.IntToHumidity(ambient_hum)
    self.Measurements['soil_temp'] = self.IntToTemperature(soil_temp)
    self.Measurements['soil_moisture'] = self.IntToHumidity(soil_moisture)
    self.Measurements['battery'] = self.IntToBattery(battery)
  
    self.Encoding['count'] = int(count)
    self.Encoding['time'] = int(time)
    self.Encoding['lux'] = int(lux)
    self.Encoding['ambient_temp'] = self.IntToTemperatureEnc(ambient_temp)
    self.Encoding['ambient_hum'] = int(ambient_hum)
    self.Encoding['soil_temp'] = self.IntToTemperatureEnc(soil_temp)
    self.Encoding['soil_moisture'] = int(soil_moisture)
    self.Encoding['battery'] = int(battery)
  
    self.HexEncoding=''

    value=0
    value+=(count&0x0000ffff)<<16
    value+=(time&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(lux&0x0000ffff)<<16
    value+=(ambient_temp&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(ambient_hum&0x0000ffff)<<16
    value+=(soil_temp&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(soil_moisture&0x0000ffff)<<16
    value+=(battery&0x0000ffff)
    self.HexEncoding=self.HexEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')
  
  def HexFormatForSending(self,RelativeTime):
    HexSendEncoding=''

    value=0
    value+=(self.Encoding['count']&0x0000ffff)<<16
    value+=RelativeTime&0x0000ffff
    HexSendEncoding=HexSendEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.Encoding['lux']&0x0000ffff)<<16
    value+=self.Encoding['ambient_temp']&0x0000ffff
    HexSendEncoding=HexSendEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.Encoding['ambient_hum']&0x0000ffff)<<16
    value+=self.Encoding['soil_temp']&0x0000ffff
    HexSendEncoding=HexSendEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    value=0
    value+=(self.Encoding['soil_moisture']&0x0000ffff)<<16
    value+=self.Encoding['battery']&0x0000ffff
    HexSendEncoding=HexSendEncoding+"{:>8}".format(hex(value)[2:]).replace(' ', '0')

    return HexSendEncoding

  def MeasurementSuccess(self):
    return self.Measurements['lux']!='' and self.Measurements['ambient_temp']!='' and self.Measurements['ambient_hum']!='' and self.Measurements['soil_temp']!='' and self.Measurements['soil_moisture']!='' and self.Measurements['battery']!=''
    

