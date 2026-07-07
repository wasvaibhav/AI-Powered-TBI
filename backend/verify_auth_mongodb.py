import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:5000"

def make_request(path, method="GET", data=None, token=None, expected_status=200):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req_data = json.dumps(data).encode("utf-8") if data else None
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            status = res.status
            body = res.read().decode("utf-8")
            response_json = json.loads(body) if body else None
            
            if status != expected_status:
                print(f"[FAIL]: {method} {path} - Expected {expected_status}, got {status}")
                return False, None
            else:
                print(f"[PASS]: {method} {path} - Got {status}")
                return True, response_json
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode("utf-8")
        try:
            response_json = json.loads(body)
        except Exception:
            response_json = body
            
        if status != expected_status:
            print(f"[FAIL]: {method} {path} - Expected {expected_status}, got {status}. Error body: {body}")
            return False, response_json
        else:
            print(f"[PASS expected failure]: {method} {path} - Got expected status {status}. Error detail: {response_json}")
            return True, response_json
    except Exception as e:
        print(f"[FAIL]: {method} {path} - Network or other exception: {str(e)}")
        return False, None

def run_tests():
    print("Starting Week 5 Backend Auth & MongoDB Verification...")
    print("------------------------------------------")
    
    # 1. Sign up User A
    user_a_email = f"user_a_{int(time.time())}@test.com"
    signup_a_payload = {
        "name": "Supervisor A",
        "email": user_a_email,
        "phone": "9998887776",
        "password": "password123"
    }
    ok, resp_a = make_request("/api/auth/signup", method="POST", data=signup_a_payload, expected_status=201)
    if not ok or "token" not in resp_a:
        print("[FAIL]: User A signup failed.")
        return
    token_a = resp_a["token"]
    user_a_id = resp_a["user"]["id"]
    print(f"User A registered with ID: {user_a_id}")

    # 2. Sign up duplicate email
    ok, _ = make_request("/api/auth/signup", method="POST", data=signup_a_payload, expected_status=400)
    if not ok:
        print("[FAIL]: Duplicate email registration check failed.")
        return

    # 3. Log in User A
    login_payload = {
        "email": user_a_email,
        "password": "password123"
    }
    ok, resp_login = make_request("/api/auth/login", method="POST", data=login_payload, expected_status=200)
    if not ok or "token" not in resp_login:
        print("[FAIL]: Login failed.")
        return
    print("[PASS]: Login authenticated successfully.")

    # 4. Log in with wrong credentials
    bad_login_payload = {
        "email": user_a_email,
        "password": "wrongpassword"
    }
    ok, _ = make_request("/api/auth/login", method="POST", data=bad_login_payload, expected_status=401)
    if not ok:
        print("[FAIL]: Bad login credentials check failed.")
        return

    # 5. Access profile /api/auth/me
    ok, me_resp = make_request("/api/auth/me", token=token_a, expected_status=200)
    if not ok or me_resp["email"] != user_a_email:
        print("[FAIL]: /api/auth/me did not return correct user profile.")
        return
    print("[PASS]: Verified /api/auth/me profile access.")

    # 6. Verify protected route rejects anonymous requests
    ok, _ = make_request("/api/advisories", expected_status=401)
    if not ok:
        print("[FAIL]: Route protection failed to reject anonymous request.")
        return

    # 7. Create advisory for User A
    advisory_payload = {
        "query": "Leaf spots on user A's organic kidney beans",
        "crop": "Kidney Beans",
        "advice": "Prune leaves and apply bio-fungicide weekly",
        "status": "open"
    }
    ok, adv_a = make_request("/api/advisories", method="POST", data=advisory_payload, token=token_a, expected_status=201)
    if not ok or "id" not in adv_a:
        print("[FAIL]: Advisory creation for User A failed.")
        return
    adv_id = adv_a["id"]
    print(f"Created advisory {adv_id} for User A (linked to owner ID: {adv_a['userId']})")

    # 8. Sign up User B
    user_b_email = f"user_b_{int(time.time())}@test.com"
    signup_b_payload = {
        "name": "Supervisor B",
        "email": user_b_email,
        "phone": "8887776665",
        "password": "password123"
    }
    ok, resp_b = make_request("/api/auth/signup", method="POST", data=signup_b_payload, expected_status=201)
    if not ok:
        print("[FAIL]: User B signup failed.")
        return
    token_b = resp_b["token"]

    # 9. Verify User B dashboard is isolated (empty)
    ok, list_b = make_request("/api/advisories", token=token_b, expected_status=200)
    if not ok or len(list_b) != 0:
        print(f"[FAIL]: User B list was not empty. Found {len(list_b)} items.")
        return
    print("[PASS]: Verified data isolation - User B dashboard is empty.")

    # 10. Verify User B cannot retrieve User A's advisory (should return 404)
    ok, _ = make_request(f"/api/advisories/{adv_id}", token=token_b, expected_status=404)
    if not ok:
        print("[FAIL]: Access restriction check failed. User B retrieved User A's advisory.")
        return

    # 11. Verify User B cannot update User A's advisory (should return 404)
    update_payload = {
        "status": "resolved"
    }
    ok, _ = make_request(f"/api/advisories/{adv_id}", method="PUT", data=update_payload, token=token_b, expected_status=404)
    if not ok:
        print("[FAIL]: Edit restriction check failed. User B edited User A's advisory.")
        return

    # 12. Verify User B cannot delete User A's advisory (should return 404)
    ok, _ = make_request(f"/api/advisories/{adv_id}", method="DELETE", token=token_b, expected_status=404)
    if not ok:
        print("[FAIL]: Delete restriction check failed. User B deleted User A's advisory.")
        return

    # 13. Verify User A can update their own advisory
    ok, updated_adv = make_request(f"/api/advisories/{adv_id}", method="PUT", data={"status": "resolved"}, token=token_a, expected_status=200)
    if not ok or updated_adv["status"] != "resolved":
        print("[FAIL]: User A could not update their own advisory status.")
        return

    # 14. Verify User A can delete their own advisory
    ok, _ = make_request(f"/api/advisories/{adv_id}", method="DELETE", token=token_a, expected_status=204)
    if not ok:
        print("[FAIL]: User A could not delete their own advisory.")
        return

    # 15. Verify deleted advisory returns 404 for User A
    ok, _ = make_request(f"/api/advisories/{adv_id}", token=token_a, expected_status=404)
    if not ok:
        print("[FAIL]: Advisory was not deleted successfully.")
        return

    # 16. Verify chat history access
    ok, chat_logs = make_request("/api/chat/history", token=token_a, expected_status=200)
    if not ok or not isinstance(chat_logs, list):
        print("[FAIL]: Chat history call failed.")
        return
    print(f"[PASS]: Chat history fetched successfully. Found {len(chat_logs)} logs.")

    print("------------------------------------------")
    print("ALL WEEK 5 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
