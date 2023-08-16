from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class NotebookPage:
    def __init__(self, browser, notebook_name):
        self.browser = browser
        self.notebook_name = notebook_name

    def set_title(self):
        self.browser.find_element(By.XPATH, "//input[@placeholder='Notebook Title']").send_keys(self.notebook_name)

    def click_create_notebook(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Create Notebook')]").click()

    def click_create(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Create')]").click()

    def click_add_panel(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Add Panel')]").click()

    def click_start_exploring(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Start Exploring')]").click()

    def click_expand_to_browse_data(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), '(expand to browse data)')]").click()

    def click_delete(self):
        self.browser.find_element(By.XPATH, "//button[contains(text(), 'Delete')]").click()

    def click_confirm_delete(self):
        self.browser.find_element(By.CSS_SELECTOR, ".modal-footer > button.btn-danger").click()

    def click_new_notebook(self):
        self.browser.find_element(By.XPATH, f"//a[contains(text(), '{self.notebook_name}')]").click()

    def has_notebook_loaded(self):
        if self.browser.find_element(By.XPATH, "//button[contains(text(), 'Create Notebook')]"):
            return True
        else:
            return False

    def wait_for_notebook_dashboard(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_notebook_loaded())

    def has_notebook_create_loaded(self):
        if self.browser.find_element(By.XPATH, "//button[contains(text(), 'Create')]"):
            return True
        else:
            return False

    def wait_for_notebook_create(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_notebook_create_loaded())

    def has_notebook_panel_loaded(self):
        if self.browser.find_element(By.XPATH, "//button[contains(text(), 'Add Panel')]"):
            return True
        else:
            return False

    def wait_for_notebook_panel(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_notebook_panel_loaded())

    def has_notebook_start_exploring_loaded(self):
        if self.browser.find_element(By.XPATH, "//button[contains(text(), 'Start Exploring')]"):
            return True
        else:
            return False

    def wait_for_notebook_start_exploring(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_notebook_start_exploring_loaded())

    def has_notebook_expand_to_browse_data_loaded(self):
        if self.browser.find_element(By.XPATH, "//button[contains(text(), '(expand to browse data)')]"):
            return True
        else:
            return False

    def wait_for_notebook_expand_to_browse_data(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_notebook_expand_to_browse_data_loaded())

    def has_new_notebook_loaded(self):
        if self.browser.find_element(By.XPATH, f"//a[contains(text(), '{self.notebook_name}')]"):
            return True
        else:
            return False

    def wait_for_new_notebook(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_new_notebook_loaded())

    def has_new_notebook_opened(self):
        if self.browser.find_element(By.XPATH, f"//input[@value='{self.notebook_name}']"):
            return True
        else:
            return False

    def wait_for_new_notebook_opened(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_new_notebook_opened())

    def has_delete_modal_loaded(self):
        if self.browser.find_element(By.CSS_SELECTOR, ".modal-footer > button.btn-danger"):
            return True
        else:
            return False

    def wait_for_delete_modal(self):
        WebDriverWait(self.browser, 10).until(
            lambda b: self.has_delete_modal_loaded())

    def confirm_delete(self):
        WebDriverWait(self.browser, 10).until_not(
            EC.presence_of_element_located((By.XPATH, f"//a[contains(text(), '{self.notebook_name}')]")))