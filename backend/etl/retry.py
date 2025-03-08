import logging
import time
from urllib3.util.retry import Retry
from urllib.parse import unquote


class LoggingRetry(Retry):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("RetryLogger")
        self.logger.setLevel(logging.INFO)
        self._max_allowed_retries = kwargs.get("total", 0)

    def increment(
        self, method=None, url=None, response=None, error=None, *args, **kwargs
    ):
        """Called when a retry is needed"""
        # `Retry.total` counts down from `self._max_allowed_retries`.
        # Check if we've exhausted our retries.
        if self.total <= 0:
            self.logger.error(
                f"Max retries ({self._max_allowed_retries}) exceeded. Giving up."
            )
            return super().increment(
                method=method,
                url=url,
                response=response,
                error=error,
                *args,
                **kwargs,
            )

        current_attempt = self._max_allowed_retries - self.total + 1

        if response and hasattr(response, "status_code"):
            status = response.status_code
        else:
            status = "unknown"

        backoff = self.get_backoff_time()

        self.logger.warning(
            f"""
                  === Retry Attempt {current_attempt} of {self._max_allowed_retries} ===
                  URL: {unquote(url)}
                  Method: {method}
                  Status: {status}
                  Error: {str(error) if error else "no error"}
                  Backoff: {backoff} seconds
          """
        )

        # Sleep for backoff duration
        if backoff:
            time.sleep(backoff)

        # Call parent's increment to handle the retry logic
        return super().increment(
            method=method,
            url=url,
            response=response,
            error=error,
            *args,
            **kwargs,
        )

    def get_backoff_time(self):
        """
        Calculate the backoff time for the current retry attempt.
        Using *args to maintain compatibility with parent class calls.
        """
        current_attempt = self._max_allowed_retries - self.total
        if current_attempt <= 0:
            return 0
        # Calculate exponential backoff: 0, 2, 4, 8, 16 seconds
        return self.backoff_factor * (2 ** (current_attempt))

    def new(self, **kw):
        """Preserve initial total when copying the retry object"""
        obj = super().new(**kw)
        obj._max_allowed_retries = self._max_allowed_retries
        return obj
