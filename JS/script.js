const header = document.getElementById("header");
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});


const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

if (tabButtons.length > 0 && tabContents.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const activeTabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(activeTabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });

    let activeButtonFound = false;
    tabButtons.forEach(button => {
        if (button.classList.contains('active')) {
            activeButtonFound = true;
            const activeTabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(activeTabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        }
    });

    if (!activeButtonFound && tabButtons.length > 0) {
        tabButtons[0].classList.add('active');
        const firstTabId = tabButtons[0].getAttribute('data-tab');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
} else {
    console.warn("Tab elements not found or incomplete. Tab functionality might not work.");
}



const reviewForm = document.getElementById('addReviewForm');
const reviewTextarea = document.getElementById('reviewText');
const reviewsList = document.querySelector('.reviews-list');

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;

}
const loggedInUsername = localStorage.getItem('loggedInUsername');
const userName = `${loggedInUsername}`;

const userAvatar = "../images/user.png"; 

if (reviewForm && reviewTextarea) {
    reviewForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const reviewContent = reviewTextarea.value.trim(); 

        if (reviewContent === "") {
            alert("لطفاً نظر خود را وارد کنید.");
            return; 
        }

        const newReviewElement = document.createElement('div');
        newReviewElement.classList.add('review');
        

        newReviewElement.innerHTML = `
            <div class="review-author">
                <img src="${userAvatar}" alt="${userName}'s avatar">
                <span>${userName}</span>
            </div>
            <div class="review-content">
                <p>${reviewContent}</p>
                <span class="review-date">${getCurrentDate()}</span>
            </div>
        `;

        if (reviewsList) {
            reviewsList.prepend(newReviewElement); 
        } 
        else {
            console.error("Element with class 'reviews-list' not found!");
            const reviewsTab = document.getElementById('reviews');
            if (reviewsTab) {
                const formElement = reviewsTab.querySelector('.add-review-form');
                if(formElement) {
                    reviewsTab.insertBefore(newReviewElement, formElement);
                } else {
                    reviewsTab.appendChild(newReviewElement);
                }
            } else {
                console.error("Fallback element with ID 'reviews' also not found!");
            }
        }
        reviewTextarea.value = ""; 
        alert("نظر شما با موفقیت ثبت شد!");
    });
} else {
    console.error("Form with ID 'addReviewForm' or Textarea with ID 'reviewText' not found!");
}




document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.story-section, .mission-values-section, .about-gallery-section');

    const observerOptions = {
        root: null, 
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const subject = formData.get('subject').trim();
            const message = formData.get('message').trim();

            
            if (!name || !email || !message) {
                showMessage('لطفاً تمام فیلدهای ضروری را پر کنید.', 'error');
                return;
            }


            const newMessage = {
                name: name,
                email: email,
                subject: subject || 'بدون موضوع',
                message: message,
                date: new Date().toLocaleString('fa-IR')
            };
            let allMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            allMessages.push(newMessage);
            localStorage.setItem('contactMessages', JSON.stringify(allMessages));


            showMessage('پیام شما با موفقیت ارسال شد. ممنون از تماس شما!', 'success');


            contactForm.reset();
        });
    }

    function showMessage(msg, type) {
        if (formMessage) {
            formMessage.textContent = msg;
            formMessage.className = `form-message ${type}`;

            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 5000);
        }
    }
});



    document.addEventListener('DOMContentLoaded', function() {
        const superSellContainer = document.getElementById('superSellContainer'); 

        if (superSellContainer) {
            let isDown = false;
            let startX;
            let scrollLeft;

            superSellContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                superSellContainer.classList.add('active'); 
                startX = e.pageX - superSellContainer.offsetLeft;
                scrollLeft = superSellContainer.scrollLeft;
                e.preventDefault();
            });

            superSellContainer.addEventListener('mouseleave', () => {
                isDown = false;
                superSellContainer.classList.remove('active');
            });

            superSellContainer.addEventListener('mouseup', () => {
                isDown = false;
                superSellContainer.classList.remove('active');
            });

            superSellContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - superSellContainer.offsetLeft;
                const walk = (x - startX) * 1.5; 
                superSellContainer.scrollLeft = scrollLeft - walk;
            });


            function adjustSuperSellLayout() {
                const mobileMaxWidth = 768; 
                const isMobile = window.innerWidth <= mobileMaxWidth;

                superSellContainer.style.display = 'flex';
                superSellContainer.style.flexWrap = 'nowrap !important';
                superSellContainer.style.overflowX = 'auto';
                superSellContainer.style.whiteSpace = 'nowrap';

                const items = superSellContainer.querySelectorAll('.super-sell-item, .super-sell-item-1, .super-sell-item-2');

                items.forEach(item => {
                    item.style.display = 'inline-block';
                    item.style.verticalAlign = 'top';
                    item.style.whiteSpace = 'normal';
                    item.style.flexShrink = '0';

                    if (isMobile) {
                        item.style.width = '280px';
                        item.style.marginRight = '8px'; 
                    } else {
                        item.style.width = '300px';
                        item.style.marginRight = '10px'; 
                    }
                });
            }

            adjustSuperSellLayout();
            window.addEventListener('resize', adjustSuperSellLayout);
        }
    });





