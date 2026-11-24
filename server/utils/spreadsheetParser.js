/**
 * Zero-dependency CSV and Excel (.xlsx) spreadsheet parser for Serial Number imports.
 * Preserves all serial values as strings so leading zeros and exact digits are never lost.
 */

const zlib = require('zlib');

/**
 * Parse RFC-4180 CSV string into an array of row objects keyed by header name.
 */
function parseCsv(csvText) {
  const text = String(csvText || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rowsToObjects(rows);
}

/**
 * Minimal ZIP reader using Node built-in zlib to extract entries from .xlsx files.
 */
function extractZipEntries(buffer) {
  const entries = new Map();
  // Locate End of Central Directory (EOCD) signature 0x06054b50
  let eocdOffset = -1;
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let i = buffer.length - 22; i >= minOffset; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Invalid XLSX file: ZIP directory not found.');
  }

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  const cdEntries = buffer.readUInt16LE(eocdOffset + 10);
  let offset = cdOffset;

  for (let i = 0; i < cdEntries; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      break;
    }
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLen = buffer.readUInt16LE(offset + 28);
    const extraLen = buffer.readUInt16LE(offset + 30);
    const commentLen = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.toString('utf8', offset + 46, offset + 46 + nameLen);

    const lhNameLen = buffer.readUInt16LE(localHeaderOffset + 26);
    const lhExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + lhNameLen + lhExtraLen;
    const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);

    let fileData;
    if (compression === 0) {
      fileData = compressedData;
    } else if (compression === 8) {
      fileData = zlib.inflateRawSync(compressedData);
    }

    if (fileData) {
      entries.set(fileName, fileData.toString('utf8'));
    }

    offset += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

function decodeXmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function colRefToIndex(ref) {
  const letters = (ref || '').replace(/[^A-Z]/gi, '').toUpperCase();
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return Math.max(0, idx - 1);
}

/**
 * Parse .xlsx Buffer into an array of row objects using the first worksheet.
 */
function parseXlsx(buffer) {
  const entries = extractZipEntries(buffer);
  const sharedStringsXml = entries.get('xl/sharedStrings.xml') || '';
  const sharedStrings = [];

  if (sharedStringsXml) {
    const siMatches = sharedStringsXml.match(/<si\b[^>]*>[\s\S]*?<\/si>/g) || [];
    for (const si of siMatches) {
      const textParts = [];
      const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
      let match;
      while ((match = tRegex.exec(si)) !== null) {
        textParts.push(decodeXmlEntities(match[1]));
      }
      sharedStrings.push(textParts.join(''));
    }
  }

  const sheetXml =
    entries.get('xl/worksheets/sheet1.xml') ||
    Array.from(entries.entries()).find(([name]) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))?.[1];

  if (!sheetXml) {
    throw new Error('Invalid XLSX file: worksheet not found.');
  }

  const rows = [];
  const rowMatches = sheetXml.match(/<row\b[^>]*>[\s\S]*?<\/row>/g) || [];

  for (const rowXml of rowMatches) {
    const rowValues = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const refMatch = attrs.match(/\br="([A-Z]+\d+)"/i);
      const typeMatch = attrs.match(/\bt="([^"]+)"/i);
      const colIdx = refMatch ? colRefToIndex(refMatch[1]) : rowValues.length;
      const cellType = typeMatch ? typeMatch[1] : 'n';

      let val = '';
      if (cellType === 'inlineStr') {
        const tMatch = body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/);
        val = tMatch ? decodeXmlEntities(tMatch[1]) : '';
      } else {
        const vMatch = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
        const rawVal = vMatch ? decodeXmlEntities(vMatch[1]) : '';
        if (cellType === 's') {
          const sIdx = Number(rawVal);
          val = Number.isInteger(sIdx) && sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : '';
        } else {
          val = rawVal;
        }
      }

      while (rowValues.length < colIdx) {
        rowValues.push('');
      }
      rowValues[colIdx] = String(val).trim();
    }

    if (rowValues.some((v) => v !== '')) {
      rows.push(rowValues);
    }
  }

  return rowsToObjects(rows);
}

function rowsToObjects(rows) {
  const nonEmpty = rows.filter((r) => Array.isArray(r) && r.some((cell) => String(cell || '').trim() !== ''));
  if (nonEmpty.length < 2) return [];

  const headers = nonEmpty[0].map((h) => normalizeHeader(h));
  const objects = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const row = nonEmpty[i];
    const obj = {};
    headers.forEach((header, idx) => {
      if (header) {
        obj[header] = row[idx] !== undefined ? String(row[idx]).trim() : '';
      }
    });
    objects.push(obj);
  }

  return objects;
}

function normalizeHeader(header) {
  return String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-/]+/g, '_');
}

function parseSpreadsheet({ filename, contentBase64, csvText }) {
  const lower = String(filename || '').toLowerCase();
  if (lower.endsWith('.xlsx')) {
    if (!contentBase64) throw new Error('Missing XLSX file content.');
    const buf = Buffer.from(contentBase64, 'base64');
    return parseXlsx(buf);
  }
  const text = csvText !== undefined ? csvText : Buffer.from(contentBase64 || '', 'base64').toString('utf8');
  return parseCsv(text);
}

module.exports = {
  parseCsv,
  parseXlsx,
  parseSpreadsheet
};

