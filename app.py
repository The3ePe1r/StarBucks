# app.py – کامل و هماهنگ با script.js جدید
from flask import Flask, request, jsonify, redirect, url_for, flash, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager, UserMixin, login_user, login_required, logout_user, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import pymysql
import os
import random
import string
# -------------------- تنظیمات Flask --------------------

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'starbox-secret-key-change-me'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/starbox_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = '/login'  # در صورت نیاز به ریدایرکت (اختیاری)

# -------------------- مدل‌های پایگاه داده --------------------
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Ticket(db.Model):
    __tablename__ = 'tickets'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='normal')
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    replies = db.relationship('TicketReply', backref='ticket', lazy=True,
                              cascade='all, delete-orphan', order_by='TicketReply.created_at')

class TicketReply(db.Model):
    __tablename__ = 'ticket_replies'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id', ondelete='CASCADE'))
    author = db.Column(db.String(20))  # 'customer' یا 'admin'
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, default='')
    image = db.Column(db.String(200), default='')
    is_special = db.Column(db.Boolean, default=False)
    discount = db.Column(db.Integer, default=0)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    product_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='در حال پردازش')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    product_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ---------- مسیرهای استاتیک اضافی (باید قبل از catch-all بیان) ----------
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'js'), filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory(os.path.join(app.static_folder, 'images'), filename)

# -------------------- مسیرهای تمیز بدون .html --------------------
HTML_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

@app.route('/')
def index():
    return send_from_directory(HTML_DIR, 'home.html')

@app.route('/home')
def home():
    return send_from_directory(HTML_DIR, 'home.html')

@app.route('/about')
def about():
    return send_from_directory(HTML_DIR, 'about.html')

@app.route('/contact')
def contact_page():
    return send_from_directory(HTML_DIR, 'contact.html')

@app.route('/account')
def account_page():
    return send_from_directory(HTML_DIR, 'account.html')

@app.route('/admin')
def admin_page():
    return send_from_directory(HTML_DIR, 'admin.html')

@app.route('/customer')
def customer_page():
    return send_from_directory(HTML_DIR, 'customer.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    return send_from_directory(HTML_DIR, f'product{product_id}.html')

@app.route('/products')
def products_page():
    return send_from_directory(HTML_DIR, 'products.html')

@app.route('/signup')
def signup_page():
    return send_from_directory(HTML_DIR, 'signup.html')

@app.route('/login')
def login_page():
    if current_user.is_authenticated:
        logout_user()
        session.clear()
    return send_from_directory(HTML_DIR, 'login.html')

@app.route('/ticket')
def ticket_page():
    return send_from_directory(HTML_DIR, 'ticket.html')

# -------------------- API: احراز هویت --------------------
@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    confirm = data.get('confirm_password', '')

    if not name or not email or not password:
        return jsonify(success=False, error='لطفاً تمام فیلدها را پر کنید.'), 400
    if password != confirm:
        return jsonify(success=False, error='رمز عبور و تکرار آن مطابقت ندارند.'), 400
    if len(password) < 5:
        return jsonify(success=False, error='رمز عبور باید حداقل ۵ کاراکتر باشد.'), 400
    if User.query.filter_by(email=email).first():
        return jsonify(success=False, error='این ایمیل قبلاً ثبت شده است.'), 400

    user = User(name=name, email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    return jsonify(success=True, message='ثبت‌نام با موفقیت انجام شد. حالا می‌توانید وارد شوید.')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    remember = data.get('remember', False)

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user, remember=remember)
        return jsonify(success=True, user={
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'is_admin': user.is_admin
        })
    return jsonify(success=False, error='ایمیل یا رمز عبور اشتباه است.'), 401

@app.route('/api/logout')
@login_required
def api_logout():
    logout_user()
    session.clear()
    resp = jsonify(success=True)
    resp.delete_cookie('session')
    resp.delete_cookie('remember_token')
    return resp

@app.route('/api/user')
@login_required
def api_user():
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'is_admin': current_user.is_admin
    })

@app.route('/api/change_password', methods=['POST'])
@login_required
def api_change_password():
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_password = data.get('confirm_password', '')

    if not current_password or not new_password:
        return jsonify(success=False, error='همه فیلدها را پر کنید.'), 400
    if new_password != confirm_password:
        return jsonify(success=False, error='رمز عبور جدید و تکرار آن مطابقت ندارند.'), 400
    if len(new_password) < 5:
        return jsonify(success=False, error='رمز عبور جدید باید حداقل ۵ کاراکتر باشد.'), 400
    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify(success=False, error='رمز عبور فعلی اشتباه است.'), 400

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify(success=True, message='رمز عبور با موفقیت تغییر کرد.')

# -------------------- API: محصولات --------------------
@app.route('/api/products')
def api_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'price': p.price,
        'description': p.description,
        'image': p.image,
        'is_special': p.is_special,
        'discount': p.discount
    } for p in products])

