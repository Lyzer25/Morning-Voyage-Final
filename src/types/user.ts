export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  address?: Address
  orders?: Order[]
  subscriptions?: Subscription[]
}

export interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total: number
  shippingAddress: Address
  paymentMethod: string
}

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  options?: {
    [key: string]: string
  }
}

export interface Subscription {
  id: string
  plan: "weekly" | "biweekly" | "monthly"
  products: SubscriptionProduct[]
  nextDeliveryDate: string
  status: "active" | "paused" | "cancelled"
  startDate: string
  billingAddress: Address
  paymentMethod: string
}

export interface SubscriptionProduct {
  productId: string
  quantity: number
  options?: {
    [key: string]: string
  }
}
