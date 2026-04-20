const ARS_FORMAT = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const USD_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const CATALOG_GROUPS = [
  {
    category: 'WEB_',
    subcategory: 'PACKS_',
    items: [
      { key: 'web-landing-pro', name: 'LANDING PRO', description: 'Una página única, clara y efectiva para presentar tu negocio.', priceUsd: 400 },
      { key: 'web-web-pro', name: 'WEB PRO', description: 'Sitio completo con estructura y diseño profesional.', priceUsd: 900 },
      { key: 'web-web-premium', name: 'WEB PREMIUM', description: 'Experiencia digital de alto nivel, pensada para diferenciarte.', priceUsd: 1500 },
    ],
  },
  {
    category: 'BRANDING_',
    subcategory: 'MANUAL DE MARCA_',
    items: [
      { key: 'branding-starter', name: 'BRANDING STARTER', description: 'Logo, colores y tipografía para una base de marca sólida.', priceUsd: 250 },
      { key: 'branding-pro', name: 'BRANDING PRO', description: 'Sistema visual completo aplicado a redes y web.', priceUsd: 600 },
    ],
  },
  {
    category: 'EXTRAS_',
    subcategory: 'MÓDULOS_',
    items: [
      { key: 'extra-ia-web', name: 'IA PARA TU WEB', description: 'Chatbot o asistente inteligente para atención inicial.', priceUsd: 300 },
      { key: 'extra-automatizaciones', name: 'AUTOMATIZACIONES', description: 'Captura y seguimiento de clientes automatizado.', priceUsd: 200 },
      { key: 'extra-experiencias', name: 'EXPERIENCIAS INTERACTIVAS', description: 'Juegos, quizzes o experiencias de alto engagement.', priceUsd: 400 },
    ],
  },
];
const CATALOG_ITEMS = CATALOG_GROUPS.flatMap((group) => group.items.map((item) => ({
  ...item,
  category: group.category,
  subcategory: group.subcategory,
})));

const defaultData = {
  clientName: '',
  clientEmail: '',
  serviceName: '',
  date: new Date().toISOString().slice(0, 10),
  dollarType: 'Blue',
  exchangeRate: 1300,
  discountMode: 'percent',
  discountValue: 0,
  commercialTerms: '50% inicial para comenzar',
  startTime: 'Inmediato',
  deliveryTime: '7 a 15 días',
  paymentMethod: 'Transferencia bancaria',
  observations: '',
  closingText: 'Gracias por confiar en LAB_. Diseñamos cada propuesta para potenciar tu posicionamiento y tus resultados.',
  items: [
    { catalogPackKey: 'web-landing-pro', name: 'LANDING PRO', description: 'Una página única, clara y efectiva para presentar tu negocio.', priceUsd: 400 },
    { catalogPackKey: 'branding-starter', name: 'BRANDING STARTER', description: 'Logo, colores y tipografía para una base de marca sólida.', priceUsd: 250 },
  ],
};

const state = structuredClone(defaultData);

const dom = {
  form: document.getElementById('budgetForm'),
  clientName: document.getElementById('clientName'),
  budgetDate: document.getElementById('budgetDate'),
  clientEmail: document.getElementById('clientEmail'),
  serviceName: document.getElementById('serviceName'),
  itemsList: document.getElementById('itemsList'),
  addItemBtn: document.getElementById('addItemBtn'),
  dollarType: document.getElementById('dollarType'),
  exchangeRate: document.getElementById('exchangeRate'),
  discountMode: document.getElementById('discountMode'),
  discountValue: document.getElementById('discountValue'),
  discountHint: document.getElementById('discountHint'),
  commercialTerms: document.getElementById('commercialTerms'),
  startTime: document.getElementById('startTime'),
  deliveryTime: document.getElementById('deliveryTime'),
  paymentMethod: document.getElementById('paymentMethod'),
  observations: document.getElementById('observations'),
  closingText: document.getElementById('closingText'),
  subtotalUsdLabel: document.getElementById('subtotalUsdLabel'),
  referenceArsLabel: document.getElementById('referenceArsLabel'),
  discountArsLabel: document.getElementById('discountArsLabel'),
  totalArsLabel: document.getElementById('totalArsLabel'),
  previewClient: document.getElementById('previewClient'),
  previewDate: document.getElementById('previewDate'),
  previewEmail: document.getElementById('previewEmail'),
  previewService: document.getElementById('previewService'),
  previewItems: document.getElementById('previewItems'),
  previewSubtotalUsd: document.getElementById('previewSubtotalUsd'),
  previewExchange: document.getElementById('previewExchange'),
  previewReference: document.getElementById('previewReference'),
  previewDiscount: document.getElementById('previewDiscount'),
  previewTotal: document.getElementById('previewTotal'),
  previewStart: document.getElementById('previewStart'),
  previewDelivery: document.getElementById('previewDelivery'),
  previewPayment: document.getElementById('previewPayment'),
  previewTerms: document.getElementById('previewTerms'),
  previewObservations: document.getElementById('previewObservations'),
  previewClosing: document.getElementById('previewClosing'),
  resetBtn: document.getElementById('resetBtn'),
  exportPdfBtn: document.getElementById('exportPdfBtn'),
};

