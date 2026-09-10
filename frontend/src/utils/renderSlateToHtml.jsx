import { Text } from 'slate';
import React from 'react';

export function renderSlateToHtml(nodes) {
  return nodes.map((node, i) => {
    if (Text.isText(node)) {
      let text = node.text;

      if (node.bold) text = <strong key={i} className="font-semibold text-gray-900 dark:text-gray-50">{text}</strong>;
      if (node.italic) text = <em key={i} className="italic">{text}</em>;
      if (node.underline) text = <u key={i} className="underline decoration-2 underline-offset-2 decoration-[#1E3A5F] dark:decoration-blue-400">{text}</u>;
      if (node.code) text = <code key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded text-[0.9em] font-mono">{text}</code>;

      return <React.Fragment key={i}>{text}</React.Fragment>;
    }

    const children = renderSlateToHtml(node.children || []);

    switch (node.type) {
      case 'paragraph':
        return <p key={i} className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4 text-base sm:text-lg">{children}</p>;
      case 'code':
        return <CodeElement key={i}>{children}</CodeElement>;
      case 'heading-one':
        return <HeadingOneElement key={i}>{children}</HeadingOneElement>;
      case 'heading-two':
        return <HeadingTwoElement key={i}>{children}</HeadingTwoElement>;
      case 'heading-three':
        return <HeadingThreeElement key={i}>{children}</HeadingThreeElement>;
      case 'heading-four':
        return <HeadingFourElement key={i}>{children}</HeadingFourElement>;
      case 'heading-five':
        return <HeadingFiveElement key={i}>{children}</HeadingFiveElement>;
      case 'heading-six':
        return <HeadingSixElement key={i}>{children}</HeadingSixElement>;
      case 'block-quote':
        return <BlockQuoteElement key={i}>{children}</BlockQuoteElement>;
      case 'bulleted-list':
        return <BulletListElement key={i}>{children}</BulletListElement>;
      case 'numbered-list':
        return <NumberListElement key={i}>{children}</NumberListElement>;
      case 'link':
        return <LinkElement key={i} element={node}>{children}</LinkElement>;
      case 'list-item':
        return <ListItemElement key={i}>{children}</ListItemElement>;
      case 'image':
        return <ImageElement key={i} element={node} />;
      case 'youtube':
        return <YoutubeElement key={i} element={node} />;
      default:
        return <DefaultElement key={i}>{children}</DefaultElement>;
    }
  });
}

const CodeElement = ({ children }) => (
  <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
    <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <span className="text-[11px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 ml-1">Code</span>
    </div>
    <pre className="bg-gray-900 dark:bg-slate-950 p-4 sm:p-5 overflow-x-auto">
      <code className="text-gray-100 text-sm font-mono leading-relaxed whitespace-pre">
        {children}
      </code>
    </pre>
  </div>
);

const DefaultElement = ({ children }) => (
  <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4 text-base sm:text-lg">
    {children}
  </p>
);

const LinkElement = ({ element, children }) => (
  <a
  
    href={element?.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#1E3A5F] dark:text-blue-400 font-medium underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-100"
  >
    {children}
  </a>
);

const ImageElement = ({ element }) => (
  <div className="my-8">
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800">
      <img
        src={element?.url}
        alt=""
        className="w-full h-auto object-cover"
      />
    </div>
  </div>
);

const YoutubeElement = ({ element }) => (
  <div className="my-8">
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800">
      <div className="relative pb-[56.25%] h-0">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={element?.url}
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

const HeadingOneElement = ({ children }) => (
  <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-5 mt-9 leading-tight">
    {children}
  </h1>
);

const HeadingTwoElement = ({ children }) => (
  <h2 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4 mt-8 pb-2.5 border-b border-gray-200 dark:border-slate-700 leading-tight">
    {children}
  </h2>
);

const HeadingThreeElement = ({ children }) => (
  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 mt-7 pl-3 border-l-2 border-[#1E3A5F] dark:border-blue-400 leading-tight">
    {children}
  </h3>
);

const HeadingFourElement = ({ children }) => (
  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50 mb-3 mt-6 leading-tight">
    {children}
  </h4>
);

const HeadingFiveElement = ({ children }) => (
  <h5 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-5 leading-tight">
    {children}
  </h5>
);

const HeadingSixElement = ({ children }) => (
  <h6 className="text-sm sm:text-base font-semibold tracking-wide uppercase text-gray-500 dark:text-slate-400 mb-2 mt-5 leading-tight">
    {children}
  </h6>
);

const BlockQuoteElement = ({ children }) => (
  <blockquote className="my-6 px-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border-l-4 border-[#1E3A5F] dark:border-blue-400">
    <p className="text-gray-700 dark:text-slate-300 italic text-base sm:text-lg leading-relaxed">
      {children}
    </p>
  </blockquote>
);

const BulletListElement = ({ children }) => (
  <ul className="list-disc marker:text-[#1E3A5F] dark:marker:text-blue-400 pl-5 space-y-2 my-5 text-gray-700 dark:text-slate-300">
    {children}
  </ul>
);

const NumberListElement = ({ children }) => (
  <ol className="list-decimal marker:text-[#1E3A5F] dark:marker:text-blue-400 marker:font-semibold pl-5 space-y-2 my-5 text-gray-700 dark:text-slate-300">
    {children}
  </ol>
);

const ListItemElement = ({ children }) => (
  <li className="leading-relaxed text-base sm:text-lg pl-1.5">
    {children}
  </li>
);