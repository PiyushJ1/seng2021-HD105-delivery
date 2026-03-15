export type DespatchAdviceRequest = {
  orderId: string;
  supplierPartyId: string;
  deliveryPartyId: string;
  despatchDate: string;
  items: DespatchItem[];
};

export type DespatchAdvice = {
  despatchAdviceId: string;
  orderId: string;
  supplierPartyId: string;
  deliveryPartyId: string;
  despatchDate: string;
  status: string;
  items: DespatchItem[];
};

export type DespatchItem = {
  productId: string;
  quantity: number;
};

export type ReceiptItem = {
  productId: string;
  quantityReceived: number;
};
