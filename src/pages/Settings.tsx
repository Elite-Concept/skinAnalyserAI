import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';
import WebhookSettings from '../components/settings/WebhookSettings';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SkinAI</span>
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account and integration settings
            </p>
          </div>

          <WebhookSettings />
        </div>
      </main>
    </div>
  );
}