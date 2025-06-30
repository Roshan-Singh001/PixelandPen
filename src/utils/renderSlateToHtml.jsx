import { Text } from 'slate';
import React from 'react';

export function renderSlateToHtml(nodes) {
  return nodes.map((node, i) => {
    if (Text.isText(node)) {
      let text = node.text;

      if (node.bold) text = <strong key={i} className="font-semibold">{text}</strong>;
      if (node.italic) text = <em key={i} className="italic">{text}</em>;
      if (node.underline) text = <u key={i} className="underline decoration-2 underline-offset-2">{text}</u>;
      if (node.code) text = <code key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded text-sm font-mono border">{text}</code>;

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
  <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
    </div>
    <pre className="bg-gray-900 dark:bg-gray-950 p-4 overflow-x-auto font-mono text-sm leading-relaxed">
      <code className="text-gray-100">{props.children}</code>
    </pre>
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
    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-colors duration-200 font-medium"
  >
    {props.children}
  </a>
);

const ImageElement = (props) => (
  <div {...props.attributes} contentEditable={false} className="my-8">
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      <img 
        src={props.element.url} 
        alt='Image' 
        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" 
      />
    </div>
  </div>
);

const YoutubeElement = (props) => (
  <div className="my-8" {...props.attributes} contentEditable={false}>
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="relative pb-[56.25%] h-0">
        <iframe 
          className="absolute top-0 left-0 w-full h-full" 
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
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-6 mt-8 leading-tight">
    {props.children}
  </h1>
);

const HeadingTwoElement = (props) => (
  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-5 mt-8 leading-tight border-b-2 border-gray-200 dark:border-gray-700 pb-2">
    {props.children}
  </h2>
);

const HeadingThreeElement = (props) => (
  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-6 leading-tight">
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
  <blockquote className="my-6 sm:my-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border-l-4 border-blue-500">
    <p className="text-slate-700 dark:text-slate-300 italic text-sm sm:text-base">
      {props.children}
    </p>
  </blockquote>
);

const BulletListElement = ({ attributes, children }) => (
  <ul {...attributes} className="space-y-2 pl-6 my-4 text-gray-700 dark:text-gray-300">
    {children}
  </ul>
);

const NumberListElement = ({ attributes, children }) => (
  <ol {...attributes} className="space-y-2 pl-6 my-4 text-gray-700 dark:text-gray-300 list-decimal">
    {children}
  </ol>
);

const ListItemElement = ({ attributes, children }) => (
  <li {...attributes} className="leading-relaxed text-base sm:text-lg pl-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 -mt-1"></span>
    {children}
  </li>
);