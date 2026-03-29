fetch('products.json')
  .then(res => res.json())
  .then(products => {
    let html = '';

    products.forEach(p => {
      html += `
        <div style="border:1px solid #ccc; padding:10px; margin:10px;">
          <h2>${p.name}</h2>
          <p>Precio: ${p.price}</p>
          <a href="${p.url}" target="_blank">
            Ver en Amazon
          </a>
        </div>
      `;
    });

    document.getElementById('app').innerHTML = html;
  });
