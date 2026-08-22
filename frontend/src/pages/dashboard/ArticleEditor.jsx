import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../api/axiosInstance';
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
import { IoMdLink, IoMdUndo, IoMdRedo, IoMdSend } from "react-icons/io";
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
  const [allCategories, setAllCategories] = useState([]);

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
        AxiosInstance.get('/dashboard/contri/article/fetch', {
          headers: {
            slug: props.refSlug,
          }
        })
          .then((res) => {
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
          .catch((err) => {
            console.log(err);
          });

      } catch (error) {
        console.log(error);
      }
    }
    const fetchCategories = async () => {
      try {
        const res = await AxiosInstance.get('/article/fetch/categories');
        setAllCategories(res.data);
      } catch (error) {
        console.log(error);

      }
    }

    fetchCategories();
    setIsLoading(false);
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }



  // SAVE DRAFT
  const handleSave = async () => {
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
      else {
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

  const handlePreview = () => {
    window.open(`/preview/${slug}`, '_blank');
  }

  const handleSend = async () => {
    setSaveInProgress(true);
    try {
      const response = await AxiosInstance.post("/article/send", {
        slug: slug,
        title: title,
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
      const res = await AxiosInstance.post(`${import.meta.env.VITE_API_URL}/dashboard/contributor/article/uploads/featuredimage`,
        formData, {
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

  useEffect(() => {
    document.title = 'Article Editor · Pixel & Pen';
  }, []);

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
        return <HeadingOneElement {...props} alignment={alignment} />
      case 'heading-two':
        return <HeadingTwoElement {...props} alignment={alignment} />
      case 'heading-three':
        return <HeadingThreeElement {...props} alignment={alignment} />
      case 'heading-four':
        return <HeadingFourElement {...props} alignment={alignment} />
      case 'heading-five':
        return <HeadingFiveElement {...props} alignment={alignment} />
      case 'heading-six':
        return <HeadingSixElement {...props} alignment={alignment} />
      case 'block-quote':
        return <BlockQuoteElement {...props} alignment={alignment} />
      case 'bulleted-list':
        return <BulletListElement {...props} />
      case 'numbered-list':
        return <NumberListElement {...props} />
      case 'link':
        return <LinkElement {...props} alignment={alignment} />
      case 'list-item':
        return <ListItemElement {...props} />
      case 'image':
        return <ImageElement {...props} alignment={alignment} />
      case 'youtube':
        return <YoutubeElement {...props} alignment={alignment} />
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
      { align: 'left' },
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
      match: n => {
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
      { match: n => Editor.isBlock(editor, n), mode: 'lowest' }
    );

  };

  const handleCanBeSave = () => {
    if (title.length <= 5) return true;
    else if (getTextLength(value) == 0) return true;

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

  const convertYouTubeUrl = (url) => {
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
    return <PixelPenLoader />
  }

  console.log(allCategories)

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] transition-colors duration-300 p-4 ">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-['Newsreader'] font-black tracking-tight">Article Editor</h1>
        <p className="mt-1 text-sm text-[#6B7280] dark:text-[#AAB4C5]">
          {isArticleNew ? 'Draft a new article for Pixel & Pen.' : `Editing “${title || 'Untitled article'}”`}
        </p>
      </div>

      <nav className='flex flex-wrap justify-between items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] shadow-sm'>
        <div className='flex gap-2'>
          <button
            onMouseDown={event => {
              event.preventDefault();
              HistoryEditor.undo(editor);
            }}
            disabled={!canUndo(editor)}
            className="py-2 px-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F] dark:hover:bg-[#4F8EF7] hover:text-white transition-colors"
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
            className="py-2 px-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F] dark:hover:bg-[#4F8EF7] hover:text-white transition-colors"
            title='Redo'
          >
            <IoMdRedo />
          </button>

        </div>
        <div className='flex gap-2'>
          <button onClick={handlePreview} title='Preview' disabled={!isSave} className='py-2 px-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-lg text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F] dark:hover:bg-[#4F8EF7] hover:text-white transition-colors'><VscOpenPreview /></button>
          <button onClick={e => { setIsRightSideBar(!isRightSideBar) }} title={isRightSideBar ? 'Sidebar Collapse' : 'Sidebar Expand'} className={`py-2 px-3 rounded-lg text-lg transition-colors ${isRightSideBar ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white' : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F] dark:hover:bg-[#4F8EF7] hover:text-white'}`}>
            {isRightSideBar ? <GoSidebarCollapse /> : <GoSidebarExpand />}
          </button>
          <button title='Save Draft' onClick={handleSave} disabled={handleCanBeSave()} className={`flex justify-center items-center gap-2 py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold border border-[#E5E7EB] dark:border-[#243247] text-[#1F2937] dark:text-[#F8FAFC] hover:border-[#1E3A5F] dark:hover:border-[#4F8EF7] transition-colors`}>
            {inProgress ? <PixelPenLoaderSmall /> : <>
              <span>Save</span>
              <CiSaveDown2 />
            </>}

          </button>
          <button title={isSend ? 'Article is sended For review' : 'Send for Review'} onClick={handleSend} disabled={!isSave || isSend} className='flex justify-center items-center gap-2 py-2 px-4 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white bg-[#1e3a5f] hover:opacity-90 transition-opacity'>
            {inSaveProgress ? <PixelPenLoaderSmall /> : <>
              <span>Send</span>
              <IoMdSend />
            </>}
          </button>

        </div>
      </nav>

      <div className='mt-4 flex flex-col lg:flex-row gap-4'>
        <div className={`w-full ${isRightSideBar ? 'lg:max-w-[54rem]' : ''} p-4 sm:p-6 bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] rounded-2xl shadow-sm transition-colors`}>
          <div className="mb-4">
            <input value={title} onChange={e => { setTitle(e.target.value); setIsTitleDirty(true); }} className="text-2xl sm:text-3xl font-['Newsreader'] border-none ring-0 focus:outline-none focus:ring-0 focus:shadow-none bg-transparent w-full font-semibold text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#AAB4C5] mb-2" type="text" placeholder='Add title' />
          </div>
          <div>
            <Slate key={editorKey} editor={editor} initialValue={value} onChange={handleChange}>
              <Toolbar toggleMark={toggleMark} toggleBlock={toggleBlock} isBlockActive={isBlockActive} toggleAlignment={toggleAlignment} toggleLink={toggleLink} isLinkActive={isLinkActive} unwrapLink={unwrapLink} insertImage={insertImage} embedYoutube={embedYoutube} isAlignActive={isAlignActive} />
              <div className="h-[45vh] sm:h-[50vh] overflow-auto mt-4 border border-[#E5E7EB] dark:border-[#243247] rounded-xl p-3 sm:p-4 min-h-[240px] sm:min-h-[300px] bg-[#FAFAF8]/40 dark:bg-[#0B1220]/40">
                <Editable
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  placeholder="Write your article..."
                  className="prose dark:prose-invert max-w-none outline-none min-h-[220px] sm:min-h-[280px]"
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
          <div className="mt-4 flex flex-wrap justify-between items-center gap-2 text-sm text-[#6B7280] dark:text-[#AAB4C5]">
            <div>
              Characters: {getTextLength(value)}
            </div>
            <div>
              {(!isSave && isContentDirty) && (
                <span className="text-[#D97706] dark:text-[#F59E0B] font-medium">
                  • Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        {isRightSideBar && <aside className="w-full h-auto  lg:w-[25rem] shrink-0 p-4 sm:p-6 bg-white dark:bg-[#162033] rounded-2xl border border-[#E5E7EB] dark:border-[#243247] shadow-sm space-y-6 lg:overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-['Newsreader'] font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Post Settings</h2>

          {/* Featured Image */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">Set Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-[#1F2937] dark:text-[#F8FAFC] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1E3A5F]/10 dark:file:bg-[#4F8EF7]/10 file:text-[#1E3A5F] dark:file:text-[#4F8EF7] hover:file:bg-[#1E3A5F]/20 dark:hover:file:bg-[#4F8EF7]/20 file:transition-colors"
            />
            {featuredImage && (
              <img src={featuredImage} alt="Featured" className="mt-3 w-full rounded-xl shadow-sm border border-[#E5E7EB] dark:border-[#243247]" />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">
              Description (160 characters)
            </label>
            <textarea
              maxLength={160}
              rows={3}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setIsDescriptionDirty(true) }}
              className="w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-[#4F8EF7]/30 p-2.5 rounded-lg bg-[#FAFAF8] dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-[#243247] transition-shadow"
              placeholder="Short description of the post..."
            />
            <p className="text-xs text-right text-[#6B7280] dark:text-[#AAB4C5] mt-1">{description.length}/160</p>
          </div>

          {/* Categories */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">Select Categories</label>
            <div className="space-y-2">
              {allCategories != null && allCategories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-[#1F2937] dark:text-[#F8FAFC] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat.id)}
                    disabled={
                      categories.length > 0 && !categories.includes(cat.id)
                    }
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 rounded accent-[#1E3A5F] dark:accent-[#4F8EF7] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC]">
              Tags (max 10)
            </label>

            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-[#E5E7EB] dark:border-[#243247] bg-[#FAFAF8] dark:bg-[#0B1220]">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-[#F59E0B]/10 text-[#D97706] dark:bg-[#F6B93B]/15 dark:text-[#F6B93B] px-2.5 py-1 rounded-full text-sm"
                >
                  <span className="mr-2">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="focus:outline-none text-sm ml-2 hover:text-[#DC2626] dark:hover:text-[#EF4444] transition-colors"
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
                  className="flex-1 border-none focus:border-none ring-0 focus:ring-0 focus:shadow-none min-w-[150px] p-1 focus:outline-none bg-transparent text-[#1F2937] dark:text-[#F8FAFC] placeholder-[#6B7280] dark:placeholder-[#AAB4C5]"
                />
              )}
            </div>

            {error && (
              <p className="text-[#DC2626] dark:text-[#EF4444] text-sm mt-1">{error}</p>
            )}

          </div>
        </aside>}
      </div>
    </div>
  );
};

const Toolbar = ({ toggleMark, toggleBlock, isBlockActive, toggleAlignment, isAlignActive, toggleLink, isLinkActive, unwrapLink, insertImage, embedYoutube }) => {
  const editor = useSlate();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto overflow-y-visible pb-2 border-b border-[#E5E7EB] dark:border-[#243247] [scrollbar-width:thin]">

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
        className={`shrink-0 p-2 rounded-md transition-colors text-lg ${isAlignActive(editor, 'left')
          ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white'
          : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10'
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
        className={`shrink-0 p-2 rounded-md transition-colors text-lg ${isAlignActive(editor, 'center')
          ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white'
          : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10'
          }`}
        onMouseDown={e => {
          e.preventDefault();
          toggleAlignment(editor, 'center');
        }}
      >
        <FaAlignCenter />
      </button>

      <div className="relative bg-transparent inline-block text-left">
        <button title='Heading' onClick={() => setOpen(!open)} className="shrink-0 inline-flex justify-center items-center px-2 py-2 rounded-md text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10 transition-colors">
          <LuHeading />
          <FaCaretDown className="ml-2 h-4 w-4" />
        </button>

        {open && (
          <div
            className="absolute left-0 px-2 py-2 z-20 mt-2 rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#243247] bg-white dark:bg-[#162033] max-h-72 overflow-y-auto"
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
        }} className={`shrink-0 p-2 rounded-md transition-colors text-lg ${isLinkActive(editor) ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white' : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10'}`} >
        <IoMdLink />
      </button>

      <button
        onMouseDown={event => {
          event.preventDefault();
          const url = window.prompt('Enter image URL:');
          if (!url) return;
          insertImage(editor, url);
        }}
        className="shrink-0 p-2 rounded-md transition-colors text-lg text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10"
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
        className="shrink-0 p-2 rounded-md transition-colors text-lg text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10"
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
      className={`shrink-0 p-2 rounded-md transition-colors text-lg ${isActive
        ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white'
        : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10'
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

const BlockButton = ({ icon, format, editor, toggleBlock, isBlockActive, title }) => {
  const active = isBlockActive(editor, format);

  return (
    <button
      title={title}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`shrink-0 p-2 rounded-md transition-colors text-lg ${active ? 'bg-[#1E3A5F] dark:bg-[#4F8EF7] text-white' : 'text-[#1F2937] dark:text-[#F8FAFC] hover:bg-[#1E3A5F]/10 dark:hover:bg-[#4F8EF7]/10'
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

const DefaultElement = ({ attributes, children, alignment }) => (
  <p {...attributes} className={`${alignment} text-[#1F2937] dark:text-[#F8FAFC] mb-2`}>
    {children}
  </p>
);

const LinkElement = (props) => (
  <a {...props.attributes} href={props.element.url} target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] dark:text-[#4F8EF7] underline underline-offset-2 hover:text-[#F97316] dark:hover:text-[#FF8A3D] transition-colors">
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

const HeadingOneElement = ({ attributes, children, alignment }) => (
  <h1 {...attributes} className={`${alignment} text-[2.3rem] font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2`}>
    {children}
  </h1>
);

const HeadingTwoElement = ({ attributes, children, style }) => (
  <h2 {...attributes} style={style} className="text-[2rem] font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </h2>
);
const HeadingThreeElement = ({ attributes, children, style }) => (
  <h3 {...attributes} style={style} className="text-[1.7rem] font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </h3>
);
const HeadingFourElement = ({ attributes, children, style }) => (
  <h4 {...attributes} style={style} className="text-[1.4rem] font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </h4>
);
const HeadingFiveElement = ({ attributes, children, style }) => (
  <h5 {...attributes} style={style} className="text-xl font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </h5>
);
const HeadingSixElement = ({ attributes, children, style }) => (
  <h6 {...attributes} style={style} className="text-lg font-['Newsreader'] font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </h6>
);

const BlockQuoteElement = ({ attributes, children }) => (
  <blockquote {...attributes} className="border-l-4 border-[#F97316] dark:border-[#FF8A3D] pl-4 italic text-[#6B7280] dark:text-[#AAB4C5] mb-2">
    {children}
  </blockquote>
);

const BulletListElement = ({ attributes, children }) => (
  <ul {...attributes} className="list-disc pl-6 text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </ul>
);

const NumberListElement = ({ attributes, children }) => (
  <ol {...attributes} className="list-decimal pl-6 text-[#1F2937] dark:text-[#F8FAFC] mb-2">
    {children}
  </ol>
);

const ListItemElement = ({ attributes, children }) => (
  <li {...attributes} className="text-[#1F2937] dark:text-[#F8FAFC] mb-2">
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