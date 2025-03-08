import time
import logging
import requests
from typing import Optional


class RequestHandler:
    """Handles HTTP requests with logging and error handling"""

    def __init__(
        self, session: requests.Session, logger: Optional[logging.Logger] = None
    ):
        self.session = session
        self.logger = logger or logging.getLogger(self.__class__.__name__)

    def make_request(self, url: str, params: dict, timeout: int = 60) -> dict:
        """
        Make HTTP request with error handling.
        Args:
            url: Request URL
            params: Query parameters
            timeout: Request timeout in seconds
        Returns:
            Response data as dictionary containing list of features under 'features' key.
        """
        start_time = time.time()
        try:
            self.logger.info(f"Making request to {url} with params {params}")

            response = self.session.get(url, params=params, timeout=timeout)
            self.logger.info(f"Got response with status: {response.status_code}")

            response.raise_for_status()
            try:
                data = response.json()
            except Exception as e:
                self.logger.error(f"Failed to parse JSON: {str(e)}")
                raise

            self.logger.info(
                f"Request completed successfully:\n"
                f"URL: {url}\n"
                f"Params: {params}\n"
                f"Time: {time.time() - start_time:.2f}s"
            )

            return data

        except Exception as e:
            self.logger.error(
                f"Request failed:\n"
                f"Error: {str(e)}\n"
                f"URL: {url}\n"
                f"Params: {params}\n"
                f"Time: {time.time() - start_time:.2f}s",
                exc_info=True,
            )
            raise
