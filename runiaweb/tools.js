const MONEY_USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const MONEY_ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PACKS = {
  "48hs": {
    name: "Web 48hs",
    price: 450,
    time: "desde 48hs",
    description: "Para tu caso recomendamos: Web 48hs. Ideal para salir online rápido con una landing clara y profesional.",
    bullets: ["Landing one page", "WhatsApp y CTA", "Formulario simple"]
  },
  institucional: {
    name: "Web Institucional",
    price: 650,
    time: "desde 72hs",
    description: "Para tu caso recomendamos: Web Institucional. Ideal para explicar quiénes son, qué ofrecen y generar confianza.",
    bullets: ["Secciones institucionales", "Diseño responsive", "Contacto directo"]
  },
  comercial: {
    name: "Web Comercial",
    price: 850,
    time: "desde 48hs",
    description: "Para tu caso recomendamos: Web Comercial. Ideal para captar consultas y ordenar el recorrido de venta.",
    bullets: ["Estructura comercial", "Formularios", "Copy base"]
  },
  sistema: {
    name: "Web + Sistema",
    price: 1500,
    time: "según alcance",
    description: "Para tu caso recomendamos: Web + Sistema. Ideal si querés dejar la base preparada para automatización, CRM o IA.",
    bullets: ["Web comercial", "Seguimiento inicial", "Escalable con Runia Systems"]
  }
};

const ADDONS = {
  formulario: { name: "Formulario simple", price: 90 },
  whatsapp: { name: "WhatsApp integrado", price: 90 },
  catalogo: { name: "Catálogo / productos", price: 280 },
  automatizacion: { name: "Automatización o IA futura", price: 350 }
};

const getCheckedValues = (form, name) => Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((input) => input.value);
const getFormObject = (form) => Object.fromEntries(new FormData(form).entries());
const priceText = (price) => `desde USD ${Number(price || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

const recommendPack = (values, features = []) => {
  const need = values.need || "48hs";

  if (need === "sistema" || features.includes("automatizacion")) return "sistema";
  if (need === "comercial" || features.includes("catalogo")) return "comercial";
  if (need === "institucional") return "institucional";
  return "48hs";
};

const estimatePrice = (packKey, features = []) => {
  const base = PACKS[packKey].price;
  const extras = features.reduce((sum, key) => sum + (ADDONS[key]?.price || 0), 0);
  return base + extras;
};

const renderResultList = (node, items) => {
  if (!node) return;
  node.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
};

const initQuote = () => {
  const form = document.querySelector("[data-quote-form]");
  if (!form) return;

  const resultName = document.querySelector("[data-quote-name]");
  const resultRange = document.querySelector("[data-quote-range]");
  const resultTime = document.querySelector("[data-quote-time]");
  const resultText = document.querySelector("[data-quote-text]");
  const resultList = document.querySelector("[data-quote-list]");
  const briefLink = document.querySelector("[data-quote-brief]");
  const budgetLink = document.querySelector("[data-quote-budget]");
  const whatsappLink = document.querySelector("[data-quote-whatsapp]");

  const update = () => {
    const values = getFormObject(form);
    const features = getCheckedValues(form, "features");
    const assets = getCheckedValues(form, "assets");
    const packKey = recommendPack(values, features);
    const pack = PACKS[packKey];
    const estimate = estimatePrice(packKey, features);
    const extras = features.map((key) => ADDONS[key]?.name).filter(Boolean);

    resultName.textContent = pack.name;
    resultRange.textContent = `Precio estimado: ${priceText(estimate)}`;
    if (resultTime) resultTime.textContent = `Tiempo estimado: ${pack.time}`;
    resultText.textContent = pack.description;
    renderResultList(resultList, [
      ...pack.bullets,
      ...extras,
      `Próximo paso: enviarnos la información para armar tu propuesta.`,
      assets.length ? `Materiales listos: ${assets.join(", ")}` : "Materiales pendientes: logo, textos o fotos"
    ]);

    const params = new URLSearchParams({
      pack: pack.name,
      rango: priceText(estimate),
      objetivo: values.need || "",
      negocio: values.business || "",
      nombre: values.name || "",
      whatsapp: values.whatsapp || ""
    });
    briefLink.href = `../brief/?${params.toString()}`;
    if (budgetLink) budgetLink.href = `../presupuestador/?${params.toString()}`;

    const message = `Hola Runia Web. Quiero cotizar mi web.
