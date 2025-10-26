import { Building2, Target, Users, Sparkles, TrendingUp, Shield, Heart } from 'lucide-react';

export default function About() {
  const stats = [
    { value: '10,000+', label: 'Verified Properties' },
    { value: '2,500+', label: 'Trusted Agents' },
    { value: '50+', label: 'Cities Covered' },
    { value: '95%', label: 'Customer Satisfaction' },
  ];

  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Trust & Transparency',
      description: 'Every property verified with RERA compliance and fraud detection. No hidden costs, complete transparency.',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI for accurate valuations, lead scoring, and personalized recommendations.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Dedicated support, fair commissions, and tools that empower both buyers and agents.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About India Property Ads</h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
            Revolutionizing real estate in India with AI-powered intelligence and transparent pricing
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-8 w-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To make real estate transactions in India transparent, efficient, and accessible to everyone through cutting-edge AI technology and honest practices.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe every property buyer, seller, and agent deserves fair pricing, accurate information, and a platform that puts their interests first. Our AI-driven approach eliminates guesswork and brings data-backed decisions to Indian real estate.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Modern office"
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Powered by AzentiqAI</h3>
              <p className="text-gray-700">
                Strategic innovation partner providing AI/ML expertise, data intelligence, and growth strategy for India's real estate future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">Principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 hover:shadow-xl transition">
                <div className="text-primary-600 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">What sets us apart from other platforms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">AI Property Valuation</h4>
                <p className="text-gray-700">Get accurate property prices using our advanced AI engine trained on 500,000+ transactions.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">100% Verified Listings</h4>
                <p className="text-gray-700">Every property verified with RERA compliance and our proprietary fraud detection system.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Smart Lead Scoring</h4>
                <p className="text-gray-700">AI-powered lead prioritization helps agents focus on high-conversion opportunities.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Agent Support</h4>
                <p className="text-gray-700">Comprehensive tools, analytics, and commission tracking for agent success.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of buyers, sellers, and agents who trust India Property Ads
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Create Free Account
            </a>
            <a
              href="/properties"
              className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition text-lg border-2 border-white"
            >
              Browse Properties
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
