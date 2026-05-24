import urllib.request
import json
import socket

urls = [
    "https://hono.paraanaliz.workers.dev/api/market/symbol/THYAO",
    "https://hono.paraanaliz.workers.dev/api/market/symbol/THYAO/detail",
    "https://hono.paraanaliz.workers.dev/api/market/symbol/THYAO/ta/summary",
    "https://hono.paraanaliz.workers.dev/api/market/symbol/THYAO/history?limit=100",
]

for url in urls:
    print(f"Fetching {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Body (first 200 chars): {body[:200]}")
    except socket.timeout:
        print("Timeout reached!")
    except Exception as e:
        print(f"Error: {e}")
