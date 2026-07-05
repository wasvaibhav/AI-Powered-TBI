import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional

# In-memory database
# Each item will look like:
# {
#     "id": str,
#     "query": str,
#     "crop": str,
#     "advice": str,
#     "status": str,
#     "createdAt": datetime
# }
_advisories: Dict[str, dict] = {}

# Seed data helper
def seed_data():
    samples = [
        {
            "query": "My Munsyari Rajma leaves have brown circular spots with yellow halos. What is this?",
            "crop": "Munsyari Rajma (Kidney Beans)",
            "advice": "This indicates Anthracnose, a common fungal disease in high-altitude, humid climates. Treatment: 1. Remove and destroy infected plant parts immediately. 2. Spray dilute copper hydroxide or a home-made bio-fungicide (Panchagavya or sour buttermilk spray) weekly. 3. Ensure proper spacing to improve ventilation under terraced rain conditions.",
            "status": "open",
            "createdAt": datetime(2026, 6, 15, 9, 30, 0, tzinfo=timezone.utc)
        },
        {
            "query": "How can I prevent codling moth infestations in my Ramgarh apple orchards organically?",
            "crop": "Apple",
            "advice": "To manage Codling Moth organically in Uttarakhand: 1. Deploy pheromone traps at 10-12 traps per acre to monitor and disrupt mating. 2. Wrap tree trunks with corrugated cardboard bands in July to trap pupating larvae; remove and burn them in winter. 3. Apply Neem Seed Kernel Extract (NSKE 5%) or spinosad sprays during peak larval activity (petal fall stage).",
            "status": "resolved",
            "createdAt": datetime(2026, 6, 20, 14, 15, 0, tzinfo=timezone.utc)
        },
        {
            "query": "Finger millet (Mandua) is developing white mold patches during storage. What is the solution?",
            "crop": "Mandua (Finger Millet)",
            "advice": "Storage mold is caused by high moisture content. Action plan: 1. Immediately spread the affected Mandua grains under the sun until the moisture level drops below 10-12%. 2. Store grains in airtight containers or metal bins rather than damp jute bags. 3. Mix in dried neem leaves or clean ash at a ratio of 1:100 to prevent insect and mold build-up.",
            "status": "resolved",
            "createdAt": datetime(2026, 6, 25, 11, 0, 0, tzinfo=timezone.utc)
        },
        {
            "query": "High-altitude tomatoes are showing dark brown spots on lower leaves, spreading upwards.",
            "crop": "Tomato",
            "advice": "This symptom points to Early Blight. To manage: 1. Prune the lower branches up to 1 foot from the ground to prevent soil-borne splash transmission. 2. Spray a biological fungicide containing Trichoderma viride or Bacillus subtilis. 3. Avoid overhead irrigation; water at the base to keep foliage dry.",
            "status": "open",
            "createdAt": datetime(2026, 7, 1, 8, 45, 0, tzinfo=timezone.utc)
        },
        {
            "query": "Gahat (Horsegram) leaves are turning yellow and growth is stunted on terraced slopes.",
            "crop": "Gahat (Horsegram)",
            "advice": "Yellowing and stunting in horsegram on sloped terraces often indicates nitrogen deficiency or root rot from poor drainage. Solutions: 1. Ensure terrace contour channels are clear so rainwater does not pool. 2. Apply well-rotted farmyard manure (FYM) mixed with bio-fertilizers like Rhizobium to fix nitrogen. 3. Avoid overwatering; horsegram is highly drought-tolerant and sensitive to waterlogging.",
            "status": "open",
            "createdAt": datetime(2026, 7, 3, 16, 20, 0, tzinfo=timezone.utc)
        }
    ]
    
    for sample in samples:
        id_str = str(uuid.uuid4())
        _advisories[id_str] = {
            "id": id_str,
            "query": sample["query"],
            "crop": sample["crop"],
            "advice": sample["advice"],
            "status": sample["status"],
            "createdAt": sample["createdAt"]
        }

# Initialize store with seed data
seed_data()

def get_all_advisories() -> List[dict]:
    # Return sorted by createdAt descending
    return sorted(_advisories.values(), key=lambda x: x["createdAt"], reverse=True)

def get_advisory_by_id(id_str: str) -> Optional[dict]:
    return _advisories.get(id_str)

def create_advisory(data: dict) -> dict:
    id_str = str(uuid.uuid4())
    new_advisory = {
        "id": id_str,
        "query": data["query"],
        "crop": data["crop"],
        "advice": data["advice"],
        "status": data.get("status", "open"),
        "createdAt": datetime.now(timezone.utc)
    }
    _advisories[id_str] = new_advisory
    return new_advisory

def update_advisory(id_str: str, data: dict) -> Optional[dict]:
    if id_str not in _advisories:
        return None
    
    advisory = _advisories[id_str]
    for key, value in data.items():
        if key in ["query", "crop", "advice", "status"]:
            advisory[key] = value
            
    _advisories[id_str] = advisory
    return advisory

def delete_advisory(id_str: str) -> bool:
    if id_str in _advisories:
        del _advisories[id_str]
        return True
    return False

def search_advisories(query_str: str) -> List[dict]:
    q = query_str.lower().strip()
    if not q:
        return get_all_advisories()
        
    results = []
    for adv in _advisories.values():
        if q in adv["query"].lower() or q in adv["crop"].lower() or q in adv["advice"].lower():
            results.append(adv)
            
    return sorted(results, key=lambda x: x["createdAt"], reverse=True)

def filter_advisories_by_status(status_str: str) -> List[dict]:
    results = [adv for adv in _advisories.values() if adv["status"] == status_str]
    return sorted(results, key=lambda x: x["createdAt"], reverse=True)
