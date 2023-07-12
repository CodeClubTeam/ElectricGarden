import sys
import pycom

def save_error(error_message):
        filename='errors.txt'
        errors = open(filename, 'w')
        sys.print_exception(error_message, errors)
        sys.print_exception(error_message)
        errors.close()
        errors = open(filename, 'r')
        error_string = errors.read()
        #if error_string != pycom.nvs_get('error_new'):
        pycom.nvs_set('error_new', error_string)
        pycom.nvs_set('error_flag', str(1))    