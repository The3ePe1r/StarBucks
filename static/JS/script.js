// ======================== API Helper ========================
const API_BASE = '';

async function apiFetch(url, options = {}) {
    const res = await fetch(API_BASE + url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    });
    if (res.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }
    return res.json();
}

// ======================== Escape HTML ========================
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ======================== مودال‌های عمومی ========================
function showConfirmModal(message) {
    return new Promise((resolve) => {
        const msgElement = document.getElementById('confirmModalMessage');
        if (msgElement) msgElement.textContent = message;
        const overlay = document.getElementById('confirmModal');
        if (!overlay) return resolve(confirm(message));
        overlay.style.display = 'flex';
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        const cleanup = () => {
            overlay.style.display = 'none';
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        };
        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    });
}

function showAlertModal(message) {
    return new Promise((resolve) => {
        const msgElement = document.getElementById('alertModalMessage');
        if (msgElement) msgElement.textContent = message;
        const overlay = document.getElementById('alertModal');
        if (!overlay) { alert(message); return resolve(); }
        overlay.style.display = 'flex';
        const okBtn = document.getElementById('alertOk');
        const onOk = () => { overlay.style.display = 'none'; okBtn.removeEventListener('click', onOk); resolve(); };
        okBtn.addEventListener('click', onOk);
    });
}

function showPasswordPrompt(message) {
    return new Promise((resolve) => {
        const msgElement = document.getElementById('passwordModalMessage');
        if (msgElement) msgElement.textContent = message;
        const overlay = document.getElementById('passwordModal');
        if (!overlay) return resolve(prompt(message));
        overlay.style.display = 'flex';
        const input = document.getElementById('passwordInput');
        input.value = '';
        input.focus();
        const submitBtn = document.getElementById('passwordSubmit');
        const cancelBtn = document.getElementById('passwordCancel');
        const cleanup = () => {
            overlay.style.display = 'none';
            submitBtn.removeEventListener('click', onSubmit);
            cancelBtn.removeEventListener('click', onCancel);
        };
        const onSubmit = () => {
            const password = input.value.trim();
            if (!password) { showAlertModal('لطفاً رمز عبور را وارد کنید').then(() => input.focus()); return; }
            cleanup();
            resolve(password);
        };
        const onCancel = () => { cleanup(); resolve(null); };
        submitBtn.addEventListener('click', onSubmit);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// ======================== بخش‌های ظاهری ========================
const header = document.getElementById("header");
if (header) {
    window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 50));
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const tab = document.getElementById(button.dataset.tab);
        if (tab) tab.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const superSellContainer = document.getElementById('superSellContainer');
    if (superSellContainer) {
        let isDown = false, startX, scrollLeft;
        superSellContainer.addEventListener('mousedown', (e) => {
            isDown = true; superSellContainer.classList.add('active');
            startX = e.pageX - superSellContainer.offsetLeft;
            scrollLeft = superSellContainer.scrollLeft;
            e.preventDefault();
        });
        superSellContainer.addEventListener('mouseleave', () => { isDown = false; superSellContainer.classList.remove('active'); });
        superSellContainer.addEventListener('mouseup', () => { isDown = false; superSellContainer.classList.remove('active'); });
        superSellContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return; e.preventDefault();
            const x = e.pageX - superSellContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            superSellContainer.scrollLeft = scrollLeft - walk;
        });
        function adjustSuperSellLayout() {
            const isMobile = window.innerWidth <= 768;
            superSellContainer.style.display = 'flex'; superSellContainer.style.flexWrap = 'nowrap';
            superSellContainer.style.overflowX = 'auto'; superSellContainer.style.whiteSpace = 'nowrap';
            superSellContainer.querySelectorAll('.super-sell-item, .super-sell-item-1, .super-sell-item-2').forEach(item => {
                item.style.display = 'inline-block'; item.style.verticalAlign = 'top';
                item.style.whiteSpace = 'normal'; item.style.flexShrink = '0';
                item.style.width = isMobile ? '280px' : '300px';
                item.style.marginRight = isMobile ? '8px' : '10px';
            });
        }
        adjustSuperSellLayout();
        window.addEventListener('resize', adjustSuperSellLayout);
    }
});

