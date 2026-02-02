// frontend/app/newsletter/add-custom-template/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Template {
  id: string;
  name: string;
  content: string;
  visibility: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
}

interface MenuButtonProps {
  label: string;
  items: (MenuItem | 'divider')[];
}

declare global {
  interface Window {
    Quill: any;
  }
}

interface QuillInstance {
  root: HTMLElement;
  getSelection: () => { index: number; length: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: string, value: string) => void;
  formatText: (index: number, length: number, format: string, value?: any) => void;
  insertText: (index: number, text: string, format?: string, value?: string) => void;
  clipboard: {
    dangerouslyPasteHTML: (index: number, html: string) => void;
  };
  setContents: (delta: any[]) => void;
  setSelection: (index: number, length: number) => void;
  getText: () => string;
  getFormat: (range: { index: number; length: number }) => any;
  history: {
    undo: () => void;
    redo: () => void;
  };
}

export default function AddCustomTemplatePage() {
  const [templateName, setTemplateName] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("admin");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showSourceCode, setShowSourceCode] = useState<boolean>(false);
  const [sourceCode, setSourceCode] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
    script.onload = () => {
      if (window.Quill && !quillRef.current) {
        quillRef.current = new window.Quill('#editor', {
          theme: 'snow',
          placeholder: 'Write your template content here...',
          modules: {
            toolbar: [
              [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }, { 'align': [] }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video', 'formula'],
              ['clean']
            ]
          }
        });
        loadEditData();
      }
    };
    document.body.appendChild(script);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const loadEditData = (): void => {
    const editId = searchParams.get("edit");
    if (!editId) return;

    setIsEditMode(true);
    setEditingTemplateId(editId);

    const editingTemplate: Partial<Template> = JSON.parse(localStorage.getItem("editingTemplate") || "{}");
    const allTemplates: Template[] = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
    const template = editingTemplate.id === editId ? editingTemplate : allTemplates.find(t => t.id === editId);

    if (template) {
      setTemplateName(template.name || "");
      if (template.visibility) setVisibility(template.visibility);
      if (quillRef.current && template.content) quillRef.current.root.innerHTML = template.content;
    }
  };

  useEffect(() => {
    if (quillRef.current) loadEditData();
  }, [searchParams]);

  const handleMenuClick = (menu: string): void => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleFileAction = (action: string): void => {
    if (action === 'new') {
      if (confirm('Create new document? Unsaved changes will be lost.')) {
        setTemplateName('');
        if (quillRef.current) quillRef.current.setContents([]);
      }
    } else if (action === 'print') {
      const content = quillRef.current?.root.innerHTML || '';
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<html><head><title>Print Template</title><style>body{font-family:Arial,sans-serif;padding:20px}</style></head><body><h1>${templateName || 'Untitled Template'}</h1>${content}</body></html>`);
        w.document.close();
        w.print();
      }
    }
    setOpenMenu(null);
  };

  const handleEditAction = (action: string): void => {
    const editor = quillRef.current;
    if (!editor) return;
    const actions: Record<string, () => void> = {
      undo: () => editor.history.undo(),
      redo: () => editor.history.redo(),
      cut: () => document.execCommand('cut'),
      copy: () => document.execCommand('copy'),
      paste: () => { },
      selectAll: () => editor.setSelection(0, editor.getLength())
    };
    actions[action]?.();
    setOpenMenu(null);
  };

  const handleInsertAction = (action: string): void => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();

    switch (action) {
      case 'image':
        const img = prompt('Enter image URL:');
        if (img) editor.insertEmbed(index, 'image', img);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          if (range && range.length > 0) editor.formatText(range.index, range.length, 'link', url);
          else {
            const text = prompt('Enter link text:');
            if (text) editor.insertText(index, text, 'link', url);
          }
        }
        break;
      case 'video':
        const vid = prompt('Enter video URL (YouTube, Vimeo):');
        if (vid) editor.insertEmbed(index, 'video', vid);
        break;
      case 'table':
        const rows = prompt('Enter number of rows:', '3');
        const cols = prompt('Enter number of columns:', '3');
        if (rows && cols) {
          let tbl = '<table border="1" style="border-collapse:collapse;width:100%">';
          for (let i = 0; i < parseInt(rows); i++) {
            tbl += '<tr>';
            for (let j = 0; j < parseInt(cols); j++)
              tbl += '<td style="border:1px solid #ddd;padding:8px">&nbsp;</td>';
            tbl += '</tr>';
          }
          tbl += '</table>';
          editor.clipboard.dangerouslyPasteHTML(index, tbl);
        }
        break;
      case 'hr':
        editor.insertText(index, '\n---\n');
        break;
    }
    setOpenMenu(null);
  };

  const handleViewAction = (action: string): void => {
    if (action === 'sourceCode') {
      if (!showSourceCode) setSourceCode(quillRef.current?.root.innerHTML || '');
      else if (quillRef.current) quillRef.current.root.innerHTML = sourceCode;
      setShowSourceCode(!showSourceCode);
    } else if (action === 'fullscreen') {
      if (!document.fullscreenElement) editorContainerRef.current?.requestFullscreen();
      else document.exitFullscreen();
    }
    setOpenMenu(null);
  };

  const handleFormatAction = (format: string, value?: any): void => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    if (range && range.length > 0) {
      if (value) editor.formatText(range.index, range.length, format, value);
      else {
        const current = editor.getFormat(range);
        editor.formatText(range.index, range.length, format, !current[format]);
      }
    }
    setOpenMenu(null);
  };

  const handleSaveCustomTemplate = (): void => {
    if (!templateName.trim()) return alert('Please enter template name');
    const editorContent = quillRef.current ? quillRef.current.root.innerHTML : '';
    const text = quillRef.current ? quillRef.current.getText().trim() : '';
    if (!text) return alert('Please create template content');

    const existingTemplates: Template[] = JSON.parse(localStorage.getItem("emailTemplates") || "[]");

    if (isEditMode && editingTemplateId) {
      const updated = existingTemplates.map(t => t.id === editingTemplateId ?
        { ...t, name: templateName.trim(), content: editorContent, visibility, updatedAt: new Date().toISOString() } : t);
      localStorage.setItem("emailTemplates", JSON.stringify(updated));
      alert('Template updated successfully!');
    } else {
      const template: Template = {
        id: crypto.randomUUID(),
        name: templateName.trim(),
        content: editorContent,
        visibility,
        createdAt: new Date().toISOString(),
        isCustom: true
      };
      localStorage.setItem("emailTemplates", JSON.stringify([template, ...existingTemplates]));
      alert('Template saved successfully!');
    }
    localStorage.removeItem("editingTemplate");
    router.push("/newsletter/templates");
  };

  const handleCancel = (): void => {
    localStorage.removeItem("editingTemplate");
    router.push("/newsletter/templates");
  };

  const MenuButton = ({ label, items }: MenuButtonProps) => (
    <div className="relative inline-block">
      <button onClick={() => handleMenuClick(label.toLowerCase())} className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors">
        {label} <ChevronDown className="inline" size={12} />
      </button>
      {openMenu === label.toLowerCase() && items && (
        <div className="absolute top-full left-0 mt-0 bg-white border border-gray-300 shadow-lg z-50 min-w-[180px]">
          {items.map((item, idx) => item === 'divider' ?
            <div key={idx} className="border-t border-gray-200 my-1"></div> :
            <button key={idx} onClick={(item as MenuItem).onClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between">
              <span>{(item as MenuItem).label}</span>
              {(item as MenuItem).shortcut && <span className="text-xs text-gray-400 ml-4">{(item as MenuItem).shortcut}</span>}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        body { scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        body::-webkit-scrollbar { width: 0px !important; height: 0px !important; display: none !important;
        }
        .hide-scrollbar { scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        .hide-scrollbar::-webkit-scrollbar { width: 0px !important; height: 0px !important; display: none !important;
        }
        .ql-container { font-family: inherit; border: none !important; height: 200px !important; overflow-y: auto !important;
        }
        .ql-editor { color: black !important; outline: none !important; overflow-y: auto !important; height: 100% !important; max-height: 400px !important;
        }
        .ql-editor:focus { outline: none !important; border: none !important;
        }
        .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6,
        .ql-editor span, .ql-editor div, .ql-editor li, .ql-editor ol, .ql-editor ul,
        .ql-editor strong, .ql-editor em, .ql-editor u { color: black !important;
        }
        .ql-editor *{color:black!important}
        .ql-tooltip { left: auto !important; right: 0 !important; transform: none !important;
        }
        .ql-editor table { border-collapse: collapse; width: 100%; margin: 10px 0;
        }
        .ql-editor table td, .ql-editor table th { border: 1px solid #ddd; padding: 8px; color:black!important;
        }
        .resizable-editor { overflow: hidden !important;
        }
        .ql-container::-webkit-scrollbar, .ql-editor::-webkit-scrollbar { width: 0px !important; height: 0px !important; display: none !important;
        }
        .ql-container { scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        .ql-editor { scrollbar-width: none !important; -ms-overflow-style: none !important;
        }
        .ql-toolbar.ql-snow {
          display: flex !important; flex-wrap: wrap !important; border-bottom: 1px solid #ccc !important; 
          padding: 4px !important; gap: 4px !important; overflow-x: visible !important; width: 100% !important;
        }
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 3px !important; margin-bottom: 2px !important; display: inline-flex !important; gap: 5px !important; flex-shrink: 0 !important;
        }
        .ql-toolbar.ql-snow button { padding: 2px !important; width: 22px !important; height: 22px !important; flex-shrink: 0 !important;
        }
        .ql-toolbar.ql-snow .ql-picker { font-size: 12px !important; flex-shrink: 0 !important;
        }
        .ql-toolbar.ql-snow .ql-picker-label { padding: 2px 4px !important; height: 22px !important; line-height: 18px !important;
        }
        .ql-toolbar.ql-snow .ql-picker-options { max-height: 200px !important; overflow-y: auto !important;
        }
        .ql-container.ql-fullscreen, .ql-editor.ql-fullscreen, 
        .fullscreen-container, .ql-snow.ql-fullscreen { background-color: white !important; background: white !important;
        }
        .ql-container:-webkit-full-screen, .ql-container:-moz-full-screen, .ql-container:fullscreen {
          background-color: white !important;
        }
        .ql-container:-webkit-full-screen .ql-editor, .ql-container:-moz-full-screen .ql-editor, 
        .ql-container:fullscreen .ql-editor { background-color: white !important;
        }
        *:fullscreen { background-color: white !important;
        }
        *:-webkit-full-screen { background-color: white !important;
        }
        *:-moz-full-screen { background-color: white !important;
        }

        @media(max-width:768px) {
          .ql-toolbar.ql-snow { padding: 3px !important; gap: 2px !important;
          }
          .ql-toolbar.ql-snow button { width: 20px !important; height: 20px !important;
          }
          .ql-toolbar.ql-snow .ql-picker { font-size: 11px !important;
          }
          .ql-toolbar.ql-snow .ql-picker-label {padding: 1px 3px !important; height: 20px !important;line-height: 18px !important;}
        }
        @media(max-width:480px) {
          .ql-toolbar.ql-snow { flex-wrap: wrap !important;overflow-x: visible !important;}
          .ql-toolbar.ql-snow .ql-formats { margin-bottom: 2px !important;}
        }
      `}</style>

      <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
        <div ref={editorContainerRef} className="bg-white w-full max-w-[1400px] border">
          <div className="bg-white w-full px-4 sm:px-6 py-4 border-b border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                {isEditMode ? <>Edit Custom <strong>Template</strong></> : <>Add Custom <strong>Template</strong></>}
              </h1>
              <button 
                onClick={() => router.push("/newsletter/templates")} 
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-700 px-6 sm:px-8 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors whitespace-nowrap"
              >
                ← Back to Templates
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                placeholder="Enter template name" 
                className="w-full border border-gray-300 text-black rounded-md px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 hover:bg-gray-100 focus:border-transparent" 
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                Message <strong className="text-red-500">(Note: Please Enter Plain Text Only For Better Result)</strong>
              </label>

              {showSourceCode ? (
                <div>
                  <div className="mb-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    🔧 Source Code Mode - Edit HTML directly
                  </div>
                  <textarea 
                    value={sourceCode} 
                    onChange={(e) => setSourceCode(e.target.value)} 
                    className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm text-black min-h-[400px] bg-gray-50 resize-y" 
                    placeholder="HTML source code..." 
                  />
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden resizable-editor">
                  <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
                    <MenuButton label="File" items={[
                      { label: 'New document', shortcut: 'Ctrl+N', onClick: () => handleFileAction('new') }, 
                      { label: 'Print', shortcut: 'Ctrl+P', onClick: () => handleFileAction('print') }
                    ]} />
                    <MenuButton label="Edit" items={[
                      { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => handleEditAction('undo') }, 
                      { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => handleEditAction('redo') }, 
                      'divider', 
                      { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => handleEditAction('cut') }, 
                      { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => handleEditAction('copy') }, 
                      { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => handleEditAction('paste') }, 
                      'divider', 
                      { label: 'Select all', shortcut: 'Ctrl+A', onClick: () => handleEditAction('selectAll') }
                    ]} />
                    <MenuButton label="Insert" items={[
                      { label: 'Insert image', onClick: () => handleInsertAction('image') }, 
                      { label: 'Insert link', shortcut: 'Ctrl+K', onClick: () => handleInsertAction('link') }, 
                      { label: 'Insert video', onClick: () => handleInsertAction('video') }, 
                      { label: 'Insert table', onClick: () => handleInsertAction('table') }, 
                      { label: 'Horizontal line', onClick: () => handleInsertAction('hr') }
                    ]} />
                    <MenuButton label="View" items={[
                      { label: 'Fullscreen', shortcut: 'F11', onClick: () => handleViewAction('fullscreen') }, 
                      { label: 'Source code', onClick: () => handleViewAction('sourceCode') }
                    ]} />
                    <MenuButton label="Format" items={[
                      { label: 'Bold', shortcut: 'Ctrl+B', onClick: () => handleFormatAction('bold') }, 
                      { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => handleFormatAction('italic') }, 
                      { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => handleFormatAction('underline') }, 
                      { label: 'Strikethrough', onClick: () => handleFormatAction('strike') }, 
                      'divider', 
                      { label: 'Superscript', onClick: () => handleFormatAction('script', 'super') }, 
                      { label: 'Subscript', onClick: () => handleFormatAction('script', 'sub') }
                    ]} />
                    <MenuButton label="Table" items={[
                      { label: 'Insert table', onClick: () => handleInsertAction('table') }
                    ]} />
                    <MenuButton label="Tools" items={[
                      { label: 'Source code', onClick: () => handleViewAction('sourceCode') }, 
                      { label: 'Word count', onClick: () => { 
                        const text = quillRef.current?.getText() || ''; 
                        const words = text.trim().split(/\s+/).filter(w => w).length; 
                        alert(`📊 Statistics:\n\nWords: ${words}\nCharacters: ${text.length}`); 
                      }}
                    ]} />
                  </div>
                  <div id="editor" style={{ minHeight: '150px', backgroundColor: 'white' }}></div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="admin" 
                  checked={visibility === "admin"} 
                  onChange={(e) => setVisibility(e.target.value)} 
                  className="w-4 h-4 cursor-pointer accent-blue-600" 
                />
                <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900">
                  Visible To Admin
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="all" 
                  checked={visibility === "all"} 
                  onChange={(e) => setVisibility(e.target.value)} 
                  className="w-4 h-4 cursor-pointer accent-blue-600" 
                />
                <span className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900">
                  Visible To All
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={handleSaveCustomTemplate} 
                className="w-full sm:w-auto bg-cyan-500 text-white px-6 sm:px-8 py-2.5 rounded-md text-sm sm:text-base hover:bg-cyan-600 active:bg-cyan-700 font-medium transition-colors cursor-pointer"
              >
                {isEditMode ? 'Update Template' : 'Save Template'}
              </button>
              <button 
                onClick={handleCancel} 
                className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 sm:px-8 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}