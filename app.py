from flask import Flask, request, jsonify, redirect, url_for, flash, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from sqlalchemy.engine import URL
from flask_login import (
    LoginManager, UserMixin, login_user, login_required, logout_user, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import pymysql
import os
import random
import string
import secrets
import openai

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_urlsafe(32))
mysql_url = URL.create(
    drivername="mysql+pymysql",
    username=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    host=os.environ["MYSQL_HOST"],
    port=int(os.environ.get("MYSQL_PORT", "3306")),
    database=os.environ["MYSQL_DATABASE"],
)

app.config["SQLALCHEMY_DATABASE_URI"] = mysql_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['REMEMBER_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = '/login'  # type: ignore


# ======================== Agent هوش مصنوعی (GapGPT) ========================

import openai
import os

@app.route('/api/chat', methods=['POST'])
@login_required
def api_chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify(success=False, error='پیام را وارد کنید.'), 400
    
    try:
        client = openai.OpenAI(
            base_url="https://gapgpt.app/api/v1",  # آدرس API GapGPT
            api_key="sk-h7th5JNRgGK4aOwdKsIp7ZRQmmDcM8BpaV2enoF42iM1rzUz"
        )
        
        # اطلاعات محصولات
        products = Product.query.limit(20).all()
        product_list = "\n".join([f"- {p.name}: {p.price:,} تومان" for p in products])
        
        system_prompt = f"""تو یک دستیار هوش مصنوعی برای فروشگاه استارباکس هستی.

محصولات موجود:
{product_list}

قوانین:
1. فقط به سوالات درباره محصولات، قیمت‌ها، سفارش و پشتیبانی پاسخ بده.
2. اگر سوال خارج از این موضوع بود، بگو: "من فقط در مورد محصولات و سفارشات فروشگاه می‌توانم کمک کنم."
3. پاسخ‌ها را به فارسی و با ادب بده.
4. پاسخ‌ها را مختصر و مفید بده (حداکثر ۳ پاراگراف)."""

        response = client.chat.completions.create(
            model="gpt-4o",  # یا هر مدلی که GapGPT پشتیبانی میکنه
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        return jsonify(success=True, reply=reply)
        
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500


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
    author = db.Column(db.String(20))
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, default='')
    short_description = db.Column(db.String(200), default='')
    specs = db.Column(db.Text, default='')
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

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(app.static_folder, 'css'), filename) # type: ignore

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.static_folder, 'JS'), filename) # type: ignore

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory(os.path.join(app.static_folder, 'images'), filename) # type: ignore

@app.route('/fonts/<path:filename>')
def serve_fonts(filename):
    return send_from_directory(os.path.join(app.static_folder, 'fonts'), filename) # type: ignore

HTML_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')

@app.route('/')
def index():
    return redirect('/home', code=302)

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
    return send_from_directory(HTML_DIR, 'product.html')

@app.route('/products')
def products_page():
    return send_from_directory(HTML_DIR, 'products.html')

@app.route('/coffee')
def coffee_page():
    return send_from_directory(HTML_DIR, 'coffee.html')

@app.route('/cake')
def cake_page():
    return send_from_directory(HTML_DIR, 'cake.html')

@app.route('/signup')
def signup_page():
    return send_from_directory(HTML_DIR, 'signup.html')

@app.route('/login')
def login_page():
    if current_user.is_authenticated:
        logout_user()
        session.clear()
    return send_from_directory(HTML_DIR, 'login.html')


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
    user = User(name=name, email=email, password_hash=generate_password_hash(password))# type: ignore
    db.session.add(user)
    db.session.commit()
    return jsonify(success=True, message='ثبت‌نام با موفقیت انجام شد.')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    remember = data.get('remember', False)
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user, remember=remember)
        return jsonify(success=True, user={'id': user.id, 'name': user.name, 'email': user.email, 'is_admin': user.is_admin})
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
@app.route('/api/products')
def api_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'price': p.price,
        'description': p.description,
        'short_description': p.short_description,
        'specs': p.specs,
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
        'short_description': product.short_description,
        'specs': product.specs,
        'image': product.image,
        'is_special': product.is_special,
        'discount': product.discount,
        'reviews': [{
            'id': r.id,
            'user_id': r.user_id,
            'user_name': User.query.get(r.user_id).name, # type: ignore
            'content': r.content,
            'rating': r.rating,
            'date': r.created_at.strftime('%Y/%m/%d')
        } for r in reviews]
    })

