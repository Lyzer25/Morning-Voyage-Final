import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Coffee Enthusiast",
    location: "New York, NY",
    content:
      "The difference in freshness is incredible! I can actually taste the difference when coffee is roasted to order. Morning Voyage has ruined all other coffee for me.",
    rating: 5,
    avatar: "SJ",
    gradient: "from-[#4B2E2E] to-[#6E6658]",
  },
  {
    name: "Michael Chen",
    role: "Fashion Blogger",
    location: "Los Angeles, CA",
    content:
      "Love the quality of both their coffee and fashion line. The hoodie I bought is incredibly soft and the coffee keeps me energized for my morning shoots.",
    rating: 5,
    avatar: "MC",
    gradient: "from-[#9E7C83] to-[#6E6658]",
  },
  {
    name: "Emma Rodriguez",
    role: "Subscription Customer",
    location: "Austin, TX",
    content:
      "The subscription service is perfect for my busy lifestyle. Fresh coffee delivered right to my door, and I never have to worry about running out.",
    rating: 5,
    avatar: "ER",
    gradient: "from-[#D5BFA3] to-[#9E7C83]",
  },
]

export default function Testimonials() {
  return (
    <section className="py-32 bg-gradient-to-b from-white via-[#F6F1EB]/20 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg mb-6">
            <div className="w-2 h-2 bg-[#D5BFA3] rounded-full animate-pulse"></div>
            <span className="text-[#4B2E2E] text-sm font-semibold tracking-wide">TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#4B2E2E] mb-6 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xl text-[#6E6658] max-w-3xl mx-auto font-light leading-relaxed">
            Don't just take our word for it. Here's what coffee lovers and fashion enthusiasts are saying about Morning
            Voyage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/70 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden"
            >
              <CardContent className="p-8 relative">
                {/* Background Gradient on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-lg`}
                ></div>

                <div className="relative z-10">
                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#D5BFA3] text-[#D5BFA3]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-8">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#D5BFA3] opacity-50" />
                    <p className="text-[#6E6658] leading-relaxed pl-6 font-light text-lg">"{testimonial.content}"</p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#4B2E2E] text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-[#9E7C83] font-medium">{testimonial.role}</p>
                      <p className="text-xs text-[#6E6658] font-light">{testimonial.location}</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D5BFA3]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
