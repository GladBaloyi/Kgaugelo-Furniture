let cart = [];

if (localStorage.getItem('cart')) {
    cart = JSON.parse(localStorage.getItem('cart'));
    updateCartCount();
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(price);
}

document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

document.getElementById('cart-icon').addEventListener('click', function(e) {
    e.preventDefault();
    const dropdown = document.getElementById('cart-dropdown');
    dropdown.classList.toggle('hidden');
    
    updateCartItems();
});

document.addEventListener('click', function(e) {
    const cartIcon = document.getElementById('cart-icon');
    const dropdown = document.getElementById('cart-dropdown');
    
    if (!cartIcon.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        e.preventDefault();
        
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        const price = parseFloat(e.target.getAttribute('data-price'));
        const image = e.target.getAttribute('data-image');
        
        // Check if item already in cart
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price,
                image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        
        showNotification(`${name} added to cart`);
        
        updateCartItems();
    }
    
    if (e.target.classList.contains('remove-from-cart')) {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        
        cart = cart.filter(item => item.id !== id);

        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount();
        
        updateCartItems();
        
        showNotification('Item removed from cart');
    }
    
    if (e.target.classList.contains('update-quantity')) {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        const newQuantity = parseInt(e.target.value);
        
        if (newQuantity > 0) {
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity = newQuantity;
                
                localStorage.setItem('cart', JSON.stringify(cart));
                
                updateCartCount();

                updateCartItems();
            }
        }
    }

    if (e.target.classList.contains('category-btn')) {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
  
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-amber-600', 'text-white');
            btn.classList.add('bg-gray-200', 'hover:bg-gray-300');
        });
        
        e.target.classList.remove('bg-gray-200', 'hover:bg-gray-300');
        e.target.classList.add('bg-amber-600', 'text-white');
        
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            if (category === 'all' || product.getAttribute('data-category') === category) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }
});

document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    showNotification('Message sent successfully! We will get back to you soon.');

    this.reset();
});

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.getElementById('cart-count').textContent = count;
    document.getElementById('mobile-cart-count').textContent = count;
    
    if (count > 0) {
        document.getElementById('cart-count').classList.remove('hidden');
        document.getElementById('mobile-cart-count').classList.remove('hidden');
    } else {
        document.getElementById('cart-count').classList.add('hidden');
        document.getElementById('mobile-cart-count').classList.add('hidden');
    }
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        document.getElementById('cart-total').textContent = formatPrice(0);
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="flex items-start justify-between border-b pb-4">
                <div class="flex items-start">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-3">
                    <div>
                        <h4 class="text-sm font-medium text-gray-800">${item.name}</h4>
                        <p class="text-sm text-gray-600">${formatPrice(item.price)}</p>
                        <div class="mt-2 flex items-center">
                            <label class="mr-2 text-sm text-gray-600">Qty:</label>
                            <input type="number" min="1" value="${item.quantity}" 
                                   class="update-quantity w-16 px-2 py-1 border rounded" 
                                   data-id="${item.id}">
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <button class="remove-from-cart text-red-500 hover:text-red-700 mb-2" 
                            data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                    <span class="text-sm font-medium">${formatPrice(itemTotal)}</span>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHTML;
    document.getElementById('cart-total').textContent = formatPrice(total);
    
    document.querySelectorAll('.update-quantity').forEach(input => {
        input.addEventListener('change', function(e) {
            const id = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            
            if (newQuantity > 0) {
                const item = cart.find(item => item.id === id);
                if (item) {
                    item.quantity = newQuantity;
                    
                    localStorage.setItem('cart', JSON.stringify(cart));

                    updateCartCount();
                    
                    updateCartItems();
                }
            } else {
                this.value = 1;
            }
        });
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center';
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

updateCartCount();
updateCartItems();