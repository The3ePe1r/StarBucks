
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

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

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

async function loadHomeProducts() {
    const superSellContainer = document.getElementById('superSellContainer');
    if (!superSellContainer) return;
    const data = await apiFetch('/api/products');
    const specialIds = [5, 7, 2, 3, 4, 8];
    const specials = specialIds.map(id => data.find(p => p.id === id)).filter(Boolean);

    superSellContainer.innerHTML = specials.map((p, index) => {
        let extraClass = '';
        if (index === 0) extraClass = 'super-sell-item-1';
        else if (index === specials.length - 1) extraClass = 'super-sell-item-2';
        else extraClass = 'super-sell-item';

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

if (window.location.pathname.includes('/product/')) {
    document.addEventListener('DOMContentLoaded', async function() {
        const match = window.location.pathname.match(/product\/(\d+)/);
        const productId = match ? match[1] : null;
        if (!productId) return;

        let currentUserId = null;
        try { const user = await apiFetch('/api/user'); currentUserId = user.id; } catch (e) {}

        try {
            const product = await fetch('/api/product/' + productId).then(r => r.json());

            document.getElementById('productName').textContent = product.name;
            document.getElementById('productDetailName').textContent = product.name;
            document.getElementById('productImage').src = '/images/' + product.image;

            const shortDesc = document.getElementById('shortDescription');
            if (shortDesc) shortDesc.textContent = product.short_description || '';

            const fullDesc = document.getElementById('fullDescription');
            if (fullDesc) fullDesc.textContent = product.description || '';

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
                buyBtn.setAttribute('data-product-id', product.id);
                buyBtn.setAttribute('data-product-name', product.name);
                buyBtn.setAttribute('data-product-price', toPersianPrice(finalPrice) + ' تومان');
            }

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

            document.addEventListener('click', async function(e) {
                const buyBtn = e.target.closest('#buyButton');
                if (!buyBtn) return;
                e.preventDefault();
                const productId = buyBtn.getAttribute('data-product-id');
                if (!productId) return;
                const res = await fetch('/api/add_to_cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ product_id: Number(productId) })
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

if (window.location.pathname.includes('/customer')) {
    (function() {
        const container = document.getElementById('ticketsContainer');
        const userDisplay = document.getElementById('userDisplay');
        const newTicketBtn = document.getElementById('newTicketBtn');
        const ticketFormCard = document.getElementById('ticketFormCard');
        const cancelTicketBtn = document.getElementById('cancelTicketBtn');
        const newTicketForm = document.getElementById('newTicketForm');
        const ticketFormMessage = document.getElementById('ticketFormMessage');
        const openCount = document.getElementById('openCount');
        const progressCount = document.getElementById('progressCount');
        const closedCount = document.getElementById('closedCount');

        let pollInterval = null;

        function stopPolling() {
            if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        }

        function startPolling() {
            stopPolling();
            pollInterval = setInterval(loadTickets, 5000);
        }

        function captureReplyDrafts() {
            const drafts = {};
            container.querySelectorAll('.reply-textarea').forEach(textarea => {
                drafts[textarea.id] = {
                    value: textarea.value,
                    selectionStart: textarea.selectionStart,
                    selectionEnd: textarea.selectionEnd,
                    focused: document.activeElement === textarea
                };
            });
            return drafts;
        }

        function restoreReplyDrafts(drafts) {
            Object.entries(drafts).forEach(([id, draft]) => {
                const textarea = document.getElementById(id);
                if (!textarea) return;
                textarea.value = draft.value;
                if (draft.focused) {
                    textarea.focus({ preventScroll: true });
                    textarea.setSelectionRange(draft.selectionStart, draft.selectionEnd);
                }
            });
        }

        function showMessage(el, text, type) {
            el.textContent = text;
            el.className = 'form-message-customer ' + type;
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 5000);
        }

        function updateStats(tickets) {
            const open = tickets.filter(t => t.status === 'open').length;
            const progress = tickets.filter(t => t.status === 'in-progress').length;
            const closed = tickets.filter(t => t.status === 'closed').length;
            
            if (openCount) openCount.textContent = open;
            if (progressCount) progressCount.textContent = progress;
            if (closedCount) closedCount.textContent = closed;
        }

        function getPriorityLabel(priority) {
            const labels = {
                'low': 'کم',
                'normal': 'معمولی',
                'high': 'بالا'
            };
            return labels[priority] || priority;
        }

        function getPriorityClass(priority) {
            const classes = {
                'low': 'priority-low',
                'normal': 'priority-normal',
                'high': 'priority-high'
            };
            return classes[priority] || '';
        }

        function getPriorityIcon(priority) {
            const icons = {
                'low': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                'normal': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
                'high': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
            };
            return icons[priority] || '';
        }

        async function checkUser() {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (response.status === 401) {
                    window.location.href = '/login';
                    return null;
                }
                const user = await response.json();
                if (user && user.id) {
                    userDisplay.innerHTML = `
                        <span class="online-dot"></span>
                        ${user.name} (${user.email})
                    `;
                    return user;
                } else {
                    window.location.href = '/login';
                    return null;
                }
            } catch (e) {
                window.location.href = '/login';
                return null;
            }
        }

        function getStatusText(status) {
            const texts = {
                'open': 'باز',
                'in-progress': 'در حال بررسی',
                'closed': 'بسته'
            };
            return texts[status] || status;
        }

        function getStatusIcon(status) {
            const icons = {
                'open': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                'in-progress': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
                'closed': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
            };
            return icons[status] || '';
        }

        async function loadTickets() {
            if (!container) return;
            const replyDrafts = captureReplyDrafts();
            try {
                const response = await fetch('/api/tickets', { credentials: 'include' });
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                const tickets = await response.json();
                updateStats(tickets);

                if (!tickets || !tickets.length) {
                    container.innerHTML = `
                        <div class="no-ticket">
                            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM6 12h12v2H6zm0-3h12v2H6zm0-3h12v2H6z"/></svg>
                            <h3>هنوز تیکتی ثبت نکرده‌اید</h3>
                            <p>برای دریافت پشتیبانی، دکمه "تیکت جدید" را بزنید.</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = tickets.map(ticket => {
                    const statusText = getStatusText(ticket.status);
                    const statusIcon = getStatusIcon(ticket.status);
                    const replyCount = ticket.replies ? ticket.replies.length : 0;
                    const priorityClass = getPriorityClass(ticket.priority);
                    const priorityLabel = getPriorityLabel(ticket.priority);
                    const priorityIcon = getPriorityIcon(ticket.priority);
                    
                    return `
                        <div class="ticket-card ${ticket.status === 'closed' ? 'closed' : ''}">
                            <div class="ticket-header">
                                <div class="ticket-header-left">
                                    <span class="ticket-id">${escapeHtml(ticket.ticket_id)}</span>
                                    <span class="status-badge status-${ticket.status}">${statusIcon} ${statusText}</span>
                                    <span class="priority-badge ${priorityClass}">${priorityIcon} ${priorityLabel}</span>
                                </div>
                                <span class="ticket-date">
                                    <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                    ${escapeHtml(ticket.date)}
                                </span>
                            </div>
                            <div class="ticket-subject">${escapeHtml(ticket.subject)}</div>
                            <div class="ticket-detail">
                                <div class="detail-row">
                                    <span>
                                        <span class="detail-label">اولویت:</span>
                                        <span class="detail-value">${priorityLabel}</span>
                                    </span>
                                    <span>
                                        <span class="detail-label">وضعیت:</span>
                                        <span class="detail-value">${statusText}</span>
                                    </span>
                                </div>
                                <div class="message-box">${escapeHtml(ticket.message)}</div>
                            </div>
                            <div class="replies-section">
                                <div class="replies-header">
                                    <strong>
                                        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                        پاسخ‌ها
                                    </strong>
                                    <span class="reply-count">${replyCount} پاسخ</span>
                                </div>
                                ${replyCount === 0 ? 
                                    '<div class="no-reply-message">هنوز پاسخی ثبت نشده است.</div>' :
                                    ticket.replies.map(r => `
                                        <div class="reply-bubble ${r.author === 'admin' ? 'admin' : ''}">
                                            <div class="reply-author">
                                                ${r.author === 'admin' ? 
                                                    '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> پشتیبانی' : 
                                                    '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> شما'
                                                }
                                                <span class="author-badge">${r.author === 'admin' ? 'ادمین' : 'کاربر'}</span>
                                            </div>
                                            <div class="reply-text">${escapeHtml(r.text)}</div>
                                            <div class="reply-date">
                                                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                                ${escapeHtml(r.date)}
                                            </div>
                                        </div>
                                    `).join('')
                                }
                            </div>
                            ${ticket.status !== 'closed' ? `
                                <div class="reply-form">
                                    <textarea id="reply-${ticket.ticket_id}" class="reply-textarea" placeholder="پاسخ شما... (Shift+Enter برای خط جدید، Enter برای ارسال)"></textarea>
                                    <button class="send-reply-btn" data-ticket-id="${ticket.ticket_id}">
                                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                        ارسال
                                    </button>
                                </div>
                            ` : `
                                <div class="ticket-closed-badge">
                                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                                    این تیکت بسته شده است.
                                </div>
                            `}
                        </div>
                    `;
                }).join('');

                restoreReplyDrafts(replyDrafts);

                document.querySelectorAll('.reply-textarea').forEach(ta => {
                    ta.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const btn = this.closest('.reply-form').querySelector('.send-reply-btn');
                            if (btn) btn.click();
                        }
                    });
                });

                document.querySelectorAll('.send-reply-btn').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const tid = this.dataset.ticketId;
                        const ta = document.getElementById(`reply-${tid}`);
                        if (!ta) return;
                        const text = ta.value.trim();
                        if (!text) return showAlertModal('پاسخ نمی‌تواند خالی باشد.');
                        
                        this.disabled = true;
                        this.innerHTML = `
                            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                            در حال ارسال...
                        `;
                        
                        try {
                            const response = await fetch(`/api/ticket/reply/${tid}`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reply_text: text })
                            });
                            
                            if (response.status === 401) {
                                window.location.href = '/login';
                                return;
                            }
                            
                            const res = await response.json();
                            if (res.success) {
                                ta.value = '';
                                await loadTickets();
                                startPolling();
                            } else {
                                showAlertModal(res.error || 'خطا');
                            }
                        } catch (err) {
                            showAlertModal('خطا در ارتباط با سرور');
                        } finally {
                            this.disabled = false;
                            this.innerHTML = `
                                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                ارسال
                            `;
                        }
                    });
                });

            } catch (e) {
                console.error('Error loading tickets:', e);
                container.innerHTML = `
                    <div class="no-ticket">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <h3>خطا در بارگذاری</h3>
                        <p>لطفاً دوباره تلاش کنید.</p>
                        <button onclick="location.reload()" style="margin-top:15px; padding:10px 25px; background:#1E3A34; color:white; border:none; border-radius:10px; cursor:pointer; font-family:inherit; font-weight:600;">
                            <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor;vertical-align:middle;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                            تلاش مجدد
                        </button>
                    </div>
                `;
            }
        }

        if (newTicketBtn) {
            newTicketBtn.addEventListener('click', () => {
                ticketFormCard.classList.toggle('open');
                if (ticketFormCard.classList.contains('open')) {
                    newTicketBtn.innerHTML = `
                        <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        بستن فرم
                    `;
                } else {
                    newTicketBtn.innerHTML = `
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                        تیکت جدید
                    `;
                    newTicketForm.reset();
                    ticketFormMessage.style.display = 'none';
                }
            });
        }

        if (cancelTicketBtn) {
            cancelTicketBtn.addEventListener('click', () => {
                ticketFormCard.classList.remove('open');
                newTicketBtn.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    تیکت جدید
                `;
                newTicketForm.reset();
                ticketFormMessage.style.display = 'none';
            });
        }

        if (newTicketForm) {
            newTicketForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const subject = document.getElementById('ticketSubject').value.trim();
                const message = document.getElementById('ticketMessage').value.trim();
                const priority = document.getElementById('ticketPriority').value;

                if (!subject || !message) {
                    showMessage(ticketFormMessage, 'لطفاً موضوع و شرح را وارد کنید.', 'error');
                    return;
                }

                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    در حال ارسال...
                `;

                try {
                    const response = await fetch('/api/ticket', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject, message, priority })
                    });
                    
                    if (response.status === 401) {
                        window.location.href = '/login';
                        return;
                    }
                    
                    const res = await response.json();
                    if (res.success) {
                        showMessage(ticketFormMessage, `✅ تیکت ${res.ticket_id} با موفقیت ثبت شد.`, 'success');
                        newTicketForm.reset();
                        ticketFormCard.classList.remove('open');
                        newTicketBtn.innerHTML = `
                            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                            تیکت جدید
                        `;
                        await loadTickets();
                        startPolling();
                    } else {
                        showMessage(ticketFormMessage, res.error || 'خطا در ثبت تیکت', 'error');
                    }
                } catch (err) {
                    showMessage(ticketFormMessage, 'خطا در ارتباط با سرور', 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `
                        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        ارسال تیکت
                    `;
                }
            });
        }

        checkUser().then(user => {
            if (user) {
                loadTickets();
                startPolling();
            }
        });

        window.addEventListener('beforeunload', stopPolling);

    })();
}

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

    async function adminApiFetch(url, options = {}) {
        const headers = { ...options.headers, 'X-Admin-Token': adminToken };
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json', ...headers },
            ...options,
            credentials: 'include'
        });
        if (res.status === 403) {
            sessionStorage.removeItem('adminToken');
            await showAlertModal('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
            window.location.href = '/admin';
            throw new Error('Token expired');
        }
        return res.json();
    }

    const ticketsContainer = document.getElementById('ticketsContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const productsContainer = document.getElementById('productsContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAllTicketsBtn = document.getElementById('deleteAllTicketsBtn');

    function captureAdminReplyDrafts() {
        const drafts = {};
        ticketsContainer.querySelectorAll('.admin-reply-textarea').forEach(textarea => {
            drafts[textarea.id] = {
                value: textarea.value,
                selectionStart: textarea.selectionStart,
                selectionEnd: textarea.selectionEnd,
                focused: document.activeElement === textarea
            };
        });
        return drafts;
    }

    function restoreAdminReplyDrafts(drafts) {
        Object.entries(drafts).forEach(([id, draft]) => {
            const textarea = document.getElementById(id);
            if (!textarea) return;
            textarea.value = draft.value;
            if (draft.focused) {
                textarea.focus({ preventScroll: true });
                textarea.setSelectionRange(draft.selectionStart, draft.selectionEnd);
            }
        });
    }
    const deleteAllMessagesBtn = document.getElementById('deleteAllMessagesBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productModalTitle = document.getElementById('productModalTitle');
    const ticketCount = document.getElementById('ticketCount');
    const messageCount = document.getElementById('messageCount');
    const productCount = document.getElementById('productCount');

    let pollInterval = null;
    let editingProductId = null;

    function stopPolling() {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    }

    function isAnyTextareaFocused() {
        return document.activeElement && document.activeElement.classList.contains('admin-reply-textarea');
    }

    function startPollingForActiveTab() {
        stopPolling();
        const activeTab = document.querySelector('.tab-btn.active');
        if (!activeTab) return;
        const tab = activeTab.dataset.tab;
        if (tab === 'tickets') {
            renderTickets();
            if (!isAnyTextareaFocused()) {
                pollInterval = setInterval(renderTickets, 5000);
            }
        } else if (tab === 'messages') {
            loadContacts();
            pollInterval = setInterval(loadContacts, 5000);
        } else if (tab === 'products') {
            loadProducts();
        }
    }

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

    function getPriorityLabel(priority) {
        const labels = { 'low': 'کم', 'normal': 'معمولی', 'high': 'بالا' };
        return labels[priority] || priority;
    }

    function getPriorityClass(priority) {
        const classes = { 'low': 'priority-low', 'normal': 'priority-normal', 'high': 'priority-high' };
        return classes[priority] || '';
    }

    async function renderTickets() {
        if (!ticketsContainer) return;
        const replyDrafts = captureAdminReplyDrafts();
        try {
            const tickets = await adminApiFetch('/api/admin/tickets');
            if (ticketCount) ticketCount.textContent = tickets.length;

            if (!tickets.length) {
                ticketsContainer.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM6 12h12v2H6zm0-3h12v2H6zm0-3h12v2H6z"/></svg>
                        <h3>هیچ تیکتی ثبت نشده است</h3>
                        <p>همه تیکت‌های کاربران در اینجا نمایش داده می‌شوند.</p>
                    </div>
                `;
                return;
            }

            ticketsContainer.innerHTML = tickets.map(t => `
                <div class="ticket-admin-card">
                    <div class="ticket-header">
                        <div class="ticket-meta">
                            <span class="ticket-id-badge">${t.ticket_id}</span>
                            <span class="priority-badge ${getPriorityClass(t.priority)}">${getPriorityLabel(t.priority)}</span>
                            <span class="ticket-date">
                                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                ${t.date}
                            </span>
                        </div>
                        <select class="status-select" data-id="${t.id}">
                            <option value="open" ${t.status==='open'?'selected':''}>باز</option>
                            <option value="in-progress" ${t.status==='in-progress'?'selected':''}>در حال بررسی</option>
                            <option value="closed" ${t.status==='closed'?'selected':''}>بسته</option>
                        </select>
                    </div>
                    <div class="customer-info">
                        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <strong>${escapeHtml(t.user_name)}</strong>
                        <span style="color:#95a5a6;">•</span>
                        ${escapeHtml(t.user_email)}
                    </div>
                    <div class="ticket-subject">${escapeHtml(t.subject)}</div>
                    <div class="message-content">${escapeHtml(t.message)}</div>
                    <div class="replies-box">
                        <div class="replies-header">
                            <strong>
                                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                پاسخ‌ها
                            </strong>
                            <span style="font-size:13px; color:#95a5a6;">${t.replies.length} پاسخ</span>
                        </div>
                        ${t.replies.length===0 ? '<p style="color:#b0a8a0; font-size:14px;">هنوز پاسخی ثبت نشده.</p>' : 
                            t.replies.map(r => `
                                <div class="reply-item ${r.author==='admin'?'admin-reply':''}">
                                    <div class="reply-author">
                                        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        ${r.author==='admin' ? 'ادمین' : 'کاربر'}
                                        <span class="role-badge ${r.author}">${r.author==='admin' ? 'ادمین' : 'کاربر'}</span>
                                    </div>
                                    <div class="reply-text">${escapeHtml(r.text)}</div>
                                    <div class="reply-date">
                                        <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                        ${r.date}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div class="admin-reply-form">
                        <textarea id="admin-reply-${t.id}" class="admin-reply-textarea" placeholder="پاسخ ادمین را بنویسید... (Enter برای ارسال)"></textarea>
                        <button class="admin-reply-btn" data-id="${t.id}">
                            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            ارسال
                        </button>
                    </div>
                </div>
            `).join('');

            restoreAdminReplyDrafts(replyDrafts);

            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', async function() {
                    await adminApiFetch(`/api/admin/update_status/${this.dataset.id}`, {
                        method: 'POST',
                        body: JSON.stringify({ status: this.value })
                    });
                    renderTickets();
                });
            });

            document.querySelectorAll('.admin-reply-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const ta = document.getElementById(`admin-reply-${this.dataset.id}`);
                    if (!ta) return;
                    const text = ta.value.trim();
                    if (!text) return showAlertModal('پاسخ نمی‌تواند خالی باشد.');

                    this.disabled = true;
                    this.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15L17 12.23l-4-2.37V7z"/></svg> در حال ارسال...';

                    await adminApiFetch(`/api/admin/reply/${this.dataset.id}`, {
                        method: 'POST',
                        body: JSON.stringify({ reply_text: text })
                    });
                    this.disabled = false;
                    this.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> ارسال';
                    renderTickets();
                });
            });

            document.querySelectorAll('.admin-reply-textarea').forEach(ta => {
                ta.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const btn = this.closest('.admin-reply-form').querySelector('.admin-reply-btn');
                        if (btn) btn.click();
                    }
                });
            });

        } catch (e) {
            console.error(e);
            ticketsContainer.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <h3>خطا در بارگذاری</h3>
                    <p>لطفاً دوباره تلاش کنید.</p>
                </div>
            `;
        }
    }

    async function loadContacts() {
        if (!messagesContainer) return;
        try {
            const messages = await adminApiFetch('/api/admin/contacts');
            if (messageCount) messageCount.textContent = messages.length;

            if (!messages.length) {
                messagesContainer.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        <h3>هیچ پیامی دریافت نشده است</h3>
                        <p>پیام‌های کاربران در اینجا نمایش داده می‌شوند.</p>
                    </div>
                `;
                return;
            }

            messagesContainer.innerHTML = messages.map(m => `
                <div class="message-card">
                    <div class="message-header">
                        <div class="message-meta">
                            <span class="sender-name">${escapeHtml(m.name)}</span>
                            <span class="sender-email">
                                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                ${escapeHtml(m.email)}
                            </span>
                            <span class="msg-date">
                                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                                ${m.date}
                            </span>
                        </div>
                        <button class="delete-btn" data-id="${m.id}">
                            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            حذف
                        </button>
                    </div>
                    <div class="msg-subject">${escapeHtml(m.subject)}</div>
                    <div class="msg-body">${escapeHtml(m.message)}</div>
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

        } catch (e) {
            console.error(e);
        }
    }

    async function loadProducts() {
        if (!productsContainer) return;
        try {
            const products = await fetch('/api/products').then(r => r.json());
            if (productCount) productCount.textContent = products.length;

            if (!products.length) {
                productsContainer.innerHTML = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                        <h3>هیچ محصولی ثبت نشده است</h3>
                        <p>برای افزودن محصول جدید، دکمه "افزودن محصول جدید" را بزنید.</p>
                    </div>
                `;
                return;
            }

            productsContainer.innerHTML = `
                <div class="products-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>تصویر</th>
                                <th>نام</th>
                                <th>دسته</th>
                                <th>قیمت</th>
                                <th>تخفیف</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => `
                                <tr>
                                    <td><img src="/images/${p.image}" alt="${escapeHtml(p.name)}"></td>
                                    <td class="product-name-cell">${escapeHtml(p.name)}</td>
                                    <td>${p.category === 'coffee' ? '☕ قهوه' : '🍰 کیک'}</td>
                                    <td class="price-cell">${p.price.toLocaleString()} تومان</td>
                                    <td>${p.discount > 0 ? p.discount + '%' : '—'}</td>
                                    <td>
                                        <div class="product-actions">
                                            <button class="btn-sm btn-edit" data-id="${p.id}">
                                                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                                ویرایش
                                            </button>
                                            <button class="btn-sm btn-delete" data-id="${p.id}">
                                                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => openEditModal(btn.dataset.id));
            });
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
            });

        } catch (e) {
            console.error(e);
        }
    }

    addProductBtn?.addEventListener('click', () => {
        editingProductId = null;
        productModalTitle.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            افزودن محصول جدید
        `;
        productForm.reset();
        document.getElementById('prodCategory').value = 'coffee';
        document.getElementById('prodDiscount').value = '0';
        document.getElementById('productModal').classList.add('show');
    });

    async function openEditModal(productId) {
        try {
            const products = await fetch('/api/products').then(r => r.json());
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
            if (specsTextarea && product.specs) {
                try {
                    const specsObj = JSON.parse(product.specs);
                    specsTextarea.value = Object.entries(specsObj).map(([k, v]) => `${k}: ${v}`).join('\n');
                } catch { specsTextarea.value = ''; }
            }
            document.getElementById('prodDiscount').value = product.discount || 0;
            productModalTitle.innerHTML = `
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                ویرایش محصول
            `;
            document.getElementById('productModal').classList.add('show');
        } catch (e) { console.error(e); }
    }

    cancelProductBtn?.addEventListener('click', () => {
        document.getElementById('productModal').classList.remove('show');
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

        const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products';
        const method = editingProductId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'X-Admin-Token': adminToken },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('productModal').classList.remove('show');
                loadProducts();
                showAlertModal(editingProductId ? '✅ محصول با موفقیت ویرایش شد.' : '✅ محصول جدید اضافه شد.');
            } else {
                showAlertModal(data.error || 'خطا');
            }
        } catch (err) { console.error(err); }
    });

    async function deleteProduct(productId) {
        const sure = await showConfirmModal('آیا از حذف این محصول اطمینان دارید؟');
        if (!sure) return;
        try {
            await adminApiFetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
            loadProducts();
            showAlertModal('✅ محصول حذف شد.');
        } catch (e) { console.error(e); }
    }

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
    startPollingForActiveTab();
})();

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

(function() {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    function toPersianNumber(text) {
        return text.replace(/[0-9]/g, d => persianDigits[d]);
    }

    function convertTextNode(node) {
        if (node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent)) {
            node.textContent = toPersianNumber(node.textContent);
        }
    }

    function convertPlaceholder(el) {
        if (el.placeholder && /\d/.test(el.placeholder)) {
            el.placeholder = toPersianNumber(el.placeholder);
        }
        if (el.value && /\d/.test(el.value) && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
            el.value = toPersianNumber(el.value);
        }
    }

    function walkDOM(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.parentNode && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.nodeName)) {
                convertTextNode(node);
            }
        }
        root.querySelectorAll?.('input, textarea').forEach(el => convertPlaceholder(el));
    }

    document.addEventListener('DOMContentLoaded', () => {
        walkDOM(document.body);
    });

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

if (window.location.pathname.includes('/coffee')) {
    loadCategoryPage('coffee', 'coffeeContainer');
}
if (window.location.pathname.includes('/cake')) {
    loadCategoryPage('cake', 'cakeContainer');
}

// ======================== چت بات هوشمند ========================

const chatToggle = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSendBtn');
const chatMessages = document.getElementById('chatMessages');

let isChatOpen = false;

chatToggle?.addEventListener('click', function() {
    isChatOpen = !isChatOpen;
    chatWindow.style.display = isChatOpen ? 'flex' : 'none';
    if (isChatOpen) chatInput.focus();
});


// وقتی تب عوض می‌شه
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');

        if (btn.dataset.tab === 'orders') loadOrders();
        // بقیه تب‌ها رو هم مثل قبل نگه دار
    });
});

