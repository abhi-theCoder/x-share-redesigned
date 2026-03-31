import React from 'react';
import { Link } from "react-router-dom";
import { Linkedin, Twitter, Github, Mail } from "lucide-react";

const footerLinks = {
  platform: [
    { name: "Experiences", href: "/experiences" },
    { name: "Q&A", href: "/qa" },
    { name: "Resources", href: "/resources" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Jobs", href: "/jobs" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="text-xl">X</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-foreground">Xshare</span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Intel Layer</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Empowering professionals and students through verified interview intelligence and community insights.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-xs">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-xs">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center font-medium">
            © 2026 Xshare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
