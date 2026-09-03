import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { getStories } from "./contentful";

const categories = ["Fiction", "Poetry", "Essays", "Flash fiction"];

const richTextOptions = {
    renderMark: {
        [MARKS.BOLD]: (text) => <strong>{ text }</strong>,
        [MARKS.ITALIC]: (text) => <em>{ text }</em>,
        [MARKS.CODE]: (text) => <code className="rounded bg-line px-1.5 py-0.5 text-sm">{ text }</code>,
    },
    renderNode: {
        [BLOCKS.HEADING_2]: (_, children) => <h2>{ children }</h2>,
        [BLOCKS.HEADING_3]: (_, children) => <h3>{ children }</h3>,
        [BLOCKS.UL_LIST]: (_, children) => <ul>{ children }</ul>,
        [BLOCKS.OL_LIST]: (_, children) => <ol>{ children }</ol>,
        [BLOCKS.QUOTE]: (_, children) => <blockquote>{ children }</blockquote>,
        [BLOCKS.PARAGRAPH]: (_, children) => <p>{ children }</p>,
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
            const asset = node.data.target;
            const url = asset?.fields?.file?.url;
            if (!url) return null;
            const imageUrl = `${url.startsWith("//") ? "https:" : ""}${url}?w=1000&q=80&fm=webp`;
            return <img src={ imageUrl } alt={ asset.fields.title || "Story illustration" } loading="lazy" />;
        },
        [BLOCKS.EMBEDDED_ENTRY]: (node) => {
            const entry = node.data.target;
            const title = entry?.fields?.title || entry?.fields?.name;
            return title ? <aside className="rounded border border-line bg-white p-5"><strong>{ title }</strong></aside> : null;
        },
        [INLINES.EMBEDDED_ENTRY]: (node) => {
            const title = node.data.target?.fields?.title || node.data.target?.fields?.name;
            return title ? <span className="font-semibold text-berry">{ title }</span> : null;
        },
        [INLINES.HYPERLINK]: (node, children) => <a href={ node.data.uri } target="_blank" rel="noreferrer">{ children }</a>,
    },
};

