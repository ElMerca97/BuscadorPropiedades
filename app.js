const input = document.getElementById("searchInput");
const results = document.getElementById("results");

input.addEventListener("input", () => {
  const query = input.value.toLowerCase().trim();
  results.innerHTML = "";

  if (!query) return;

  // 🔹 PROPIEDADES (mejorado)
  data.propiedades.forEach(p => {
    const contenido = `
      ${p.nombre}
      ${p.tecnico}
      ${p.numero}
      ${p.grupo}
      ${p.dept_id}
      ${p.subcat}
    `.toLowerCase();

    if (contenido.includes(query)) {
      renderRow(
        "Propiedad",
        `${p.nombre} | ${p.grupo} | Técnico: ${p.tecnico}`,
        p.numero,
        query
      );
    }
  });

  // 🔹 CÓDIGOS CONTABILIDAD
  Object.entries(data.codigos_contabilidad).forEach(([catName, items]) => {
    items.forEach(item => {
      const contenido = `
        ${item.tipo || ""}
        ${item.ejemplos || ""}
        ${item.explicacion || ""}
        ${item.cuenta || ""}
      `.toLowerCase();

      if (contenido.includes(query)) {
        renderRow(
          catName.replace(/_/g, " "),
          `${item.tipo} - ${item.ejemplos || ""}`,
          `Cuenta: ${item.cuenta || "N/A"}`,
          query
        );
      }
    });
  });

  // 🔹 CENTROS DE COSTO
  data.centros_costos_uruguay.forEach(cc => {
    const contenido = `
      ${cc.grupo}
      ${cc.administrador}
      ${cc.dept_id}
    `.toLowerCase();

    if (contenido.includes(query)) {
      renderRow(
        "Centro de Costo",
        `${cc.grupo} | Adm: ${cc.administrador}`,
        cc.dept_id,
        query
      );
    }
  });
});

// 🔥 FIX: escape regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 🔥 highlight seguro
function highlight(text, query) {
  if (!text) return "";
  const safeQuery = escapeRegex(query);
  const regex = new RegExp(`(${safeQuery})`, "gi");
  return text.toString().replace(regex, `<mark>$1</mark>`);
}

// render
function renderRow(categoria, info, codigo, query) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${categoria}</td>
    <td>${highlight(info, query)}</td>
    <td>${highlight(codigo, query)}</td>
  `;

  results.appendChild(row);
}