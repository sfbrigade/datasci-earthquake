from fastapi import FastAPI
import asyncio
import sentry_sdk
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import (
    liquefaction_api,
    tsunami_api,
    soft_story_api,
    health_api,
)

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/docs", openapi_url="/openapi.json", redirect_slashes=False)

app.include_router(liquefaction_api.router)
app.include_router(tsunami_api.router)
app.include_router(soft_story_api.router)
app.include_router(health_api.router)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def main():
    """
    Initialize Sentry

    Per instructions at https://docs.sentry.io/platforms/python/
    """
    sentry_sdk.init(
        dsn="https://82c136a8209d345cd67d1d52dca576a7@o4507340843384832.ingest.us.sentry.io/4507858393366528",
    )


async def run_main():
    await main()

    # Flush Sentry events before closing the event loop
    await sentry_sdk.flush()

    # Close the event loop
    loop = asyncio.get_event_loop()
    loop.stop()


# Run the run_main coroutine
if __name__ == "__main__":
    asyncio.run(run_main())

