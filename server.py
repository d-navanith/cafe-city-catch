import os
import sys
import time
import json
import sqlite3
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DB_PATH = BASE_DIR / "leaderboard.db"

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            score INTEGER NOT NULL,
            character TEXT NOT NULL,
            items_caught INTEGER DEFAULT 0,
            survival_seconds INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# In-memory session store for anti-cheat verification
active_sessions = {}

def create_session():
    token = secrets.token_hex(16)
    active_sessions[token] = {
        "start_time": time.time(),
        "used": False
    }
    # Clean up old sessions (> 2 hours)
    now = time.time()
    for k in list(active_sessions.keys()):
        if now - active_sessions[k]["start_time"] > 7200:
            active_sessions.pop(k, None)
    return token

def record_score(session_id: str, nickname: str, score: int, character: str, items_caught: int, survival_seconds: int):
    nickname = (nickname or "Anonymous").strip()[:20]
    if not nickname:
        nickname = "Anonymous"
    
    # Session verification
    session = active_sessions.get(session_id)
    if not session:
        # Allow fallback session if not strictly found in dev
        pass
    elif session.get("used"):
        return {"error": "Session token already used", "status": 400}
    else:
        session["used"] = True
        elapsed = time.time() - session["start_time"]
        # Plausibility check: maximum theoretical score is ~35 points per second
        max_possible = int(elapsed * 45) + 60
        if score > max_possible and elapsed > 5:
            return {"error": "Suspicious score detected", "status": 400}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leaderboard (nickname, score, character, items_caught, survival_seconds)
        VALUES (?, ?, ?, ?, ?)
    """, (nickname, score, character, items_caught, survival_seconds))
    row_id = cursor.lastrowid
    conn.commit()

    # Calculate player's current rank
    cursor.execute("SELECT COUNT(*) FROM leaderboard WHERE score > ?", (score,))
    rank = cursor.fetchone()[0] + 1
    conn.close()

    return {"status": "success", "rank": rank, "nickname": nickname, "score": score}

def fetch_top_scores(limit: int = 10):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT nickname, score, character, items_caught, survival_seconds, strftime('%Y-%m-%d %H:%M', created_at)
        FROM leaderboard
        ORDER BY score DESC, survival_seconds DESC, id ASC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    leaderboard = []
    for rank, row in enumerate(rows, start=1):
        leaderboard.append({
            "rank": rank,
            "nickname": row[0],
            "score": row[1],
            "character": row[2],
            "items_caught": row[3],
            "survival_seconds": row[4],
            "date": row[5]
        })
    return leaderboard

# Try FastAPI if installed, otherwise fallback to built-in http.server
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    import uvicorn

    app = FastAPI(title="Paw Catch Leaderboard Server")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class ScoreRequest(BaseModel):
        session_id: str = ""
        nickname: str = "Player"
        score: int = 0
        character: str = "cat"
        items_caught: int = 0
        survival_seconds: int = 0

    @app.post("/api/session/start")
    async def api_start_session():
        token = create_session()
        return {"session_id": token, "timestamp": time.time()}

    @app.post("/api/score/submit")
    async def api_submit_score(payload: ScoreRequest):
        res = record_score(
            session_id=payload.session_id,
            nickname=payload.nickname,
            score=payload.score,
            character=payload.character,
            items_caught=payload.items_caught,
            survival_seconds=payload.survival_seconds
        )
        if "error" in res:
            raise HTTPException(status_code=res.get("status", 400), detail=res["error"])
        return res

    @app.get("/api/leaderboard")
    async def api_get_leaderboard(limit: int = 10):
        return {"leaderboard": fetch_top_scores(limit)}

    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="root_static")

    def run_fastapi():
        port = int(os.environ.get("PORT", 8000))
        print("\n=======================================================")
        print("[+] Catch-a-Paw Game Server running on FastAPI!")
        print(f"[*] Open in your browser: http://localhost:{port}")
        print("=======================================================\n")
        uvicorn.run(app, host="0.0.0.0", port=port)

    SERVER_RUNNER = run_fastapi

except ImportError:
    # Graceful fallback: Pure Python Standard Library HTTP Server
    from http.server import HTTPServer, SimpleHTTPRequestHandler
    import urllib.parse

    class GameRequestHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/api/leaderboard":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                data = {"leaderboard": fetch_top_scores(10)}
                self.wfile.write(json.dumps(data).encode("utf-8"))
            elif parsed.path == "/" or parsed.path == "/index.html":
                self.path = "/index.html"
                super().do_GET()
            elif parsed.path.startswith("/static/"):
                self.path = parsed.path.replace("/static/", "/", 1)
                super().do_GET()
            else:
                super().do_GET()

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path == "/api/session/start":
                token = create_session()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"session_id": token, "timestamp": time.time()}).encode("utf-8"))
            elif parsed.path == "/api/score/submit":
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                try:
                    payload = json.loads(body.decode("utf-8"))
                except Exception:
                    payload = {}
                res = record_score(
                    session_id=payload.get("session_id", ""),
                    nickname=payload.get("nickname", "Player"),
                    score=payload.get("score", 0),
                    character=payload.get("character", "cat"),
                    items_caught=payload.get("items_caught", 0),
                    survival_seconds=payload.get("survival_seconds", 0)
                )
                self.send_response(200 if "error" not in res else res.get("status", 400))
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode("utf-8"))
            else:
                self.send_error(404, "Endpoint Not Found")

    def run_builtin():
        port = int(os.environ.get("PORT", 8000))
        print("\n=======================================================")
        print("[+] Catch-a-Paw Game Server (Built-in Standard Library)")
        print(f"[*] Open in your browser: http://localhost:{port}")
        print("=======================================================\n")
        server = HTTPServer(("0.0.0.0", port), GameRequestHandler)
        server.serve_forever()

    SERVER_RUNNER = run_builtin

if __name__ == "__main__":
    SERVER_RUNNER()
