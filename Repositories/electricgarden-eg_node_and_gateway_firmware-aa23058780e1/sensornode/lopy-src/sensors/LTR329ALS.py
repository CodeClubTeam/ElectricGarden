from .I2CSensor import I2CSensor
from I2CManager import I2CManager
from micropython import const
from time import sleep_ms

# Registers
REG_ALS_CONTR = const(0x80)
REG_ALS_MEAS = const(0x85)
REG_PART_ID = const(0x86)
REG_MANU_ID = const(0x87)
REG_DATA_CH1_LOW = const(0x88)
REG_DATA_CH1_HIGH = const(0x89)
REG_DATA_CH0_LOW = const(0x8A)
REG_DATA_CH0_HIGH = const(0x8B)
REG_STATUS = const(0x8C)

# Register fields            REG         MASK        LSHIFT (Should be equal to the leading 0s in the mask)
FIELD_ALS_CONTR_GAIN = (REG_ALS_CONTR, const(0b11100), 2)
FIELD_ALS_CONTR_MODE = (REG_ALS_CONTR, const(0b1), 0)
FIELD_ALS_MEAS_INTEG = (REG_ALS_MEAS, const(0b111000), 3)
FIELD_ALS_MEAS_RATE  = (REG_ALS_MEAS, const(0b111), 0)
FIELD_PART_ID        = (REG_PART_ID, const(0b11110000), 4)
FIELD_PART_REV       = (REG_PART_ID, const(0b1111), 0)
FIELD_MANUFAC        = (REG_MANU_ID, 7, 0)
FIELD_CH1_HIGH       = (REG_DATA_CH1_HIGH, 7, 0)
FIELD_CH1_LOW        = (REG_DATA_CH1_LOW, 7, 0)
FIELD_CH0_HIGH       = (REG_DATA_CH0_HIGH, 7, 0)
FIELD_CH0_LOW        = (REG_DATA_CH0_LOW, 7, 0)
FIELD_STATUS_VALID   = (REG_STATUS, 0b10000000, 7)
FIELD_STATUS_GAIN    = (REG_STATUS, 0b01110000, 4)
FIELD_STATUS_DATA    = (REG_STATUS, 0b00000100, 2)

# Register field values
V_CONTR_GAIN_1 = const(0)
V_CONTR_GAIN_2 = const(1)
V_CONTR_GAIN_4 = const(2)
V_CONTR_GAIN_8 = const(3)
V_CONTR_GAIN_48 = const(6)
V_CONTR_GAIN_96 = const(7)

V_CONTR_MODE_STBY = const(0)
V_CONTR_MODE_ACTV = const(1)

V_MEAS_INTEG_100 = const(0)
V_MEAS_INTEG_50 = const(1)
V_MEAS_INTEG_200 = const(2)
V_MEAS_INTEG_400 = const(3)
V_MEAS_INTEG_150 = const(4)
V_MEAS_INTEG_250 = const(5)
V_MEAS_INTEG_300 = const(6)
V_MEAS_INTEG_350 = const(7)

V_MEAS_RATE_50 = const(0)
V_MEAS_RATE_100 = const(1)
V_MEAS_RATE_200 = const(2)
V_MEAS_RATE_500 = const(3)
V_MEAS_RATE_1000 = const(4)
V_MEAS_RATE_2000 = const(5) # (values 6 and 7 are also update rate 2000ms)

V_STATUS_VALID = const(0)
V_STATUS_INVALID = const(1)

V_STATUS_GAIN_1 = const(0)
V_STATUS_GAIN_2 = const(1)
V_STATUS_GAIN_4 = const(2)
V_STATUS_GAIN_8 = const(3)
V_STATUS_GAIN_48 = const(6)
V_STATUS_GAIN_96 = const(7)

V_STATUS_DATA_NEW = const(1)
V_STATUS_DATA_OLD = const(0)

V_CHANNEL_0 = const(0)
V_CHANNEL_1 = const(1)

LUX_SATURATED = -1
LUX_DARK = -2

