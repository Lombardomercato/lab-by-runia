const MONEY_USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const MONEY_ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const PACKS = {
  "48hs": {
    name: "Web 48hs",
    price: 450,
    priceLabel: "USD 450",
    description: "Ideal para empresas que necesitan salir online rápido con una landing clara, moderna y profesional.",
    bullets: ["Landing one page", "Diseño responsive", "WhatsApp integrado", "Formulario simple", "CTA principal", "Estructura comercial base", "Entrega express 48hs"]
  },
  comercial: {
    name: "Web Comercial",
    price: 850,
    priceLabel: "USD 850",
    description: "Ideal para empresas que quieren captar más consultas y comunicar mejor sus servicios.",
    bullets: ["Web con estructura comercial", "Secciones estratégicas", "Copy base", "WhatsApp y formularios", "Optimización mobile", "Base lista para campañas", "Mejor jerarquía visual y recorrido comercial"]
  },
  sistema: {
    name: "Web + Sistema",
    price: 1500,
    priceLabel: "desde USD 1.500",
    description: "Ideal para empresas que quieren conectar su web con seguimiento, CRM o automatización.",
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
const usdLabel = (price) => `USD ${Number(price || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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
    maintenance: { name: "Mantenimiento mensual", price: 80, displayPrice: "desde USD 80/mes", recurring: true },
    automationAI: { name: "Automatización / IA", price: 0, displayPrice: "a cotizar" }
  };

  const getBudget = () => {
    const values = getFormObject(form);
    const selectedType = webTypes[values.webType] || webTypes.comercial;
    const extras = getCheckedValues(form, "budgetExtras").map((key) => budgetExtras[key]).filter(Boolean);
    const oneTimeExtras = extras.filter((item) => !item.recurring);
    const recurringExtras = extras.filter((item) => item.recurring);
    const base = Number(values.basePrice || selectedType.price || 0);
    const extrasTotal = oneTimeExtras.reduce((sum, item) => sum + item.price, 0);
    const monthlyTotal = recurringExtras.reduce((sum, item) => sum + item.price, 0);
    const subtotal = base + extrasTotal;
    const discount = Math.min(Number(values.discount || 0), subtotal);
    const total = Math.max(subtotal - discount, 0);
    const commissionPercent = Number(values.commission || 0);
    const commissionAmount = total * (commissionPercent / 100);
    const rate = Number(values.rate || 1300);
    return { values, selectedType, extras, oneTimeExtras, recurringExtras, base, extrasTotal, monthlyTotal, subtotal, discount, total, commissionPercent, commissionAmount, rate };
  };

  const renderBudget = () => {
    const data = getBudget();
    const { values, selectedType, oneTimeExtras, recurringExtras, base, extrasTotal, monthlyTotal, discount, total, commissionPercent, commissionAmount, rate } = data;
    const proposalDate = values.date || new Date().toISOString().slice(0, 10);
    const validity = values.validity || "7 días";
    const terms = values.terms || "50% para comenzar. Entrega según alcance acordado.";
    const itemRows = [
      {
        name: selectedType.name,
        detail: selectedType.detail,
        amount: usdLabel(base)
      },
      ...oneTimeExtras.map((item) => ({
        name: item.name,
        detail: "Extra solicitado",
        amount: item.displayPrice ? item.displayPrice : usdLabel(item.price)
      }))
    ];
    const recurringRows = recurringExtras.map((item) => ({
      name: item.name,
      detail: "Fee mensual opcional. No incluido en el total inicial.",
      amount: item.displayPrice ? item.displayPrice : `${usdLabel(item.price)}/mes`
    }));
    totalUsd.textContent = MONEY_USD.format(total);
    totalArs.textContent = MONEY_ARS.format(total * rate);
    summary.innerHTML = `
      <ul class="tool-result-list">
        <li>Precio base: ${MONEY_USD.format(base)}</li>
        <li>Extras: ${MONEY_USD.format(extrasTotal)}</li>
        <li>Fee mensual: ${monthlyTotal ? `${MONEY_USD.format(monthlyTotal)}/mes` : "No aplica"}</li>
        <li>Descuento: ${MONEY_USD.format(discount)}</li>
        <li>Comisión partner: ${commissionPercent}% · ${MONEY_USD.format(commissionAmount)}</li>
      </ul>
    `;
    preview.innerHTML = `
      <div class="proposal-preview" id="proposalDocument">
        <header class="proposal-header proposal-hero">
          <div>
            <a class="proposal-brand" href="../" aria-label="Runia Web"><img src="../runialogo.png" alt="Runia" /><span>Web</span></a>
            <p class="proposal-kicker">Propuesta comercial</p>
            <h2>${escapeHtml(selectedType.name)}</h2>
            <p class="proposal-lead">${escapeHtml(selectedType.detail)}</p>
          </div>
          <div class="proposal-meta-card">
            <span>Total final</span>
            <strong>${usdLabel(total)}</strong>
            <p>Referencia ARS: ${MONEY_ARS.format(total * rate)}</p>
          </div>
        </header>

        <div class="proposal-info-grid">
          <div>
            <span>Cliente</span>
            <strong>${escapeHtml(values.client || "-")}</strong>
          </div>
          <div>
            <span>Empresa</span>
            <strong>${escapeHtml(values.company || "-")}</strong>
          </div>
          <div>
            <span>Rubro</span>
            <strong>${escapeHtml(values.industry || "-")}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>${escapeHtml(proposalDate)}</strong>
          </div>
          <div>
            <span>Validez</span>
            <strong>${escapeHtml(validity)}</strong>
          </div>
          <div>
            <span>Tiempo estimado</span>
            <strong>${escapeHtml(values.time || "-")}</strong>
          </div>
        </div>

        <div class="proposal-section">
          <div class="proposal-section-head">
            <span>01</span>
            <h3>Detalle del presupuesto</h3>
          </div>
          <div class="proposal-table">
            ${itemRows.map((item) => `
              <div class="proposal-row">
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <p>${escapeHtml(item.detail)}</p>
                </div>
                <span>${escapeHtml(item.amount)}</span>
              </div>
            `).join("")}
          </div>
        </div>

        ${recurringRows.length ? `
          <div class="proposal-section proposal-recurring">
            <div class="proposal-section-head">
              <span>02</span>
              <h3>Servicios mensuales opcionales</h3>
            </div>
            <div class="proposal-table">
              ${recurringRows.map((item) => `
                <div class="proposal-row">
                  <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <p>${escapeHtml(item.detail)}</p>
                  </div>
                  <span>${escapeHtml(item.amount)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="proposal-section proposal-economic">
          <div class="proposal-section-head">
            <span>${recurringRows.length ? "03" : "02"}</span>
            <h3>Resumen económico</h3>
          </div>
          <div class="proposal-summary-grid">
            <div><span>Precio base</span><strong>${usdLabel(base)}</strong></div>
            <div><span>Extras</span><strong>${usdLabel(extrasTotal)}</strong></div>
            <div><span>Descuento</span><strong>${usdLabel(discount)}</strong></div>
            <div><span>Mensual</span><strong>${monthlyTotal ? `${usdLabel(monthlyTotal)}/mes` : "No aplica"}</strong></div>
            <div class="proposal-summary-total"><span>Total final</span><strong>${usdLabel(total)}</strong></div>
          </div>
        </div>

        <div class="proposal-section">
          <div class="proposal-section-head">
            <span>${recurringRows.length ? "04" : "03"}</span>
            <h3>Condiciones y próximos pasos</h3>
          </div>
          <p class="proposal-terms">${escapeHtml(terms)}</p>
          <div class="proposal-steps">
            <div><span>1</span><p>Confirmar alcance y materiales disponibles.</p></div>
            <div><span>2</span><p>Enviar seña para reservar producción.</p></div>
            <div><span>3</span><p>Completar brief Runia Web para iniciar implementación.</p></div>
          </div>
        </div>

        <footer class="proposal-footer">
          <span>Runia Web</span>
          <p>Webs claras, modernas y preparadas para captar mejores consultas.</p>
        </footer>
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
  const confirmation = document.querySelector("[data-brief-confirmation]");
  const params = new URLSearchParams(window.location.search);

  if (params.get("negocio") && form.querySelector('[name="business"]')) form.querySelector('[name="business"]').value = params.get("negocio");
  if (params.get("whatsapp") && form.querySelector('[name="whatsapp"]')) form.querySelector('[name="whatsapp"]').value = params.get("whatsapp");

  const buildInternalSummary = () => {
    const v = getFormObject(form);
    const objectives = getCheckedValues(form, "objective");
    const brandAssets = getCheckedValues(form, "brandAssets");
    const features = getCheckedValues(form, "features");

    return `BRIEF DE ARMADO - RUNIA WEB

DATOS DEL NEGOCIO
Nombre: ${v.business || "-"}
Rubro: ${v.industry || "-"}
Ubicación: ${v.location || "-"}
WhatsApp: ${v.whatsapp || "-"}
Email: ${v.email || "-"}
Instagram: ${v.instagram || "-"}
Web actual: ${v.currentWebsite || "-"}
Dominio: ${v.domain || "-"}

OBJETIVO DE LA WEB
${objectives.join(", ") || "-"}

SERVICIOS / PRODUCTOS
Qué ofrece la empresa: ${v.offer || "-"}
Servicios principales: ${v.services || "-"}
Productos principales: ${v.products || "-"}
Diferencial del negocio: ${v.differential || "-"}
Cliente ideal: ${v.audience || "-"}

ESTÉTICA
Colores actuales: ${v.colors || "-"}
Marca disponible: ${brandAssets.join(", ") || "-"}
Referencias visuales: ${v.references || "-"}
Estilos que NO quiere: ${v.donts || "-"}

MATERIALES
Links a fotos: ${v.photoLinks || "-"}
Links a logo: ${v.logoLinks || "-"}
Textos existentes: ${v.currentTexts || "-"}
Videos: ${v.videos || "-"}
Redes sociales: ${v.socials || "-"}
Otros archivos: ${v.otherFiles || "-"}

FUNCIONALIDADES
${features.join(", ") || "-"}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const summary = buildInternalSummary();

    try {
      await navigator.clipboard.writeText(summary);
    } catch (error) {
      const mail = `mailto:?subject=${encodeURIComponent("Brief de armado Runia Web")}&body=${encodeURIComponent(summary)}`;
      window.location.href = mail;
    }

    if (confirmation) {
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
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
