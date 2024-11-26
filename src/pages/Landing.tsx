
import { Link } from 'react-router-dom';
import { 
  Microscope, 
  Code, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Shield,
  Users,
  LineChart
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms provide accurate skin analysis in seconds'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'All analysis is performed client-side with no data storage or sharing'
  },
  {
    icon: Code,
    title: 'Easy Integration',
    description: 'Simple embed code that works seamlessly with any website platform'
  },
  {
    icon: Users,
    title: 'Lead Generation',
    description: 'Convert visitors into leads with our integrated contact system'
  },
  {
    icon: LineChart,
    title: 'Analytics Dashboard',
    description: 'Track user engagement and conversion metrics in real-time'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and security measures to protect your data'
  }
];

const testimonials = [
  {
    quote: "FaceSkinAnalysis has transformed our consultation process. We've seen a 300% increase in qualified leads.",
    author: "Dr. Sarah Chen",
    role: "Dermatologist",
    company: "Clear Skin Clinic",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop"
  },
  {
    quote: "The accuracy of the skin analysis is impressive. Our customers love the personalized recommendations.",
    author: "Michael Roberts",
    role: "CEO",
    company: "BeautyTech Solutions",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
  },
  {
    quote: "Integration was seamless, and the support team was incredibly helpful throughout the process.",
    author: "Emma Thompson",
    role: "Technical Director",
    company: "Glow Skincare",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop"
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">FaceSkinAnalysis</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-50" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
              Get More Leads and Sales by Embedding AI Skin Analysis in Your Website
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay-1">
              Enhance your beauty or skincare business with our powerful AI-powered skin analysis widget
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-delay-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-500 transition-colors"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors border border-gray-200"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive features to power your skincare business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Industry Leaders
              </h2>
              <p className="text-lg text-gray-600">
                See what our customers have to say about FaceSkinAnalysis
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-600 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Transform Your Business with AI
                </h2>
                <div className="space-y-4">
                  {[
                    'Increase customer engagement with interactive analysis',
                    'Generate qualified leads automatically',
                    'Provide personalized skincare recommendations',
                    'Build trust with data-driven insights',
                    'Scale your consultations efficiently'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&h=600&fit=crop"
                  alt="Skin analysis demonstration"
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join businesses already using FaceSkinAnalysis to provide personalized skincare recommendations
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-blue-50 transition-colors"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-white mb-4">
                <Microscope className="w-6 h-6" />
                <span className="font-semibold">FaceSkinAnalysis</span>
              </div>
              <p className="text-sm">
                Revolutionizing skincare with artificial intelligence
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://twitter.com/skinai" className="hover:text-white">Twitter</a></li>
                <li><a href="https://linkedin.com/company/skinai" className="hover:text-white">LinkedIn</a></li>
                <li><a href="https://github.com/skinai" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} FaceSkinAnalysis. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}