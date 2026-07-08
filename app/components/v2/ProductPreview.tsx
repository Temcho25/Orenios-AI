"use client";

import StatsCards from "./StatsCards";
import TasksCard from "./TasksCard";
import CalendarCard from "./CalendarCard";
import GoalsCard from "./GoalsCard";
import AIAssistantCard from "./AIAssistantCard";

export default function ProductPreview() {
  return (
    <section
      id="preview"
      className="mx-auto mt-40 max-w-7xl px-6"
    >
      <div className="text-center">

        <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-5 py-2 text-sm font-medium text-violet-700">
          PRODUCT PREVIEW
        </div>

        <h2 className="mt-6 text-6xl font-black tracking-tight">
          Your entire life.
          <br />
          One dashboard.
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-500">
          Tasks, calendar, goals, notes and AI —
          beautifully organized inside one workspace.
        </p>

      </div>

      <div className="mt-20 rounded-[40px] border border-gray-200 bg-white p-10 shadow-[0_40px_100px_rgba(0,0,0,.08)]">

        <StatsCards />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">

          <TasksCard />

          <CalendarCard />

        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">

          <GoalsCard />

          <AIAssistantCard />

        </div>

      </div>

    </section>
  );
}