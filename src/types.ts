export type DespatchAdviceRequest = {
  orderId: string;
  supplierPartyId: string;
  deliveryPartyId: string;
  despatchDate: string;
  items: DespatchItem[];
};

export type DespatchItem = {
  productId: string;
  quantity: number;
};
