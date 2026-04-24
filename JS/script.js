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



document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            if (!name || !email || !message) {
                showMessage('لطفاً تمام فیلدهای ضروری را پر کنید.', 'error');
                return;
            }

            console.log('Form Data Submitted:', { name, email, subject, message });

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

const productTabButtons = document.querySelectorAll('.tab-button');
const productTabContents = document.querySelectorAll('.tab-content');

if (productTabButtons.length > 0 && productTabContents.length > 0) {
    productTabButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            productTabButtons.forEach(btn => btn.classList.remove('active'));
            productTabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const activeTabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(activeTabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });
    let initialActiveButtonFound = false;
    productTabButtons.forEach((button, index) => {
        if (button.classList.contains('active')) {
            initialActiveButtonFound = true;
            const activeTabId = button.getAttribute('data-tab');
            const activeTab = document.getElementById(activeTabId);
            if (activeTab) {
                activeTab.classList.add('active');
            }
        }
    });


    if (!initialActiveButtonFound && productTabButtons.length > 0) {
        productTabButtons[0].classList.add('active');
        const firstTabId = productTabButtons[0].getAttribute('data-tab');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
} else {
    console.warn("Tab elements not found or incomplete. Tab functionality might not work.");
}




document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');


    const loginStatusLink = document.getElementById('loginStatusLink');
    if (loginStatusLink) {
        if (isLoggedIn === 'true' && loggedInUsername) {
            loginStatusLink.textContent = `حساب کاربری`; 
            loginStatusLink.href = 'account.html'; 
        } else {
            loginStatusLink.textContent = 'ورود / ثبت نام';
            loginStatusLink.href = 'login.html';
        }
    } else {
        console.warn("Element with ID 'loginStatusLink' not found.");
    }


    if (window.location.pathname.includes('login.html') && isLoggedIn === 'true') {
        window.location.href = 'home.html';
    }
});

const signupForm = document.getElementById('signupForm');
const signupNameInput = document.getElementById('signupName');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const signupConfirmPasswordInput = document.getElementById('signupConfirmPassword');

if (signupForm) {
    signupForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = signupNameInput.value.trim();
        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value;
        const confirmPassword = signupConfirmPasswordInput.value;

        if (!name || !email || !password || !confirmPassword) { alert('لطفاً تمام فیلدها را پر کنید.'); return; }
        if (password !== confirmPassword) { alert('رمز عبور و تکرار رمز عبور مطابقت ندارند!'); return; }
        if (password.length < 5) { alert('رمز عبور کمتر از پنج حرف است!'); return;}
        const user = { name: name, email: email, password: password }; 
        localStorage.setItem('user', JSON.stringify(user));
        alert('ثبت‌نام شما با موفقیت انجام شد!');
        window.location.href = 'login.html'; 
    });
}

const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const rememberMeCheckbox = document.getElementById('rememberMe');

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        const storedUserString = localStorage.getItem('user');
        const storedUser = storedUserString ? JSON.parse(storedUserString) : null;

        if (storedUser && storedUser.email === email && storedUser.password === password) {
            alert('ورود شما موفقیت‌آمیز بود!');
            if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUsername', storedUser.name || email);
            }
            window.location.href = 'home.html';
        } else {
            alert('ایمیل یا رمز عبور اشتباه است.');
        }
    });
}


// script.js


const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
const accountTabs = document.querySelectorAll('.account-tab');
const logoutLink = document.getElementById('logoutLink');
const profileNameSpan = document.getElementById('profileName');
const profileEmailSpan = document.getElementById('profileEmail');