@app.route('/api/product/<int:product_id>')
def api_product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    return jsonify({
        'id': product.id,
        'name': product.name,
        'category': product.category,
        'price': product.price,
        'description': product.description,
        'image': product.image,
        'is_special': product.is_special,
        'discount': product.discount,
        'reviews': [{
            'id': r.id,
            'user_name': User.query.get(r.user_id).name,
            'content': r.content,
            'rating': r.rating,
            'date': r.created_at.strftime('%Y/%m/%d')
        } for r in reviews]
    })

# -------------------- API: سفارش‌ها --------------------
@app.route('/api/add_to_cart', methods=['POST'])
@login_required
def api_add_to_cart():
    data = request.get_json()
    product_name = data.get('product_name', '')
    price = data.get('price', '')
    if not product_name or not price:
        return jsonify(success=False, error='اطلاعات محصول ناقص است.'), 400
    order = Order(user_id=current_user.id, product_name=product_name, price=price)
    db.session.add(order)
    db.session.commit()
    return jsonify(success=True, message=f'{product_name} به سبد خرید اضافه شد.')

@app.route('/api/orders')
@login_required
def api_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify([{
        'id': o.id,
        'product_name': o.product_name,
        'price': o.price,
        'status': o.status,
        'date': o.created_at.strftime('%Y/%m/%d')
    } for o in orders])

@app.route('/api/clear_cart', methods=['POST'])
@login_required
def api_clear_cart():
    Order.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify(success=True, message='سبد خرید خالی شد.')

# -------------------- API: نظرات --------------------
@app.route('/api/add_review/<int:product_id>', methods=['POST'])
@login_required
def api_add_review(product_id):
    data = request.get_json()
    content = data.get('content', '').strip()
    rating = int(data.get('rating', 5))
    if not content:
        return jsonify(success=False, error='لطفاً نظر خود را بنویسید.'), 400
    review = Review(user_id=current_user.id, product_id=product_id, content=content, rating=rating)
    db.session.add(review)
    db.session.commit()
    return jsonify(success=True, message='نظر شما ثبت شد.')

@app.route('/api/admin/delete_review/<int:review_id>', methods=['POST'])
@login_required
def api_delete_review(review_id):
    if not current_user.is_admin:
        return jsonify(success=False, error='فقط ادمین'), 403
    review = Review.query.get_or_404(review_id)
    db.session.delete(review)
    db.session.commit()
    return jsonify(success=True, message='نظر حذف شد.')

# -------------------- API: تیکت‌ها --------------------
@app.route('/api/ticket', methods=['POST'])
@login_required
def api_create_ticket():
    data = request.get_json()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()
    priority = data.get('priority', 'normal')
    if not subject or not message:
        return jsonify(success=False, error='موضوع و شرح تیکت الزامی است.'), 400

    ticket = Ticket(
        ticket_id='TKT-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=5)),
        user_id=current_user.id,
        subject=subject,
        message=message,
        priority=priority
    )
    db.session.add(ticket)
    db.session.commit()
    return jsonify(success=True, ticket_id=ticket.ticket_id, message='تیکت شما ثبت شد.')

@app.route('/api/tickets')
@login_required
def api_tickets():
    search = request.args.get('search', '').strip()
    if '@' in search:
        tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()
    elif search:
        ticket = Ticket.query.filter_by(ticket_id=search.upper()).first()
        tickets = [ticket] if ticket and ticket.user_id == current_user.id else []
    else:
        tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()

    return jsonify([{
        'id': t.id,
        'ticket_id': t.ticket_id,
        'subject': t.subject,
        'message': t.message,
        'priority': t.priority,
        'status': t.status,
        'date': t.created_at.strftime('%Y/%m/%d %H:%M'),
        'replies': [{
            'author': r.author,
            'text': r.text,
            'date': r.created_at.strftime('%Y/%m/%d %H:%M')
        } for r in t.replies]
    } for t in tickets])

@app.route('/api/ticket/reply/<ticket_id>', methods=['POST'])
@login_required
def api_add_reply(ticket_id):
    ticket = Ticket.query.filter_by(ticket_id=ticket_id).first_or_404()
    if ticket.user_id != current_user.id:
        return jsonify(success=False, error='دسترسی غیرمجاز.'), 403
    data = request.get_json()
    reply_text = data.get('reply_text', '').strip()
    if reply_text:
        reply = TicketReply(ticket_id=ticket.id, author='customer', text=reply_text)
        db.session.add(reply)
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='پاسخ نمی‌تواند خالی باشد.'), 400

