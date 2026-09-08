export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const discountPercent = (price: number, mrp?: number) =>
  mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
