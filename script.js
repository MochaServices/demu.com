const products = [
    {
        id: 1,
        name: "Pencil",
        price: 29.99,
        description: "high quality writing utility",
        image: "pencil.jpg"
    },
    {
        id: 2,
        name: "Mug",
        price: 24.99,
        description: "a non broken luxurious and wonderful mug",
        image: "mug.jpg"
    },
    {
        id: 3,
        name: "Robux Card",
        price: 99.99,
        description: "a very legit non overpriced 20 dolla robux card",
        image: "robux-card.png"
    },
    {
        id: 4,
        name: "Broken Toilet Seat",
        price: 124.99,
        description: "a working toilet seat for your toilet",
        image: "brokentoilet.jpg"
    },
    {
        id: 6,
        name: "Iphone 16",
        price: 799.99,
        description: "the latest iphone model",
        image: "iphone16pro.webp"
    },
    {
        id: 7,
        name: "A Kiss",
        price: 999.99,
        description: "you get a kiss",
        image: "akiss.jpg"
    },
    {
        id: 8,
        name: "a note from your dad",
        price: 249.99,
        description: "im proud of you son",
        image: "dadnote.jpg"
    },
    {
        id: 9,
        name: "Unused Socks",
        price: 14.99,
        description: "clean comfy and luxurious socks (100% unused)",
        image: "socks.webp"
    },
    {
        id: 10,
        name: "porta-potty",
        price: 1999.99,
        description: "a wonderful porta potty thats sanitary, comfortable, and of higher quality",
        image: "portapotty.webp"
    }
];

class CreditCard {
    constructor(number, expDate, cvv, balance) {
        this.number = number;
        this.expDate = expDate;
        this.cvv = cvv;
        this.balance = balance;
    }
}

const adminSystem = {
    cards: new Map(),

    generateCardNumber() {
        return '4' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
    },

    generateExpDate() {
        const month = Math.floor(Math.random() * 12) + 1;
        const year = new Date().getFullYear() + Math.floor(Math.random() * 5);
        return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
    },

    generateCVV() {
        return Math.floor(Math.random() * 900) + 100;
    },

    createNewCard(balance) {
        const card = new CreditCard(
            this.generateCardNumber(),
            this.generateExpDate(),
            this.generateCVV(),
            balance
        );
        this.cards.set(card.number, card);
        return card;
    },

    validateCard(number, expDate, cvv) {
        const card = this.cards.get(number);
        return card && card.expDate === expDate && card.cvv.toString() === cvv;
    },

    updateCardBalance(cardNumber, newBalance) {
        const card = this.cards.get(cardNumber);
        if (card) {
            card.balance = parseFloat(newBalance);
            this.updateCardsList();
        }
    },
    
    updateCardsList() {
        const container = document.getElementById('activeCards');
        container.innerHTML = '';

        this.cards.forEach(card => {
            const div = document.createElement('div');
            div.className = 'card-entry';
            div.innerHTML = `
                <div class="card-details">
                    <span>${card.number}</span>
                    <span>$${card.balance.toFixed(2)}</span>
                </div>
                <div class="card-actions">
                    <button class="view-card" data-number="${card.number}">View</button>
                    <button class="remove-card" data-number="${card.number}">Remove</button>
                </div>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.view-card').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = this.cards.get(btn.dataset.number);
                document.getElementById('genCardNumber').textContent = card.number;
                document.getElementById('genExpDate').textContent = card.expDate;
                document.getElementById('genCVV').textContent = card.cvv;
                document.getElementById('balanceInput').value = card.balance;
            });
        });

        container.querySelectorAll('.remove-card').forEach(btn => {
            btn.addEventListener('click', () => {
                this.cards.delete(btn.dataset.number);
                this.updateCardsList();
            });
        });
    },

};



let cart = [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const closeCart = document.querySelector('.close-cart');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.querySelector('.close-checkout');
const checkoutForm = document.getElementById('checkoutForm');
const notification = document.getElementById('notification');

function initializeShop() {
    renderProducts();
    setupEventListeners();
    setupAdditionalEventListeners();
    updateCartCount();
}

function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    productGrid.addEventListener('click', handleAddToCart);
    cartItems.addEventListener('click', handleRemoveItem);
}

function setupAdditionalEventListeners() {
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeCheckout.addEventListener('click', closeCheckoutModal);
    checkoutForm.addEventListener('submit', processPayment);

    document.querySelector('.admin-trigger').addEventListener('click', (e) => {
        if (e.ctrlKey && e.altKey) {
            document.querySelector('.admin-panel').style.display = 'block';
        }
    });

    document.getElementById('generateCard').addEventListener('click', () => {
        const card = adminSystem.createNewCard(parseFloat(document.getElementById('balanceInput').value));
        document.getElementById('genCardNumber').textContent = card.number;
        document.getElementById('genExpDate').textContent = card.expDate;
        document.getElementById('genCVV').textContent = card.cvv;
        adminSystem.updateCardsList();
    });
    document.getElementById('setBalance').addEventListener('click', () => {
        const cardNumber = document.getElementById('genCardNumber').textContent;
        const newBalance = parseFloat(document.getElementById('balanceInput').value);

        if (cardNumber !== '-') {
            const card = adminSystem.cards.get(cardNumber);
            if (card) {
                card.balance = newBalance;
                adminSystem.updateCardsList();
            }
        }
    });
}

function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
}

function openCheckoutModal() {
    checkoutModal.style.display = 'block';
    cartModal.style.display = 'none';
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

function handleAddToCart(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
    }
}

function handleRemoveItem(e) {
    if (e.target.classList.contains('remove-item')) {
        const productId = parseInt(e.target.dataset.id);
        removeFromCart(productId);
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    renderCartItems();
    updateCartTotal();
    updateCartCount();
}

function renderCartItems() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        </div>
    `).join('');
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

function showNotification(message, isSuccess) {
    notification.textContent = message;
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function processPayment(e) {
    e.preventDefault();

    const cardNumber = document.getElementById('cardNumber').value;
    const expDate = document.getElementById('expDate').value;
    const cvv = document.getElementById('cvv').value;
    const total = parseFloat(cartTotal.textContent);

    if (!adminSystem.validateCard(cardNumber, expDate, cvv)) {
        showNotification('Invalid card details', false);
        return;
    }

    const card = adminSystem.cards.get(cardNumber);

    if (card.balance < total) {
        showNotification('Insufficient funds', false);
        return;
    }

    card.balance -= total;
    adminSystem.updateCardsList();

    cart = [];
    updateCart();
    closeCheckoutModal();

    showNotification('Payment successful! Order confirmed.', true);
    checkoutForm.reset();
}

document.addEventListener('click', (e) => {
    const adminPanel = document.querySelector('.admin-panel');
    const adminTrigger = document.querySelector('.admin-trigger');

    if (!adminPanel.contains(e.target) && !adminTrigger.contains(e.target)) {
        adminPanel.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', initializeShop);
