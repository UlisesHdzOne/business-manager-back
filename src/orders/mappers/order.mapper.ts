import { Order, OrderItem } from '@prisma/client';

export const mapOrder = (order: Order & { items: OrderItem[] }) => ({
  ...order,
  total: order.total.toString(),
  items: order.items.map((item) => ({
    ...item,
    price: item.price.toString(),
  })),
});

export const mapOrders = (orders: (Order & { items: OrderItem[] })[]) => {
  return orders.map(mapOrder);
};
