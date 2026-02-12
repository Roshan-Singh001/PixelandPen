import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { Node, Text, createEditor, Editor, Range, Transforms, Element as SlateElement } from 'slate';
import { withHistory, HistoryEditor } from 'slate-history';
import isHotkey from 'is-hotkey';

import PixelPenLoaderSmall from '../../components/PixelPenLoaderSmall';
import PixelPenLoader from '../../components/PixelPenLoader';

//Icons
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
} from 'react-icons/md';

import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { CiSaveDown2 } from "react-icons/ci";
import { VscOpenPreview } from "react-icons/vsc";
import { IoMdLink, IoMdUndo, IoMdRedo, IoMdSend  } from "react-icons/io";
import { HiNumberedList } from "react-icons/hi2";
import { MdFormatListBulleted } from "react-icons/md";
import { FaQuoteLeft, FaRegImage } from "react-icons/fa6";
import { FaCaretDown, FaYoutube, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from "react-icons/fa";
import { LuHeading, LuHeading1, LuHeading2, LuHeading3, LuHeading4, LuHeading5, LuHeading6 } from "react-icons/lu";
import { Navigate } from 'react-router-dom';

var INITIAL_VALUE = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const ArticleEditor = (props) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const [isArticleNew, setIsArticleNew] = useState(true);
  const [value, setValue] = useState(INITIAL_VALUE);
  const [editorKey, setEditorKey] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState('');
  const [isRightSideBar, setIsRightSideBar] = useState(true);
  const LIST_TYPES = ['numbered-list', 'bulleted-list'];
  const AxiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      withCredentials: true,
      timeout: 3000,
      headers: {'X-Custom-Header': 'foobar'}
    });
    
    //Side Bar (Right)
  const [featuredImage, setFeaturedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [error, setError] = useState('');

  const [inProgress, setInProgress] = useState(false);
  const [inSaveProgress, setSaveInProgress] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [isSend, setIsSend] = useState(false);
  const [isContentDirty, setIsContentDirty] = useState(false);
  const [isDescriptionDirty, setIsDescriptionDirty] = useState(false);
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [isTagDirty, setIsTagDirty] = useState(false);
  const [isCategoryDirty, setIsCategoryDirty] = useState(false);
  const [isThumbImageDirty, setIsThumbImageDirty] = useState(false);

  useEffect(() => {
    if (props.refSlug != "") {
      try {
        AxiosInstance.get('/article/fetch',{
          headers:{
            user_id: props.userdata.user_id,
            slug: props.refSlug,
          }
        })
        .then((res)=>{
          console.log(res.data);

          setTitle(res.data[0].title);
          setCategories(res.data[0].category);
          setDescription(res.data[0].description);
          setSlug(res.data[0].slug);
          setValue(res.data[0].content);
          setTags(res.data[0].tags);
          setFeaturedImage(res.data[0].thumbnail_url);

          setIsSave(true);
          setEditorKey(prev => prev + 1);
          setIsArticleNew(false);
        })
        .catch((err)=>{
          console.log(err);
        });
        
      } catch (error) {
        console.log(error);
        
      }
    }
    setIsLoading(false);
  }, []);


  const allCategories = ['News', 'Health', 'Technology', 'Education', 'Politics'];

  const generateSlug = (title)=>{
      return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')   
        .replace(/\s+/g, '-')           
        .replace(/-+/g, '-');           
  }



  // SAVE DRAFT
  const handleSave = async ()=>{
    setInProgress(true);
    let prevSlug = slug;
    let currentSlug = slug;
    const generated = generateSlug(title);
    setSlug(generated);
    currentSlug = generated;

    console.log(props.userdata);

    const article = {
      currentSlug,
      title,
      description,
      currentSlug,
      categories,
      tags, 
      featuredImage, 
      content: value,
    };

    try {
      if (isArticleNew) {
        
        const response = await AxiosInstance.post("/article/save/new", {
          user_id: props.userdata.user_id,
          article: JSON.stringify(article),
        });
        console.log(response);

        setIsArticleNew(false);
        setIsSave(true);
        setIsContentDirty(false);
        setIsDescriptionDirty(false);
        setIsCategoryDirty(false);
        setIsTagDirty(false);
        setIsThumbImageDirty(false);
        setIsTitleDirty(false);
      }
      else{
        const response = await AxiosInstance.post("/article/save/edit", {
          prevSlug: prevSlug,
          user_id: props.userdata.user_id,
          article: JSON.stringify(article),
        });
        console.log(response);

        setIsSave(true);
        setIsContentDirty(false);
        setIsDescriptionDirty(false);
        setIsCategoryDirty(false);
        setIsTagDirty(false);
        setIsThumbImageDirty(false);
        setIsTitleDirty(false);
      }
      
    } catch (error) {
      console.log(error);
    }
    setInProgress(false);
  }

  const handlePreview = ()=>{
    window.open(`/preview/${slug}`, '_blank');
  }

  const handleSend = async()=>{
    setSaveInProgress(true);
    console.log("Hello");
    try {
      const response = await AxiosInstance.post("/article/send", {
        slug: slug,
        title:title,
        cont_id: props.userdata.user_id,
        author: props.userdata.userName,
      });
      console.log(response);

      
    } catch (error) {
      console.log(error);
      
    }
    setSaveInProgress(false);
    setIsSend(true);
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://localhost:3000/article/uploads/featuredimage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      setFeaturedImage(res.data.imageUrl);
      setIsSave(false);
      setIsThumbImageDirty(true);
    } catch (err) {
      console.error("Frontend Upload Error:", err);
    }
  };

  function getTextLength(nodes) {
    let length = 0;
  
    for (const node of nodes) {
      if (Text.isText(node)) {
        length += node.text.length;
      } else if (node.children) {
        length += getTextLength(node.children);
      }
    }
  
    return length;
  }

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setIsCategoryDirty(true);
    setIsSave(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputTag.trim().toLowerCase();

      if (!trimmed) return;

      if (tags.includes(trimmed)) {
        setError('Duplicate tag not allowed.');
      } else if (tags.length >= 10) {
        setError(`Maximum 10 tags allowed.`);
      } else {
        setTags([...tags, trimmed]);
        setError('');
        setIsTagDirty(true);
        setIsSave(false);
      }

      setInputTag('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
    setError('');

    setIsTagDirty(true);
    setIsSave(false);
  };

  const canUndo = (editor) => {
    return editor.history.undos.length > 0;
  };
  
  const canRedo = (editor) => {
    return editor.history.redos.length > 0;
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isContentDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isContentDirty]);

  // Render elements
  const renderElement = useCallback((props) => {
    const alignment = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    }[props.element.children[0].align || 'left'];
    // console.log("ALignment: ",props.element.children[0].align, alignment);
    console.log(props.element.type);
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} alignment={alignment} />
      case 'heading-one':
        return <HeadingOneElement {...props} alignment={alignment}/>
      case 'heading-two':
        return <HeadingTwoElement {...props} alignment={alignment}/>
      case 'heading-three':
        return <HeadingThreeElement {...props} alignment={alignment}/>
      case 'heading-four':
        return <HeadingFourElement {...props} alignment={alignment}/>
      case 'heading-five':
        return <HeadingFiveElement {...props} alignment={alignment}/>
      case 'heading-six':
        return <HeadingSixElement {...props} alignment={alignment}/>
      case 'block-quote':
        return <BlockQuoteElement {...props} alignment={alignment}/>
      case 'bulleted-list':
        return <BulletListElement {...props}/>
      case 'numbered-list':
        return <NumberListElement {...props}/>
      case 'link':
        return <LinkElement {...props} alignment={alignment}/>
      case 'list-item':
        return <ListItemElement {...props}/>
      case 'image':
        return <ImageElement {...props} alignment={alignment}/>
      case 'youtube':
        return <YoutubeElement {...props} alignment={alignment}/>
      case 'paragraph':
      default:
        return <DefaultElement {...props} alignment={alignment} />;
    }
  }, [editor]);

  // Render text formatting (marks)
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  // Toggle formatting
  const isMarkActive = useCallback((editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  }, []);

  const toggleMark = useCallback((editor, format) => {
    const [codeBlock] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && n.type === 'code',
    });
    
    if (codeBlock) return;    

    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }, []);

  // Toggle Blocks
  const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format, mode: 'lowest',
    });
    return !!match;
  };

  const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
    const [codeBlock] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && n.type === 'code',
    });
  
    if (codeBlock && format !== 'code') {

      Transforms.setNodes(editor, { type: 'paragraph' });
    }
  
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type),
      split: true,
    });
  
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : isList ? 'list-item' : format },
      {align: 'left'},
      { match: n => SlateElement.isElement(n), split: true }
    );
  
    if (!isActive && isList) {
      Transforms.wrapNodes(editor, {
        type: format,
        children: [],
      });
    }
  };

  const isAlignActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
      match: n =>{ 
        return !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === format
      },
      mode: 'lowest',
    });
    return !!match;
  };

  const toggleAlignment = (editor, format) => {
    const isActive = isAlignActive(editor, format);
    Transforms.setNodes(
      editor,
      { align: format },
      { match: n => Editor.isBlock(editor, n), mode: 'lowest'}
    );

  };

  const handleCanBeSave = ()=>{
    if(title.length <= 5) return true;
    else if(getTextLength(value) == 0) return true;

    console.log(!(
      isTitleDirty ||
      isContentDirty ||
      isCategoryDirty ||
      isDescriptionDirty ||
      isTagDirty ||
      isThumbImageDirty
    ));

    return !(
      isTitleDirty ||
      isContentDirty ||
      isCategoryDirty ||
      isDescriptionDirty ||
      isTagDirty ||
      isThumbImageDirty
    );
  }


  // Insert Links
  const insertLink = (editor, url) => {
    if (!url) return;
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
  
    const link = {
      type: 'link',
      url,
      children: isCollapsed ? [{ text: url }] : [],
    };
  
    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: 'end' });
    }
  };
  
  const isLinkActive = (editor) => {
    const [link] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    });
    console.log(link);
    return !!link;
  };
  
  const unwrapLink = (editor) => {
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    });
  };
  
  const toggleLink = (editor, url) => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    } else {
      insertLink(editor, url);
    }
  };

  //Insert Image via URL
  const insertImage = (editor, url) => {
    const text = { text: '' };
    const image = {
      type: 'image',
      url,
      children: [text],
    };
    Transforms.insertNodes(editor, image);
  };

  //Embed Youtube
  
  const convertYouTubeUrl = (url)=>{
    try {
      const parsed = new URL(url);
  
      // Case 1: youtu.be short URL
      if (parsed.hostname === 'youtu.be') {
        const videoId = parsed.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${videoId}`;
      }
  
      // Case 2: www.youtube.com/watch?v=...
      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
  
      return null;
    } catch (err) {
      return null;
    }
  }

  const embedYoutube = (editor, url) => {
    const embedUrl = convertYouTubeUrl(url);

    if (!embedUrl) {
      alert('Invalid YouTube URL');
      return;
    }
    const text = { text: '' };
    const youtube = {
      type: 'youtube',
      url: embedUrl,
      children: [text],
    };
    Transforms.insertNodes(editor, youtube);
  };


  const handleChange = useCallback((newValue) => {
    setValue(newValue);
    setIsContentDirty(true);
    setIsSave(false);
    
  }, []);

  if (isLoading) {
    return <PixelPenLoader/>
  }

  return (<>
    <nav className='flex justify-between items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800'>
      <div className='flex gap-2'>
      <button
        onMouseDown={event => {
          event.preventDefault();
          HistoryEditor.undo(editor);
        }}
        disabled={!canUndo(editor)}
        className="py-2 px-[0.7rem] rounded disabled:opacity-60 bg-gray-300 dark:bg-gray-700 dark:hover:bg-blue-600 hover:bg-blue-600 hover:text-white"
        title='Undo'
      >
        <IoMdUndo />
      </button>

      <button
        onMouseDown={event => {
          event.preventDefault();
          HistoryEditor.redo(editor);
        }}
        disabled={!canRedo(editor)}
        className="py-2 px-[0.7rem] rounded disabled:opacity-60 bg-gray-300 dark:bg-gray-700 dark:hover:bg-blue-600 hover:bg-blue-600 hover:text-white"
        title='Redo'
      >
        <IoMdRedo />
      </button>
      
      </div>
      <div className='flex gap-2'>
      <button onClick={handlePreview} title='Preview' disabled={!isSave} className='py-1 px-[0.7rem] rounded disabled:opacity-60  text-[1.2rem] dark:hover:bg-blue-600 hover:bg-blue-600 hover:text-white'><VscOpenPreview /></button>
      <button onClick={e=>{setIsRightSideBar(!isRightSideBar)}} title={isRightSideBar?'Sidebar Collapse': 'Sidebar Expand'} className={`py-1 px-[0.7rem] rounded disabled:opacity-60  text-[1.2rem] ${isRightSideBar?'dark:bg-blue-600 bg-blue-600 text-white':'dark:hover:bg-blue-600 hover:bg-blue-600 hover:text-white'}`}>
        {isRightSideBar? <GoSidebarCollapse />: <GoSidebarExpand/>}
      </button>
      <button title='Save Draft' onClick={handleSave} disabled={handleCanBeSave()} className={`flex justify-center items-center gap-2 py-2 px-[0.7rem] rounded disabled:opacity-60  text-[1rem] bg-teal-600 dark:hover:bg-teal-800 hover:bg-teal-800 text-white`}>
        {inProgress? <PixelPenLoaderSmall/>:<> 
          <span>Save</span>
          <CiSaveDown2  /> 
        </>}
        
      </button>
      <button title={isSend?'Article is sended For review':'Send for Review'} onClick={handleSend} disabled={!isSave || isSend} className='flex justify-center items-center gap-2 py-2 px-[0.7rem] rounded disabled:opacity-60  text-[1rem] bg-rose-600 dark:hover:bg-rose-800 hover:bg-rose-800 text-white'>
        {inSaveProgress? <PixelPenLoaderSmall/>:<>
          <span>Send</span> 
          <IoMdSend/> 
        </>}
      </button>

      </div>
    </nav>

    <div className='mt-2 flex flex-auto max-[1000px]:flex-wrap gap-2'>
    <div className={`w-full ${isRightSideBar && 'max-w-[54rem]'} p-4  bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg transition-colors`}>
      <div className="mb-4">
        <input value={title} onChange={e=>{setTitle(e.target.value); setIsTitleDirty(true);}} className='text-3xl border-none ring-0 focus:outline-none focus:ring-0 focus:shadow-none bg-transparent w-full font-bold text-gray-800 dark:text-gray-100 mb-2' type="text" placeholder='Add title' />
      </div>
      <div>
      <Slate  key={editorKey}  editor={editor} initialValue={value} onChange={handleChange}>
        <Toolbar toggleMark={toggleMark} toggleBlock={toggleBlock} isBlockActive={isBlockActive} toggleAlignment={toggleAlignment} toggleLink={toggleLink} isLinkActive={isLinkActive} unwrapLink={unwrapLink} insertImage={insertImage} embedYoutube={embedYoutube} isAlignActive={isAlignActive}/>
        <div className="h-[50vh] overflow-auto mt-4 border border-gray-300 dark:border-gray-700 rounded-lg p-3 min-h-[300px]">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Write your article..."
            className="prose dark:prose-invert max-w-none outline-none min-h-[280px]"
            onKeyDown={(event) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  toggleMark(editor, HOTKEYS[hotkey]);
                  return;
                }
              }
              const [match] = Editor.nodes(editor, {
                match: n => SlateElement.isElement(n) && n.type === 'code',
              });
          
              if (match) {
                if (event.key === 'Enter') {
                  if (event.shiftKey || event.ctrlKey) {
                    event.preventDefault();
                    Transforms.insertNodes(editor, {
                      type: 'paragraph',
                      children: [{ text: '' }],
                    });
                    return;
                  }
              
                  event.preventDefault();
                  Transforms.insertText(editor, '\n');
                  return;
                }
              }
            }}
          />
        </div>
        
        
      </Slate>
      </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            Characters: {getTextLength(value)}
          </div>
          <div>
            {(!isSave && isContentDirty) && (
              <span className="text-orange-500">
                • Unsaved changes
              </span>
            )}
          </div>
        </div>
    </div>
    
    {isRightSideBar && <aside className="w-full h-[86vh] shadow md:w-[25rem] p-4 bg-white dark:bg-gray-800 rounded-2xl border-gray-300 dark:border-gray-700 space-y-6 overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Post Settings</h2>

      {/* Featured Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Set Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-50 dark:file:bg-gray-700 file:text-blue-700 dark:file:text-gray-200 hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
        />
        {featuredImage && (
          <img src={featuredImage} alt="Featured" className="mt-3 w-full rounded shadow-md" />
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (160 characters)
        </label>
        <textarea
          maxLength={160}
          rows={3}
          value={description}
          onChange={(e) => {setDescription(e.target.value); setIsDescriptionDirty(true)}}
          className="w-full focus:outline-none focus:ring-0 focus:shadow-none p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
          placeholder="Short description of the post..."
        />
        <p className="text-sm text-right text-gray-500 dark:text-gray-400">{description.length}/160</p>
      </div>

      {/* Categories */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Categories</label>
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded-2xl focus:outline-none focus:ring-0 focus:shadow-none bg-gray-300 dark:bg-slate-500 text-blue-600 dark:text-blue-400"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Tags (max 10)
      </label>

      <div className="flex flex-wrap items-center gap-2 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-sm"
          >
            <span className="mr-2">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="focus:outline-none text-xs hover:text-red-500 dark:hover:text-red-400"
            >
              &times;
            </button>
          </div>
        ))}

        {tags.length < 10 && (
          <input
            type="text"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type and press Enter"
            className="flex-1 border-none focus:border-none ring-0 focus:ring-0 focus:shadow-none min-w-[150px] p-1 focus:outline-none bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      </div>
    </aside>}
    </div>

    </>
  );
};

const Toolbar = ({ toggleMark, toggleBlock, isBlockActive, toggleAlignment, isAlignActive,toggleLink, isLinkActive ,unwrapLink, insertImage, embedYoutube }) => {
  const editor = useSlate();
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex gap-2 items-center border-b pb-2 dark:border-gray-700">
      
      <ToolbarButton 
        icon={<MdFormatBold />} 
        format="bold" 
        editor={editor} 
        toggleMark={toggleMark} 
        title="Bold (Ctrl+B)"
      />
      <ToolbarButton 
        icon={<MdFormatItalic />} 
        format="italic" 
        editor={editor} 
        toggleMark={toggleMark} 
        title="Italic (Ctrl+I)"
      />
      <ToolbarButton 
        icon={<MdFormatUnderlined />} 
        format="underline" 
        editor={editor} 
        toggleMark={toggleMark} 
        title="Underline (Ctrl+U)"
      />
      {/* <ToolbarButton 
        icon={<MdCode />} 
        format="code" 
        editor={editor} 
        toggleMark={toggleMark} 
        title="Code (Ctrl+`)"
      /> */}

      <BlockButton
         icon={<MdCode />}
         format="code"
         editor={editor}
         toggleBlock={toggleBlock}
         isBlockActive={isBlockActive}
         title="Code"
      />

      <button
        title='Align Left'
        className={`p-2 rounded-md transition-colors text-lg ${
          isAlignActive(editor,'left')
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onMouseDown={e => {
            e.preventDefault();
            toggleAlignment(editor, 'left');
          }}
        >
          <FaAlignLeft />
      </button>

      <button
        title='Align Center'
        className={`p-2 rounded-md transition-colors text-lg ${
          isAlignActive(editor,'center')
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onMouseDown={e => {
            e.preventDefault();
            toggleAlignment(editor, 'center');
          }}
        >
          <FaAlignCenter/>
      </button>
      
    <div className="relative bg-transparent inline-block text-left">
      <button title='Heading' onClick={() => setOpen(!open)} className="inline-flex justify-center items-center px-2 py-2  rounded-md shadow-sm bg-transparent text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
        <LuHeading /> 
        <FaCaretDown className="ml-2 h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute px-2 py-2 z-10 mt-2 rounded-md shadow-xl dark:bg-slate-800 bg-white"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="py-1 flex flex-col">
            <BlockButton
              icon={<LuHeading1 />}
              format="heading-one"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 1"
            />
            <BlockButton
              icon={<LuHeading2 />}
              format="heading-two"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 2"
            />
            <BlockButton
              icon={<LuHeading3 />}
              format="heading-three"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 3"
            />
            <BlockButton
              icon={<LuHeading4 />}
              format="heading-four"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 4"
            />
            <BlockButton
              icon={<LuHeading5 />}
              format="heading-five"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 5"
            />
            <BlockButton
              icon={<LuHeading6 />}
              format="heading-six"
              editor={editor}
              toggleBlock={toggleBlock}
              isBlockActive={isBlockActive}
              title="Heading 6"
            />
          </div>
        </div>
      )}
    </div>

    <BlockButton
      icon={<FaQuoteLeft />}
      format="block-quote"
      editor={editor}
      toggleBlock={toggleBlock}
      isBlockActive={isBlockActive}
      title="Block Quote"
    />

    <BlockButton
      icon={<MdFormatListBulleted />}
      format="bulleted-list"
      editor={editor}
      toggleBlock={toggleBlock}
      isBlockActive={isBlockActive}
      title="Bullet List"
    />

    <BlockButton
      icon={<HiNumberedList />}
      format="numbered-list"
      editor={editor}
      toggleBlock={toggleBlock}
      isBlockActive={isBlockActive}
      title="Numbered List"
    />

    <button
      onMouseDown={event => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
          return;
        }
        event.preventDefault();
        const url = window.prompt('Enter URL:');
        if (!url) return;
        toggleLink(editor, url);
      }} className={`p-2 rounded-md transition-colors text-lg ${ isLinkActive(editor) ? 'bg-blue-600 text-white ' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ' }`} >
        <IoMdLink />
    </button>

    <button
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt('Enter image URL:');
        if (!url) return;
        insertImage(editor, url);
      }}
      className="p-2 rounded-md transition-colors text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 "
    >
      <FaRegImage />
    </button>

    <button
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt('Enter youtube URL:');
        if (!url) return;
        embedYoutube(editor, url);
      }}
      className="p-2 rounded-md transition-colors text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 "
    >
      <FaYoutube />
    </button>
    </div>
  );
};

