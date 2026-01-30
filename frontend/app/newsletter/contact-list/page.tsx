"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: number;
  name: string;
  email: string;
  product: string;
}

export default function ContactListPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('contacts');
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    contacts.length > 0 
      ? localStorage.setItem('contacts', JSON.stringify(contacts))
      : localStorage.removeItem('contacts');
  }, [contacts]);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedContacts(e.target.checked ? contacts.map(c => c.id) : []);
  };

  const toggleSelect = (id: number) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const deleteContact = (id: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const bulkDelete = () => {
    if (selectedContacts.length === 0) return alert('Please select contacts to delete');
    if (confirm(`Delete ${selectedContacts.length} contact(s)?`)) {
      setContacts(contacts.filter(c => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
    }
  };

  const ContactRow = ({ contact, index }: { contact: Contact; index: number }) => (
    <tr className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 lg:px-6 border-r border-gray-300">
        <input 
          type="checkbox" 
          checked={selectedContacts.includes(contact.id)} 
          onChange={() => toggleSelect(contact.id)} 
          className="w-4 h-4 cursor-pointer" 
        />
      </td>
      <td className="py-4 px-4 lg:px-6 text-xs lg:text-sm text-gray-600 border-r border-gray-300">{index + 1}</td>
      <td className="py-4 px-4 lg:px-6 text-xs lg:text-sm text-gray-600 border-r border-gray-300">{contact.name}</td>
      <td className="py-4 px-4 lg:px-6 text-xs lg:text-sm text-gray-600 border-r border-gray-300">{contact.email}</td>
      <td className="py-4 px-4 lg:px-6 text-xs lg:text-sm text-gray-600 border-r border-gray-300">{contact.product}</td>
      <td className="py-4 px-4 lg:px-6 text-center">
        <button 
          onClick={() => deleteContact(contact.id)} 
          className="text-gray-500 hover:text-red-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="inline-block lg:w-5 lg:h-5">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </td>
    </tr>
  );

  const MobileCard = ({ contact, index }: { contact: Contact; index: number }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={selectedContacts.includes(contact.id)}
            onChange={() => toggleSelect(contact.id)} 
            className="w-4 h-4 cursor-pointer mt-1" 
          />
          <div>
            <div className="text-xs text-gray-500 mb-1">#{index + 1}</div>
            <div className="font-semibold text-sm text-gray-700">{contact.name}</div>
          </div>
        </div>
        <button 
          onClick={() => deleteContact(contact.id)} 
          className="text-gray-500 hover:text-red-600 transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex">
          <span className="text-gray-500 w-20">Email:</span>
          <span className="text-gray-700 break-all">{contact.email}</span>
        </div>
        <div className="flex">
          <span className="text-gray-500 w-20">Product:</span>
          <span className="text-gray-700">{contact.product}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      <div className="bg-white w-full max-w-[1400px]">
        <div className="bg-white w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-700">Contact <strong>List</strong></h1>
            <button 
              onClick={() => router.push('/newsletter/import-contacts')}
              className="w-full sm:w-auto bg-[#2d3e50] hover:bg-[#1a252f] text-white text-base px-5 py-2.5 rounded transition-colors"
            >
              Add Contacts
            </button>
          </div>
          <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
        </div>

        <div className="px-4 sm:px-6 py-4 bg-white">
          <p className="text-sm">
            <span className="text-red-600 font-semibold">Note :</span>{" "}
            <span className="text-red-600">Unsubscribe User(s) will not display in this List.</span>
          </p>
        </div>

        {contacts.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 text-center">
            <p className="text-gray-500 text-lg">No contact found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block w-full px-4 sm:px-6 pb-6">
              <div className="border border-gray-300 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="py-4 px-4 lg:px-6 text-left w-12 lg:w-16 border-r border-gray-300">
                        <input 
                          type="checkbox" 
                          onChange={toggleSelectAll} 
                          checked={selectedContacts.length === contacts.length && contacts.length > 0} 
                          className="w-4 h-4 cursor-pointer" 
                        />
                      </th>
                      {['SR NO.', 'NAME', 'EMAIL', 'PRODUCT'].map((h, idx) => (
                        <th 
                          key={`header-${idx}`} 
                          className="py-4 px-4 lg:px-6 text-left text-xs lg:text-sm font-bold text-gray-600 uppercase tracking-wide border-r border-gray-300"
                        >
                          {h}
                        </th>
                      ))}
                      <th className="py-4 px-4 lg:px-6 text-center text-xs lg:text-sm font-bold text-gray-600 uppercase tracking-wide">
                        DELETE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {contacts.map((contact, index) => (
                      <ContactRow key={contact.id} contact={contact} index={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden px-4 py-3 space-y-3">
              {contacts.map((contact, index) => (
                <MobileCard key={contact.id} contact={contact} index={index} />
              ))}
            </div>

            <div className="px-4 sm:px-6 py-4 md:py-6">
              <button 
                onClick={bulkDelete}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-12 py-2.5 rounded text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}