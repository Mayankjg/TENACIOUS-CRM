"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddTemplatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const quillRef = useRef(null);
  const [templateName, setTemplateName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [templateFile, setTemplateFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageData, setPreviewImageData] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [headingText, setHeadingText] = useState("");
  const [visibility, setVisibility] = useState("admin");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setTemplateFile(file);
    if (file && file.type === "text/html") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setHtmlContent(content);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const heading = tempDiv.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          setHeadingText(heading.textContent || heading.innerText);
          heading.remove();
          setHtmlContent(tempDiv.innerHTML);
        } else {
          const firstText = tempDiv.textContent.trim().split('\n')[0];
          if (firstText) {
            setHeadingText(firstText);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePreviewImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setPreviewImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImageData(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const initializeQuill = () => {
    const editorElement = document.getElementById('editor');
    if (editorElement && quillRef.current) {
      editorElement.innerHTML = '';
      quillRef.current = null;
    }
    setTimeout(() => {
      if (document.getElementById('editor')) {
        quillRef.current = new window.Quill('#editor', {
          theme: 'snow',
          placeholder: 'Write your template content here...',
          modules: {
            toolbar: [[{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }], ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }], [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }, { 'align': [] }], ['blockquote', 'code-block'],
              ['link', 'image', 'video', 'formula'], ['clean']]
          }
        });

        if (quillRef.current) {
          let fullContent = '';
          if (headingText) {
            fullContent = `<h1 style="font-size: 2em; font-weight: bold; margin-bottom: 0.5em;">${headingText}</h1>`;
          }
          if (htmlContent) {
            fullContent += htmlContent;
          }
          if (fullContent) {
            quillRef.current.root.innerHTML = fullContent;
          }
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (step === 2) {
      if (!document.querySelector('link[href="https://cdn.quilljs.com/1.3.6/quill.snow.css"]')) {
        const link = document.createElement('link');
        link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      if (!document.querySelector('script[src="https://cdn.quilljs.com/1.3.6/quill.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
        script.onload = () => { if (window.Quill) initializeQuill(); };
        document.body.appendChild(script);
      } else if (window.Quill) {
        initializeQuill();
      }
      return () => { if (quillRef.current) quillRef.current = null; };
    }
  }, [step, htmlContent]);

  const handleNext = () => {
    if (!templateName || !selectedProduct || !templateFile) {
      alert("Please fill all required fields");
      return;
    }
    setStep(2);
  };

  const handleSave = () => {
    const editorContent = quillRef.current ? quillRef.current.root.innerHTML : '';
    const text = quillRef.current ? quillRef.current.getText().trim() : '';
    if (!text) {
      alert('Please create template content');
      return;
    }
    
    try { 
      const newTemplate = {
        id: crypto.randomUUID(),
        name: templateName,
        content: editorContent,
        product: selectedProduct,
        visibility: visibility,
        isCustom: false,
        previewImage: previewImageData,
        createdAt: new Date().toISOString()
      };

      const existingTemplates = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
      const updatedTemplates = [newTemplate, ...existingTemplates];
      localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates));

      alert('Template saved successfully!');
      router.push("/newsletter/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      alert('Error saving template');
    }
  };

  const handleCancel = () => {
    if (step === 2) {
      if (quillRef.current) {
        const editorElement = document.getElementById('editor');
        if (editorElement) editorElement.innerHTML = '';
        quillRef.current = null;
      }
      setStep(1);
    } else {
      router.push("/newsletter/templates");
    }
  };

  return (
    <>
      <style>{`
        .ql-editor {
          color: black !important;
        }
        .ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6,
        .ql-editor span, .ql-editor div, .ql-editor li, .ql-editor ol, .ql-editor ul {
          color: black !important;
        }
        .ql-editor strong, .ql-editor em, .ql-editor u {
          color: black !important;
        }
        .ql-container {
          font-family: inherit;
        }
        .ql-tooltip {
          left: auto !important;
          right: 0 !important;
          transform: none !important;
        }
      `}</style>
      
      <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
        <div className="bg-white w-full border max-w-[1400px]">
          <div className="bg-white w-full px-4 sm:px-6 py-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                {step === 1 ? "Add" : ""} <strong>Template</strong>
              </h1>
            </div>
            <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
          </div>
          
          <div className="w-full px-4 sm:px-6 py-2 pb-8">
            {step === 1 ? (
              <div className="max-w-3xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input 
                    type="text" 
                    placeholder="Template Name" 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 hover:bg-gray-100 focus:border-transparent" 
                    value={templateName} 
                    onChange={(e) => setTemplateName(e.target.value)} 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 hover:bg-gray-100 focus:border-transparent" 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select Products</option>
                    <option value="product1">Product 1</option>
                    <option value="product2">Product 2</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Template File</label>
                  <input 
                    type="file" 
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-0.5 file:px-4 file:rounded file:border border-gray-400 file:text-sm file:font-medium file:bg-gray-100 file:text-black hover:file:hover:bg-gray-300 file:cursor-pointer" 
                    accept=".html" 
                    onChange={handleFileChange} 
                  />
                  <p className="text-red-500 text-sm mt-2">Only .HTML Format Allow</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preview Images</label>
                  <input 
                    type="file" 
                    className="w-full text-sm text-gray-700 file:mr-4 file:py-0.5 file:px-4 file:rounded file:border border-gray-400 file:text-sm file:font-medium file:bg-gray-100 file:text-black hover:file:hover:bg-gray-300 file:cursor-pointer" 
                    accept="image/*" 
                    onChange={handlePreviewImageChange} 
                  />
                  {previewImageData && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Selected preview image:</p>
                      <img 
                        src={previewImageData} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-md px-4 py-2 mb-4">
                  <p className="text-sm text-red-600">
                    <span className="font-semibold">Note:</span> Please Do not Include <span className="font-semibold">Background-image</span> Tag in Template.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleNext} 
                    className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-1.5 rounded-md text-base font-medium transition-colors"
                  >
                    Next
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-1.5 rounded-md text-base font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 bg-gray-50" 
                    value={templateName} 
                    readOnly 
                  />
                </div>
                
                <div className="mb-1">
                  <div className="border-2 border-gray-300 rounded-lg overflow-auto resize">
                    <div id="editor" style={{ minHeight: '200px', backgroundColor: 'white' }}></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="admin" 
                        checked={visibility === "admin"} 
                        onChange={(e) => setVisibility(e.target.value)} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-sm text-gray-700">Visible To Admin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="visibility" 
                        value="all" 
                        checked={visibility === "all"} 
                        onChange={(e) => setVisibility(e.target.value)} 
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-sm text-gray-700">Visible To All</span>
                    </label>
                  </div>
                </div>
                
                {previewImageData && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview Image</label>
                    <img 
                      src={previewImageData} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover border border-gray-300 rounded"
                    />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleSave} 
                    className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-8 py-1.5 rounded-md text-base font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-1.5 rounded-md text-base font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}