const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('zlib');

const app = require('../server');
const { parseCsv, parseXlsx } = require('../utils/spreadsheetParser');
const { SEED_SERIAL_RECORDS } = require('../data/serialSeedData');

let server;
let baseUrl;
let adminToken;

function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const headers = { Accept: 'application/json' };
    let payload = null;
    if (body !== null) {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          json = text;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function buildMinimalXlsxBase64(rows) {
  const sheetRows = rows
    .map((row, rIdx) => {
      const cells = row
        .map((val, cIdx) => {
          const colLetter = String.fromCharCode(65 + cIdx);
          const escaped = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<c r="${colLetter}${rIdx + 1}" t="inlineStr"><is><t>${escaped}</t></is></c>`;
        })
        .join('');
      return `<row r="${rIdx + 1}">${cells}</row>`;
    })
    .join('');

  const sheetXml = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const files = [{ name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml, 'utf8') }];

  const localParts = [];
  const cdParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const compressed = zlib.deflateRawSync(file.data);
    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(file.data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    const cdEntry = Buffer.alloc(46 + nameBuf.length);
    cdEntry.writeUInt32LE(0x02014b50, 0);
    cdEntry.writeUInt16LE(20, 4);
    cdEntry.writeUInt16LE(20, 6);
    cdEntry.writeUInt16LE(0, 8);
    cdEntry.writeUInt16LE(8, 10);
    cdEntry.writeUInt32LE(0, 16);
    cdEntry.writeUInt32LE(compressed.length, 20);
    cdEntry.writeUInt32LE(file.data.length, 24);
    cdEntry.writeUInt16LE(nameBuf.length, 28);
    cdEntry.writeUInt16LE(0, 30);
    cdEntry.writeUInt16LE(0, 32);
    cdEntry.writeUInt32LE(offset, 42);
    nameBuf.copy(cdEntry, 46);

    localParts.push(localHeader, compressed);
    cdParts.push(cdEntry);
    offset += localHeader.length + compressed.length;
  }

  const cdBuf = Buffer.concat(cdParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, cdBuf, eocd]).toString('base64');
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  const loginRes = await request('POST', '/api/v1/auth/login', {
    email: 'admin@industrial.eu',
    password: 'Admin2026!'
  });
  assert.equal(loginRes.status, 200);
  adminToken = loginRes.body.accessToken;
  assert.ok(adminToken);
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('All linked productGroupId values exist in js/store.js without modifying existing products', () => {
  const storeSource = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'store.js'), 'utf8');
  const uniqueGroupIds = [...new Set(SEED_SERIAL_RECORDS.map((r) => r.productGroupId))];
  assert.equal(uniqueGroupIds.length, 8);
  for (const gid of uniqueGroupIds) {
    assert.ok(storeSource.includes(`id: "${gid}"`), `Missing group in js/store.js: ${gid}`);
  }
});

test('Existing API routes remain intact and functional', async () => {
  const health = await request('GET', '/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.status, 'UP');

  const products = await request('GET', '/api/v1/products');
  assert.equal(products.status, 200);
  assert.equal(products.body.success, true);

  const homepage = await request('GET', '/');
  assert.equal(homepage.status, 200);
});

test('1. Pump serial number lookup maps directly to existing product group (no invoice output)', async () => {
  const res = await request('GET', '/api/v1/serials/lookup?serial=2501355');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);

  const rec = res.body.results[0];
  assert.equal(rec.productGroupId, 'pedj-pedj-250-8-40-58-4---option-2');
  assert.equal(rec.productGroupModel, 'PEDJ 250/8-40-58-4 - Option 2');
  assert.equal(rec.serialType, 'Pump');
  assert.equal(rec.serialNumber, '2501355');
  assert.deepEqual(rec.possibleModels, ['PSD 50-250/250', 'PSM 50-250/250']);
  // Must NOT expose invoice/PI/shipment or internal DB ids
  assert.equal(rec.invoiceNumber, undefined);
  assert.equal(rec.piNumber, undefined);
  assert.equal(rec.shipmentDate, undefined);
  assert.equal(rec.id, undefined);
});

test('2. Motor serial number lookup maps directly to its existing product group', async () => {
  const res = await request('GET', '/api/v1/serials/lookup?serial=40357958');
  assert.equal(res.status, 200);
  assert.equal(res.body.count, 1);

  const rec = res.body.results[0];
  assert.equal(rec.productGroupId, 'pedj-pedj-250-8-40-58-4---option-2');
  assert.equal(rec.productGroupModel, 'PEDJ 250/8-40-58-4 - Option 2');
  assert.equal(rec.serialType, 'Motor');
  assert.equal(rec.productModel, 'PSM 50-250/250');
  assert.equal(rec.requiresModelVerification, false);
});

test('3. Inclusive range boundaries (first and last numbers) across all 8 groups + spaces stripped', async () => {
  const cases = [
    [' 5002 6410 ', 'pedj-pedj-500-8-75-75-5-5---option-2'],
    ['50026449', 'pedj-pedj-500-8-75-75-5-5---option-2'],
    ['75039042', 'pedj-pedj-750-8-100-99-10---option-2'],
    ['10025898', 'pedj-pedj-750-8-100-99-10---option-2'],
    ['10004195', 'pedj-pedj-750-10-150-150-12---option-2'],
    ['12500805', 'pedj-pedj-1250-8-180-170---option-2'],
    ['11015008', 'pedj-pedj-1250-8-180-170---option-2'],
    ['12501011', 'pedj-pedj-1000-10-220-225-15---option-2'],
    ['22016003', 'pedj-pedj-1000-10-220-225-15---option-2'],
    ['1678899', 'pedj-pedj-1500-8-220-225---option-2'],
    ['2215892', 'pedj-pedj-1500-8-220-225---option-2']
  ];

  for (const [serial, expectedGroupId] of cases) {
    const res = await request('GET', '/api/v1/serials/lookup?serial=' + encodeURIComponent(serial));
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1, `Expected 1 match for ${serial}`);
    assert.equal(res.body.results[0].productGroupId, expectedGroupId);
  }

  // Just outside boundaries
  assert.equal((await request('GET', '/api/v1/serials/lookup?serial=50026409')).body.count, 0);
  assert.equal((await request('GET', '/api/v1/serials/lookup?serial=50026450')).body.count, 0);
});

test('4. Invalid and non-existent serial numbers are handled safely', async () => {
  const unknown = await request('GET', '/api/v1/serials/lookup?serial=99999999');
  assert.equal(unknown.status, 200);
  assert.equal(unknown.body.count, 0);
  assert.deepEqual(unknown.body.results, []);

  assert.equal((await request('GET', '/api/v1/serials/lookup?serial=')).status, 400);
  assert.equal((await request('GET', '/api/v1/serials/lookup?serial=' + encodeURIComponent('<script>alert(1)</script>'))).status, 400);
});

test('5. Duplicate/overlapping serial numbers return ALL matching existing product groups separately', async () => {
  // Overlapping Pump in broad range (not an individual unit override): 10004185
  const pumpOverlap = await request('GET', '/api/v1/serials/lookup?serial=10004185');
  assert.equal(pumpOverlap.status, 200);
  assert.equal(pumpOverlap.body.count, 2);
  assert.equal(pumpOverlap.body.hasOverlaps, true);
  assert.deepEqual(
    pumpOverlap.body.results.map((r) => r.productGroupId).sort(),
    ['pedj-pedj-1000-8-150-150-12---option-2', 'pedj-pedj-750-10-150-150-12---option-2'].sort()
  );

  // Overlapping Motor PSD in broad range: 11215047
  const motorOverlap1 = await request('GET', '/api/v1/serials/lookup?serial=11215047');
  assert.equal(motorOverlap1.body.count, 2);
  assert.deepEqual(
    motorOverlap1.body.results.map((r) => r.productModel).sort(),
    ['PSD 100-315/1100', 'PSD 125-250/1100'].sort()
  );

  // Overlapping Motor PSM in broad range: 15005239
  const motorOverlap2 = await request('GET', '/api/v1/serials/lookup?serial=15005239');
  assert.equal(motorOverlap2.body.count, 2);
  assert.deepEqual(
    motorOverlap2.body.results.map((r) => r.productModel).sort(),
    ['PSM 100-315/1100', 'PSM 125-250/1100'].sort()
  );
});

test('5b. Exact individual units (10004180/15005235 & 10004181/11215045) resolve to exact components and exclude card number 28201160103052', async () => {
  for (const [serial, expectedType] of [['10004180', 'Pump'], ['15005235', 'Motor']]) {
    const res = await request('GET', `/api/v1/serials/lookup?serial=${serial}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    const r = res.body.results[0];
    assert.equal(r.productGroupId, 'pedj-pedj-750-10-150-150-12---option-2');
    assert.equal(r.serialType, expectedType);
    assert.equal(r.productModel, 'PSM 100-315/1100');
    assert.equal(r.relatedPumpSerial, '10004180');
    assert.equal(r.relatedMotorSerial, '15005235');
    assert.equal(r.unitDetails.driveModel, 'YE3-315S-2');
    assert.equal(r.unitDetails.power, '150 HP');
    assert.equal(r.unitDetails.controlPanelModel, 'FPC-24-DOL-380-110');
    assert.equal(r.unitDetails.controlPanelOrigin, 'LS-KOREAN');
    assert.equal(r.unitDetails.capacity, '1000 GPM');
    assert.equal(r.unitDetails.pressure, '10 Bar');
    assert.equal(r.unitDetails.pumpOrigin, 'ITALY');
    assert.equal(r.unitDetails.driveOrigin, 'ITALY');
  }

  for (const [serial, expectedType] of [['10004181', 'Pump'], ['11215045', 'Motor']]) {
    const res = await request('GET', `/api/v1/serials/lookup?serial=${serial}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    const r = res.body.results[0];
    assert.equal(r.productGroupId, 'pedj-pedj-750-10-150-150-12---option-2');
    assert.equal(r.serialType, expectedType);
    assert.equal(r.productModel, 'PSD 100-315/1100');
    assert.equal(r.relatedPumpSerial, '10004181');
    assert.equal(r.relatedMotorSerial, '11215045');
    assert.equal(r.unitDetails.driveModel, '6102NT');
    assert.equal(r.unitDetails.power, '150 HP');
    assert.equal(r.unitDetails.controlPanelModel, 'FPC-24-DC-24');
    assert.equal(r.unitDetails.controlPanelOrigin, 'LS-KOREAN');
  }

  // Card number must NOT match
  const cardNum = await request('GET', '/api/v1/serials/lookup?serial=28201160103052');
  assert.equal(cardNum.status, 200);
  assert.equal(cardNum.body.count, 0);
});

test('6. Admin endpoints require JWT auth and support CRUD + CSV/XLSX import cleanly', async () => {
  const unauth = await request('GET', '/api/v1/admin/serials');
  assert.equal(unauth.status, 401);

  const summary = await request('GET', '/api/v1/admin/serials/summary', null, adminToken);
  assert.equal(summary.status, 200);
  assert.equal(summary.body.data.totalRecords >= 24, true);

  const created = await request(
    'POST',
    '/api/v1/admin/serials',
    {
      shipmentId: 'ship-1',
      productGroupId: 'pedj-pedj-250-8-40-58-4---option-2',
      productGroupModel: 'PEDJ 250/8-40-58-4 - Option 2',
      serialType: 'PUMP',
      serialStart: '00998877',
      serialEnd: '00998877',
      possibleModels: ['PSD 50-250/250', 'PSM 50-250/250'],
      requiresVerification: true
    },
    adminToken
  );
  assert.equal(created.status, 201);
  const createdId = created.body.data.id;

  const lookupZero = await request('GET', '/api/v1/serials/lookup?serial=00998877');
  assert.equal(lookupZero.body.count, 1);
  assert.equal(lookupZero.body.results[0].productGroupId, 'pedj-pedj-250-8-40-58-4---option-2');

  const updated = await request(
    'PUT',
    `/api/v1/admin/serials/${createdId}`,
    {
      productModel: 'PSD 50-250/250',
      relatedMotorSerial: 'MTR-00998877',
      requiresVerification: false
    },
    adminToken
  );
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.requiresVerification, false);

  const del = await request('DELETE', `/api/v1/admin/serials/${createdId}`, null, adminToken);
  assert.equal(del.status, 200);

  const csvRows = parseCsv('shipmentCode,serialType,serialStart,serialEnd,productModel\nSHIPMENT-1,MOTOR,00123,00125,PSD 50-250/250\n');
  assert.equal(csvRows.length, 1);
  assert.equal(csvRows[0].serialstart, '00123');

  const xlsxB64 = buildMinimalXlsxBase64([
    ['shipmentCode', 'serialType', 'serialStart', 'serialEnd', 'productModel'],
    ['SHIPMENT-1', 'MOTOR', '00456', '00458', 'PSM 50-250/250']
  ]);
  const xlsxRows = parseXlsx(Buffer.from(xlsxB64, 'base64'));
  assert.equal(xlsxRows.length, 1);
  assert.equal(xlsxRows[0].serialstart, '00456');
});
