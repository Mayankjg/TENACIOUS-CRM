// frontend/app/newsletter/send-mail/SendSingleMail/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateData {
  content: string;
  subject: string;
  selectedProduct: string;
  selectedEmail: string;
  templateId: string;
  templateName: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  selected: boolean;
  fromEmail: string;
}

export default function SendSingleMail() {
  const router = useRouter();
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  useEffect(() => {
    const templateData = localStorage.getItem('selectedTemplateData');
    if (templateData) {
      try {
        const parsed: TemplateData = JSON.parse(templateData);
        setSelectedTemplate(parsed);
      } catch (e) {
        console.error('Error parsing template:', e);
      }
    }

    const savedContacts = localStorage.getItem('singleMailContacts');
    if (savedContacts) {
      try {
        const contacts: Contact[] = JSON.parse(savedContacts);
        setContactList(contacts);
      } catch (e) {
        console.error('Error parsing contacts:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (contactList.length > 0) {
      localStorage.setItem('singleMailContacts', JSON.stringify(contactList));
    }
  }, [contactList]);

  const handleAddContact = (): void => {
    if (!contactName.trim() || !contactEmail.trim()) return alert('Please enter both contact name and email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return alert('Please enter a valid email address');

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: contactName.trim(),
      email: contactEmail.trim(),
      selected: false,
      fromEmail: selectedTemplate?.selectedEmail || ''
    };

    setContactList([...contactList, newContact]);
    setContactName('');
    setContactEmail('');
  };

  const handleToggleContact = (id: string): void => {
    setContactList(contactList.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const handleToggleAllContacts = (e: ChangeEvent<HTMLInputElement>): void => {
    setContactList(contactList.map(c => ({ ...c, selected: e.target.checked })));
  };

  const handleDeleteContact = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedList = contactList.filter(c => c.id !== id);
      setContactList(updatedList);
      if (updatedList.length === 0) {
        localStorage.removeItem('singleMailContacts');
      }
    }
  };

  const handleDeleteSelected = (): void => {
    const selectedCount = contactList.filter(c => c.selected).length;
    if (selectedCount === 0) return alert('Please select at least one contact to delete');

    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected contact(s)?`)) {
      const updatedList = contactList.filter(c => !c.selected);
      setContactList(updatedList);
      if (updatedList.length === 0) {
        localStorage.removeItem('singleMailContacts');
      }
    }
  };

  const handleSendMail = (): void => {
    const selected = contactList.filter(c => c.selected);
    if (selected.length === 0) return alert('Please select at least one contact');
    if (!selectedTemplate?.content) return alert('No template content found. Please go back and select a template.');

    localStorage.setItem('selectedSingleMailContacts', JSON.stringify(selected));

    router.push('/newsletter/send-mail');
  };

  const handlePreview = (): void => {
    if (!selectedTemplate?.content) return alert('No template selected. Please go back to Custom Message and select a template.');
    setShowPreview(true);
  };

  const handleCancel = (): void => {
    if (window.confirm('Are you sure you want to cancel? All contacts will be cleared.')) {
      setContactList([]);
      localStorage.removeItem('singleMailContacts');
    }
  };

  return (
    <div>
      <style>{`.preview-content{font-family:Arial,sans-serif;line-height:1.6;color:#000}
      .preview-content p,.preview-content h1,
      .preview-content h2,.preview-content h3,.preview-content h4,
      .preview-content h5,.preview-content h6,.preview-content span,.preview-content div,
      .preview-content li,.preview-content strong,.preview-content em,.preview-content u{color:black!important}
      .preview-content table{border-collapse:collapse;width:100%;margin:10px 0}
      .preview-content table td,
      .preview-content table th{border:1px solid #ddd;padding:8px}`}</style>

      {showPreview && (
        <>
          {/* Backdrop - Click to close */}
          <div
            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-tx"
            onClick={() => setShowPreview(false)}
          />

          {/* Modal Container - Properly Centered */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50">
                  <h2 className="text-xl font-bold text-gray-800">Email Preview</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                    title="Close"
                  >
                    ×
                  </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="bg-white rounded-lg shadow-sm p-6 preview-content">
                    {selectedTemplate?.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">⚠️ No template content available</p>
                        <p className="text-gray-500 text-sm mt-2">Please go back and select a template</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-3 bg-gray-50">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded focus:outline-none transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
        <div className="bg-white w-full max-w-[1400px]">
          <div className="bg-white w-full px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-normal text-gray-700">Send <strong>Mail</strong></h1>
              <div className="bg-amber-700 text-white px-4 py-2 rounded shadow-md">
                <span className="font-medium text-sm sm:text-base">Remaining Emails:</span>
                <span className="ml-2 sm:ml-3 font-bold text-base sm:text-lg">0</span>
              </div>
            </div>
            <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
          </div>

          <div className="w-full px-4 sm:px-6 py-6 pb-8">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Contact Name</label>
              <input type="text" value={contactName} onChange={(e: ChangeEvent<HTMLInputElement>) => setContactName(e.target.value)} placeholder="Contact Name"
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && document.getElementById('contactEmail')?.focus()}
                className="w-full max-w-xl border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none hover:bg-gray-100 hover:border-gray-400 transition-colors" />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Contact Email</label>
              <input type="email" id="contactEmail" value={contactEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setContactEmail(e.target.value)} placeholder="Contact Email"
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddContact()}
                className="w-full max-w-xl border border-gray-300 rounded px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none hover:bg-gray-100 hover:border-gray-400 transition-colors" />
            </div>

            <button onClick={handleAddContact} className="w-full sm:w-auto bg-cyan-400 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded mb-8 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors text-sm sm:text-base cursor-pointer">
              Add Contact</button>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Contact List ({contactList.length})</h2>

              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="hidden md:block">
                  <div className="bg-gray-100 grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-300">
                    <div className="col-span-1 flex items-center">
                      <input type="checkbox" checked={contactList.length > 0 && contactList.every(c => c.selected)} onChange={handleToggleAllContacts} className="w-4 h-4 cursor-pointer accent-cyan-500" />
                    </div>
                    <div className="col-span-4">
                      <span className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide">NAME</span>
                    </div>
                    <div className="col-span-5">
                      <span className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide">EMAIL</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wide">DELETE</span>
                    </div>
                  </div>

                  {contactList.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-red-400 text-base sm:text-lg font-medium">No contacts added</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {contactList.map((contact) => (
                        <div key={contact.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="col-span-1 flex items-center">
                            <input type="checkbox" checked={contact.selected} onChange={() => handleToggleContact(contact.id)} className="w-4 h-4 cursor-pointer accent-cyan-500" />
                          </div>
                          <div className="col-span-4 flex items-center">
                            <span className="text-gray-700 text-xs sm:text-sm font-medium">{contact.name}</span>
                          </div>
                          <div className="col-span-5 flex items-center">
                            <span className="text-gray-600 text-xs sm:text-sm break-all">{contact.email}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            {contact.selected && (
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-400 hover:text-red-700 p-0.5 rounded transition-colors"
                                title="Delete contact"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  {contactList.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-red-400 text-lg font-medium">No contacts added</p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {contactList.map((contact) => (
                        <div key={contact.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={contact.selected} onChange={() => handleToggleContact(contact.id)} className="w-5 h-5 cursor-pointer accent-cyan-500 mt-1" />
                              <div className="font-semibold text-sm text-gray-800">{contact.name}</div>
                            </div>
                            {contact.selected && (
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-400 hover:text-red-700 p-1 rounded transition-colors"
                                title="Delete contact"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 break-all">{contact.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {contactList.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
                <div>
                  {contactList.some(c => c.selected) && (
                    <button onClick={handleDeleteSelected} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete ({contactList.filter(c => c.selected).length})
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleSendMail} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors text-sm sm:text-base cursor-pointer">
                    Send Mail</button>
                  <button onClick={handlePreview} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors text-sm sm:text-base cursor-pointer">
                    Preview</button>
                  <button onClick={handleCancel} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors text-sm sm:text-base cursor-pointer">
                    Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}