async function loadOrders() {
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '<div class="empty-state"><p>در حال بارگذاری...</p></div>';

    try {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) throw new Error('خطا در دریافت سفارشات');
        const orders = await res.json();

        document.getElementById('orderCount').textContent = orders.length;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>هنوز سفارشی ثبت نشده</h3>
                    <p>وقتی کاربران محصولی به سبد اضافه کنند، اینجا نمایش داده می‌شود.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="products-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>محصول</th>
                            <th>قیمت</th>
                            <th>کاربر</th>
                            <th>ایمیل</th>
                            <th>تاریخ</th>
                            <th>وضعیت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td>${o.id}</td>
                                <td class="product-name-cell">${o.product_name}</td>
                                <td class="price-cell">${Number(o.price).toLocaleString('fa-IR')} تومان</td>
                                <td>${o.user_name}</td>
                                <td>${o.user_email}</td>
                                <td>${o.date}</td>
                                <td>
                                    <select class="status-select" data-id="${o.id}" onchange="updateOrderStatus(${o.id}, this.value)">
                                        ${['در حال پردازش', 'در حال آماده‌سازی', 'ارسال شده', 'تحویل داده شده', 'لغو شده']
                                            .map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                                    </select>
                                </td>
                                <td>
                                    <button class="btn-sm btn-delete" onclick="deleteOrder(${o.id})">حذف</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><p style="color:#e74c3c">${err.message}</p></div>`;
    }
}

async function updateOrderStatus(id, status) {
    try {
        const res = await fetch(`/api/admin/orders/${id}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!data.success) alert(data.error || 'خطا');
    } catch (e) {
        alert('خطا در به‌روزرسانی وضعیت');
    }
}

