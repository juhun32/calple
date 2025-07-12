#!/usr/bin/env python3
"""
Backend connectivity test script for Calple
This script helps debug the 500 error by testing various endpoints
"""

import requests
import json
import sys
import os


def test_endpoint(url, description, expected_status=200):
    """Test a single endpoint"""
    print(f"\n Testing {description}")
    print(f"   URL: {url}")

    try:
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")

        if response.status_code == expected_status:
            print(f"   ✅ {description} - PASSED")
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    data = response.json()
                    print(f"   Response: {json.dumps(data, indent=2)}")
                except:
                    print(f"   Response: {response.text[:200]}...")
        else:
            print(
                f"   {description} - FAILED (expected {expected_status}, got {response.status_code})")
            print(f"   Response: {response.text[:200]}...")

    except requests.exceptions.RequestException as e:
        print(f"   {description} - ERROR: {e}")

    return response.status_code == expected_status


def main():
    # Get backend URL from environment or use default
    backend_url = os.getenv('BACKEND_URL', 'https://api.calple.date')
    print(f" Testing Calple Backend")
    print(f"   Backend URL: {backend_url}")
    print(f"   Environment: {os.getenv('ENV', 'unknown')}")

    # Test basic connectivity
    tests = [
        (f"{backend_url}/health", "Health Check"),
        (f"{backend_url}/api/health/firebase", "Firebase Connectivity"),
    ]

    passed = 0
    total = len(tests)

    for url, description in tests:
        if test_endpoint(url, description):
            passed += 1

    print(f"\n Test Results: {passed}/{total} passed")

    if passed == total:
        print(" All tests passed! Backend appears to be working correctly.")
    else:
        print(" Some tests failed. Check the backend logs for more details.")
        print("\n Troubleshooting tips:")
        print("   1. Check if the backend server is running")
        print("   2. Verify Firebase credentials are properly configured")
        print("   3. Check backend logs for detailed error messages")
        print("   4. Ensure environment variables are set correctly")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
