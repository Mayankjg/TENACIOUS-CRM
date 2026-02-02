"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link, Image, Table, Code, Palette, Type, Undo, Redo, ChevronDown } from 'lucide-react';
import { FaPen, FaTrash } from 'react-icons/fa';

const TEMPLATES = [
  { id: 'default-01', name: 'Default 01', colors: ['#e8d4c4', '#d4b89c', '#8b4513'], content: { title: 'Tenacious Sales', subtitle: 'Your Lead Manager', description: 'Tenacious is one of the best online digital marketing agency for businesses and startups across the world for Website, Apps, SEO,SMM and SEM.', body: 'Tenacious Group was founded in 2011, and so far we have served more than 175 clients across 15 countries all around the globe. We have delivered more than 253+ successful projects till date.', callToAction: 'Get Started Today', footer: 'Thank you for choosing our services. We look forward to working with you.' } },
  { id: 'default-02', name: 'Default 02', colors: ['#f5c4c4', '#e89c9c', '#c24040'], content: { title: 'Food-Chow', subtitle: 'Online Ordering System', description: 'It includes point-of-sale software to manage billing, orders, and payments in-house.', body: 'FoodChow is a technology platform and software suite for online food ordering, restaurant point-of-sale (POS), and restaurant business management — primarily aimed at helping restaurants, cafés, cloud kitchens, and hospitality businesses go digital and accept orders without relying on third-party aggregators.', callToAction: 'View Our Portfolio', footer: 'Let\'s create something amazing together. Contact us today!' } },
  { id: 'default-03', name: 'Default 03', colors: ['#d4c4b4', '#b4a494', '#6b5444'], content: { title: 'Point of Sale.', subtitle: 'POS as the cash counter + brain of the business.', description: 'It\'s the system where a sale happens—when a customer pays and the business records the transaction.', body: 'POS is the system where customers pay and businesses manage sales.', callToAction: 'Shop Now', footer: 'Enjoy fresh, organic goodness delivered to your door.' } },
];

const COLORS = ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466', '#ffffff'];

export default function Template() {
  const router = useRouter();
  const iframeRef = useRef(null);
  const [state, setState] = useState({ selectedProduct: '', selectedEmail: '', subject: '', selectedTemplate: null, openMenu: null, showSourceCode: false, htmlContent: '', showColorPicker: false, colorPickerType: 'text' });
  const [products, setProducts] = useState([]);
  const [emails, setEmails] = useState([]);
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showManageEmails, setShowManageEmails] = useState(false);
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [editedEmail, setEditedEmail] = useState('');

  useEffect(() => {
    const load = () => setProducts(JSON.parse(localStorage.getItem("products") || "[]"));
    load();
    const handler = (e) => e.key === 'products' && load();
    window.addEventListener('storage', handler);
    const interval = setInterval(load, 1000);
    return () => { window.removeEventListener('storage', handler); clearInterval(interval); };
  }, []);

  useEffect(() => setEmails(JSON.parse(localStorage.getItem("fromEmails") || "[]")), []);

  const saveEmails = (list) => { setEmails(list); localStorage.setItem("fromEmails", JSON.stringify(list)); };

  const handleAddEmail = () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) return alert('Please enter a valid email address');
    if (emails.some(e => e.email === newEmail.trim())) return alert('This email already exists');
    const newItem = { id: Date.now(), email: newEmail.trim() };
    saveEmails([...emails, newItem]);
    setNewEmail(''); 
    setShowAddEmailForm(false);
    setState(prev => ({ ...prev, selectedEmail: newItem.email }));
  };

  const handleUpdateEmail = (id) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail.trim())) return alert('Please enter a valid email address');
    saveEmails(emails.map((e) => e.id === id ? { ...e, email: editedEmail.trim() } : e));
    setEditingEmailId(null); 
    setEditedEmail('');
  };

  const handleDeleteSingleEmail = (id) => {
    if (confirm('Are you sure you want to delete this email?')) {
      saveEmails(emails.filter((e) => e.id !== id));
      if (state.selectedEmail === emails.find(e => e.id === id)?.email) setState(prev => ({ ...prev, selectedEmail: '' }));
    }
  };

  const generateHtmlContent = (template) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;background:#f1f1f1ff}*{box-sizing:border-box}::selection{background-color:#3b82f6;color:white}[contenteditable]{cursor:text}[contenteditable]:focus{outline:2px solid #3b82f6;outline-offset:2px}a[contenteditable="false"]{pointer-events:auto;cursor:pointer}</style></head><body contenteditable="true">
