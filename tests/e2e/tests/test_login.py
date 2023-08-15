import os

from pages.login import LoginPage
from pages.dashboard import DashboardPage


def test_login(unauthenticated_browser):
    """
    Test the login functionality with valid user credentials
    """
    browser = unauthenticated_browser
    # Get environment variables
    base_url = os.environ.get('BASE_URL')
    username = os.environ.get('LOGIN_USERNAME')
    password = os.environ.get('LOGIN_PASSWORD')

    # Navigate to login page
    browser.get(f"{base_url}/sign-in")
    login_page = LoginPage(browser)

    LoginPage.wait_for_login(browser)

    login_page.set_username(username)
    login_page.set_password(password)
    login_page.click_login()

    DashboardPage.wait_for_dashboard(browser)
