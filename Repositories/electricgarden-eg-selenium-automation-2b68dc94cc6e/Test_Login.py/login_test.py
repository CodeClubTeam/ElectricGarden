#This a test for https://www.electricgarden.nz/contact/ 

from selenium import webdriver

# here is the webpage loaded through ChromeDriver
browser = webdriver.Chrome()
browser.get('https://www.electricgarden.nz')

assert 'The Electric Garden' in browser.title

login_button = browser.find_element_by_link_text('LOG IN')
login_button.click()

# first_name = browser.find_element_by_name('fname')
# first_name.send_keys('Kattia')

# last_name = browser.find_element_by_name('lname')
# last_name.send_keys('Silva')

# email_address = browser.find_element_by_name('email')
# email_address.send_keys('kattia@codeclub.nz')

# subject = browser.find_element_by_id('text-yui_3_17_2_1_1535584344587_3144-field')
# subject.send_keys('Initial test by Kattia')

# msg = browser.find_element_by_id('textarea-yui_3_17_2_1_1535584344587_3145-field')
# msg.send_keys('This is an initial test')

submit_button = browser.find_element_by_id('GoogleExchange')
submit_button.click()

# browser.implicitly_wait(5) #10 seconds

# assert not submit_button.is_displayed()


browser.quit() 

