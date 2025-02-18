import requests
from requests.adapters import HTTPAdapter
from .retry import LoggingRetry
import logging


class SessionManager:
    """Handles HTTP session creation and configuration"""

    logger = logging.getLogger("SessionManager")

    @staticmethod
    def create_session(logger: logging.Logger = None) -> requests.Session:
        """Create a configured requests session with retry logic"""
        retry_strategy = LoggingRetry(
            total=5,
            backoff_factor=1,
            status_forcelist=[
                404,  # Not Found
                500,  # Internal Server Error
                502,  # Bad Gateway
                503,  # Service Unavailable
                504,  # Gateway Timeout
            ],
            allowed_methods=["GET"],
            raise_on_status=True,
            respect_retry_after_header=True,
        )

        # Create session with retry strategy
        session = requests.Session()
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)

        if logger:
            logger.info(
                f"Created new session with retry configuration:\n"
                f"Max retries: {retry_strategy.total}\n"
                f"Backoff factor: {retry_strategy.backoff_factor}\n"
                f"Status codes: {retry_strategy.status_forcelist}\n"
                f"Allowed methods: {retry_strategy.allowed_methods}\n"
                f"Respect retry after header: {retry_strategy.respect_retry_after_header}"
            )

        return session
