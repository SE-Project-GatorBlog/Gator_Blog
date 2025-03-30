import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NewPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);
  const [editorHasFocus, setEditorHasFocus] = useState(false);

  useEffect(() => {
    // Set placeholder text in the editor
    if (editorRef.current) {
      editorRef.current.dataset.placeholder = 'Start writing your post...';
    }
  }, []);

  // Handle editor selection changes
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        setEditorHasFocus(true);
      } else {
        setEditorHasFocus(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !editorRef.current.textContent.trim()) {
      alert('Please add both a title and content to your post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the HTML content from the editor
      const content = editorRef.current.innerHTML;
      
      console.log('Submitting post:', { 
        title, 
        content,
        author: user?.username || 'Anonymous'
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful post
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  // Editor action functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // Format actions
  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');
  const handleTextColor = (e) => {
    e.preventDefault();
    const color = prompt('Enter a color (e.g., #000000, black, etc.):');
    if (color) {
      execCommand('foreColor', color);
    }
  };
  
  // Fixed list handling
  const handleUnorderedList = () => {
    // Focus first to ensure command works properly
    editorRef.current.focus();
    execCommand('insertUnorderedList');
  };
  
  const handleOrderedList = () => {
    // Focus first to ensure command works properly
    editorRef.current.focus();
    execCommand('insertOrderedList');
  };
  
  // Proper text alignment
  const handleAlignment = (align) => {
    editorRef.current.focus();
    execCommand(`justify${align}`);
  };
  
  const handleInsertImage = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Handle the file selection
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgSrc = event.target.result;
          execCommand('insertImage', imgSrc);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Trigger the file selection dialog
    fileInput.click();
  };
  
  const handleFormatBlock = (e) => {
    execCommand('formatBlock', e.target.value);
  };
  
  const handleInsertLineBreak = () => execCommand('insertHTML', '<br>');
  const handleInsertHorizontalLine = () => execCommand('insertHorizontalRule');
  
  const handleInsertCode = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const codeElement = document.createElement('code');
      codeElement.style.fontFamily = 'monospace';
      codeElement.style.backgroundColor = '#f0f0f0';
      codeElement.style.padding = '2px 4px';
      codeElement.style.borderRadius = '3px';
      
      try {
        // Store the selected text in the code element
        range.surroundContents(codeElement);
      } catch (e) {
        console.error('Error inserting code block:', e);
        // Alternative approach if surroundContents fails
        const selectedText = range.toString();
        const codeHTML = `<code style="font-family: monospace; background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px;">${selectedText}</code>`;
        execCommand('insertHTML', codeHTML);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FA4616] via-[#0021A5] to-[#FA4616]">
      {/* Navigation Bar */}
      <nav className="bg-[#0021A5] p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">GATORBLOG</h1>
          <div className="space-x-6">
            <button 
              onClick={() => navigateTo('/home')} 
              className="text-white hover:text-blue-200 font-medium px-2 py-1 rounded transition-colors"
            >
              HOME
            </button>
            <button 
              onClick={() => navigateTo('/dashboard')} 
              className="text-white hover:text-blue-200 font-medium px-2 py-1 rounded transition-colors"
            >
              POSTS
            </button>
            <button 
              onClick={() => navigateTo('/profile')} 
              className="text-white hover:text-blue-200 font-medium px-2 py-1 rounded transition-colors"
            >
              MY PROFILE
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-4 bg-[#0021A5]/10 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#0021A5]">Create New Post</h2>
            <p className="text-gray-600 text-sm">Share your thoughts with your fellow Gators</p>
          </div>
          
          {/* Post Editor */}
          <div className="bg-white">
            {/* Text Editor Toolbar */}
            <div className="flex flex-wrap items-center bg-gray-100 border-b border-gray-200 p-2 gap-1">
              <button onClick={handleUndo} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Undo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
              <button onClick={handleRedo} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Redo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
              </button>
              <div className="h-5 border-r border-gray-400 mx-1"></div>
              
              {/* Text Style Dropdown */}
              <div className="relative inline-block">
                <select 
                  onChange={handleFormatBlock} 
                  className="appearance-none bg-transparent border border-gray-300 rounded px-2 py-1 pr-8 cursor-pointer hover:bg-gray-200 text-gray-700"
                >
                  <option value="p">Normal text</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
              </div>
              
              <div className="h-5 border-r border-gray-400 mx-1"></div>
              
              {/* Alignment Buttons */}
              <button onClick={() => handleAlignment('Left')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Align Left">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm2.25 6a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 11.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h9.75a.75.75 0 010 1.5H6.75A.75.75 0 016 15z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={() => handleAlignment('Center')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Align Center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm8.25 6a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM7.5 7.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={() => handleAlignment('Right')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Align Right">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.75.75H6a.75.75 0 010-1.5h10.5a.75.75 0 01.75.75zm-10.5 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm0-7.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="h-5 border-r border-gray-400 mx-1"></div>
              
              {/* Text Color Button */}
              <button onClick={handleTextColor} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Text Color">
                <div className="w-5 h-5 bg-black rounded"></div>
              </button>
              
              {/* Text Formatting Buttons */}
              <button onClick={handleBold} className="p-1.5 rounded hover:bg-gray-200 font-bold text-gray-700" title="Bold">B</button>
              <button onClick={handleItalic} className="p-1.5 rounded hover:bg-gray-200 italic text-gray-700" title="Italic">I</button>
              <button onClick={handleUnderline} className="p-1.5 rounded hover:bg-gray-200 underline text-gray-700" title="Underline">U</button>
              <button onClick={handleInsertLineBreak} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Line Break">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
              
              <div className="h-5 border-r border-gray-400 mx-1"></div>
              
              {/* List Buttons */}
              <button onClick={handleUnorderedList} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Bullet List">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button onClick={handleOrderedList} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Numbered List">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="10" y1="6" x2="21" y2="6"></line>
                  <line x1="10" y1="12" x2="21" y2="12"></line>
                  <line x1="10" y1="18" x2="21" y2="18"></line>
                  <path d="M4 6h1v4"></path>
                  <path d="M4 10h2"></path>
                  <path d="M6 18H4c0 0 0-1 0-2c0-1 1-2 2-2s2 1 2 2c0 1 0 2 0 2"></path>
                </svg>
              </button>
              
              {/* Link Button */}
              <button onClick={handleLink} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Insert Link">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </button>
              
              {/* Image Button */}
              <button onClick={handleInsertImage} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Insert Image">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              
              {/* Code Button */}
              <button onClick={handleInsertCode} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Insert Code">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </button>
              
              {/* Horizontal Line Button */}
              <button onClick={handleInsertHorizontalLine} className="p-1.5 rounded hover:bg-gray-200 text-gray-700" title="Horizontal Line">—</button>
            </div>
            
            {/* Title Field */}
            <input
              type="text"
              placeholder="Title"
              className="w-full p-4 text-2xl font-bold outline-none border-b border-gray-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            {/* Content Field (WYSIWYG Editor) */}
            <div
              ref={editorRef}
              className="w-full p-4 min-h-[400px] outline-none overflow-auto"
              contentEditable="true"
              style={{
                position: 'relative',
              }}
              onFocus={() => setEditorHasFocus(true)}
              onBlur={() => setEditorHasFocus(false)}
              data-placeholder="Start writing your post..."
            ></div>
          </div>
        </div>
        
        {/* Post Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-[#0021A5] hover:bg-[#001B8C] text-white text-lg font-bold py-3 px-12 rounded-lg transform transition-all duration-300 hover:scale-105 shadow-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Posting...' : 'POST'}
          </button>
        </div>
        
        {/* Tips section */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md">
          <h3 className="text-[#0021A5] font-bold mb-2">Tips for a Great Post:</h3>
          <ul className="text-gray-700 text-sm space-y-1 pl-4">
            <li>• Use headings to organize your content</li>
            <li>• Add images to make your post more engaging</li>
            <li>• Format important points in <strong>bold</strong> or <em>italic</em></li>
            <li>• Use bullet points for easy scanning</li>
            <li>• Keep paragraphs short and focused</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewPost;