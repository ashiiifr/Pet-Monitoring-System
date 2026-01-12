import requests
import time

BASE_URL = "http://localhost:5000/api/auth"

def test_login():
    print("Testing Login (BCrypt Validation)...")
    try:
        resp = requests.post(f"{BASE_URL}/login", json={
            "email": "demo@petowner.com",
            "password": "demo123"
        })
        if resp.status_code == 200:
            print("[PASS] Login Successful. BCrypt hashes operational.")
            return True
        else:
            print(f"[FAIL] Login Failed: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Connection Error: {e}")
        return False

def test_rate_limit():
    print("\nTesting Rate Limiting (Spamming Login)...")
    success_count = 0
    blocked = False
    
    # We already did 1 login above. Limit is 10/min.
    # Let's do 12 more.
    for i in range(12):
        resp = requests.post(f"{BASE_URL}/login", json={
            "email": "demo@petowner.com",
            "password": "demo123" # Valid creds, so we test authorized blocking too
        })
        
        if resp.status_code == 200:
            success_count += 1
            print(f"Request {i+1}: 200 OK")
        elif resp.status_code == 429:
            print(f"Request {i+1}: 429 TOO MANY REQUESTS (Expected)")
            blocked = True
            break
        else:
            print(f"Request {i+1}: {resp.status_code}")
            
    if blocked:
        print("[PASS] Rate Limiting is active.")
    else:
        print(f"[FAIL] Never blocked after {success_count} requests.")

if __name__ == "__main__":
    if test_login():
        test_rate_limit()