const ToolbarButton = ({ icon, format, editor, toggleMark, title }) => {
  const isActive = Editor.marks(editor)?.[format];
  
  return (
    <button
      title={title}
      className={`p-2 rounded-md transition-colors text-lg ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const BlockButton = ({ icon, format, editor, toggleBlock, isBlockActive,title }) => {
  const active = isBlockActive(editor, format);

  return (
    <button
      title={title}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`p-2 rounded-md transition-colors text-lg ${
        active ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
    </button>
  );
};

const CodeElement = ({ attributes, children, alignment }) => (
  <pre {...attributes} className={`${alignment} relative bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 overflow-x-auto font-mono text-sm leading-relaxed shadow-sm backdrop-blur-sm transition-colors duration-200 group`}>
    <code className="text-slate-800 dark:text-slate-200 selection:bg-blue-200 dark:selection:bg-blue-900/50">
      {children}
    </code>
  </pre>
);

const DefaultElement = ({ attributes, children, alignment}) => (
  <p {...attributes} className={`${alignment} text-gray-800 dark:text-gray-100 mb-2`}>
    {children}
  </p>
);

const LinkElement = (props) => (
  <a {...props.attributes}  href={props.element.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
    {props.children}
  </a>
);

const ImageElement = (props) => (
  <div {...props.attributes} contentEditable={false}>
    <img src={props.element.url} alt='Image' className="max-w-full min-w-[60%] h-auto my-4 rounded" />
  </div>
);
const YoutubeElement = (props) => (
  <div className='my-2' {...props.attributes} contentEditable={false}>
    <iframe className='rounded m-auto' width="560" height="315" src={props.element.url} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
);

const HeadingOneElement = ({ attributes, children, alignment}) => (
  <h1 {...attributes} className={`${alignment} text-[2.3rem] font-bold text-gray-800 dark:text-gray-100 mb-2`}>
    {children}
  </h1>
);

const HeadingTwoElement = ({ attributes, children, style }) => (
  <h2 {...attributes} style={style} className="text-[2rem] font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h2>
);
const HeadingThreeElement = ({ attributes, children, style }) => (
  <h3 {...attributes} style={style} className="text-[1.7rem] font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h3>
);
const HeadingFourElement = ({ attributes, children, style }) => (
  <h4 {...attributes} style={style} className="text-[1.4rem] font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h4>
);
const HeadingFiveElement = ({ attributes, children, style }) => (
  <h5 {...attributes} style={style} className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h5>
);
const HeadingSixElement = ({ attributes, children, style }) => (
  <h6 {...attributes} style={style} className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h6>
);

const BlockQuoteElement = ({ attributes, children }) => (
  <blockquote {...attributes} className="border-l-4 pl-4 italic text-gray-600 dark:text-gray-300 mb-2">
    {children}
  </blockquote>
);

const BulletListElement = ({ attributes, children }) => (
  <ul {...attributes} className="list-disc pl-6 text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </ul>
);

const NumberListElement = ({ attributes, children }) => (
  <ol {...attributes} className="list-decimal pl-6 text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </ol>
);

const ListItemElement = ({ attributes, children }) => (
  <li {...attributes} className=" text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </li>
);

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export default ArticleEditor;