// ======================== احراز هویت ========================
document.addEventListener('DOMContentLoaded', () => {
    async function updateLoginStatus() {
        const link = document.getElementById('loginStatusLink');
        if (!link) return;
        try {
            const user = await apiFetch('/api/user');
            if (user.id) { link.textContent = 'حساب کاربری'; link.href = '/account'; }
        } catch { link.textContent = 'ورود / ثبت نام'; link.href = '/login'; }
    }
    updateLoginStatus();

    if (window.location.pathname.includes('/login')) {
        apiFetch('/api/user').then(user => { if (user.id) window.location.href = '/home'; }).catch(() => {});
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirmPassword').value;
            if (!name || !email || !password || !confirm) return showAlertModal('لطفاً تمام فیلدها را پر کنید.');
            if (password !== confirm) return showAlertModal('رمز عبور و تکرار آن مطابقت ندارند!');
            if (password.length < 5) return showAlertModal('رمز عبور باید حداقل ۵ حرف باشد.');
            const data = await apiFetch('/api/signup', { method: 'POST', body: JSON.stringify({ name, email, password, confirm_password: confirm }) });
            if (data.success) { await showAlertModal('ثبت‌نام با موفقیت انجام شد!'); window.location.href = '/login'; }
            else await showAlertModal(data.error || 'خطا در ثبت‌نام');
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const remember = document.getElementById('rememberMe')?.checked || false;
            const data = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password, remember }) });
            if (data.success) window.location.href = '/home';
            else await showAlertModal(data.error || 'ایمیل یا رمز عبور اشتباه است.');
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const sure = await showConfirmModal('آیا از خروج از حساب کاربری خود مطمئن هستید؟');
            if (sure) {
                try { await fetch('/api/logout'); } catch (err) {}
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('/login');
            }
        });
    }
});

// ======================== محصولات (صفحه اصلی) ========================
async function loadHomeProducts() {
    const superSellContainer = document.getElementById('superSellContainer');
    if (!superSellContainer) return;
    const data = await apiFetch('/api/products');
    const specials = data.filter(p => p.is_special);
    superSellContainer.innerHTML = specials.map(p => `
        <a href="/product/${p.id}" class="super-sell-item">
            <img src="/images/${p.image}" alt="${p.name}">
            <h1>${p.name}</h1>
            <h1>قیمت: ${p.price.toLocaleString()} تومان</h1>
        </a>
    `).join('');
}
if (window.location.pathname.includes('/home')) loadHomeProducts();

// جستجوی زنده
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResults');
if (searchInput && searchResultsContainer) {
    let productsCache = [];
    apiFetch('/api/products').then(data => productsCache = data);
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        if (!term) { searchResultsContainer.innerHTML = ''; searchResultsContainer.style.display = 'none'; return; }
        const results = productsCache.filter(p => p.name.toLowerCase().includes(term));
        searchResultsContainer.innerHTML = results.length ? results.map(p => `
            <a href="/product/${p.id}" class="search-result-item">
                <img src="/images/${p.image}" alt="${p.name}">
                <span>${p.name} - ${p.price.toLocaleString()} تومان</span>
            </a>
        `).join('') : '<div class="no-results">نتیجه‌ای یافت نشد.</div>';
        searchResultsContainer.style.display = 'block';
    });
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
            searchResultsContainer.innerHTML = ''; searchResultsContainer.style.display = 'none';
        }
    });
}

