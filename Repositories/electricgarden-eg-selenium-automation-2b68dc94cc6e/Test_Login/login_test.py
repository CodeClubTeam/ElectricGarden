#This a test for https://www.electricgarden.nz/contact/ 

from selenium import webdriver

# here is the webpage loaded through ChromeDriver
browser = webdriver.Chrome()
# browser.get('https://app.electricgarden.nz')
browser.get('https://login.microsoftonline.com/te/electricgarden.onmicrosoft.com/b2c_1_siupin/oauth2/v2.0/authorize?response_type=id_token&scope=openid%20profile&client_id=cbdc205d-0c66-4ca1-9c02-3260b3aebd1d&redirect_uri=https%3A%2F%2Fapp.electricgarden.nz&state=5a0f9f02-8e15-4ab5-9a7a-e0b45c6ad8cc&nonce=ef74db6d-b48b-4fc7-917c-ec4d9bbc1418&client_info=1&x-client-SKU=MSAL.JS&x-client-Ver=0.2.3&client-request-id=83eb43d2-f517-4659-b48e-e2c52044a4dd&prompt=select_account&response_mode=fragment')

# assert 'Electric Garden - Sign in' in browser.title

#login_button = browser.find_element_by_link_text('LOG IN')
#login_button.click()

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

