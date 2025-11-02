import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PROMPTS, INDUSTRIES, ROLES, translations } from './constants';
import { Language, Prompt } from './types';
import { generateJsonFromPrompt } from './services/geminiService';

// --- SVG Icons (defined as components for reusability) ---
const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const MarketingIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>;
const HRIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.308M15 19.128v-3.86a2.25 2.25 0 0 1 3.375-1.972 3.75 3.75 0 0 1 3.75 3.75 3.375 3.375 0 0 1-3.375 3.375h-1.5m-3.375-9.162c.522-.523 1.16-.924 1.875-1.182M15 19.128a9.37 9.37 0 0 1-1.875-1.182m-1.25-8.822c.523-.522 1.16-.923 1.875-1.182m0 0a9.37 9.37 0 0 0-1.875-1.182m-1.25 8.822-1.612 1.612a5.25 5.25 0 0 1-7.424 0 5.25 5.25 0 0 1 0-7.424l1.612-1.612m0 0a9.37 9.37 0 0 1 1.875-1.182M3.75 5.252a9.37 9.37 0 0 1 1.875-1.182" /></svg>;
const DevOpsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5 3 11.25l3.75 3.75M17.25 7.5 21 11.25l-3.75 3.75M14.25 3.75l-4.5 16.5" /></svg>;
const DesignIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const EducationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>;
const FinanceIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.75A.75.75 0 0 1 3 4.5h.75m12.75 0v.75a.75.75 0 0 0 .75.75h.75m0 0v-.75a.75.75 0 0 0-.75-.75h-.75M9 7.5h1.5m0 0h1.5m-1.5 0V9m0 0h1.5m-1.5 0V7.5m3-3h1.5m0 0h1.5m-1.5 0V9m0 0h1.5m-1.5 0V6M9 15h1.5m0 0h1.5m-1.5 0V12m0 0h1.5m-1.5 0V15m3-3h1.5m0 0h1.5m-1.5 0V12m0 0h1.5m-1.5 0V15" /></svg>;
const ProductIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75v-2.25M12 21.75V15m0 0l2.25 1.313M12 15l-2.25 1.313M3 10.5v2.25<a></a>m0 0l2.25 1.313M3 12.75l2.25 1.313M21 10.5v2.25m0 0l-2.25 1.313m-16.5 0l2.25-1.313m16.5 0l-2.25-1.313" /></svg>;
const ContentIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const LegalIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" /></svg>;
const ArchitectureIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.75M9 11.25h6.75M9 15.75h6.75M9 20.25h6.75" /></svg>;

const CATEGORY_META: { [key: string]: { icon: React.FC, color: string } } = {
  'Marketing': { icon: MarketingIcon, color: 'text-teal-500' },
  'HR': { icon: HRIcon, color: 'text-blue-500' },
  'DevOps': { icon: DevOpsIcon, color: 'text-indigo-500' },
  'Design': { icon: DesignIcon, color: 'text-purple-500' },
  'Education': { icon: EducationIcon, color: 'text-amber-500' },
  'Finance': { icon: FinanceIcon, color: 'text-green-500' },
  'Product Management': { icon: ProductIcon, color: 'text-rose-500' },
  'Content Creation': { icon: ContentIcon, color: 'text-cyan-500' },
  'Legal': { icon: LegalIcon, color: 'text-slate-500' },
  'Software Architecture': { icon: ArchitectureIcon, color: 'text-orange-500' },
};


// --- Child Components defined within App.tsx to keep file count low ---

// Header Component
const Header: React.FC<{
    language: Language;
    setLanguage: (lang: Language) => void;
    currentView: string;
    setCurrentView: (view: 'library' | 'generator') => void;
    t: { [key: string]: string };
}> = ({ language, setLanguage, currentView, setCurrentView, t }) => {
    const toggleLanguage = () => setLanguage(language === 'en' ? 'fa' : 'en');
    
    const navItemClasses = (view: string) => `px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${currentView === view ? 'bg-[#37B8AF] text-white shadow-md' : 'text-gray-300 hover:bg-slate-700'}`;

    return (
        <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <SparklesIcon className="h-8 w-8 text-[#37B8AF]" />
                        <h1 className="text-xl font-bold">{t.appName}</h1>
                    </div>
                    <nav className="hidden md:flex items-center space-x-2 bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setCurrentView('library')} className={navItemClasses('library')}>
                            {t.promptLibrary}
                        </button>
                        <button onClick={() => setCurrentView('generator')} className={navItemClasses('generator')}>
                            {t.jsonGenerator}
                        </button>
                    </nav>
                    <button
                        onClick={toggleLanguage}
                        className="px-4 py-2 border border-slate-600 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:border-[#37B8AF] transition-colors"
                    >
                        {language === 'en' ? 'فارسی' : 'English'}
                    </button>
                </div>
            </div>
        </header>
    );
};

