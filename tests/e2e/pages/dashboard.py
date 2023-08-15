from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


class DashboardPage:
    def __init__(self, browser):
        self.browser = browser

    @classmethod
    def has_dashboard_loaded(cls, browser):
        """
        Test if the dashboard has loaded
        """
        if browser.find_element(By.XPATH, "//button[contains(text(), 'Create Notebook')]"):
            return True
        else:
            return False

    @classmethod
    def wait_for_dashboard(cls, browser):
        """
        Wait for the dashboard page to load
        """
        WebDriverWait(browser, 10).until(
            lambda b: cls.has_dashboard_loaded(b))
