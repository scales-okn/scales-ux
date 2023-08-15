import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from pages.notebook import NotebookPage

notebook_name = "selenium test notebook"


def test_create_notebook(authenticated_browser):
    browser = authenticated_browser
    base_url = os.environ.get('BASE_URL')

    browser.get(f"{base_url}")
    notebook_page = NotebookPage(browser, notebook_name)

    notebook_page.wait_for_notebook_dashboard()
    notebook_page.click_create_notebook()

    notebook_page.wait_for_notebook_create()
    notebook_page.set_title()
    notebook_page.click_create()

    notebook_page.wait_for_notebook_panel()
    notebook_page.click_add_panel()

    notebook_page.wait_for_notebook_start_exploring()
    notebook_page.click_start_exploring()

    notebook_page.wait_for_notebook_expand_to_browse_data()
    notebook_page.click_expand_to_browse_data()


def test_delete_notebook(authenticated_browser):
    browser = authenticated_browser
    base_url = os.environ.get('BASE_URL')

    browser.get(f"{base_url}")
    notebook_page = NotebookPage(browser, notebook_name)

    notebook_page.wait_for_new_notebook()
    notebook_page.click_new_notebook()

    notebook_page.wait_for_new_notebook_opened()
    notebook_page.click_delete()

    notebook_page.wait_for_delete_modal()
    notebook_page.click_confirm_delete()

    time.sleep(1)

    browser.get(f"{base_url}")
    notebook_page.confirm_delete()