class LTR329ALS(I2CSensor):

    name = "LTR-329ALS Optical Sensor"
    description = "LTR-329ALS-01 Linear response I2C light sensor."

    def __init__(self, bus, address):
        I2CSensor.__init__(self, bus, address)
        self.last_reading = (None, None, None)
    
    def _read_register(self, register):
        return I2CSensor.read_mem(self, register, 1)[0]
    
    def _set_register(self, register, value):
        return I2CSensor.write_mem(self, register, bytes([value]))        

    def _set_field(self, register_field, value):
        register, mask, lshift = register_field
        register_value = self._read_register(register)
        # Clear all bits in mask. shift value, mask value, OR it in to register value.
        # Reminder of presedence for groking this line,
        # not (~) occurs first, then shift (<<)
        # and takes place (&), finally or (|):
        register_value = register_value & ~mask | value << lshift & mask
        self._set_register(register, register_value)
    
    def _get_field(self, register_field):
        register, mask, rshift = register_field
        # Field reads are debounced, provided the mask is different :)
        # This lets you read all the fields from a register with memoised data.
        # But still read the same field over and over again with fresh data.
        last_register, last_value, last_mask = self.last_reading
        if last_register == register and last_mask != mask:
            register_value = last_value
        else:
            register_value = self._read_register(register)
            self.last_reading = (register, register_value, mask)
        return (register_value & mask) >> rshift
    
    def _set_gain(self, v_contr_gain_x):
        self._set_field(FIELD_ALS_CONTR_GAIN, v_contr_gain_x)
    
    def _set_mode(self, v_contr_mode_x):
        self._set_field(FIELD_ALS_CONTR_MODE, v_contr_mode_x)
    
    def _set_integration_time(self, v_meas_integration_x):
        self._set_field(FIELD_ALS_MEAS_INTEG, v_meas_integration_x)
    
    def _get_integration_time(self):
        return self._get_field(FIELD_ALS_MEAS_INTEG)
    
    def _set_measurement_rate(self, v_meas_rate_x):
        self._set_field(FIELD_ALS_MEAS_RATE, v_meas_rate_x)
    
    def _get_measurement_rate(self):
        return self._get_field(FIELD_ALS_MEAS_RATE)
    
    def _data_valid(self):
        """ Checks if the data stored is valid. (Conversion completd) """
        return self._get_field(FIELD_STATUS_VALID) == V_STATUS_VALID
    
    def _data_gain(self):
        return self._get_field(FIELD_STATUS_GAIN)
    
    def _data_new(self):
        return self._get_field(FIELD_STATUS_DATA) == V_STATUS_DATA_NEW
    
    def _read_channel(self, v_channel_x):
        if v_channel_x == V_CHANNEL_0:
            high, low = FIELD_CH0_HIGH, FIELD_CH0_LOW
        elif v_channel_x == V_CHANNEL_1:
            high, low = FIELD_CH1_HIGH, FIELD_CH1_LOW
        return self._get_field(high) << 8 | self._get_field(low)
    
    def _read_channels(self):
        """ Channel 1 needs to be read before Channel 0 to ensure the locking occurs in the right order """
        return self._read_channel(V_CHANNEL_1), self._read_channel(V_CHANNEL_0)
    
    def _read_channels_metadata(self):
        """ Returns tuple (Is Valid, Measured Gain, Is New) """
        return self._data_valid(), self._data_gain(), self._data_new()
    
    def _channels_to_wavelength(self, ch1_raw_i16, ch0_raw_i16, gain, integration_ms):
        if 0xFFFF in [ch0_raw_i16, ch1_raw_i16]:
            # Sensor was saturated, not useful.
            return LUX_SATURATED
        if 0x0000 in [ch0_raw_i16, ch1_raw_i16]:
            # Too dark to make any useful value
            return LUX_DARK
        if gain != V_STATUS_GAIN_1 or integration_ms != V_MEAS_INTEG_100:
            raise NotImplementedError('I cannot handle the gain and integration values provided')
        # Wavelength
        return -1

    def _capture_reading(self, gain, integration):
        # Try make a reading
        self._set_gain(gain)
        self._set_measurement_rate(V_MEAS_RATE_50)
        self._set_integration_time(integration)
        # Wait for clarification that we have captured valid, new data at gain
        integration_setting = self._get_integration_time()
        sleep_duration = self._integration_milliseconds(integration_setting)
        sleep_ms(sleep_duration)
        ch1_raw, ch0_raw = self._read_channels()
        # OPT: Work out the exact order the sampling takes place, and make less I2C calls.
        tries = 5
        while self._read_channels_metadata() != (True, gain, True) and tries > 0: # Metadata tells you data about what was is in the buffer
            sleep_ms(sleep_duration)
            self._read_channels()
            tries -= 1 
        if tries <= 0:
            # There may be other reasons this fails, but this seems to be the most likely.
            # If the data is consistently invalid, I postulate that the ADC is overflowing.
            return LUX_SATURATED, LUX_SATURATED                
        ch1_raw, ch0_raw = self._read_channels()
        return ch1_raw, ch0_raw

    def _correct_capture_set(self, dataset, gain, integration):
        # drop the bad values
        dataset = filter(lambda ch: ch[0] > 7 and ch[1] > 7, dataset)
        # adjust for gain and integration time
        dataset = map(lambda ch: (self._channel_lux_correction(ch[0], gain, integration), self._channel_lux_correction(ch[1], gain, integration)), dataset)
        return list(dataset)
    
    def _make_capture_set(self, gain, integration, samples=3):
        return self._correct_capture_set((self._capture_reading(gain, integration) for _ in range(samples)), gain, integration)

    def _select_capture_pair(self, dataset):
        """ Takes the median of each pair in the dataset """
        ch1_pairs = sorted(map(lambda tup: tup[0], dataset))
        ch0_pairs = sorted(map(lambda tup: tup[1], dataset))
        ch1_med = ch1_pairs[1] if len(ch1_pairs) == 3 else 0.5 * (ch1_pairs[1] + ch1_pairs[0])
        ch0_med = ch0_pairs[1] if len(ch0_pairs) == 3 else 0.5 * (ch0_pairs[1] + ch0_pairs[0])
        return ch1_med, ch0_med

    def _capture_wide_band(self):
        hi_light = self._make_capture_set(V_CONTR_GAIN_1, V_MEAS_INTEG_100)
        if len(hi_light) > 1:
            ch1, ch0 = self._select_capture_pair(hi_light)
            return ch1, ch0, V_CONTR_GAIN_1, V_MEAS_INTEG_100
        med_light = self._make_capture_set(V_CONTR_GAIN_4, V_MEAS_INTEG_100)
        if len(med_light) > 1:
            ch1, ch0 = self._select_capture_pair(med_light)
            return ch1, ch0, V_CONTR_GAIN_4, V_MEAS_INTEG_100
        low_light = self._make_capture_set(V_CONTR_GAIN_96, V_MEAS_INTEG_400)
        if len(low_light) > 1:
            ch1, ch0 = self._select_capture_pair(low_light)
            return ch1, ch0, V_CONTR_GAIN_96, V_MEAS_INTEG_400

        return LUX_DARK, LUX_DARK, V_CONTR_GAIN_1, V_MEAS_INTEG_100
    
    def _gain_const_multiplier(self, gain):
        if gain == V_CONTR_GAIN_2:
            return 2
        if gain == V_CONTR_GAIN_4:
            return 4
        if gain == V_CONTR_GAIN_8:
            return 8
        if gain == V_CONTR_GAIN_48:
            return 48
        if gain == V_CONTR_GAIN_96:
            return 96
        return 1

    def _integration_milliseconds(self, integration):
        return [100, 50, 200, 400, 150, 250, 300, 350][integration]
    
    def _integration_const_multiplier(self, integration):
        return 100 / self._integration_milliseconds(integration)

    def _channel_lux_correction(self, raw, gain, integration):
        return raw * self._integration_const_multiplier(integration) / self._gain_const_multiplier(gain)

    def _spectral_ratio(self, ch1, ch0):
        return ch1 / ch0

    def _read_luxes(self):
        ch1_lux, ch0_lux, _, __ = self._capture_wide_band()
        return ch1_lux, ch0_lux, self._spectral_ratio(ch1_lux, ch0_lux)

    def _read(self):
        with I2CSensor.claim(self):
            # Read a full gain range, and then read a closer value if its dark.
            self._set_mode(V_CONTR_MODE_ACTV)
            ch1, ch0, spectral = self._read_luxes()
            return ch1, ch0, spectral

    
    def read(self):
        ch1, ch0, _ = self._read()
        return 0.5 * (ch1 + ch0)