# ☕️ Starbox – Online Coffee & Cake Store

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-green?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange?style=for-the-badge&logo=mysql&logoColor=white)

**Starbox** is a full‑stack, responsive online store for coffee and cakes, built with **Flask** on the backend, **MySQL** for data persistence, and pure **HTML/CSS/JS** on the frontend.  
The project is designed entirely in Persian (RTL) and provides a complete shopping experience with product management, user accounts, a live support ticket system, and a modern glass‑morphism UI.

---

## ✨ Features

### 🔐 User System
- Registration, login, secure logout, and password change with hashed passwords.
- Persistent shopping cart and order history for every user.

### 🛍️ Store & Products
- Dynamic product pages — a single template serves all products using data from the database.
- Full product management in the admin panel: add, edit (with image upload), and delete products.
- Discount system with struck‑through original price, final price, and percentage badge.
- Technical specifications stored as JSON and displayed in a dedicated tab.
- Featured products slider on the home page with drag‑to‑scroll support.
- Live search with product images and prices.
- Category pages for Coffee and Cake with a glass‑card design.

### 🎫 Live Ticket Support
- Logged‑in users can submit support tickets.
- Customer portal to track tickets by email or ticket ID.
- Real‑time chat between customer and admin (auto‑refresh every 5 seconds).
- Admin panel for managing tickets: change status, reply, delete.

### 📱 User Interface
- Fully responsive design (mobile, tablet, desktop).
- Right‑to‑left layout with Persian fonts (Vazir, Yekan).
- Automatic conversion of all numbers to Persian digits.
- Custom modals for confirmations, alerts, and password prompts.
- Clean URLs without `.html` extensions (e.g., `/product/5`, `/login`, `/admin`).

### ⚙️ Admin Panel
- Token‑based authentication (no separate admin account required).
- Dashboard to view and delete contact messages.
- Complete CRUD for products with image upload.
- Ticket management with status update and reply.

---

## 🛠️ Tech Stack

| Area          | Technology                                      |
|---------------|-------------------------------------------------|
| Backend       | Python 3, Flask                                 |
| Database      | MySQL                                           |
| ORM           | Flask‑SQLAlchemy                                |
| Authentication| Flask‑Login, token‑based admin                  |
| Frontend      | HTML5, CSS3, JavaScript (Vanilla)               |
| Real‑time     | Polling with Fetch API                          |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9 or higher
- MySQL server running (e.g., XAMPP locally)
- An empty database named `starbox_db`

### Installation

```bash
git clone https://github.com/SEPEHRRGB/starbox.git
cd starbox
python -m venv venv
venv\Scripts\activate   # Windows — or: source venv/bin/activate (Linux/macOS)
pip install -r requirements.txt
python app.py
```

The store will be available at `http://localhost:5000`.

### Admin Panel
Visit `/admin` and enter the password `123456` (configurable in `app.py`).

## 🚀 Live Demo

Check out the live site: [Website Demo](https://starbucks-z08i.onrender.com)

---

## 📁 Project Structure

```
starbox/
├── app.py                # Flask application
├── requirements.txt      # Python dependencies
├── static/
│   ├── css/ (style.css)
│   ├── js/ (script.js)
│   └── images/
├── templates/            # All HTML files
│   ├── home.html
│   ├── product.html
│   ├── coffee.html
│   ├── cake.html
│   ├── admin.html
│   ├── account.html
│   └── …
└── README.md
```

---

**Developer:** The3ePe1r  
**License:** MIT
```