function loadUserProfile() {
    const storedUserString = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('loggedInUsername');

    if (storedUserString && isLoggedIn === 'true') {
        try {
            const storedUser = JSON.parse(storedUserString);
            if (profileNameSpan) {
                profileNameSpan.textContent = storedUser.name || storedUsername || 'کاربر';
            }
            if (profileEmailSpan) {
                profileEmailSpan.textContent = storedUser.email || '';
            }
           
            window.currentUser = storedUser; 
        } catch (e) {
            console.error("Error parsing user data:", e);
            if (profileNameSpan) profileNameSpan.textContent = storedUsername || 'کاربر';
            if (profileEmailSpan) profileEmailSpan.textContent = 'ایمیل نامشخص';
            window.currentUser = null;
        }
    } else {
        if (profileNameSpan) profileNameSpan.textContent = 'مهمان';
        if (profileEmailSpan) profileEmailSpan.textContent = '';
        window.currentUser = null;
        if (window.location.pathname.includes('account.html')) {
            alert('لطفاً وارد حساب کاربری خود شوید.');
            window.location.href = 'login.html';
        }
    }
}

const changePasswordForm = document.getElementById('changePasswordForm');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmNewPassword = confirmNewPasswordInput.value.trim();

        if (!window.currentUser) {
            alert('خطا: اطلاعات کاربر در دسترس نیست. لطفاً دوباره وارد شوید.');
            console.error("User data not available in window.currentUser.");
            window.location.href = 'login.html';
            return;
        }
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('لطفاً تمام فیلدها را پر کنید.');
            return;
        }

        if (currentPassword !== window.currentUser.password) {
            alert('رمز عبور فعلی اشتباه است.');
            console.log("Current password mismatch. Entered:",currentPassword, "Stored:", window.currentUser.password);
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('رمز عبور جدید و تکرار آن مطابقت ندارند!');
            return;
        }

        alert('رمز عبور شما با موفقیت تغییر کرد!');


        window.currentUser.password = newPassword; 
        localStorage.setItem('user', JSON.stringify(window.currentUser));
        console.log("Password updated in localStorage.");

        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
    });
} else {
     console.warn("Change password form not found. Password change functionality disabled.");
}


if (sidebarLinks.length > 0 && accountTabs.length > 0) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            if (this.id !== 'logoutLink' && this.getAttribute('href') !== '#' && this.getAttribute('href')) {
                 event.preventDefault();
            }

            if (this.id === 'logoutLink') {
                localStorage.removeItem('isLoggedIn'); localStorage.removeItem('loggedInUsername'); localStorage.removeItem('user');
                alert('شما با موفقیت خارج شدید.');
                window.location.href = 'login.html';
                return;
            }

            sidebarLinks.forEach(item => item.classList.remove('active-menu-item'));
            this.classList.add('active-menu-item');

            accountTabs.forEach(tab => tab.classList.remove('active'));

            const targetTabId = this.getAttribute('data-tab');
            const targetTab = document.getElementById(targetTabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });

    let activeMenuItemFound = false;
    sidebarLinks.forEach(link => {
        if (link.classList.contains('active-menu-item')) {
            activeMenuItemFound = true;
        }
    });

    if (!activeMenuItemFound && sidebarLinks.length > 0) {
        const firstSidebarLink = sidebarLinks[0];
        if (firstSidebarLink && firstSidebarLink.id !== 'logoutLink') {
            firstSidebarLink.click();
        }
    }
} else {
    console.warn("Sidebar menu or account tabs not found. Account page navigation might not work.");
}

if (window.location.pathname.includes('account.html') || document.body.id === 'accountPage') {
    document.addEventListener('DOMContentLoaded', loadUserProfile);
}




// --- Add to Cart functionality ---
const buyButtons = document.querySelectorAll('.buy-button');
//let productside = document.getElementsByClassName("productsidebar");

