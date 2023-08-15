import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from pages.login import LoginPage
from pages.dashboard import DashboardPage

chrome_options = webdriver.ChromeOptions()

if os.environ.get('HEADLESS') == 'true':
    chrome_options.add_argument("--headless")

chrome_options.add_argument("log-level=3")


@pytest.fixture(scope="module")
def authenticated_browser():
    browser = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    # Get environment variables
    base_url = os.environ.get('BASE_URL')
    username = os.environ.get('LOGIN_USERNAME')
    password = os.environ.get('LOGIN_PASSWORD')

    # Navigate to login page
    browser.get(f"{base_url}/sign-in")
    login_page = LoginPage(browser)

    WebDriverWait(browser, 10).until(
        lambda b: LoginPage.has_login_loaded(b))

    login_page.set_username(username)
    login_page.set_password(password)
    login_page.click_login()

    WebDriverWait(browser, 10).until(
        lambda b: DashboardPage.has_dashboard_loaded(b))
    yield browser
    browser.quit()


@pytest.fixture(scope="module")
def unauthenticated_browser():
    browser = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    yield browser
    browser.quit()