const formatInputDate = (value) => {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const sanitizeFileName = (name) => (name || 'Cliente').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
const escapeAttribute = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const readQueryPrefill = () => {
  const params = new URLSearchParams(window.location.search);
  const mapping = [
    ['cliente', 'clientName'],
    ['email', 'clientEmail'],
    ['servicio', 'serviceName'],
  ];

  mapping.forEach(([queryKey, stateKey]) => {
    const value = params.get(queryKey);
    if (value) state[stateKey] = value;
  });
};

const calculate = () => {
  const subtotalUsd = state.items.reduce((sum, item) => sum + (Number(item.priceUsd) || 0), 0);
  const referenceArs = subtotalUsd * (Number(state.exchangeRate) || 0);
  const discountRaw = Number(state.discountValue) || 0;

  let discountArs = 0;
  if (state.discountMode === 'percent') {
    discountArs = referenceArs * (discountRaw / 100);
  } else {
    discountArs = discountRaw;
  }

  discountArs = Math.max(0, Math.min(discountArs, referenceArs));

  return {
    subtotalUsd,
    referenceArs,
    discountArs,
    totalArs: Math.max(referenceArs - discountArs, 0),
  };
};

const syncForm = () => {
  dom.clientName.value = state.clientName;
  dom.budgetDate.value = state.date;
  dom.clientEmail.value = state.clientEmail;
  dom.serviceName.value = state.serviceName;
  dom.dollarType.value = state.dollarType;
  dom.exchangeRate.value = state.exchangeRate;
  dom.discountMode.value = state.discountMode;
  dom.discountValue.value = state.discountValue;
  dom.commercialTerms.value = state.commercialTerms;
  dom.startTime.value = state.startTime;
  dom.deliveryTime.value = state.deliveryTime;
  dom.paymentMethod.value = state.paymentMethod;
  dom.observations.value = state.observations;
  dom.closingText.value = state.closingText;
  dom.discountHint.textContent = state.discountMode === 'percent' ? 'En porcentaje (%)' : 'Monto fijo en ARS';
};

const renderItemsEditor = () => {
  dom.itemsList.innerHTML = '';

  state.items.forEach((item, index) => {
    const packOptions = [
      '<option value="">Personalizado</option>',
      ...CATALOG_GROUPS.map((group) => {
        const options = group.items
          .map((catalogItem) => `<option value="${catalogItem.key}" ${item.catalogPackKey === catalogItem.key ? 'selected' : ''}>${group.subcategory} · ${catalogItem.name}</option>`)
          .join('');
        return `<optgroup label="${group.category}">${options}</optgroup>`;
      }),
    ].join('');

    const wrapper = document.createElement('article');
    wrapper.className = 'item-card';
    wrapper.innerHTML = `
      <div class="item-card-head">
        <h3>Ítem ${index + 1}</h3>
        <button type="button" class="item-remove" data-remove-index="${index}">Eliminar</button>
      </div>
      <div class="item-row">
        <select data-item-index="${index}" data-item-key="catalogPackKey" aria-label="Packs del catálogo por categoría">${packOptions}</select>
        <input type="text" data-item-index="${index}" data-item-key="name" value="${escapeAttribute(item.name)}" placeholder="Nombre del ítem" />
        <input type="text" data-item-index="${index}" data-item-key="description" value="${escapeAttribute(item.description || '')}" placeholder="Descripción opcional" />
        <input type="number" min="0" step="1" data-item-index="${index}" data-item-key="priceUsd" value="${item.priceUsd}" placeholder="USD" />
      </div>
    `;
    dom.itemsList.appendChild(wrapper);
  });
};

const renderPreviewItems = () => {
  dom.previewItems.innerHTML = '';
  state.items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'preview-item';
    card.innerHTML = `
      <div class="preview-item-head">
        <strong>${item.name || 'Ítem sin nombre'}</strong>
        <strong>${USD_FORMAT.format(Number(item.priceUsd) || 0)}</strong>
      </div>
      ${item.description ? `<p>${item.description}</p>` : ''}
    `;
    dom.previewItems.appendChild(card);
  });
};

