/**
 * THE HAMMER - Serial Number Lookup Controller
 * Queries the backend API cleanly (SERIAL NUMBER -> EXISTING PRODUCT GROUP -> COMPLETE GROUP CARD).
 * Never loads all serial records into the browser and never relies on invoice-based searching.
 */

(function () {
  let lastLookupPayload = null;
  let lastLookupErrorKey = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function t(key, paramsOrFallback, fallback) {
    if (window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, paramsOrFallback, fallback);
    }
    if (typeof paramsOrFallback === 'string') return paramsOrFallback;
    return fallback || key;
  }

  function getApiBases() {
    const metaBase = document.querySelector('meta[name="thehammer-api-base"]')?.getAttribute('content');
    const explicit = window.THEHAMMER_API_BASE || metaBase;
    if (explicit) {
      return [explicit.replace(/\/+$/, '')];
    }

    const bases = [];
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port;

    // On local static servers (e.g. VS Code Live Server :5500, http-server :8080),
    // query the Express API on port 5000 first to avoid wasted 404s on static servers,
    // while still supporting reverse-proxied /api/v1 when served on port 80/443/5000.
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    if (protocol === 'file:') {
      bases.push('http://127.0.0.1:5000/api/v1', 'http://localhost:5000/api/v1');
    } else if (isLocalHost && port && port !== '5000') {
      bases.push(
        `http://${host}:5000/api/v1`,
        'http://127.0.0.1:5000/api/v1',
        'http://localhost:5000/api/v1',
        '/api/v1'
      );
    } else {
      bases.push('/api/v1');
      if (isLocalHost) {
        bases.push('http://127.0.0.1:5000/api/v1', 'http://localhost:5000/api/v1');
      }
    }

    return [...new Set(bases)];
  }

  async function fetchSerialLookup(serialQuery) {
    const bases = getApiBases();
    let lastError = null;

    for (const base of bases) {
      try {
        const url = `${base}/serials/lookup?serial=${encodeURIComponent(serialQuery)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          lastError = new Error('Non-JSON response from API endpoint');
          continue;
        }

        const data = await response.json();
        if (!response.ok) {
          const err = new Error(data.error || 'Lookup failed');
          err.statusCode = response.status;
          throw err;
        }
        return data;
      } catch (err) {
        if (err && err.statusCode === 400) {
          throw err;
        }
        lastError = err;
      }
    }

    throw lastError || new Error('Lookup service unavailable');
  }

  function findExistingProductGroup(match) {
    if (!window.store || typeof window.store.getProducts !== 'function') return null;
    const products = window.store.getProducts();
    if (match.productGroupId) {
      const byId = products.find((p) => p.id === match.productGroupId);
      if (byId) return byId;
    }
    if (match.productGroupModel) {
      const target = match.productGroupModel.toLowerCase();
      const byModel = products.find((p) => (p.model || '').toLowerCase() === target);
      if (byModel) return byModel;
    }
    if (match.productModel) {
      const comp = match.productModel.toLowerCase();
      const byComp = products.find(
        (p) =>
          (p.electricPump || '').toLowerCase().includes(comp) ||
          (p.dieselPump || '').toLowerCase().includes(comp)
      );
      if (byComp) return byComp;
    }
    return null;
  }

  function renderLoading() {
    const container = document.getElementById('serialLookupResults');
    if (!container) return;
    container.innerHTML = `
      <div class="serial-state-card serial-state-loading">
        <div class="serial-spinner" aria-hidden="true"></div>
        <p>${escapeHtml(t('serialLookup.searching', 'Searching serial records...'))}</p>
      </div>
    `;
  }

  function renderError(message) {
    const container = document.getElementById('serialLookupResults');
    if (!container) return;
    container.innerHTML = `
      <div class="serial-state-card serial-state-error" role="alert">
        <i data-lucide="alert-circle" class="serial-state-icon"></i>
        <div>
          <p class="serial-state-title">${escapeHtml(message)}</p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  function renderNotFound(query) {
    const container = document.getElementById('serialLookupResults');
    if (!container) return;
    const primaryMsg = t('serialLookup.notFound', 'Sorry, no product was found with this serial number.');

    container.innerHTML = `
      <div class="serial-state-card serial-state-empty" role="status">
        <div class="serial-empty-icon-wrap">
          <i data-lucide="search-x" class="serial-state-icon"></i>
        </div>
        <div class="serial-empty-content">
          <p class="serial-state-title">${escapeHtml(primaryMsg)}</p>
          <p class="serial-state-hint">
            ${escapeHtml(t('serialLookup.notFoundHint', 'Please verify the digits on your pump or motor nameplate and try again without extra spaces.'))}
            (<span class="font-mono spec-val-ltr">${escapeHtml(query)}</span>)
          </p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  function renderResults(payload) {
    const container = document.getElementById('serialLookupResults');
    if (!container) return;

    if (!payload || !Array.isArray(payload.results) || payload.results.length === 0) {
      renderNotFound(payload?.query || '');
      return;
    }

    // Deduplicate only if multiple records map to the exact same existing product group,
    // while keeping every distinct matching product group separate.
    const uniqueGroups = [];
    const seenGroupIds = new Set();

    for (const match of payload.results) {
      const group = findExistingProductGroup(match);
      if (!group) continue;
      if (seenGroupIds.has(group.id)) continue;
      seenGroupIds.add(group.id);
      uniqueGroups.push({ group, match });
    }

    if (uniqueGroups.length === 0) {
      renderNotFound(payload.query || '');
      return;
    }

    const summaryText = t(
      'serialLookup.resultsFound',
      { count: uniqueGroups.length },
      `${uniqueGroups.length} matching product group(s) found for serial`
    );

    const multipleBanner =
      uniqueGroups.length > 1
        ? `
        <div class="serial-overlap-banner" role="note">
          <i data-lucide="alert-triangle" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
          <span>${escapeHtml(t('serialLookup.multipleNotice', 'This serial number matches multiple product groups in our records. All matching product groups are displayed below.'))}</span>
        </div>
      `
        : '';

    const cardsHtml = uniqueGroups
      .map(({ group, match }) => {
        if (typeof window.renderProductCardHtml === 'function') {
          return window.renderProductCardHtml(group, { serialMatch: match });
        }
        return '';
      })
      .join('');

    const gridColsClass = uniqueGroups.length === 1 ? 'serial-product-grid single-match' : 'grid grid-cols-2 serial-product-grid';

    container.innerHTML = `
      <div class="serial-results-meta">
        <span>${escapeHtml(summaryText)}: <strong class="font-mono spec-val-ltr">${escapeHtml(payload.query)}</strong></span>
      </div>
      ${multipleBanner}
      <div class="${gridColsClass}">
        ${cardsHtml}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  async function handleSerialLookupSubmit(event) {
    event.preventDefault();
    const inputEl = document.getElementById('serialLookupInput');
    const searchBtn = document.getElementById('serialLookupBtn');
    if (!inputEl) return;

    const cleaned = inputEl.value.replace(/\s+/g, '').trim();
    inputEl.value = cleaned;

    if (!cleaned) {
      lastLookupPayload = null;
      lastLookupErrorKey = 'serialLookup.emptyInput';
      renderError(t(lastLookupErrorKey, 'Please enter a Pump or Motor serial number.'));
      inputEl.focus();
      return;
    }

    lastLookupErrorKey = null;
    if (searchBtn) searchBtn.disabled = true;
    renderLoading();

    try {
      const payload = await fetchSerialLookup(cleaned);
      lastLookupPayload = payload;
      renderResults(payload);
    } catch (err) {
      lastLookupPayload = null;
      lastLookupErrorKey = err && err.statusCode === 400 ? 'serialLookup.invalidInput' : 'serialLookup.networkError';
      renderError(
        t(
          lastLookupErrorKey,
          err && err.statusCode === 400
            ? 'Invalid serial number format. Use letters, numbers, dashes, or slashes without spaces.'
            : 'Unable to reach the verification server right now. Please try again shortly.'
        )
      );
    } finally {
      if (searchBtn) searchBtn.disabled = false;
    }
  }

  function initSerialLookup() {
    const form = document.getElementById('serialLookupForm');
    const inputEl = document.getElementById('serialLookupInput');
    const clearBtn = document.getElementById('serialLookupClearBtn');
    if (!form || !inputEl) return;

    form.addEventListener('submit', handleSerialLookupSubmit);

    if (clearBtn) {
      const toggleClearBtn = () => {
        clearBtn.style.display = inputEl.value.length > 0 ? 'inline-flex' : 'none';
      };
      inputEl.addEventListener('input', toggleClearBtn);
      clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        lastLookupPayload = null;
        lastLookupErrorKey = null;
        toggleClearBtn();
        const container = document.getElementById('serialLookupResults');
        if (container) container.innerHTML = '';
        inputEl.focus();
      });
    }

    window.addEventListener('languageChanged', () => {
      if (lastLookupPayload) {
        renderResults(lastLookupPayload);
      } else if (lastLookupErrorKey) {
        renderError(t(lastLookupErrorKey));
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSerialLookup);
  } else {
    initSerialLookup();
  }
})();
