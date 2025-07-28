import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Target, Users, Compass, Award, Package, Rocket } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"

const teamMembers = [
  {
    name: "Treavon",
    role: "Founder & CEO",
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "The brain behind the brew. Treavon took a love for great coffee and turned it into a brand with a fresh kick. From taste-testing every roast to sweating the small stuff (like how the box opens), they’re the reason your mornings are a little less chaotic and a lot more caffeinated.",
    favoriteBrew: "Medium roast with oat milk — smooth, bold, and slightly over-caffeinated.",
    morningMood: "Somewhere between “let’s crush it” and “where’s my mug?”",
    quote: "“Built this brand like I build my coffee — strong, hot, and slightly chaotic.”",
  },
  {
    name: "Barr",
    role: "Co-Owner & Head of Technology",
    avatar: "/placeholder.svg?height=128&width=128",
    bio: "The wizard behind the screen. Barr handles all things back end and front end — from keeping our website running smoothly to integrating subscription systems and optimizing your shopping experience. Basically, if it runs like clockwork, thank them.",
    favoriteBrew: "Iced espresso, hold the nonsense.",
    morningMood: "Caffeine first, code second.",
    quote: "“If it’s digital, I’m behind it.”",
  },
]

const principles = [
  {
    icon: Rocket,
    title: "Freshly Roasted, Always",
    description: "Your coffee is never pre-packed or warehouse-aged. We roast when you order.",
  },
  {
    icon: Award,
    title: "Quality in Every Detail",
    description: "From sourcing to roast level, every decision is made with flavor in mind.",
  },
  {
    icon: Coffee,
    title: "Crafted for Clarity",
    description: "Smooth, rich, and clean-tasting blends that help you start clear and stay focused.",
  },
  {
    icon: Package,
    title: "Built for Your Routine",
    description: "Whether it’s 5 AM hustle or slow Sunday mornings, our coffee fits your flow.",
  },
]

export default function AboutUsPage() {
  return (
    <div className="bg-[#F6F1EB] text-[#4B2E2E]">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center bg-white/30 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-black text-[#4B2E2E] mb-4 tracking-tight">
              The People Behind the Pour.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#6E6658]">
              We're a small team with a big mission: to make exceptional coffee an everyday ritual.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] flex items-center justify-center gap-3">
                <Users className="w-8 h-8 text-[#9E7C83]" />
                Meet the Team Behind the Brew
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {teamMembers.map((member) => (
                <Card
                  key={member.name}
                  className="bg-white/50 backdrop-blur-lg border-white/20 shadow-lg overflow-hidden text-center"
                >
                  <CardContent className="p-8">
                    <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-white shadow-xl">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-bold text-[#4B2E2E]">{member.name}</h3>
                    <p className="text-[#9E7C83] font-medium mb-4">{member.role}</p>
                    <p className="text-[#6E6658] text-balance mb-6">{member.bio}</p>
                    <p className="text-sm text-[#6E6658] italic border-t border-black/10 pt-4 mt-4">{member.quote}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Exist Section */}
        <section className="py-20 md:py-24 bg-white/30 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-[#9E7C83]" />
                  Why We Exist
                </h2>
                <div className="space-y-4 text-lg text-[#6E6658] text-balance">
                  <p>
                    Morning Voyage Coffee was created because we were tired of the ordinary. Coffee that sat on shelves
                    too long. Brews that felt more like routine than ritual.
                  </p>
                  <p>
                    So we decided to do it differently — with a relentless focus on freshness, quality, and consistency.
                  </p>
                  <p>
                    Our beans are roasted to order in small batches, giving you a cup that’s full of life, not
                    leftovers. Because the right coffee doesn’t just wake you up — <strong>it elevates you.</strong>
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="Freshly roasted coffee beans"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What We're All About Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E]">What We’re All About</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {principles.map((principle) => (
                <Card key={principle.title} className="bg-white/50 backdrop-blur-lg border-white/20 shadow-lg p-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D5BFA3] to-[#9E7C83] mb-6 shadow-inner">
                    <principle.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#4B2E2E] mb-2">{principle.title}</h3>
                  <p className="text-[#6E6658]">{principle.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* The Voyage Ahead Section */}
        <section className="py-20 md:py-24 bg-white/30 backdrop-blur-md">
          <div className="container mx-auto px-4 text-center">
            <Compass className="w-12 h-12 text-[#9E7C83] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] mb-6">🧭 The Voyage Ahead</h2>
            <div className="max-w-3xl mx-auto text-lg text-[#6E6658] space-y-4 text-balance">
              <p>
                Morning Voyage Coffee is more than a brand — it’s a mindset. We’re building something lasting: a daily
                ritual rooted in quality, intention, and care.
              </p>
              <p>
                As we grow, so will our lineup of roasts, offerings, and ways to support your routine — but one thing
                stays the same: <strong>We never compromise on the coffee.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#4B2E2E] mb-4">Take Off With Us</h2>
            <p className="text-lg text-[#6E6658] mb-8">
              Start strong. Stay steady.
              <br />
              Your voyage begins here — one fresh cup at a time.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#4B2E2E] via-[#6E6658] to-[#9E7C83] hover:from-[#6E6658] hover:via-[#9E7C83] hover:to-[#4B2E2E] text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
            >
              <Link href="/coffee">Shop All Coffee</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
