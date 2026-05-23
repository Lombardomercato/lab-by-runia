const MONEY_USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const MONEY_ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PACKS = {
  "48hs": {
    name: "Web 48hs",
    price: 450,
    priceLabel: "USD 450",
    description: "Para empresas que necesitan salir online rápido.",
    bullets: ["Landing one page", "Diseño responsive", "WhatsApp integrado", "Formulario simple", "CTA principal", "Estructura comercial base", "Entrega express 48hs"]
  },
  comercial: {
    name: "Web Comercial",
    price: 850,
    priceLabel: "USD 850",
    description: "Para empresas que quieren captar más consultas y vender mejor.",
    bullets: ["Web con estructura comercial", "Secciones estratégicas", "Copy base", "WhatsApp y formularios", "Optimización mobile", "Base lista para campañas", "Mejor jerarquía visual y recorrido comercial"]
  },
  sistema: {
    name: "Web + Sistema",
    price: 1500,
    priceLabel: "desde USD 1.500",
    description: "Para empresas que quieren conectar su web con automatización o seguimiento.",
    bullets: ["Web comercial", "CRM o pipeline simple", "Automatización inicial", "Seguimiento de consultas", "Dashboards básicos", "Integración futura con Runia"]
  }
};

const ADDONS = {
  whatsapp: { name: "WhatsApp integrado" },
  formulario: { name: "Formulario de contacto" },
  mapa: { name: "Mapa / ubicación" },
  catalogo: { name: "Catálogo de servicios o productos" },
  secciones: { name: "Secciones comerciales" },
  automatizacion: { name: "Automatización futura" }
};

const QUOTE_EXTRAS = {
  brandingBasic: { name: "Branding básico", detail: "USD 250 · Logo simple, paleta de colores, tipografías y guía visual básica." },
  brandingPro: { name: "Branding pro", detail: "USD 650 · Logo, variantes, paleta, tipografías, mini manual de marca y aplicaciones básicas." },
  copywriting: { name: "Copywriting avanzado", detail: "USD 250" },
  productsLoad: { name: "Carga de productos/servicios", detail: "desde USD 150" },
  maintenance: { name: "Mantenimiento mensual", detail: "desde USD 80/mes" },
  automationExtra: { name: "Automatización / IA", detail: "a cotizar" }
};

const getCheckedValues = (form, name) => Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((input) => input.value);
const getFormObject = (form) => Object.fromEntries(new FormData(form).entries());
const priceText = (price) => `desde USD ${Number(price || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

const recommendPack = (values, features = []) => {
  const need = values.need || "rapido";

  if (need === "sistema" || features.includes("automatizacion")) return "sistema";
  if (need === "consultas" || need === "productos" || need === "imagen" || features.includes("catalogo") || features.includes("secciones")) return "comercial";
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

const renderQuoteExtras = (node, items) => {
  if (!node) return;
  if (!items.length) {
    node.innerHTML = "";
    return;
  }
  node.innerHTML = `
    <p class="tool-label">Extras opcionales</p>
    <ul class="tool-result-list">
      ${items.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></li>`).join("")}
    </ul>
  `;
};

const initQuote = () => {
  const form = document.querySelector("[data-quote-form]");
  if (!form) return;

  const resultName = document.querySelector("[data-quote-name]");
  const resultRange = document.querySelector("[data-quote-range]");
  const resultTime = document.querySelector("[data-quote-time]");
  const resultText = document.querySelector("[data-quote-text]");
  const resultList = document.querySelector("[data-quote-list]");
  const resultExtras = document.querySelector("[data-quote-extras]");
  const whatsappLinks = document.querySelectorAll("[data-quote-whatsapp]");

  const update = () => {
    const values = getFormObject(form);
    const features = getCheckedValues(form, "features");
    const assets = getCheckedValues(form, "assets");
    const extrasKeys = getCheckedValues(form, "extras");
    const packKey = recommendPack(values, features);
    const pack = PACKS[packKey];
    const featuresText = features.map((key) => ADDONS[key]?.name).filter(Boolean);
    const extras = extrasKeys.map((key) => QUOTE_EXTRAS[key]).filter(Boolean);

    resultName.textContent = pack.name;
    resultRange.textContent = `Precio: ${pack.priceLabel}`;
    if (resultTime) resultTime.textContent = "";
    resultText.textContent = pack.description;
    renderResultList(resultList, pack.bullets);
    renderQuoteExtras(resultExtras, extras);

    const params = new URLSearchParams({
      pack: pack.name,
      precio: pack.priceLabel,
      objetivo: values.need || "",
      negocio: values.business || "",
      nombre: values.name || "",
      whatsapp: values.whatsapp || "",
      email: values.email || ""
    });

    const message = `Hola Runia Web. Quiero cotizar mi web.
Nombre: ${values.name || "-"}
Empresa: ${values.business || "-"}
Rubro: ${values.industry || "-"}
WhatsApp: ${values.whatsapp || "-"}
Email: ${values.email || "-"}
Plan recomendado: ${pack.name}
Precio: ${pack.priceLabel}
Necesito: ${values.need || "-"}
Funcionalidades: ${featuresText.join(", ") || "-"}
Materiales: ${assets.join(", ") || "-"}
Extras: ${extras.map((extra) => `${extra.name} (${extra.detail})`).join(", ") || "-"}`;
    whatsappLinks.forEach((link) => {
      link.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    });
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
    web48: { name: "Web 48hs", price: 450, detail: "Para empresas que necesitan salir online rápido. Incluye landing one page, diseño responsive, WhatsApp integrado, formulario simple, CTA principal, estructura comercial base y entrega express 48hs." },
    comercial: { name: "Web Comercial", price: 850, detail: "Para empresas que quieren captar más consultas y vender mejor. Incluye web con estructura comercial, secciones estratégicas, copy base, WhatsApp y formularios, optimización mobile, base lista para campañas y mejor jerarquía visual y recorrido comercial." },
    sistema: { name: "Web + Sistema", price: 1500, detail: "Web comercial, CRM o pipeline simple, automatización inicial, seguimiento de consultas, dashboards básicos e integración futura con Runia." }
  };

  const budgetExtras = {
    brandingBasic: { name: "Branding básico", price: 250 },
    brandingPro: { name: "Branding pro", price: 650 },
    copywriting: { name: "Copywriting avanzado", price: 250 },
    productsLoad: { name: "Carga de productos o servicios", price: 150 },
    maintenance: { name: "Mantenimiento mensual", price: 80 },
    automationAI: { name: "Automatización / IA", price: 0, displayPrice: "a cotizar" }
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
            ${extras.map((item) => `<li><strong>${escapeHtml(item.name)}</strong> · Extra solicitado · ${item.displayPrice ? escapeHtml(item.displayPrice) : MONEY_USD.format(item.price)}</li>`).join("")}
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