// ======================== صفحات محصولات ========================
if (window.location.pathname.includes('/product/')) {
    document.addEventListener('DOMContentLoaded', async function() {
        const match = window.location.pathname.match(/product\/(\d+)/);
        const productId = match ? match[1] : null;
        if (!productId) return;

        try {
            const product = await fetch('/api/product/' + productId).then(r => r.json());
            if (product.reviews && product.reviews.length > 0) prependReviewsFromServer(product.reviews);
        } catch (err) {}

        function prependReviewsFromServer(reviews) {
            const list = document.querySelector('.reviews-list');
            if (!list || !reviews.length) return;
            list.querySelectorAll('.db-review').forEach(el => el.remove());
            reviews.reverse().forEach(r => {
                const div = document.createElement('div');
                div.className = 'review db-review';
                div.setAttribute('data-review-id', r.id);
                div.innerHTML = `
                    <div class="review-author"><img src="/images/user.png" alt="کاربر"><span>${escapeHtml(r.user_name)}</span></div>
                    <div class="review-content"><p>${escapeHtml(r.content)}</p><span class="review-date">${r.date}</span></div>
                    <button class="admin-delete-review-btn" data-review-id="${r.id}" style="display:none;background:#e74c3c;color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;margin-top:5px;font-size:12px;">🗑️ حذف</button>
                `;
                list.insertBefore(div, list.firstChild);
            });
            checkAdminAndShowDeleteButtons();
        }

        const reviewForm = document.getElementById('addReviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const textarea = document.getElementById('reviewText');
                if (!textarea) return;
                const content = textarea.value.trim();
                if (!content) { alert('لطفاً نظر خود را وارد کنید.'); return; }
                try {
                    const res = await fetch('/api/add_review/' + productId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, rating: 5 }) });
                    const data = await res.json();
                    if (data.success) {
                        textarea.value = '';
                        const updated = await fetch('/api/product/' + productId).then(r => r.json());
                        prependReviewsFromServer(updated.reviews);
                    } else alert(data.error || 'خطا');
                } catch (err) {}
            });
        }

        const buyBtn = document.querySelector('.buy-button');
        if (buyBtn) {
            buyBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                const name = this.getAttribute('data-product-name');
                const price = this.getAttribute('data-product-price');
                if (!name || !price) return;
                try {
                    const res = await fetch('/api/add_to_cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: name, price: price }) });
                    const data = await res.json();
                    if (data.success) { alert(data.message); window.location.href = '/account'; }
                    else alert(data.error || 'خطا');
                } catch (err) {}
            });
        }
    });

    async function checkAdminAndShowDeleteButtons() {
        try {
            const user = await apiFetch('/api/user');
            if (user.is_admin) {
                document.querySelectorAll('.admin-delete-review-btn').forEach(btn => {
                    btn.style.display = 'inline-block';
                    btn.addEventListener('click', async function() {
                        if (confirm('این نظر حذف شود؟')) {
                            const res = await apiFetch(`/api/admin/delete_review/${this.dataset.reviewId}`, { method: 'POST' });
                            if (res.success) this.closest('.db-review').remove();
                        }
                    });
                });
            }
        } catch (err) {}
    }
}

// ======================== حساب کاربری ========================
if (window.location.pathname.includes('/account')) {
    document.addEventListener('DOMContentLoaded', async function() {
        // لود پروفایل
        try {
            const user = await apiFetch('/api/user');
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            if (profileName) profileName.textContent = user.name;
            if (profileEmail) profileEmail.textContent = user.email;
        } catch {}

        // لود سفارشات
        try {
            const orders = await apiFetch('/api/orders');
            const tbody = document.getElementById('orderHistoryBody');
            const noOrdersMsg = document.getElementById('noOrdersMessage');
            if (tbody) {
                tbody.innerHTML = orders.map((o, i) => `
                    <tr><td>${i+1}</td><td>${o.product_name}</td><td>${o.date}</td><td>${o.price}</td><td>${o.status}</td></tr>
                `).join('');
                if (noOrdersMsg) noOrdersMsg.style.display = orders.length ? 'none' : 'block';
            }
        } catch {}

        // پاک کردن سبد خرید
        const clearCartBtn = document.getElementById('clearCartButton');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', async () => {
                const sure = await showConfirmModal('سبد خرید پاک شود؟');
                if (sure) {
                    const res = await apiFetch('/api/clear_cart', { method: 'POST' });
                    alert(res.message);
                    if (res.success) location.reload();
                }
            });
        }

        // تغییر رمز عبور
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const current = document.getElementById('currentPassword').value.trim();
                const newPass = document.getElementById('newPassword').value.trim();
                const confirm = document.getElementById('confirmNewPassword').value.trim();
                if (!current || !newPass || !confirm) return showAlertModal('همه فیلدها را پر کنید.');
                const res = await apiFetch('/api/change_password', {
                    method: 'POST',
                    body: JSON.stringify({ current_password: current, new_password: newPass, confirm_password: confirm })
                });
                if (res.success) { await showAlertModal('رمز عبور با موفقیت تغییر کرد!'); changePasswordForm.reset(); }
                else await showAlertModal(res.error || 'خطا');
            });
        }

        // مدیریت تب‌ها در صفحه اکانت
        const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
        const accountTabs = document.querySelectorAll('.account-tab');
        if (sidebarLinks.length && accountTabs.length) {
            sidebarLinks.forEach(link => {
                if (link.id === 'logoutLink') return;
                link.addEventListener('click', function(e) {
                    const tabId = this.getAttribute('data-tab');
                    if (tabId) {
                        e.preventDefault();
                        sidebarLinks.forEach(item => item.classList.remove('active-menu-item'));
                        this.classList.add('active-menu-item');
                        accountTabs.forEach(tab => tab.classList.remove('active'));
                        const targetTab = document.getElementById(tabId);
                        if (targetTab) targetTab.classList.add('active');
                    }
                });
            });
            const first = sidebarLinks[0];
            if (first && first.id !== 'logoutLink') first.click();
        }
    });
}

