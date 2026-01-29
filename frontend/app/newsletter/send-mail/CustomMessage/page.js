"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Trash2, Pen } from 'lucide-react';

export default function CustomMessage() {
  const router = useRouter();
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const editorElementRef = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [templates, setTemplates] = useState([]);
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

  useEffect(() => { setTemplates(JSON.parse(localStorage.getItem("emailTemplates") || "[]")); }, []);
  useEffect(() => { setEmails(JSON.parse(localStorage.getItem("fromEmails") || "[]")); }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
    script.onload = () => setQuillLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
      if (quillRef.current) quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!quillLoaded || showSourceCode || quillRef.current) return;
    const initQuill = () => {
      const el = editorElementRef.current;
      if (!el || !window.Quill) return;
      try {
        quillRef.current = new window.Quill(el, {
          theme: 'snow',
          placeholder: 'Write your message here...',
          modules: {
            toolbar: [[{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }], [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'], [{ 'color': [] }, { 'background': [] }], [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }], [{ 'direction': 'rtl' }, { 'align': [] }],
            ['blockquote', 'code-block'], ['link', 'image', 'video', 'formula'], ['clean']]
          }
        });
      } catch (e) { console.error('Quill init error:', e); }
    };
    const timer = setTimeout(initQuill, 100);
    return () => clearTimeout(timer);
  }, [quillLoaded, showSourceCode]);

  useEffect(() => {
    if (!showSourceCode && quillRef.current && sourceCode) quillRef.current.root.innerHTML = sourceCode;
  }, [showSourceCode, sourceCode]);

  const saveEmails = (list) => { setEmails(list); localStorage.setItem("fromEmails", JSON.stringify(list)); };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return alert('Please enter email address');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) return alert('Please enter a valid email address');
    if (emails.some(e => e.email === newEmail.trim())) return alert('This email already exists');
    const newItem = { id: Date.now(), email: newEmail.trim() };
    saveEmails([...emails, newItem]);
    setNewEmail('');
    setShowAddEmailForm(false);
    setSelectedEmail(newItem.email);
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
      if (selectedEmail === emails.find(e => e.id === id)?.email) setSelectedEmail('');
    }
  };

  const handleMenuClick = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  const handleFileAction = (action) => {
    if (action === 'new' && window.confirm('Create new message? Unsaved changes will be lost.')) {
      if (quillRef.current) quillRef.current.setContents([]);
    } else if (action === 'print') {
      const content = quillRef.current?.root.innerHTML || '';
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>Print Email</title><style>body{font-family:Arial,sans-serif;padding:20px}</style></head><body><h2>Subject: ${subject || '(no subject)'}</h2><hr/>${content}</body></html>`);
        w.document.close();
        w.print();
      }
    }
    setOpenMenu(null);
  };

  const handleEditAction = (action) => {
    const editor = quillRef.current;
    if (!editor) return;
    switch (action) {
      case 'undo': editor.history.undo(); break;
      case 'redo': editor.history.redo(); break;
      case 'cut': document.execCommand('cut'); break;
      case 'copy': document.execCommand('copy'); break;
      case 'selectAll': editor.setSelection(0, editor.getLength()); break;
    }
    setOpenMenu(null);
  };

  const handleInsertAction = (action) => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();
    switch (action) {
      case 'image': const img = window.prompt('Enter image URL:'); if (img) editor.insertEmbed(index, 'image', img); break;
      case 'link': const url = window.prompt('Enter URL:');
        if (url) {
          if (range && range.length > 0) editor.formatText(range.index, range.length, 'link', url);
          else { const text = window.prompt('Enter link text:'); if (text) editor.insertText(index, text, 'link', url); }
        } break;
      case 'video': const vid = window.prompt('Enter video URL (YouTube, Vimeo):'); if (vid) editor.insertEmbed(index, 'video', vid); break;
      case 'table': const rows = window.prompt('Enter number of rows:', '3'); const cols = window.prompt('Enter number of columns:', '3');
        if (rows && cols) {
          let html = '<table border="1" style="border-collapse:collapse;width:100%">';
          for (let i = 0; i < parseInt(rows); i++) {
            html += '<tr>'; for (let j = 0; j < parseInt(cols); j++) html += '<td style="border:1px solid #ddd;padding:8px">&nbsp;</td>'; html += '</tr>';
          }
          html += '</table>';
          editor.clipboard.dangerouslyPasteHTML(index, html);
        } break;
      case 'hr': editor.insertText(index, '\n---\n'); break;
    }
    setOpenMenu(null);
  };

  const handleViewAction = (action) => {
    if (action === 'sourceCode') {
      if (!showSourceCode) { setSourceCode(quillRef.current?.root.innerHTML || ''); quillRef.current = null; } else setQuillLoaded(true);
      setShowSourceCode(!showSourceCode);
    } else if (action === 'fullscreen') {
      if (!document.fullscreenElement) editorContainerRef.current?.requestFullscreen().catch(e => console.log('Fullscreen error:', e));
      else document.exitFullscreen();
    }
    setOpenMenu(null);
  };

  const handleFormatAction = (format, value) => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    if (range && range.length > 0) {
      if (value) editor.formatText(range.index, range.length, format, value);
      else { const current = editor.getFormat(range); editor.formatText(range.index, range.length, format, !current[format]); }
    }
    setOpenMenu(null);
  };

  const MenuButton = ({ label, items }) => (
    <div className="relative inline-block">
      <button onClick={() => handleMenuClick(label.toLowerCase())} className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors">
        {label} <ChevronDown className="inline" size={12} />
      </button>
      {openMenu === label.toLowerCase() && items && (
        <div className="absolute top-full left-0 mt-0 bg-white border border-gray-300 shadow-lg z-50 min-w-[180px]">
          {items.map((item, idx) => item === 'divider' ? (
            <div key={idx} className="border-t border-gray-200 my-1"></div>
          ) : (
            <button key={idx} onClick={item.onClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
              <span>{item.label}</span>{item.shortcut && <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const applyTemplate = (tid) => {
    if (!tid) { setSelectedTemplate(""); if (quillRef.current) quillRef.current.setContents([]); setShowTemplateDropdown(false); return; }
    setSelectedTemplate(tid);
    const temp = templates.find(t => t.id === tid);
    if (temp && quillRef.current) quillRef.current.root.innerHTML = temp.content;
    setShowTemplateDropdown(false);
  };

  const validateAndNavigate = (path) => {
    if (!selectedProduct) return alert('Please select a product');
    if (!selectedEmail) return alert('Please select an email');
    if (!selectedTemplate) return alert('Please select a template');
    if (!subject.trim()) return alert('Please enter a subject');
    const content = showSourceCode ? sourceCode : (quillRef.current?.root.innerHTML || '');
    if (!content.replace(/<[^>]*>/g, '').trim()) return alert('Please write a message');

    const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const updatedContacts = contacts.map(contact => ({
      ...contact,
      fromEmail: selectedEmail
    }));
    localStorage.setItem('contacts', JSON.stringify(updatedContacts));

    localStorage.setItem('selectedTemplateData', JSON.stringify({
      content,
      subject,
      selectedProduct,
      selectedEmail,
      templateId: selectedTemplate,
      templateName: templates.find(t => t.id === selectedTemplate)?.name || ''
    }));
    router.push(path);
  };

  return (
    <>
      <style>{`.ql-container{font-family:inherit;border:none!important;height:200px!important;overflow-y:auto!important}
.ql-editor{color:black!important;outline:none!important;overflow-y:auto!important;height:100%!important;max-height:400px!important}
.ql-editor:focus{outline:none!important;border:none!important}
.ql-editor p,.ql-editor h1,.ql-editor h2,.ql-editor h3,.ql-editor h4,.ql-editor h5,.ql-editor h6,.ql-editor span,.ql-editor div,.ql-editor li,.ql-editor ol,.ql-editor ul,.ql-editor strong,.ql-editor em,.ql-editor u{color:black!important}
.ql-tooltip{left:auto!important;right:0!important;transform:none!important}
.ql-editor table{border-collapse:collapse;width:100%;margin:10px 0}
.ql-editor table td,.ql-editor table th{border:1px solid #ddd;padding:8px}
.resizable-editor{overflow:hidden!important}
.ql-container::-webkit-scrollbar,.ql-editor::-webkit-scrollbar{width:0px}
.ql-container::-webkit-scrollbar-track,.ql-editor::-webkit-scrollbar-track{background:#f1f1f1}
.ql-container::-webkit-scrollbar-thumb,.ql-editor::-webkit-scrollbar-thumb{background:#888;border-radius:4px}
.ql-container::-webkit-scrollbar-thumb:hover,.ql-editor::-webkit-scrollbar-thumb:hover{background:#555}
.ql-toolbar.ql-snow{display:flex!important;flex-wrap:wrap!important;border-bottom:1px solid #ccc!important;padding:4px!important;gap:4px!important;overflow-x:visible!important;width:100%!important}
.ql-toolbar.ql-snow .ql-formats{margin-right:3px!important;margin-bottom:2px!important;display:inline-flex!important;gap:5px!important;flex-shrink:0!important}
.ql-toolbar.ql-snow button{padding:2px!important;width:22px!important;height:22px!important;flex-shrink:0!important}
.ql-toolbar.ql-snow .ql-picker{font-size:12px!important;flex-shrink:0!important}
.ql-toolbar.ql-snow .ql-picker-label{padding:2px 4px!important;height:22px!important;line-height:18px!important}
.ql-toolbar.ql-snow .ql-picker-options{max-height:200px!important;overflow-y:auto!important}
.ql-container.ql-fullscreen,.ql-editor.ql-fullscreen,.fullscreen-container,.ql-snow.ql-fullscreen{background-color:white!important;background:white!important}
.ql-container:-webkit-full-screen,.ql-container:-moz-full-screen,.ql-container:fullscreen{background-color:white!important}
.ql-container:-webkit-full-screen .ql-editor,.ql-container:-moz-full-screen .ql-editor,.ql-container:fullscreen .ql-editor{background-color:white!important}
*:fullscreen{background-color:white!important}
*:-webkit-full-screen{background-color:white!important}
*:-moz-full-screen{background-color:white!important}
@media(max-width:768px){.ql-toolbar.ql-snow{padding:3px!important;gap:2px!important}.ql-toolbar.ql-snow button{width:20px!important;height:20px!important}.ql-toolbar.ql-snow .ql-picker{font-size:11px!important}.ql-toolbar.ql-snow .ql-picker-label{padding:1px 3px!important;height:20px!important;line-height:18px!important}}
@media(max-width:480px){.ql-toolbar.ql-snow{flex-wrap:wrap!important;overflow-x:visible!important}.ql-toolbar.ql-snow .ql-formats{margin-bottom:2px!important}}`}</style>

      <div className="w-full">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">Select Product</label>
          <div className="relative w-full sm:max-w-md sm:flex-1">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
              className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none hover:bg-gray-100 text-sm text-gray-700">
              <option value="">Select Products</option>
              {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.646 7.354a.75.75 0 011.06 1.06l-6.177 6.177a.75.75 0 01-1.06 0L3.354 8.414a.75.75 0 011.06-1.06l4.878 4.879z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">From Email</label>
          <div className="flex items-center gap-2 flex-1 w-full">
            <div className="relative w-full sm:max-w-md">
              <select value={selectedEmail} onChange={(e) => setSelectedEmail(e.target.value)}
                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none hover:bg-gray-100 text-sm text-gray-700">
                <option value="">Select Email</option>
                {emails.map((e) => <option key={e.id} value={e.email}>{e.email}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.646 7.354a.75.75 0 011.06 1.06l-6.177 6.177a.75.75 0 01-1.06 0L3.354 8.414a.75.75 0 011.06-1.06l4.878 4.879z" />
                </svg>
              </div>
            </div>
            <button onClick={() => setShowAddEmailForm(true)} className="text-gray-600 bg-gray-300 hover:bg-gray-400 border border-gray-300 rounded w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex-shrink-0" title="Add new email">
              <span className="text-xl font-light">+</span>
            </button>
            <button onClick={() => setShowManageEmails(true)} className="text-gray-600 bg-gray-300 hover:bg-gray-400 border border-gray-300 rounded w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex-shrink-0" title="Manage emails">
              <span className="text-xl font-light">−</span>
            </button>
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
                      {emails.length === 0 ? (
                        <tr><td colSpan="4" className="border p-4 text-center text-gray-500">No emails found.</td></tr>
                      ) : emails.map((e, i) => (
                        <tr key={e.id} className="hover:bg-gray-50 text-gray-700">
                          <td className="border p-2">{i + 1}</td>
                          <td className="border p-2">{editingEmailId === e.id ? <input type="email" className="border px-2 py-1 w-full rounded" value={editedEmail} onChange={(ev) => setEditedEmail(ev.target.value)} /> : e.email}</td>
                          <td className="border p-2 text-center">
                            {editingEmailId === e.id ? (
                              <><button className="text-blue-600 font-semibold mr-2" onClick={() => handleUpdateEmail(e.id)}>Update</button>
                                <button className="text-red-600 font-semibold" onClick={() => { setEditingEmailId(null); setEditedEmail(''); }}>Cancel</button></>
                            ) : <button className="text-gray-600 hover:text-blue-600" onClick={() => { setEditingEmailId(e.id); setEditedEmail(e.email); }}><Pen size={16} /></button>}
                          </td>
                          <td className="border p-2 text-center"><button onClick={() => handleDeleteSingleEmail(e.id)} className="text-red-600 hover:text-red-700"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end"><button onClick={() => setShowManageEmails(false)} className="px-5 py-2 text-black rounded bg-gray-200 hover:bg-gray-300">Close</button></div>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">Reply with</label>
          <div className="relative w-full sm:max-w-md sm:flex-1">
            <button onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none hover:bg-gray-100 text-sm text-gray-700 text-left">
              {selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || "Choose Template" : "Choose Template"}
            </button>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.646 7.354a.75.75 0 011.06 1.06l-6.177 6.177a.75.75 0 01-1.06 0L3.354 8.414a.75.75 0 011.06-1.06l4.878 4.879z" />
              </svg>
            </div>
            {showTemplateDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                <div onClick={() => applyTemplate("")} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Choose Template</div>
                {templates.map(t => <div key={t.id} onClick={() => applyTemplate(t.id)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"><div className="font-medium">{t.name}</div></div>)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px]">Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="shadow appearance-none border border-gray-300 rounded w-full sm:max-w-md sm:flex-1 py-2 px-4 text-gray-700 leading-tight focus:outline-none hover:bg-gray-100 text-sm" />
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap sm:min-w-[120px] pt-2">Message Editor</label>
          <div className="flex-1 w-full">
            {showSourceCode ? (
              <div>
                <div className="mb-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">🔧 Source Code Mode</div>
                <textarea value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm text-black min-h-[200px] bg-gray-50 resize-y" placeholder="HTML source code..." />
              </div>
            ) : (
              <div ref={editorContainerRef} className="border-2 border-gray-300 rounded-lg overflow-hidden resizable-editor">
                <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
                  <MenuButton label="File" items={[{ label: 'New document', shortcut: 'Ctrl+N', onClick: () => handleFileAction('new') }, { label: 'Print', shortcut: 'Ctrl+P', onClick: () => handleFileAction('print') }]} />
                  <MenuButton label="Edit" items={[{ label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => handleEditAction('undo') }, { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => handleEditAction('redo') }, 'divider', { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => handleEditAction('cut') }, { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => handleEditAction('copy') }, 'divider', { label: 'Select all', shortcut: 'Ctrl+A', onClick: () => handleEditAction('selectAll') }]} />
                  <MenuButton label="Insert" items={[{ label: 'Insert image', onClick: () => handleInsertAction('image') }, { label: 'Insert link', shortcut: 'Ctrl+K', onClick: () => handleInsertAction('link') }, { label: 'Insert video', onClick: () => handleInsertAction('video') }, { label: 'Insert table', onClick: () => handleInsertAction('table') }, { label: 'Horizontal line', onClick: () => handleInsertAction('hr') }]} />
                  <MenuButton label="View" items={[{ label: 'Fullscreen', shortcut: 'F11', onClick: () => handleViewAction('fullscreen') }, { label: 'Source code', onClick: () => handleViewAction('sourceCode') }]} />
                  <MenuButton label="Format" items={[{ label: 'Bold', shortcut: 'Ctrl+B', onClick: () => handleFormatAction('bold') }, { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => handleFormatAction('italic') }, { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => handleFormatAction('underline') }, { label: 'Strikethrough', onClick: () => handleFormatAction('strike') }]} />
                  <MenuButton label="Table" items={[{ label: 'Insert table', onClick: () => handleInsertAction('table') }]} />
                  <MenuButton label="Tools" items={[{ label: 'Source code', onClick: () => handleViewAction('sourceCode') }, { label: 'Word count', onClick: () => { const txt = quillRef.current?.getText() || ''; const w = txt.trim().split(/\s+/).filter(x => x).length; alert(`📊 Statistics:\n\nWords: ${w}\nCharacters: ${txt.length}`); } }]} />
                </div>
                <div ref={editorElementRef} style={{ minHeight: '150px', backgroundColor: 'white' }}></div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="sm:min-w-[120px]"></div>
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendSingleMail')} className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto sm:flex-shrink-0">Send single Mail</button>
              <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendEntireList')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto sm:flex-shrink-0">Send Entire List</button>
              <button onClick={() => validateAndNavigate('/newsletter/send-mail/SendGroupContact')} className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-colors w-full sm:w-auto sm:flex-shrink-0">Send Group Contact</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}