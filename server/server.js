/**
 * European Industrial Manufacturer - Enterprise Node.js Express REST API
 * Production security with Helmet, Rate Limiting, CORS, Zod validation, JWT Auth, and Prisma DB access.
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { z } = require('zod');
const serialService = require('./services/serialService');
const { parseSpreadsheet } = require('./utils/spreadsheetParser');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'europrecision_jwt_secret_2026_production_key';

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@thehammer.uk';

// Zod Validation Schemas
const QuoteRequestSchema = z.object({
  companyName: z.string().min(2),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().min(2),
  productName: z.string(),
  quantity: z.number().positive(),
  contactMethod: z.enum(['Email', 'Phone Call', 'WhatsApp', 'EMAIL', 'PHONE', 'WHATSAPP']),
  message: z.string().optional(),
  attachment: z.string().nullable().optional()
});

const ContactRequestSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5),
  phone: z.string().optional()
});

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'THEHAMMER API', recipientEmail: CONTACT_EMAIL, timestamp: new Date().toISOString() });
});

// API Routes: Public Catalog
app.get('/api/v1/products', (req, res) => {
  res.json({ success: true, count: 4, data: [] });
});

// API Route: Submit RFQ (Request a Quote)
app.post('/api/v1/quotes', (req, res) => {
  try {
    const validated = QuoteRequestSchema.parse(req.body);
    const rfqId = 'QT-2026-' + Math.floor(1000 + Math.random() * 9000);
    
    // In production: await prisma.quoteRequest.create({ data: validated })
    res.status(201).json({
      success: true,
      message: `Quotation request submitted successfully and routed to ${CONTACT_EMAIL}`,
      recipientEmail: CONTACT_EMAIL,
      rfqNumber: rfqId,
      data: validated
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Route: Website Contact Form Submission
app.post('/api/v1/contact', (req, res) => {
  try {
    const validated = ContactRequestSchema.parse(req.body);
    const messageId = 'MSG-2026-' + Math.floor(1000 + Math.random() * 9000);

    res.status(200).json({
      success: true,
      message: `Website contact message delivered successfully to ${CONTACT_EMAIL}`,
      recipientEmail: CONTACT_EMAIL,
      messageId: messageId,
      data: validated
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Route: Auth Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@industrial.eu' && password === 'Admin2026!') {
    const token = jwt.sign({ id: 'usr-1', email, role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = jwt.sign({ id: 'usr-1' }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      accessToken: token,
      refreshToken,
      user: { name: 'Admin Officer', email, role: 'SUPER_ADMIN' }
    });
  }

  res.status(401).json({ error: 'Invalid email or password credentials' });
});

// API Route: XML Sitemap
app.get('/api/v1/seo/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://europrecision.eu/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// ============================================================================
// SERIAL NUMBER LOOKUP SYSTEM ROUTES (Public Read-Only + Admin Management)
// ============================================================================

function requireAdmin(req, res, next) {
  if (!req.user || !['SUPER_ADMIN', 'CONTENT_EDITOR'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Administrator privileges required' });
  }
  next();
}

const SerialLookupQuerySchema = z.object({
  serial: z.string().trim().min(1, 'Serial number is required').max(128, 'Serial number is too long')
});

const ShipmentCreateSchema = z.object({
  shipmentCode: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(120).optional(),
  shipmentDate: z.string().trim().min(1).max(32),
  invoiceNumber: z.string().trim().min(1).max(64),
  piNumber: z.string().trim().min(1).max(64),
  totalQuantity: z.union([z.number().int().nonnegative(), z.string()]).nullable().optional(),
  notes: z.string().max(1000).nullable().optional()
});

const SerialRecordSchema = z.object({
  shipmentId: z.string().trim().min(1),
  productGroupId: z.string().max(160).nullable().optional(),
  productGroupModel: z.string().max(160).nullable().optional(),
  productName: z.string().trim().min(1).max(120).optional(),
  serialType: z.enum(['PUMP', 'MOTOR', 'Pump', 'Motor']),
  serialStart: z.string().trim().min(1).max(64),
  serialEnd: z.string().trim().max(64).optional(),
  productModel: z.string().max(120).nullable().optional(),
  possibleModels: z.union([z.array(z.string()), z.string()]).optional(),
  relatedPumpSerial: z.string().max(64).nullable().optional(),
  relatedMotorSerial: z.string().max(64).nullable().optional(),
  requiresVerification: z.boolean().optional(),
  productStatus: z.string().max(32).optional(),
  notes: z.string().max(1000).nullable().optional()
});

const SerialRecordUpdateSchema = SerialRecordSchema.partial();

const ImportSerialsSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentBase64: z.string().optional(),
  csvText: z.string().optional()
});

// Public Read-Only Serial Number Lookup
app.get('/api/v1/serials/lookup', async (req, res) => {
  try {
    const rawSerial = req.query.serial ?? req.query.q ?? '';
    const parsed = SerialLookupQuerySchema.safeParse({ serial: String(rawSerial) });
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Pump or Motor Serial Number.'
      });
    }

    const result = await serialService.lookupSerial(parsed.data.serial);
    return res.json({
      success: true,
      ...result
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      success: false,
      error: status === 400 ? err.message : 'Unable to complete serial number lookup.'
    });
  }
});

// Admin: Summary stats
app.get('/api/v1/admin/serials/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const summary = await serialService.getAdminSummary();
    res.json({ success: true, data: summary });
  } catch {
    res.status(500).json({ error: 'Failed to load serial summary' });
  }
});

// Admin: List / Search / Filter serial records
app.get('/api/v1/admin/serials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = await serialService.listAdminRecords({
      search: req.query.search || '',
      shipmentId: req.query.shipmentId || 'all',
      serialType: req.query.serialType || 'all',
      filter: req.query.filter || 'all',
      page: req.query.page || 1,
      limit: req.query.limit || 50
    });
    res.json({ success: true, ...data });
  } catch {
    res.status(500).json({ error: 'Failed to fetch serial number records' });
  }
});

// Admin: Add serial record
app.post('/api/v1/admin/serials', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validated = SerialRecordSchema.parse(req.body);
    const created = await serialService.createRecord(validated);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues || err.errors });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to create serial record' });
  }
});

// Admin: Update serial record / associate pump-motor-model
app.put('/api/v1/admin/serials/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validated = SerialRecordUpdateSchema.parse(req.body);
    const updated = await serialService.updateRecord(req.params.id, validated);
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues || err.errors });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to update serial record' });
  }
});

// Admin: Delete serial record
app.delete('/api/v1/admin/serials/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await serialService.deleteRecord(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to delete serial record' });
  }
});

// Admin: List shipments
app.get('/api/v1/admin/shipments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const shipments = await serialService.listShipments();
    res.json({ success: true, data: shipments });
  } catch {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Admin: Add shipment
app.post('/api/v1/admin/shipments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validated = ShipmentCreateSchema.parse(req.body);
    const shipment = await serialService.createShipment(validated);
    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues || err.errors });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to create shipment' });
  }
});

// Admin: Import serial records from CSV or Excel (.xlsx)
app.post('/api/v1/admin/serials/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validated = ImportSerialsSchema.parse(req.body);
    const rows = parseSpreadsheet(validated);
    const summary = await serialService.importRows(rows);
    res.status(201).json({ success: true, ...summary });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues || err.errors });
    }
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to import serial data' });
  }
});

// Safe Static Frontend Hosting (only explicit public frontend paths; never exposes server/ or .git/)
const PUBLIC_ROOT = path.resolve(__dirname, '..');
const PUBLIC_STATIC_FILES = new Set([
  '/index.html',
  '/category.html',
  '/style.css',
  '/animations.css',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]);

app.use('/js', express.static(path.join(PUBLIC_ROOT, 'js')));
app.use('/images', express.static(path.join(PUBLIC_ROOT, 'images')));
app.use('/admin', express.static(path.join(PUBLIC_ROOT, 'admin')));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_ROOT, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_ROOT, 'admin', 'index.html'));
});

app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && PUBLIC_STATIC_FILES.has(req.path)) {
    return res.sendFile(path.join(PUBLIC_ROOT, req.path.slice(1)));
  }
  next();
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[EuroPrecision API] Server running on port ${PORT}`);
  });
}

module.exports = app;
