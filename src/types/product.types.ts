export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: number;
  /** URL segment after id; from DB when present */
  slug?: string;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
};
