/**
 * Author: Domonick Mack
 * Date: 2026-11-05
 * Description: Shared sneaker inventory domain types mirroring the Fastify API contract.
 */

export const SNEAKER_CONDITIONS = ['DS', 'VNDS', 'Used', 'Beater'] as const;
export const SNEAKER_STATUSES = ['in_stock', 'reserved', 'sold'] as const;
export const BOX_CONDITIONS = ['OG All', 'OG Box (Damaged)', 'Replacement Box', 'No Box'] as const;

export type SneakerCondition = (typeof SNEAKER_CONDITIONS)[number];
export type SneakerStatus = (typeof SNEAKER_STATUSES)[number];
export type BoxCondition = (typeof BOX_CONDITIONS)[number];

/** Human-readable labels for inventory statuses. */
export const STATUS_LABELS: Record<SneakerStatus, string> = {
  in_stock: 'In Stock',
  reserved: 'Reserved',
  sold: 'Sold',
};

/** Editable fields sent to the API when creating or updating a pair. */
export interface SneakerInput {
  brand: string;
  model: string;
  colorway: string;
  sku: string;
  size: string;
  condition: SneakerCondition;
  status: SneakerStatus;
  purchasePrice: number;
  marketValue: number;
  purchaseDate: string | null;
  boxCondition: BoxCondition;
  storageLocation: string;
  notes: string;
  imageData: string | null;
}

/** Full sneaker record returned by the API. */
export interface Sneaker extends SneakerInput {
  id: string;
  qrCodeData: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMetrics {
  totalValuation: number;
  totalPairs: number;
  totalCost: number;
  inStockValue: number;
  inStockCount: number;
  reservedValue: number;
  reservedCount: number;
}

export interface InventoryResponse {
  sneakers: Sneaker[];
  metrics: InventoryMetrics;
}
