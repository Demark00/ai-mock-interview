import React from "react";
import Image from "next/image";
import Link from "next/link";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";

import {
  getInterviewByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews = [], latestInterviews = []] = await Promise.all([
    // Only fetch user interviews when we have a user id. Otherwise resolve to an empty array.
    user?.id ? getInterviewByUserId(user.id) : Promise.resolve([]),
    // Pass the userId optionally (may be undefined) to latest interviews fetch.
    getLatestInterviews({ userId: user?.id ?? "" }),
  ]);

  // userInterviews and latestInterviews default to empty arrays, so .length is safe
  const hasPastInterviews = (userInterviews ?? []).length > 0;
  const hasUpcomingInterviews = (latestInterviews ?? []).length > 0;
  const totalInterviews = (userInterviews ?? []).length;
  const availableInterviews = (latestInterviews ?? []).length;
  const pastInterviewList = userInterviews ?? [];
  const upcomingInterviewList = latestInterviews ?? [];

  return (
    <section className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#1F2230] via-[#151824] to-[#0C0D13] px-6 py-8 md:px-10 md:py-10">
        <div className="absolute -top-16 right-0 h-56 w-56 rounded-full bg-primary-200/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.2em] text-primary-200/80">
                AI Interview Practice
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
                Get interview-ready with realistic practice and instant feedback.
              </h1>
              <p className="max-w-xl text-lg text-light-100">
                Practice role-specific questions, review detailed feedback, and track your progress over time.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/interview" className="btn-primary flex min-h-12 items-center justify-center px-6">
                Start an Interview
              </Link>

              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-light-100">
                {availableInterviews} upcoming interviews available
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-light-400">Past interviews</p>
                <p className="mt-1 text-2xl font-bold text-white">{totalInterviews}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-light-400">Available now</p>
                <p className="mt-1 text-2xl font-bold text-white">{availableInterviews}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-light-400">Feedback</p>
                <p className="mt-1 text-2xl font-bold text-white">Instant</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative max-w-sm rounded-4xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
              <Image
                src="/robot.png"
                alt="AI interviewer illustration"
                width={460}
                height={460}
                className="h-auto w-full"
              />

              <div className="absolute -bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-dark-200/90 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-light-400">Ready to practice</p>
                <p className="text-sm text-light-100">Pick an interview and start a guided session in minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Step 1</p>
          <p className="mt-1 font-semibold text-white">Choose an interview</p>
          <p className="text-sm text-light-100">Start from your saved sessions or select a fresh prompt.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Step 2</p>
          <p className="mt-1 font-semibold text-white">Answer naturally</p>
          <p className="text-sm text-light-100">The interviewer follows up based on your responses.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Step 3</p>
          <p className="mt-1 font-semibold text-white">Review feedback</p>
          <p className="text-sm text-light-100">Get structured scoring, strengths, and improvement areas.</p>
        </div>
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-200/80">Your activity</p>
            <h2>Your Interviews</h2>
          </div>

          <p className="text-light-100">
            {hasPastInterviews ? "Recent practice sessions and completed feedback." : "No completed interviews yet."}
          </p>
        </div>

        <div className="interviews-section">
          {hasPastInterviews ? (
            pastInterviewList.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <div className="w-full rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-light-100">
              You haven&apos;t taken any interviews yet. Start one to see your feedback here.
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary-200/80">Practice pool</p>
            <h2>Take an interview</h2>
          </div>

          <p className="text-light-100">
            {hasUpcomingInterviews ? "Choose a role to practice next." : "No interviews available right now."}
          </p>
        </div>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            upcomingInterviewList.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <div className="w-full rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-light-100">
              There are no interviews available at the moment.
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default page;