document.addEventListener('DOMContentLoaded', function() {
    const superSellContainer = document.getElementById('superSellContainer');
    if (superSellContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        superSellContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            superSellContainer.classList.add('active');
            startX = e.pageX - superSellContainer.offsetLeft;
            scrollLeft = superSellContainer.scrollLeft;
            e.preventDefault();
        });

        superSellContainer.addEventListener('mouseleave', () => {
            isDown = false;
            superSellContainer.classList.remove('active');
        });

        superSellContainer.addEventListener('mouseup', () => {
            isDown = false;
            superSellContainer.classList.remove('active');
        });

        superSellContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - superSellContainer.offsetLeft;
            const walk = (x - startX) * 1.5;
            superSellContainer.scrollLeft = scrollLeft - walk;
        });

        function adjustSuperSellLayout() {
            const mobileMaxWidth = 768;
            const isMobile = window.innerWidth <= mobileMaxWidth;

            superSellContainer.style.display = 'flex';
            superSellContainer.style.flexWrap = 'nowrap !important';
            superSellContainer.style.overflowX = 'auto';
            superSellContainer.style.whiteSpace = 'nowrap';

            const items = superSellContainer.querySelectorAll('.super-sell-item, .super-sell-item-1, .super-sell-item-2');

            items.forEach(item => {
                item.style.display = 'inline-block';
                item.style.verticalAlign = 'top';
                item.style.whiteSpace = 'normal';
                item.style.flexShrink = '0';

                if (isMobile) {
                    item.style.width = '280px';
                    item.style.marginRight = '8px';
                } else {
                    item.style.width = '300px';
                    item.style.marginRight = '10px';
                }
            });
        }

        adjustSuperSellLayout();
        window.addEventListener('resize', adjustSuperSellLayout);
    }

    const serviceCards = document.querySelectorAll('.services-grid .service-card');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            } 
            else {

                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    serviceCards.forEach(card => {
        observer.observe(card);
    });
});



const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResults');

