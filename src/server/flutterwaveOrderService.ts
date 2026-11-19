import type { Express, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import {
  CANONICAL_BUY_CARD_PRODUCTS,
  BuyCardProduct,
  parseProductImages,
  CHIPNG_DISPLAY_PHONE,
  CHIPNG_SUPPORT_EMAIL,
} from '../data/buyCardCatalog';

export type OrderPaymentStatus =
  | 'pending'
  | 'under_verification'
  | 'successful'
  | 'failed'
  | 'cancelled';

export interface NfcOrderRecord {
  id?: string;
  order_number: string;
  access_token: string;
  tx_ref: string;
  flw_transaction_id?: string | null;
  flw_ref?: string | null;
  payment_gateway: 'flutterwave';
  payment_status: OrderPaymentStatus;
  fulfillment_status: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price_ngn: number;
  total_amount_ngn: number;
  currency: 'NGN';
  customer_name: string;
  business_name?: string | null;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_state: string;
  preferred_card_name?: string | null;
  design_preferences?: string | null;
  brand_colors?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  social_handles?: Record<string, string> | null;
  special_instructions?: string | null;
  design_approval_acknowledged: boolean;
  marketing_opt_in: boolean;
  referrer?: string | null;
  payment_history: Array<{
    tx_ref: string;
    initiated_at: string;
    status: string;
    flw_transaction_id?: string | null;
    note?: string;
  }>;
  flw_processor_response?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlutterwaveServiceDeps {
  getSupabase: () => any;
  getAdminSupabase?: (req?: Request) => any;
  db?: any;
}

// Process-level memory cache as graceful safety net if Supabase migration hasn't been run yet
const memoryOrdersByNumber = new Map<string, NfcOrderRecord>();
const memoryOrdersByTxRef = new Map<string, string>();
const memoryIncompleteLeads = new Map<string, any>();

const ALLOWED_LOGO_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB

function getFlwSecretKey(): string {
  return (
    process.env.FLW_SECRET_KEY ||
    process.env.FLUTTERWAVE_SECRET_KEY ||
    process.env.FLWSECK ||
    ''
  ).trim();
}

function getFlwWebhookHash(): string {
  return (
    process.env.FLW_WEBHOOK_HASH ||
    process.env.FLUTTERWAVE_WEBHOOK_HASH ||
    ''
  ).trim();
}

function constantTimeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CHIP-${y}${m}${d}-${rand}`;
}

function generateTxRef(orderNumber: string): string {
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${orderNumber}-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

function generateAccessToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

function resolvePaymentStatusRedirectUrl(req: Request): string {
  const configured = (process.env.FLW_REDIRECT_URL || '').trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  const protoHeader = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const hostHeader = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.startsWith('127.0.0.1')) {
    return `${protoHeader || 'https'}://${hostHeader}/buy-card/payment-status`;
  }
  if (hostHeader) {
    return `${protoHeader || 'http'}://${hostHeader}/buy-card/payment-status`;
  }
  return 'https://www.chipng.com/buy-card/payment-status';
}