if (buyButtons.length > 0) {
    buyButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
        //    productside.style.left = "0px";

            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');
            

            


            if (!productName || !productPrice) {
                alert("خطا در دریافت اطلاعات محصول. لطفاً مطمئن شوید که data-product-name و data-product-price روی دکمه تنظیم شده‌اند.");
                console.error("Product details not found in data attributes. Button:", this);
                return; 
            }

            const product = { name: productName, price: productPrice };

            const ordersString = localStorage.getItem('userOrders');
            let orders = [];
            if (ordersString) {
                try {
                    orders = JSON.parse(ordersString);
                } catch (e) {
                    console.error("Error parsing orders:", e);
                    orders = [];
                }
            }

            const orderData = {
                productName: product.name,
                price: product.price,
                orderDate: new Date().toLocaleDateString('fa-IR'), // Persian date format
                status: 'در حال پردازش'
            };
            orders.push(orderData);
            localStorage.setItem('userOrders', JSON.stringify(orders));
            alert(`${product.name} به سبد خرید اضافه شد!`);
            
            //window.location.href = 'account.html';
        });
    });
        

} else {
     console.warn("Buy buttons not found. Add to Cart functionality might not work.");
}





// --- End of Direct Clear Cart Logic ---




function displayOrders() {
    const ordersString = localStorage.getItem('userOrders');
    let orders = [];
    if (ordersString) {
        try {
            orders = JSON.parse(ordersString);
        } catch (e) {
            console.error("Error parsing orders:", e);
            orders = [];
        }
    }

    const orderHistoryBody = document.getElementById('orderHistoryBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    if (orderHistoryBody) {
        orderHistoryBody.innerHTML = ''; // Clear existing rows
    }
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'none'; // Hide message by default
    }

    if (orders.length > 0 && orderHistoryBody) {
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
        if (noOrdersMessage) {
            noOrdersMessage.style.display = 'block'; // Show message if no orders
        }
    }
}

const clearCartButton = document.getElementById('clearCartButton');
if (clearCartButton) {
    clearCartButton.addEventListener('click', function() { 
        localStorage.removeItem('userOrders');
        alert('سبد خرید شما پاک شد!');

        if (typeof displayOrders === 'function') {
            displayOrders();
        }
    });
} else {
    console.warn("Element with ID 'clearCartButton' not found. Clear cart functionality might not work.");
}


if (window.location.pathname.includes('account.html') || document.body.id === 'accountPage') {
    document.addEventListener('DOMContentLoaded', loadUserProfile);

    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const accountTabs = document.querySelectorAll('.account-tab');


    if (sidebarLinks.length > 0 && accountTabs.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                // Prevent default link behavior for navigation within the account page
                if (this.id !== 'logoutLink' && this.getAttribute('href') !== '#' && this.getAttribute('href')) {
                     event.preventDefault();
                }

                // Handle Logout specifically
                if (this.id === 'logoutLink') {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('user');
                    alert('شما با موفقیت خارج شدید.');
                    window.location.href = 'login.html';
                    return;
                }

                // Handle navigation between account sections
                sidebarLinks.forEach(item => item.classList.remove('active-menu-item'));
                this.classList.add('active-menu-item');

                accountTabs.forEach(tab => tab.classList.remove('active'));

                const targetTabId = this.getAttribute('data-tab');
                const targetTab = document.getElementById(targetTabId);
                if (targetTab) {
                    targetTab.classList.add('active');
                    // If we just opened the order history tab, load the orders
                    if (targetTabId === 'order-history') {
                        displayOrders();
                    }
                }
            });
        });

        // Activate the first menu item by default if no item is active
        let activeMenuItemFound = false;
        sidebarLinks.forEach(link => {
            if (link.classList.contains('active-menu-item')) {
                activeMenuItemFound = true;
            }
        });

        if (!activeMenuItemFound && sidebarLinks.length > 0) {
            const firstSidebarLink = sidebarLinks[0];
            if (firstSidebarLink && firstSidebarLink.id !== 'logoutLink') {
                firstSidebarLink.click(); // Simulate a click to activate the first item and show its content
            }
        }
    } else {
        console.warn("Sidebar menu or account tabs not found. Account page navigation might not work.");
    }
}

// --- End of relevant scripts ---