Nombre: ${values.name || "-"}
Empresa: ${values.business || "-"}
Rubro: ${values.industry || "-"}
WhatsApp: ${values.whatsapp || "-"}
Recomendación: ${pack.name}
Tiempo estimado: ${pack.time}
Precio estimado: ${priceText(estimate)}
Necesito: ${values.need || "-"}
Funcionalidades: ${extras.join(", ") || "-"}`;
    whatsappLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
};

const initBudget = () => {
  const form = document.querySelector("[data-budget-form]");
  if (!form) return;

  const totalUsd = document.querySelector("[data-total-usd]");
  const totalArs = document.querySelector("[data-total-ars]");
  const summary = document.querySelector("[data-budget-summary]");
  const preview = document.querySelector("[data-proposal-preview]");
  const exportButton = document.querySelector("[data-export-pdf]");

  const webTypes = {
    web48: { name: "Web 48hs", price: 450, detail: "Landing one page, diseño responsive, WhatsApp, CTA y formulario simple." },
    comercial: { name: "Web Comercial", price: 850, detail: "Estructura comercial, secciones estratégicas, formularios, WhatsApp y copy base." },
    sistema: { name: "Web + Sistema", price: 1500, detail: "Web comercial con automatización inicial, CRM o seguimiento y base para Runia Systems." }
  };

  const budgetExtras = {
    copy: { name: "Copywriting avanzado", price: 180 },
    brand: { name: "Diseño de marca básico", price: 250 },
    products: { name: "Carga de productos", price: 220 },
    catalog: { name: "Catálogo", price: 280 },
    automation: { name: "Automatización", price: 350 },
    dashboard: { name: "Dashboard", price: 380 }
  };

  const getBudget = () => {
    const values = getFormObject(form);
    const selectedType = webTypes[values.webType] || webTypes.comercial;
    const extras = getCheckedValues(form, "budgetExtras").map((key) => budgetExtras[key]).filter(Boolean);
    const base = Number(values.basePrice || selectedType.price || 0);
    const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
    const subtotal = base + extrasTotal;
    const discount = Math.min(Number(values.discount || 0), subtotal);
    const total = Math.max(subtotal - discount, 0);
    const commissionPercent = Number(values.commission || 0);
    const commissionAmount = total * (commissionPercent / 100);
    const rate = Number(values.rate || 1300);
    return { values, selectedType, extras, base, extrasTotal, subtotal, discount, total, commissionPercent, commissionAmount, rate };
  };

  const renderBudget = () => {
    const data = getBudget();
    const { values, selectedType, extras, base, extrasTotal, subtotal, discount, total, commissionPercent, commissionAmount, rate } = data;
    totalUsd.textContent = MONEY_USD.format(total);
    totalArs.textContent = MONEY_ARS.format(total * rate);
    summary.innerHTML = `
      <ul class="tool-result-list">
        <li>Precio base: ${MONEY_USD.format(base)}</li>
        <li>Extras: ${MONEY_USD.format(extrasTotal)}</li>
        <li>Descuento: ${MONEY_USD.format(discount)}</li>
        <li>Comisión partner: ${commissionPercent}% · ${MONEY_USD.format(commissionAmount)}</li>
      </ul>
    `;
    preview.innerHTML = `
      <div class="proposal-preview" id="proposalDocument">
        <header class="proposal-header">
          <a class="proposal-brand" href="../"><img src="https://www.runia.ar/images/runialogo.png" alt="Runia" /><span>Web</span></a>
          <div class="proposal-meta">
            <p>Cliente: <strong>${escapeHtml(values.client || "-")}</strong></p>
            <p>Empresa: <strong>${escapeHtml(values.company || "-")}</strong></p>
            <p>Fecha: <strong>${escapeHtml(values.date || new Date().toISOString().slice(0, 10))}</strong></p>
            <p>Validez: <strong>${escapeHtml(values.validity || "7 días")}</strong></p>
          </div>
        </header>
        <div class="proposal-frame">
          <p class="tool-label">Presupuesto Runia Web</p>
          <h2>${escapeHtml(selectedType.name)}</h2>
          <p>${escapeHtml(selectedType.detail)}</p>
        </div>
        <div class="proposal-frame">
          <p class="tool-label">Datos del cliente</p>
          <ul class="proposal-items">
            <li><strong>Rubro</strong> · ${escapeHtml(values.industry || "-")}</li>
            <li><strong>Vendedor / partner</strong> · ${escapeHtml(values.seller || "-")}</li>
            <li><strong>Tiempo estimado</strong> · ${escapeHtml(values.time || "-")}</li>
          </ul>
        </div>
        <div class="proposal-frame">
          <p class="tool-label">Detalle de ítems</p>
          <ul class="proposal-items">
            <li><strong>${escapeHtml(selectedType.name)}</strong> · ${escapeHtml(selectedType.detail)} · ${MONEY_USD.format(base)}</li>
            ${extras.map((item) => `<li><strong>${escapeHtml(item.name)}</strong> · Extra solicitado · ${MONEY_USD.format(item.price)}</li>`).join("")}
          </ul>
        </div>
        <div class="proposal-frame">
          <p class="tool-label">Resumen económico</p>
          <ul class="proposal-items">
            <li><strong>Subtotal</strong> · ${MONEY_USD.format(subtotal)}</li>
            <li><strong>Descuento</strong> · ${MONEY_USD.format(discount)}</li>
            <li><strong>Comisión partner</strong> · ${commissionPercent}% · ${MONEY_USD.format(commissionAmount)}</li>
          </ul>
          <p class="proposal-total">Total final: ${MONEY_USD.format(total)} · Referencia ARS: ${MONEY_ARS.format(total * rate)}</p>
        </div>
        <div class="proposal-frame">
          <p class="tool-label">Condiciones y próximos pasos</p>
          <p>${escapeHtml(values.terms || "50% para comenzar. Entrega según alcance acordado.")}</p>
          <ul class="proposal-items">
            <li>Confirmar alcance y materiales disponibles.</li>
            <li>Enviar seña para reservar producción.</li>
            <li>Completar brief Runia Web para iniciar implementación.</li>
          </ul>
        </div>
      </div>
    `;
  };

  const syncBasePrice = () => {
    const type = form.elements.webType?.value;
    const priceInput = form.elements.basePrice;
    if (priceInput && webTypes[type]) priceInput.value = webTypes[type].price;
  };

  form.addEventListener("input", () => {
    renderBudget();
  });

  form.elements.webType?.addEventListener("change", () => {
    syncBasePrice();
    renderBudget();
  });

  exportButton?.addEventListener("click", async () => {
    if (!window.html2canvas || !window.jspdf) {
      window.print();
      return;
    }
    const docNode = document.getElementById("proposalDocument");
    const canvas = await window.html2canvas(docNode, { backgroundColor: "#fffdf9", scale: 2, useCORS: true });
    const image = canvas.toDataURL("image/png", 1);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(image, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`Runia_Web_${(getFormObject(form).client || "Presupuesto").replace(/\s+/g, "_")}.pdf`);
  });

  if (form.elements.date) form.elements.date.value = new Date().toISOString().slice(0, 10);
  syncBasePrice();
  renderBudget();
};

const initBrief = () => {
  const form = document.querySelector("[data-brief-form]");
  if (!form) return;
  const output = document.querySelector("[data-brief-output]");
  const summaryNode = document.querySelector("[data-brief-summary]");
  const missingNode = document.querySelector("[data-brief-missing]");
  const structureNode = document.querySelector("[data-brief-structure]");
  const copyButton = document.querySelector("[data-copy-brief]");
  const params = new URLSearchParams(window.location.search);

  if (params.get("negocio")) form.querySelector('[name="business"]').value = params.get("negocio");
  if (params.get("whatsapp")) form.querySelector('[name="whatsapp"]').value = params.get("whatsapp");

  const getMulti = (name) => getCheckedValues(form, name);

  const buildStructure = (values, objectives, features, sections) => {
    const base = sections.length ? sections : ["inicio", "servicios", "contacto"];
    const recommended = [...new Set([
      "inicio",
      objectives.includes("captar consultas") ? "problema / oportunidad" : "",
      ...base,
      features.includes("catálogo") ? "catálogo / productos" : "",
      features.includes("mapa") ? "ubicación / mapa" : "",
      features.includes("agenda") ? "agenda / reserva" : "",
      "llamado a la acción final"
    ].filter(Boolean))];
    return recommended;
  };

  const build = () => {
    const v = getFormObject(form);
    const objectives = getMulti("objective");
    const materials = getMulti("materials");
    const features = getMulti("features");
    const sections = getMulti("sections");
    const requiredMaterials = ["logo", "fotos", "links", "archivos"];
    const missing = requiredMaterials.filter((item) => !materials.includes(item));
    const structure = buildStructure(v, objectives, features, sections);

    summaryNode.innerHTML = `
      <p><strong>${escapeHtml(v.business || "Empresa sin nombre")}</strong> · ${escapeHtml(v.industry || "Rubro pendiente")}</p>
      <p>Objetivo: ${escapeHtml(objectives.join(", ") || "pendiente")}</p>
      <p>Contacto: ${escapeHtml(v.whatsapp || "-")} · ${escapeHtml(v.email || "-")}</p>
    `;
    renderResultList(missingNode, missing.length ? missing.map((item) => `Falta confirmar/enviar: ${item}`) : ["Materiales principales cargados o confirmados."]);
    renderResultList(structureNode, structure);

    const prompt = `Crear una web para ${v.business || "[empresa]"}, rubro ${v.industry || "[rubro]"}, usando la plantilla base Runia Web. Mantener estructura, estética y componentes del sistema. Personalizar copy, imágenes, servicios, CTA, WhatsApp, colores secundarios y secciones según este brief.

