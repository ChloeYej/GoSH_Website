# GoSH Website

## English

GoSH is a Shanghai travel companion website. It helps visitors discover recommended dining spots and city sights, save favorite places, and view saved places on a personal page with an interactive map.

### Features

- User sign up and log in with a Flask API and SQLite database.
- Dining recommendations grouped by restaurants, local must-try food, cafes, and desserts.
- Sight recommendations grouped by landmarks, museums, parks, and city blocks.
- Favorite/unfavorite actions for food and sights.
- Personal "Me" page showing saved food and sights.
- OpenStreetMap/Leaflet map display for saved places that include coordinates in their map links.
- Static frontend pages served directly by Flask.

### Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python, Flask
- Database: SQLite
- Authentication storage: bcrypt password hashing
- Map: Leaflet with OpenStreetMap tiles

### Project Structure

```text
.
├── backend/
│   ├── app.py              # Flask app, API routes, SQLite setup
│   ├── requirements.txt    # Python dependencies
│   └── tour.db             # Local SQLite database
├── frontend/
│   ├── index.html          # Login and sign-up entry page
│   ├── homepage.html       # Home page
│   ├── dining.html         # Dining recommendations
│   ├── sights.html         # Sight recommendations
│   ├── Me.html             # User favorites and map page
│   ├── About_us.html       # About/contact page
│   ├── css/                # Page styles
│   ├── js/                 # Frontend behavior and API helpers
│   └── images/             # Website image assets
└── README.md
```

### Getting Started

1. Create and activate a Python virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install backend dependencies.

```bash
pip install -r backend/requirements.txt
```

3. Start the Flask server.

```bash
python backend/app.py
```

4. Open the website in a browser.

```text
http://127.0.0.1:5000/
```

The backend listens on port `5000` by default. You can override it with the `PORT` environment variable. The SQLite database defaults to `backend/tour.db`; you can override it with `SQLITE_PATH`.


---

## 中文

GoSH 是一个面向上海旅行探索的网站。它帮助用户浏览上海餐饮与景点推荐，收藏想去的地点，并在个人页面中通过互动地图查看已收藏的位置。

### 主要功能

- 基于 Flask API 和 SQLite 数据库的用户注册与登录。
- 餐饮推荐，包含餐厅、本地必吃、咖啡与甜品等分类。
- 景点推荐，包含地标、博物馆、公园、城市街区等分类。
- 支持收藏和取消收藏餐饮/景点卡片。
- 个人 "Me" 页面集中展示已收藏的餐饮和景点。
- 使用 Leaflet 与 OpenStreetMap 展示收藏地点地图。
- 由 Flask 直接托管静态前端页面。

### 技术栈

- 前端：HTML、CSS、JavaScript
- 后端：Python、Flask
- 数据库：SQLite
- 密码存储：bcrypt 哈希
- 地图：Leaflet + OpenStreetMap

### 项目结构

```text
.
├── backend/
│   ├── app.py              # Flask 应用、API 路由、SQLite 初始化
│   ├── requirements.txt    # Python 依赖
│   └── tour.db             # 本地 SQLite 数据库
├── frontend/
│   ├── index.html          # 登录与注册入口页面
│   ├── homepage.html       # 首页
│   ├── dining.html         # 餐饮推荐页面
│   ├── sights.html         # 景点推荐页面
│   ├── Me.html             # 用户收藏与地图页面
│   ├── About_us.html       # 关于与联系页面
│   ├── css/                # 页面样式
│   ├── js/                 # 前端交互与 API 工具
│   └── images/             # 网站图片资源
└── README.md
```

### 本地运行

1. 创建并激活 Python 虚拟环境。

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. 安装后端依赖。

```bash
pip install -r backend/requirements.txt
```

3. 启动 Flask 服务。

```bash
python backend/app.py
```

4. 在浏览器中打开网站。

```text
http://127.0.0.1:5000/
```

后端默认监听 `5000` 端口，可通过 `PORT` 环境变量修改。SQLite 数据库默认使用 `backend/tour.db`，也可通过 `SQLITE_PATH` 环境变量指定其他路径。




