export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  original_price_cents: number;
  stock: number;
  image: string;
}

export interface Campaign {
  name: string;
  ends_at: string;
  currency: string;
}

export interface Catalog {
  items: Product[];
  campaign: Campaign;
}

export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type BillingStatus = 'pending' | 'issued' | 'failed';

export interface BillingState {
  status: BillingStatus;
  invoice_id: string | null;
  attempts: number;
  invoice: Invoice | null;
}

export interface Invoice {
  id: string;
  issuer_id: string;
  order_id: string;
  currency: 'PEN';
  items: OrderLine[];
  total_cents: number;
  status: 'issued';
  created_at: string;
}

export interface OrderLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
}

export interface Order {
  id: string;
  status: 'confirmed';
  notification_status: NotificationStatus;
  items: OrderLine[];
  total_cents: number;
  created_at: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface OrderRequestBody {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}
