const app = document.getElementById('app');

async function loadProducts() {
  try {
    const response = await fetch('products.json');
    const products = await response.json();
    
    let html = '';

    products.forEach(p => {
      const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
      const specsHtml = p.specs.map(s => `<span class="spec-badge">${s}</span>`).join('');

      html += `
        <article class="card">
          <img src="${p.img}" alt="${p.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x250?text=Reloj+Premium'">
          <h2>${p.name}</h2>
          <div class="rating">${stars} <span>(${p.rating})</span></div>
          <div class="price">${p.price}</div>
          <p>${p.description}</p>
          <div class="specs">
            ${specsHtml}
          </div>
          <a href="${p.url}" target="_blank" class="btn">
            Saber más en Amazon <i data-lucide="external-link" style="width: 16px; height: 16px; vertical-align: middle;"></i>
          </a>
        </article>
      `;
    });

    app.innerHTML = html;
    
    // Re-inicializar iconos de Lucide para los elementos recién creados
    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    app.innerHTML = `<div class="error">Error al cargar los productos. Inténtalo de nuevo más tarde.</div>`;
    console.error('Error fetching products:', error);
  }
}

loadProducts();
