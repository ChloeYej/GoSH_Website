from pathlib import Path
import os, sqlite3, bcrypt
from flask import Flask, request, jsonify, g

# ========== 常量 ==========
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("SQLITE_PATH", BASE_DIR / "tour.db"))
STATIC_ROOT = (BASE_DIR / ".." / "frontend").resolve()
SALT_ROUNDS = 12

# Flask 直接托管前端静态资源（/index.html、/dining.html、/js/*、/css/* 等）
app = Flask(__name__, static_folder=str(STATIC_ROOT), static_url_path="")

# ========== DB 连接管理（每次请求 1 个连接） ==========
def get_db() -> sqlite3.Connection:
    if "db" not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db

@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()

# ========== 初始化表 ==========
with sqlite3.connect(DB_PATH) as conn:
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash BLOB NOT NULL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            image TEXT,
            link TEXT,
            UNIQUE(username, type, title)
        )
    """)
    conn.commit()

# ========== 小工具 ==========
def req_json():
    return request.get_json(force=True, silent=True) or {}

def json_error(msg, code):
    return jsonify(ok=False, msg=msg), code

# ========== 静态首页 ==========
@app.get("/")
def index():
    # 由 Flask 直接从 static_folder 返回 index.html
    return app.send_static_file("index.html")

# ========== APIs ==========
@app.get("/api/health")
def health():
    return jsonify(ok=True)

@app.post("/api/signup")
def signup():
    d = req_json()
    u = (d.get("username") or "").strip()
    p = (d.get("password") or "").strip()
    if not u or not p:
        return json_error("username and password required", 400)

    pwd = bcrypt.hashpw(p.encode(), bcrypt.gensalt(SALT_ROUNDS))
    try:
        db = get_db()
        db.execute("INSERT INTO users(username, password_hash) VALUES (?,?)", (u, pwd))
        db.commit()
        return jsonify(ok=True, msg="signup success")
    except sqlite3.IntegrityError:
        return json_error("username already exists", 409)

@app.post("/api/login")
def login():
    d = req_json()
    u = (d.get("username") or "").strip()
    p = (d.get("password") or "").strip()
    row = get_db().execute(
        "SELECT password_hash FROM users WHERE username=?", (u,)
    ).fetchone()
    if not row:
        return json_error("user not found", 404)
    if not bcrypt.checkpw(p.encode(), row["password_hash"]):
        return json_error("invalid password", 401)
    return jsonify(ok=True, user={"username": u}, token="dummy-token")

@app.get("/api/favorites")
def list_favorites():
    username = (request.args.get("username") or "").strip()
    type_ = (request.args.get("type") or "sight").strip()
    if not username:
        return json_error("username required", 400)
    rows = get_db().execute(
        "SELECT username, type, title, image, link FROM favorites WHERE username=? AND type=?",
        (username, type_),
    ).fetchall()
    return jsonify(ok=True, items=[dict(r) for r in rows])

@app.post("/api/favorites")
def add_favorite():
    d = req_json()
    username = (d.get("username") or "").strip()
    type_ = (d.get("type") or "sight").strip()
    title = (d.get("title") or "").strip()
    image = (d.get("image") or "").strip()
    link = (d.get("link") or "").strip()
    if not (username and title):
        return json_error("username and title required", 400)

    try:
        cur = get_db().execute(
            "INSERT OR IGNORE INTO favorites(username,type,title,image,link) VALUES (?,?,?,?,?)",
            (username, type_, title, image, link),
        )
        get_db().commit()
        # 告知是否真的新增（受 UNIQUE 影响，重复会被忽略）
        return jsonify(ok=True, created=(cur.rowcount == 1))
    except Exception as e:
        return json_error(str(e), 500)

@app.delete("/api/favorites")
def remove_favorite():
    d = req_json()
    username = (d.get("username") or "").strip()
    type_ = (d.get("type") or "sight").strip()
    title = (d.get("title") or "").strip()
    if not (username and title):
        return json_error("username and title required", 400)

    cur = get_db().execute(
        "DELETE FROM favorites WHERE username=? AND type=? AND title=?",
        (username, type_, title),
    )
    get_db().commit()
    # 204 表示删除成功且无响应体；若想告诉是否删除到可返回 ok 和 deleted
    if cur.rowcount:
        return ("", 204)
    return json_error("not found", 404)

if __name__ == "__main__":
    # 监听 0.0.0.0 方便局域网访问；开发环境关闭 reloader 可减少 sqlite 频繁 reopen
    app.run(host="0.0.0.0", port=5000, use_reloader=False)
