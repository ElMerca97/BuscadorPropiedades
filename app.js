const input = document.getElementById("searchInput");
const container = document.getElementById("resultsContainer");

input.addEventListener("input", () => {
  const query = input.value.toLowerCase().trim();
  container.innerHTML = "";

  if (!query) return;

  const resultadosAgrupados = {};

  // 1. Buscador que recorre todo el objeto data
  const buscar = (obj, nombreSeccion) => {
    Object.entries(obj).forEach(([key, valor]) => {
      if (Array.isArray(valor)) {
        valor.forEach(item => {
          if (Object.values(item).join(" ").toLowerCase().includes(query)) {
            const titulo = key.replace(/_/g, " ").toUpperCase();
            if (!resultadosAgrupados[titulo]) resultadosAgrupados[titulo] = [];
            resultadosAgrupados[titulo].push(item);
          }
        });
      } else if (typeof valor === 'object') {
        buscar(valor, key);
      }
    });
  };

  buscar(data, "");

  // 2. Renderizado Dinámico y Resumido
  Object.entries(resultadosAgrupados).forEach(([titulo, items]) => {
    const divWrapper = document.createElement("div");
    divWrapper.innerHTML = `<h3 style="color: #2c3e50; margin-top: 25px; border-bottom: 2px solid #3498db; display: inline-block;">${titulo}</h3>`;

    const tabla = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // Identificamos qué columnas existen en este grupo de resultados
    const columnas = [...new Set(items.flatMap(obj => Object.keys(obj)))];

    // Crear encabezados
    const trHead = document.createElement("tr");
    columnas.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.replace(/_/g, " ").toUpperCase();
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // Crear filas con recorte de texto
    items.forEach(item => {
      const tr = document.createElement("tr");
      columnas.forEach(col => {
        const td = document.createElement("td");
        let valor = item[col] || "---";

        // --- LÓGICA DE RESUMEN ---
        // Si el texto es muy largo (más de 60 caracteres), lo cortamos
        if (typeof valor === "string" && valor.length > 60) {
          td.title = valor; // Al pasar el mouse se ve el texto completo
          valor = valor.substring(0, 57) + "...";
        }

        td.innerHTML = highlight(valor, query);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    tabla.appendChild(thead);
    tabla.appendChild(tbody);
    divWrapper.appendChild(tabla);
    container.appendChild(divWrapper);
  });
});

const themeToggle = document.getElementById('themeToggle');
const body = document.documentElement;

// Definición de los 5 colores para la transición (Claro -> Atardecer -> Oscuro)
const tonos = [
  { bg: "#f4f7f6", text: "#2c3e50", name: "claro" },
  { bg: "#fce4ec", text: "#4a148c", name: "atardecer-1" }, // Rosado claro
  { bg: "#ffab91", text: "#bf360c", name: "atardecer-2" }, // Naranja atardecer
  { bg: "#5c6bc0", text: "#ffffff", name: "anochecer" },   // Azul profundo
  { bg: "#1a1a1a", text: "#e0e0e0", name: "oscuro" }     // Noche total
];

let indexTono = localStorage.getItem('themeIndex') ? parseInt(localStorage.getItem('themeIndex')) : 0;
aplicarTono(indexTono);

themeToggle.addEventListener('click', async () => {
  const esHaciaOscuro = indexTono === 0;

  // Animación del Icono
  const span = themeToggle.querySelector('span');
  span.classList.add('icon-exit');

  // Esperar a que el icono caiga para cambiar los colores
  setTimeout(async () => {
    if (esHaciaOscuro) {
      // Ciclo hacia oscuro: 0 -> 1 -> 2 -> 3 -> 4
      for (let i = 1; i <= 4; i++) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 4;
      body.setAttribute('data-theme', 'dark');
    } else {
      // Ciclo hacia claro: 4 -> 3 -> 2 -> 1 -> 0
      for (let i = 3; i >= 0; i--) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 0;
      body.removeAttribute('data-theme');
    }

    // Actualizar icono y estado final
    span.textContent = indexTono === 4 ? '🌙' : '☀️';
    span.classList.remove('icon-exit');
    span.classList.add('icon-enter');

    setTimeout(() => span.classList.remove('icon-enter'), 50);
    localStorage.setItem('themeIndex', indexTono);
  }, 400);
});

function cambiarColorProgresivo(i) {
  return new Promise(resolve => {
    setTimeout(() => {
      aplicarTono(i);
      resolve();
    }, 150); // Velocidad de cada paso del atardecer
  });
}

function aplicarTono(i) {
  const tono = tonos[i];
  body.style.setProperty('--bg-color', tono.bg);
  body.style.setProperty('--text-color', tono.text);
  // Ajustamos colores de tabla dinámicamente según el tono
  if (i > 2) {
    body.style.setProperty('--card-bg', "#2d2d2d");
    body.style.setProperty('--border-color', "#444");
  } else {
    body.style.setProperty('--card-bg', "#ffffff");
    body.style.setProperty('--border-color', "#ddd");
  }
}

themeToggle.addEventListener('click', async () => {
  const esHaciaOscuro = indexTono === 0;
  const span = themeToggle.querySelector('span');

  // 1. El astro actual cae y se pierde
  span.classList.add('icon-fall');

  // 2. Mientras cae, iniciamos la transición de colores (atardecer)
  setTimeout(async () => {
    if (esHaciaOscuro) {
      for (let i = 1; i <= 4; i++) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 4;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      for (let i = 3; i >= 0; i--) {
        await cambiarColorProgresivo(i);
      }
      indexTono = 0;
      document.documentElement.removeAttribute('data-theme');
    }

    // 3. Cambiamos el ícono mientras está invisible arriba
    span.textContent = indexTono === 4 ? '🌙' : '☀️';
    span.classList.remove('icon-fall');
    span.classList.add('icon-source');

    // 4. Forzamos un pequeño reflow para que el navegador note el cambio de posición
    void span.offsetWidth;

    // 5. El nuevo astro baja desde arriba a su posición central
    span.classList.remove('icon-source');

    localStorage.setItem('themeIndex', indexTono);
  }, 400); // Tiempo que tarda en caer
});