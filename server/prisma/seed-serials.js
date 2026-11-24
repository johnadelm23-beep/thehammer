/**
 * Idempotent PostgreSQL / Prisma seed script for Serial Number Lookup records.
 * Safe to run multiple times without deleting or overwriting existing records.
 */

const { PrismaClient } = require('@prisma/client');
const { SEED_SHIPMENTS, SEED_SERIAL_RECORDS } = require('../data/serialSeedData');

function parseBigIntOrNull(val) {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  try {
    return BigInt(trimmed);
  } catch {
    return null;
  }
}

function rangesOverlap(a, b) {
  const aStart = parseBigIntOrNull(a.serialStart);
  const aEnd = parseBigIntOrNull(a.serialEnd);
  const bStart = parseBigIntOrNull(b.serialStart);
  const bEnd = parseBigIntOrNull(b.serialEnd);

  if (aStart !== null && aEnd !== null && bStart !== null && bEnd !== null) {
    return aStart <= bEnd && bStart <= aEnd;
  }
  return (
    a.serialStart.toLowerCase() === b.serialStart.toLowerCase() ||
    a.serialEnd.toLowerCase() === b.serialEnd.toLowerCase()
  );
}

async function seedSerials() {
  const prisma = new PrismaClient();
  try {
    for (const shipment of SEED_SHIPMENTS) {
      await prisma.shipment.upsert({
        where: { id: shipment.id },
        update: {},
        create: shipment
      });
    }

    for (const record of SEED_SERIAL_RECORDS) {
      const overlaps = SEED_SERIAL_RECORDS.filter(
        (other) => other.id !== record.id && rangesOverlap(record, other)
      );
      const isOverlapping = overlaps.length > 0;
      const overlapNote = isOverlapping
        ? `Overlaps with ${overlaps.map((o) => `${o.shipmentId} (${o.serialStart}-${o.serialEnd})`).join(', ')}`
        : null;

      await prisma.serialNumberRecord.upsert({
        where: { id: record.id },
        update: {},
        create: {
          ...record,
          rangeStartNum: parseBigIntOrNull(record.serialStart),
          rangeEndNum: parseBigIntOrNull(record.serialEnd),
          isOverlapping,
          overlapNote
        }
      });
    }

    console.log('[Seed] Serial Number Lookup shipments and records verified.');
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedSerials().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = { seedSerials };