<div style="background:linear-gradient(135deg,${template.colors[0]} 0%,${template.colors[1]} 50%,${template.colors[2]} 100%);padding:40px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:#000000;font-size:32px;font-weight:bold;margin:0 0 10px 0">${template.content.title}</h1><h2 style="color:#000000;font-size:20px;font-weight:600;margin:0 0 15px 0">${template.content.subtitle}</h2><p style="color:#000000;font-size:16px;line-height:1.6;margin:0">${template.content.description}</p></div>
<div style="background:#fff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb"><h3 style="color:#000000;font-size:22px;font-weight:bold;margin:0 0 20px 0">Welcome!</h3><p style="color:#000000;font-size:16px;line-height:1.8;margin:0 0 20px 0">${template.content.body}</p><p style="color:#000000;font-size:16px;line-height:1.8;margin:0 0 30px 0">We're excited to help you get started and look forward to supporting you every step of the way.</p>
<div style="text-align:center;margin:30px 0"><a href="#" style="display:inline-block;background:linear-gradient(135deg,${template.colors[1]},${template.colors[2]});color:#fff;text-decoration:none;padding:15px 40px;border-radius:8px;font-size:16px;font-weight:bold;box-shadow:0 4px 6px rgba(0,0,0,0.1)">${template.content.callToAction}</a></div></div>
<div style="background:#f9fafb;padding:30px 40px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none"><p style="color:#000000;font-size:14px;line-height:1.6;margin:0 0 15px 0;text-align:center">${template.content.footer}</p><hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"><p style="color:#000000;font-size:12px;text-align:center;margin:0">301, Milestone Vibrant, Ring Rd, opposite to Apple Hospital, Udhana Darwaja, Khatodra Wadi, Surat, Gujarat 395002</p>
<div style="text-align:center;margin:20px 0 10px 0"><a href="https://www.facebook.com/TTechies/" target="_blank" contenteditable="false" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:40px;height:40px;border-radius:50%;background:#3b5998;display:inline-flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div></a>
<a href="https://x.com/Tenacious88888" target="_blank" contenteditable="false" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:40px;height:40px;border-radius:50%;background:#1DA1F2;display:inline-flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></div></a>
<a href="https://www.linkedin.com/company/tenacious-techies/?originalSubdomain=in" target="_blank" contenteditable="false" style="display:inline-block;margin:0 8px;text-decoration:none"><div style="width:40px;height:40px;border-radius:50%;background:#0077b5;display:inline-flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div></a></div>
<p style="color:#000000;font-size:12px;text-align:center;margin:20px 0 0 0">copyright @ <a href="https://tenacioustechies.com" target="_blank" contenteditable="false" style="color:#3b82f6;text-decoration:none;font-weight:500">Tenacious Techies.com </a> all rights reserved.</p></div></body></html>`;

  useEffect(() => {
    if (!state.selectedTemplate) return;
    const html = generateHtmlContent(state.selectedTemplate);
    setState(prev => ({ ...prev, htmlContent: html }));
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open(); doc.write(html); doc.close();
      doc.addEventListener('keydown', (e) => {
        const shortcuts = { b: 'bold', i: 'italic', u: 'underline', z: 'undo', y: 'redo' };
        if (e.ctrlKey && shortcuts[e.key]) { e.preventDefault(); doc.execCommand(shortcuts[e.key]); }
      });
    }
  }, [state.selectedTemplate]);

  const execCommand = (command, value = null) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentDocument.execCommand(command, false, value);
    iframeRef.current.contentWindow.focus();
  };

  const handleAction = (type, action) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc && type !== 'file') return;
    const actions = {
      file: {
        new: () => window.confirm('Create new document? Unsaved changes will be lost.') && setState(prev => ({ ...prev, selectedTemplate: null, htmlContent: '' })),
        print: () => iframeRef.current?.contentWindow.print()
      },
      edit: {
        undo: () => doc.execCommand('undo'),
        redo: () => doc.execCommand('redo'),
        cut: () => doc.execCommand('cut'),
        copy: () => doc.execCommand('copy'),
        paste: () => doc.execCommand('paste'),
        selectAll: () => { const sel = doc.getSelection(); const range = doc.createRange(); range.selectNodeContents(doc.body); sel.removeAllRanges(); sel.addRange(range); }
      },
      insert: {
        image: () => { const url = window.prompt('Enter image URL:'); url && doc.execCommand('insertImage', false, url); },
        link: () => { const url = window.prompt('Enter URL:'); url && doc.execCommand('createLink', false, url); },
        table: () => {
          const r = window.prompt('Rows:', '3'); const c = window.prompt('Columns:', '3'); 
          if (r && c) {
            let tbl = '<table border="1" style="border-collapse:collapse;width:100%;margin:10px 0">';
            for (let i = 0; i < parseInt(r); i++) { tbl += '<tr>'; for (let j = 0; j < parseInt(c); j++) tbl += '<td style="border:1px solid #ddd;padding:8px" contenteditable="true">Cell</td>'; tbl += '</tr>'; }
            tbl += '</table>';
            doc.execCommand('insertHTML', false, tbl);
          }
        },
        hr: () => doc.execCommand('insertHorizontalRule')
      },
      view: {
        sourceCode: () => {
          if (!state.showSourceCode && iframeRef.current) {
            setState(prev => ({ ...prev, htmlContent: iframeRef.current.contentDocument.documentElement.outerHTML, showSourceCode: true }));
          } else {
            setState(prev => ({ ...prev, showSourceCode: false }));
          }
        },
        fullscreen: () => {
          const container = document.querySelector('.editor-container');
          if (!document.fullscreenElement) container?.requestFullscreen().catch(e => console.log(e));
          else document.exitFullscreen();
        }
      },
      format: {
        bold: () => doc.execCommand('bold'),
        italic: () => doc.execCommand('italic'),
        underline: () => doc.execCommand('underline'),
        strike: () => doc.execCommand('strikeThrough')
      },
      tools: {
        wordCount: () => {
          const txt = doc?.body?.innerText || '';
          const w = txt.trim().split(/\s+/).filter(x => x).length;
          alert(`📊 Statistics:\n\nWords: ${w}\nCharacters: ${txt.length}`);
        }
      }
    };
    actions[type]?.[action]?.();
    setState(prev => ({ ...prev, openMenu: null }));
  };

  const handleApplySourceCode = () => {
    if (iframeRef.current && state.htmlContent) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(state.htmlContent);
      doc.close();
    }
    setState(prev => ({ ...prev, showSourceCode: false }));
  };

  const MenuButton = ({ label, items }) => (
    <div className="relative inline-block">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setState(prev => ({ ...prev, openMenu: prev.openMenu === label.toLowerCase() ? null : label.toLowerCase() }));
        }} 
        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
      >
        {label} <ChevronDown className="inline" size={12} />
      </button>
      {state.openMenu === label.toLowerCase() && items && (
        <div className="absolute top-full left-0 mt-0 bg-white border border-gray-300 shadow-lg z-50 min-w-[180px]">
          {items.map((item, i) => item === 'divider' ? <div key={i} className="border-t border-gray-200 my-1"></div> : 
            <button 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }} 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <span>{item.label}</span>{item.shortcut && <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>}
            </button>
          )}
        </div>
      )}
    </div>
  );

  const ToolbarButton = ({ onClick, icon: Icon, title }) => (
    <button onClick={onClick} title={title} className="p-2 hover:bg-gray-200 rounded transition-colors"><Icon size={18} className="text-gray-700" /></button>
  );

  const validateAndNavigate = (path) => {
    if (!state.selectedProduct) return alert('Please select a product');
    if (!state.selectedEmail) return alert('Please select an email');
    if (!state.selectedTemplate) return alert('Please select a template');
    if (!state.subject.trim()) return alert('Please enter a subject');
    const currentContent = state.showSourceCode ? state.htmlContent : iframeRef.current?.contentDocument.documentElement.outerHTML;
    if (!currentContent.replace(/<[^>]*>/g, '').trim()) return alert('Please write a message');
    
    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      fromEmail: state.selectedEmail
    }));
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));
    
    localStorage.setItem('selectedTemplateData', JSON.stringify({ 
      content: currentContent, 
      subject: state.subject, 
      selectedProduct: state.selectedProduct, 
      selectedEmail: state.selectedEmail, 
      templateId: state.selectedTemplate.id, 
      templateName: state.selectedTemplate.name 
    }));
    router.push(path);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (state.openMenu) {
        setState(prev => ({ ...prev, openMenu: null }));
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [state.openMenu]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">Select Product</label>
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <select value={state.selectedProduct} onChange={(e) => setState(prev => ({ ...prev, selectedProduct: e.target.value }))} className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-1 hover:bg-gray-100 text-sm text-gray-700">
            <option value="">Select Products</option>
            {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.646 7.354a.75.75 0 011.06 1.06l-6.177 6.177a.75.75 0 01-1.06 0L3.354 8.414a.75.75 0 011.06-1.06l4.878 4.879z" /></svg>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">From Email</label>
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative w-full sm:max-w-md">
            <select value={state.selectedEmail} onChange={(e) => setState(prev => ({ ...prev, selectedEmail: e.target.value }))} className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-1 hover:bg-gray-100 text-sm text-gray-700">
              <option value="">Select Email</option>
              {emails.map((e) => <option key={e.id} value={e.email}>{e.email}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.646 7.354a.75.75 0 011.06 1.06l-6.177 6.177a.75.75 0 01-1.06 0L3.354 8.414a.75.75 0 011.06-1.06l4.878 4.879z" /></svg>
            </div>
          </div>
          <button onClick={() => setShowAddEmailForm(true)} className="text-gray-600 bg-gray-300 hover:bg-gray-400 border border-gray-300 rounded w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex-shrink-0" title="Add new email"><span className="text-xl font-light">+</span></button>
          <button onClick={() => setShowManageEmails(true)} className="text-gray-600 bg-gray-300 hover:bg-gray-400 border border-gray-300 rounded w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex-shrink-0" title="Manage emails"><span className="text-xl font-light">−</span></button>
        </div>
      </div>

      {showAddEmailForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-[430px] rounded-lg shadow-[0_0_25px_rgba(0,0,0,0.3)]">
            <div className="border-b px-6 py-3"><h2 className="text-xl font-semibold text-gray-800">Add New Email</h2></div>
            <div className="px-6 py-4">
              <label className="block mb-2 text-sm text-gray-700">Email Address</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded text-black" placeholder="Enter email address" />
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t">
              <button onClick={handleAddEmail} className="px-5 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white">Save</button>
              <button onClick={() => { setShowAddEmailForm(false); setNewEmail(''); }} className="px-5 py-2 text-black rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showManageEmails && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-sm shadow-[0_0_25px_rgba(0,0,0,0.3)] max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b px-6 py-3 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Manage Emails</h2>
              <button onClick={() => setShowManageEmails(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto border border-gray-600">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-800 font-semibold">
                    <tr><th className="border p-2">SR. NO.</th><th className="border p-2">EMAIL ADDRESS</th><th className="border p-2 text-center">EDIT</th><th className="border p-2 text-center">DELETE</th></tr>
                  </thead>
                  <tbody>
                    {emails.length === 0 ? <tr><td colSpan="4" className="border p-4 text-center text-gray-500">No emails found.</td></tr> : 
                      emails.map((e, i) => (
                        <tr key={e.id} className="hover:bg-gray-50 text-gray-700">
                          <td className="border p-2">{i + 1}</td>
                          <td className="border p-2">{editingEmailId === e.id ? <input type="email" className="border px-2 py-1 w-full rounded" value={editedEmail} onChange={(ev) => setEditedEmail(ev.target.value)} /> : e.email}</td>
                          <td className="border p-2 text-center">
                            {editingEmailId === e.id ? (
                              <><button className="text-blue-600 font-semibold mr-2" onClick={() => handleUpdateEmail(e.id)}>Update</button>
                                <button className="text-red-600 font-semibold" onClick={() => { setEditingEmailId(null); setEditedEmail(''); }}>Cancel</button></>
                            ) : <button className="text-gray-600 hover:text-blue-600" onClick={() => { setEditingEmailId(e.id); setEditedEmail(e.email); }}><FaPen /></button>}
                          </td>
                          <td className="border p-2 text-center"><button onClick={() => handleDeleteSingleEmail(e.id)} className="text-red-600 hover:text-red-700"><FaTrash /></button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end"><button onClick={() => setShowManageEmails(false)} className="px-5 py-2 text-black rounded bg-gray-200 hover:bg-gray-300">Close</button></div>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">Subject</label>
        <input type="text" value={state.subject} onChange={(e) => setState(prev => ({ ...prev, subject: e.target.value }))} placeholder="Enter email subject" className="shadow appearance-none border border-gray-300 rounded w-full sm:max-w-md sm:flex-1 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-1 hover:bg-gray-50 text-sm" />
      </div>

      {state.selectedProduct && (
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px] sm:pt-2">Select Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {TEMPLATES.map((t) => (
                <div key={t.id} className="flex flex-col items-center w-full">
                  <div onClick={() => setState(prev => ({ ...prev, selectedTemplate: t }))} className={`cursor-pointer transition-all rounded-lg overflow-hidden w-full ${state.selectedTemplate?.id === t.id ? 'ring-2 ring-gray-500 shadow-xl scale-105' : 'ring-2 ring-gray-200 hover:shadow-lg hover:scale-105'}`} style={{ maxWidth: '250px', aspectRatio: '5/3.6', border: '8px solid #f1f0f0ff', borderRadius: '12px', margin: '0 auto' }}>
                    <div className="bg-white h-full w-full">
                      <div className="relative h-full p-3 sm:p-4 flex flex-col justify-between" style={{ background: `linear-gradient(135deg,${t.colors[0]} 0%,${t.colors[1]} 50%,${t.colors[2]} 100%)` }}>
                        <div><h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">{t.content.title}</h3><p className="text-[10px] sm:text-xs text-gray-700 line-clamp-3">{t.content.subtitle}</p></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:p-3"><p className="text-white text-[10px] sm:text-xs font-bold text-center">{t.name}</p></div>
                      </div>
                    </div>
                  </div>
                  <label className="mt-3 sm:mt-5 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={state.selectedTemplate?.id === t.id} onChange={() => setState(prev => ({ ...prev, selectedTemplate: t }))} className="w-4 h-4 bg-gray-100 border-gray-300 rounded-full focus:ring-2 cursor-pointer appearance-none border-2" style={{ backgroundColor: state.selectedTemplate?.id === t.id ? '#3be0f6ff' : '#f3f4f6', borderColor: state.selectedTemplate?.id === t.id ? '#3be0f6ff' : '#d1d5db', boxShadow: state.selectedTemplate?.id === t.id ? '0 0 0 2px white, 0 0 0 3px #3be0f6ff' : 'none' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {state.selectedTemplate && (
        <div className="mb-5 mt-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px] sm:pt-2">Message Editor</label>
            <div className="w-full editor-container text-black">
              {state.showSourceCode ? (
                <div>
                  <div className="mb-2 text-sm text-orange-600 bg-orange-50 p-2 rounded flex items-center justify-between">
                    <span>🔧 Source Code Mode</span>
                    <button onClick={handleApplySourceCode} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-xs">Apply Changes</button>
                  </div>
                  <textarea value={state.htmlContent} onChange={(e) => setState(prev => ({ ...prev, htmlContent: e.target.value }))} className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm min-h-[400px] bg-gray-50 resize-y" placeholder="HTML source code..." />
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                  <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
                    <MenuButton label="File" items={[{ label: 'New document', shortcut: 'Ctrl+N', onClick: () => handleAction('file', 'new') }, { label: 'Print', shortcut: 'Ctrl+P', onClick: () => handleAction('file', 'print') }]} />
                    <MenuButton label="Edit" items={[{ label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => handleAction('edit', 'undo') }, { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => handleAction('edit', 'redo') }, 'divider', { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => handleAction('edit', 'cut') }, { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => handleAction('edit', 'copy') }, { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => handleAction('edit', 'paste') }, 'divider', { label: 'Select all', shortcut: 'Ctrl+A', onClick: () => handleAction('edit', 'selectAll') }]} />
                    <MenuButton label="Insert" items={[{ label: 'Insert image', onClick: () => handleAction('insert', 'image') }, { label: 'Insert link', shortcut: 'Ctrl+K', onClick: () => handleAction('insert', 'link') }, { label: 'Insert table', onClick: () => handleAction('insert', 'table') }, { label: 'Horizontal line', onClick: () => handleAction('insert', 'hr') }]} />
                    <MenuButton label="View" items={[{ label: 'Fullscreen', shortcut: 'F11', onClick: () => handleAction('view', 'fullscreen') }, { label: 'Source code', onClick: () => handleAction('view', 'sourceCode') }]} />
                    <MenuButton label="Format" items={[{ label: 'Bold', shortcut: 'Ctrl+B', onClick: () => handleAction('format', 'bold') }, { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => handleAction('format', 'italic') }, { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => handleAction('format', 'underline') }, { label: 'Strikethrough', onClick: () => handleAction('format', 'strike') }]} />
                    <MenuButton label="Table" items={[{ label: 'Insert table', onClick: () => handleAction('insert', 'table') }]} />
                    <MenuButton label="Tools" items={[{ label: 'Source code', onClick: () => handleAction('view', 'sourceCode') }, { label: 'Word count', onClick: () => handleAction('tools', 'wordCount') }]} />
                  </div>

                  <div className="bg-white border-b border-gray-300 p-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <select onChange={(e) => execCommand('formatBlock', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white hover:bg-gray-50"><option value="">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="p">Paragraph</option></select>
                      <select onChange={(e) => execCommand('fontSize', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white hover:bg-gray-50"><option value="">Size</option><option value="1">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="7">Huge</option></select>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo (Ctrl+Z)" />
                      <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo (Ctrl+Y)" />
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold (Ctrl+B)" />
                      <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic (Ctrl+I)" />
                      <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline (Ctrl+U)" />
                      <ToolbarButton onClick={() => execCommand('strikeThrough')} icon={Strikethrough} title="Strikethrough" />
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <div className="relative">
                        <button onClick={() => setState(prev => ({ ...prev, colorPickerType: 'text', showColorPicker: !prev.showColorPicker }))} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Text Color"><Type size={18} className="text-gray-700" /></button>
                        {state.showColorPicker && state.colorPickerType === 'text' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 p-2 rounded" style={{ width: '168px' }}>
                            <div className="grid grid-cols-8 gap-1">{COLORS.map(color => <button key={color} onClick={() => { execCommand('foreColor', color); setState(prev => ({ ...prev, showColorPicker: false })); }} className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />)}</div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button onClick={() => setState(prev => ({ ...prev, colorPickerType: 'background', showColorPicker: !prev.showColorPicker }))} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Background Color"><Palette size={18} className="text-gray-700" /></button>
                        {state.showColorPicker && state.colorPickerType === 'background' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 shadow-lg z-50 p-2 rounded" style={{ width: '168px' }}>
                            <div className="grid grid-cols-8 gap-1">{COLORS.map(color => <button key={color} onClick={() => { execCommand('backColor', color); setState(prev => ({ ...prev, showColorPicker: false })); }} className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />)}</div>
                          </div>
                        )}
                      </div>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
                      <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
                      <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
                      <ToolbarButton onClick={() => execCommand('justifyFull')} icon={AlignJustify} title="Justify" />
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
                      <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => handleAction('insert', 'link')} icon={Link} title="Insert Link" />
                      <ToolbarButton onClick={() => handleAction('insert', 'image')} icon={Image} title="Insert Image" />
                      <ToolbarButton onClick={() => handleAction('insert', 'table')} icon={Table} title="Insert Table" />
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <ToolbarButton onClick={() => execCommand('removeFormat')} icon={Code} title="Clear Formatting" />
                    </div>
                  </div>

                  <iframe ref={iframeRef} className="w-full border-0" style={{ minHeight: '500px', background: '#fff' }} title="Email Template Editor" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="sm:min-w-[120px]"></div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:flex-1">
          <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendSingleMail')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto flex-shrink-0">Send Single Mail</button>
          <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendEntireList')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto flex-shrink-0">Send Entire List</button>
          <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendGroupContact')} className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto flex-shrink-0">Send Group Contact</button>
        </div>
      </div>
    </div>
  );
}