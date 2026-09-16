import { Link } from "react-router-dom";
import {
  Mail, ArrowUpRight
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import LogoDark from "../assets/images/Pixel & Pen(Main-B&W-New).png";

const FOOTER_LINKS = {
  Explore: [
    { label: "Main", to: "/articles" },
    { label: "Latest", to: "/article/latest" },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Become a Contributor", to: "/register" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Cookie Policy", to: "/cookies" },
  ],
};

const SOCIAL_LINKS = [
  { icon: FaXTwitter, href: "https://twitter.com", label: "X (Twitter)" },
  { icon: FaGithub, href: "https://github.com", label: "GitHub" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E3A5F] dark:bg-[#0B1220] font-['Inter',sans-serif] relative overflow-hidden">

      {/* Dotted texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Main footer content */}
        <div className="pt-16 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <img
                className="h-8 w-auto sm:h-9"
                src={LogoDark}
                alt="Pixel & Pen"
              />
              <span className="text-xl font-bold text-[#F8FAFC]">
                Pixel
                <span className="font-[Newsreader,Georgia,serif] text-[#FF8A3D]"> & </span>
                Pen
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              A platform for thoughtful writing on technology, design, and the way we work — built for readers who think deeply.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a

                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a

                href="mailto:pixelandpenteam@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/30 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/55 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 group"
                    >
                      {label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 text-center sm:text-left">
            © {year} Pixel &amp; Pen. All rights reserved.
          </p>
          <p className="text-xs text-white/20 text-center sm:text-right">
            Built with care for curious minds.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;