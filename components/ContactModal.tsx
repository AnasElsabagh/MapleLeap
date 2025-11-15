import React from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

const placeholderContacts = [
  { name: 'Alex Chen', title: 'Procurement Manager' },
  { name: 'Maria Garcia', title: 'Head of Supply Chain' },
  { name: 'John Smith', title: 'Senior Buyer' },
  { name: 'Priya Patel', title: 'Director of Operations' },
];

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, companyName }) => {
  if (!isOpen) return null;

  // Simple hash to get a consistent but different set of contacts per company
  const companyHash = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const contacts = [...placeholderContacts]
    .sort((a,b) => (a.name.charCodeAt(0) * companyHash) % 10 - (b.name.charCodeAt(0) * companyHash) % 10)
    .slice(0, 2 + (companyHash % 2))
    .map(contact => {
        const nameParts = contact.name.split(' ');
        const emailUser = `${nameParts[0][0]}.${nameParts[1]}`.toLowerCase();
        const domain = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\s/g, '')}.com`;
        return {
            ...contact,
            email: `${emailUser}@${domain}`
        }
    });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="contact-modal-title" className="text-xl font-bold text-gray-800">
            Simulated Contacts for <span className="text-yellow-600">{companyName}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          This is a simulation demonstrating how a tool like RocketChat or Apollo API could pull contacts.
        </p>
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="font-semibold text-gray-700">{contact.name}</p>
              <p className="text-sm text-gray-500">{contact.title}</p>
              <a href={`mailto:${contact.email}`} className="text-sm text-yellow-600 hover:underline">{contact.email}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