function Layout({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return <div className="flex min-h-screen flex-col bg-paper text-ink">
        <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between px-5 py-4" aria-label="Main navigation">
                <Link to="/" onClick={ closeMenu } className="font-serif text-2xl font-semibold">Little Stories <span className="text-berry">.</span></Link>
                <button type="button" onClick={ () => setMenuOpen((open) => !open) } aria-expanded={ menuOpen } aria-controls="main-menu" aria-label={ menuOpen ? "Close menu" : "Open menu" } className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded border border-line bg-white text-indigo md:hidden">
                    <span className={ `h-0.5 w-5 bg-current transition ${menuOpen ? "translate-y-2 rotate-45" : ""}` } />
                    <span className={ `h-0.5 w-5 bg-current transition ${menuOpen ? "opacity-0" : ""}` } />
                    <span className={ `h-0.5 w-5 bg-current transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}` } />
                </button>
                <div id="main-menu" className={ `${menuOpen ? "flex" : "hidden"} w-full flex-col gap-4 border-t border-line pt-4 text-sm font-medium text-ink-soft md:flex md:w-auto md:flex-row md:gap-5 md:border-0 md:pt-0` }>
                    <NavLink to="/blog" onClick={ closeMenu } className={ ({ isActive }) => isActive ? "text-berry" : "hover:text-berry" }>Blog</NavLink>
                    <NavLink to="/categories" onClick={ closeMenu } className={ ({ isActive }) => isActive ? "text-berry" : "hover:text-berry" }>Categories</NavLink>
                    <NavLink to="/about" onClick={ closeMenu } className={ ({ isActive }) => isActive ? "text-berry" : "hover:text-berry" }>About</NavLink>
                </div>
            </nav>
        </header>
        <div className="flex-1">{ children }</div>
        <footer className="border-t border-line bg-[#f3eadb] px-5 py-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-7 md:flex-row md:items-end md:justify-between">
                <div>
                    <Link to="/" className="font-serif text-2xl font-semibold">Little Stories <span className="text-berry">.</span></Link>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">A small home for short things: fiction, poetry, essays and flash fiction.</p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink-soft">
                    <Link to="/" className="hover:text-berry">Home</Link>
                    <Link to="/blog" className="hover:text-berry">Blog</Link>
                    <Link to="/categories" className="hover:text-berry">Categories</Link>
                    <Link to="/about" className="hover:text-berry">About</Link>
                </div>
            </div>
            <div className="mx-auto mt-8 max-w-5xl border-t border-line pt-5 text-xs text-ink-soft">© { new Date().getFullYear() } Little Stories. All rights reserved.</div>
        </footer>
    </div>;
}

function LoadingState() { return <div className="mx-auto max-w-5xl px-5 py-24 text-ink-soft">Loading stories...</div>; }
function ErrorState({ onRetry }) { return <div className="mx-auto max-w-5xl px-5 py-24 text-center"><h1 className="font-serif text-3xl">Stories are taking a quiet moment.</h1><p className="mt-3 text-ink-soft">We could not connect to the story archive.</p><button onClick={ onRetry } className="mt-6 rounded bg-indigo px-5 py-2 text-paper">Try again</button></div>; }
function EmptyState({ label = "No stories found." }) { return <p className="py-12 text-ink-soft">{ label }</p>; }

function StoryCard({ story }) {
    return <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-berry hover:shadow-lg">
        { story.image && <img src={ story.image } alt={ story.title } loading="lazy" className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /> }
        <div className="flex min-h-56 flex-col gap-3 p-5">
            <Link to={ `/blog/${story.slug}` } className="font-serif text-xl font-semibold leading-tight transition-colors group-hover:text-berry">{ story.title }</Link>
            <p className="line-clamp-3 text-sm leading-6 text-ink-soft">{ story.excerpt }</p>
            <div className="mt-auto border-t border-line pt-3 text-xs text-ink-soft">{ story.author && `By ${story.author} · ` }{ story.minutes } min read</div>
        </div>
    </article>;
}

function Home({ stories }) {
    const featured = stories.find((story) => story.featured) || stories[0];
    const latest = stories.filter((story) => story.id !== featured?.id).slice(0, 6);
    return <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="py-16 md:py-24"><p className="mb-3 text-sm font-semibold uppercase tracking-widest text-berry">A small home for short things</p><h1 className="max-w-2xl font-serif text-4xl font-semibold leading-tight md:text-6xl">Fiction, poetry and essays you can read on one coffee.</h1><Link to="/blog" className="mt-8 inline-block rounded bg-indigo px-5 py-3 text-sm font-semibold text-paper">Explore the collection</Link></section>
        { featured && <section className="mb-16"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-berry">Featured story</p><Link to={ `/blog/${featured.slug}` } className="group relative block min-h-96 overflow-hidden rounded-lg bg-indigo">{ featured.image && <img src={ featured.image } alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-60 transition group-hover:scale-105" /> }<div className="relative flex min-h-96 max-w-2xl flex-col justify-end p-7 text-paper md:p-12"><span className="text-sm text-gold">{ featured.category }</span><h2 className="mt-3 font-serif text-3xl font-semibold md:text-5xl">{ featured.title }</h2><p className="mt-3 text-sm text-paper/80">{ featured.author } · { featured.minutes } min read</p></div></Link></section> }
        <section><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-semibold">Latest stories</h2><Link to="/blog" className="text-sm font-semibold text-berry">See all</Link></div>{ latest.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ latest.map((story) => <StoryCard key={ story.id } story={ story } />) }</div> : <EmptyState /> }</section>
    </main>;
}

