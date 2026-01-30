"use client";

import { useState, useEffect } from 'react';
import Template from './template/page';
import CustomMessage from './CustomMessage/page';

export default function SendMailPage() {
  const [messageType, setMessageType] = useState('template');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const mailSent = localStorage.getItem('mailSentSuccess');
    if (mailSent === 'true') {
      setShowSuccessMessage(true);
      localStorage.removeItem('mailSentSuccess');
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 7000);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
        <div className="bg-white w-full max-w-[1400px]">
          <div className="bg-white w-full px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                Send <strong>Mail</strong>
              </h1>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="bg-amber-700 text-white px-4 py-2 rounded shadow-md">
                  <span className="font-medium text-sm sm:text-base">Remaining Emails:</span>
                  <span className="ml-2 sm:ml-3 font-bold text-base sm:text-lg">0</span>
                </div>
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  Topup Now
                </button>
              </div>
            </div>
            <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
          </div>

          <div className="w-full px-4 sm:px-6 py-6 pb-8">
            {showSuccessMessage && (
              <div className="bg-teal-50 border border-teal-700 text-teal-700 px-6 py-3 mb-6 rounded animate-slideDown">
                <p className="font-medium text-sm sm:text-base">
                  Thank you for using Tenacious sales. Your Message will be send within a few minute!
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-sm font-semibold text-gray-700">
                  Choose Message Type
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="messageType"
                      value="template"
                      checked={messageType === 'template'}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Template</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="messageType"
                      value="custom"
                      checked={messageType === 'custom'}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Custom Message</span>
                  </label>
                </div>
              </div>
            </div>

            {messageType === 'template' ? <Template /> : <CustomMessage />}
          </div>
        </div>
      </div>
    </>
  );
}