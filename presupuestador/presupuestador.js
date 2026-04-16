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

const splitText = (doc, text, maxWidth) => doc.splitTextToSize((text || '').toString(), maxWidth);

const exportPdf = () => {
  const { jsPDF } = window.jspdf;
  const totals = calculate();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 38;
  const contentWidth = width - margin * 2;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, width, height, 'F');

  doc.setDrawColor(68, 68, 68);
  doc.setFillColor(18, 18, 18);
  doc.roundedRect(margin, margin, contentWidth, height - margin * 2, 16, 16, 'FD');

  let y = margin + 34;

  doc.setTextColor(241, 237, 230);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('LAB_ by Runia', margin + 24, y);

  doc.setFontSize(10);
  doc.setTextColor(168, 160, 147);
  doc.text('PRESUPUESTO PERSONALIZADO', margin + 24, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 237, 230);
  doc.setFontSize(11);
  doc.text(`Cliente: ${state.clientName || '-'}`, width - margin - 24, y, { align: 'right' });
  doc.text(`Fecha: ${formatInputDate(state.date)}`, width - margin - 24, y + 16, { align: 'right' });
  doc.text(`Email: ${state.clientEmail || '-'}`, width - margin - 24, y + 32, { align: 'right' });

  y += 56;
  doc.setDrawColor(53, 53, 53);
  doc.line(margin + 24, y, width - margin - 24, y);
  y += 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(168, 160, 147);
  doc.text('ITEMS COTIZADOS', margin + 24, y);

  y += 16;
  state.items.forEach((item) => {
    doc.setFillColor(23, 23, 23);
    doc.setDrawColor(53, 53, 53);
    doc.roundedRect(margin + 24, y, contentWidth - 48, 54, 8, 8, 'FD');

    doc.setTextColor(241, 237, 230);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(item.name || 'Ítem sin nombre', margin + 36, y + 18);
    doc.text(USD_FORMAT.format(Number(item.priceUsd) || 0), width - margin - 36, y + 18, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(168, 160, 147);
    doc.setFontSize(9.5);
    const description = splitText(doc, item.description || 'Sin descripción.', contentWidth - 84);
    doc.text(description.slice(0, 2), margin + 36, y + 34);
    y += 62;
  });

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(168, 160, 147);
  doc.text('RESUMEN ECONÓMICO', margin + 24, y);

  y += 14;
  const summaryRows = [
    ['Subtotal (USD)', USD_FORMAT.format(totals.subtotalUsd)],
    ['Cotización aplicada', `${state.dollarType} · ${ARS_FORMAT.format(Number(state.exchangeRate) || 0)}`],
    ['Valor de referencia ARS', ARS_FORMAT.format(totals.referenceArs)],
    ['Descuento aplicado', `- ${ARS_FORMAT.format(totals.discountArs)}`],
  ];

  summaryRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(168, 160, 147);
    doc.setFontSize(10.5);
    doc.text(label, margin + 24, y + 16);
    doc.setTextColor(241, 237, 230);
    doc.text(value, width - margin - 24, y + 16, { align: 'right' });
    y += 20;
  });

  doc.setFillColor(26, 26, 26);
  doc.setDrawColor(65, 65, 65);
  doc.roundedRect(margin + 24, y + 6, contentWidth - 48, 54, 10, 10, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(233, 222, 204);
  doc.setFontSize(12);
  doc.text('TOTAL FINAL ARS', margin + 38, y + 27);
  doc.setFontSize(20);
  doc.text(ARS_FORMAT.format(totals.totalArs), width - margin - 38, y + 34, { align: 'right' });

  y += 76;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(168, 160, 147);
  doc.text('CONDICIONES COMERCIALES', margin + 24, y);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(241, 237, 230);
  const conditionsLines = [
    `Inicio: ${state.startTime || '-'}`,
    `Plazo: ${state.deliveryTime || '-'}`,
    `Pago: ${state.paymentMethod || '-'}`,
    `Condición: ${state.commercialTerms || '-'}`,
  ];

  conditionsLines.forEach((line) => {
    doc.text(line, margin + 24, y);
    y += 14;
  });

  const observations = splitText(doc, `Observaciones: ${state.observations || 'Sin observaciones adicionales.'}`, contentWidth - 48);
  doc.text(observations, margin + 24, y + 2);
  y += Math.min(observations.length, 3) * 14 + 8;

  doc.setTextColor(168, 160, 147);
  const closing = splitText(doc, state.closingText, contentWidth - 48);
  doc.text(closing.slice(0, 3), margin + 24, Math.min(y + 6, height - 56));

  const filename = `Presupuesto_LAB_${sanitizeFileName(state.clientName)}.pdf`;
  doc.save(filename);
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
