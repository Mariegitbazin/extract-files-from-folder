const siteConfig = window.siteConfig || {};

function createProductId(title) {
  return title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const recipes = (siteConfig.products || []).map(product => ({
  id: product.id || createProductId(product.title),
  title: product.title,
  price: product.price,
  rating: product.rating || '4.95',
  votes: product.votes || '146',
  diets: product.diets || ['TEMPLATES'],
  image: product.image,
  description: product.description,
  ingredients: product.ingredients || [],
  instructions: product.instructions || []
}));

const shopItems = (siteConfig.shopItems || []).map(item => ({
  title: item.title,
  category: item.category,
  price: item.price,
  image: item.image,
  actionText: item.actionText || 'Voir le produit',
  link: item.link || '#contact'
}));

let favorites = JSON.parse(localStorage.getItem('mb_favorites')) || [];
let cart = JSON.parse(localStorage.getItem('mb_cart')) || [];

function showPage(pageId) {
  document.getElementById('page-home').classList.add('hidden');
  document.getElementById('page-shop').classList.add('hidden');
  document.getElementById('recipe-detail').classList.add('hidden');
  document.getElementById('page-favorites').classList.add('hidden');
  document.getElementById(`page-${pageId}`).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('sideMenu').classList.add('-translate-x-full');
  const menuOverlay = document.getElementById('menuOverlay');
  if (menuOverlay) {
    menuOverlay.classList.add('hidden', 'pointer-events-none');
    menuOverlay.classList.remove('opacity-100');
  }
  if (pageId === 'home') {
    renderRecipes(recipes);
  } else if (pageId === 'shop') {
    renderShop(shopItems);
  } else if (pageId === 'favorites') {
    renderFavorites();
  }
}

function renderRecipes(items) {
  const grid = document.getElementById('recipes-grid');
  grid.innerHTML = '';
  items.forEach(recipe => {
    const isFav = favorites.includes(recipe.id);
    const recipeCard = document.createElement('div');
    recipeCard.className = 'bg-white border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between';
    recipeCard.innerHTML = `
      <div class="cursor-pointer" onclick="openRecipe('${recipe.id}')">
        <div class="h-48 overflow-hidden relative">
          <img src="${recipe.image}" alt="[${recipe.title}]" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-6 space-y-3">
          <div class="flex flex-wrap gap-1">
            ${recipe.diets.map(diet => `<span class="category-badge bg-black text-[9px]">${diet.substring(0, 2)}</span>`).join('')}
          </div>
          <h4 class="serif-title text-xl font-bold hover:underline leading-tight">${recipe.title}</h4>
          <div class="flex items-center text-xs text-yellow-500">
            <span>★★★★★</span>
            <span class="text-gray-500 font-semibold ml-2">(${recipe.votes})</span>
          </div>
        </div>
      </div>
      <div class="px-6 pb-6 pt-2 flex justify-between items-center border-t border-gray-100">
        <div class="flex items-center gap-2">
          <button onclick="event.stopPropagation(); addToCart('${recipe.id}', '${recipe.title}', '${recipe.price}', '${recipe.image}')" class="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">Ajouter au panier</button>
          <button onclick="openRecipe('${recipe.id}')" class="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5">Détails</button>
        </div>
        <button onclick="toggleFavorite('${recipe.id}')" class="focus:outline-none" aria-label="Ajouter aux favoris">
          <svg class="w-6 h-6 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>
      </div>
    `;
    grid.appendChild(recipeCard);
  });
}

function handleProductAction(link) {
  if (!link) return;
  if (link.startsWith('#')) {
    const target = document.querySelector(link);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }
  window.open(link, '_blank', 'noopener,noreferrer');
}

function renderShop(items) {
  const grid = document.getElementById('shop-grid');
  grid.innerHTML = '';
  document.getElementById('shop-results-count').innerText = `Affichage de 1-${items.length} de ${items.length} résultats`;
  items.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'bg-white border border-gray-200 p-4 flex flex-col justify-between shadow-sm text-center';
    productCard.innerHTML = `
      <div>
        <div class="h-48 bg-gray-50 flex items-center justify-center overflow-hidden mb-4">
          <img src="${product.image}" alt="[${product.title}]" class="object-cover max-h-full max-w-full hover:scale-105 transition-transform">
        </div>
        <h4 class="text-sm font-semibold text-gray-800 mb-2">${product.title}</h4>
        <p class="text-gray-500 text-xs tracking-wider font-bold mb-4">${product.price}</p>
      </div>
      <div class="flex gap-2 mt-3">
        <button onclick="handleProductAction('${product.link}')" class="btn-black-outline flex-1 py-2.5 text-xs">${product.actionText}</button>
        <button onclick="event.stopPropagation(); addToCart('${product.title}', '${product.title}', '${product.price}', '${product.image}')" class="btn-black-outline flex-1 py-2.5 text-xs">Ajouter au panier</button>
      </div>
    `;
    grid.appendChild(productCard);
  });
}

