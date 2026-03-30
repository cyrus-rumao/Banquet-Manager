from collections import defaultdict
from fastapi import FastAPI
import joblib
import pandas as pd
import json
 
app = FastAPI()
 
# load model
model = joblib.load("menu_model.pkl")
 
# load menu items
with open("menuItems_balanced_counts.json", "r") as f:
    menu_items = json.load(f)
 
# MENU LIMITS (IMPORTANT)
MENU_LIMITS = {
    "Standard": {"Starter":3,"Main Course":4,"Breads":2,"Rice & Biryani":2,"Dessert":2,"Beverage":2,"Live Counter":1,"Snacks":2,"Other":1},
    "Premium": {"Starter":4,"Main Course":5,"Breads":3,"Rice & Biryani":3,"Dessert":3,"Beverage":3,"Live Counter":2,"Snacks":3,"Other":2},
    "Elite": {"Starter":5,"Main Course":6,"Breads":3,"Rice & Biryani":3,"Dessert":4,"Beverage":4,"Live Counter":3,"Snacks":3,"Other":2},
}
 
@app.post("/recommend-menu")
def recommend(data: dict):
 
    tier = data["tier"]
    jain_percentage = data.get("jainPercentage", 0)   # ✅ correct
    headcount = data["headcount"]
    eventType = data["eventType"]
 
    # split items
    jain_items = [i for i in menu_items if i.get("isJain", False)]
    non_jain_items = [i for i in menu_items if not i.get("isJain", False)]
 
    # scoring function
    def score_items(items_list):
        scored = []
        for item in items_list:
            try:
                df = pd.DataFrame([{
                    "eventType": eventType,
                    "category": item["category"],
                    "selectionCount": item["selectionCount"],
                    "headcount": headcount
                }])
 
                prob = model.predict_proba(df)[0][1]
 
                scored.append({
                    "_id": str(item["_id"]),
                    "name": item["name"],
                    "category": item["category"],
                    "score": float(prob)
                })
            except:
                continue
        return scored
 
    # score separately
    scored_jain = score_items(jain_items)
    scored_non_jain = score_items(non_jain_items)
 
    # group by category
    jain_categories = defaultdict(list)
    non_jain_categories = defaultdict(list)
 
    for item in scored_jain:
        jain_categories[item["category"]].append(item)
 
    for item in scored_non_jain:
        non_jain_categories[item["category"]].append(item)
 
    limits = MENU_LIMITS[tier]
 
    menu1 = {}
    menu2 = {}
 
    for category in limits.keys():
 
        j_items = sorted(jain_categories.get(category, []), key=lambda x: x["score"], reverse=True)
        nj_items = sorted(non_jain_categories.get(category, []), key=lambda x: x["score"], reverse=True)
 
        limit = limits[category]
 
        # split based on percentage
        jain_limit = int(limit * jain_percentage / 100)
        if jain_percentage > 0:
            jain_limit = max(1, jain_limit)  # ensure at least 1 Jain item
 
        non_jain_limit = limit - jain_limit
 
        # MENU 1 (top items)
        menu1_items = j_items[:jain_limit] + nj_items[:non_jain_limit]
 
        # MENU 2 (next batch, no overlap)
        menu2_items = (
            j_items[jain_limit:jain_limit*2] +
            nj_items[non_jain_limit:non_jain_limit*2]
        )
 
        menu1[category] = menu1_items
        menu2[category] = menu2_items
 
    return {
        "menu1": menu1,
        "menu2": menu2
    }
 