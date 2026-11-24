/**
 * Serial Number Lookup & Management Service
 * - Uses PostgreSQL via Prisma when DATABASE_URL is connected & client is generated.
 * - Falls back seamlessly to an indexed persistent JSON data store (server/data/serials-db.json)
 *   so local development and standalone Node deployments work reliably without losing data.
 * - Preserves all serial numbers as strings, evaluates inclusive ranges safely with BigInt,
 *   flags overlapping records for admin review without deleting/merging, and cross-references
 *   existing catalog product data.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { SEED_SHIPMENTS, SEED_SERIAL_RECORDS } = require('../data/serialSeedData');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'serials-db.json');

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

function rangesOverlap(a, b) {
  const aStartNum = parseBigIntOrNull(a.serialStart);
  const aEndNum = parseBigIntOrNull(a.serialEnd);
  const bStartNum = parseBigIntOrNull(b.serialStart);
  const bEndNum = parseBigIntOrNull(b.serialEnd);

  if (aStartNum !== null && aEndNum !== null && bStartNum !== null && bEndNum !== null) {
    return aStartNum <= bEndNum && bStartNum <= aEndNum;
  }

  const aS = String(a.serialStart || '').toLowerCase();
  const aE = String(a.serialEnd || '').toLowerCase();
  const bS = String(b.serialStart || '').toLowerCase();
  const bE = String(b.serialEnd || '').toLowerCase();
  return aS === bS || aS === bE || aE === bS || aE === bE;
}

function recordMatchesQuery(record, sanitizedQuery) {
  const qLower = sanitizedQuery.toLowerCase();

  // 1. Exact string matches (case-insensitive) across serial fields
  const exactCandidates = [
    record.serialStart,
    record.serialEnd,
    record.relatedPumpSerial,
    record.relatedMotorSerial
  ].filter(Boolean);

  for (const candidate of exactCandidates) {
    if (String(candidate).trim().toLowerCase() === qLower) {
      return true;
    }
  }

  // 2. Inclusive numeric range match (with BigInt to preserve all digits)
  const qNum = parseBigIntOrNull(sanitizedQuery);
  const startNum = parseBigIntOrNull(record.serialStart);
  const endNum = parseBigIntOrNull(record.serialEnd);

  if (qNum !== null && startNum !== null && endNum !== null) {
    const startStr = String(record.serialStart).trim();
    const endStr = String(record.serialEnd).trim();
    // Protect leading-zero serial series from false matches with shorter numbers
    if ((startStr.startsWith('0') || endStr.startsWith('0')) && sanitizedQuery.length !== startStr.length) {
      return false;
    }
    return qNum >= startNum && qNum <= endNum;
  }

  return false;
}

class SerialService {
  constructor() {
    this.prisma = null;
    this.usePrisma = false;
    this.store = null;
    this.exactIndex = new Map();
    this.numericRanges = [];
    this.existingCatalogModels = this.loadExistingCatalogModels();
    this.initPromise = this.init();
  }

  loadExistingCatalogModels() {
    // Extract existing catalog product models & statuses from js/store.js safely (read-only)
    const map = new Map();
    try {
      const frontendStorePath = path.join(__dirname, '..', '..', 'js', 'store.js');
      if (fs.existsSync(frontendStorePath)) {
        const content = fs.readFileSync(frontendStorePath, 'utf8');
        const modelMatches = content.matchAll(/"?(?:model|electricPump|dieselPump)"?\s*:\s*"([^"]+)"/g);
        for (const m of modelMatches) {
          const val = m[1].trim();
          if (val && val !== '-') {
            map.set(val.toLowerCase(), { model: val, active: true });
          }
        }
      }
    } catch {
      // Non-fatal
    }
    return map;
  }

  async init() {
    // Attempt Prisma PostgreSQL connection if DATABASE_URL is present and client is generated
    if (process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        this.prisma = prisma;
        this.usePrisma = true;
        await this.ensurePrismaSeeded();
        return;
      } catch {
        this.usePrisma = false;
        this.prisma = null;
      }
    }

    this.loadLocalStore();
  }

  async ensurePrismaSeeded() {
    if (!this.prisma) return;
    try {
      const count = await this.prisma.shipment.count();
      if (count === 0) {
        const { seedSerials } = require('../prisma/seed-serials');
        await seedSerials();
      }
    } catch {
      // If table not migrated yet, fall back to local store
      this.usePrisma = false;
      this.prisma = null;
      this.loadLocalStore();
    }
  }

  loadLocalStore() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      const now = new Date().toISOString();
      const initial = {
        shipments: SEED_SHIPMENTS.map((s) => ({ ...s, createdAt: now, updatedAt: now })),
        records: SEED_SERIAL_RECORDS.map((r) => ({ ...r, createdAt: now, updatedAt: now }))
      };
      this.recomputeOverlaps(initial.records);
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      this.store = initial;
    } else {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      this.store = JSON.parse(raw);
      if (!Array.isArray(this.store.shipments)) this.store.shipments = [];
      if (!Array.isArray(this.store.records)) this.store.records = [];
      // Backfill productGroupId/productGroupModel and insert any newly added canonical seed records safely
      const seedById = new Map(SEED_SERIAL_RECORDS.map((r) => [r.id, r]));
      const existingIds = new Set(this.store.records.map((r) => r.id));
      let synced = false;
      for (const rec of this.store.records) {
        const seedRec = seedById.get(rec.id);
        if (seedRec && (!rec.productGroupId || !rec.productGroupModel)) {
          rec.productGroupId = seedRec.productGroupId;
          rec.productGroupModel = seedRec.productGroupModel;
          synced = true;
        }
        if (seedRec && seedRec.unitDetails && !rec.unitDetails) {
          rec.unitDetails = seedRec.unitDetails;
          synced = true;
        }
      }
      const now = new Date().toISOString();
      for (const seedRec of SEED_SERIAL_RECORDS) {
        if (!existingIds.has(seedRec.id)) {
          this.store.records.push({ ...seedRec, createdAt: now, updatedAt: now });
          synced = true;
        }
      }
      this.recomputeOverlaps(this.store.records);
      if (synced) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf8');
      }
    }

    this.rebuildMemoryIndexes();
  }

  saveLocalStore() {
    if (!this.store) return;
    this.recomputeOverlaps(this.store.records);
    this.rebuildMemoryIndexes();
    const tmpPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(this.store, null, 2), 'utf8');
    fs.renameSync(tmpPath, DB_FILE_PATH);
  }

  recomputeOverlaps(records) {
    const shipmentMap = new Map((this.store?.shipments || []).map((s) => [s.id, s]));
    for (const rec of records) {
      if (!rec.isRange && !rec.requiresVerification) {
        rec.isOverlapping = false;
        rec.overlapNote = null;
        continue;
      }
      const overlaps = records.filter(
        (other) =>
          other.id !== rec.id &&
          (other.isRange || other.requiresVerification) &&
          rangesOverlap(rec, other)
      );
      rec.isOverlapping = overlaps.length > 0;
      rec.overlapNote = rec.isOverlapping
        ? overlaps
            .map((o) => {
              const ship = shipmentMap.get(o.shipmentId);
              const shipLabel = ship ? ship.name : o.shipmentId;
              return `${shipLabel} (${o.serialType}: ${o.serialStart}–${o.serialEnd})`;
            })
            .join('; ')
        : null;
    }
  }

  rebuildMemoryIndexes() {
    this.exactIndex = new Map();
    this.numericRanges = [];

    const addExact = (val, rec) => {
      if (!val) return;
      const key = String(val).trim().toLowerCase();
      if (!this.exactIndex.has(key)) this.exactIndex.set(key, []);
      const list = this.exactIndex.get(key);
      if (!list.includes(rec)) list.push(rec);
    };

    for (const rec of this.store.records) {
      addExact(rec.serialStart, rec);
      addExact(rec.serialEnd, rec);
      addExact(rec.relatedPumpSerial, rec);
      addExact(rec.relatedMotorSerial, rec);

      const startNum = parseBigIntOrNull(rec.serialStart);
      const endNum = parseBigIntOrNull(rec.serialEnd);
      if (startNum !== null && endNum !== null) {
        this.numericRanges.push({
          startNum,
          endNum,
          rec
        });
      }
    }

    this.numericRanges.sort((a, b) => (a.startNum < b.startNum ? -1 : a.startNum > b.startNum ? 1 : 0));
  }

  resolveCatalogStatus(record) {
    const modelsToCheck = [
      record.productModel,
      ...(Array.isArray(record.possibleModels) ? record.possibleModels : [])
    ].filter(Boolean);

    for (const m of modelsToCheck) {
      const lower = m.toLowerCase();
      for (const [key, info] of this.existingCatalogModels.entries()) {
        if (key === lower || key.includes(lower)) {
          return info.active ? 'Active' : 'Inactive';
        }
      }
    }
    if (record.productStatus === 'INACTIVE') return 'Inactive';
    if (record.productStatus === 'MAINTENANCE') return 'Under Review';
    return 'Active';
  }

  toPublicResult(record, _shipment, searchedQuery) {
    const baseStatus = this.resolveCatalogStatus(record);
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
    if (record.relatedMotorSerial && record.relatedMotorSerial.toLowerCase() === qLower) {
      resolvedSerialType = 'Motor';
    } else if (record.relatedPumpSerial && record.relatedPumpSerial.toLowerCase() === qLower) {
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
      productStatus: baseStatus,
      isOverlapping: Boolean(record.isOverlapping)
    };
  }

  /**
   * Public read-only serial number lookup.
   * Searches both serial number records and existing database models/products.
   */
  async lookupSerial(rawQuery) {
    await this.initPromise;
    const query = sanitizeSerialInput(rawQuery);
    if (!isValidSerialQuery(query)) {
      const err = new Error('Invalid serial number format. Use letters, numbers, dashes, or slashes without spaces.');
      err.statusCode = 400;
      throw err;
    }

    let matchedPairs = [];

    if (this.usePrisma && this.prisma) {
      const qBig = parseBigIntOrNull(query);
      const orConditions = [
        { serialStart: { equals: query, mode: 'insensitive' } },
        { serialEnd: { equals: query, mode: 'insensitive' } },
        { relatedPumpSerial: { equals: query, mode: 'insensitive' } },
        { relatedMotorSerial: { equals: query, mode: 'insensitive' } }
      ];

      if (qBig !== null) {
        orConditions.push({
          AND: [{ rangeStartNum: { lte: qBig } }, { rangeEndNum: { gte: qBig } }]
        });
      }

      const dbMatches = await this.prisma.serialNumberRecord.findMany({
        where: { OR: orConditions },
        include: { shipment: true },
        orderBy: [{ shipment: { shipmentCode: 'asc' } }, { serialType: 'asc' }, { serialStart: 'asc' }]
      });

      // Also search existing PumpProduct database table for any serial stored in specs
      try {
        const existingProducts = await this.prisma.pumpProduct.findMany({
          where: {
            OR: [{ model: { equals: query, mode: 'insensitive' } }]
          }
        });
        for (const prod of existingProducts) {
          this.existingCatalogModels.set(prod.model.toLowerCase(), {
            model: prod.model,
            active: prod.active
          });
        }
      } catch {
        // Ignore if PumpProduct query fails
      }

      matchedPairs = dbMatches
        .filter((r) => recordMatchesQuery(r, query))
        .map((r) => ({ record: r, shipment: r.shipment }));
    } else {
      const candidateSet = new Set();
      const qLower = query.toLowerCase();

      const exactHits = this.exactIndex.get(qLower) || [];
      for (const rec of exactHits) candidateSet.add(rec);

      const qNum = parseBigIntOrNull(query);
      if (qNum !== null) {
        for (const item of this.numericRanges) {
          if (item.startNum > qNum) break;
          if (item.endNum >= qNum && recordMatchesQuery(item.rec, query)) {
            candidateSet.add(item.rec);
          }
        }
      }

      const shipmentMap = new Map(this.store.shipments.map((s) => [s.id, s]));
      matchedPairs = Array.from(candidateSet)
        .filter((rec) => recordMatchesQuery(rec, query))
        .map((rec) => ({ record: rec, shipment: shipmentMap.get(rec.shipmentId) || null }))
        .sort((a, b) => {
          const sA = a.shipment?.shipmentCode || '';
          const sB = b.shipment?.shipmentCode || '';
          if (sA !== sB) return sA.localeCompare(sB);
          return String(a.record.serialStart).localeCompare(String(b.record.serialStart));
        });
    }

    // Prefer verified individual unit records over unverified broad packing-list range guesses
    const exactUnitPairs = matchedPairs.filter(
      ({ record }) => !record.isRange && !record.requiresVerification
    );
    const effectivePairs = exactUnitPairs.length > 0 ? exactUnitPairs : matchedPairs;

    const results = effectivePairs.map(({ record, shipment }) =>
      this.toPublicResult(record, shipment, query)
    );

    return {
      query,
      count: results.length,
      hasOverlaps: results.length > 1 || results.some((r) => r.isOverlapping),
      results
    };
  }

  // ==========================================================================
  // ADMIN OPERATIONS (Authenticated & Authorized Administrators Only)
  // ==========================================================================

  async getAdminSummary() {
    await this.initPromise;
    const { records, shipments } = await this.getAllRaw();
    return {
      totalRecords: records.length,
      totalShipments: shipments.length,
      overlappingCount: records.filter((r) => r.isOverlapping).length,
      requiresVerificationCount: records.filter((r) => r.requiresVerification).length,
      pumpRecordsCount: records.filter((r) => r.serialType === 'PUMP').length,
      motorRecordsCount: records.filter((r) => r.serialType === 'MOTOR').length
    };
  }

  async getAllRaw() {
    await this.initPromise;
    if (this.usePrisma && this.prisma) {
      const [shipments, records] = await Promise.all([
        this.prisma.shipment.findMany({ orderBy: { shipmentCode: 'asc' } }),
        this.prisma.serialNumberRecord.findMany({
          include: { shipment: true },
          orderBy: [{ createdAt: 'desc' }]
        })
      ]);
      return { shipments, records };
    }
    return {
      shipments: this.store.shipments,
      records: this.store.records
    };
  }

  async listAdminRecords({ search = '', shipmentId = 'all', serialType = 'all', filter = 'all', page = 1, limit = 50 } = {}) {
    const { shipments, records } = await this.getAllRaw();
    const shipmentMap = new Map(shipments.map((s) => [s.id, s]));

    const cleanSearch = sanitizeSerialInput(search).toLowerCase();
    const rawSearchLower = String(search || '').trim().toLowerCase();

    let filtered = records.map((r) => {
      const ship = r.shipment || shipmentMap.get(r.shipmentId) || null;
      return {
        ...r,
        rangeStartNum: r.rangeStartNum ? String(r.rangeStartNum) : undefined,
        rangeEndNum: r.rangeEndNum ? String(r.rangeEndNum) : undefined,
        shipment: ship
      };
    });

    if (shipmentId && shipmentId !== 'all') {
      filtered = filtered.filter((r) => r.shipmentId === shipmentId);
    }

    if (serialType && serialType !== 'all') {
      filtered = filtered.filter((r) => r.serialType === serialType.toUpperCase());
    }

    if (filter === 'overlapping') {
      filtered = filtered.filter((r) => r.isOverlapping);
    } else if (filter === 'verification') {
      filtered = filtered.filter((r) => r.requiresVerification);
    }

    if (rawSearchLower) {
      filtered = filtered.filter((r) => {
        if (cleanSearch && recordMatchesQuery(r, cleanSearch)) return true;
        const haystack = [
          r.serialStart,
          r.serialEnd,
          r.productModel,
          ...(r.possibleModels || []),
          r.relatedPumpSerial,
          r.relatedMotorSerial,
          r.shipment?.name,
          r.shipment?.shipmentCode,
          r.shipment?.invoiceNumber,
          r.shipment?.piNumber
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(rawSearchLower) || (cleanSearch && haystack.includes(cleanSearch));
      });
    }

    const total = filtered.length;
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const safePage = Math.max(Number(page) || 1, 1);
    const startIdx = (safePage - 1) * safeLimit;
    const items = filtered.slice(startIdx, startIdx + safeLimit);

    return {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      items
    };
  }

  async listShipments() {
    const { shipments, records } = await this.getAllRaw();
    return shipments.map((s) => ({
      ...s,
      recordCount: records.filter((r) => r.shipmentId === s.id).length
    }));
  }

  async createShipment(data) {
    await this.initPromise;
    const shipmentCode = String(data.shipmentCode || '').trim();
    const name = String(data.name || shipmentCode).trim();
    const shipmentDate = String(data.shipmentDate || '').trim();
    const invoiceNumber = String(data.invoiceNumber || '').trim();
    const piNumber = String(data.piNumber || '').trim();
    const totalQuantity = data.totalQuantity !== undefined && data.totalQuantity !== null && data.totalQuantity !== ''
      ? Number(data.totalQuantity)
      : null;
    const notes = data.notes ? String(data.notes).trim() : null;

    if (this.usePrisma && this.prisma) {
      return this.prisma.shipment.create({
        data: { shipmentCode, name, shipmentDate, invoiceNumber, piNumber, totalQuantity, notes }
      });
    }

    const exists = this.store.shipments.some(
      (s) => s.shipmentCode.toLowerCase() === shipmentCode.toLowerCase()
    );
    if (exists) {
      const err = new Error(`Shipment code "${shipmentCode}" already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const now = new Date().toISOString();
    const shipment = {
      id: `ship-${crypto.randomUUID()}`,
      shipmentCode,
      name,
      shipmentDate,
      invoiceNumber,
      piNumber,
      totalQuantity,
      notes,
      createdAt: now,
      updatedAt: now
    };
    this.store.shipments.push(shipment);
    this.saveLocalStore();
    return shipment;
  }

  async createRecord(data) {
    await this.initPromise;
    const normalized = this.normalizeRecordPayload(data);

    if (this.usePrisma && this.prisma) {
      const created = await this.prisma.serialNumberRecord.create({
        data: {
          ...normalized,
          rangeStartNum: parseBigIntOrNull(normalized.serialStart),
          rangeEndNum: parseBigIntOrNull(normalized.serialEnd)
        },
        include: { shipment: true }
      });
      await this.syncPrismaOverlaps();
      return created;
    }

    const shipExists = this.store.shipments.some((s) => s.id === normalized.shipmentId);
    if (!shipExists) {
      const err = new Error('Selected shipment does not exist.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const rec = {
      id: `ser-${crypto.randomUUID()}`,
      ...normalized,
      createdAt: now,
      updatedAt: now
    };
    this.store.records.unshift(rec);
    this.saveLocalStore();
    const shipment = this.store.shipments.find((s) => s.id === rec.shipmentId) || null;
    return { ...rec, shipment };
  }

  async updateRecord(id, data) {
    await this.initPromise;
    if (this.usePrisma && this.prisma) {
      const existing = await this.prisma.serialNumberRecord.findUnique({ where: { id } });
      if (!existing) {
        const err = new Error('Serial record not found.');
        err.statusCode = 404;
        throw err;
      }
      const merged = this.normalizeRecordPayload({ ...existing, ...data });
      const updated = await this.prisma.serialNumberRecord.update({
        where: { id },
        data: {
          ...merged,
          rangeStartNum: parseBigIntOrNull(merged.serialStart),
          rangeEndNum: parseBigIntOrNull(merged.serialEnd)
        },
        include: { shipment: true }
      });
      await this.syncPrismaOverlaps();
      return updated;
    }

    const idx = this.store.records.findIndex((r) => r.id === id);
    if (idx === -1) {
      const err = new Error('Serial record not found.');
      err.statusCode = 404;
      throw err;
    }
    const existing = this.store.records[idx];
    const merged = this.normalizeRecordPayload({ ...existing, ...data });
    const updated = {
      ...existing,
      ...merged,
      updatedAt: new Date().toISOString()
    };
    this.store.records[idx] = updated;
    this.saveLocalStore();
    const shipment = this.store.shipments.find((s) => s.id === updated.shipmentId) || null;
    return { ...updated, shipment };
  }

  async deleteRecord(id) {
    await this.initPromise;
    if (this.usePrisma && this.prisma) {
      const existing = await this.prisma.serialNumberRecord.findUnique({ where: { id } });
      if (!existing) {
        const err = new Error('Serial record not found.');
        err.statusCode = 404;
        throw err;
      }
      await this.prisma.serialNumberRecord.delete({ where: { id } });
      await this.syncPrismaOverlaps();
      return { deleted: true, id };
    }

    const idx = this.store.records.findIndex((r) => r.id === id);
    if (idx === -1) {
      const err = new Error('Serial record not found.');
      err.statusCode = 404;
      throw err;
    }
    this.store.records.splice(idx, 1);
    this.saveLocalStore();
    return { deleted: true, id };
  }

  async importRows(rows) {
    await this.initPromise;
    if (!Array.isArray(rows) || rows.length === 0) {
      const err = new Error('No import rows found in file.');
      err.statusCode = 400;
      throw err;
    }

    const { shipments } = await this.getAllRaw();
    const shipmentByCode = new Map(shipments.map((s) => [s.shipmentCode.toLowerCase(), s]));
    const shipmentByInvoice = new Map(shipments.map((s) => [s.invoiceNumber.toLowerCase(), s]));

    let importedCount = 0;
    let shipmentsCreated = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const serialStart = sanitizeSerialInput(
          row.serial_start || row.serialstart || row.serial || row.serial_number || row.start
        );
        const serialEnd =
          sanitizeSerialInput(row.serial_end || row.serialend || row.end) || serialStart;

        if (!isValidSerialQuery(serialStart) || !isValidSerialQuery(serialEnd)) {
          throw new Error('Missing or invalid serial number/range');
        }

        const rawType = String(row.serial_type || row.serialtype || row.type || 'PUMP').trim().toUpperCase();
        const serialType = rawType.includes('MOTOR') ? 'MOTOR' : 'PUMP';

        const shipCodeRaw = String(row.shipment_code || row.shipmentcode || row.shipment || '').trim();
        const invoiceRaw = String(row.invoice_number || row.invoicenumber || row.invoice || '').trim();
        const piRaw = String(row.pi_number || row.pinumber || row.pi || '').trim();
        const dateRaw = String(row.shipment_date || row.shipmentdate || row.date || '').trim();

        let targetShipment =
          (shipCodeRaw && shipmentByCode.get(shipCodeRaw.toLowerCase())) ||
          (invoiceRaw && shipmentByInvoice.get(invoiceRaw.toLowerCase())) ||
          null;

        if (!targetShipment) {
          const code = shipCodeRaw || (invoiceRaw ? `INV-${invoiceRaw}` : `SHIP-${Date.now()}-${i + 1}`);
          targetShipment = await this.createShipment({
            shipmentCode: code,
            name: row.shipment_name || shipCodeRaw || `Shipment (${code})`,
            shipmentDate: dateRaw || 'N/A',
            invoiceNumber: invoiceRaw || 'N/A',
            piNumber: piRaw || 'N/A',
            totalQuantity: row.total_quantity ? Number(row.total_quantity) : null
          });
          shipmentByCode.set(targetShipment.shipmentCode.toLowerCase(), targetShipment);
          if (targetShipment.invoiceNumber) {
            shipmentByInvoice.set(targetShipment.invoiceNumber.toLowerCase(), targetShipment);
          }
          shipmentsCreated++;
        }

        const productModel = String(row.product_model || row.productmodel || row.model || '').trim() || null;
        const possibleRaw = String(row.possible_models || row.possiblemodels || '').trim();
        const possibleModels = possibleRaw
          ? possibleRaw.split(/[;|,]/).map((s) => s.trim()).filter(Boolean)
          : productModel
            ? [productModel]
            : [];

        const reqVerRaw = String(row.requires_verification || row.requiresverification || '').trim().toLowerCase();
        const requiresVerification =
          reqVerRaw === 'true' ||
          reqVerRaw === '1' ||
          reqVerRaw === 'yes' ||
          (!productModel && possibleModels.length > 1);

        await this.createRecord({
          shipmentId: targetShipment.id,
          productGroupId: String(row.product_group_id || row.productgroupid || row.group_id || '').trim() || null,
          productGroupModel: String(row.product_group_model || row.productgroupmodel || row.group_model || '').trim() || null,
          productName: String(row.product_name || row.productname || 'FIRE PUMP').trim() || 'FIRE PUMP',
          serialType,
          serialStart,
          serialEnd,
          isRange: serialStart !== serialEnd,
          productModel,
          possibleModels,
          relatedPumpSerial: sanitizeSerialInput(row.related_pump_serial || row.pump_serial || '') || null,
          relatedMotorSerial: sanitizeSerialInput(row.related_motor_serial || row.motor_serial || '') || null,
          requiresVerification,
          productStatus: String(row.product_status || row.status || 'ACTIVE').trim().toUpperCase() || 'ACTIVE',
          notes: row.notes ? String(row.notes).trim() : null
        });
        importedCount++;
      } catch (err) {
        errors.push({ row: i + 2, error: err.message });
      }
    }

    return {
      importedCount,
      shipmentsCreated,
      errorCount: errors.length,
      errors
    };
  }

  normalizeRecordPayload(data) {
    const serialStart = sanitizeSerialInput(data.serialStart);
    const serialEnd = sanitizeSerialInput(data.serialEnd || data.serialStart);

    if (!isValidSerialQuery(serialStart) || !isValidSerialQuery(serialEnd)) {
      const err = new Error('Serial Start and Serial End must be valid non-empty serial strings.');
      err.statusCode = 400;
      throw err;
    }

    const startNum = parseBigIntOrNull(serialStart);
    const endNum = parseBigIntOrNull(serialEnd);
    if (startNum !== null && endNum !== null && startNum > endNum) {
      const err = new Error('Serial Start cannot be greater than Serial End.');
      err.statusCode = 400;
      throw err;
    }

    const serialType = String(data.serialType || 'PUMP').toUpperCase() === 'MOTOR' ? 'MOTOR' : 'PUMP';
    const productModel = data.productModel ? String(data.productModel).trim() : null;
    let possibleModels = Array.isArray(data.possibleModels)
      ? data.possibleModels.map((m) => String(m).trim()).filter(Boolean)
      : typeof data.possibleModels === 'string'
        ? data.possibleModels.split(',').map((m) => m.trim()).filter(Boolean)
        : [];

    if (productModel && !possibleModels.includes(productModel)) {
      possibleModels = [productModel, ...possibleModels];
    }

    const relatedPumpSerial = data.relatedPumpSerial ? sanitizeSerialInput(data.relatedPumpSerial) : null;
    const relatedMotorSerial = data.relatedMotorSerial ? sanitizeSerialInput(data.relatedMotorSerial) : null;

    const requiresVerification =
      typeof data.requiresVerification === 'boolean'
        ? data.requiresVerification
        : !productModel && possibleModels.length > 1;

    return {
      shipmentId: String(data.shipmentId || '').trim(),
      productGroupId: data.productGroupId ? String(data.productGroupId).trim() : null,
      productGroupModel: data.productGroupModel ? String(data.productGroupModel).trim() : null,
      productName: String(data.productName || 'FIRE PUMP').trim() || 'FIRE PUMP',
      serialType,
      serialStart,
      serialEnd,
      isRange: serialStart !== serialEnd,
      productModel,
      possibleModels,
      relatedPumpSerial,
      relatedMotorSerial,
      requiresVerification,
      productStatus: String(data.productStatus || 'ACTIVE').trim().toUpperCase() || 'ACTIVE',
      notes: data.notes ? String(data.notes).trim() : null
    };
  }

  async syncPrismaOverlaps() {
    if (!this.prisma) return;
    const records = await this.prisma.serialNumberRecord.findMany({ include: { shipment: true } });
    for (const rec of records) {
      const overlaps = records.filter((other) => other.id !== rec.id && rangesOverlap(rec, other));
      const isOverlapping = overlaps.length > 0;
      const overlapNote = isOverlapping
        ? overlaps.map((o) => `${o.shipment?.name || o.shipmentId} (${o.serialType}: ${o.serialStart}–${o.serialEnd})`).join('; ')
        : null;
      if (rec.isOverlapping !== isOverlapping || rec.overlapNote !== overlapNote) {
        await this.prisma.serialNumberRecord.update({
          where: { id: rec.id },
          data: { isOverlapping, overlapNote }
        });
      }
    }
  }
}

module.exports = new SerialService();
module.exports.SerialService = SerialService;
module.exports.sanitizeSerialInput = sanitizeSerialInput;
module.exports.isValidSerialQuery = isValidSerialQuery;

