const ARS_FORMAT = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const USD_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

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
    { name: 'Landing Pro', description: 'Landing premium enfocada en conversión y presencia de alto nivel.', priceUsd: 400 },
    { name: 'Branding Starter', description: 'Lineamientos visuales y piezas base para una marca sólida.', priceUsd: 250 },
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
    const wrapper = document.createElement('article');
    wrapper.className = 'item-card';
    wrapper.innerHTML = `
      <div class="item-card-head">
        <h3>Ítem ${index + 1}</h3>
        <button type="button" class="item-remove" data-remove-index="${index}">Eliminar</button>
      </div>
      <div class="item-row">
        <input type="text" data-item-index="${index}" data-item-key="name" value="${item.name}" placeholder="Nombre del ítem" />
        <input type="text" data-item-index="${index}" data-item-key="description" value="${item.description || ''}" placeholder="Descripción opcional" />
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
  state.items.push({ name: '', description: '', priceUsd: 0 });
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
  const preview = document.querySelector('.preview-panel');
  const clone = preview.cloneNode(true);
  clone.style.width = '1080px';
  clone.style.maxWidth = '1080px';
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.padding = '0';
  wrapper.style.background = '#070707';
  wrapper.style.width = '1080px';
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
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imageRatio = canvas.width / canvas.height;
    const pageRatio = pageWidth / pageHeight;

    let renderWidth = pageWidth;
    let renderHeight = pageHeight;
    let x = 0;
    let y = 0;

    if (imageRatio > pageRatio) {
      renderHeight = pageHeight;
      renderWidth = renderHeight * imageRatio;
      x = (pageWidth - renderWidth) / 2;
    } else {
      renderWidth = pageWidth;
      renderHeight = renderWidth / imageRatio;
      y = (pageHeight - renderHeight) / 2;
    }

    doc.setFillColor(11, 11, 11);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.addImage(image, 'PNG', x, y, renderWidth, renderHeight, undefined, 'SLOW');
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

  if (target.matches('[data-item-index]')) {
    const index = Number(target.dataset.itemIndex);
    const key = target.dataset.itemKey;
    if (!state.items[index]) return;
    state.items[index][key] = key === 'priceUsd' ? Number(target.value) || 0 : target.value;
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
    state.items.push({ name: '', description: '', priceUsd: 0 });
  }
  render();
});

dom.addItemBtn.addEventListener('click', addItem);
dom.resetBtn.addEventListener('click', resetForm);
dom.exportPdfBtn.addEventListener('click', exportPdf);

readQueryPrefill();
render();
