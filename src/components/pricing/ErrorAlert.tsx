
import { XCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="bg-red-50 text-red-600 p-4 rounded-lg relative">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium mb-1">Subscription Error</h3>
            <p className="text-sm text-red-700">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}