if (searchInput && searchResultsContainer) {
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm === "") {
            searchResultsContainer.innerHTML = "";
            searchResultsContainer.style.display = 'none';
            return;
        }

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        displaySearchResults(filteredProducts);
    });

    function displaySearchResults(results) {
        searchResultsContainer.innerHTML = "";

        if (results.length > 0) {
            results.forEach(product => {
                const productElement = document.createElement('a'); 
                productElement.href = product.link; 
                productElement.classList.add('search-result-item'); 

                productElement.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-thumbnail">
                    <div class="product-info">
                        <span class="product-name">${product.name}</span>
                        <span class="product-price">${product.price}</span>
                    </div>
                `;

                searchResultsContainer.appendChild(productElement); 
            });
            searchResultsContainer.style.display = 'block';
        } else {
            searchResultsContainer.innerHTML = "<div class='no-results'>نتیجه‌ای یافت نشد.</div>";
            searchResultsContainer.style.display = 'block'; 
        }
    }


    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !searchResultsContainer.contains(event.target)) {
            searchResultsContainer.innerHTML = "";
            searchResultsContainer.style.display = 'none';
        }
    });

} else {
    console.warn("Search input or results container not found. Search functionality might not work.");
}

const products = [
    {
        id: 1,
        name: "آیس ماچا",
        price: "۳۰۰,۰۰۰ تومان",
        link: "../html/product1.html", 
        imageUrl: "../images/item1.png" 
    },
    {
        id: 2,
        name: "کاپوچینو",
        price: "۱۰۰,۰۰۰ تومان",
        link: "../html/product2.html",
        imageUrl: "../images/item2.png"
    },
    {
        id: 3,
        name: "امریکانو",
        price: "۱۲۰,۰۰۰ تومان",
        link: "../html/product3.html",
        imageUrl: "../images/item3.png"
    },
    {
        id: 4,
        name: "کارامل لته",
        price: "۱۵۰,۰۰۰ تومان",
        link: "../html/product4.html",
        imageUrl: "../images/item4.png"
    },
    {
        id: 5,
        name: "وانیل چیزکیک",
        price: "۳۵۰,۰۰۰ تومان",
        link: "../html/product5.html",
        imageUrl: "../images/item5.png"
    },
    {
        id: 6,
        name: "نیویورک چیزکیک",
        price: "۷۰۰,۰۰۰ تومان",
        link: "../html/product6.html",
        imageUrl: "../images/item6.png"
    },
    {
        id: 7,
        name: "استرابری چیزکیک",
        price: "۴۰۰,۰۰۰ تومان",
        link: "../html/product7.html",
        imageUrl: "../images/item7.png"
    },
    {
        id: 8,
        name: "چاکلت چیزکیک",
        price: "۵۰۰,۰۰۰ تومان",
        link: "../html/product8.html",
        imageUrl: "../images/item8.png"
    },
    
];


// ======================================================
//  توابع کمکی مودال
// ======================================================
function showConfirmModal(message) {
    return new Promise((resolve) => {
        const msgEl = document.getElementById('confirmModalMessage');
        const overlay = document.getElementById('confirmModal');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        if (!msgEl || !overlay || !yesBtn || !noBtn) {
            return resolve(confirm(message));
        }
        msgEl.textContent = message;
        overlay.style.display = 'flex';
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
        const overlay = document.getElementById('alertModal');
        const okBtn = document.getElementById('alertOk');
        if (!msgEl || !overlay || !okBtn) {
            alert(message);
            return resolve();
        }
        msgEl.textContent = message;
        overlay.style.display = 'flex';
        const onOk = () => {
            overlay.style.display = 'none';
            okBtn.removeEventListener('click', onOk);
            resolve();
        };
        okBtn.addEventListener('click', onOk);
    });
}

function showPasswordPrompt(message) {
    return new Promise((resolve) => {
        const msgEl = document.getElementById('passwordModalMessage');
        const overlay = document.getElementById('passwordModal');
        const input = document.getElementById('passwordInput');
        const submitBtn = document.getElementById('passwordSubmit');
        const cancelBtn = document.getElementById('passwordCancel');
        if (!msgEl || !overlay || !input || !submitBtn || !cancelBtn) {
            const pass = prompt(message);
            return resolve(pass || null);
        }
        msgEl.textContent = message;
        overlay.style.display = 'flex';
        input.value = '';
        input.focus();
        const cleanup = () => {
            overlay.style.display = 'none';
            submitBtn.removeEventListener('click', onSubmit);
            cancelBtn.removeEventListener('click', onCancel);
        };
        const onSubmit = () => {
            const password = input.value.trim();
            if (!password) {
                alert('لطفاً رمز عبور را وارد کنید');
                input.focus();
                return;
            }
            cleanup();
            resolve(password);
        };
        const onCancel = () => { cleanup(); resolve(null); };
        submitBtn.addEventListener('click', onSubmit);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// ========== تابع تولید شناسه تصادفی تیکت ==========
function generateTicketId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TKT-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ========== اجرای اصلی برنامه ==========
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loggedInUsername = localStorage.getItem('loggedInUsername');
    const currentUserEmail = localStorage.getItem('currentUserEmail');

    // ---------- ۱. لینک هدر ----------
    const loginStatusLink = document.getElementById('loginStatusLink');
    if (loginStatusLink) {
        if (isLoggedIn === 'true' && loggedInUsername) {
            loginStatusLink.textContent = 'حساب کاربری';
            loginStatusLink.href = 'account.html';
        } else {
            loginStatusLink.textContent = 'ورود / ثبت نام';
            loginStatusLink.href = 'login.html';
        }
    }

    if (window.location.pathname.includes('login.html') && isLoggedIn === 'true') {
        window.location.href = 'home.html';
        return;
    }

    // ---------- ۲. ثبت‌نام ----------
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirmPassword').value;

            if (!name || !email || !password || !confirm) return alert('لطفاً تمام فیلدها را پر کنید.');
            if (password !== confirm) return alert('رمز عبور و تکرار آن مطابقت ندارند!');
            if (password.length < 5) return alert('رمز عبور باید حداقل ۵ حرف باشد.');

            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.some(u => u.email === email)) {
                alert('این ایمیل قبلاً ثبت‌نام کرده است.');
                return;
            }
            users.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            alert('ثبت‌نام با موفقیت انجام شد!');
            window.location.href = 'login.html';
        });
    }

    // ---------- ۳. ورود ----------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                alert('ایمیل یا رمز عبور اشتباه است.');
                return;
            }
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUsername', user.name || email);
            localStorage.setItem('currentUserEmail', user.email);
            alert('ورود موفقیت‌آمیز بود!');
            window.location.href = 'home.html';
        });
    }

    // ---------- ۴. خروج از حساب ----------
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const sure = await showConfirmModal('آیا از خروج از حساب کاربری خود مطمئن هستید؟');
            if (sure) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUsername');
                localStorage.removeItem('currentUserEmail');
                window.location.href = 'login.html';
            }
        });
    }

    // ---------- ۵. صفحه حساب ----------
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const accountTabs = document.querySelectorAll('.account-tab');
    const profileNameSpan = document.getElementById('profileName');
    const profileEmailSpan = document.getElementById('profileEmail');

    function loadProfile() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const email = localStorage.getItem('currentUserEmail');
        const loggedIn = localStorage.getItem('isLoggedIn');
        if (loggedIn === 'true' && email) {
            const currentUser = users.find(u => u.email === email);
            if (currentUser) {
                if (profileNameSpan) profileNameSpan.textContent = currentUser.name || 'کاربر';
                if (profileEmailSpan) profileEmailSpan.textContent = currentUser.email;
                window.currentUser = currentUser;
            } else {
                if (profileNameSpan) profileNameSpan.textContent = 'مهمان';
                if (profileEmailSpan) profileEmailSpan.textContent = '';
                window.currentUser = null;
            }
        } else {
            if (profileNameSpan) profileNameSpan.textContent = 'مهمان';
            if (profileEmailSpan) profileEmailSpan.textContent = '';
            window.currentUser = null;
            if (window.location.pathname.includes('account.html')) {
                alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
                window.location.href = 'login.html';
            }
        }
    }

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
                    const target = document.getElementById(tabId);
                    if (target) target.classList.add('active');
                    if (tabId === 'order-history') displayOrders();
                }
            });
        });
        if (!document.querySelector('.sidebar-menu a.active-menu-item')) {
            const first = sidebarLinks[0];
            if (first && first.id !== 'logoutLink') first.click();
        }
    }

    if (document.getElementById('profileName') || window.location.pathname.includes('account.html')) {
        loadProfile();
        if (typeof displayOrders === 'function') displayOrders();
    }

    // ---------- ۶. تغییر رمز عبور ----------
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!window.currentUser) {
                alert('اطلاعات کاربر در دسترس نیست.');
                window.location.href = 'login.html';
                return;
            }
            const current = document.getElementById('currentPassword').value.trim();
            const newPass = document.getElementById('newPassword').value.trim();
            const confirm = document.getElementById('confirmNewPassword').value.trim();
            if (!current || !newPass || !confirm) return alert('همه فیلدها را پر کنید.');
            if (current !== window.currentUser.password) return alert('رمز فعلی اشتباه است.');
            if (newPass !== confirm) return alert('رمز جدید و تکرار آن مطابقت ندارند.');
            if (newPass.length < 5) return alert('رمز جدید باید حداقل ۵ حرف باشد.');

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const email = window.currentUser.email;
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                users[userIndex].password = newPass;
                localStorage.setItem('users', JSON.stringify(users));
                window.currentUser.password = newPass;
                alert('رمز عبور با موفقیت تغییر کرد!');
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
            } else {
                alert('خطا در بروزرسانی رمز. لطفاً دوباره وارد شوید.');
            }
        });
    }

    // ---------- ۷. افزودن به سبد خرید ----------
    const buyButtons = document.querySelectorAll('.buy-button');
    if (buyButtons.length > 0) {
        buyButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const productName = this.getAttribute('data-product-name');
                const productPrice = this.getAttribute('data-product-price');
                if (!productName || !productPrice) {
                    alert("خطا در دریافت اطلاعات محصول.");
                    return;
                }
                const ordersString = localStorage.getItem('userOrders');
                let orders = [];
                if (ordersString) {
                    try { orders = JSON.parse(ordersString); } catch (e) { orders = []; }
                }
                orders.push({
                    productName: productName,
                    price: productPrice,
                    orderDate: new Date().toLocaleDateString('fa-IR'),
                    status: 'در حال پردازش'
                });
                localStorage.setItem('userOrders', JSON.stringify(orders));
                alert(`${productName} به سبد خرید اضافه شد!`);
                window.location.href = 'account.html';
            });
        });
    }

    // ---------- ۸. پاک کردن سبد خرید ----------
    const clearCartButton = document.getElementById('clearCartButton');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', async function() {
            const sure = await showConfirmModal('آیا از پاک کردن کل سبد خرید مطمئن هستید؟');
            if (sure) {
                localStorage.removeItem('userOrders');
                alert('سبد خرید پاک شد.');
                if (typeof displayOrders === 'function') displayOrders();
            }
        });
    }

    // ---------- ۹. ثبت تیکت ----------
    const ticketForm = document.getElementById('ticketForm');
    const formMessage = document.getElementById('formMessage');

    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const subject = document.getElementById('subject')?.value.trim() || '';
            const message = document.getElementById('message')?.value.trim() || '';
            const priority = document.getElementById('priority')?.value || 'normal';

            if (formMessage) {
                formMessage.style.display = 'none';
                formMessage.innerHTML = '';
            }

            if (!name || !email || !subject || !message) {
                if (formMessage) {
                    formMessage.textContent = 'لطفاً تمام فیلدهای ضروری را پر کنید.';
                    formMessage.className = 'form-message error';
                    formMessage.style.display = 'block';
                }
                return;
            }

            const ticket = {
                id: generateTicketId(),
                name, email, subject, message, priority,
                date: new Date().toLocaleString('fa-IR'),
                status: 'open',
                replies: []
            };

            const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
            tickets.push(ticket);
            localStorage.setItem('tickets', JSON.stringify(tickets));

            if (formMessage) {
                formMessage.innerHTML = `
                    <strong>✅ تیکت شما با موفقیت ثبت شد.</strong><br>
                    شناسه: <span style="direction:ltr;display:inline-block;">${ticket.id}</span><br>
                    <a href="customer.html">رفتن به پرتال مشتریان</a>
                `;
                formMessage.className = 'form-message success';
                formMessage.style.display = 'block';
            }

            ticketForm.reset();
        });
    }

    // ---------- ۱۰. فرم تماس با ما (با استفاده از FormData) ----------
    const contactForm = document.getElementById('contactForm');
    const contactFormMsg = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // خواندن ایمن تمام فیلدها از طریق FormData
            const callformData = new FormData(contactForm);
            const callname = (formData.get('name') || '').trim();
            const callemail = (formData.get('email') || '').trim();
            const callsubject = (formData.get('subject') || '').trim();
            const callmessage = (formData.get('message') || '').trim();

            // پاک کردن پیغام قبلی
            if (contactFormMsg) {
                contactFormMsg.style.display = 'none';
                contactFormMsg.innerHTML = '';
            }

            // بررسی فیلدهای ضروری
            if (!callname || !callemail || !callmessage) {
                if (contactFormMsg) {
                    contactFormMsg.textContent = 'لطفاً نام، ایمیل و متن پیام را پر کنید.';
                    contactFormMsg.className = 'form-message error';
                    contactFormMsg.style.display = 'block';
                }
                return;
            }

            const newMessage = {
                callname,
                callemail,
                callsubject: subject || 'بدون موضوع',
                callmessage,
                date: new Date().toLocaleString('fa-IR')
            };

            const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
            messages.push(newMessage);
            localStorage.setItem('contactMessages', JSON.stringify(messages));

            if (contactFormMsg) {
                contactFormMsg.innerHTML = '<strong>✅ پیام شما با موفقیت ارسال شد.</strong>';
                contactFormMsg.className = 'form-message success';
                contactFormMsg.style.display = 'block';
            }

            contactForm.reset();
        });
    }

    // ---------- ۱۱. پرتال مشتریان (جستجوی تیکت + به‌روزرسانی خودکار + قفل پاسخ) ----------
    const searchBtn = document.getElementById('searchBtn');
    const searchQuery = document.getElementById('searchQuery');
    const portalContainer = document.getElementById('ticketsContainer');

    if (searchBtn && searchQuery && portalContainer && !document.querySelector('.admin-header')) {
        let currentQuery = '';
        let refreshTimer = null;
        let customerReplyLock = false;

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function renderCustomerTickets(query) {
            const allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
            let results = [];

            if (!query) {
                portalContainer.innerHTML = '';
                return;
            }

            if (query.startsWith('TKT-')) {
                results = allTickets.filter(t => t.id === query);
            } else {
                results = allTickets.filter(t => t.email === query);
            }

            if (results.length === 0) {
                portalContainer.innerHTML = '<div class="no-ticket">🔍 تیکتی با این مشخصات یافت نشد.</div>';
                return;
            }

            portalContainer.innerHTML = '';
            results.forEach(ticket => {
                const card = document.createElement('div');
                card.className = 'ticket-admin-card';

                const statusText = ticket.status === 'open' ? 'باز' :
                                   ticket.status === 'in-progress' ? 'در حال بررسی' : 'بسته';
                const statusClass = 'status-badge ' + (ticket.status === 'open' ? 'status-open' :
                                      ticket.status === 'in-progress' ? 'status-in-progress' : 'status-closed');

                card.innerHTML = `
                    <div class="admin-ticket-header">
                        <div class="ticket-meta">
                            <span class="ticket-id-badge">${escapeHtml(ticket.id)}</span>
                            <span class="priority-badge">${escapeHtml(ticket.priority)}</span>
                            <span>${escapeHtml(ticket.date)}</span>
                        </div>
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                    <div class="customer-info">
                        <strong>${escapeHtml(ticket.name)}</strong> (${escapeHtml(ticket.email)})
                    </div>
                    <div style="font-size:18px;font-weight:600;margin:10px 0">${escapeHtml(ticket.subject)}</div>
                    <div class="message-content">${escapeHtml(ticket.message)}</div>
                    <div class="replies-box">
                        <strong>پاسخ‌ها:</strong>
                        ${ticket.replies.length === 0 ? '<p>بدون پاسخ</p>' : 
                          ticket.replies.map(r => `
                            <div class="reply-item ${r.author === 'admin' ? 'admin-reply' : ''}">
                                <em>${r.author === 'admin' ? 'ادمین' : 'شما'}:</em> ${escapeHtml(r.text)}
                                <div style="font-size:11px;color:#999">${escapeHtml(r.date)}</div>
                            </div>`).join('')}
                    </div>
                    <div class="admin-reply-form">
                        <textarea id="cust-reply-${ticket.id}" placeholder="پاسخ شما..."></textarea>
                        <button class="send-cust-reply" data-ticketid="${ticket.id}">ارسال</button>
                    </div>
                `;

                const replyBtn = card.querySelector('.send-cust-reply');
                replyBtn.addEventListener('click', function() {
                    if (customerReplyLock) return;
                    customerReplyLock = true;

                    const textarea = card.querySelector('textarea');
                    const replyText = textarea.value.trim();
                    if (!replyText) {
                        customerReplyLock = false;
                        alert('لطفاً متن پاسخ را وارد کنید.');
                        return;
                    }

                    let allTickets = JSON.parse(localStorage.getItem('tickets')) || [];
                    const target = allTickets.find(t => t.id === ticket.id);
                    if (target) {
                        target.replies.push({
                            author: 'customer',
                            text: replyText,
                            date: new Date().toLocaleString('fa-IR')
                        });
                        localStorage.setItem('tickets', JSON.stringify(allTickets));
                        renderCustomerTickets(currentQuery);
                    }
                    customerReplyLock = false;
                });

                portalContainer.appendChild(card);
            });
        }

        function performSearch() {
            const query = searchQuery.value.trim();
            if (query) {
                currentQuery = query;
                renderCustomerTickets(currentQuery);
            }
        }

        searchBtn.addEventListener('click', performSearch);
        searchQuery.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        function startAutoRefresh() {
            if (refreshTimer) clearInterval(refreshTimer);
            refreshTimer = setInterval(() => {
                if (customerReplyLock) return;
                if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
                if (currentQuery) renderCustomerTickets(currentQuery);
            }, 500);
        }

        startAutoRefresh();
    }

    // ================== ۱۲. پنل مدیریت کامل ==================
    if (document.getElementById('ticketsContainer') && document.querySelector('.admin-header')) {
        (async function() {
            if (!sessionStorage.getItem('adminAuth')) {
                const pass = await showPasswordPrompt('لطفاً رمز عبور مدیریت را وارد کنید:');
                if (pass === null || pass !== '123456') {
                    if (pass !== null) await showAlertModal('رمز عبور اشتباه است!');
                    window.location.href = 'home.html';
                    return;
                }
                sessionStorage.setItem('adminAuth', 'true');
            }

            let replyLock = false;   // قفل برای ارسال پاسخ ادمین

            function logout() {
                sessionStorage.removeItem('adminAuth');
                window.location.reload();
            }

            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // مدیریت تب‌ها
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    tabContents.forEach(tc => tc.classList.remove('active'));
                    document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
                });
            });

            // توابع تیکت
            function renderAllTickets() {
                const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
                const container = document.getElementById('ticketsContainer');
                if (!container) return;
                if (tickets.length === 0) {
                    container.innerHTML = '<div class="empty-state">هیچ تیکتی ثبت نشده است.</div>';
                    return;
                }
                container.innerHTML = '';
                tickets.slice().reverse().forEach(ticket => {
                    const div = document.createElement('div');
                    div.className = 'ticket-admin-card';
                    div.innerHTML = `
                        <div class="admin-ticket-header">
                            <div class="ticket-meta">
                                <span class="ticket-id-badge">${ticket.id}</span>
                                <span class="priority-badge">${ticket.priority}</span>
                                <span>${ticket.date}</span>
                            </div>
                            <select class="status-select" data-id="${ticket.id}">
                                <option value="open" ${ticket.status==='open'?'selected':''}>باز</option>
                                <option value="in-progress" ${ticket.status==='in-progress'?'selected':''}>در حال بررسی</option>
                                <option value="closed" ${ticket.status==='closed'?'selected':''}>بسته</option>
                            </select>
                        </div>
                        <div class="customer-info">
                            <strong>${escapeHtml(ticket.name)}</strong> (${escapeHtml(ticket.email)})
                        </div>
                        <div style="font-size:18px;font-weight:600;margin:10px 0">${escapeHtml(ticket.subject)}</div>
                        <div class="message-content">${escapeHtml(ticket.message)}</div>
                        <div class="replies-box">
                            <strong>پاسخ‌ها:</strong>
                            ${ticket.replies.length===0 ? '<p>بدون پاسخ</p>' : ticket.replies.map(r=>`
                                <div class="reply-item ${r.author==='admin'?'admin-reply':''}">
                                    <em>${r.author==='admin'?'ادمین':'مشتری'}:</em> ${escapeHtml(r.text)}
                                    <div style="font-size:11px;color:#999">${r.date}</div>
                                </div>`).join('')}
                        </div>
                        <div class="admin-reply-form">
                            <textarea id="admin-reply-${ticket.id}" placeholder="پاسخ ادمین..."></textarea>
                            <button onclick="submitAdminReply('${ticket.id}')">ارسال</button>
                        </div>
                    `;
                    container.appendChild(div);
                });

                document.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', function() {
                        const ticketId = this.dataset.id;
                        const newStatus = this.value;
                        let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
                        const ticket = tickets.find(t=>t.id===ticketId);
                        if(ticket) {
                            ticket.status = newStatus;
                            localStorage.setItem('tickets', JSON.stringify(tickets));
                            renderAllTickets();
                        }
                    });
                });
            }

            window.submitAdminReply = async function(ticketId) {
                replyLock = true;
                const replyText = document.getElementById(`admin-reply-${ticketId}`).value.trim();
                if (!replyText) {
                    replyLock = false;
                    await showAlertModal('پاسخ نمی‌تواند خالی باشد.');
                    return;
                }
                let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
                const ticket = tickets.find(t=>t.id===ticketId);
                if(ticket) {
                    ticket.replies.push({ author: 'admin', text: replyText, date: new Date().toLocaleString('fa-IR') });
                    localStorage.setItem('tickets', JSON.stringify(tickets));
                    renderAllTickets();
                }
                replyLock = false;
            };

            async function deleteAllTickets() {
                const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
                if (tickets.length === 0) {
                    await showAlertModal('تیکتی برای حذف وجود ندارد.');
                    return;
                }
                const confirmed = await showConfirmModal('آیا از حذف تمام تیکت‌ها اطمینان دارید؟');
                if (confirmed) {
                    localStorage.removeItem('tickets');
                    renderAllTickets();
                    await showAlertModal('همه تیکت‌ها حذف شدند.');
                }
            }

            // توابع پیام‌های تماس
            function renderContactMessages() {
                const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                const container = document.getElementById('messagesContainer');
                if (!container) return;
                if (messages.length === 0) {
                    container.innerHTML = '<div class="empty-state">هیچ پیام تماسی ثبت نشده است.</div>';
                    return;
                }
                container.innerHTML = '';
                messages.slice().reverse().forEach((msg, index) => {
                    const card = document.createElement('div');
                    card.className = 'message-card';
                    card.innerHTML = `
                        <div class="message-header">
                            <div class="message-meta">
                                <strong>${escapeHtml(msg.name)}</strong> (${escapeHtml(msg.email)})
                                <span style="color:#7f8c8d;">| ${escapeHtml(msg.date)}</span>
                            </div>
                            <button class="delete-btn" data-index="${index}">🗑️ حذف</button>
                        </div>
                        <div><strong>موضوع:</strong> ${escapeHtml(msg.subject)}</div>
                        <div class="message-content">${escapeHtml(msg.message)}</div>
                    `;
                    container.appendChild(card);
                });

                document.querySelectorAll('#messagesContainer .delete-btn').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const idx = parseInt(this.dataset.index);
                        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                        const realIndex = messages.length - 1 - idx;
                        if (realIndex >= 0 && realIndex < messages.length) {
                            const sure = await showConfirmModal('این پیام حذف شود؟');
                            if (sure) {
                                messages.splice(realIndex, 1);
                                localStorage.setItem('contactMessages', JSON.stringify(messages));
                                renderContactMessages();
                            }
                        }
                    });
                });
            }

            async function deleteAllMessages() {
                const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
                if (messages.length === 0) {
                    await showAlertModal('هیچ پیامی برای حذف وجود ندارد.');
                    return;
                }
                const sure = await showConfirmModal('همه پیام‌های تماس حذف شوند؟');
                if (sure) {
                    localStorage.removeItem('contactMessages');
                    renderContactMessages();
                    await showAlertModal('همه پیام‌ها پاک شدند.');
                }
            }

            document.getElementById('logoutBtn').addEventListener('click', logout);
            document.getElementById('deleteAllTicketsBtn').addEventListener('click', deleteAllTickets);
            const deleteAllMsgsBtn = document.getElementById('deleteAllMessagesBtn');
            if (deleteAllMsgsBtn) deleteAllMsgsBtn.addEventListener('click', deleteAllMessages);

            renderAllTickets();
            renderContactMessages();

            setInterval(() => {
                if (replyLock) return;
                if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
                const activeTab = document.querySelector('.tab-content.active');
                if (!activeTab) return;
                if (activeTab.id === 'ticketsTab') {
                    renderAllTickets();
                } else if (activeTab.id === 'messagesTab') {
                    renderContactMessages();
                }
            }, 500);
        })();
    }
});

// ========== تابع نمایش سفارش‌ها ==========
function displayOrders() {
    const ordersString = localStorage.getItem('userOrders');
    let orders = [];
    if (ordersString) {
        try { orders = JSON.parse(ordersString); } catch (e) { orders = []; }
    }

    const orderHistoryBody = document.getElementById('orderHistoryBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    if (!orderHistoryBody) return;

    orderHistoryBody.innerHTML = '';
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';

    if (orders.length > 0) {
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.productName}</td>
                <td>${order.orderDate}</td>
                <td>${order.price}</td>
                <td>${order.status}</td>
            `;
            orderHistoryBody.appendChild(row);
        });
    } else {
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
    }
}