@app.route('/api/add_to_cart', methods=['POST'])
@login_required
def api_add_to_cart():
    data = request.get_json()
    try:
        product_id = int(data.get('product_id'))
    except (TypeError, ValueError):
        return jsonify(success=False, error='شناسهٔ محصول نامعتبر است.'), 400
    product = db.session.get(Product, product_id)
    if product is None:
        return jsonify(success=False, error='محصول پیدا نشد.'), 404
    order = Order(user_id=current_user.id, product_name=product.name, price=str(product.price)) # type: ignore
    db.session.add(order)
    db.session.commit()
    return jsonify(success=True, message=f'{product_name} به سبد خرید اضافه شد.') # type: ignore

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

@app.route('/api/add_review/<int:product_id>', methods=['POST'])
@login_required
def api_add_review(product_id):
    data = request.get_json()
    content = data.get('content', '').strip()
    try:
        rating = int(data.get('rating', 5))
    except (TypeError, ValueError):
        return jsonify(success=False, error='امتیاز نامعتبر است.'), 400
    if not content:
        return jsonify(success=False, error='لطفاً نظر خود را بنویسید.'), 400
    if not 1 <= rating <= 5:
        return jsonify(success=False, error='امتیاز باید بین ۱ تا ۵ باشد.'), 400
    if db.session.get(Product, product_id) is None:
        return jsonify(success=False, error='محصول پیدا نشد.'), 404
    review = Review(user_id=current_user.id, product_id=product_id, content=content, rating=rating) # type: ignore
    db.session.add(review)
    db.session.commit()
    return jsonify(success=True, message='نظر شما ثبت شد.')

@app.route('/api/delete_review/<int:review_id>', methods=['POST'])
@login_required
def api_delete_own_review(review_id):
    review = Review.query.get_or_404(review_id)
    if review.user_id != current_user.id:
        return jsonify(success=False, error='شما فقط می‌توانید نظرات خود را حذف کنید.'), 403
    db.session.delete(review)
    db.session.commit()
    return jsonify(success=True, message='نظر شما حذف شد.')

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
        ticket_id='TKT-' + secrets.token_hex(8).upper(), # type: ignore
        user_id=current_user.id, # type: ignore
        subject=subject, # type: ignore 
        message=message, # type: ignore
        priority=priority # type: ignore
    )
    db.session.add(ticket)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(success=False, error='لطفاً دوباره تلاش کنید.'), 409
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
        reply = TicketReply(ticket_id=ticket.id, author='customer', text=reply_text) # type: ignore
        db.session.add(reply)
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='پاسخ نمی‌تواند خالی باشد.'), 400

@app.route('/api/contact', methods=['POST'])
def api_contact():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()
    if not name or not email or not message:
        return jsonify(success=False, error='فیلدهای ضروری را پر کنید.'), 400
    msg = ContactMessage(name=name, email=email, subject=subject or 'بدون موضوع', message=message) # type: ignore
    db.session.add(msg)
    db.session.commit()
    return jsonify(success=True, message='پیام شما با موفقیت ارسال شد.')

ADMIN_PANEL_PASSWORD = '123456'
UPLOAD_FOLDER = os.path.join(app.static_folder, 'images') # type: ignore
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def product_to_dict(p):
    return {
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'price': p.price,
        'description': p.description,
        'short_description': p.short_description,
        'specs': p.specs,
        'image': p.image,
        'is_special': p.is_special,
        'discount': p.discount
    }

def admin_required():
    if not session.get('admin_authenticated'):
        return jsonify(success=False, error='دسترسی غیرمجاز'), 403
    return None

@app.route('/api/admin/login', methods=['POST'])
def api_admin_login():
    data = request.get_json()
    password = data.get('password', '')
    if password == ADMIN_PANEL_PASSWORD:
        session['admin_authenticated'] = True
        return jsonify(success=True, token='session')
    return jsonify(success=False), 401

@app.route('/api/admin/logout', methods=['POST'])
def api_admin_logout():
    session.pop('admin_authenticated', None)
    return jsonify(success=True)

