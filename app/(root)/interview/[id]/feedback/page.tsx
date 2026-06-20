import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import Link from "next/link";

const getScoreColor = (score: number) => {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
};

const clampScore = (score: number) => Math.max(0, Math.min(score, 100));

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id!,
  });

  if (!feedback) redirect("/");

  const totalScore = clampScore(feedback.totalScore);

  return (
    <section className="section-feedback mx-auto max-w-6xl gap-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#1F2230] via-[#151824] to-[#0C0D13] px-6 py-8 md:px-10 md:py-10">
        <div className="absolute -top-14 -right-10 h-44 w-44 rounded-full bg-primary-200/15 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-52 w-52 rounded-full bg-green-500/10 blur-3xl" />

        <div className="relative space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-primary-200/80">
            AI Mock Interview
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">Interview Feedback Report</h1>

          <p className="text-light-100">
            {interview.role} Interview • {interview.type}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="card-border w-full lg:col-span-7">
          <div className="card flex h-full flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.15em] text-light-400">Overall Result</p>
                <h2 className="text-2xl font-semibold md:text-3xl">{getScoreLabel(totalScore)}</h2>
                <p className="text-light-100">
                  Your aggregate performance score across all evaluated dimensions.
                </p>
              </div>

              <div className="mx-auto sm:mx-0">
                <div
                  className={`flex h-36 w-36 items-center justify-center rounded-full text-4xl font-bold text-white shadow-[0_0_40px_rgba(0,0,0,0.45)] ${getScoreColor(
                    totalScore
                  )}`}
                >
                  {totalScore}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-light-100">
                <span>Score Progress</span>
                <span className="font-semibold">{totalScore}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-dark-300">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreColor(
                    totalScore
                  )}`}
                  style={{ width: `${totalScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-border w-full lg:col-span-5">
          <div className="card flex h-full flex-col justify-between gap-5 p-6 md:p-8">
            <h3 className="text-xl font-semibold">Interview Snapshot</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-dark-200/70 px-4 py-3">
                <Image src="/calendar.svg" alt="calendar" width={20} height={20} />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-light-400">Generated On</p>
                  <p className="text-light-100">
                    {dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-dark-200/70 px-4 py-3">
                <Image src="/star.svg" alt="score" width={20} height={20} />
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-light-400">Overall Score</p>
                  <p className="text-light-100">
                    <strong>{totalScore}/100</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-light-100">
                Keep iterating with targeted practice and retake this interview to improve your final score.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-border w-full">
        <div className="card space-y-4 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Final Assessment</h2>
          <p className="leading-7 text-light-100">{feedback.finalAssessment}</p>
        </div>
      </div>

      <div className="card-border w-full">
        <div className="card space-y-6 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Performance Breakdown</h2>

          <div className="grid gap-5 md:grid-cols-2">
            {feedback.categoryScores.map(
              (
                category: {
                  name: string;
                  score: number;
                  comment: string;
                },
                index: number
              ) => {
                const categoryScore = clampScore(category.score);

                return (
                  <div key={index} className="rounded-2xl border border-white/10 bg-dark-200/45 p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-semibold">{category.name}</span>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
                        {categoryScore}/100
                      </span>
                    </div>

                    <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-dark-300">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreColor(
                          categoryScore
                        )}`}
                        style={{ width: `${categoryScore}%` }}
                      />
                    </div>

                    <p className="text-sm leading-6 text-light-100">{category.comment}</p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-border w-full">
          <div className="card h-full space-y-4 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-green-400">Strengths</h2>

            <ul className="list-none space-y-3">
              {feedback.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-3 rounded-xl bg-green-500/10 px-4 py-3 items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-400" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-border w-full">
          <div className="card h-full space-y-4 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-yellow-400">Areas for Improvement</h2>

            <ul className="list-none space-y-3">
              {feedback.areasForImprovement.map((area: string, index: number) => (
                <li key={index} className="flex items-start gap-3 rounded-xl bg-yellow-500/10 px-4 py-3 items-center">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/" className="btn-secondary flex min-h-12 w-full items-center justify-center">
          Back to Dashboard
        </Link>

        <Link
          href={`/interview/${id}`}
          className="btn-primary flex min-h-12 w-full items-center justify-center"
        >
          Retake Interview
        </Link>
      </div>
    </section>
  );
};

export default Page;
