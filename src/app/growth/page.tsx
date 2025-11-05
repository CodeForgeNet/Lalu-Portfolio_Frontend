import resume from "@/data/resume.json";
import { BookOpen, Lightbulb } from "lucide-react";

type CurrentFocus = {
  courses?: Array<{
    platform?: string;
    title?: string;
    summary?: string;
    status?: string;
  }>;
  books?: Array<{ title?: string; author?: string; summary?: string }>;
  side_projects?: Array<{ title?: string; summary?: string }>;
  current_goals?: string[];
};

const CurrentFocusSection = ({
  current_focus,
}: {
  current_focus: CurrentFocus;
}) => {
  const {
    courses = [],
    books = [],
    side_projects = [],
    current_goals = [],
  } = current_focus || {};

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-semibold mb-6">Current Focus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c, i) => (
          <div
            key={i}
            className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="text-green-400" />
              <h3 className="text-xl font-medium text-white">{c.title}</h3>
            </div>
            {c.platform && (
              <p className="text-slate-400 text-sm">Platform: {c.platform}</p>
            )}
            {c.summary && <p className="mt-3 text-slate-300">{c.summary}</p>}
            {c.status && (
              <p className="mt-3 text-sm text-slate-400">Status: {c.status}</p>
            )}
          </div>
        ))}

        {books.map((b, i) => (
          <div
            key={`book-${i}`}
            className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="text-yellow-400" />
              <h3 className="text-xl font-medium text-white">{b.title}</h3>
            </div>
            {b.author && (
              <p className="text-slate-400 text-sm">by {b.author}</p>
            )}
            {b.summary && <p className="mt-3 text-slate-300">{b.summary}</p>}
          </div>
        ))}
      </div>

      {side_projects.length > 0 && (
        <div className="mt-8">
          <h4 className="text-2xl font-semibold mb-3">Side Projects</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {side_projects.map((p, i) => (
              <div
                key={`sp-${i}`}
                className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
              >
                <h5 className="font-medium text-white">{p.title}</h5>
                {p.summary && (
                  <p className="text-slate-300 text-sm mt-1">{p.summary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {current_goals.length > 0 && (
        <div className="mt-8">
          <h4 className="text-2xl font-semibold mb-3">Current Goals</h4>
          <ul className="list-disc list-inside text-slate-300 space-y-2">
            {current_goals.map((g: string, i: number) => (
              <li key={`goal-${i}`} className="flex items-start">
                <span className="h-2 w-2 mt-2 mr-2 bg-blue-400 rounded-full shrink-0"></span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

type RecommendationItem =
  | string
  | {
      name?: string;
      title?: string;
      author?: string;
      platform?: string;
      reason?: string;
      note?: string;
      link?: string;
    };

const RecommendationCategory = ({
  category,
  items,
}: {
  category: string;
  items: RecommendationItem[];
}) => {
  const renderItem = (item: RecommendationItem) => {
    if (!item) return null;
    if (typeof item === "string")
      return <p className="text-slate-300">{item}</p>;

    return (
      <div className="space-y-1">
        {item.name && <div className="text-white font-medium">{item.name}</div>}
        {item.title && (
          <div className="text-white font-medium">{item.title}</div>
        )}
        {item.author && (
          <div className="text-slate-400 text-sm">by {item.author}</div>
        )}
        {item.platform && (
          <div className="text-slate-400 text-sm">
            Platform: {item.platform}
          </div>
        )}
        {item.reason && <div className="text-slate-300">{item.reason}</div>}
        {item.note && <div className="text-slate-300 text-sm">{item.note}</div>}
        {item.link && (
          <a
            className="text-green-400 hover:underline text-sm block"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Link
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
      <h3 className="text-xl font-semibold text-white mb-4">{category}</h3>
      <div className="grid grid-cols-1 gap-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="p-4 rounded-md bg-slate-900/40 border border-slate-700/60"
          >
            {renderItem(it)}
          </div>
        ))}
      </div>
    </div>
  );
};

const RecommendationsSection = ({
  recommendations,
}: {
  recommendations: Recommendations;
}) => {
  const {
    title,
    subtitle,
    sections = [],
    footer_note,
  } = recommendations || ({} as Recommendations);
  const sectionsTyped = sections as Array<{
    category: string;
    items: RecommendationItem[];
  }>;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-semibold">
            {title || "Recommendations"}
          </h2>
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionsTyped.map((s, idx) => (
          <RecommendationCategory
            key={idx}
            category={s.category}
            items={s.items || []}
          />
        ))}
      </div>

      {footer_note && <p className="mt-6 text-slate-400">{footer_note}</p>}
    </section>
  );
};

type Recommendations = {
  title?: string;
  subtitle?: string;
  sections?: Array<{ category: string; items: RecommendationItem[] }>;
  footer_note?: string;
};

export default function GrowthPage() {
  const data = resume as unknown as {
    summary?: string;
    current_focus?: CurrentFocus;
    recommendations?: Recommendations;
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-blue-500">
            Growth & Experience
          </h1>
          <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto">
            {data.summary || "My professional journey and learning."}
          </p>
        </div>

        {/* Current Focus first */}
        <CurrentFocusSection current_focus={data.current_focus || {}} />

        {/* Recommendations below */}
        <RecommendationsSection recommendations={data.recommendations || {}} />
      </div>
    </div>
  );
}
