/**
 * THEHAMMER Admin - Serial Number Management Controller
 * Uses existing JWT authentication (/api/v1/auth/login) and admin serial APIs.
 */

(function () {
  const TOKEN_KEY = 'hammer_admin_token';
  const USER_KEY = 'hammer_admin_user';

  let state = {
    token: sessionStorage.getItem(TOKEN_KEY) || '',
    user: null,
    filter: 'all',
    search: '',
    shipmentId: 'all',
    serialType: 'all',
    page: 1,
    shipments: [],
    records: [],
    pendingDeleteId: null
  };

  try {
    const rawUser = sessionStorage.getItem(USER_KEY);
    if (rawUser) state.user = JSON.parse(rawUser);
  } catch {
    state.user = null;
  }

  function escapeHtml(val) {
    return String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getApiBase() {
    if (window.THEHAMMER_API_BASE) return window.THEHAMMER_API_BASE.replace(/\/+$/, '');
    const host = window.location.hostname;
    const port = window.location.port;
    if ((host === 'localhost' || host === '127.0.0.1') && port !== '5000') {
      return `http://${host}:5000/api/v1`;
    }
    return '/api/v1';
  }

  async function apiFetch(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      if (!path.startsWith('/auth/login')) {
        handleLogout();
      }
      throw new Error(data.error || 'Authentication required');
    }

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  function showFeedback(message, isError = false) {
    const el = document.getElementById('adminFeedbackBanner');
    if (!el) return;
    el.textContent = message;
    el.className = `admin-alert ${isError ? 'admin-alert-error' : 'admin-alert-success'}`;
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 6000);
  }

  function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hammer_theme', theme);
    const icon = document.getElementById('adminThemeIcon');
    if (icon) icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
    document.querySelectorAll('.theme-responsive-logo').forEach((logo) => {
      const target = theme === 'dark' ? logo.dataset.darkLogo : logo.dataset.lightLogo;
      if (target) logo.setAttribute('src', target);
    });
    if (window.lucide) lucide.createIcons();
  }

  function toggleAuthView(isAuthed) {
    document.getElementById('adminLoginView').style.display = isAuthed ? 'none' : 'flex';
    document.getElementById('adminDashboardView').style.display = isAuthed ? 'block' : 'none';
    document.getElementById('adminLogoutBtn').style.display = isAuthed ? 'inline-flex' : 'none';
    if (isAuthed && state.user) {
      document.getElementById('adminUserGreeting').textContent =
        `Signed in as ${state.user.email} (${state.user.role}) — Manage serial ranges, shipments, overlaps, and model associations.`;
    }
  }

  function handleLogout() {
    state.token = '';
    state.user = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    toggleAuthView(false);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('adminLoginEmail').value.trim();
    const password = document.getElementById('adminLoginPassword').value;
    const errEl = document.getElementById('adminLoginError');
    const btn = document.getElementById('adminLoginSubmitBtn');
    errEl.style.display = 'none';
    btn.disabled = true;

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      state.token = res.accessToken;
      state.user = res.user;
      sessionStorage.setItem(TOKEN_KEY, res.accessToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
      toggleAuthView(true);
      await loadDashboardData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
    }
  }

  async function loadDashboardData() {
    const [summaryRes, shipmentsRes] = await Promise.all([
      apiFetch('/admin/serials/summary'),
      apiFetch('/admin/shipments')
    ]);

    const summary = summaryRes.data || {};
    document.getElementById('statTotalRecords').textContent = summary.totalRecords ?? 0;
    document.getElementById('statTotalShipments').textContent = summary.totalShipments ?? 0;
    document.getElementById('statNeedsVerification').textContent = summary.requiresVerificationCount ?? 0;
    document.getElementById('statOverlapping').textContent = summary.overlappingCount ?? 0;

    state.shipments = shipmentsRes.data || [];
    renderShipmentDropdowns();
    renderShipmentsTable();
    await loadRecords();
  }

  function renderShipmentDropdowns() {
    const filterSel = document.getElementById('adminShipmentFilter');
    const recSel = document.getElementById('recShipmentId');

    if (filterSel) {
      const current = filterSel.value || 'all';
      filterSel.innerHTML =
        `<option value="all">All Shipments</option>` +
        state.shipments
          .map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.invoiceNumber)})</option>`)
          .join('');
      filterSel.value = current;
    }

    if (recSel) {
      const current = recSel.value;
      recSel.innerHTML = state.shipments
        .map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} — ${escapeHtml(s.shipmentDate)} (Inv ${escapeHtml(s.invoiceNumber)})</option>`)
        .join('');
      if (current) recSel.value = current;
    }
  }

  function renderShipmentsTable() {
    const tbody = document.getElementById('adminShipmentsTableBody');
    if (!tbody) return;
    tbody.innerHTML = state.shipments
      .map(
        (s) => `
      <tr>
        <td class="font-mono">${escapeHtml(s.shipmentCode)}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td class="font-mono">${escapeHtml(s.shipmentDate)}</td>
        <td class="font-mono">${escapeHtml(s.invoiceNumber)}</td>
        <td class="font-mono">${escapeHtml(s.piNumber)}</td>
        <td>${s.totalQuantity ?? '—'}</td>
        <td>${s.recordCount ?? 0}</td>
      </tr>
    `
      )
      .join('');
  }

  async function loadRecords() {
    const params = new URLSearchParams({
      search: state.search,
      shipmentId: state.shipmentId,
      serialType: state.serialType,
      filter: state.filter,
      page: String(state.page),
      limit: '25'
    });
    const res = await apiFetch(`/admin/serials?${params.toString()}`);
    state.records = res.items || [];
    renderRecordsTable(res);
  }

  function renderRecordsTable(meta) {
    const tbody = document.getElementById('adminRecordsTableBody');
    const pagBar = document.getElementById('adminPaginationBar');
    if (!tbody) return;

    if (state.records.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No serial number records matched the current filters.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = state.records
        .map((r) => {
          const rangeText =
            r.serialStart === r.serialEnd
              ? escapeHtml(r.serialStart)
              : `${escapeHtml(r.serialStart)} – ${escapeHtml(r.serialEnd)}`;
          const groupBadge = r.productGroupModel
            ? `<div style="font-size:0.75rem;color:var(--primary-red);font-weight:700;margin-bottom:0.2rem;">${escapeHtml(r.productGroupModel)}</div>`
            : '';
          const modelsText = r.productModel
            ? `${groupBadge}<strong>${escapeHtml(r.productModel)}</strong>`
            : `${groupBadge}${(r.possibleModels || []).map((m) => `<span class="serial-model-chip font-mono" style="font-size:0.75rem;padding:0.15rem 0.45rem;">${escapeHtml(m)}</span>`).join(' ')}`;

          const relatedHtml = `
            <div class="font-mono" style="font-size: 0.78rem;">
              <div>Pump: ${r.relatedPumpSerial ? escapeHtml(r.relatedPumpSerial) : '<span class="serial-muted">—</span>'}</div>
              <div>Motor: ${r.relatedMotorSerial ? escapeHtml(r.relatedMotorSerial) : '<span class="serial-muted">—</span>'}</div>
            </div>
          `;

          const flags = [];
          if (r.requiresVerification) {
            flags.push(`<span class="serial-badge serial-badge-warn">Needs Verification</span>`);
          } else {
            flags.push(`<span class="serial-badge serial-badge-ok">Verified</span>`);
          }
          if (r.isOverlapping) {
            flags.push(`<span class="serial-badge serial-badge-overlap">Overlapping</span>`);
          }
          if (r.overlapNote) {
            flags.push(`<span class="admin-overlap-note">${escapeHtml(r.overlapNote)}</span>`);
          }

          return `
            <tr>
              <td class="font-mono"><strong>${rangeText}</strong></td>
              <td><span class="serial-badge serial-badge-type">${escapeHtml(r.serialType)}</span></td>
              <td>${modelsText || '—'}</td>
              <td>${relatedHtml}</td>
              <td>
                <div><strong>${escapeHtml(r.shipment?.name || 'N/A')}</strong></div>
                <div class="font-mono" style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(r.shipment?.shipmentDate || '')}</div>
              </td>
              <td class="font-mono" style="font-size:0.8rem;">
                <div>Inv: ${escapeHtml(r.shipment?.invoiceNumber || '—')}</div>
                <div>PI: ${escapeHtml(r.shipment?.piNumber || '—')}</div>
              </td>
              <td><div class="admin-flag-stack">${flags.join('')}</div></td>
              <td>
                <div class="admin-row-actions">
                  <button type="button" class="btn btn-secondary btn-sm" data-edit-id="${escapeHtml(r.id)}">
                    Edit / Link
                  </button>
                  <button type="button" class="btn btn-outline btn-sm" data-delete-id="${escapeHtml(r.id)}">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `;
        })
        .join('');
    }

    if (pagBar) {
      pagBar.innerHTML = `
        <span>Showing ${state.records.length} of ${meta.total || 0} records (Page ${meta.page || 1} / ${meta.totalPages || 1})</span>
        <div style="display:flex;gap:0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="prevPageBtn" ${(meta.page || 1) <= 1 ? 'disabled' : ''}>Prev</button>
          <button type="button" class="btn btn-secondary btn-sm" id="nextPageBtn" ${(meta.page || 1) >= (meta.totalPages || 1) ? 'disabled' : ''}>Next</button>
        </div>
      `;
      document.getElementById('prevPageBtn')?.addEventListener('click', () => {
        if (state.page > 1) {
          state.page--;
          loadRecords();
        }
      });
      document.getElementById('nextPageBtn')?.addEventListener('click', () => {
        if (state.page < (meta.totalPages || 1)) {
          state.page++;
          loadRecords();
        }
      });
    }

    tbody.querySelectorAll('[data-edit-id]').forEach((btn) => {
      btn.addEventListener('click', () => openEditRecordModal(btn.getAttribute('data-edit-id')));
    });
    tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', () => openDeleteConfirm(btn.getAttribute('data-delete-id')));
    });
  }

  function openModal(id) {
    document.getElementById(id)?.classList.add('show');
  }
  function closeModal(id) {
    document.getElementById(id)?.classList.remove('show');
  }

  function openAddRecordModal() {
    document.getElementById('recordModalTitle').textContent = 'Add Serial Number Record';
    document.getElementById('recordForm').reset();
    document.getElementById('recId').value = '';
    document.getElementById('recordFormError').style.display = 'none';
    if (state.shipments[0]) {
      document.getElementById('recShipmentId').value = state.shipments[0].id;
    }
    openModal('recordModal');
  }

  function openEditRecordModal(id) {
    const rec = state.records.find((r) => r.id === id);
    if (!rec) return;
    document.getElementById('recordModalTitle').textContent = 'Edit & Associate Serial Record';
    document.getElementById('recordFormError').style.display = 'none';
    document.getElementById('recId').value = rec.id;
    document.getElementById('recShipmentId').value = rec.shipmentId;
    document.getElementById('recSerialType').value = rec.serialType;
    document.getElementById('recSerialStart').value = rec.serialStart;
    document.getElementById('recSerialEnd').value = rec.serialEnd;
    document.getElementById('recProductGroupId').value = rec.productGroupId || '';
    document.getElementById('recProductGroupModel').value = rec.productGroupModel || '';
    document.getElementById('recProductModel').value = rec.productModel || '';
    document.getElementById('recPossibleModels').value = (rec.possibleModels || []).join(', ');
    document.getElementById('recRelatedPump').value = rec.relatedPumpSerial || '';
    document.getElementById('recRelatedMotor').value = rec.relatedMotorSerial || '';
    document.getElementById('recStatus').value = rec.productStatus || 'ACTIVE';
    document.getElementById('recRequiresVerification').checked = Boolean(rec.requiresVerification);
    document.getElementById('recNotes').value = rec.notes || '';
    openModal('recordModal');
  }

  async function handleRecordSubmit(event) {
    event.preventDefault();
    const errEl = document.getElementById('recordFormError');
    errEl.style.display = 'none';

    const id = document.getElementById('recId').value;
    const payload = {
      shipmentId: document.getElementById('recShipmentId').value,
      serialType: document.getElementById('recSerialType').value,
      serialStart: document.getElementById('recSerialStart').value.trim(),
      serialEnd: document.getElementById('recSerialEnd').value.trim() || document.getElementById('recSerialStart').value.trim(),
      productGroupId: document.getElementById('recProductGroupId').value.trim() || null,
      productGroupModel: document.getElementById('recProductGroupModel').value.trim() || null,
      productModel: document.getElementById('recProductModel').value.trim() || null,
      possibleModels: document
        .getElementById('recPossibleModels')
        .value.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      relatedPumpSerial: document.getElementById('recRelatedPump').value.trim() || null,
      relatedMotorSerial: document.getElementById('recRelatedMotor').value.trim() || null,
      productStatus: document.getElementById('recStatus').value,
      requiresVerification: document.getElementById('recRequiresVerification').checked,
      notes: document.getElementById('recNotes').value.trim() || null
    };

    try {
      if (id) {
        await apiFetch(`/admin/serials/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showFeedback('Serial number record updated successfully.');
      } else {
        await apiFetch('/admin/serials', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showFeedback('Serial number record added successfully.');
      }
      closeModal('recordModal');
      await loadDashboardData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }

  function openDeleteConfirm(id) {
    const rec = state.records.find((r) => r.id === id);
    if (!rec) return;
    state.pendingDeleteId = id;
    document.getElementById('deleteConfirmText').textContent =
      `Are you sure you want to delete ${rec.serialType} serial record "${rec.serialStart}${rec.serialEnd !== rec.serialStart ? ' – ' + rec.serialEnd : ''}"?`;
    openModal('deleteConfirmModal');
  }

  async function confirmDeleteRecord() {
    if (!state.pendingDeleteId) return;
    try {
      await apiFetch(`/admin/serials/${encodeURIComponent(state.pendingDeleteId)}`, {
        method: 'DELETE'
      });
      state.pendingDeleteId = null;
      closeModal('deleteConfirmModal');
      showFeedback('Serial number record deleted.');
      await loadDashboardData();
    } catch (err) {
      closeModal('deleteConfirmModal');
      showFeedback(err.message, true);
    }
  }

  async function handleShipmentSubmit(event) {
    event.preventDefault();
    const errEl = document.getElementById('shipmentFormError');
    errEl.style.display = 'none';

    const payload = {
      shipmentCode: document.getElementById('shipCode').value.trim(),
      name: document.getElementById('shipName').value.trim(),
      shipmentDate: document.getElementById('shipDate').value.trim(),
      invoiceNumber: document.getElementById('shipInvoice').value.trim(),
      piNumber: document.getElementById('shipPi').value.trim(),
      totalQuantity: document.getElementById('shipQty').value ? Number(document.getElementById('shipQty').value) : null,
      notes: document.getElementById('shipNotes').value.trim() || null
    };

    try {
      await apiFetch('/admin/shipments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      closeModal('shipmentModal');
      document.getElementById('shipmentForm').reset();
      showFeedback(`Shipment "${payload.name}" created successfully.`);
      await loadDashboardData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    }
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read selected file.'));
      reader.readAsDataURL(file);
    });
  }

  async function handleImportSubmit(event) {
    event.preventDefault();
    const fileInput = document.getElementById('importFileInput');
    const errEl = document.getElementById('importFormError');
    const btn = document.getElementById('importSubmitBtn');
    errEl.style.display = 'none';

    const file = fileInput.files?.[0];
    if (!file) {
      errEl.textContent = 'Please select a .csv or .xlsx file.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    try {
      const contentBase64 = await readFileAsBase64(file);
      const res = await apiFetch('/admin/serials/import', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentBase64
        })
      });
      closeModal('importModal');
      document.getElementById('importForm').reset();
      showFeedback(
        `Imported ${res.importedCount} serial record(s) (${res.shipmentsCreated || 0} new shipment(s), ${res.errorCount || 0} error(s)).`
      );
      await loadDashboardData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
    } finally {
      btn.disabled = false;
    }
  }

  function downloadCsvTemplate() {
    const csv =
      'shipmentCode,shipmentDate,invoiceNumber,piNumber,serialType,serialStart,serialEnd,productModel,possibleModels,relatedPumpSerial,relatedMotorSerial,requiresVerification\n' +
      'SHIPMENT-3,01/08/2025,2252001,2109500,PUMP,2502001,2502010,,"PSD 50-250/250;PSM 50-250/250",,,true\n' +
      'SHIPMENT-3,01/08/2025,2252001,2109500,MOTOR,24080001,24080005,PSD 50-250/250,,,,false\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thehammer-serials-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function init() {
    const savedTheme = localStorage.getItem('hammer_theme') || 'light';
    updateThemeUI(savedTheme);

    const langSel = document.getElementById('adminLangSelect');
    if (langSel && window.i18n) {
      langSel.value = window.i18n.currentLang;
      langSel.addEventListener('change', (e) => {
        window.i18n.setLanguage(e.target.value, true);
      });
    }

    document.getElementById('adminThemeBtn')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      updateThemeUI(current === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('adminLoginForm')?.addEventListener('submit', handleLoginSubmit);
    document.getElementById('adminLogoutBtn')?.addEventListener('click', handleLogout);

    document.querySelectorAll('#adminFilterTabs .filter-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#adminFilterTabs .filter-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.filter = btn.getAttribute('data-filter') || 'all';
        state.page = 1;
        loadRecords();
      });
    });

    let searchTimer = null;
    document.getElementById('adminSerialSearchInput')?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.search = e.target.value;
        state.page = 1;
        loadRecords();
      }, 250);
    });

    document.getElementById('adminShipmentFilter')?.addEventListener('change', (e) => {
      state.shipmentId = e.target.value;
      state.page = 1;
      loadRecords();
    });

    document.getElementById('adminTypeFilter')?.addEventListener('change', (e) => {
      state.serialType = e.target.value;
      state.page = 1;
      loadRecords();
    });

    document.getElementById('adminRefreshBtn')?.addEventListener('click', loadDashboardData);
    document.getElementById('openAddRecordModalBtn')?.addEventListener('click', openAddRecordModal);
    document.getElementById('closeRecordModalBtn')?.addEventListener('click', () => closeModal('recordModal'));
    document.getElementById('cancelRecordModalBtn')?.addEventListener('click', () => closeModal('recordModal'));
    document.getElementById('recordForm')?.addEventListener('submit', handleRecordSubmit);

    document.getElementById('openShipmentModalBtn')?.addEventListener('click', () => {
      document.getElementById('shipmentFormError').style.display = 'none';
      openModal('shipmentModal');
    });
    document.getElementById('closeShipmentModalBtn')?.addEventListener('click', () => closeModal('shipmentModal'));
    document.getElementById('cancelShipmentModalBtn')?.addEventListener('click', () => closeModal('shipmentModal'));
    document.getElementById('shipmentForm')?.addEventListener('submit', handleShipmentSubmit);

    document.getElementById('openImportModalBtn')?.addEventListener('click', () => {
      document.getElementById('importFormError').style.display = 'none';
      openModal('importModal');
    });
    document.getElementById('closeImportModalBtn')?.addEventListener('click', () => closeModal('importModal'));
    document.getElementById('cancelImportModalBtn')?.addEventListener('click', () => closeModal('importModal'));
    document.getElementById('importForm')?.addEventListener('submit', handleImportSubmit);
    document.getElementById('downloadCsvTemplateBtn')?.addEventListener('click', downloadCsvTemplate);

    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => closeModal('deleteConfirmModal'));
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteConfirmModal'));
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDeleteRecord);

    if (state.token) {
      toggleAuthView(true);
      loadDashboardData().catch(() => handleLogout());
    } else {
      toggleAuthView(false);
    }

    if (window.lucide) lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

