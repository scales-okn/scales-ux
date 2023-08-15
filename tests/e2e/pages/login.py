from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait


class LoginPage:
    def __init__(self, browser):
        self.browser = browser

    def set_username(self, username):
        self.browser.find_element(By.NAME, "email").send_keys(username)

    def set_password(self, password):
        self.browser.find_element(By.NAME, "password").send_keys(password + Keys.RETURN)

    def click_login(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Sign in')]").click()

    @classmethod
    def has_login_loaded(cls, browser):
        if browser.find_element(By.NAME, 'password'):
            return True
        else:
            return False

    @classmethod
    def wait_for_login(cls, browser):
        WebDriverWait(browser, 10).until(
            lambda b: cls.has_login_loaded(b))