function About() {
    return <main className="mx-auto max-w-5xl px-5 py-16 pb-24 md:py-24">
        <Link to="/" className="text-sm font-semibold text-berry hover:text-indigo">← Back to home</Link>
        <div className="grid gap-12 md:grid-cols-[1.1fr_.9fr] md:items-end">
            <section>
                <p className="text-sm font-semibold uppercase tracking-widest text-berry">About the journal</p>
                <h1 className="mt-4 max-w-2xl font-serif text-5xl font-semibold leading-tight md:text-7xl">Small stories. Long echoes.</h1>
            </section>
            <p className="max-w-md border-l-2 border-gold pl-5 text-lg leading-8 text-ink-soft">Little Stories is a quiet home for complete, concentrated things: fiction, poetry and essays made for the space between one thought and the next.</p>
        </div>
        <div className="mt-16 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-berry">Our rule</p><h2 className="mt-3 font-serif text-3xl font-semibold">Leave before the coffee gets cold.</h2></div>
            <p className="leading-8 text-ink-soft">There are no chapters to keep track of and no scrolling marathon waiting at the end. Just small works, honestly told, designed to be read in one breath and thought about for much longer.</p>
        </div>
        <Link to="/blog" className="mt-12 inline-block rounded bg-indigo px-5 py-3 text-sm font-semibold text-paper">Read the archive</Link>
    </main>;
}

function Blog({ stories }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const categories = [...new Set(stories.map((story) => story.category).filter(Boolean))];
    const filtered = stories.filter((story) => story.title.toLowerCase().includes(query.toLowerCase()) && (!category || story.category === category));
    return <main className="mx-auto max-w-5xl px-5 py-14 pb-20"><Link to="/" className="text-sm font-semibold text-berry hover:text-indigo">← Back to home</Link><div className="mb-10 mt-8"><p className="text-sm font-semibold uppercase tracking-widest text-berry">The archive</p><h1 className="mt-2 font-serif text-5xl font-semibold">All stories</h1></div><div className="mb-8 flex flex-col gap-3 sm:flex-row"><input value={ query } onChange={ (event) => setQuery(event.target.value) } placeholder="Search by title" aria-label="Search stories by title" className="min-h-11 flex-1 rounded border border-line bg-white px-4 outline-berry" /><select value={ category } onChange={ (event) => setCategory(event.target.value) } aria-label="Filter by category" className="min-h-11 rounded border border-line bg-white px-4"><option value="">All categories</option>{ categories.map((item) => <option key={ item }>{ item }</option>) }</select></div>{ filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ filtered.map((story) => <StoryCard key={ story.id } story={ story } />) }</div> : <EmptyState label="No stories match those filters." /> }</main>;
}

function Categories({ stories }) {
    return <main className="mx-auto max-w-5xl px-5 py-14 pb-20">
        <Link to="/" className="text-sm font-semibold text-berry hover:text-indigo">← Back to home</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-berry">Browse by mood</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold">Categories</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-ink-soft">Four shelves for stories that stay with you.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            { categories.map((category) => {
                const slug = category.toLowerCase().replace(/\s+/g, "-");
                const count = stories.filter((story) => story.category === category).length;
                return <Link key={ category } to={ `/category/${slug}` } className="group min-h-36 rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-berry hover:shadow-lg">
                    <span className="text-xs font-semibold uppercase tracking-widest text-berry">0{ categories.indexOf(category) + 1 }</span>
                    <h2 className="mt-8 font-serif text-2xl font-semibold group-hover:text-berry">{ category }</h2>
                    <p className="mt-2 text-xs text-ink-soft">{ count } { count === 1 ? "story" : "stories" }</p>
                </Link>;
            }) }
        </div>
    </main>;
}

function Category({ stories }) {
    const { slug } = useParams();
    const categoryStories = stories.filter((story) => story.categorySlug === slug || story.category.toLowerCase() === slug.replace(/-/g, " "));
    const title = categoryStories[0]?.category || slug.replace(/-/g, " ");
    return <main className="mx-auto max-w-5xl px-5 py-14 pb-20"><Link to="/blog" className="text-sm font-semibold text-berry">← Back to archive</Link><h1 className="mt-8 font-serif text-5xl font-semibold">{ title }</h1>{ categoryStories.length ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ categoryStories.map((story) => <StoryCard key={ story.id } story={ story } />) }</div> : <EmptyState label="This category has no published stories yet." /> }</main>;
}

