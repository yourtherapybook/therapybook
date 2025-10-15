import React, { useState } from 'react';
import { Phone, AlertTriangle, ExternalLink, X, MapPin, Clock } from 'lucide-react';

interface EmergencyContactProps {
  isModal?: boolean;
  onClose?: () => void;
}

const EmergencyContact: React.FC<EmergencyContactProps> = ({ isModal = false, onClose }) => {
  const [showModal, setShowModal] = useState(false);

  const emergencyContacts = [
    {
      type: 'Immediate Emergency',
      number: '112',
      description: 'Police, Fire, Medical Emergency',
      available: '24/7',
      priority: 'high'
    },
    {
      type: 'Crisis Hotline',
      number: '08001110111',
      description: 'Telefonseelsorge - Free crisis counseling',
      available: '24/7',
      priority: 'high'
    },
    {
      type: 'Mental Health Crisis',
      number: '08001110222',
      description: 'Telefonseelsorge - Alternative line',
      available: '24/7',
      priority: 'high'
    },
    {
      type: 'Platform Support',
      number: '+4930555123456',
      description: 'TherapyBook technical and clinical support',
      available: 'Mon-Fri 8:00-20:00',
      priority: 'medium'
    },
    {
      type: 'Medical Emergency Service',
      number: '116117',
      description: 'Non-emergency medical service (Ärztlicher Bereitschaftsdienst)',
      available: '24/7',
      priority: 'medium'
    }
  ];

  const handleEmergencyCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const EmergencyButton = () => (
    <button
      onClick={() => setShowModal(true)}
      className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50 animate-pulse"
      aria-label="Emergency Contact"
    >
      <Phone className="h-6 w-6" />
    </button>
  );

  const EmergencyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Emergency Contacts</h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  If you are experiencing a medical emergency or are in immediate danger, call 112 immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  contact.priority === 'high'
                    ? 'border-red-200 bg-red-50'
                    : 'border-neutral-200 bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">{contact.type}</h3>
                  <div className="flex items-center text-xs text-neutral-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {contact.available}
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{contact.description}</p>
                <button
                  onClick={() => handleEmergencyCall(contact.number)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    contact.priority === 'high'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span>{contact.number}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Additional Resources</h4>
            <div className="space-y-2 text-sm">
              <a
                href="https://www.telefonseelsorge.de"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-700 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Telefonseelsorge Website
              </a>
              <a
                href="https://www.deutsche-depressionshilfe.de"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-700 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                German Depression Foundation
              </a>
              <div className="flex items-center text-blue-700">
                <MapPin className="h-3 w-3 mr-1" />
                <span>Find nearest hospital: 116 117</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return <EmergencyModal />;
  }

  return (
    <>
      <EmergencyButton />
      {showModal && <EmergencyModal />}
    </>
  );
};

export default EmergencyContact;