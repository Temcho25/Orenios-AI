"use client";

import OverviewContent from "./overview/OverviewContent";
import TasksCard from "./TasksCard";
import GoalsCard from "./GoalsCard";
import CalendarCard from "./CalendarCard";
import NotesCard from "./NotesCard";
import AICoach from "./AICoach";

export function getSectionTitle(activeItem: string) {
  switch (activeItem) {
    case "Tasks":
      return "Organize today’s work.";
    case "Goals":
      return "Turn your plans into progress.";
    case "Calendar":
      return "See what’s coming next.";
    case "Notes":
      return "Keep your thoughts organized.";
    case "AI Coach":
      return "Your intelligent life assistant.";
    default:
      return activeItem;
  }
}

type DashboardContentProps = {
  activeItem: string;
  firstName: string;
  onNavigate: (item: string) => void;
};

export function DashboardContent({
  activeItem,
  firstName,
  onNavigate,
}: DashboardContentProps) {
  if (activeItem === "Overview") {
    return (
      <OverviewContent
        firstName={firstName}
        onNavigate={onNavigate}
      />
    );
  }

  if (activeItem === "Tasks") {
    return (
      <SectionPage
        eyebrow="Daily execution"
        title="Tasks"
        description="Capture, complete and securely sync everything that needs your attention."
      >
        <TasksCard />
      </SectionPage>
    );
  }

  if (activeItem === "Goals") {
    return (
      <SectionPage
        eyebrow="Long-term direction"
        title="Goals"
        description="Define meaningful outcomes, set deadlines and keep your progress visible."
      >
        <GoalsCard />
      </SectionPage>
    );
  }

  if (activeItem === "Calendar") {
    return (
      <SectionPage
        eyebrow="Time and schedule"
        title="Calendar"
        description="Organize your events, choose your priorities and keep every important commitment visible."
      >
        <CalendarCard />
      </SectionPage>
    );
  }

  if (activeItem === "Notes") {
    return (
      <SectionPage
        eyebrow="Knowledge and ideas"
        title="Notes"
        description="Capture ideas, organize important information and quickly find everything you want to remember."
      >
        <NotesCard />
      </SectionPage>
    );
  }

  if (activeItem === "AI Coach") {
    // No SectionPage hero here on purpose: AICoach already renders its
    // own compact "Orenios AI Coach" header, and the chat itself should
    // be the first thing visible on load, not pushed below a second,
    // taller intro block.
    return <AICoach />;
  }

  return <ComingSoonContent title={activeItem} />;
}

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SectionPage({
  eyebrow,
  title,
  description,
  children,
}: SectionPageProps) {
  return (
    <div className="space-y-6">
      {/* Always dark, regardless of the workspace theme toggle — this is a
          fixed brand accent band (same idea as landing's dark surfaces and
          the cta-gradient buttons), not a themed surface, so its text stays
          hardcoded white rather than following --foreground. */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-dark-card px-6 py-7 text-white shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-violet-600/35 blur-[85px]" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-[95px]" />
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-violet-300">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      {children}
    </div>
  );
}

export function ComingSoonContent({ title }: { title: string }) {
  return (
    <div className="flex min-h-[65vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-card-border bg-card p-10 text-center backdrop-blur-[12px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/15 text-accent-violet">
          <span className="text-xl">✦</span>
        </div>

        <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {title} is coming next.
        </h2>

        <p className="mt-4 text-sm leading-6 text-foreground/50">
          This section is already part of the Orenios workspace and will be
          connected to real user data as we build the product.
        </p>
      </div>
    </div>
  );
}
