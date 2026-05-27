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
        const msgEl = document.getElementById('confirmModalMessage');
        if (msgEl) msgEl.textContent = message;
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
        const msgEl = document.getElementById('alertModalMessage');
        if (msgEl) msgEl.textContent = message;
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
        const msgEl = document.getElementById('passwordModalMessage');
        if (msgEl) msgEl.textContent = message;
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

// ======================== احراز هویت (کاربران عادی) ========================
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
    const loginError = document.getElementById('loginError');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginError) { loginError.style.display = 'none'; loginError.textContent = ''; }
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const remember = document.getElementById('rememberMe')?.checked || false;
            try {
                const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, remember }) });
                const data = await res.json();
                if (res.ok && data.success) window.location.href = '/home';
                else { if (loginError) { loginError.textContent = data.error || 'ایمیل یا رمز عبور اشتباه است.'; loginError.style.display = 'block'; } }
            } catch (err) { if (loginError) { loginError.textContent = 'خطا در برقراری ارتباط با سرور'; loginError.style.display = 'block'; } }
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
    const specialIds = [5, 7, 2, 3, 4, 8];   // همون ترتیب همیشگی
    const specials = specialIds.map(id => data.find(p => p.id === id)).filter(Boolean);

    superSellContainer.innerHTML = specials.map((p, index) => {
        // کلاس‌های ویژه برای اولین و آخرین آیتم
        let extraClass = '';
        if (index === 0) extraClass = 'super-sell-item-1';        // محصول اول
        else if (index === specials.length - 1) extraClass = 'super-sell-item-2'; // محصول آخر
        else extraClass = 'super-sell-item';                      // بقیه

        return `
            <a href="/product/${p.id}" class="${extraClass}">
                <img src="/images/${p.image}" alt="${p.name}">
                <h1>${p.name}</h1>
                <h1>قیمت: ${p.price.toLocaleString()} تومان</h1>
            </a>
        `;
    }).join('');
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
                <img src="/images/${p.image}" alt="${p.name}" class="product-thumbnail">
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

