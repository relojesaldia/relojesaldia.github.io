const app = document.getElementById('app');

async function loadProducts() {
  try {
    const response = await fetch('products.json?t=' + Date.now());
    const products = await response.json();
    
    let html = '';

    products.forEach((p, pIndex) => {
      const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
      const specsHtml = p.specs.map(s => `<span class="spec-badge">${s}</span>`).join('');
      
      // Construir el HTML del carrusel
      const imagesHtml = p.images.map((img, i) => `
        <img src="${img}" 
             alt="${p.name} - Vista ${i + 1}" 
             class="card-img ${i === 0 ? 'active' : ''}" 
             data-index="${i}"
             onerror="this.src='https://placehold.co/300x250/4f46e5/ffffff?text=Reloj+Premium'">
      `).join('');

      const dotsHtml = p.images.length > 1 ? `
        <div class="carousel-dots">
          ${p.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      ` : '';

      html += `
        <article class="card" data-id="${p.id}" data-current="0" data-total="${p.images.length}">
          <div class="carousel-container">
            ${imagesHtml}
            ${p.images.length > 1 ? `
              <button class="carousel-btn prev" onclick="changeImage('${p.id}', -1)"><i data-lucide="chevron-left"></i></button>
              <button class="carousel-btn next" onclick="changeImage('${p.id}', 1)"><i data-lucide="chevron-right"></i></button>
            ` : ''}
            ${dotsHtml}
          </div>
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
    
    // Generar tabla comparativa
    renderComparisonTable(products);

    // Inyectar datos estructurados (JSON-LD) para SEO
    injectJSONLD(products);

    // Inicializar carruseles y autoplay
    initCarousels();

    // Re-inicializar iconos de Lucide
    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    app.innerHTML = `<div class="error">Error al cargar los productos. Inténtalo de nuevo más tarde.</div>`;
    console.error('Error fetching products:', error);
  }
}

function initCarousels() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const total = parseInt(card.dataset.total);
    if (total <= 1) return;

    let intervalId = setInterval(() => {
      changeImage(card.dataset.id, 1);
    }, 4000); // 4 segundos por imagen

    // Pausar al pasar el ratón
    card.addEventListener('mouseenter', () => clearInterval(intervalId));
    card.addEventListener('mouseleave', () => {
      intervalId = setInterval(() => {
        changeImage(card.dataset.id, 1);
      }, 4000);
    });
  });
}

window.changeImage = function(productId, direction) {
  const card = document.querySelector(`.card[data-id="${productId}"]`);
  if (!card) return;

  let current = parseInt(card.dataset.current);
  const total = parseInt(card.dataset.total);
  
  current = (current + direction + total) % total;
  card.dataset.current = current;

  // Actualizar imágenes
  const imgs = card.querySelectorAll('.card-img');
  imgs.forEach((img, i) => {
    img.classList.toggle('active', i === current);
  });

  // Actualizar puntos
  const dots = card.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
  });
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
        "image": p.images[0],
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
          "reviewCount": Math.floor(Math.random() * 50) + 10
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

function renderComparisonTable(products) {
  const table = document.getElementById('comparison-table');
  if (!table) return;

  const specs = [
    { label: 'Pantalla', key: 'display' },
    { label: 'Batería', key: 'battery' },
    { label: 'Sensores', key: 'sensors' },
    { label: 'Agua', key: 'water' },
    { label: 'Peso', key: 'weight' },
    { label: 'Llamadas BT', key: 'calling' }
  ];

  let html = `
    <thead>
      <tr>
        <th class="spec-label">Característica</th>
        ${products.map(p => `
          <th>
            <div class="table-product-name">
              <img src="${p.images[0]}" class="table-product-img" alt="${p.name}">
              ${p.name.split(' ').slice(1).join(' ')}
            </div>
          </th>
        `).join('')}
      </tr>
    </thead>
    <tbody>
  `;

  specs.forEach(spec => {
    html += `
      <tr>
        <td class="spec-label">${spec.label}</td>
        ${products.map(p => {
          const val = p.comparison_specs[spec.key];
          let cellClass = '';
          if (spec.key === 'calling') {
            cellClass = val.toLowerCase().includes('si') ? 'calling-yes' : 'calling-no';
          }
          return `<td class="${cellClass}">${val}</td>`;
        }).join('')}
      </tr>
    `;
  });

  html += '</tbody>';
  table.innerHTML = html;
}

loadProducts();