// Filter Sidebar Component
const FilterSidebar: React.FC<{
    filters: { industry: string; role: string };
    setFilters: (filters: { industry: string; role: string }) => void;
    t: { [key: string]: string };
    language: Language;
}> = ({ filters, setFilters, t, language }) => {
    const handleFilterChange = (type: 'industry' | 'role', value: string) => {
        setFilters({ ...filters, [type]: value });
    };

    const filterOptionClasses = (isActive: boolean) =>
        `w-full text-start px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive ? 'bg-[#37B8AF] text-white shadow-md' : 'hover:bg-slate-200 hover:pl-5'
        }`;

    return (
        <aside className="w-full md:w-64 lg:w-72 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg h-fit sticky top-24 border border-slate-200">
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.industry}</h3>
                    <div className="space-y-1.5">
                        {INDUSTRIES.map(industry => (
                            <button
                                key={industry}
                                onClick={() => handleFilterChange('industry', industry)}
                                className={filterOptionClasses(filters.industry === industry)}
                            >
                                {industry === 'All' ? t.all : industry}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.role}</h3>
                    <div className="space-y-1.5">
                        {ROLES.map(role => (
                            <button
                                key={role}
                                onClick={() => handleFilterChange('role', role)}
                                className={filterOptionClasses(filters.role === role)}
                            >
                                {role === 'All' ? t.all : role}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};


// Prompt Card Component
const PromptCard: React.FC<{ prompt: Prompt; language: Language; t: { [key: string]: string } }> = ({ prompt, language, t }) => {
    const [expanded, setExpanded] = useState(false);
    const { icon: CategoryIcon, color } = CATEGORY_META[prompt.category] || { icon: SparklesIcon, color: 'text-gray-500' };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-slate-200 flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
                        <CategoryIcon />
                        <span>{prompt.category}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-800">{language === 'en' ? prompt.title_en : prompt.title_fa}</h3>
                    {language === 'en' && <p className="text-sm text-gray-500 mt-1" dir="rtl">{prompt.title_fa}</p>}
                    {language === 'fa' && <p className="text-sm text-gray-500 mt-1" dir="ltr">{prompt.title_en}</p>}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {(language === 'en' ? prompt.tags_en : prompt.tags_fa).map(tag => (
                        <span key={tag} className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                    ))}
                </div>
                <div className={`prompt-details ${expanded ? 'expanded' : ''}`}>
                    <div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: (language === 'en' ? prompt.prompt_en : prompt.prompt_fa).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 mt-auto">
                 <button onClick={() => setExpanded(!expanded)} className="w-full text-center px-4 py-2 text-sm font-semibold text-[#37B8AF] hover:bg-teal-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400">
                    {expanded ? t.showLess : t.showDetails}
                </button>
            </div>
        </div>
    );
};

// Prompt Library Main Component
const PromptLibrary: React.FC<{ t: { [key: string]: string }; language: Language }> = ({ t, language }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ industry: 'All', role: 'All' });

    const filteredPrompts = useMemo(() => {
        return PROMPTS.filter(p => {
            const matchesSearch = searchTerm === '' ||
                p.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.title_fa.includes(searchTerm);
            const matchesIndustry = filters.industry === 'All' || p.industry === filters.industry;
            const matchesRole = filters.role === 'All' || p.role === filters.role;
            return matchesSearch && matchesIndustry && matchesRole;
        });
    }, [searchTerm, filters]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <FilterSidebar filters={filters} setFilters={setFilters} t={t} language={language}/>
                <main className="flex-1">
                    <div className="relative mb-8">
                        <input
                            type="text"
                            placeholder={t.searchPrompts}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-4 ps-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#37B8AF] focus:border-[#37B8AF] transition-shadow shadow-sm"
                        />
                        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-gray-400">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredPrompts.map(prompt => (
                            <PromptCard key={prompt.id} prompt={prompt} language={language} t={t} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

// JSON Prompt Generator Component
const JsonPromptGenerator: React.FC<{ t: { [key: string]: string } }> = ({ t }) => {
    const [naturalPrompt, setNaturalPrompt] = useState('');
    const [generatedJson, setGeneratedJson] = useState<object | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!naturalPrompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setGeneratedJson(null);
        try {
            const result = await generateJsonFromPrompt(naturalPrompt);
            setGeneratedJson(result);
        } catch (err) {
            setError(t.errorOccurred);
        } finally {
            setIsLoading(false);
        }
    }, [naturalPrompt, t.errorOccurred]);

    const handleCopy = () => {
        if (!generatedJson) return;
        navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto text-center">
                 <div className="inline-block p-4 bg-teal-100 rounded-2xl mb-4">
                    <SparklesIcon className="h-10 w-10 text-[#37B8AF]" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">{t.jsonGenerator}</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.generateJsonFromPrompt}</p>
            </div>
            <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <textarea
                    value={naturalPrompt}
                    onChange={(e) => setNaturalPrompt(e.target.value)}
                    placeholder={t.enterPromptHere}
                    className="w-full h-36 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#37B8AF] focus:border-[#37B8AF] transition resize-none text-base"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !naturalPrompt.trim()}
                    className="mt-5 w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#37B8AF] hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37B8AF] transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                >
                    {isLoading ? t.generating : t.generateJson}
                </button>

                {error && <p className="mt-4 text-center text-red-600">{error}</p>}

                {generatedJson && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold text-slate-800">{t.jsonOutput}</h3>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-slate-200 hover:bg-slate-300 transition-colors"
                            >
                                {copied ? <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>{t.copied}</> : <><CopyIcon className="w-4 h-4" />{t.copy}</>}
                            </button>
                        </div>
                        <pre className="bg-slate-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{JSON.stringify(generatedJson, null, 2)}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
    const [language, setLanguage] = useState<Language>('fa');
    const [currentView, setCurrentView] = useState<'library' | 'generator'>('library');
    const t = translations[language];

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    }, [language]);

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <Header
                language={language}
                setLanguage={setLanguage}
                currentView={currentView}
                setCurrentView={setCurrentView}
                t={t}
            />
            <main className={language === 'fa' ? 'font-vazir' : ''}>
                {currentView === 'library' ? <PromptLibrary t={t} language={language} /> : <JsonPromptGenerator t={t} />}
            </main>
        </div>
    );
}
