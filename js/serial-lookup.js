/**
 * THE HAMMER - Client-Side Serial Number Lookup Controller
 * Loads static catalog serial records from ./data/serials.json and performs
 * exact + BigInt numeric range verification completely in the browser
 * (zero backend/API dependency, compatible with GitHub Pages and static hosts).
 * Relationship: SERIAL NUMBER -> EXISTING PRODUCT GROUP -> COMPLETE GROUP CARD.
 */

(function (root) {
  let lastLookupPayload = null;
  let lastLookupErrorKey = null;
  let datasetCache = null;
  let datasetLoadPromise = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function t(key, paramsOrFallback, fallback) {
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, paramsOrFallback, fallback);
    }
    if (typeof paramsOrFallback === 'string') return paramsOrFallback;
    return fallback || key;
  }

  function sanitizeSerialInput(raw) {
    return String(raw || '').replace(/\s+/g, '').trim();
  }

  function isValidSerialQuery(sanitized) {
    if (!sanitized || sanitized.length > 64) return false;
    return /^[A-Za-z0-9._/-]+$/.test(sanitized);
  }

  function parseBigIntOrNull(val) {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    if (!/^\d+$/.test(s)) return null;
    try {
      return BigInt(s);
    } catch {
      return null;
    }
  }

  function recordMatchesQuery(record, sanitizedQuery) {
    const qLower = sanitizedQuery.toLowerCase();

    // 1. Exact string matches (case-insensitive, preserves leading zeros)
    const exactCandidates = [
      record.serialStart,
      record.serialEnd,
      record.relatedPumpSerial,
      record.relatedMotorSerial
    ].filter((v) => v !== null && v !== undefined && String(v).trim() !== '');

    for (const candidate of exactCandidates) {
      if (String(candidate).trim().toLowerCase() === qLower) {
        return true;
      }
    }

    // 2. Inclusive numeric range match (BigInt preserves arbitrarily long serials)
    const qNum = parseBigIntOrNull(sanitizedQuery);
    const startNum = parseBigIntOrNull(record.serialStart);
    const endNum = parseBigIntOrNull(record.serialEnd);

    if (qNum !== null && startNum !== null && endNum !== null) {
      const startStr = String(record.serialStart).trim();
      const endStr = String(record.serialEnd).trim();
      const rangeHasLeadingZero = startStr.startsWith('0') || endStr.startsWith('0');

      if (rangeHasLeadingZero) {
        const minLen = Math.min(startStr.length, endStr.length);
        const maxLen = Math.max(startStr.length, endStr.length);
        if (
          !sanitizedQuery.startsWith('0') ||
          sanitizedQuery.length < minLen ||
          sanitizedQuery.length > maxLen
        ) {
          return false;
        }
      } else if (sanitizedQuery.length > 1 && sanitizedQuery.startsWith('0')) {
        // Never drop leading zeros from user input to match a non-zero-prefixed range
        return false;
      }

      return qNum >= startNum && qNum <= endNum;
    }

    return false;
  }

  function buildDatasetIndex(rawData) {
    const shipments = Array.isArray(rawData?.shipments) ? rawData.shipments : [];
    const records = Array.isArray(rawData?.records) ? rawData.records : [];
    const shipmentMap = new Map(shipments.map((s) => [s.id, s]));
    const exactIndex = new Map();
    const numericRanges = [];

    const addExact = (val, rec) => {
      if (val === null || val === undefined) return;
      const key = String(val).trim().toLowerCase();
      if (!key) return;
      if (!exactIndex.has(key)) exactIndex.set(key, []);
      const list = exactIndex.get(key);
      if (!list.includes(rec)) list.push(rec);
    };

    for (const rec of records) {
      addExact(rec.serialStart, rec);
      addExact(rec.serialEnd, rec);
      addExact(rec.relatedPumpSerial, rec);
      addExact(rec.relatedMotorSerial, rec);

      const startNum = parseBigIntOrNull(rec.serialStart);
      const endNum = parseBigIntOrNull(rec.serialEnd);
      if (startNum !== null && endNum !== null) {
        numericRanges.push({ startNum, endNum, rec });
      }
    }

    numericRanges.sort((a, b) => (a.startNum < b.startNum ? -1 : a.startNum > b.startNum ? 1 : 0));
    return { shipments, records, shipmentMap, exactIndex, numericRanges };
  }

  async function loadSerialDataset() {
    if (datasetCache) return datasetCache;
    if (datasetLoadPromise) return datasetLoadPromise;

    datasetLoadPromise = (async () => {
      const response = await fetch('./data/serials.json', {
        method: 'GET',
        cache: 'no-cache',
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to load serial catalog (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType && !contentType.includes('application/json') && !contentType.includes('text/plain')) {
        // Still attempt JSON parse in case static hosts omit content-type, but guard HTML fallbacks
        const text = await response.text();
        if (text.trim().startsWith('<')) {
          throw new Error('Invalid serial dataset response');
        }
        datasetCache = buildDatasetIndex(JSON.parse(text));
        return datasetCache;
      }

      const json = await response.json();
      datasetCache = buildDatasetIndex(json);
      return datasetCache;
    })().catch((err) => {
      datasetLoadPromise = null;
      throw err;
    });

    return datasetLoadPromise;
  }

  function resolveCatalogStatus(record, products) {
    const modelsToCheck = [
      record.productModel,
      ...(Array.isArray(record.possibleModels) ? record.possibleModels : [])
    ].filter(Boolean);

    if (Array.isArray(products) && products.length > 0) {
      for (const m of modelsToCheck) {
        const lower = String(m).toLowerCase();
        const found = products.find((p) => {
          const modelStr = String(p.model || '').toLowerCase();
          const elecStr = String(p.electricPump || '').toLowerCase();
          const dieselStr = String(p.dieselPump || '').toLowerCase();
          return (
            modelStr === lower ||
            elecStr === lower ||
            dieselStr === lower ||
            elecStr.includes(lower) ||
            dieselStr.includes(lower)
          );
        });
        if (found) {
          return found.active ? 'Active' : 'Inactive';
        }
      }
    }

    if (record.productStatus === 'INACTIVE') return 'Inactive';
    if (record.productStatus === 'MAINTENANCE') return 'Under Review';
    return 'Active';
  }

  function toPublicResult(record, searchedQuery, products) {
    const possibleModels =
      Array.isArray(record.possibleModels) && record.possibleModels.length > 0
        ? record.possibleModels
        : record.productModel
          ? [record.productModel]
          : [];

    const isRangeMatch = Boolean(record.isRange && record.serialStart !== record.serialEnd);
    const serialRange = isRangeMatch ? `${record.serialStart} – ${record.serialEnd}` : record.serialStart;

    let resolvedSerialType = record.serialType === 'MOTOR' ? 'Motor' : 'Pump';
    const qLower = String(searchedQuery || '').trim().toLowerCase();
    if (record.relatedMotorSerial && String(record.relatedMotorSerial).trim().toLowerCase() === qLower) {
      resolvedSerialType = 'Motor';
    } else if (record.relatedPumpSerial && String(record.relatedPumpSerial).trim().toLowerCase() === qLower) {
      resolvedSerialType = 'Pump';
    }

    return {
      productGroupId: record.productGroupId || null,
      productGroupModel: record.productGroupModel || null,
      productName: record.productName || 'FIRE PUMP',
      serialNumber: searchedQuery,
      serialRange,
      isRangeMatch,
      serialType: resolvedSerialType,
      productModel: record.productModel || null,
      possibleModels,
      requiresModelVerification: Boolean(record.requiresVerification),
      relatedPumpSerial: record.relatedPumpSerial || null,
      relatedMotorSerial: record.relatedMotorSerial || null,
      unitDetails: record.unitDetails || null,
      productStatus: resolveCatalogStatus(record, products),
      isOverlapping: Boolean(record.isOverlapping)
    };
  }

  function lookupSerialInDataset(dataset, rawQuery, products = []) {
    const query = sanitizeSerialInput(rawQuery);
    if (!isValidSerialQuery(query)) {
      const err = new Error('Invalid serial number format. Use letters, numbers, dashes, or slashes without spaces.');
      err.statusCode = 400;
      throw err;
    }

    const index = dataset && dataset.exactIndex && dataset.numericRanges ? dataset : buildDatasetIndex(dataset);
    const candidateSet = new Set();
    const qLower = query.toLowerCase();

    const exactHits = index.exactIndex.get(qLower) || [];
    for (const rec of exactHits) candidateSet.add(rec);

    const qNum = parseBigIntOrNull(query);
    if (qNum !== null) {
      for (const item of index.numericRanges) {
        if (item.startNum > qNum) break;
        if (item.endNum >= qNum && recordMatchesQuery(item.rec, query)) {
          candidateSet.add(item.rec);
        }
      }
    }

    const matchedPairs = Array.from(candidateSet)
      .filter((rec) => recordMatchesQuery(rec, query))
      .map((rec) => ({ record: rec, shipment: index.shipmentMap.get(rec.shipmentId) || null }))
      .sort((a, b) => {
        const sA = a.shipment?.shipmentCode || '';
        const sB = b.shipment?.shipmentCode || '';
        if (sA !== sB) return sA.localeCompare(sB);
        return String(a.record.serialStart).localeCompare(String(b.record.serialStart));
      });

    // Prioritize verified individual unit records over broad overlapping shipment ranges
    const exactUnitPairs = matchedPairs.filter(
      ({ record }) => !record.isRange && !record.requiresVerification
    );
    const effectivePairs = exactUnitPairs.length > 0 ? exactUnitPairs : matchedPairs;

    const results = effectivePairs.map(({ record }) => toPublicResult(record, query, products));

    return {
      success: true,
      query,
      count: results.length,
      hasOverlaps: results.length > 1 || results.some((r) => r.isOverlapping),
      results
    };
  }

  async function lookupSerialLocal(rawQuery) {
    const query = sanitizeSerialInput(rawQuery);
    if (!isValidSerialQuery(query)) {
      const err = new Error('Invalid serial number format. Use letters, numbers, dashes, or slashes without spaces.');
      err.statusCode = 400;
      throw err;
    }

    const dataset = await loadSerialDataset();
    const products =
      typeof window !== 'undefined' && window.store && typeof window.store.getProducts === 'function'
        ? window.store.getProducts()
        : [];
    return lookupSerialInDataset(dataset, query, products);
  }

  function findExistingProductGroup(match) {
    if (typeof window === 'undefined' || !window.store || typeof window.store.getProducts !== 'function') {
      return null;
    }
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

    const cleaned = sanitizeSerialInput(inputEl.value);
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
      const payload = await lookupSerialLocal(cleaned);
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

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSerialLookup);
    } else {
      initSerialLookup();
    }
  }

  const exported = {
    sanitizeSerialInput,
    isValidSerialQuery,
    parseBigIntOrNull,
    recordMatchesQuery,
    buildDatasetIndex,
    lookupSerialInDataset
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exported;
  }
  if (root && typeof root === 'object') {
    root.HammerSerialLookup = exported;
  }
})(typeof window !== 'undefined' ? window : globalThis);
