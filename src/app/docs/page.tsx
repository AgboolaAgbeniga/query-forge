'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SVGLogo } from '@/components/ui/SVGLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  BookOpen,
  Terminal,
  Settings,
  Key,
  Share2,
  FileJson,
  Search,
  ArrowRight,
  Code2,
  Database,
  Filter,
  Layers,
  Shield,
  Zap,
  Play,
  Check,
  Copy,
  Plus,
  Bookmark,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocSection {
  id: string;
  title: string;
  category: 'getting-started' | 'concepts' | 'syntax' | 'sharing' | 'reference';
}

const SECTIONS: DocSection[] = [
  { id: 'introduction', title: 'Introduction', category: 'getting-started' },
  { id: 'quickstart', title: 'Quickstart Guide', category: 'getting-started' },
  { id: 'rules-and-groups', title: 'Rules & Logic Groups', category: 'concepts' },
  { id: 'operators', title: 'Operators Reference', category: 'syntax' },
  { id: 'query-formats', title: 'SQL, MongoDB, & GraphQL', category: 'syntax' },
  { id: 'schema-sharing', title: 'Presets & JSON Schema', category: 'sharing' },
  { id: 'shortcuts', title: 'Keyboard Shortcuts', category: 'reference' },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('introduction');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive Compiler Selector
  const [compilerTab, setCompilerTab] = useState<'sql' | 'mongo' | 'graphql'>('sql');

  const sectionsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Keyboard shortcut state visualizer
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
      if (e.key === 'Control' || e.key === 'Meta') setIsCtrlPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Scrollspy observer to update active sidebar section as page scrolls
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const filteredSections = SECTIONS.filter((sec) =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock compiled output text blocks
  const compilerOutputs = {
    sql: `SELECT *\nFROM data\nWHERE (age >= 18 AND country = 'Nigeria')\n  AND status = 'active';`,
    mongo: `{\n  "$and": [\n    {\n      "age": { "$gte": 18 },\n      "country": "Nigeria"\n    },\n    {\n      "status": "active"\n    }\n  ]\n}`,
    graphql: `query {\n  users (where: {\n    _and: [\n      { age: { _gte: 18 } },\n      { country: { _eq: "Nigeria" } },\n      { status: { _eq: "active" } }\n    ]\n  }) {\n    id\n    name\n    # ... fields\n  }\n}`,
  };

  const jsonSchemaExample = `{
  "schema": "users",
  "query": {
    "rootGroupId": "root",
    "groups": {
      "root": {
        "id": "root",
        "type": "AND",
        "children": ["rule_1", "rule_2"],
        "parentId": null
      }
    },
    "rules": {
      "rule_1": {
        "id": "rule_1",
        "field": "age",
        "operator": "greaterThan",
        "value": "18"
      },
      "rule_2": {
        "id": "rule_2",
        "field": "isVerified",
        "operator": "equals",
        "value": true
      }
    }
  }
}`;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      {/* SEO metadata hidden elements */}
      <h1 className="sr-only">QueryForge - Interactive Documentation and User Onboarding Guide</h1>

      {/* Background Guide Lines */}
      <div className="fixed inset-0 pointer-events-none flex justify-around opacity-[0.06] dark:opacity-[0.04] z-0">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-px h-full bg-zinc-300 dark:bg-zinc-600 relative">
            <div
              className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-blue-400/0 via-blue-500/80 to-blue-400/0 animate-beam"
              style={{
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${4 + i * 0.4}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[var(--background)]/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="focus:outline-none">
            <SVGLogo size={28} />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/builder"
              className="pill-button inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              id="docs-launch-builder-btn"
            >
              Launch Builder
              <ArrowRight size={14} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Doc Workspace Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full pt-24 pb-20 px-6 grid lg:grid-cols-[280px_1fr] gap-10 relative z-10">
        
        {/* Left Navigation Sidebar */}
        <aside className="hidden lg:block h-[calc(100vh-140px)] sticky top-28 overflow-y-auto pr-4 custom-scrollbar">
          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              id="docs-sidebar-search"
            />
          </div>

          {/* Navigation Categories */}
          <nav className="flex flex-col gap-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 px-2">
                Getting Started
              </div>
              <div className="flex flex-col gap-1">
                {filteredSections
                  .filter((s) => s.category === 'getting-started')
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeSection === s.id
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-800 dark:hover:text-zinc-200"
                      )}
                      id={`docs-nav-link-${s.id}`}
                    >
                      <span>{s.title}</span>
                      <ChevronRight
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-0 group-hover:opacity-100",
                          activeSection === s.id && "opacity-100 translate-x-0.5 text-blue-500"
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 px-2">
                Core Concepts
              </div>
              <div className="flex flex-col gap-1">
                {filteredSections
                  .filter((s) => s.category === 'concepts')
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeSection === s.id
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-800 dark:hover:text-zinc-200"
                      )}
                      id={`docs-nav-link-${s.id}`}
                    >
                      <span>{s.title}</span>
                      <ChevronRight
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-0 group-hover:opacity-100",
                          activeSection === s.id && "opacity-100 translate-x-0.5 text-blue-500"
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 px-2">
                Query Syntax
              </div>
              <div className="flex flex-col gap-1">
                {filteredSections
                  .filter((s) => s.category === 'syntax')
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeSection === s.id
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-800 dark:hover:text-zinc-200"
                      )}
                      id={`docs-nav-link-${s.id}`}
                    >
                      <span>{s.title}</span>
                      <ChevronRight
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-0 group-hover:opacity-100",
                          activeSection === s.id && "opacity-100 translate-x-0.5 text-blue-500"
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 px-2">
                Sharing & Schemas
              </div>
              <div className="flex flex-col gap-1">
                {filteredSections
                  .filter((s) => s.category === 'sharing')
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeSection === s.id
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-800 dark:hover:text-zinc-200"
                      )}
                      id={`docs-nav-link-${s.id}`}
                    >
                      <span>{s.title}</span>
                      <ChevronRight
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-0 group-hover:opacity-100",
                          activeSection === s.id && "opacity-100 translate-x-0.5 text-blue-500"
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5 px-2">
                Developer Reference
              </div>
              <div className="flex flex-col gap-1">
                {filteredSections
                  .filter((s) => s.category === 'reference')
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeSection === s.id
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-800 dark:hover:text-zinc-200"
                      )}
                      id={`docs-nav-link-${s.id}`}
                    >
                      <span>{s.title}</span>
                      <ChevronRight
                        size={12}
                        className={cn(
                          "transition-transform duration-200 opacity-0 group-hover:opacity-100",
                          activeSection === s.id && "opacity-100 translate-x-0.5 text-blue-500"
                        )}
                      />
                    </button>
                  ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Right Documentation Content Panel */}
        <article className="flex flex-col gap-16 overflow-y-visible max-w-3xl lg:pl-4">
          
          {/* SECTION 1: Introduction */}
          <div
            id="introduction"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <div className="pill-button inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold mb-4 tracking-wide uppercase">
              <BookOpen size={12} />
              Welcome to QueryForge
            </div>
            <h2 className="heading text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-4">
              QueryForge is a premium, visual schema-driven query construction workspace designed to build database and API filter queries. Through an interactive graphical interface, engineers can build simple filters or highly complex, deeply nested logic configurations, generating clean compiled syntaxes for <strong>SQL</strong>, <strong>MongoDB</strong>, and <strong>GraphQL</strong>.
            </p>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed">
              No manual query format compilation is required. The UI adapts contextually according to the defined schema types—presenting select dropdowns for enums, calendars for dates, checkboxes for booleans, and numeric controls for numerical limits—ensuring type-safe query generation with built-in schema validation.
            </p>
          </div>

          {/* SECTION 2: Quickstart Guide */}
          <div
            id="quickstart"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Quickstart Guide
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3.5">
                  1
                </div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-zinc-150 mb-1.5">
                  Choose Schema
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Select a dataset from the schema dropdown selector. Choose between <strong>Users</strong>, <strong>Products</strong>, or <strong>Orders</strong>.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3.5">
                  2
                </div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-zinc-150 mb-1.5">
                  Add Conditions
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Use the <strong>+ Rule</strong> button to create field filters. Select fields, operators, and input constraints.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3.5">
                  3
                </div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-zinc-150 mb-1.5">
                  Nesting Groups
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Click <strong>+ Group</strong> to build logical branches. Toggle parent relationships between <strong>AND</strong> and <strong>OR</strong>.
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs mb-3.5">
                  4
                </div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-zinc-150 mb-1.5">
                  Run & Inspect
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Hit <strong>Execute</strong> to execute against active mock datasets, or copy compile outputs from the right code preview pane.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: Rules and Groups */}
          <div
            id="rules-and-groups"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Rules & Logic Groups
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-6">
              QueryForge query configs are structured as hierarchical trees composed of two node types: <strong>Rules</strong> and <strong>Groups</strong>.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Filter className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200 mb-1">
                    Rules (Conditions)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    A Rule represents an individual filter condition. It consists of a <strong>Field</strong> (e.g. <code>age</code>), an <strong>Operator</strong> (e.g. <code>greaterThan</code>), and a <strong>Value</strong> (e.g. <code>18</code>). The validation engine monitors type safety (e.g. preventing you from running string searches on numeric fields).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <Layers className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200 mb-1">
                    Groups (Logical Conjunctions)
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    A Group contains children nodes, which can be rules or other nested groups. A Group links its children together using either <strong>AND</strong> (all conditions must be true) or <strong>OR</strong> (any condition can be true) logic.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-xs text-slate-650 dark:text-zinc-400">
              <div className="flex items-center gap-2 font-semibold text-slate-850 dark:text-zinc-350 mb-2">
                <Zap size={14} className="text-blue-600" />
                <span>Did you know?</span>
              </div>
              <p className="leading-relaxed">
                Visual groups support unlimited drag-and-drop depth. A vertical guide line runs down nested containers, featuring moving gradient light-beams that trace nesting bounds for visual clarity. Toggling operators automatically re-compiles SQL parentheses structure.
              </p>
            </div>
          </div>

          {/* SECTION 4: Operators Reference Table */}
          <div
            id="operators"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Operators Reference
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-6">
              QueryForge supports 10 distinct, type-aware filtering operators. Below is the mapping matrix of operator keys, their applicable types, and translations across compilers.
            </p>

            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 font-semibold text-slate-700 dark:text-zinc-300">
                    <th className="p-3">Operator</th>
                    <th className="p-3">Data Types</th>
                    <th className="p-3">SQL</th>
                    <th className="p-3">MongoDB</th>
                    <th className="p-3">GraphQL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">equals</td>
                    <td className="p-3">all</td>
                    <td className="p-3"><code>= ?</code></td>
                    <td className="p-3"><code>{`{field: val}`}</code></td>
                    <td className="p-3"><code>_eq</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">notEquals</td>
                    <td className="p-3">string, number, enum</td>
                    <td className="p-3"><code>!= ?</code></td>
                    <td className="p-3"><code>$ne</code></td>
                    <td className="p-3"><code>_neq</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">contains</td>
                    <td className="p-3">string</td>
                    <td className="p-3"><code>LIKE %val%</code></td>
                    <td className="p-3"><code>$regex, $options: 'i'</code></td>
                    <td className="p-3"><code>_ilike %val%</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">startsWith</td>
                    <td className="p-3">string</td>
                    <td className="p-3"><code>LIKE val%</code></td>
                    <td className="p-3"><code>$regex: '^val', 'i'</code></td>
                    <td className="p-3"><code>_ilike val%</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">greaterThan</td>
                    <td className="p-3">number, date</td>
                    <td className="p-3"><code>&gt; ?</code></td>
                    <td className="p-3"><code>$gt</code></td>
                    <td className="p-3"><code>_gt</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">lessThan</td>
                    <td className="p-3">number, date</td>
                    <td className="p-3"><code>&lt; ?</code></td>
                    <td className="p-3"><code>$lt</code></td>
                    <td className="p-3"><code>_lt</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">between</td>
                    <td className="p-3">number, date</td>
                    <td className="p-3"><code>BETWEEN ? AND ?</code></td>
                    <td className="p-3"><code>$gte / $lte</code></td>
                    <td className="p-3"><code>_gte / _lte</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">inList</td>
                    <td className="p-3">enum</td>
                    <td className="p-3"><code>IN (?, ?, ...)</code></td>
                    <td className="p-3"><code>$in: [...]</code></td>
                    <td className="p-3"><code>_in</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">isNull</td>
                    <td className="p-3">all except boolean</td>
                    <td className="p-3"><code>IS NULL</code></td>
                    <td className="p-3"><code>null</code></td>
                    <td className="p-3"><code>_is_null: true</code></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-850 dark:text-zinc-200">isNotNull</td>
                    <td className="p-3">all except boolean</td>
                    <td className="p-3"><code>IS NOT NULL</code></td>
                    <td className="p-3"><code>$ne: null</code></td>
                    <td className="p-3"><code>_is_null: false</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: Query Formats (SQL, MongoDB, GraphQL) */}
          <div
            id="query-formats"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Query Formats
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-6">
              QueryForge generates live, production-ready filter syntaxes. You can toggle between output types in the Preview Pane. Here is a compilation demonstration of a single filter structure across all three engines:
            </p>

            {/* Interactive Compiler Preview Component */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-lg">
              <div className="flex border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-2 gap-2">
                {(['sql', 'mongo', 'graphql'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCompilerTab(tab)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                      compilerTab === tab
                        ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200/80 dark:border-zinc-700 shadow-sm"
                        : "text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative">
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-800 dark:text-zinc-300 bg-zinc-50/30 dark:bg-black/20 leading-relaxed h-[180px]">
                  <code>{compilerOutputs[compilerTab]}</code>
                </pre>
                <button
                  onClick={() => handleCopy(compilerOutputs[compilerTab], `compiler-${compilerTab}`)}
                  className="absolute right-4 top-4 p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-750 text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all"
                  title="Copy compilation"
                >
                  {copiedText === `compiler-${compilerTab}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 6: Presets and JSON Schema */}
          <div
            id="schema-sharing"
            className="scroll-mt-24 pb-8 border-b border-zinc-200/60 dark:border-zinc-800/60"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Presets & JSON Schema
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-6">
              QueryForge query states can be shared or exported as structured JSON payloads. This schema is fully declarative, making it simple to send visual filter structures to backend APIs to parse directly.
            </p>

            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 mb-3">
              Export Schema Representation
            </h3>

            <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-800 dark:text-zinc-300 bg-zinc-50/30 dark:bg-black/20 max-h-[300px]">
                <code>{jsonSchemaExample}</code>
              </pre>
              <button
                onClick={() => handleCopy(jsonSchemaExample, 'json-schema')}
                className="absolute right-4 top-4 p-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-750 text-zinc-500 hover:text-slate-800 dark:hover:text-white rounded-lg transition-all"
                title="Copy JSON Schema"
              >
                {copiedText === 'json-schema' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            
            <div className="flex gap-4 items-start p-4 mt-6 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
              <Share2 className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-250 mb-1">
                  Importing and Exporting
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  In the builder view, click the <strong>Upload</strong> button to import any valid QueryForge schema JSON. You can save custom configurations as a local Preset inside your browser storage using the <strong>Bookmark</strong> button, or export code for backend filters immediately.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 7: Keyboard Shortcuts Matrix */}
          <div
            id="shortcuts"
            className="scroll-mt-24 pb-8"
          >
            <h2 className="heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Keyboard Shortcuts
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-350 leading-relaxed mb-6">
              QueryForge supports system keyboard shortcuts for power users to navigate the workspace. Press the modifier keys below or review the layout matrix to explore controls:
            </p>

            {/* Keyboard status visualizer */}
            <div className="flex gap-4 mb-6">
              <div className={cn(
                "px-4 py-2 border rounded-xl font-mono text-xs font-bold transition-all shadow-sm",
                isCtrlPressed 
                  ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/10 scale-105" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
              )}>
                Control / Command
              </div>
              <div className={cn(
                "px-4 py-2 border rounded-xl font-mono text-xs font-bold transition-all shadow-sm",
                isShiftPressed 
                  ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/10 scale-105" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
              )}>
                Shift
              </div>
            </div>

            {/* Keyboard Grid list */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Execute Query</h4>
                  <p className="text-[10px] text-zinc-400">Run active condition logic</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Ctrl + E
                </kbd>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Save Preset</h4>
                  <p className="text-[10px] text-zinc-400">Store configuration in workspace</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Ctrl + S
                </kbd>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Add Rule</h4>
                  <p className="text-[10px] text-zinc-400">Append condition to root group</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Ctrl + N
                </kbd>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Add Group</h4>
                  <p className="text-[10px] text-zinc-400">Append sub-conjunction group</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Ctrl + G
                </kbd>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Clear All</h4>
                  <p className="text-[10px] text-zinc-400">Reset builder query tree state</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Ctrl + Del
                </kbd>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-zinc-200 mb-0.5">Shortcuts Panel</h4>
                  <p className="text-[10px] text-zinc-400">Toggle info panel overlay</p>
                </div>
                <kbd className="px-2 py-1 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm text-slate-700 dark:text-zinc-350">
                  Shift + ?
                </kbd>
              </div>

            </div>
          </div>

        </article>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 dark:bg-black border-t border-zinc-800 text-center text-xs text-zinc-500 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full px-6 relative z-10">
        <div>
          Built with Next.js · TypeScript · Tailwind CSS — Frontend Wizards Stage 8
        </div>
        <div className="text-zinc-400">
          QueryForge &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
