import os
import sys
import subprocess
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_etl():
    """Run all ETL handlers locally by executing them as modules"""

    # Make sure we're running with correct environment
    os.environ["ENVIRONMENT"] = "dev"  # Use 'dev' for local testing

    # Change to the repo root directory
    repo_root = Path(__file__).parent.parent
    os.chdir(repo_root)

    etl_modules = [
        "backend.etl.tsunami_data_handler",
        "backend.etl.soft_story_properties_data_handler",
        "backend.etl.liquefaction_data_handler",
    ]

    for module in etl_modules:
        try:
            logger.info(f"Running ETL module: {module}")
            # Capture stdout (data flood) but let stderr show through
            result = subprocess.run(
                [sys.executable, "-m", module],
                check=True,
                stdout=subprocess.DEVNULL,
                text=True,
            )
            logger.info(f"✅ Completed ETL module: {module}")
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Error running {module} (return code: {e.returncode})")
            raise


if __name__ == "__main__":
    try:
        run_etl()
        logger.info("ETL process completed successfully")
    except Exception as e:
        logger.error(f"ETL process failed: {str(e)}")
        raise