# -------------------- API: ادمین --------------------
@app.route('/api/admin/tickets')
@login_required
def api_admin_tickets():
    if not current_user.is_admin:
        return jsonify(success=False, error='فقط ادمین اجازه دسترسی دارد.'), 403
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'ticket_id': t.ticket_id,
        'user_name': User.query.get(t.user_id).name,
        'user_email': User.query.get(t.user_id).email,
        'subject': t.subject,
        'message': t.message,
        'priority': t.priority,
        'status': t.status,
        'date': t.created_at.strftime('%Y/%m/%d %H:%M'),
        'replies': [{
            'author': r.author,
            'text': r.text,
            'date': r.created_at.strftime('%Y/%m/%d %H:%M')
        } for r in t.replies]
    } for t in tickets])

@app.route('/api/admin/update_status/<int:ticket_id>', methods=['POST'])
@login_required
def api_update_status(ticket_id):
    if not current_user.is_admin:
        return jsonify(success=False, error='غیرمجاز'), 403
    ticket = Ticket.query.get_or_404(ticket_id)
    new_status = request.get_json().get('status', 'open')
    if new_status in ('open', 'in-progress', 'closed'):
        ticket.status = new_status
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='وضعیت نامعتبر'), 400

@app.route('/api/admin/reply/<int:ticket_id>', methods=['POST'])
@login_required
def api_admin_reply(ticket_id):
    if not current_user.is_admin:
        return jsonify(success=False, error='غیرمجاز'), 403
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    reply_text = data.get('reply_text', '').strip()
    if reply_text:
        reply = TicketReply(ticket_id=ticket.id, author='admin', text=reply_text)
        db.session.add(reply)
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='پاسخ خالی است'), 400

@app.route('/api/admin/delete_all', methods=['POST'])
@login_required
def api_admin_delete_all():
    if not current_user.is_admin:
        return jsonify(success=False, error='غیرمجاز'), 403
    TicketReply.query.delete()
    Ticket.query.delete()
    db.session.commit()
    return jsonify(success=True, message='همه تیکت‌ها حذف شدند.')

# -------------------- API: پیام‌های تماس (ادمین) --------------------
@app.route('/api/admin/contacts')
@login_required
def api_admin_contacts():
    if not current_user.is_admin:
        return jsonify(success=False, error='فقط ادمین'), 403
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'email': m.email,
        'subject': m.subject,
        'message': m.message,
        'date': m.created_at.strftime('%Y/%m/%d %H:%M')
    } for m in messages])

@app.route('/api/admin/delete_contact/<int:msg_id>', methods=['POST'])
@login_required
def api_delete_contact(msg_id):
    if not current_user.is_admin:
        return jsonify(success=False, error='فقط ادمین'), 403
    msg = ContactMessage.query.get_or_404(msg_id)
    db.session.delete(msg)
    db.session.commit()
    return jsonify(success=True, message='پیام حذف شد.')

# -------------------- API: تماس با ما --------------------
@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()
    if not name or not email or not message:
        return jsonify(success=False, error='فیلدهای ضروری را پر کنید.'), 400
    msg = ContactMessage(name=name, email=email, subject=subject or 'بدون موضوع', message=message)
    db.session.add(msg)
    db.session.commit()
    return jsonify(success=True, message='پیام شما با موفقیت ارسال شد.')

# -------------------- اجرای اولیه --------------------
def init_db():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(is_admin=True).first():
            admin = User(
                name='مدیر',
                email='admin@starbox.com',
                password_hash=generate_password_hash('123456'),
                is_admin=True
            )
            db.session.add(admin)
        if Product.query.count() == 0:
            products = [
                Product(name='آیس ماچا', category='coffee', price=300000, image='item1.png', is_special=True,
                        description='ماچای ژاپنی با شیر و یخ'),
                Product(name='کاپوچینو', category='coffee', price=100000, image='item2.png', is_special=True,
                        description='اسپرسو با شیر کف‌دار'),
                Product(name='امریکانو', category='coffee', price=120000, image='item3.png', is_special=True,
                        description='اسپرسو با آب جوش'),
                Product(name='کارامل لته', category='coffee', price=150000, image='item4.png', is_special=True,
                        description='اسپرسو با شیر و سس کارامل'),
                Product(name='وانیل چیزکیک', category='cake', price=350000, image='item5.png', is_special=True,
                        description='چیزکیک وانیلی خامه‌ای'),
                Product(name='نیویورک چیزکیک', category='cake', price=700000, image='item6.png',
                        description='چیزکیک کلاسیک نیویورکی'),
                Product(name='استرابری چیزکیک', category='cake', price=400000, image='item7.png', is_special=True,
                        description='چیزکیک با سس توت‌فرنگی تازه'),
                Product(name='چاکلت چیزکیک', category='cake', price=500000, image='item8.png', is_special=True,
                        description='چیزکیک شکلاتی بلژیکی'),
            ]
            db.session.add_all(products)
        db.session.commit()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)