function sanitizeOrderForClient(order: NfcOrderRecord) {
  return {
    order_number: order.order_number,
    tx_ref: order.tx_ref,
    flw_transaction_id: order.flw_transaction_id || null,
    flw_ref: order.flw_ref || null,
    payment_gateway: order.payment_gateway,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    product_id: order.product_id,
    product_slug: order.product_slug,
    product_name: order.product_name,
    quantity: order.quantity,
    unit_price_ngn: order.unit_price_ngn,
    total_amount_ngn: order.total_amount_ngn,
    currency: order.currency,
    customer_name: order.customer_name,
    business_name: order.business_name || '',
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address,
    delivery_state: order.delivery_state,
    preferred_card_name: order.preferred_card_name || '',
    design_preferences: order.design_preferences || '',
    brand_colors: order.brand_colors || '',
    logo_url: order.logo_url || null,
    website_url: order.website_url || '',
    social_handles: order.social_handles || {},
    special_instructions: order.special_instructions || '',
    design_approval_acknowledged: order.design_approval_acknowledged,
    verified_at: order.verified_at || null,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

/**
 * Fetches live CHIPNG hardware catalog from Supabase `public.products` (`profile_id IS NULL`)
 * and merges authoritative production prices & images onto the canonical buy-card lineup.
 */
export async function fetchVerifiedBuyCardCatalog(supabase: any): Promise<BuyCardProduct[]> {
  const baseline = CANONICAL_BUY_CARD_PRODUCTS.map((p) => ({ ...p, images: [...p.images], features: [...p.features] }));
  try {
    const { data: liveRows, error } = await supabase
      .from('products')
      .select('id, name, description, price, currency, image_url, category')
      .is('profile_id', null);

    if (error || !Array.isArray(liveRows) || liveRows.length === 0) {
      return baseline;
    }

    const byId = new Map<string, any>();
    for (const row of liveRows) {
      if (row?.id) byId.set(String(row.id), row);
    }

    return baseline.map((item) => {
      const live = byId.get(item.id);
      if (!live) return item;
      const livePrice = Number(live.price);
      const parsedImages = parseProductImages(live.image_url, item.images);
      return {
        ...item,
        priceNgn: Number.isFinite(livePrice) && livePrice > 0 ? Math.round(livePrice) : item.priceNgn,
        images: parsedImages,
      };
    });
  } catch {
    return baseline;
  }
}

function ensureLocalSqliteOrderTable(db: any) {
  if (!db) return;
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS nfc_orders (
        order_number TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        tx_ref TEXT NOT NULL,
        flw_transaction_id TEXT,
        flw_ref TEXT,
        payment_gateway TEXT DEFAULT 'flutterwave',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        fulfillment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
        product_id TEXT NOT NULL,
        product_slug TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price_ngn INTEGER NOT NULL,
        total_amount_ngn INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        customer_name TEXT NOT NULL,
        business_name TEXT,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_state TEXT NOT NULL,
        preferred_card_name TEXT,
        design_preferences TEXT,
        brand_colors TEXT,
        logo_url TEXT,
        website_url TEXT,
        social_handles TEXT,
        special_instructions TEXT,
        design_approval_acknowledged INTEGER DEFAULT 1,
        marketing_opt_in INTEGER DEFAULT 0,
        referrer TEXT,
        payment_history TEXT,
        flw_processor_response TEXT,
        verified_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_local_nfc_orders_tx_ref ON nfc_orders(tx_ref);
    `);
  } catch (err) {
    console.warn('[FlutterwaveService] Local nfc_orders SQLite setup warning:', err);
  }
}

function parseOrderRowFromDb(row: any): NfcOrderRecord {
  let socialHandles = row.social_handles || {};
  if (typeof socialHandles === 'string') {
    try {
      socialHandles = JSON.parse(socialHandles);
    } catch {
      socialHandles = {};
    }
  }
  let paymentHistory = row.payment_history || [];
  if (typeof paymentHistory === 'string') {
    try {
      paymentHistory = JSON.parse(paymentHistory);
    } catch {
      paymentHistory = [];
    }
  }
  return {
    id: row.id ? String(row.id) : undefined,
    order_number: String(row.order_number),
    access_token: String(row.access_token),
    tx_ref: String(row.tx_ref),
    flw_transaction_id: row.flw_transaction_id || null,
    flw_ref: row.flw_ref || null,
    payment_gateway: 'flutterwave',
    payment_status: (row.payment_status || 'pending') as OrderPaymentStatus,
    fulfillment_status: String(row.fulfillment_status || 'awaiting_payment'),
    product_id: String(row.product_id),
    product_slug: String(row.product_slug || ''),
    product_name: String(row.product_name),
    quantity: Number(row.quantity || 1),
    unit_price_ngn: Number(row.unit_price_ngn || 0),
    total_amount_ngn: Number(row.total_amount_ngn || 0),
    currency: 'NGN',
    customer_name: String(row.customer_name || ''),
    business_name: row.business_name || null,
    customer_email: String(row.customer_email || ''),
    customer_phone: String(row.customer_phone || ''),
    delivery_address: String(row.delivery_address || ''),
    delivery_state: String(row.delivery_state || ''),
    preferred_card_name: row.preferred_card_name || null,
    design_preferences: row.design_preferences || null,
    brand_colors: row.brand_colors || null,
    logo_url: row.logo_url || null,
    website_url: row.website_url || null,
    social_handles: socialHandles,
    special_instructions: row.special_instructions || null,
    design_approval_acknowledged: Boolean(row.design_approval_acknowledged),
    marketing_opt_in: Boolean(row.marketing_opt_in),
    referrer: row.referrer || null,
    payment_history: Array.isArray(paymentHistory) ? paymentHistory : [],
    flw_processor_response: row.flw_processor_response || null,
    verified_at: row.verified_at || null,
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
  };
}

async function persistOrder(order: NfcOrderRecord, deps: FlutterwaveServiceDeps): Promise<void> {
  memoryOrdersByNumber.set(order.order_number, order);
  memoryOrdersByTxRef.set(order.tx_ref, order.order_number);
  for (const h of order.payment_history || []) {
    if (h?.tx_ref) memoryOrdersByTxRef.set(h.tx_ref, order.order_number);
  }

  // 1. Local SQLite persistence (dev / Node server)
  if (deps.db) {
    try {
      ensureLocalSqliteOrderTable(deps.db);
      deps.db
        .prepare(
          `INSERT INTO nfc_orders (
            order_number, access_token, tx_ref, flw_transaction_id, flw_ref,
            payment_gateway, payment_status, fulfillment_status,
            product_id, product_slug, product_name, quantity, unit_price_ngn, total_amount_ngn, currency,
            customer_name, business_name, customer_email, customer_phone, delivery_address, delivery_state,
            preferred_card_name, design_preferences, brand_colors, logo_url, website_url,
            social_handles, special_instructions, design_approval_acknowledged, marketing_opt_in,
            referrer, payment_history, flw_processor_response, verified_at, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(order_number) DO UPDATE SET
            tx_ref = excluded.tx_ref,
            flw_transaction_id = excluded.flw_transaction_id,
            flw_ref = excluded.flw_ref,
            payment_status = excluded.payment_status,
            fulfillment_status = excluded.fulfillment_status,
            payment_history = excluded.payment_history,
            flw_processor_response = excluded.flw_processor_response,
            verified_at = excluded.verified_at,
            updated_at = excluded.updated_at`
        )
        .run(
          order.order_number,
          order.access_token,
          order.tx_ref,
          order.flw_transaction_id || null,
          order.flw_ref || null,
          order.payment_gateway,
          order.payment_status,
          order.fulfillment_status,
          order.product_id,
          order.product_slug,
          order.product_name,
          order.quantity,
          order.unit_price_ngn,
          order.total_amount_ngn,
          order.currency,
          order.customer_name,
          order.business_name || null,
          order.customer_email,
          order.customer_phone,
          order.delivery_address,
          order.delivery_state,
          order.preferred_card_name || null,
          order.design_preferences || null,
          order.brand_colors || null,
          order.logo_url || null,
          order.website_url || null,
          JSON.stringify(order.social_handles || {}),
          order.special_instructions || null,
          order.design_approval_acknowledged ? 1 : 0,
          order.marketing_opt_in ? 1 : 0,
          order.referrer || null,
          JSON.stringify(order.payment_history || []),
          order.flw_processor_response || null,
          order.verified_at || null,
          order.created_at,
          order.updated_at
        );
    } catch (sqlErr) {
      console.warn('[FlutterwaveService] SQLite persistOrder warning:', sqlErr);
    }
  }

  // 2. Supabase `nfc_orders` persistence (production)
  try {
    const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();
    const { error } = await sb.from('nfc_orders').upsert(
      [
        {
          order_number: order.order_number,
          access_token: order.access_token,
          tx_ref: order.tx_ref,
          flw_transaction_id: order.flw_transaction_id || null,
          flw_ref: order.flw_ref || null,
          payment_gateway: order.payment_gateway,
          payment_status: order.payment_status,
          fulfillment_status: order.fulfillment_status,
          product_id: order.product_id,
          product_slug: order.product_slug,
          product_name: order.product_name,
          quantity: order.quantity,
          unit_price_ngn: order.unit_price_ngn,
          total_amount_ngn: order.total_amount_ngn,
          currency: order.currency,
          customer_name: order.customer_name,
          business_name: order.business_name || null,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          delivery_state: order.delivery_state,
          preferred_card_name: order.preferred_card_name || null,
          design_preferences: order.design_preferences || null,
          brand_colors: order.brand_colors || null,
          logo_url: order.logo_url || null,
          website_url: order.website_url || null,
          social_handles: order.social_handles || {},
          special_instructions: order.special_instructions || null,
          design_approval_acknowledged: order.design_approval_acknowledged,
          marketing_opt_in: order.marketing_opt_in,
          referrer: order.referrer || null,
          payment_history: order.payment_history || [],
          flw_processor_response: order.flw_processor_response || null,
          verified_at: order.verified_at || null,
          updated_at: order.updated_at,
        },
      ],
      { onConflict: 'order_number' }
    );
    if (error) {
      console.warn('[FlutterwaveService] Supabase nfc_orders upsert note:', error.message);
    }
  } catch (sbErr: any) {
    console.warn('[FlutterwaveService] Supabase nfc_orders upsert skipped:', sbErr?.message || sbErr);
  }
}

async function findOrder(
  lookup: { order_number?: string; tx_ref?: string },
  deps: FlutterwaveServiceDeps
): Promise<NfcOrderRecord | null> {
  const orderNumber = lookup.order_number?.trim() || '';
  const txRef = lookup.tx_ref?.trim() || '';

  // 1. Try Supabase first (authoritative across serverless instances)
  try {
    const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();
    if (orderNumber) {
      const { data, error } = await sb
        .from('nfc_orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();
      if (!error && data) return parseOrderRowFromDb(data);
    }
    if (txRef) {
      const { data, error } = await sb
        .from('nfc_orders')
        .select('*')
        .eq('tx_ref', txRef)
        .maybeSingle();
      if (!error && data) return parseOrderRowFromDb(data);

      // Search recent orders for historical retry tx_ref match
      const { data: recent } = await sb
        .from('nfc_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (Array.isArray(recent)) {
        const hit = recent.find((r: any) => {
          const hist = Array.isArray(r.payment_history) ? r.payment_history : [];
          return hist.some((h: any) => h?.tx_ref === txRef);
        });
        if (hit) return parseOrderRowFromDb(hit);
      }
    }
  } catch {
    // Fall through to SQLite / memory
  }

  // 2. Local SQLite fallback
  if (deps.db) {
    try {
      ensureLocalSqliteOrderTable(deps.db);
      if (orderNumber) {
        const row = deps.db.prepare('SELECT * FROM nfc_orders WHERE order_number = ?').get(orderNumber);
        if (row) return parseOrderRowFromDb(row);
      }
      if (txRef) {
        const row = deps.db.prepare('SELECT * FROM nfc_orders WHERE tx_ref = ?').get(txRef);
        if (row) return parseOrderRowFromDb(row);
        const recent = deps.db.prepare('SELECT * FROM nfc_orders ORDER BY created_at DESC LIMIT 100').all();
        const hit = recent.find((r: any) => String(r.payment_history || '').includes(txRef));
        if (hit) return parseOrderRowFromDb(hit);
      }
    } catch {
      // Fall through to memory
    }
  }

  // 3. Process memory fallback
  if (orderNumber && memoryOrdersByNumber.has(orderNumber)) {
    return memoryOrdersByNumber.get(orderNumber) || null;
  }
  if (txRef && memoryOrdersByTxRef.has(txRef)) {
    const mappedOrderNum = memoryOrdersByTxRef.get(txRef)!;
    return memoryOrdersByNumber.get(mappedOrderNum) || null;
  }

  return null;
}

async function initializeFlutterwaveStandardPayment(params: {
  order: NfcOrderRecord;
  txRef: string;
  redirectBaseUrl: string;
  secretKey: string;
}): Promise<{ ok: boolean; payment_link?: string; error?: string; raw?: any }> {
  const { order, txRef, redirectBaseUrl, secretKey } = params;
  const redirectUrl = `${redirectBaseUrl}?order=${encodeURIComponent(order.order_number)}&token=${encodeURIComponent(order.access_token)}`;

  const payload = {
    tx_ref: txRef,
    amount: order.total_amount_ngn,
    currency: 'NGN',
    redirect_url: redirectUrl,
    payment_options: 'card,banktransfer,ussd,account',
    customer: {
      email: order.customer_email,
      phonenumber: order.customer_phone,
      name: order.customer_name,
    },
    customizations: {
      title: 'CHIPNG Smart Business Cards',
      description: `${order.product_name} × ${order.quantity} — Order ${order.order_number}`,
      logo: 'https://www.chipng.com/chipng_exact_tile.png',
    },
    meta: {
      order_number: order.order_number,
      product_id: order.product_id,
      product_slug: order.product_slug,
      product_name: order.product_name,
      quantity: order.quantity,
      delivery_state: order.delivery_state,
      business_name: order.business_name || '',
      preferred_card_name: order.preferred_card_name || '',
      referrer: order.referrer || '',
    },
  };

  try {
    const resp = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json: any = await resp.json().catch(() => ({}));
    if (resp.ok && json?.status === 'success' && json?.data?.link) {
      return { ok: true, payment_link: String(json.data.link), raw: json };
    }
    return {
      ok: false,
      error: json?.message || `Flutterwave returned HTTP ${resp.status}`,
      raw: json,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Unable to reach Flutterwave payment servers.',
    };
  }
}

async function verifyTransactionWithFlutterwaveApi(params: {
  transactionId?: string | null;
  txRef?: string | null;
  secretKey: string;
}): Promise<{ ok: boolean; data?: any; error?: string }> {
  const { transactionId, txRef, secretKey } = params;
  const cleanId = transactionId ? String(transactionId).trim() : '';
  const cleanRef = txRef ? String(txRef).trim() : '';

  if (!cleanId && !cleanRef) {
    return { ok: false, error: 'Missing transaction_id or tx_ref for Flutterwave verification.' };
  }

  const endpoint =
    cleanId && /^\d+$/.test(cleanId)
      ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(cleanId)}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(cleanRef || cleanId)}`;

  try {
    const resp = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });
    const json: any = await resp.json().catch(() => ({}));
    if (resp.ok && json?.status === 'success' && json?.data) {
      return { ok: true, data: json.data };
    }
    return {
      ok: false,
      error: json?.message || `Flutterwave verification failed (HTTP ${resp.status}).`,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error while verifying with Flutterwave.' };
  }
}

async function syncVerifiedOrderToLegacyTablesAndNotify(
  order: NfcOrderRecord,
  verifiedTxRef: string,
  deps: FlutterwaveServiceDeps
): Promise<void> {
  const cardLabel = `${order.product_name}${order.quantity > 1 ? ` (×${order.quantity})` : ''} [${order.order_number}]`;

  // 1. Local SQLite nfc_sales (idempotent by payment_reference)
  if (deps.db) {
    try {
      const existing = deps.db
        .prepare('SELECT id FROM nfc_sales WHERE payment_reference = ?')
        .get(verifiedTxRef);
      if (!existing) {
        deps.db
          .prepare(
            `INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(
            order.customer_name,
            order.customer_email,
            order.customer_phone,
            cardLabel,
            order.total_amount_ngn,
            verifiedTxRef
          );
      }

      if (order.referrer && order.referrer.trim()) {
        const cleanReferrer = order.referrer.trim().replace(/^@/, '').toLowerCase();
        const commissionRate = 0.1;
        const commissionAmount = Math.round(order.total_amount_ngn * commissionRate);
        deps.db
          .prepare(
            `INSERT OR IGNORE INTO referral_sales
              (referrer, buyer_name, buyer_email, card_type, card_amount, commission_rate, commission_amount, payment_reference, payout_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
          )
          .run(
            cleanReferrer,
            order.customer_name,
            order.customer_email,
            cardLabel,
            order.total_amount_ngn,
            commissionRate,
            commissionAmount,
            verifiedTxRef
          );
      }
    } catch (sqlErr) {
      console.warn('[FlutterwaveService] Local nfc_sales sync warning:', sqlErr);
    }
  }

  // 2. Supabase `purchases` & `nfc_sales` (idempotent by reference)
  try {
    const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();

    const { data: existingPurchase } = await sb
      .from('purchases')
      .select('id')
      .eq('reference', verifiedTxRef)
      .maybeSingle();

    if (!existingPurchase) {
      await sb.from('purchases').insert([
        {
          buyer_email: order.customer_email,
          amount: order.total_amount_ngn,
          platform_fee: 0,
          net_earnings: order.total_amount_ngn,
          reference: verifiedTxRef,
          status: 'completed',
          purchase_type: 'nfc_card',
        },
      ]);
    }

    // Also update any incomplete checkout lead so abandoned recovery does not fire
    if (order.customer_email) {
      await sb
        .from('card_funnel_leads')
        .update({ funnel_stage: 'converted', updated_at: new Date().toISOString() })
        .eq('email', order.customer_email);
    }
  } catch (sbErr) {
    console.warn('[FlutterwaveService] Supabase legacy sync note:', sbErr);
  }

  // 3. Optional email receipt via Resend or SMTP (non-blocking)
  try {
    const subject = `CHIPNG Order Confirmed — ${order.order_number} (₦${order.total_amount_ngn.toLocaleString('en-NG')})`;
    const textBody = [
      `Thank you for ordering with CHIPNG, ${order.customer_name}!`,
      '',
      `Order Number: ${order.order_number}`,
      `Product: ${order.product_name} × ${order.quantity}`,
      `Amount Paid: ₦${order.total_amount_ngn.toLocaleString('en-NG')} (NGN)`,
      `Flutterwave Reference: ${verifiedTxRef}`,
      `Delivery State: ${order.delivery_state}`,
      `Delivery Address: ${order.delivery_address}`,
      '',
      'Next Steps:',
      '1. Our Lagos design team will prepare your custom card layout and send a digital proof via WhatsApp/Email.',
      '2. Production starts immediately once you approve your design proof.',
      `3. Need priority help? WhatsApp ${CHIPNG_DISPLAY_PHONE} or email ${CHIPNG_SUPPORT_EMAIL}.`,
    ].join('\n');

    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendKey) {
      const resend = new Resend(resendKey);
      const fromAddr = process.env.RESEND_FROM_EMAIL || 'CHIPNG Orders <orders@chipng.com>';
      await resend.emails.send({
        from: fromAddr,
        to: [order.customer_email],
        bcc: ['vickthor.dennis@gmail.com'],
        subject,
        text: textBody,
      });
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = parseInt(process.env.SMTP_PORT || '465', 10);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"CHIPNG Orders" <${process.env.SMTP_USER}>`,
        to: order.customer_email,
        bcc: 'vickthor.dennis@gmail.com',
        subject,
        text: textBody,
      });
    }
  } catch (mailErr) {
    console.warn('[FlutterwaveService] Order receipt email skipped:', mailErr);
  }
}

export function registerFlutterwaveOrderRoutes(app: Express, deps: FlutterwaveServiceDeps) {
  // 1. Live verified catalog endpoint for /buy-card
  app.get('/api/buy-card/catalog', async (_req: Request, res: Response) => {
    try {
      const products = await fetchVerifiedBuyCardCatalog(deps.getSupabase());
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return res.json({
        success: true,
        currency: 'NGN',
        products,
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(200).json({
        success: true,
        currency: 'NGN',
        products: CANONICAL_BUY_CARD_PRODUCTS,
        fallback: true,
      });
    }
  });

  // 2. Secure card logo upload (MIME + 5MB validation, Supabase Storage -> local dev fallback)
  app.post('/api/orders/upload-logo', async (req: Request, res: Response) => {
    try {
      const { filename, mimeType, base64Data } = req.body || {};
      const cleanMime = String(mimeType || '').toLowerCase().trim();
      if (!ALLOWED_LOGO_MIMES.has(cleanMime)) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported file type. Upload PNG, JPG, WEBP, SVG, or PDF.',
        });
      }
      if (!base64Data || typeof base64Data !== 'string') {
        return res.status(400).json({ success: false, error: 'File content is required.' });
      }

      const rawBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(rawBase64, 'base64');
      if (!buffer.length) {
        return res.status(400).json({ success: false, error: 'Uploaded file is empty.' });
      }
      if (buffer.length > MAX_LOGO_BYTES) {
        return res.status(413).json({
          success: false,
          error: 'Logo file exceeds the 5MB maximum limit.',
        });
      }

      const extMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf',
      };
      const ext = extMap[cleanMime] || 'png';
      const safeStem = String(filename || 'logo')
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
      const storagePath = `card-logos/${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeStem || 'logo'}.${ext}`;

      const sb = deps.getAdminSupabase ? deps.getAdminSupabase(req) : deps.getSupabase();
      const { error: uploadErr } = await sb.storage
        .from('covers')
        .upload(storagePath, buffer, { contentType: cleanMime, upsert: false });

      if (!uploadErr) {
        const { data: pubData } = sb.storage.from('covers').getPublicUrl(storagePath);
        if (pubData?.publicUrl) {
          return res.json({
            success: true,
            url: pubData.publicUrl,
            storage: 'supabase',
            bytes: buffer.length,
          });
        }
      }

      // Local filesystem fallback for non-serverless environments
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'card-logos');
        fs.mkdirSync(uploadDir, { recursive: true });
        const localName = path.basename(storagePath);
        fs.writeFileSync(path.join(uploadDir, localName), buffer);
        return res.json({
          success: true,
          url: `/uploads/card-logos/${localName}`,
          storage: 'local',
          bytes: buffer.length,
        });
      } catch (fsErr: any) {
        return res.status(500).json({
          success: false,
          error: uploadErr?.message || fsErr?.message || 'Unable to store logo file.',
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Logo upload failed.' });
    }
  });

  // 3. Create pending order with server-authoritative pricing & initialize Flutterwave Standard Checkout
  app.post('/api/orders/create-and-pay', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const customerName = String(body.customer_name || body.full_name || '').trim();
      const businessName = String(body.business_name || '').trim();
      const customerEmail = String(body.customer_email || body.email || '').trim().toLowerCase();
      const customerPhone = String(body.customer_phone || body.phone || '').trim();
      const deliveryAddress = String(body.delivery_address || '').trim();
      const deliveryState = String(body.delivery_state || '').trim();
      const productId = String(body.product_id || '').trim();
      const productSlug = String(body.product_slug || '').trim();
      const quantityRaw = Number(body.quantity ?? 1);
      const quantity = Number.isInteger(quantityRaw) && quantityRaw >= 1 && quantityRaw <= 200 ? quantityRaw : 0;

      if (!customerName || customerName.length < 2) {
        return res.status(400).json({ success: false, error: 'Please enter your full name.' });
      }
      if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      }
      if (!customerPhone || customerPhone.replace(/[^0-9+]/g, '').length < 7) {
        return res.status(400).json({ success: false, error: 'Please enter a valid phone / WhatsApp number.' });
      }
      if (!deliveryAddress || deliveryAddress.length < 5) {
        return res.status(400).json({ success: false, error: 'Please provide your delivery address.' });
      }
      if (!deliveryState) {
        return res.status(400).json({ success: false, error: 'Please select your delivery state.' });
      }
      if (!quantity) {
        return res.status(400).json({ success: false, error: 'Quantity must be between 1 and 200.' });
      }
      if (!body.design_approval_acknowledged) {
        return res.status(400).json({
          success: false,
          error: 'Please confirm that you understand your card will be sent for design approval before production.',
        });
      }

      // Authoritative server-side product & price lookup (NEVER trust client price!)
      const catalog = await fetchVerifiedBuyCardCatalog(deps.getSupabase());
      const matchedProduct = catalog.find(
        (p) => (productId && p.id === productId) || (productSlug && p.slug === productSlug)
      );
      if (!matchedProduct) {
        return res.status(400).json({ success: false, error: 'Selected product was not found in the verified CHIPNG catalog.' });
      }

      const unitPriceNgn = Math.round(matchedProduct.priceNgn);
      const totalAmountNgn = unitPriceNgn * quantity;
      const nowIso = new Date().toISOString();
      const orderNumber = generateOrderNumber();
      const accessToken = generateAccessToken();
      const txRef = generateTxRef(orderNumber);

      const cleanSocials: Record<string, string> = {};
      if (body.social_handles && typeof body.social_handles === 'object') {
        for (const [k, v] of Object.entries(body.social_handles)) {
          if (typeof v === 'string' && v.trim()) {
            cleanSocials[k.slice(0, 30)] = v.trim().slice(0, 200);
          }
        }
      }

      const order: NfcOrderRecord = {
        order_number: orderNumber,
        access_token: accessToken,
        tx_ref: txRef,
        flw_transaction_id: null,
        flw_ref: null,
        payment_gateway: 'flutterwave',
        payment_status: 'pending',
        fulfillment_status: 'awaiting_payment',
        product_id: matchedProduct.id,
        product_slug: matchedProduct.slug,
        product_name: matchedProduct.name,
        quantity,
        unit_price_ngn: unitPriceNgn,
        total_amount_ngn: totalAmountNgn,
        currency: 'NGN',
        customer_name: customerName,
        business_name: businessName || null,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_state: deliveryState,
        preferred_card_name: String(body.preferred_card_name || customerName).trim().slice(0, 120),
        design_preferences: String(body.design_preferences || '').trim().slice(0, 1000) || null,
        brand_colors: String(body.brand_colors || '').trim().slice(0, 160) || null,
        logo_url: typeof body.logo_url === 'string' && body.logo_url.trim() ? body.logo_url.trim().slice(0, 500) : null,
        website_url: String(body.website_url || '').trim().slice(0, 300) || null,
        social_handles: cleanSocials,
        special_instructions: String(body.special_instructions || '').trim().slice(0, 1000) || null,
        design_approval_acknowledged: true,
        marketing_opt_in: Boolean(body.marketing_opt_in),
        referrer: typeof body.referrer === 'string' && body.referrer.trim() ? body.referrer.trim().slice(0, 80) : null,
        payment_history: [
          {
            tx_ref: txRef,
            initiated_at: nowIso,
            status: 'pending',
            note: 'Initial checkout session',
          },
        ],
        flw_processor_response: null,
        verified_at: null,
        created_at: nowIso,
        updated_at: nowIso,
      };

      await persistOrder(order, deps);

      const secretKey = getFlwSecretKey();
      if (!secretKey) {
        return res.status(503).json({
          success: false,
          code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
          order_number: order.order_number,
          access_token: order.access_token,
          tx_ref: order.tx_ref,
          unit_price_ngn: order.unit_price_ngn,
          total_amount_ngn: order.total_amount_ngn,
          currency: 'NGN',
          payment_status: 'pending',
          error: `Your order reference (${order.order_number}) was saved, but Flutterwave server payment keys (FLW_SECRET_KEY) are not configured on this environment yet. Contact CHIPNG on WhatsApp (${CHIPNG_DISPLAY_PHONE}) with your order reference or configure FLW_SECRET_KEY on the server.`,
        });
      }

      const redirectBaseUrl = resolvePaymentStatusRedirectUrl(req);
      const flwInit = await initializeFlutterwaveStandardPayment({
        order,
        txRef,
        redirectBaseUrl,
        secretKey,
      });

      if (!flwInit.ok || !flwInit.payment_link) {
        return res.status(502).json({
          success: false,
          code: 'FLUTTERWAVE_INIT_FAILED',
          order_number: order.order_number,
          access_token: order.access_token,
          tx_ref: order.tx_ref,
          error: flwInit.error || 'Could not initialize Flutterwave hosted checkout. Please retry.',
        });
      }

      return res.json({
        success: true,
        order_number: order.order_number,
        access_token: order.access_token,
        tx_ref: order.tx_ref,
        unit_price_ngn: order.unit_price_ngn,
        total_amount_ngn: order.total_amount_ngn,
        currency: 'NGN',
        payment_status: 'pending',
        payment_link: flwInit.payment_link,
      });
    } catch (err: any) {
      console.error('[FlutterwaveService] create-and-pay error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Failed to initialize order.' });
    }
  });

  // 4. Retry payment on existing pending/failed/cancelled order (NO duplicate order created)
  app.post('/api/orders/:orderNumber/retry-payment', async (req: Request, res: Response) => {
    try {
      const orderNumber = String(req.params.orderNumber || '').trim();
      const token = String(req.body?.token || req.body?.access_token || req.query.token || '').trim();

      const order = await findOrder({ order_number: orderNumber }, deps);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }
      if (!constantTimeEqual(order.access_token, token)) {
        return res.status(403).json({ success: false, error: 'Unauthorized order access token.' });
      }
      if (order.payment_status === 'successful') {
        return res.status(409).json({
          success: false,
          code: 'ALREADY_PAID',
          error: 'This order has already been paid and verified.',
          order: sanitizeOrderForClient(order),
        });
      }

      const secretKey = getFlwSecretKey();
      if (!secretKey) {
        return res.status(503).json({
          success: false,
          code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
          error: `Flutterwave server key (FLW_SECRET_KEY) is not configured yet. Please contact CHIPNG on WhatsApp (${CHIPNG_DISPLAY_PHONE}) with order ${order.order_number}.`,
        });
      }

      const newTxRef = generateTxRef(order.order_number);
      const nowIso = new Date().toISOString();
      order.tx_ref = newTxRef;
      order.payment_status = 'pending';
      order.updated_at = nowIso;
      order.payment_history = [
        ...(order.payment_history || []),
        {
          tx_ref: newTxRef,
          initiated_at: nowIso,
          status: 'pending',
          note: 'Customer retry payment attempt',
        },
      ];

      await persistOrder(order, deps);

      const redirectBaseUrl = resolvePaymentStatusRedirectUrl(req);
      const flwInit = await initializeFlutterwaveStandardPayment({
        order,
        txRef: newTxRef,
        redirectBaseUrl,
        secretKey,
      });

      if (!flwInit.ok || !flwInit.payment_link) {
        return res.status(502).json({
          success: false,
          error: flwInit.error || 'Unable to start a new Flutterwave checkout session.',
        });
      }

      return res.json({
        success: true,
        order_number: order.order_number,
        tx_ref: newTxRef,
        total_amount_ngn: order.total_amount_ngn,
        currency: 'NGN',
        payment_status: 'pending',
        payment_link: flwInit.payment_link,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Retry payment failed.' });
    }
  });

  // 5. Scoped order status lookup (requires both order_number & access_token)
  app.get('/api/orders/status', async (req: Request, res: Response) => {
    try {
      const orderNumber = String(req.query.order || req.query.order_number || '').trim();
      const token = String(req.query.token || req.query.access_token || '').trim();
      if (!orderNumber || !token) {
        return res.status(400).json({ success: false, error: 'Order number and access token are required.' });
      }
      const order = await findOrder({ order_number: orderNumber }, deps);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }
      if (!constantTimeEqual(order.access_token, token)) {
        return res.status(403).json({ success: false, error: 'Invalid order access token.' });
      }
      return res.json({
        success: true,
        verified: order.payment_status === 'successful',
        payment_status: order.payment_status,
        order: sanitizeOrderForClient(order),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Status lookup failed.' });
    }
  });

  // 6. Server-side Flutterwave callback verification (GET & POST /api/flutterwave/verify)
  const handleStandardFlutterwaveVerify = async (req: Request, res: Response) => {
    try {
      const src = req.method === 'GET' ? req.query : { ...req.query, ...(req.body || {}) };
      const orderNumber = String(src.order || src.order_number || '').trim();
      const token = String(src.token || src.access_token || '').trim();
      const txRef = String(src.tx_ref || '').trim();
      const transactionId = String(src.transaction_id || '').trim();
      const redirectStatus = String(src.status || '').toLowerCase().trim();

      const order = await findOrder({ order_number: orderNumber, tx_ref: txRef }, deps);
      if (!order) {
        return res.status(404).json({
          success: false,
          verified: false,
          payment_status: 'failed',
          error: 'We could not locate this order reference. Please contact CHIPNG support if you were debited.',
        });
      }

      if (token && !constantTimeEqual(order.access_token, token)) {
        return res.status(403).json({ success: false, verified: false, error: 'Invalid order access token.' });
      }

      // Already confirmed idempotently (e.g., webhook arrived before redirect or page reloaded)
      if (order.payment_status === 'successful') {
        return res.json({
          success: true,
          verified: true,
          payment_status: 'successful',
          order: sanitizeOrderForClient(order),
        });
      }

      // Explicit customer cancel from Flutterwave hosted modal with no completed transaction
      if (redirectStatus === 'cancelled' && !transactionId) {
        order.payment_status = 'cancelled';
        order.updated_at = new Date().toISOString();
        order.payment_history = (order.payment_history || []).map((h) =>
          h.tx_ref === (txRef || order.tx_ref) ? { ...h, status: 'cancelled' } : h
        );
        await persistOrder(order, deps);
        return res.json({
          success: true,
          verified: false,
          payment_status: 'cancelled',
          message: 'Payment was cancelled before completion. No confirmed charge was recorded.',
          order: sanitizeOrderForClient(order),
        });
      }

      const secretKey = getFlwSecretKey();
      if (!secretKey) {
        return res.status(503).json({
          success: false,
          verified: false,
          payment_status: 'under_verification',
          error: 'Payment verification key is not configured on the server. Do not pay twice—contact CHIPNG support with your order number.',
          order: sanitizeOrderForClient(order),
        });
      }

      const verifyRes = await verifyTransactionWithFlutterwaveApi({
        transactionId: transactionId || null,
        txRef: txRef || order.tx_ref,
        secretKey,
      });

      if (!verifyRes.ok || !verifyRes.data) {
        // Never mark paid when verification cannot confirm!
        if (redirectStatus === 'cancelled') {
          order.payment_status = 'cancelled';
        } else {
          order.payment_status = 'under_verification';
        }
        order.flw_processor_response = verifyRes.error || 'Verification pending';
        order.updated_at = new Date().toISOString();
        await persistOrder(order, deps);

        return res.status(200).json({
          success: true,
          verified: false,
          payment_status: order.payment_status,
          message:
            order.payment_status === 'cancelled'
              ? 'Payment was cancelled.'
              : 'We are still confirming your payment with Flutterwave. Please wait a moment and re-check or contact support.',
          order: sanitizeOrderForClient(order),
        });
      }

      const flwData = verifyRes.data;
      const flwStatus = String(flwData.status || '').toLowerCase();
      const flwCurrency = String(flwData.currency || '').toUpperCase();
      const flwAmount = Number(flwData.amount || 0);
      const flwTxRef = String(flwData.tx_ref || '');
      const flwId = flwData.id ? String(flwData.id) : transactionId || null;

      const knownTxRefs = new Set([
        order.tx_ref,
        ...(order.payment_history || []).map((h) => h.tx_ref),
      ]);
      const refMatches = Boolean(flwTxRef && knownTxRefs.has(flwTxRef));
      const currencyMatches = flwCurrency === 'NGN';
      const amountMatches = Number.isFinite(flwAmount) && flwAmount >= order.total_amount_ngn;

      const nowIso = new Date().toISOString();
      order.flw_transaction_id = flwId;
      order.flw_ref = flwData.flw_ref ? String(flwData.flw_ref) : order.flw_ref;
      order.flw_processor_response = String(flwData.processor_response || flwData.status || '');
      order.updated_at = nowIso;

      if ((flwStatus === 'successful' || flwStatus === 'completed') && refMatches && currencyMatches && amountMatches) {
        order.payment_status = 'successful';
        order.fulfillment_status = 'paid_awaiting_design_proof';
        order.verified_at = nowIso;
        order.tx_ref = flwTxRef;
        order.payment_history = (order.payment_history || []).map((h) =>
          h.tx_ref === flwTxRef ? { ...h, status: 'successful', flw_transaction_id: flwId } : h
        );
        await persistOrder(order, deps);
        await syncVerifiedOrderToLegacyTablesAndNotify(order, flwTxRef, deps);

        return res.json({
          success: true,
          verified: true,
          payment_status: 'successful',
          order: sanitizeOrderForClient(order),
        });
      }

      if (flwStatus === 'pending') {
        order.payment_status = 'under_verification';
        order.payment_history = (order.payment_history || []).map((h) =>
          h.tx_ref === flwTxRef ? { ...h, status: 'under_verification', flw_transaction_id: flwId } : h
        );
        await persistOrder(order, deps);
        return res.json({
          success: true,
          verified: false,
          payment_status: 'under_verification',
          message: 'Your transfer or card authorization is still pending bank confirmation. We will confirm automatically as soon as Flutterwave settles.',
          order: sanitizeOrderForClient(order),
        });
      }

      if (flwStatus === 'cancelled') {
        order.payment_status = 'cancelled';
      } else {
        order.payment_status = 'failed';
      }
      order.payment_history = (order.payment_history || []).map((h) =>
        h.tx_ref === (flwTxRef || order.tx_ref)
          ? {
              ...h,
              status: order.payment_status,
              flw_transaction_id: flwId,
              note: !amountMatches ? 'Amount mismatch detected' : !currencyMatches ? 'Currency mismatch' : flwStatus,
            }
          : h
      );
      await persistOrder(order, deps);

      return res.json({
        success: true,
        verified: false,
        payment_status: order.payment_status,
        message:
          !amountMatches && (flwStatus === 'successful' || flwStatus === 'completed')
            ? 'Paid amount did not match the verified order total. Please contact CHIPNG support.'
            : 'We could not confirm a successful payment for this transaction.',
        order: sanitizeOrderForClient(order),
      });
    } catch (err: any) {
      console.error('[FlutterwaveService] verify error:', err);
      return res.status(500).json({ success: false, verified: false, error: err?.message || 'Verification error.' });
    }
  };

  app.get('/api/flutterwave/verify', handleStandardFlutterwaveVerify);
  app.post('/api/flutterwave/verify', handleStandardFlutterwaveVerify);

  // 7. Secure Idempotent Flutterwave Webhook (verif-hash signature + independent re-verification)
  app.post('/api/flutterwave/webhook', async (req: Request, res: Response) => {
    try {
      const expectedHash = getFlwWebhookHash();
      if (!expectedHash) {
        return res.status(503).json({
          success: false,
          error: 'FLW_WEBHOOK_HASH is not configured on the server.',
        });
      }

      const incomingHash = String(req.headers['verif-hash'] || '').trim();
      if (!incomingHash || !constantTimeEqual(incomingHash, expectedHash)) {
        return res.status(401).json({ success: false, error: 'Invalid webhook signature.' });
      }

      const payload = req.body || {};
      const txData = payload.data || {};
      const txRef = String(txData.tx_ref || '').trim();
      const txId = txData.id ? String(txData.id) : '';
      const orderNumber = String(txData.meta?.order_number || payload.meta_data?.order_number || '').trim();

      if (!txRef && !orderNumber) {
        return res.status(200).json({ received: true, ignored: 'No order reference in webhook payload.' });
      }

      const order = await findOrder({ order_number: orderNumber, tx_ref: txRef }, deps);
      if (!order) {
        return res.status(200).json({ received: true, ignored: 'Order not found for webhook reference.' });
      }

      // Already verified — idempotent no-op
      if (order.payment_status === 'successful') {
        return res.status(200).json({ received: true, idempotent: true, status: 'successful' });
      }

      const secretKey = getFlwSecretKey();
      if (!secretKey) {
        return res.status(503).json({ success: false, error: 'FLW_SECRET_KEY not configured for webhook verification.' });
      }

      // Independently re-verify with Flutterwave API (never trust raw webhook payload alone)
      const verifyRes = await verifyTransactionWithFlutterwaveApi({
        transactionId: txId || null,
        txRef: txRef || order.tx_ref,
        secretKey,
      });

      if (!verifyRes.ok || !verifyRes.data) {
        return res.status(200).json({ received: true, status: 'verification_deferred' });
      }

      const flwData = verifyRes.data;
      const flwStatus = String(flwData.status || '').toLowerCase();
      const flwCurrency = String(flwData.currency || '').toUpperCase();
      const flwAmount = Number(flwData.amount || 0);
      const flwTxRef = String(flwData.tx_ref || txRef || order.tx_ref);
      const knownTxRefs = new Set([order.tx_ref, ...(order.payment_history || []).map((h) => h.tx_ref)]);

      const nowIso = new Date().toISOString();
      order.flw_transaction_id = flwData.id ? String(flwData.id) : txId || order.flw_transaction_id;
      order.flw_ref = flwData.flw_ref ? String(flwData.flw_ref) : order.flw_ref;
      order.flw_processor_response = String(flwData.processor_response || flwStatus);
      order.updated_at = nowIso;

      if (
        (flwStatus === 'successful' || flwStatus === 'completed') &&
        knownTxRefs.has(flwTxRef) &&
        flwCurrency === 'NGN' &&
        flwAmount >= order.total_amount_ngn
      ) {
        order.payment_status = 'successful';
        order.fulfillment_status = 'paid_awaiting_design_proof';
        order.verified_at = nowIso;
        order.tx_ref = flwTxRef;
        order.payment_history = (order.payment_history || []).map((h) =>
          h.tx_ref === flwTxRef ? { ...h, status: 'successful', flw_transaction_id: order.flw_transaction_id } : h
        );
        await persistOrder(order, deps);
        await syncVerifiedOrderToLegacyTablesAndNotify(order, flwTxRef, deps);
        return res.status(200).json({ received: true, status: 'successful', order_number: order.order_number });
      }

      if (flwStatus === 'pending') {
        order.payment_status = 'under_verification';
      } else if (flwStatus === 'cancelled') {
        order.payment_status = 'cancelled';
      } else {
        order.payment_status = 'failed';
      }
      await persistOrder(order, deps);
      return res.status(200).json({ received: true, status: order.payment_status, order_number: order.order_number });
    } catch (err: any) {
      console.error('[FlutterwaveService] webhook error:', err);
      return res.status(500).json({ success: false, error: 'Webhook processing error.' });
    }
  });

  // 8. Hardened legacy inline verification routes (for homepage/corporate modals — NO hardcoded secrets, NO fake verification!)
  const handleLegacyInlineVerify = async (req: Request, res: Response) => {
    try {
      const reference = String(req.params.reference || req.params.tx_ref || req.params.id || '').trim();
      if (!reference) {
        return res.status(400).json({ success: false, verified: false, error: 'Missing transaction reference.' });
      }
      const secretKey = getFlwSecretKey();
      if (!secretKey) {
        return res.status(503).json({
          success: false,
          verified: false,
          error: 'Flutterwave server verification key (FLW_SECRET_KEY) is not configured.',
        });
      }

      const isNumericId = /^\d+$/.test(reference);
      const verifyRes = await verifyTransactionWithFlutterwaveApi({
        transactionId: isNumericId ? reference : null,
        txRef: isNumericId ? null : reference,
        secretKey,
      });

      if (!verifyRes.ok || !verifyRes.data) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: verifyRes.error || 'Could not verify transaction with Flutterwave.',
        });
      }

      const flwData = verifyRes.data;
      const flwStatus = String(flwData.status || '').toLowerCase();
      if (flwStatus !== 'successful' && flwStatus !== 'completed') {
        return res.status(400).json({
          success: false,
          verified: false,
          payment_status: flwStatus === 'pending' ? 'under_verification' : flwStatus,
          error: `Transaction status is "${flwStatus}" and has not settled.`,
        });
      }

      const orderPayload = req.body || {};
      const paidCurrency = String(flwData.currency || orderPayload.currency || 'NGN').toUpperCase();
      const paidAmount = Number(flwData.amount || 0);
      const amountInNaira =
        paidCurrency === 'NGN' ? Math.round(paidAmount) : Math.round(Number(orderPayload.amount_ngn || paidAmount));
      const email = String(flwData.customer?.email || orderPayload.email || '').trim();
      const name = String(flwData.meta?.name || flwData.customer?.name || orderPayload.name || 'Customer').trim();
      const cardType = String(flwData.meta?.card_tier || orderPayload.card_type || 'CHIPNG Smart NFC Card').trim();
      const phone = String(flwData.meta?.phone || flwData.customer?.phone_number || orderPayload.phone || '').trim();
      const txRefFinal = String(flwData.tx_ref || reference);

      // Idempotent record sync
      if (deps.db) {
        try {
          const existing = deps.db
            .prepare('SELECT id FROM nfc_sales WHERE payment_reference = ?')
            .get(txRefFinal);
          if (!existing) {
            deps.db
              .prepare(
                'INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)'
              )
              .run(name, email, phone, cardType, amountInNaira, txRefFinal);
          }
        } catch {}
      }
      try {
        const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();
        const { data: existingP } = await sb.from('purchases').select('id').eq('reference', txRefFinal).maybeSingle();
        if (!existingP) {
          await sb.from('purchases').insert([
            {
              buyer_email: email,
              amount: amountInNaira,
              platform_fee: 0,
              net_earnings: amountInNaira,
              reference: txRefFinal,
              status: 'completed',
              purchase_type: 'nfc_card',
            },
          ]);
        }
      } catch {}

      return res.json({
        success: true,
        verified: true,
        reference: txRefFinal,
        amount: paidAmount,
        currency: paidCurrency,
        message: 'Payment confirmed and verified with Flutterwave.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, verified: false, error: err?.message || 'Verification failed.' });
    }
  };

  app.post('/api/flutterwave/verify/:id', handleLegacyInlineVerify);
  app.post('/api/flutterwave/verify-ref/:tx_ref', handleLegacyInlineVerify);

  // 9. Consent-gated incomplete checkout save & opt-out (Phase 6 abandoned checkout recovery)
  app.post('/api/funnel/save-incomplete', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      if (!body.consent) {
        return res.json({ success: true, saved: false, reason: 'No reminder consent granted.' });
      }
      const email = String(body.email || '').trim().toLowerCase();
      const whatsapp = String(body.phone || body.whatsapp || '').trim();
      const name = String(body.name || '').trim();
      if (!email && !whatsapp) {
        return res.status(400).json({ success: false, error: 'Email or phone required to save incomplete checkout.' });
      }

      const dedupKey = email || whatsapp;
      const existingMem = memoryIncompleteLeads.get(dedupKey);
      if (existingMem?.opted_out) {
        return res.json({ success: true, saved: false, reason: 'User opted out of checkout reminders.' });
      }

      const nowIso = new Date().toISOString();
      const record = {
        name: name || 'Prospective Customer',
        email: email || null,
        whatsapp: whatsapp || null,
        card_type: String(body.product_name || body.card_type || 'NFC Card').slice(0, 140),
        custom_name: String(body.preferred_card_name || '').slice(0, 120) || null,
        funnel_stage: String(body.funnel_stage || 'checkout_abandoned').slice(0, 60),
        estimated_amount: Number(body.estimated_amount || 0),
        consent_granted: true,
        opted_out: false,
        updated_at: nowIso,
      };
      memoryIncompleteLeads.set(dedupKey, record);

      try {
        const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();
        const matchCol = email ? 'email' : 'whatsapp';
        const matchVal = email || whatsapp;
        const { data: existingLead } = await sb
          .from('card_funnel_leads')
          .select('id, opted_out, funnel_stage')
          .eq(matchCol, matchVal)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingLead?.opted_out || existingLead?.funnel_stage === 'converted') {
          return res.json({ success: true, saved: false, reason: 'Lead opted out or already converted.' });
        }

        if (existingLead?.id) {
          await sb.from('card_funnel_leads').update(record).eq('id', existingLead.id);
        } else {
          await sb.from('card_funnel_leads').insert([record]);
        }
      } catch {
        // Non-blocking if migration hasn't run yet
      }

      return res.json({ success: true, saved: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to save checkout progress.' });
    }
  });

  app.post('/api/funnel/opt-out', async (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const phone = String(req.body?.phone || req.body?.whatsapp || '').trim();
      if (!email && !phone) {
        return res.status(400).json({ success: false, error: 'Email or phone is required to opt out.' });
      }
      if (email) memoryIncompleteLeads.set(email, { opted_out: true });
      if (phone) memoryIncompleteLeads.set(phone, { opted_out: true });
      try {
        const sb = deps.getAdminSupabase ? deps.getAdminSupabase() : deps.getSupabase();
        if (email) await sb.from('card_funnel_leads').update({ opted_out: true }).eq('email', email);
        if (phone) await sb.from('card_funnel_leads').update({ opted_out: true }).eq('whatsapp', phone);
      } catch {}
      return res.json({ success: true, opted_out: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Opt-out failed.' });
    }
  });

  // 10. Unified Admin Sales & Orders feed (works on BOTH Vercel & local Node, preserving historical records)
  app.get('/api/sales', async (req: Request, res: Response) => {
    try {
      const recordsByRef = new Map<string, any>();

      // A. Pull structured `nfc_orders` from Supabase
      try {
        const sb = deps.getAdminSupabase ? deps.getAdminSupabase(req) : deps.getSupabase();
        const { data: orders } = await sb
          .from('nfc_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (Array.isArray(orders)) {
          for (const o of orders) {
            const ref = String(o.tx_ref || o.order_number);
            recordsByRef.set(ref, {
              id: o.id || o.order_number,
              order_number: o.order_number,
              name: o.customer_name,
              business_name: o.business_name || '',
              email: o.customer_email,
              phone: o.customer_phone,
              card_type: `${o.product_name}${Number(o.quantity) > 1 ? ` × ${o.quantity}` : ''}`,
              amount: Number(o.total_amount_ngn || 0),
              payment_reference: ref,
              payment_status: o.payment_status || 'pending',
              fulfillment_status: o.fulfillment_status || 'awaiting_payment',
              payment_gateway: o.payment_gateway || 'flutterwave',
              delivery_state: o.delivery_state || '',
              delivery_address: o.delivery_address || '',
              logo_url: o.logo_url || null,
              created_at: o.created_at,
            });
          }
        }
      } catch {}

      // B. Pull local SQLite `nfc_orders` & `nfc_sales` (preserves historical local records)
      if (deps.db) {
        try {
          ensureLocalSqliteOrderTable(deps.db);
          const localOrders = deps.db.prepare('SELECT * FROM nfc_orders ORDER BY created_at DESC LIMIT 200').all();
          for (const o of localOrders) {
            const ref = String(o.tx_ref || o.order_number);
            if (!recordsByRef.has(ref)) {
              recordsByRef.set(ref, {
                id: o.order_number,
                order_number: o.order_number,
                name: o.customer_name,
                business_name: o.business_name || '',
                email: o.customer_email,
                phone: o.customer_phone,
                card_type: `${o.product_name}${Number(o.quantity) > 1 ? ` × ${o.quantity}` : ''}`,
                amount: Number(o.total_amount_ngn || 0),
                payment_reference: ref,
                payment_status: o.payment_status || 'pending',
                fulfillment_status: o.fulfillment_status || 'awaiting_payment',
                payment_gateway: o.payment_gateway || 'flutterwave',
                delivery_state: o.delivery_state || '',
                delivery_address: o.delivery_address || '',
                logo_url: o.logo_url || null,
                created_at: o.created_at,
              });
            }
          }
        } catch {}

        try {
          const legacySales = deps.db.prepare('SELECT * FROM nfc_sales ORDER BY created_at DESC LIMIT 200').all();
          for (const s of legacySales) {
            const ref = String(s.payment_reference || `LEGACY-${s.id}`);
            if (!recordsByRef.has(ref)) {
              recordsByRef.set(ref, {
                id: `legacy-sale-${s.id}`,
                order_number: null,
                name: s.name,
                email: s.email,
                phone: s.phone,
                card_type: s.card_type,
                amount: Number(s.amount || 0),
                payment_reference: ref,
                payment_status: 'successful',
                fulfillment_status: 'confirmed',
                payment_gateway: ref.toLowerCase().includes('flw') || ref.startsWith('CHIP-') ? 'flutterwave' : 'historical',
                created_at: s.created_at,
              });
            }
          }
        } catch {}
      }

      // C. Pull historical Supabase `purchases` (preserves historical Paystack & Flutterwave records)
      try {
        const sb = deps.getAdminSupabase ? deps.getAdminSupabase(req) : deps.getSupabase();
        const { data: purchases } = await sb
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (Array.isArray(purchases)) {
          for (const p of purchases) {
            const ref = String(p.reference || `PURCHASE-${p.id}`);
            if (!recordsByRef.has(ref)) {
              recordsByRef.set(ref, {
                id: `purchase-${p.id}`,
                order_number: null,
                name: p.buyer_email?.split('@')[0] || 'CHIPNG Customer',
                email: p.buyer_email || '',
                phone: '',
                card_type: p.purchase_type === 'nfc_card' ? 'NFC Smart Card' : p.purchase_type || 'Hardware Order',
                amount: Number(p.amount || 0),
                payment_reference: ref,
                payment_status: p.status === 'completed' ? 'successful' : p.status || 'successful',
                fulfillment_status: 'confirmed',
                payment_gateway: ref.startsWith('CHIP-') || ref.toLowerCase().includes('flw') ? 'flutterwave' : 'historical',
                created_at: p.created_at,
              });
            }
          }
        }
      } catch {}

      // D. Include process-local orders if not already present
      for (const o of memoryOrdersByNumber.values()) {
        const ref = o.tx_ref || o.order_number;
        if (!recordsByRef.has(ref)) {
          recordsByRef.set(ref, {
            id: o.order_number,
            order_number: o.order_number,
            name: o.customer_name,
            business_name: o.business_name || '',
            email: o.customer_email,
            phone: o.customer_phone,
            card_type: `${o.product_name}${o.quantity > 1 ? ` × ${o.quantity}` : ''}`,
            amount: o.total_amount_ngn,
            payment_reference: ref,
            payment_status: o.payment_status,
            fulfillment_status: o.fulfillment_status,
            payment_gateway: o.payment_gateway,
            delivery_state: o.delivery_state,
            delivery_address: o.delivery_address,
            logo_url: o.logo_url || null,
            created_at: o.created_at,
          });
        }
      }

      const sales = Array.from(recordsByRef.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      return res.json({ sales });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to load sales records.' });
    }
  });
}
