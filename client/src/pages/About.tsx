import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Target, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-blue-600">FaceSnapVault</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Revolutionizing how you find and access your event photos through cutting-edge facial recognition technology.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
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

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Choose FaceSnapVault?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Built with privacy, security, and ease of use in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center border border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced facial recognition technology delivers results in seconds, not minutes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center border border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your data is encrypted and never shared. We prioritize your privacy above all else.
                </p>
              </CardContent>
            </Card>
            
            <Card className="p-6 text-center border border-gray-100 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Highly Accurate</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Google Cloud Vision API ensures precise face matching with industry-leading accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Privacy & Data Security</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Selfies and embeddings are processed securely and not reused across different searches.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Only facial embeddings are stored, never the raw face images themselves.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Users can delete their face data and photo history at any time.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    All data is encrypted at rest using enterprise-grade security protocols.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4">GDPR Compliant</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                FaceSnapVault is fully compliant with GDPR and other international privacy regulations.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Encryption</span>
                  <span className="text-green-600 font-semibold">✓ AES-256</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Retention</span>
                  <span className="text-green-600 font-semibold">✓ User Controlled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Right to Delete</span>
                  <span className="text-green-600 font-semibold">✓ Instant</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Data Sharing</span>
                  <span className="text-green-600 font-semibold">✓ Never</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future of Photo Discovery?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already discovered their event photos with FaceSnapVault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg font-semibold"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-blue-600"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
