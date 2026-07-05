import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://localhost:5000"

def make_request(path, method="GET", data=None, expected_status=200):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
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
    print("Starting Week 4 Backend API Verification...")
    print("------------------------------------------")
    
    # 1. GET /api/advisories -> list all, return 200
    ok, advisories = make_request("/api/advisories", expected_status=200)
    if not ok or not isinstance(advisories, list) or len(advisories) < 5:
        print(f"[FAIL]: List advisories size was {len(advisories) if advisories else 'None'}, expected >= 5.")
        return
    print(f"Found {len(advisories)} seeded advisories.")
    
    # 2. GET /api/advisories/search?q=Rajma -> search, return 200
    ok, search_results = make_request("/api/advisories/search?q=Rajma", expected_status=200)
    if not ok or len(search_results) == 0:
        print("[FAIL]: Search for 'Rajma' returned no results.")
        return
    print(f"Search for 'Rajma' returned {len(search_results)} results.")

    # 3. GET /api/advisories/filter?status=open -> filter, return 200
    ok, filter_results = make_request("/api/advisories/filter?status=open", expected_status=200)
    if not ok or len(filter_results) == 0:
        print("[FAIL]: Filter by status='open' returned no results.")
        return
    print(f"Filter by status='open' returned {len(filter_results)} results.")

    # 4. POST /api/advisories -> create, return 201
    new_advisory_payload = {
        "query": "How to treat black spots on ginger leaves in Almora terraces?",
        "crop": "Ginger",
        "advice": "Apply organic neem cake and improve soil drainage. Avoid high moisture retention.",
        "status": "open"
    }
    ok, new_adv = make_request("/api/advisories", method="POST", data=new_advisory_payload, expected_status=201)
    if not ok or "id" not in new_adv:
        print("[FAIL]: Creation of new advisory failed.")
        return
    new_id = new_adv["id"]
    print(f"Created new advisory with ID: {new_id}")

    # 5. GET /api/advisories/{id} -> single; 200 if found
    ok, retrieved_adv = make_request(f"/api/advisories/{new_id}", expected_status=200)
    if not ok or retrieved_adv["crop"] != "Ginger":
        print("[FAIL]: Retrieved advisory crop name mismatch.")
        return

    # 6. PUT /api/advisories/{id} -> update; 200 on success
    update_payload = {
        "status": "resolved",
        "advice": "Apply organic neem cake and improve soil drainage. Also apply Panchagavya spray."
    }
    ok, updated_adv = make_request(f"/api/advisories/{new_id}", method="PUT", data=update_payload, expected_status=200)
    if not ok or updated_adv["status"] != "resolved" or "Panchagavya" not in updated_adv["advice"]:
        print("[FAIL]: Update advisory check failed.")
        return

    # 7. DELETE /api/advisories/{id} -> delete; 204 on success
    ok, _ = make_request(f"/api/advisories/{new_id}", method="DELETE", expected_status=204)
    if not ok:
        print("[FAIL]: Delete advisory failed.")
        return

    # 8. GET /api/advisories/{id} after delete -> 404
    ok, error_detail = make_request(f"/api/advisories/{new_id}", expected_status=404)
    if not ok:
        print("[FAIL]: Deleted advisory check did not return 404.")
        return

    # 9. POST /api/advisories with invalid body -> 400 (originally 422, converted to 400 by exception handler)
    invalid_payload = {
        "query": "",  # Empty query violating min_length
        "crop": "Tomato",
        "advice": "Too short",
        "status": "invalid_status_value" # Invalid status literal
    }
    ok, err_resp = make_request("/api/advisories", method="POST", data=invalid_payload, expected_status=400)
    if not ok:
        print("[FAIL]: Validation error test did not return 400.")
        return

    print("------------------------------------------")
    print("ALL WEEK 4 BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