function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  grid.innerHTML = '';
  const favItems = recipes.filter(r => favorites.includes(r.id));
  if (favItems.length === 0) {
    grid.innerHTML = '<p class="text-center text-sm text-gray-500 col-span-3 py-12">Aucun produit favori sauvegardé pour le moment.</p>';
    return;
  }
  favItems.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between';
    card.innerHTML = `
      <div class="cursor-pointer" onclick="openRecipe('${recipe.id}')">
        <img src="${recipe.image}" class="w-full h-48 object-cover" alt="[${recipe.title}]">
        <div class="p-6">
          <h4 class="serif-title text-xl font-bold hover:underline leading-tight">${recipe.title}</h4>
        </div>
      </div>
      <div class="px-6 pb-6">
        <button onclick="toggleFavorite('${recipe.id}'); renderFavorites();" class="text-xs text-red-500 font-bold hover:underline">Retirer de la liste d'idées</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleSearch(term) {
  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(term.toLowerCase()) ||
    r.description.toLowerCase().includes(term.toLowerCase())
  );
  renderRecipes(filtered);
}

function filterDiet(diet) {
  const filtered = recipes.filter(r => r.diets.includes(diet));
  renderRecipes(filtered);
  showPage('home');
}

function filterCategory(cat) {
  if (cat === 'all') {
    renderRecipes(recipes);
  }
  showPage('home');
}

function filterShop(category) {
  if (category === 'all') {
    renderShop(shopItems);
  } else {
    const filtered = shopItems.filter(item => item.category === category);
    renderShop(filtered);
  }
}

function openRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  document.getElementById('page-home').classList.add('hidden');
  document.getElementById('recipe-detail').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const isFav = favorites.includes(recipe.id);
  document.getElementById('recipe-detail-header').innerHTML = `
    <div class="flex flex-wrap gap-1">
      ${recipe.diets.map(diet => `<span class="category-badge bg-black text-[9px]">${diet.substring(0, 2)}</span>`).join('')}
    </div>
    <h1 class="serif-title text-3xl md:text-5xl font-bold leading-tight text-gray-900">${recipe.title}</h1>
    <div class="flex items-center space-x-4 pt-2">
      <div class="flex items-center text-yellow-500">
        <span>★★★★★</span>
        <span class="text-xs text-gray-500 font-bold ml-2">${recipe.rating} de ${recipe.votes} votes</span>
      </div>
      <button onclick="toggleFavorite('${recipe.id}'); openRecipe('${recipe.id}');" class="text-xs font-bold tracking-wider uppercase border border-gray-300 px-3 py-1.5 flex items-center space-x-1 hover:bg-gray-50">
        <svg class="w-4 h-4 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
        </svg>
        <span>${isFav ? 'Sauvegardé' : 'Sauvegarder'}</span>
      </button>
    </div>
    <p class="text-gray-600 italic text-sm border-t border-b border-gray-100 py-3 mt-4">${recipe.description}</p>
  `;
  document.getElementById('recipe-detail-image').src = recipe.image;
  document.getElementById('recipe-detail-image').alt = `[${recipe.title}]`;
  const ingredientsList = document.getElementById('recipe-detail-ingredients');
  ingredientsList.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
  const instructionsList = document.getElementById('recipe-detail-instructions');
  instructionsList.innerHTML = recipe.instructions.map(inst => `<li>${inst}</li>`).join('');
}

function scrollToIngredients() {
  document.getElementById('recipe-content-anchor').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toggleFavorite(id) {
  const index = favorites.indexOf(id);
  if (index > -1) {
    favorites.splice(index, 1);
    showToast('Produit retiré de votre sélection');
  } else {
    favorites.push(id);
    showToast('Produit ajouté à votre sélection !');
  }
  localStorage.setItem('mb_favorites', JSON.stringify(favorites));
  updateFavCount();
  if (!document.getElementById('page-home').classList.contains('hidden')) {
    renderRecipes(recipes);
  }
}

function updateFavCount() {
  document.getElementById('favCount').innerText = favorites.length;
}

function applySiteConfig() {
  const config = window.siteConfig || {};
  const topBarText = document.getElementById('topBarText');
  if (topBarText) topBarText.textContent = config.topBarText || 'Bazin • Sélection';

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = config.heroTitle || 'Bazin Sélection';

  const heroDescription = document.getElementById('heroDescription');
  if (heroDescription) heroDescription.textContent = config.heroDescription || '';

  const heroCtaText = document.getElementById('heroCtaText');
  if (heroCtaText) heroCtaText.textContent = config.heroCta || 'Découvrir les produits';

  const productsHeading = document.getElementById('productsHeading');
  if (productsHeading) productsHeading.textContent = config.productsHeading || 'Produits offerts';

  const shopTitle = document.getElementById('shopTitle');
  if (shopTitle) shopTitle.textContent = config.shopTitle || 'CATÉGORIES PRODUITS';

  const favoritesTitle = document.getElementById('favoritesTitle');
  if (favoritesTitle) favoritesTitle.textContent = config.favoritesTitle || "Votre liste d'idées produits";

  const favoritesDescription = document.getElementById('favoritesDescription');
  if (favoritesDescription) favoritesDescription.textContent = config.favoritesDescription || '';

  const contactTitle = document.getElementById('contactTitle');
  if (contactTitle) contactTitle.textContent = config.contactTitle || 'Contactez-nous pour vos offres';

  const contactDescription = document.getElementById('contactDescription');
  if (contactDescription) contactDescription.textContent = config.contactDescription || '';

  const footerText = document.getElementById('footerText');
  if (footerText) footerText.innerHTML = config.footerText || '<p>Politique de remboursement</p><p>Politique de confidentialité</p><p>Termes d\'utilisation</p>';

  const newsletterTitle = document.getElementById('newsletterTitle');
  if (newsletterTitle) newsletterTitle.textContent = config.newsletterTitle || 'Offres par email';
}

function saveCart() {
  localStorage.setItem('mb_cart', JSON.stringify(cart));
}

function updateCartCount() {
  document.getElementById('cartCount').innerText = cart.length;
}

function addToCart(id, title, price, image) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, title, price, image, quantity: 1 });
  }
  saveCart();
  updateCartCount();
  renderCart();
  showToast('Produit ajouté au panier');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  overlay.classList.toggle('hidden');
  if (!overlay.classList.contains('hidden')) {
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!cart.length) {
    container.innerHTML = '<p class="text-sm text-gray-500">Votre panier est vide.</p>';
    totalEl.innerText = '0 C$';
    return;
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^\d]/g, '')) * item.quantity, 0);
  container.innerHTML = cart.map((item, index) => `
    <div class="flex items-center gap-3 border border-gray-200 p-3">
      <img src="${item.image}" alt="[${item.title}]" class="w-16 h-16 object-cover">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate">${item.title}</p>
        <p class="text-xs text-gray-500">${item.price} × ${item.quantity}</p>
      </div>
      <button onclick="removeFromCart(${index})" class="text-xs text-red-500 font-bold uppercase">Retirer</button>
    </div>
  `).join('');
  totalEl.innerText = `${total} C$`;
}

function showCheckout() {
  if (!cart.length) {
    showToast('Ajoutez un produit avant de commander');
    return;
  }
  document.getElementById('checkoutModal').classList.remove('hidden');
  const summary = document.getElementById('checkoutSummary');
  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^\d]/g, '')) * item.quantity, 0);
  summary.innerHTML = `
    <div class="border border-gray-200 p-4 bg-gray-50">
      <p class="font-semibold text-gray-800">Résumé de commande</p>
      ${cart.map(item => `<p class="text-sm mt-2">• ${item.title} — ${item.price} × ${item.quantity}</p>`).join('')}
      <p class="text-sm font-bold mt-3">Total : ${total} C$</p>
    </div>
  `;
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function submitOrder(event) {
  event.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const payment = document.getElementById('checkoutPayment').value;
  const message = document.getElementById('checkoutMessage').value.trim();
  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^\d]/g, '')) * item.quantity, 0);
  const orderText = [
    `Nom : ${name}`,
    `Email : ${email}`,
    `Paiement : ${payment}`,
    `Message : ${message || 'Aucun message'}`,
    `Produits : ${cart.map(item => `${item.title} x${item.quantity}`).join(', ')}`,
    `Total : ${total} $`
  ].join('\n');

  const mailtoLink = `mailto:hello@bazin.com?subject=Nouvelle%20commande%20Bazin&body=${encodeURIComponent(orderText)}`;
  window.location.href = mailtoLink;
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  closeCheckout();
  showToast('Commande préparée. Merci !');
}

function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.toggle('hidden');
  if (!overlay.classList.contains('hidden')) {
    document.getElementById('searchInput').focus();
  }
}

function openMenu() {
  const overlay = document.getElementById('menuOverlay');
  const sideMenu = document.getElementById('sideMenu');
  sideMenu.classList.remove('-translate-x-full');
  sideMenu.classList.add('translate-x-0');
  overlay.classList.remove('hidden', 'pointer-events-none');
  setTimeout(() => overlay.classList.add('opacity-100'), 20);
}

function closeMenu() {
  const overlay = document.getElementById('menuOverlay');
  const sideMenu = document.getElementById('sideMenu');
  sideMenu.classList.add('-translate-x-full');
  sideMenu.classList.remove('translate-x-0');
  overlay.classList.remove('opacity-100');
  setTimeout(() => {
    overlay.classList.add('hidden', 'pointer-events-none');
  }, 300);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
  applySiteConfig();

  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', () => {
      if (sideMenu.classList.contains('-translate-x-full')) {
        openMenu();
      } else {
        closeMenu();
      }
    });
  }

  const closeMenuBtn = document.getElementById('closeMenuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMenu);
  }
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  renderRecipes(recipes);
  updateFavCount();
  updateCartCount();
  renderCart();

  const subscribeInput = document.getElementById('subscribeEmail');
  const subscribeBtn = document.querySelector('.subscribe-btn');
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', () => {
      const email = subscribeInput?.value.trim() || '';
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!validEmail) {
        showToast("Merci d'entrer un email valide");
        return;
      }
      showToast('Merci, vous êtes inscrit(e) !');
      if (subscribeInput) subscribeInput.value = '';
    });
  }

  const contactLink = document.querySelector('.contact-link');
  if (contactLink) {
    contactLink.addEventListener('click', event => {
      event.preventDefault();
      showPage('home');
      setTimeout(scrollToContact, 250);
    });
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      showToast('Merci ! Ton message a bien été pris en compte.');
      form.reset();
    });
  }
});