async function deleteOrder(id) {
    if (!confirm('آیا از حذف این سفارش مطمئن هستید؟')) return;
    try {
        const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) loadOrders();
        else alert(data.error || 'خطا');
    } catch (e) {
        alert('خطا در حذف سفارش');
    }
}

function closeChat() {
    isChatOpen = false;
    chatWindow.style.display = 'none';
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;

    const loading = addMessage('⏳ در حال تایپ...', 'bot');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        loading.remove();

        if (data.success) {
            addMessage(data.reply, 'bot');
        } else {
            addMessage('❌ ' + data.error, 'bot');
        }
    } catch (err) {
        loading.remove();
        addMessage('❌ خطا در ارتباط با سرور', 'bot');
    }

    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.focus();
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.style.cssText = `
        background: ${sender === 'user' ? '#1E3A34' : 'white'};
        color: ${sender === 'user' ? 'white' : '#333'};
        padding: 12px 16px;
        border-radius: 14px;
        max-width: 85%;
        margin-bottom: 12px;
        ${sender === 'user' ? 'margin-right: auto;' : 'border-right: 3px solid #1E3A34;'}
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        word-wrap: break-word;
        white-space: pre-wrap;
        font-size: 14px;
        line-height: 1.7;
        align-self: ${sender === 'user' ? 'flex-end' : 'flex-start'};
    `;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

chatSend?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