// ======================== تیکت‌ها ========================
if (document.getElementById('ticketForm')) {
    document.getElementById('ticketForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        const priority = document.getElementById('priority').value;
        const msgDiv = document.getElementById('formMessage');
        if (!name || !email || !subject || !message) { msgDiv.textContent = 'لطفاً همه فیلدهای ضروری را پر کنید.'; msgDiv.className = 'form-message error'; return; }
        const res = await apiFetch('/api/ticket', { method: 'POST', body: JSON.stringify({ subject, message, priority }) });
        if (res.success) {
            msgDiv.innerHTML = `✅ تیکت شما با موفقیت ثبت شد.<br>شناسه پیگیری: <strong>${res.ticket_id}</strong><br>برای مشاهده وضعیت به <a href="/customer">پرتال مشتریان</a> مراجعه کنید.`;
            msgDiv.className = 'form-message success';
            this.reset();
        } else { msgDiv.textContent = res.error || 'خطا'; msgDiv.className = 'form-message error'; }
    });
}

// ======================== پرتال مشتری ========================
if (document.getElementById('searchBtn')) {
    const container = document.getElementById('ticketsContainer');
    const searchBtn = document.getElementById('searchBtn');
    const searchQuery = document.getElementById('searchQuery');
    let pollInterval = null, currentQuery = '';

    function showDefaultMessage() { container.innerHTML = '<div class="no-ticket">لطفاً ایمیل یا شناسه تیکت خود را وارد کرده و جستجو کنید.</div>'; stopPolling(); }
    function stopPolling() { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }
    function startPolling(query) { stopPolling(); if (query) pollInterval = setInterval(() => searchTickets(query), 5000); }

    async function searchTickets(query) {
        if (!container) return;
        if (!query) { showDefaultMessage(); return; }
        currentQuery = query;
        try {
            const tickets = await apiFetch('/api/tickets?search=' + encodeURIComponent(query));
            if (!tickets.length) { container.innerHTML = '<div class="no-ticket">هیچ تیکتی با این مشخصات یافت نشد.</div>'; return; }
            container.innerHTML = '';
            tickets.forEach(ticket => {
                const statusText = ticket.status === 'open' ? 'باز' : ticket.status === 'in-progress' ? 'در حال بررسی' : 'بسته';
                const div = document.createElement('div');
                div.className = `ticket-card ${ticket.status === 'closed' ? 'closed' : ''}`;
                div.innerHTML = `
                    <div class="ticket-header"><span class="ticket-id">${ticket.ticket_id}</span><span class="ticket-date">${ticket.date}</span></div>
                    <div class="ticket-subject">${escapeHtml(ticket.subject)}</div>
                    <div class="ticket-detail"><p><strong>وضعیت:</strong> <span class="status-badge status-${ticket.status}">${statusText}</span></p><p><strong>اولویت:</strong> ${escapeHtml(ticket.priority)}</p><p><strong>شرح:</strong> ${escapeHtml(ticket.message)}</p></div>
                    <div class="replies-section"><strong>پاسخ‌ها:</strong>${ticket.replies.length === 0 ? '<p>هنوز پاسخی ثبت نشده.</p>' : ticket.replies.map(r => `<div class="reply-bubble ${r.author==='admin'?'admin':''}"><div class="reply-author">${r.author==='admin'?'پشتیبانی':'شما'}</div><div>${escapeHtml(r.text)}</div><div class="reply-date">${r.date}</div></div>`).join('')}</div>
                    ${ticket.status !== 'closed' ? `<div class="reply-form"><textarea id="reply-${ticket.ticket_id}" class="reply-textarea" placeholder="پاسخ شما..."></textarea><button class="send-reply-btn" data-ticket-id="${ticket.ticket_id}">ارسال</button></div>` : ''}
                `;
                container.appendChild(div);
            });
            document.querySelectorAll('.reply-textarea').forEach(ta => { ta.addEventListener('focus', stopPolling); ta.addEventListener('blur', () => { if (currentQuery) startPolling(currentQuery); }); });
            document.querySelectorAll('.send-reply-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const tid = this.dataset.ticketId;
                    const ta = document.getElementById(`reply-${tid}`);
                    if (!ta) return;
                    const text = ta.value.trim();
                    if (!text) return alert('پاسخ نمی‌تواند خالی باشد.');
                    const res = await apiFetch(`/api/ticket/reply/${tid}`, { method: 'POST', body: JSON.stringify({ reply_text: text }) });
                    if (res.success) searchTickets(currentQuery); else alert(res.error || 'خطا');
                });
            });
            startPolling(query);
        } catch (e) {}
    }
    searchBtn.addEventListener('click', () => searchTickets(searchQuery.value.trim()));
    searchQuery.addEventListener('keypress', e => { if (e.key === 'Enter') searchTickets(e.target.value.trim()); });
    showDefaultMessage();
}