DATOS DEL NEGOCIO
Nombre: ${v.business || "-"}
Rubro: ${v.industry || "-"}
Ubicación: ${v.location || "-"}
WhatsApp: ${v.whatsapp || "-"}
Email: ${v.email || "-"}
Redes: ${v.socials || "-"}
Dominio: ${v.domain || "-"}

OBJETIVO DE LA WEB
${objectives.join(", ") || "-"}

CONTENIDO
Servicios principales: ${v.services || "-"}
Textos actuales: ${v.currentTexts || "-"}
Tono de comunicación: ${v.tone || "-"}
Diferencial del negocio: ${v.differential || "-"}
Clientes ideales: ${v.audience || "-"}

ESTÉTICA
Colores: ${v.colors || "-"}
Referencias: ${v.references || "-"}
Estilo deseado: ${v.style || "-"}
Cosas que NO quiere: ${v.donts || "-"}

MATERIALES DISPONIBLES
${materials.join(", ") || "-"}

FUNCIONALIDADES
${features.join(", ") || "-"}

SECCIONES RECOMENDADAS
${structure.join(" · ")}

CHECKLIST DE MATERIALES FALTANTES
${missing.length ? missing.join(" · ") : "Sin faltantes principales"}

INSTRUCCIONES DE EJECUCIÓN
Crear una web clara, moderna, responsive y alineada a Runia Web. Priorizar jerarquía visual, conversión, velocidad de entrega, CTAs visibles y WhatsApp. No cambiar la identidad base de Runia Web salvo colores secundarios o detalles menores definidos por el brief.`;
    output.value = prompt;
  };

  form.addEventListener("input", build);
  copyButton?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    copyButton.textContent = "Brief copiado";
    window.setTimeout(() => { copyButton.textContent = "Copiar prompt"; }, 1300);
  });
  build();
};

const initCatalog = () => {
  const buttons = Array.from(document.querySelectorAll("[data-catalog-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-catalog-card]"));
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.catalogFilter;
      buttons.forEach((item) => item.classList.toggle("button-dark", item === button));
      buttons.forEach((item) => item.classList.toggle("button-soft", item !== button));
      cards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.catalogCard !== filter;
      });
    });
  });
};

initQuote();
initBudget();
initBrief();
initCatalog();
