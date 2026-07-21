import { Mic } from "lucide-react";

/**
 * Stage 1 of the hero's chaos-to-orbit story: a believable voice
 * transcript, styled deliberately unlike a generic chat bubble so it
 * reads as "the user just spoke this" rather than "the user typed into
 * a chatbot."
 */
export default function HeroConversationInput() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:px-5 sm:py-4">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400"
        >
          <Mic className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </span>

        <div className="flex items-end gap-[3px]" aria-hidden="true">
          <span className="voice-wave-bar voice-wave-bar-1 h-3 w-[3px] rounded-full bg-violet-300/70" />
          <span className="voice-wave-bar voice-wave-bar-2 h-4 w-[3px] rounded-full bg-violet-300/70" />
          <span className="voice-wave-bar voice-wave-bar-3 h-2.5 w-[3px] rounded-full bg-cyan-300/70" />
          <span className="voice-wave-bar voice-wave-bar-4 h-4 w-[3px] rounded-full bg-cyan-300/70" />
          <span className="voice-wave-bar voice-wave-bar-5 h-2 w-[3px] rounded-full bg-violet-300/70" />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          You say
        </p>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-200 sm:text-[15px] sm:leading-7">
        &ldquo;Tomorrow I have boxing at 9, work at 12, remind me to call
        Alex, and move the gym to Saturday.&rdquo;
      </p>
    </div>
  );
}
