import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
} from 'react-icons/md';
import { LuHeading1 } from "react-icons/lu";

const INITIAL_VALUE = [
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

const ArticleEditor = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  const [value, setValue] = useState(INITIAL_VALUE);
  const [title, setTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const LIST_TYPES = ['numbered-list', 'bulleted-list'];

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Render elements
  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      case 'heading-one':
        return <HeadingOneElement {...props}/>
      case 'block-quote':
        return <BlockQuoteElement {...props}/>
      case 'bulleted-list':
        return <BulletListElement {...props}/>
      case 'list-item':
        return <ListItemElement {...props}/>
      case 'paragraph':
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  // Render text formatting (marks)
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  // Toggle formatting
  const isMarkActive = useCallback((editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  }, []);

  const toggleMark = useCallback((editor, format) => {
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
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
  };

  const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
  
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
      { match: n => SlateElement.isElement(n), split: true }
    );
  
    if (!isActive && isList) {
      Transforms.wrapNodes(editor, {
        type: format,
        children: [],
      });
    }
  };


  const handleChange = useCallback((newValue) => {
    setValue(newValue);
    setIsDirty(true);
    
    console.log('Content:', newValue);
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg transition-colors">
      <div className="mb-4">
        <input className='text-3xl bg-transparent w-full outline-none font-bold text-gray-800 dark:text-gray-100 mb-2' type="text" placeholder='Add title' />
      </div>

      <Slate editor={editor} initialValue={INITIAL_VALUE} onChange={handleChange}>
        <Toolbar toggleMark={toggleMark} toggleBlock={toggleBlock} isBlockActive={isBlockActive} />
        <div className="mt-4 border border-gray-300 dark:border-gray-700 rounded-lg p-3 min-h-[300px]">
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
                }
              }
            }}
          />
        </div>
        
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            Characters: {(JSON.stringify(value).length) - 47}
          </div>
          <div>
            {isDirty && (
              <span className="text-orange-500">
                • Unsaved changes
              </span>
            )}
          </div>
        </div>
      </Slate>
    </div>
  );
};

const Toolbar = ({ toggleMark, toggleBlock, isBlockActive }) => {
  const editor = useSlate();
  
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
      <ToolbarButton 
        icon={<MdCode />} 
        format="code" 
        editor={editor} 
        toggleMark={toggleMark} 
        title="Code (Ctrl+`)"
      />

      < BlockButton icon={<LuHeading1 />} 
        format="heading-one" 
        editor={editor} 
        toggleBlock={toggleBlock} 
        isBlockActive={isBlockActive}
        title="H1" />
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

const CodeElement = ({ attributes, children }) => (
  <pre 
    {...attributes} 
    className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto font-mono text-sm"
  >
    <code>{children}</code>
  </pre>
);

const DefaultElement = ({ attributes, children }) => (
  <p {...attributes} className="text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </p>
);

const HeadingOneElement = ({ attributes, children }) => (
  <h1 {...attributes} className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </h1>
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

const ListItemElement = ({ attributes, children }) => (
  <li {...attributes} className=" text-gray-800 dark:text-gray-100 mb-2">
    {children}
  </li>
);

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  
  if (leaf.code) {
    children = (
      <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    );
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