// ======================== صفحات محصول (product.html) ========================
if (window.location.pathname.includes('/product/')) {
    document.addEventListener('DOMContentLoaded', async function() {
        const match = window.location.pathname.match(/product\/(\d+)/);
        const productId = match ? match[1] : null;
        if (!productId) return;

        let currentUserId = null;
        try { const user = await apiFetch('/api/user'); currentUserId = user.id; } catch (e) {}

        try {
            const product = await fetch('/api/product/' + productId).then(r => r.json());

            // لاگ برای بررسی
            console.log('محصول دریافت شد:', product);

            document.getElementById('productName').textContent = product.name;
            document.getElementById('productDetailName').textContent = product.name;
            document.getElementById('productImage').src = '/images/' + product.image;

            const shortDesc = document.getElementById('shortDescription');
            if (shortDesc) shortDesc.textContent = product.short_description || '';

            const fullDesc = document.getElementById('fullDescription');
            if (fullDesc) fullDesc.textContent = product.description || '';

            // قیمت و تخفیف
            function toPersianPrice(num) {
                const formatted = num.toLocaleString('en-US');
                return formatted.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
            }

            const originalPrice = Number(product.price);
            const discount = product.discount || 0;
            let finalPrice = originalPrice;

            const discountBadge = document.getElementById('discountBadge');
            const originalPriceSpan = document.getElementById('originalPrice');
            const discountPercentSpan = document.getElementById('discountPercent');
            const productPriceSpan = document.getElementById('productPrice');
            const buyBtn = document.getElementById('buyButton');

            if (discount > 0) {
                finalPrice = originalPrice - (originalPrice * discount / 100);
                if (discountBadge) discountBadge.style.display = 'flex';
                if (originalPriceSpan) originalPriceSpan.textContent = toPersianPrice(originalPrice) + ' تومان';
                if (discountPercentSpan) discountPercentSpan.textContent = Math.round(discount) + '٪';
                if (productPriceSpan) productPriceSpan.textContent = toPersianPrice(finalPrice);
            } else {
                if (discountBadge) discountBadge.style.display = 'none';
                if (productPriceSpan) productPriceSpan.textContent = toPersianPrice(originalPrice);
            }

            if (buyBtn) {
                buyBtn.setAttribute('data-product-name', product.name);
                buyBtn.setAttribute('data-product-price', toPersianPrice(finalPrice) + ' تومان');
            }

            // ===== مشخصات فنی (بخش بحرانی) =====
            const specsTable = document.getElementById('specsTable');
            if (specsTable) {
                if (product.specs && product.specs.trim() !== '') {
                    try {
                        const specs = JSON.parse(product.specs);
                        let rows = '';
                        for (const [key, value] of Object.entries(specs)) {
                            rows += `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`;
                        }
                        specsTable.innerHTML = rows;
                    } catch (e) {
                        specsTable.innerHTML = '<tr><td colspan="2">فرمت مشخصات نامعتبر است.</td></tr>';
                    }
                } else {
                    specsTable.innerHTML = '<tr><td colspan="2">مشخصات فنی ثبت نشده است.</td></tr>';
                }
            }

            // نظرات (همان نسخهٔ قبلی)
            function renderReviews(reviews) {
                const list = document.getElementById('reviewsList');
                if (!list) return;
                if (!reviews.length) {
                    list.innerHTML = '<p style="text-align:center; color:#888;">هنوز نظری ثبت نشده است.</p>';
                    return;
                }
                list.innerHTML = reviews.map(r => `
                    <div class="review db-review">
                        <div class="review-author"><img src="/images/user.png" alt="کاربر"><span>${escapeHtml(r.user_name)}</span></div>
                        <div class="review-content"><p>${escapeHtml(r.content)}</p><span class="review-date">${r.date}</span></div>
                        ${r.user_id === currentUserId ? `<button class="delete-own-review-btn" data-review-id="${r.id}" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; margin-top:5px;">🗑️ حذف</button>` : ''}
                    </div>
                `).join('');

                document.querySelectorAll('.delete-own-review-btn').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        if (confirm('نظر خود را حذف می‌کنید؟')) {
                            const res = await apiFetch(`/api/delete_review/${this.dataset.reviewId}`, { method: 'POST' });
                            if (res.success) this.closest('.db-review').remove();
                            else alert(res.error || 'خطا');
                        }
                    });
                });
            }

            if (product.reviews) renderReviews(product.reviews);

            // ثبت نظر
            const reviewForm = document.getElementById('addReviewForm');
            if (reviewForm) {
                const newReviewForm = reviewForm.cloneNode(true);
                reviewForm.parentNode.replaceChild(newReviewForm, reviewForm);
                const finalReviewForm = document.getElementById('addReviewForm');
                if (finalReviewForm) {
                    finalReviewForm.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        const content = document.getElementById('reviewText').value.trim();
                        if (!content) return alert('لطفاً نظر خود را وارد کنید.');
                        const res = await apiFetch(`/api/add_review/${productId}`, {
                            method: 'POST',
                            body: JSON.stringify({ content, rating: 5 })
                        });
                        if (res.success) {
                            document.getElementById('reviewText').value = '';
                            const updated = await fetch('/api/product/' + productId).then(r => r.json());
                            renderReviews(updated.reviews);
                        } else alert(res.error || 'خطا');
                    });
                }
            }

            // دکمه خرید
            document.addEventListener('click', async function(e) {
                const buyBtn = e.target.closest('#buyButton');
                if (!buyBtn) return;
                e.preventDefault();
                const name = buyBtn.getAttribute('data-product-name');
                const price = buyBtn.getAttribute('data-product-price');
                if (!name || !price) return;
                const res = await fetch('/api/add_to_cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_name: name, price: price })
                });
                const data = await res.json();
                if (data.success) {
                    await showAlertModal(data.message);
                    window.location.href = '/account';
                } else {
                    await showAlertModal(data.error || 'خطا');
                }
            });

        } catch (err) {
            console.error('خطا در بارگذاری اطلاعات محصول:', err);
        }
    });
}

// ======================== حساب کاربری ========================
if (window.location.pathname.includes('/account')) {
    document.addEventListener('DOMContentLoaded', async function() {
        async function loadUserInfo() {
            try {
                const user = await apiFetch('/api/user');
                const profileName = document.getElementById('profileName');
                const profileEmail = document.getElementById('profileEmail');
                if (profileName) profileName.textContent = user.name || 'کاربر';
                if (profileEmail) profileEmail.textContent = user.email || '';
            } catch (err) {}
        }
        async function loadOrders() {
            try {
                const orders = await apiFetch('/api/orders');
                const tbody = document.getElementById('orderHistoryBody');
                const noOrdersMsg = document.getElementById('noOrdersMessage');
                if (tbody) {
                    tbody.innerHTML = orders.map((o, i) => `<tr><td>${i+1}</td><td>${o.product_name}</td><td>${o.date}</td><td>${o.price}</td><td>${o.status}</td></tr>`).join('');
                    if (noOrdersMsg) noOrdersMsg.style.display = orders.length ? 'none' : 'block';
                }
            } catch (err) {}
        }

        const clearCartBtn = document.getElementById('clearCartButton');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', async () => {
                const sure = await showConfirmModal('سبد خرید پاک شود؟');
                if (sure) {
                    const res = await apiFetch('/api/clear_cart', { method: 'POST' });
                    alert(res.message);
                    if (res.success) loadOrders();
                }
            });
        }

        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const current = document.getElementById('currentPassword').value.trim();
                const newPass = document.getElementById('newPassword').value.trim();
                const confirm = document.getElementById('confirmNewPassword').value.trim();
                if (!current || !newPass || !confirm) return showAlertModal('همه فیلدها را پر کنید.');
                const res = await apiFetch('/api/change_password', { method: 'POST', body: JSON.stringify({ current_password: current, new_password: newPass, confirm_password: confirm }) });
                if (res.success) { await showAlertModal('رمز عبور با موفقیت تغییر کرد!'); changePasswordForm.reset(); }
                else await showAlertModal(res.error || 'خطا');
            });
        }

        const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-tab]');
        const accountTabs = document.querySelectorAll('.account-tab');

        function showTab(tabId) {
            accountTabs.forEach(tab => {
                tab.style.display = 'none';
                tab.classList.remove('active');
            });
            const target = document.getElementById(tabId);
            if (target) {
                target.style.display = 'block';
                requestAnimationFrame(() => target.classList.add('active'));
                if (tabId === 'user-info') loadUserInfo();
                else if (tabId === 'order-history') loadOrders();
            }
        }

        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                if (tabId) {
                    sidebarLinks.forEach(l => l.classList.remove('active-menu-item'));
                    this.classList.add('active-menu-item');
                    showTab(tabId);
                }
            });
        });

        const firstTab = sidebarLinks[0];
        if (firstTab) firstTab.click();
        else showTab('user-info');
        loadUserInfo();
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
function specsTextToJson(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const obj = {};
    lines.forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex > 0) {
            const key = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();
            if (key) obj[key] = value;
        }
    });
    return Object.keys(obj).length > 0 ? JSON.stringify(obj) : '';
}

(async function() {
    if (!window.location.pathname.includes('/admin')) return;

    // ---------- احراز هویت ----------
    let adminToken = sessionStorage.getItem('adminToken');

    if (!adminToken) {
        const pass = await showPasswordPrompt('لطفاً رمز عبور مدیریت را وارد کنید:');
        if (!pass) { window.location.href = '/home'; return; }

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        const data = await res.json();
        if (!data.success || !data.token) {
            await showAlertModal('رمز اشتباه!');
            window.location.href = '/home';
            return;
        }
        adminToken = data.token;
        sessionStorage.setItem('adminToken', adminToken);
    }

    // wrapper برای همهٔ درخواست‌های ادمین
    async function adminApiFetch(url, options = {}) {
        const headers = { ...options.headers, 'X-Admin-Token': adminToken };
        const res = await fetch(API_BASE + url, {
            headers: { 'Content-Type': 'application/json', ...headers },
            ...options
        });
        if (res.status === 403) {
            sessionStorage.removeItem('adminToken');
            await showAlertModal('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
            window.location.href = '/admin';
            throw new Error('Token expired');
        }
        return res.json();
    }

    // ---------- المان‌های DOM ----------
    const ticketsContainer = document.getElementById('ticketsContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const productsContainer = document.getElementById('productsContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAllTicketsBtn = document.getElementById('deleteAllTicketsBtn');
    const deleteAllMessagesBtn = document.getElementById('deleteAllMessagesBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productModalTitle = document.getElementById('productModalTitle');

    let pollInterval = null;
    let editingProductId = null;

    // ---------- ابزارهای Polling ----------
    function stopPolling() { if (pollInterval) { clearInterval(pollInterval); pollInterval = null; } }
    function isAnyTextareaFocused() { return document.activeElement && document.activeElement.classList.contains('admin-reply-textarea'); }

    function startPollingForActiveTab() {
        stopPolling();
        const activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab) return;
        const tab = activeTab.dataset.tab;
        if (tab === 'tickets') {
            renderTickets();
            if (!isAnyTextareaFocused()) pollInterval = setInterval(renderTickets, 5000);
        } else if (tab === 'messages') {
            loadContacts();
            pollInterval = setInterval(loadContacts, 5000);
        } else if (tab === 'products') {
            loadProducts();
        }
    }

    // ---------- مدیریت تب‌ها ----------
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab + 'Tab');
            if (target) target.classList.add('active');
            startPollingForActiveTab();
        });
    });

    // ==================== تیکت‌ها ====================
    async function renderTickets() {
        if (!ticketsContainer) return;
        try {
            const tickets = await adminApiFetch('/api/admin/tickets');
            if (!tickets.length) {
                ticketsContainer.innerHTML = '<div class="empty-state">هیچ تیکتی ثبت نشده است.</div>';
                return;
            }
            ticketsContainer.innerHTML = tickets.map(t => `
                <div class="ticket-admin-card">
                    <div class="admin-ticket-header">
                        <div class="ticket-meta">
                            <span class="ticket-id-badge">${t.ticket_id}</span>
                            <span class="priority-badge">${t.priority}</span>
                            <span>${t.date}</span>
                        </div>
                        <select class="status-select" data-id="${t.id}">
                            <option value="open" ${t.status==='open'?'selected':''}>باز</option>
                            <option value="in-progress" ${t.status==='in-progress'?'selected':''}>در حال بررسی</option>
                            <option value="closed" ${t.status==='closed'?'selected':''}>بسته</option>
                        </select>
                    </div>
                    <div class="customer-info"><strong>${escapeHtml(t.user_name)}</strong> (${escapeHtml(t.user_email)})</div>
                    <h3>${escapeHtml(t.subject)}</h3>
                    <div class="message-content">${escapeHtml(t.message)}</div>
                    <div class="replies-box">
                        <strong>پاسخ‌ها:</strong>
                        ${t.replies.length===0 ? '<p>بدون پاسخ</p>' : t.replies.map(r => `
                            <div class="reply-item ${r.author==='admin'?'admin-reply':''}">
                                <em>${r.author==='admin'?'ادمین':'مشتری'}:</em> ${escapeHtml(r.text)}
                                <div class="reply-date">${r.date}</div>
                            </div>`).join('')}
                    </div>
                    <div class="admin-reply-form">
                        <textarea id="admin-reply-${t.id}" class="admin-reply-textarea" placeholder="پاسخ ادمین..."></textarea>
                        <button class="admin-reply-btn" data-id="${t.id}">ارسال</button>
                    </div>
                </div>
            `).join('');

            // تغییر وضعیت
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', async function() {
                    await adminApiFetch(`/api/admin/update_status/${this.dataset.id}`, {
                        method: 'POST',
                        body: JSON.stringify({ status: this.value })
                    });
                    renderTickets();
                });
            });

            // دکمه‌های پاسخ
            document.querySelectorAll('.admin-reply-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const ta = document.getElementById(`admin-reply-${this.dataset.id}`);
                    if (!ta) return;
                    const text = ta.value.trim();
                    if (!text) return showAlertModal('پاسخ نمی‌تواند خالی باشد.');
                    await adminApiFetch(`/api/admin/reply/${this.dataset.id}`, {
                        method: 'POST',
                        body: JSON.stringify({ reply_text: text })
                    });
                    renderTickets();
                });
            });

            // فوکوس textarea برای توقف polling
            document.querySelectorAll('.admin-reply-textarea').forEach(ta => {
                ta.addEventListener('focus', stopPolling);
                ta.addEventListener('blur', () => {
                    if (document.querySelector('.tab-btn[data-tab="tickets"].active') && !isAnyTextareaFocused()) {
                        stopPolling();
                        pollInterval = setInterval(renderTickets, 5000);
                    }
                });
            });
        } catch (e) { console.error(e); }
    }

    // ==================== پیام‌های تماس ====================
    async function loadContacts() {
        if (!messagesContainer) return;
        try {
            const messages = await adminApiFetch('/api/admin/contacts');
            if (!messages.length) {
                messagesContainer.innerHTML = '<div class="empty-state">هیچ پیام تماسی ثبت نشده است.</div>';
                return;
            }
            messagesContainer.innerHTML = messages.map(m => `
                <div class="message-card">
                    <div class="message-header">
                        <div class="message-meta">
                            <strong>${escapeHtml(m.name)}</strong>
                            <span>${m.date}</span>
                        </div>
                        <button class="delete-btn" data-id="${m.id}">حذف</button>
                    </div>
                    <div>📧 ${escapeHtml(m.email)}</div>
                    <div><strong>${escapeHtml(m.subject)}</strong></div>
                    <div class="message-content">${escapeHtml(m.message)}</div>
                </div>
            `).join('');
            document.querySelectorAll('.message-card .delete-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    if (await showConfirmModal('این پیام حذف شود؟')) {
                        await adminApiFetch(`/api/admin/delete_contact/${this.dataset.id}`, { method: 'POST' });
                        loadContacts();
                    }
                });
            });
        } catch (e) { console.error(e); }
    }

    // ==================== مدیریت محصولات ====================
    async function loadProducts() {
        if (!productsContainer) return;
        try {
            const products = await apiFetch('/api/products');
            if (!products.length) {
                productsContainer.innerHTML = '<div class="empty-state">هیچ محصولی ثبت نشده است.</div>';
                return;
            }
            productsContainer.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>تصویر</th>
                            <th>نام</th>
                            <th>دسته</th>
                            <th>قیمت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td><img src="/images/${p.image}" alt="${escapeHtml(p.name)}"></td>
                                <td>${escapeHtml(p.name)}</td>
                                <td>${p.category === 'coffee' ? 'قهوه' : 'کیک'}</td>
                                <td class="price-cell">${p.price.toLocaleString()} تومان</td>
                                <td>
                                    <button class="edit-product-btn" data-id="${p.id}">✏️ ویرایش</button>
                                    <button class="delete-product-btn" data-id="${p.id}">🗑️ حذف</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', () => openEditModal(btn.dataset.id));
            });
            document.querySelectorAll('.delete-product-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
            });
        } catch (e) { console.error(e); }
    }

    addProductBtn?.addEventListener('click', () => {
        editingProductId = null;
        productModalTitle.textContent = 'افزودن محصول جدید';
        productForm.reset();
        document.getElementById('prodCategory').value = 'coffee';
        productModal.style.display = 'flex';
    });

    async function openEditModal(productId) {
        try {
            const products = await apiFetch('/api/products');
            const product = products.find(p => p.id == productId);
            if (!product) return;
            editingProductId = productId;
            document.getElementById('productId').value = product.id;
            document.getElementById('prodName').value = product.name;
            document.getElementById('prodCategory').value = product.category;
            document.getElementById('prodPrice').value = product.price;
            document.getElementById('prodDescription').value = product.description || '';
            document.getElementById('prodShortDesc').value = product.short_description || '';
            const specsTextarea = document.getElementById('prodSpecsText');
                if (specsTextarea) {
                    if (product.specs) {
                        try {
                            const specsObj = JSON.parse(product.specs);
                            const lines = Object.entries(specsObj).map(([k, v]) => `${k}: ${v}`);
                            specsTextarea.value = lines.join('\n');
                        } catch (e) {
                            specsTextarea.value = '';
                        }
                    } else {
                        specsTextarea.value = '';
                    }
                }
            document.getElementById('prodDiscount').value = product.discount || 0;
            productModalTitle.textContent = 'ویرایش محصول';
            productModal.style.display = 'flex';
        } catch (e) { console.error(e); }
    }

    cancelProductBtn?.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    productForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('prodName').value.trim());
        formData.append('category', document.getElementById('prodCategory').value);
        formData.append('price', document.getElementById('prodPrice').value.trim());
        formData.append('description', document.getElementById('prodDescription').value.trim());
        formData.append('short_description', document.getElementById('prodShortDesc').value.trim());
        const specsText = document.getElementById('prodSpecsText').value.trim();
        const specsJson = specsTextToJson(specsText);
        formData.append('specs', specsJson);
        formData.append('discount', document.getElementById('prodDiscount').value.trim() || '0');
        const imageFile = document.getElementById('prodImage').files[0];
        if (imageFile) formData.append('image', imageFile);

        const url = editingProductId
            ? `/api/admin/products/${editingProductId}`
            : '/api/admin/products';
        const method = editingProductId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'X-Admin-Token': sessionStorage.getItem('adminToken') },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                productModal.style.display = 'none';
                loadProducts();
                showAlertModal(editingProductId ? 'محصول با موفقیت ویرایش شد.' : 'محصول جدید اضافه شد.');
            } else {
                showAlertModal(data.error || 'خطا');
            }
        } catch (err) { console.error(err); }
    });

    async function deleteProduct(productId) {
        const sure = await showConfirmModal('آیا از حذف این محصول اطمینان دارید؟');
        if (!sure) return;
        try {
            const res = await adminApiFetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
            if (res.success) {
                loadProducts();
                showAlertModal('محصول حذف شد.');
            }
        } catch (e) { console.error(e); }
    }

    const productsTabBtn = document.querySelector('.tab-btn[data-tab="products"]');
    if (productsTabBtn) {
        productsTabBtn.addEventListener('click', loadProducts);
    }

    // ==================== دکمه‌های عمومی ====================
    if (deleteAllTicketsBtn) {
        deleteAllTicketsBtn.addEventListener('click', async () => {
            if (await showConfirmModal('همه تیکت‌ها حذف شوند؟')) {
                await adminApiFetch('/api/admin/delete_all', { method: 'POST' });
                renderTickets();
            }
        });
    }
    if (deleteAllMessagesBtn) {
        deleteAllMessagesBtn.addEventListener('click', async () => {
            if (await showConfirmModal('همه پیام‌های تماس حذف شوند؟')) {
                await adminApiFetch('/api/admin/delete_all_contacts', { method: 'POST' });
                loadContacts();
            }
        });
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await adminApiFetch('/api/admin/logout', { method: 'POST' });
            sessionStorage.removeItem('adminToken');
            stopPolling();
            window.location.href = '/home';
        });
    }
    window.addEventListener('beforeunload', stopPolling);

    // شروع اولیه
    startPollingForActiveTab();
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

// ======================== فارسی‌سازی خودکار تمام اعداد ========================
(function() {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    function toPersianNumber(text) {
        return text.replace(/[0-9]/g, d => persianDigits[d]);
    }

    // تبدیل گره‌های متنی
    function convertTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent)) {
            node.textContent = toPersianNumber(node.textContent);
        }
    }

    // تبدیل placeholderها
    function convertPlaceholder(el) {
        if (el.placeholder && /\d/.test(el.placeholder)) {
            el.placeholder = toPersianNumber(el.placeholder);
        }
        if (el.value && /\d/.test(el.value) && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
            el.value = toPersianNumber(el.value);
        }
    }

    // پیمایش کل DOM
    function walkDOM(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.parentNode && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.nodeName)) {
                convertTextNode(node);
            }
        }
        // تبدیل inputها و textareaها (placeholder)
        root.querySelectorAll?.('input, textarea').forEach(el => convertPlaceholder(el));
    }

    // اجرای اولیه
    document.addEventListener('DOMContentLoaded', () => {
        walkDOM(document.body);
    });

    // مشاهده تغییرات آینده (AJAX، بارگذاری پویا و ...)
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    walkDOM(node);
                } else if (node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent)) {
                    convertTextNode(node);
                }
            });
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: false
    });
})();

// ======================== صفحات دسته‌بندی (قهوه / کیک) ========================
async function loadCategoryPage(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const products = await apiFetch('/api/products');
        const filtered = products.filter(p => p.category === category);

        if (!filtered.length) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#888;">هیچ محصولی در این دسته‌بندی یافت نشد.</p>';
            return;
        }

        container.className = 'category-grid';
        container.innerHTML = filtered.map(p => `
            <a href="/product/${p.id}" class="cozy-card">
                <img src="/images/${p.image}" alt="${escapeHtml(p.name)}">
                <div class="card-body">
                    <h3>${escapeHtml(p.name)}</h3>
                    <span class="category-price">${p.price.toLocaleString()} تومان</span>
                    <span class="view-btn">مشاهده و خرید</span>
                </div>
            </a>
        `).join('');

    } catch (err) {
        console.error('Error loading category page:', err);
    }
}

// اجرا در صفحات مربوطه
if (window.location.pathname.includes('/coffee')) {
    loadCategoryPage('coffee', 'coffeeContainer');
}
if (window.location.pathname.includes('/cake')) {
    loadCategoryPage('cake', 'cakeContainer');
}