const render = () => {
  syncForm();
  renderItemsEditor();
  renderPreviewItems();

  const totals = calculate();

  dom.subtotalUsdLabel.textContent = USD_FORMAT.format(totals.subtotalUsd);
  dom.referenceArsLabel.textContent = ARS_FORMAT.format(totals.referenceArs);
  dom.discountArsLabel.textContent = ARS_FORMAT.format(totals.discountArs);
  dom.totalArsLabel.textContent = ARS_FORMAT.format(totals.totalArs);

  dom.previewClient.textContent = state.clientName || '-';
  dom.previewDate.textContent = formatInputDate(state.date);
  dom.previewEmail.textContent = state.clientEmail || '-';
  dom.previewService.textContent = state.serviceName || '-';
  dom.previewSubtotalUsd.textContent = USD_FORMAT.format(totals.subtotalUsd);
  dom.previewExchange.textContent = `${state.dollarType} · ${ARS_FORMAT.format(Number(state.exchangeRate) || 0)}`;
  dom.previewReference.textContent = ARS_FORMAT.format(totals.referenceArs);
  dom.previewDiscount.textContent = `- ${ARS_FORMAT.format(totals.discountArs)}`;
  dom.previewTotal.textContent = ARS_FORMAT.format(totals.totalArs);
  dom.previewStart.textContent = state.startTime || '-';
  dom.previewDelivery.textContent = state.deliveryTime || '-';
  dom.previewPayment.textContent = state.paymentMethod || '-';
  dom.previewTerms.textContent = state.commercialTerms || '-';
  dom.previewObservations.textContent = state.observations || 'Sin observaciones adicionales.';
  dom.previewClosing.textContent = state.closingText;
};

const addItem = () => {
  state.items.push({ catalogPackKey: '', name: '', description: '', priceUsd: 0 });
  render();
};

const resetForm = () => {
  Object.assign(state, structuredClone(defaultData));
  readQueryPrefill();
  render();
};

const updateStateFromInput = (target) => {
  const idMap = {
    clientName: 'clientName',
    budgetDate: 'date',
    clientEmail: 'clientEmail',
    serviceName: 'serviceName',
    dollarType: 'dollarType',
    exchangeRate: 'exchangeRate',
    discountMode: 'discountMode',
    discountValue: 'discountValue',
    commercialTerms: 'commercialTerms',
    startTime: 'startTime',
    deliveryTime: 'deliveryTime',
    paymentMethod: 'paymentMethod',
    observations: 'observations',
    closingText: 'closingText',
  };

  const key = idMap[target.id];
  if (!key) return;

  if (key === 'exchangeRate' || key === 'discountValue') {
    state[key] = Number(target.value) || 0;
  } else {
    state[key] = target.value;
  }

  if (key === 'discountMode') {
    dom.discountHint.textContent = target.value === 'percent' ? 'En porcentaje (%)' : 'Monto fijo en ARS';
  }

  render();
};

const createExportNodeFromPreview = () => {
  const preview = document.getElementById('proposalPreview');
  const previewRect = preview.getBoundingClientRect();
  const clone = preview.cloneNode(true);
  clone.style.width = `${Math.max(previewRect.width, 640)}px`;
  clone.style.maxWidth = 'none';
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.padding = '0';
  wrapper.style.background = '#070707';
  wrapper.style.width = clone.style.width;
  wrapper.style.boxSizing = 'border-box';
  wrapper.appendChild(clone);

  document.body.appendChild(wrapper);
  return { wrapper, clone };
};

const exportPdf = async () => {
  const { jsPDF } = window.jspdf;
  const exportButton = dom.exportPdfBtn;
  const originalLabel = exportButton.textContent;
  exportButton.disabled = true;
  exportButton.textContent = 'Exportando...';

  const { wrapper, clone } = createExportNodeFromPreview();

  try {
    const canvas = await window.html2canvas(clone, {
      backgroundColor: '#0b0b0b',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const image = canvas.toDataURL('image/png', 1);
    const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
    const doc = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height], orientation });
    doc.addImage(image, 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'SLOW');
    const filename = `Presupuesto_LAB_${sanitizeFileName(state.clientName)}.pdf`;
    doc.save(filename);
  } finally {
    wrapper.remove();
    exportButton.disabled = false;
    exportButton.textContent = originalLabel;
  }
};

dom.form.addEventListener('input', (event) => {
  const target = event.target;

  if (target.matches('[data-item-index][data-item-key]')) {
    const index = Number(target.dataset.itemIndex);
    const key = target.dataset.itemKey;
    if (!state.items[index]) return;

    if (key === 'catalogPackKey') {
      state.items[index].catalogPackKey = target.value;
      const selectedPack = CATALOG_ITEMS.find((pack) => pack.key === target.value);
      if (selectedPack) {
        state.items[index].name = selectedPack.name;
        state.items[index].description = selectedPack.description;
        state.items[index].priceUsd = selectedPack.priceUsd;
      }
    } else {
      state.items[index][key] = key === 'priceUsd' ? Number(target.value) || 0 : target.value;
    }

    render();
    return;
  }

  updateStateFromInput(target);
});

dom.form.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-index]');
  if (!removeButton) return;
  const index = Number(removeButton.dataset.removeIndex);
  state.items.splice(index, 1);
  if (!state.items.length) {
    state.items.push({ catalogPackKey: '', name: '', description: '', priceUsd: 0 });
  }
  render();
});

dom.addItemBtn.addEventListener('click', addItem);
dom.resetBtn.addEventListener('click', resetForm);
dom.exportPdfBtn.addEventListener('click', exportPdf);

readQueryPrefill();
render();
