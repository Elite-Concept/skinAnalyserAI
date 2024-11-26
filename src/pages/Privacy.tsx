import { Link } from 'react-router-dom';
import { Microscope, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SkinAI</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2>Introduction</h2>
            <p>
              At SkinAI, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section className="mb-8">
            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide, including:</p>
            <ul>
              <li>Name and email address</li>
              <li>Profile information</li>
              <li>Payment information</li>
              <li>Facial images for analysis</li>
            </ul>

            <h3>Usage Information</h3>
            <p>We automatically collect certain information about your device, including:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>How We Use Your Information</h2>
            <p>We use the collected information for various purposes:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Improve and personalize user experience</li>
              <li>Process payments and transactions</li>
              <li>Send administrative information</li>
              <li>Provide customer support</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal information. However, no method of transmission over the Internet is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2>Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the
              purposes outlined in this Privacy Policy, unless a longer retention period is
              required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@skinai.com" className="text-blue-600 hover:text-blue-500">
                privacy@skinai.com
              </a>
            </p>
          </section>

          <section>
            <h2>Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be
              indicated by an updated "Last updated" date and the updated version will be
              effective as soon as it is accessible.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}