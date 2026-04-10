const input = document.getElementById("searchInput");
const container = document.getElementById("resultsContainer");
const themeToggle = document.getElementById('themeToggle');
const body = document.documentElement;

// --- 1. CONFIGURACIÓN DE TEMAS Y TONOS ---
const tonos = [
  { bg: "#f4f7f6", text: "#2c3e50", name: "claro" },
  { bg: "#fce4ec", text: "#4a148c", name: "atardecer-1" },
  { bg: "#ffab91", text: "#bf360c", name: "atardecer-2" },
  { bg: "#5c6bc0", text: "#ffffff", name: "anochecer" },
  { bg: "#1a1a1a", text: "#e0e0e0", name: "oscuro" }
];

let indexTono = localStorage.getItem('themeIndex') ? parseInt(localStorage.getItem('themeIndex')) : 0;

function aplicarTono(i) {
  const tono = tonos[i];
  body.style.setProperty('--bg-color', tono.bg);
  body.style.setProperty('--text-color', tono.text);
  
  if (i > 2) {
    body.style.setProperty('--card-bg', "#2d2d2d");
    body.style.setProperty('--border-color', "#444");
    body.setAttribute('data-theme', 'dark');
  } else {
    body.style.setProperty('--card-bg', "#ffffff");
    body.style.setProperty('--border-color', "#ddd");
    body.removeAttribute('data-theme');
  }
}

// Inicializar el tema guardado
aplicarTono(indexTono);

// --- 2. LÓGICA DE ANIMACIÓN DEL TEMA (UNIFICADA) ---
function cambiarColorProgresivo(i) {
  return new Promise(resolve => {
    setTimeout(() => {
      aplicarTono(i);
      resolve();
    }, 120); 
  });
}

themeToggle.addEventListener('click', async () => {
  const esHaciaOscuro = indexTono === 0;
  const span = themeToggle.querySelector('span');

  // El astro actual cae y se pierde
  span.classList.add('icon-fall');

  setTimeout(async () => {
    if (esHaciaOscuro) {
      for (let i = 1; i <= 4; i++) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 4;
    } else {
      for (let i = 3; i >= 0; i--) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 0;
    }

    // Cambiamos el ícono mientras está invisible arriba
    span.textContent = indexTono === 4 ? '🌙' : '☀️';
    span.classList.remove('icon-fall');
    span.classList.add('icon-source');

    // Reflow para notar el cambio de posición
    void span.offsetWidth;

    // El nuevo astro baja desde arriba
    span.classList.remove('icon-source');

    localStorage.setItem('themeIndex', indexTono);
  }, 400); 
});

// --- 3. LÓGICA DE BÚSQUEDA ---

// Función para resaltar texto (Corregida)
function highlight(text, query) {
  if (!text) return "";
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, "gi");
  return text.toString().replace(regex, `<mark>$1</mark>`);
}

input.addEventListener("input", () => {
  const query = input.value.toLowerCase().trim();
  container.innerHTML = "";

  // Validamos que 'data' exista (traído de data.js)
  if (!query || typeof data === 'undefined') return;

  const resultadosAgrupados = {};

  const buscar = (obj) => {
    if (!obj) return;
    
    Object.entries(obj).forEach(([key, valor]) => {
      if (Array.isArray(valor)) {
        valor.forEach(item => {
          const contenidoFila = Object.values(item).join(" ").toLowerCase();
          if (contenidoFila.includes(query)) {
            const titulo = key.replace(/_/g, " ").toUpperCase();
            if (!resultadosAgrupados[titulo]) resultadosAgrupados[titulo] = [];
            resultadosAgrupados[titulo].push(item);
          }
        });
      } else if (typeof valor === 'object' && valor !== null) {
        buscar(valor);
      }
    });
  };

  buscar(data);

  // Renderizado
  Object.entries(resultadosAgrupados).forEach(([titulo, items]) => {
    const divWrapper = document.createElement("div");
    divWrapper.innerHTML = `<h3 style="margin-top: 25px; border-bottom: 2px solid var(--table-header); display: inline-block;">${titulo}</h3>`;

    const tabla = document.createElement("table");
    const columnas = [...new Set(items.flatMap(obj => Object.keys(obj)))];

    // Encabezados
    let html = `<thead><tr>`;
    columnas.forEach(col => {
      html += `<th>${col.replace(/_/g, " ").toUpperCase()}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Filas
    items.forEach(item => {
      html += `<tr>`;
      columnas.forEach(col => {
        let valor = item[col] || "---";
        if (typeof valor === "string" && valor.length > 60) {
          const valorCompleto = valor.replace(/"/g, '&quot;'); 
          let valorCorto = valor.substring(0, 57) + "...";
          html += `<td title="${valorCompleto}">${highlight(valorCorto, query)}</td>`;
        } else {
          html += `<td>${highlight(valor, query)}</td>`;
        }
      });
      html += `</tr>`;
    });

    html += `</tbody>`;
    tabla.innerHTML = html;
    divWrapper.appendChild(tabla);
    container.appendChild(divWrapper);
  });
});