import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "../../components/layout/main-layout"

export const metadata = {
  title: "Coffee Subscriptions | Morning Voyage",
  description: "Subscribe to premium coffee delivered to your doorstep on your schedule.",
}

const subscriptionPlans = [
  {
    id: "weekly",
    name: "Weekly",
    price: 19.99,
    description: "Perfect for daily coffee drinkers",
    features: [
      "Fresh coffee delivered weekly",
      "Free shipping",
      "Exclusive access to limited releases",
      "Customizable coffee selection",
      "Skip or pause anytime",
    ],
    popular: false,
  },
  {
    id: "biweekly",
    name: "Bi-Weekly",
    price: 24.99,
    description: "Our most popular plan",
    features: [
      "Fresh coffee delivered every two weeks",
      "Free shipping",
      "Exclusive access to limited releases",
      "Customizable coffee selection",
      "Skip or pause anytime",
      "10% discount on equipment",
    ],
    popular: true,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 29.99,
    description: "Great for occasional coffee drinkers",
    features: [
      "Fresh coffee delivered monthly",
      "Free shipping",
      "Exclusive access to limited releases",
      "Customizable coffee selection",
      "Skip or pause anytime",
      "15% discount on all products",
    ],
    popular: false,
  },
]

export default function SubscriptionsPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center bg-coffee-dark">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/subscription-hero.jpg"
            alt="Coffee subscription"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-bold text-cream sm:text-5xl">Never Run Out of Coffee Again</h1>
            <p className="mt-6 text-xl text-cream/90">
              Subscribe to your favorite blends and save. Customize your delivery schedule and enjoy fresh coffee at
              your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-coffee-dark">How It Works</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coffee-dark text-2xl font-bold text-cream">
                1
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-coffee-dark">Choose Your Plan</h3>
              <p className="mt-2 text-gray-600">Select a delivery frequency that works for your coffee consumption.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coffee-dark text-2xl font-bold text-cream">
                2
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-coffee-dark">Customize Your Coffee</h3>
              <p className="mt-2 text-gray-600">Choose your favorite blends, roast levels, and grind options.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-coffee-dark text-2xl font-bold text-cream">
                3
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-coffee-dark">Enjoy Fresh Coffee</h3>
              <p className="mt-2 text-gray-600">Receive freshly roasted coffee delivered right to your door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-coffee-dark">Choose Your Plan</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border ${
                  plan.popular ? "border-gold shadow-lg" : "border-gray-200"
                } bg-white p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-sm font-bold text-coffee-dark">
                    Most Popular
                  </div>
                )}
                <h3 className="font-serif text-2xl font-bold text-coffee-dark">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold text-coffee-dark">${plan.price}</span>
                  <span className="ml-1 text-gray-500">/delivery</span>
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-gold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-8 w-full ${plan.popular ? "bg-gold text-coffee-dark hover:bg-gold/90" : ""}`}
                >
                  <Link href={`/subscriptions/${plan.id}`}>Select Plan</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-coffee-dark">What Our Subscribers Say</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src="/images/avatar-1.jpg" alt="Customer" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-coffee-dark">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500">Weekly Subscriber</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "I've been a subscriber for over a year now, and I can't imagine going back to store-bought coffee. The
                beans are always fresh, and I love trying new varieties each week."
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src="/images/avatar-2.jpg" alt="Customer" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-coffee-dark">Michael Chen</h3>
                  <p className="text-sm text-gray-500">Bi-Weekly Subscriber</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The bi-weekly subscription is perfect for my household. The ability to customize my coffee selection
                and delivery schedule has made this service invaluable to my morning routine."
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src="/images/avatar-3.jpg" alt="Customer" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-coffee-dark">Emma Davis</h3>
                  <p className="text-sm text-gray-500">Monthly Subscriber</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                "The monthly subscription is a game-changer for me. I love the convenience of having fresh coffee
                delivered, and the quality is consistently excellent. The discounts on other products are a great bonus
                too!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-bold text-coffee-dark">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto max-w-3xl divide-y divide-gray-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-coffee-dark">Can I change my delivery schedule?</h3>
              <p className="mt-2 text-gray-600">
                Yes, you can easily adjust your delivery schedule, pause, or skip deliveries through your account
                dashboard.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-lg font-medium text-coffee-dark">How fresh is the coffee?</h3>
              <p className="mt-2 text-gray-600">
                All coffee is roasted to order and shipped within 24-48 hours of roasting to ensure maximum freshness.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-lg font-medium text-coffee-dark">Can I change my coffee selection?</h3>
              <p className="mt-2 text-gray-600">
                You can customize your coffee selection for each delivery through your account dashboard.
              </p>
            </div>
            <div className="py-6">
              <h3 className="text-lg font-medium text-coffee-dark">Is shipping included?</h3>
              <p className="mt-2 text-gray-600">Yes, all subscription plans include free shipping.</p>
            </div>
            <div className="py-6">
              <h3 className="text-lg font-medium text-coffee-dark">Can I cancel my subscription?</h3>
              <p className="mt-2 text-gray-600">
                Yes, you can cancel your subscription at any time without any cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coffee-dark py-16 text-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">Ready to Start Your Coffee Journey?</h2>
            <p className="mt-4 text-lg text-cream/90">
              Join thousands of coffee lovers who have already discovered the perfect morning ritual.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gold text-coffee-dark hover:bg-gold/90">
              <Link href="/subscriptions/biweekly">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
