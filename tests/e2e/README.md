# SCALES OKN E2E Selenium Tests

This project contains the Selenium tests for the SCALES OKN E2E tests.

## Getting Started

### Prerequisites

The following steps need to be peformed in the test/e2e directory.

1. Create a virtual environment and activate it

    ```bash
    python -m venv venv
    # Linux/Mac
    source venv/bin/activate
    # Windows
    venv\Scripts\activate.bat
    ```

1. Install the requirements

    ```bash
    pip install -r requirements.txt
    ```

1. Fill in .env file with the following based on the .env.example file


1. Run the tests
    
    ```bash
    python -m pytest
    ```