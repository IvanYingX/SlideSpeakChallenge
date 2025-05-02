from setuptools import setup, find_packages

setup(
    name="slidespeak_app",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.105.0",
        "uvicorn==0.24.0",
        "python-multipart==0.0.6",
        "websockets==11.0.3",
        "pydantic==2.5.2",
        "pytest==7.4.3",
        "httpx==0.25.2",
        "pytest-asyncio==0.21.1",
        "tenacity==8.2.3",
        "anyio==3.7.1",
        "prometheus-fastapi-instrumentator==7.1.0",
        "starlette==0.30.0"
    ],
)