// ======================== پنل ادمین ========================
(async function() {
    if (!window.location.pathname.includes('/admin')) return;
    if (!sessionStorage.getItem('adminAuth')) {
        const pass = await showPasswordPrompt('لطفاً رمز عبور مدیریت را وارد کنید:');
        if (pass !== '123456') { await showAlertModal('رمز اشتباه!'); window.location.href = '/home'; return; }
        sessionStorage.setItem('adminAuth', 'true');
    }
    const ticketsContainer = document.getElementById('ticketsContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAllTicketsBtn = document.getElementById('deleteAllTicketsBtn');
    const deleteAllMessagesBtn = document.getElementById('deleteAllMessagesBtn');
    const tabButtons = document.querySelectorAll('.admin-tabs .tab-btn');
    const ticketTabBtn = document.querySelector('.tab-btn[data-tab="tickets"]');
    const messageTabBtn = document.querySelector('.tab-btn[data-tab="messages"]');
    let pollInterval = null;

    function stopPolling() { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }
    function isAnyTextareaFocused() { return document.activeElement && document.activeElement.classList.contains('admin-reply-textarea'); }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab + 'Tab');
            if (target) target.classList.add('active');
            stopPolling();
            if (btn.dataset.tab === 'tickets') { renderTickets(); if (!isAnyTextareaFocused()) pollInterval = setInterval(renderTickets, 5000); }
            else if (btn.dataset.tab === 'messages') { loadContacts(); pollInterval = setInterval(loadContacts, 5000); }
        });
    });

    async function renderTickets() {
        if (!ticketsContainer) return;
        try {
            const tickets = await apiFetch('/api/admin/tickets');
            if (!tickets.length) { ticketsContainer.innerHTML = '<div class="empty-state">هیچ تیکتی ثبت نشده است.</div>'; return; }
            ticketsContainer.innerHTML = tickets.map(t => `
                <div class="ticket-admin-card">
                    <div class="admin-ticket-header"><div class="ticket-meta"><span class="ticket-id-badge">${t.ticket_id}</span><span class="priority-badge">${t.priority}</span><span>${t.date}</span></div><select class="status-select" data-id="${t.id}"><option value="open" ${t.status==='open'?'selected':''}>باز</option><option value="in-progress" ${t.status==='in-progress'?'selected':''}>در حال بررسی</option><option value="closed" ${t.status==='closed'?'selected':''}>بسته</option></select></div>
                    <div class="customer-info"><strong>${escapeHtml(t.user_name)}</strong> (${escapeHtml(t.user_email)})</div>
                    <h3 style="margin:10px 0;">${escapeHtml(t.subject)}</h3>
                    <div class="message-content">${escapeHtml(t.message)}</div>
                    <div class="replies-box"><strong>پاسخ‌ها:</strong>${t.replies.length === 0 ? '<p>بدون پاسخ</p>' : t.replies.map(r => `<div class="reply-item ${r.author==='admin'?'admin-reply':''}"><em>${r.author==='admin'?'ادمین':'مشتری'}:</em> ${escapeHtml(r.text)}<div style="font-size:11px;color:#999">${r.date}</div></div>`).join('')}</div>
                    <div class="admin-reply-form"><textarea id="admin-reply-${t.id}" class="admin-reply-textarea" placeholder="پاسخ ادمین..."></textarea><button class="admin-reply-btn" data-id="${t.id}">ارسال</button></div>
                </div>
            `).join('');
            document.querySelectorAll('.status-select').forEach(select => { select.addEventListener('change', async function() { await apiFetch(`/api/admin/update_status/${this.dataset.id}`, { method: 'POST', body: JSON.stringify({ status: this.value }) }); renderTickets(); }); });
            document.querySelectorAll('.admin-reply-btn').forEach(btn => { btn.addEventListener('click', async function() { const ta = document.getElementById(`admin-reply-${this.dataset.id}`); if (!ta) return; const text = ta.value.trim(); if (!text) return showAlertModal('پاسخ نمی‌تواند خالی باشد.'); await apiFetch(`/api/admin/reply/${this.dataset.id}`, { method: 'POST', body: JSON.stringify({ reply_text: text }) }); renderTickets(); }); });
            document.querySelectorAll('.admin-reply-textarea').forEach(ta => { ta.addEventListener('focus', stopPolling); ta.addEventListener('blur', () => { if (ticketTabBtn.classList.contains('active') && !isAnyTextareaFocused()) pollInterval = setInterval(renderTickets, 5000); }); });
        } catch (e) {}
    }

    async function loadContacts() {
        if (!messagesContainer) return;
        try {
            const messages = await apiFetch('/api/admin/contacts');
            if (!messages.length) { messagesContainer.innerHTML = '<div class="empty-state">هیچ پیام تماسی ثبت نشده است.</div>'; return; }
            messagesContainer.innerHTML = messages.map(m => `
                <div class="message-card"><div class="message-header"><div class="message-meta"><strong>${escapeHtml(m.name)}</strong><span style="color:#888;">${m.date}</span></div><button class="delete-btn" data-id="${m.id}">حذف</button></div><div>📧 ${escapeHtml(m.email)}</div><div style="font-weight:bold;">${escapeHtml(m.subject)}</div><div class="message-content">${escapeHtml(m.message)}</div></div>
            `).join('');
            document.querySelectorAll('.message-card .delete-btn').forEach(btn => { btn.addEventListener('click', async function() { const sure = await showConfirmModal('این پیام حذف شود؟'); if (sure) { await apiFetch(`/api/admin/delete_contact/${this.dataset.id}`, { method: 'POST' }); loadContacts(); } }); });
        } catch (e) {}
    }

    if (deleteAllTicketsBtn) deleteAllTicketsBtn.addEventListener('click', async () => { const sure = await showConfirmModal('همه تیکت‌ها حذف شوند؟'); if (sure) { await apiFetch('/api/admin/delete_all', { method: 'POST' }); renderTickets(); } });
    if (deleteAllMessagesBtn) deleteAllMessagesBtn.addEventListener('click', async () => { const sure = await showConfirmModal('همه پیام‌های تماس حذف شوند؟'); if (sure) { await apiFetch('/api/admin/delete_all_contacts', { method: 'POST' }); loadContacts(); } });
    if (logoutBtn) logoutBtn.addEventListener('click', () => { stopPolling(); sessionStorage.removeItem('adminAuth'); window.location.reload(); });
    window.addEventListener('beforeunload', stopPolling);
    if (ticketTabBtn && ticketTabBtn.classList.contains('active')) { renderTickets(); pollInterval = setInterval(renderTickets, 5000); }
    else if (messageTabBtn && messageTabBtn.classList.contains('active')) { loadContacts(); pollInterval = setInterval(loadContacts, 5000); }
})();

// ======================== تماس با ما ========================
const contactForm = document.getElementById('contactForm');
const contactFormMessage = document.getElementById('formMessage');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        if (!name || !email || !message) { showContactMessage('لطفاً فیلدهای ضروری را پر کنید.', 'error'); return; }
        const res = await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) });
        if (res.success) { showContactMessage('✅ پیام شما با موفقیت ارسال شد.', 'success'); contactForm.reset(); }
        else showContactMessage(res.error || 'خطا', 'error');
    });
}
function showContactMessage(msg, type) {
    if (contactFormMessage) {
        contactFormMessage.textContent = msg;
        contactFormMessage.className = 'form-message ' + type;
        setTimeout(() => { contactFormMessage.textContent = ''; contactFormMessage.className = 'form-message'; }, 5000);
    }
}