function Story({ stories }) {
    const { slug } = useParams();
    const story = stories.find((item) => item.slug === slug || item.id === slug);
    if (!story) return <NotFound />;
    const related = stories.filter((item) => item.id !== story.id && item.category === story.category).slice(0, 3);
    return <main className="mx-auto max-w-3xl px-5 py-12 pb-20"><Link to="/blog" className="text-sm font-semibold text-berry">← Back to archive</Link><article className="mt-10"><div className="text-xs font-semibold uppercase tracking-widest text-berry">{ story.category }</div><h1 className="mt-4 font-serif text-4xl font-semibold leading-tight md:text-6xl">{ story.title }</h1><div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-soft"><span>{ story.author }</span><span>·</span><time dateTime={ story.publishedDate }>{ new Date(story.publishedDate).toLocaleDateString() }</time><span>·</span><span>{ story.minutes } min read</span></div>{ story.image && <img src={ story.image } alt={ story.title } loading="lazy" className="mt-10 max-h-[32rem] w-full rounded-lg object-cover" /> }<p className="mt-10 border-l-4 border-gold pl-5 font-serif text-xl italic leading-8 text-ink-soft">{ story.excerpt }</p><div className="rich-text mt-10 text-lg leading-8">{ story.content ? documentToReactComponents(story.content, richTextOptions) : <EmptyState label="This story has no content yet." /> }</div></article>{ story.authorDetails && <aside className="mt-14 flex gap-4 border-t border-line pt-6"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-line">{ story.authorDetails.avatar && <img src={ story.authorDetails.avatar } alt="" loading="lazy" className="h-full w-full object-cover" /> }</div><div><h2 className="font-semibold">{ story.authorDetails.name }</h2><p className="text-sm text-ink-soft">{ story.authorDetails.role }</p><p className="mt-1 text-sm text-ink-soft">{ story.authorDetails.bio }</p></div></aside> }{ related.length > 0 && <section className="mt-16 border-t border-line pt-8"><h2 className="mb-6 font-serif text-3xl font-semibold">More from { story.category }</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ related.map((item) => <StoryCard key={ item.id } story={ item } />) }</div></section> }</main>;
}

function NotFound() { return <main className="mx-auto max-w-5xl px-5 py-24 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-berry">404</p><h1 className="mt-3 font-serif text-5xl font-semibold">Page not found</h1><p className="mt-4 text-ink-soft">The story you are looking for has wandered off the page.</p><Link to="/" className="mt-8 inline-block rounded bg-indigo px-5 py-3 text-sm font-semibold text-paper">Return home</Link></main>; }

function AppContent() {
    const [stories, setStories] = useState([]);
    const [status, setStatus] = useState("loading");
    const loadStories = () => {
        setStatus("loading");
        getStories().then((items) => { setStories(items); setStatus("ready"); }).catch((error) => { console.error(error); setStatus("error"); });
    };
    useEffect(() => {
        getStories().then((items) => { setStories(items); setStatus("ready"); }).catch((error) => { console.error(error); setStatus("error"); });
    }, []);
    if (status === "loading") return <Layout><LoadingState /></Layout>;
    if (status === "error") return <Layout><ErrorState onRetry={ loadStories } /></Layout>;
    return <Layout><Routes><Route path="/" element={ <Home stories={ stories } /> } /><Route path="/blog" element={ <Blog stories={ stories } /> } /><Route path="/blog/:slug" element={ <Story stories={ stories } /> } /><Route path="/categories" element={ <Categories stories={ stories } /> } /><Route path="/category/:slug" element={ <Category stories={ stories } /> } /><Route path="/about" element={ <About /> } /><Route path="*" element={ <NotFound /> } /></Routes></Layout>;
}

export default function App() { return <BrowserRouter><AppContent /></BrowserRouter>; }

