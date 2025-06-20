import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import EventAccessModal from "@/components/EventAccessModal";
import { Zap, Shield, Target, ArrowDown } from "lucide-react";

export default function Events() {
  const [showEventModal, setShowEventModal] = useState(false);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-black dark:text-white">Scan Your Face,</span>
              <br />
              <span className="text-blue-600">Get Your Photos Instantly</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Fast, secure, and accurate photo retrieval using Google Cloud Vision. 
              Find yourself in event photos with just a selfie upload.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowEventModal(true)}
                className="px-8 py-4 text-lg font-semibold"
              >
                <Target className="h-5 w-5 mr-2" />
                Find My Photos
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToAbout}
                className="px-8 py-4 text-lg font-semibold border-2"
              >
                Learn More
                <ArrowDown className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced facial recognition technology delivers results in seconds
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and never shared. Privacy is our priority
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Highly Accurate</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Google Cloud Vision API ensures precise face matching
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">How FaceSnapVault Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our advanced facial recognition technology makes finding your event photos effortless and secure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Selfie</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take a clear selfie or upload a photo from your device. Our system will analyze your facial features securely.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Facial Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Google Cloud Vision API compares your face with all photos from your selected event using advanced machine learning.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Instant Results</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your matched photos instantly in your dashboard and via email. Download or share them easily.
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Powered by Cutting-Edge Technology</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🌐</div>
                <h4 className="font-semibold mb-2">Google Cloud Vision</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Industry-leading facial recognition API
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">⚛️</div>
                <h4 className="font-semibold mb-2">React & TypeScript</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Modern, fast web application
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🗄️</div>
                <h4 className="font-semibold mb-2">PostgreSQL</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure, scalable database
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔥</div>
                <h4 className="font-semibold mb-2">Firebase</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Authentication & cloud storage
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Photos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already discovered their event photos with FaceSnapVault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowEventModal(true)}
              className="px-8 py-4 text-lg font-semibold"
            >
              Get Started Now
            </Button>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-blue-600"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EventAccessModal 
        isOpen={showEventModal} 
        onClose={() => setShowEventModal(false)} 
      />
    </div>
  );
} 