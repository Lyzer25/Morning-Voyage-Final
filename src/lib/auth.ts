import type { User } from "@/types/user"

// Mock JWT token handling
const TOKEN_KEY = "auth_token"

// Mock user data for development
const MOCK_USER: User = {
  id: "user_1",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  address: {
    street: "123 Coffee St",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "USA",
  },
  orders: [
    {
      id: "order_1",
      date: "2023-05-15",
      status: "delivered",
      items: [
        {
          productId: "prod_1",
          name: "Ethiopian Yirgacheffe",
          quantity: 2,
          price: 18.99,
          options: {
            grind: "Whole Bean",
            size: "12oz",
          },
        },
      ],
      total: 37.98,
      shippingAddress: {
        street: "123 Coffee St",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        country: "USA",
      },
      paymentMethod: "Credit Card",
    },
  ],
  subscriptions: [
    {
      id: "sub_1",
      plan: "biweekly",
      products: [
        {
          productId: "prod_1",
          quantity: 1,
          options: {
            grind: "Whole Bean",
            size: "12oz",
          },
        },
      ],
      nextDeliveryDate: "2023-06-01",
      status: "active",
      startDate: "2023-01-15",
      billingAddress: {
        street: "123 Coffee St",
        city: "Seattle",
        state: "WA",
        postalCode: "98101",
        country: "USA",
      },
      paymentMethod: "Credit Card",
    },
  ],
}

// In a real app, these functions would make API calls to your backend
export async function loginUser(email: string, password: string): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock validation
  if (email !== "user@example.com" || password !== "password") {
    throw new Error("Invalid email or password")
  }

  // Store token in localStorage
  localStorage.setItem(TOKEN_KEY, "mock_jwt_token")

  return MOCK_USER
}

export async function registerUser(userData: Omit<User, "id">): Promise<User> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock validation
  if (!userData.email || !userData.firstName || !userData.lastName) {
    throw new Error("Missing required fields")
  }

  // Store token in localStorage
  localStorage.setItem(TOKEN_KEY, "mock_jwt_token")

  // Return mock user with provided data
  return {
    ...MOCK_USER,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
  }
}

export async function logoutUser(): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Remove token from localStorage
  localStorage.removeItem(TOKEN_KEY)
}

export async function getCurrentUser(): Promise<User | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if token exists
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    return null
  }

  // In a real app, you would validate the token with your backend
  return MOCK_USER
}
