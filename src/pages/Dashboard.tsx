import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Copy, Settings, ExternalLink, Microscope, LogOut, Users, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionStatus from '../components/subscription/SubscriptionStatus';
import SubscriptionBanner from '../components/subscription/SubscriptionBanner';
import CreditUsageCard from '../components/subscription/CreditUsageCard';
import UpgradeModal from '../components/subscription/UpgradeModal';

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const clientId = user?.uid || 'demo123';
  
  const embedCode = `<iframe
  src="${window.location.origin}/embed/${clientId}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Microscope className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SkinAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/leads" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Leads</span>
              </Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user && (
          <SubscriptionBanner 
            userId={user.uid}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {user && (
            <>
              <SubscriptionStatus 
                userId={user.uid}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
              <CreditUsageCard userId={user.uid} />
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Embed Widget</h2>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500"
            >
              <ArrowUpCircle className="w-5 h-5" />
              Upgrade Plan
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Your embed code
                </label>
                <button
                  onClick={copyEmbedCode}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-sm">
                {embedCode}
              </pre>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="aspect-video rounded-lg border border-gray-200">
                <iframe
                  src={`/embed/${clientId}`}
                  className="w-full h-full rounded-lg"
                  title="Widget Preview"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <a
                href={`/embed/${clientId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500"
              >
                Open in new tab
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user?.uid}
        user={user}
      />
    </div>
  );
}