@app.route('/api/admin/tickets')
def api_admin_tickets():
    if (error := admin_required()): return error
    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    return jsonify([{
        'id': t.id,
        'ticket_id': t.ticket_id,
        'user_name': User.query.get(t.user_id).name, # type: ignore
        'user_email': User.query.get(t.user_id).email, # type: ignore
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
def api_admin_update_status(ticket_id):
    if (error := admin_required()): return error
    ticket = Ticket.query.get_or_404(ticket_id)
    new_status = request.get_json().get('status', 'open')
    if new_status in ('open', 'in-progress', 'closed'):
        ticket.status = new_status
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='وضعیت نامعتبر'), 400

@app.route('/api/admin/reply/<int:ticket_id>', methods=['POST'])
def api_admin_reply(ticket_id):
    if (error := admin_required()): return error
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    reply_text = data.get('reply_text', '').strip()
    if reply_text:
        reply = TicketReply(ticket_id=ticket.id, author='admin', text=reply_text) # type: ignore
        db.session.add(reply)
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False, error='پاسخ خالی است'), 400

@app.route('/api/admin/delete_all', methods=['POST'])
def api_admin_delete_all():
    if (error := admin_required()): return error
    TicketReply.query.delete()
    Ticket.query.delete()
    db.session.commit()
    return jsonify(success=True, message='همه تیکت‌ها حذف شدند.')

@app.route('/api/admin/contacts')
def api_admin_contacts():
    if (error := admin_required()): return error
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
def api_admin_delete_contact(msg_id):
    if (error := admin_required()): return error
    msg = ContactMessage.query.get_or_404(msg_id)
    db.session.delete(msg)
    db.session.commit()
    return jsonify(success=True, message='پیام حذف شد.')

@app.route('/api/admin/delete_all_contacts', methods=['POST'])
def api_admin_delete_all_contacts():
    if (error := admin_required()): return error
    ContactMessage.query.delete()
    db.session.commit()
    return jsonify(success=True, message='همه پیام‌ها حذف شدند.')

@app.route('/api/admin/products', methods=['POST'])
def api_admin_create_product():
    if (error := admin_required()): return error
    name = request.form.get('name', '').strip()
    category = request.form.get('category', '').strip()
    price_str = request.form.get('price', '').strip()
    description = request.form.get('description', '').strip()
    short_description = request.form.get('short_description', '').strip()
    specs = request.form.get('specs', '').strip()
    is_special = request.form.get('is_special', 'false').lower() == 'true'
    discount_str = request.form.get('discount', '0').strip()

    if not name or not category or not price_str:
        return jsonify(success=False, error='نام، دسته‌بندی و قیمت الزامی هستند.'), 400
    try:
        price = int(price_str)
        discount = int(discount_str)
    except ValueError:
        return jsonify(success=False, error='قیمت و تخفیف باید عدد باشند.'), 400

    image_filename = ''
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower() # type: ignore
            temp_name = f"temp_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
            file.save(os.path.join(UPLOAD_FOLDER, temp_name))
            image_filename = temp_name

    product = Product(
        name=name, category=category, price=price, # type: ignore
        description=description, # type: ignore
        short_description=short_description, # type: ignore
        specs=specs, # type: ignore
        image=image_filename, # type: ignore
        is_special=is_special, discount=discount # type: ignore
    )
    db.session.add(product)
    db.session.commit()

    if image_filename:
        old_path = os.path.join(UPLOAD_FOLDER, image_filename)
        ext = image_filename.rsplit('.', 1)[1]
        new_name = f"product_{product.id}.{ext}"
        new_path = os.path.join(UPLOAD_FOLDER, new_name)
        os.rename(old_path, new_path)
        product.image = new_name
        db.session.commit()

    return jsonify(success=True, product=product_to_dict(product))

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def api_admin_update_product(product_id):
    if (error := admin_required()): return error
    product = Product.query.get_or_404(product_id)

    product.name = request.form.get('name', product.name).strip()
    product.category = request.form.get('category', product.category).strip()
    try:
        product.price = int(request.form.get('price', str(product.price)).strip())
    except ValueError:
        pass
    product.description = request.form.get('description', product.description).strip()
    product.short_description = request.form.get('short_description', product.short_description).strip()
    product.specs = request.form.get('specs', product.specs).strip()
    product.is_special = request.form.get('is_special', 'false').lower() == 'true'
    try:
        product.discount = int(request.form.get('discount', str(product.discount)).strip())
    except ValueError:
        pass

    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower() # type: ignore
            new_name = f"product_{product.id}.{ext}"
            old_image = product.image
            file.save(os.path.join(UPLOAD_FOLDER, new_name))
            product.image = new_name

    db.session.commit()
    if 'old_image' in locals() and old_image and old_image != product.image: # type: ignore
        old_path = os.path.join(UPLOAD_FOLDER, old_image)
        if os.path.exists(old_path):
            os.remove(old_path)
    return jsonify(success=True, product=product_to_dict(product))

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def api_admin_delete_product(product_id):
    if (error := admin_required()): return error
    product = Product.query.get_or_404(product_id)
    if product.image:
        img_path = os.path.join(UPLOAD_FOLDER, product.image)
        if os.path.exists(img_path):
            os.remove(img_path)
    db.session.delete(product)
    db.session.commit()
    return jsonify(success=True, message='محصول حذف شد.')

def init_db():
    with app.app_context():
        db.create_all()
        if Product.query.count() == 0:
            products = [
                Product(name='آیس ماچا', category='coffee', price=300000, image='item1.png', is_special=True, # type: ignore
                        description='آیس ماچا استارباکس با استفاده از پودر ماچای مرغوب ژاپنی، شیر تازه و یخ فراوان تهیه می‌شود. این نوشیدنی نه تنها طعمی فوق‌العاده دارد، بلکه به دلیل خواص چای سبز، سرشار از آنتی‌اکسیدان است. مناسب برای کسانی که به دنبال یک نوشیدنی سالم و مقوی هستند.\n\n- نوع چای: ماچا ژاپنی درجه یک\n- شیرین‌کننده: قابل تنظیم (معمولاً شربت ساده یا عسل)\n- مواد اصلی: پودر ماچا، شیر، یخ\n- مناسب برای: تمام فصول، انرژی‌بخش', # type: ignore
                        short_description='نوشیدنی خنک و دلچسب ماچا با شیر و یخ، ترکیبی ایده‌آل برای روزهای گرم.', # type: ignore
                        specs='{"حجم": "۴۰۰ میلی‌لیتر", "دمای سرو": "بسیار خنک", "بسته‌بندی": "لیوان مخصوص با درب", "مواد تشکیل‌دهنده": "پودر ماچا، شیر، یخ، شیرین‌کننده (اختیاری)"}'), # type: ignore
                Product(name='کاپوچینو', category='coffee', price=100000, image='item2.png', is_special=True, # type: ignore
                        description='کاپوچینوی کلاسیک ایتالیایی با اسپرسوی قوی و شیر کف‌دار. ترکیبی عالی برای شروع روز.\n\n- نوع قهوه: عربیکا\n- شیر: کامل\n- دمای سرو: گرم', # type: ignore
                        short_description='اسپرسوی قوی با شیر کف‌دار برای روزهای پرانرژی.',# type: ignore
                        specs='{"حجم": "۳۰۰ میلی‌لیتر", "دمای سرو": "گرم", "بسته‌بندی": "لیوان کاغذی درب‌دار", "مواد تشکیل‌دهنده": "اسپرسو، شیر کامل"}'), # type: ignore
                Product(name='امریکانو', category='coffee', price=120000, image='item3.png', is_special=True, # type: ignore
                        description='اسپرسوی رقیق‌شده با آب جوش، طعمی صاف و تلخ برای لذت واقعی قهوه.\n\n- نوع قهوه: عربیکا\n- حجم اسپرسو: دبل\n- دمای سرو: گرم', # type: ignore
                        short_description='اسپرسوی رقیق‌شده برای طعمی صاف و تلخ.', # type: ignore
                        specs='{"حجم": "۳۵۰ میلی‌لیتر", "دمای سرو": "گرم", "بسته‌بندی": "لیوان کاغذی", "مواد تشکیل‌دهنده": "اسپرسو، آب"}'), # type: ignore
                Product(name='کارامل لته', category='coffee', price=150000, image='item4.png', is_special=True, # type: ignore
                        description='اسپرسوی نرم با شیر بخارپز و سس کارامل شیرین. یک انتخاب دلپذیر برای عصر.\n\n- نوع قهوه: عربیکا\n- سس: کارامل طبیعی\n- دمای سرو: گرم', # type: ignore
                        short_description='اسپرسو با شیر بخارپز و سس کارامل دلپذیر.', # type: ignore
                        specs='{"حجم": "۳۵۰ میلی‌لیتر", "دمای سرو": "گرم", "بسته‌بندی": "لیوان کاغذی", "مواد تشکیل‌دهنده": "اسپرسو، شیر، سس کارامل"}'), # type: ignore
                Product(name='وانیل چیزکیک', category='cake', price=350000, image='item5.png', is_special=True, # type: ignore
                        description='چیزکیک وانیلی خامه‌ای با بافتی نرم و طعمی لطیف. تهیه‌شده از پنیر خامه‌ای تازه و وانیل طبیعی.\n\n- وزن: ۲۵۰ گرم\n- نوع: وانیلی\n- مناسب برای: ۱-۲ نفر', # type: ignore
                        short_description='چیزکیک وانیلی نرم و لطیف برای لحظات شیرین.', # type: ignore
                        specs='{"وزن": "۲۵۰ گرم", "طعم": "وانیل طبیعی", "بسته‌بندی": "جعبه کاغذی", "مواد اصلی": "پنیر خامه‌ای، تخم‌مرغ، شکر، وانیل"}'), # type: ignore
                Product(name='نیویورک چیزکیک', category='cake', price=700000, image='item6.png', # type: ignore
                        description='چیزکیک کلاسیک نیویورکی با بافتی متراکم و غنی. پخته‌شده با پنیر خامه‌ای و خامه ترش.\n\n- وزن: ۵۰۰ گرم\n- نوع: پخته\n- مناسب برای: ۲-۳ نفر', # type: ignore
                        short_description='چیزکیک متراکم و غنی نیویورکی برای عاشقان طعم‌های کلاسیک.', # type: ignore
                        specs='{"وزن": "۵۰۰ گرم", "طعم": "کلاسیک", "بسته‌بندی": "جعبه مقوایی", "مواد اصلی": "پنیر خامه‌ای، خامه ترش، تخم‌مرغ"}'), # type: ignore
                Product(name='استرابری چیزکیک', category='cake', price=400000, image='item7.png', is_special=True, # type: ignore
                        description='چیزکیک یخچالی با سس توت‌فرنگی تازه و تکه‌های میوه. طعمی ترش و شیرین که همه را راضی می‌کند.\n\n- وزن: ۳۰۰ گرم\n- نوع: یخچالی\n- مناسب برای: ۱-۲ نفر', # type: ignore
                        short_description='چیزکیک یخچالی با توت‌فرنگی تازه، ترش و شیرین.', # type: ignore
                        specs='{"وزن": "۳۰۰ گرم", "طعم": "توت‌فرنگی", "بسته‌بندی": "جعبه کاغذی", "مواد اصلی": "پنیر خامه‌ای، توت‌فرنگی، شکر"}'), # type: ignore
                Product(name='چاکلت چیزکیک', category='cake', price=500000, image='item8.png', is_special=True, # type: ignore
                        description='چیزکیک شکلاتی بلژیکی با شکلات تلخ و شیرین. بافتی مخملی و طعمی فوق‌العاده برای عاشقان شکلات.\n\n- وزن: ۳۵۰ گرم\n- نوع: یخچالی\n- مناسب برای: ۱-۲ نفر', # type: ignore
                        short_description='چیزکیک شکلاتی بلژیکی با بافتی مخملی.', # type: ignore
                        specs='{"وزن": "۳۵۰ گرم", "طعم": "شکلات بلژیکی", "بسته‌بندی": "جعبه کاغذی", "مواد اصلی": "پنیر خامه‌ای، شکلات تلخ، کاکائو"}'), # type: ignore
            ]
            db.session.add_all(products)
        db.session.commit()

init_db() 

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG') == '1', host='0.0.0.0', port=5000)
