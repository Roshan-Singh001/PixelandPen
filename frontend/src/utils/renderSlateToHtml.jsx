import { Text } from 'slate';
import React from 'react';

export function renderSlateToHtml(nodes) {
  return nodes.map((node, i) => {
    if (Text.isText(node)) {
      let text = node.text;

      if (node.bold) text = <strong key={i} className="font-semibold text-gray-900 dark:text-white">{text}</strong>;
      if (node.italic) text = <em key={i} className="italic text-gray-800 dark:text-gray-200">{text}</em>;
      if (node.underline) text = <u key={i} className="underline decoration-2 underline-offset-2 decoration-blue-500 dark:decoration-blue-400">{text}</u>;
      if (node.code) text = <code key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400 rounded-md text-sm font-mono border border-gray-200 dark:border-gray-700 shadow-sm">{text}</code>;

      return <React.Fragment key={i}>{text}</React.Fragment>;
    }

    const children = renderSlateToHtml(node.children || []);

    switch (node.type) {
      case 'paragraph':
        return <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base sm:text-lg">{children}</p>;
      case 'code':
        return <CodeElement key={i} children={children}/>;
      case 'heading-one':
        return <HeadingOneElement key={i} children={children} />;
      case 'heading-two':
        return <HeadingTwoElement key={i} children={children} />;
      case 'heading-three':
        return <HeadingThreeElement key={i} children={children} />;
      case 'heading-four':
        return <HeadingFourElement key={i} children={children} />;
      case 'heading-five':
        return <HeadingFiveElement key={i} children={children} />;
      case 'heading-six':
        return <HeadingSixElement key={i} children={children} />;
      case 'block-quote':
        return <BlockQuoteElement key={i} children={children} />;
      case 'bulleted-list':
        return <BulletListElement key={i} children={children}/>;
      case 'numbered-list':
        return <NumberListElement key={i} children={children}/>;
      case 'link':
        return <LinkElement key={i} children={children}/>;
      case 'list-item':
        return <ListItemElement key={i} children={children}/>;
      case 'image':
        return <ImageElement key={i} children={children}/>;
      case 'youtube':
        return <YoutubeElement key={i} children={children}/>;
      default:
        return <DefaultElement key={i} children={children} />;
    }
  });
}

const CodeElement = (props) => (
  <div className="my-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
    {/* Header with window controls */}
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">
          Code
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    {/* Code content */}
    <div className="relative">
      <pre className="bg-gray-900 dark:bg-gray-950 p-6 overflow-x-auto font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <code className="text-gray-100 dark:text-gray-200 block whitespace-pre">
          {props.children}
        </code>
      </pre>
      
      {/* Gradient overlay for scroll indication */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 dark:from-gray-950 to-transparent pointer-events-none"></div>
    </div>
  </div>
);

const DefaultElement = (props) => (
  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base sm:text-lg">
    {props.children}
  </p>
);

const LinkElement = (props) => (
  <a 
    href={props.element.url} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-all duration-200 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded-md"
  >
    {props.children}
  </a>
);

const ImageElement = (props) => (
  <div {...props.attributes} contentEditable={false} className="my-8">
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 transition-all duration-300 hover:shadow-3xl">
      <img 
        src={props.element.url} 
        alt='Image' 
        className="w-full h-auto object-cover rounded-xl hover:scale-[1.02] transition-transform duration-500 ease-out" 
      />
    </div>
  </div>
);

const YoutubeElement = (props) => (
  <div className="my-8" {...props.attributes} contentEditable={false}>
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 transition-all duration-300 hover:shadow-3xl">
      <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden">
        <iframe 
          className="absolute top-0 left-0 w-full h-full rounded-xl" 
          src={props.element.url} 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        />
      </div>
    </div>
  </div>
);

const HeadingOneElement = (props) => (
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-6 mt-8 leading-tight">
    {props.children}
  </h1>
);

const HeadingTwoElement = (props) => (
  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-5 mt-8 leading-tight border-b-2 border-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 pb-3 border-gray-200 dark:border-gray-700">
    {props.children}
  </h2>
);

const HeadingThreeElement = (props) => (
  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-6 leading-tight relative">
    <span className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
    {props.children}
  </h3>
);

const HeadingFourElement = (props) => (
  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6 leading-tight">
    {props.children}
  </h4>
);

const HeadingFiveElement = (props) => (
  <h5 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-5 leading-tight">
    {props.children}
  </h5>
);

const HeadingSixElement = (props) => (
  <h6 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 mt-4 leading-tight uppercase tracking-wide">
    {props.children}
  </h6>
);

const BlockQuoteElement = (props) => (
  <blockquote className="my-6 sm:my-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-l-4 border-blue-500 shadow-lg relative overflow-hidden">
    <div className="absolute top-4 right-4 text-blue-500/20 dark:text-blue-400/20">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
      </svg>
    </div>
    <p className="text-slate-700 dark:text-slate-300 italic text-base sm:text-lg font-medium leading-relaxed relative z-10">
      {props.children}
    </p>
  </blockquote>
);

const BulletListElement = ({ attributes, children }) => (
  <ul {...attributes} className="space-y-3 pl-6 my-6 text-gray-700 dark:text-gray-300">
    {children}
  </ul>
);

const NumberListElement = ({ attributes, children }) => (
  <ol {...attributes} className="space-y-3 pl-6 my-6 text-gray-700 dark:text-gray-300 list-none counter-reset-list">
    {children}
  </ol>
);

const ListItemElement = ({ attributes, children }) => (
  <li {...attributes} className="leading-relaxed text-base sm:text-lg pl-4 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 relative group">
    <span className="absolute left-0 top-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-200"></span>
    <div className="pl-2">
      {children}
    </div>
  </li>
);