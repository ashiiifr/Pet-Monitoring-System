import requests

BASE_URL = "http://localhost:5000/api"
AUTH_URL = "http://localhost:5000/api/auth"

def run_checks():
    print("--- STARTING AUDIT FIX VERIFICATION ---")
    
    # 1. Login
    try:
        session = requests.Session()
        res = session.post(f"{AUTH_URL}/login", json={"email": "demo@petowner.com", "password": "demo123"})
        if res.status_code != 200:
            print(f"[FAIL] Login failed: {res.text}")
            return
        token = res.json()['token']
        headers = {"Authorization": f"Bearer {token}"}
        print("[PASS] Login successful")
    except Exception as e:
        print(f"[FAIL] Login Exception: {e}")
        try:
            print(f"Response Content: {res.text}")
        except:
            pass
        return

    # 2. Check Emergency Contacts CRUD
    print("\n[TEST] Emergency Contacts CRUD")
    contacts_url = f"{BASE_URL}/emergency-contacts"
    
    # Add
    res = requests.post(contacts_url, json={"name": "Test Contact", "phone": "123-456", "relation": "Tester"}, headers=headers)
    if res.status_code == 201:
        cid = res.json()['id']
        print("[PASS] Added Contact")
    else:
        print(f"[FAIL] Add Contact: {res.status_code} {res.text}")
        cid = None

    # Get
    res = requests.get(contacts_url, headers=headers)
    if res.status_code == 200 and len(res.json()) > 0:
        print("[PASS] Retrieved Contacts")
    else:
        print(f"[FAIL] Get Contacts: {res.status_code} {res.text}")
        
    # Delete
    if cid:
        res = requests.delete(f"{contacts_url}/{cid}", headers=headers)
        if res.status_code == 200:
            print("[PASS] Deleted Contact")
        else:
             print(f"[FAIL] Delete Contact: {res.status_code} {res.text}")

    # 3. Check PDF Endpoint
    print("\n[TEST] PDF Generation")
    # Get a pet first
    res = requests.get(f"{BASE_URL}/pets", headers=headers)
    if res.status_code == 200 and len(res.json()) > 0:
        pet_id = res.json()[0]['id']
        # Try PDF
        res = requests.get(f"{BASE_URL}/pets/{pet_id}/dossier", headers=headers)
        if res.status_code == 200 and b"%PDF" in res.content:
             print("[PASS] PDF Generated successfully")
        else:
             print(f"[FAIL] PDF Generation: {res.status_code} (Content-Type: {res.headers.get('content-type')})")
    else:
        print("[WARN] No pets found to test PDF")

    print("\n--- AUDIT VERIFICATION COMPLETE ---")

if __name__ == "__main__":
    run_checks()
