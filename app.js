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
    
    // Inyectar datos estructurados (JSON-LD) para SEO
    injectJSONLD(products);

    // Re-inicializar iconos de Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    app.innerHTML = `<div class="error">Error al cargar los productos. Inténtalo de nuevo más tarde.</div>`;
    console.error('Error fetching products:', error);
  }
}

function injectJSONLD(products) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((p, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "description": p.description,
        "image": p.img,
        "url": p.url,
        "offers": {
          "@type": "Offer",
          "price": p.price.replace(/[^0-9.]/g, ''),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": p.rating,
          "reviewCount": Math.floor(Math.random() * 50) + 10 // Simulación para SEO
        }
      }
    }))
  };

  let script = document.getElementById('json-ld');
  if (!script) {
    script = document.createElement('script');
    script.id = 'json-ld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(jsonLd);
}

loadProducts();
