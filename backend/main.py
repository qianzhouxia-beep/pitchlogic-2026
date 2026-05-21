from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/api/live-match")
async def get_live_match():
    return {
        "teams": ["ARG", "FRA"],
        "score": [3, 3],
        "minute": 120,
        "is_golden_hour": True,
        "live_win_prob": 65,
        "stats": { "possession": [54, 46], "xG": [3.24, 2.11], "shots": [20, 10] }
    }

@app.get("/api/fixtures")
async def get_fixtures():
    return {
        "upcoming": [
            { "teams": ["BRA", "GER"], "time": "20:00" },
            { "teams": ["ENG", "ITA"], "time": "22:00" }
        ]
    }

@app.post("/api/predict")
async def predict(data: dict):
    return {
        "win_prob": [60, 25, 15],
        "score_prediction": "2-0",
        "status": "Quantum Stable"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
