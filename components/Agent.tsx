"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "agent";
  content: string;
}

const getCallStatusLabel = (callStatus: CallStatus) => {
  switch (callStatus) {
    case CallStatus.CONNECTING:
      return "Connecting";
    case CallStatus.ACTIVE:
      return "Live";
    case CallStatus.FINISHED:
      return "Finished";
    default:
      return "Ready";
  }
};

const getCallStatusTone = (callStatus: CallStatus) => {
  switch (callStatus) {
    case CallStatus.CONNECTING:
      return "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30";
    case CallStatus.ACTIVE:
      return "bg-green-500/15 text-green-300 ring-1 ring-green-500/30";
    case CallStatus.FINISHED:
      return "bg-primary-200/15 text-primary-100 ring-1 ring-primary-200/30";
    default:
      return "bg-white/5 text-light-100 ring-1 ring-white/10";
  }
};

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role;
        if (role !== "user" && role !== "system") return;

        const newMessage: SavedMessage = { role, content: message.transcript };

        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleGenerateFeedback = useCallback(async (messages: SavedMessage[]) => {
    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      router.push("/");
    }
  }, [interviewId, router, userId]);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [callStatus, handleGenerateFeedback, messages, router, type]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = " ";
      if (questions) {
        formattedQuestions = questions.map((question) => `-${question}`).join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };
  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#1F2230] via-[#151824] to-[#0C0D13] p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-200/80">
              Live Interview Session
            </p>
            <h2 className="text-3xl font-bold md:text-4xl">AI Interviewer</h2>
            <p className="max-w-2xl text-light-100">
              Hold your conversation with the AI interviewer, then review the transcript and feedback once the call ends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-4 py-2 text-sm font-semibold", getCallStatusTone(callStatus))}>
              {getCallStatusLabel(callStatus)}
            </span>

            {isSpeaking && (
              <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-300 ring-1 ring-green-500/30">
                AI speaking
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card-border w-full">
            <div className="card flex h-full min-h-90 flex-col items-center justify-center gap-5 p-6 text-center md:p-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary-200/20 blur-2xl" />
                <div className="avatar">
                  <Image
                    src="/ai-avatar.png"
                    alt="vapi"
                    width={65}
                    height={54}
                    className="object-cover"
                  />
                  {isSpeaking && <span className="animate-speak" />}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-primary-100">AI Interviewer</h3>
                <p className="text-light-100">
                  The interviewer will listen, ask follow-ups, and adapt to your responses in real time.
                </p>
              </div>
            </div>
          </div>

          <div className="card-border w-full">
            <div className="card flex h-full min-h-90 flex-col justify-between gap-6 p-6 md:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <Image
                      src="/user-avatar.png"
                      alt="user avatar"
                      width={48}
                      height={48}
                      className="size-10 rounded-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-light-400">Candidate</p>
                    <h3 className="text-2xl font-semibold text-white">{userName}</h3>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-dark-200/60 p-4">
                  <p className="text-sm leading-6 text-light-100">
                    Keep an eye on the transcript below. When the interview ends, feedback is generated automatically.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-light-400">Mode</p>
                  <p className="font-semibold text-light-100">{type === "generate" ? "Practice generation" : "Interview review"}</p>
                </div>

                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-light-400">Messages</p>
                  <p className="font-semibold text-light-100">{messages.length} captured</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="card-border w-full">
          <div className="card space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-primary-100">Live Transcript</h3>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-light-400">
                Latest update
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-dark-200/70 p-4 md:p-5">
              <p
                key={latestMessage}
                className={cn(
                  "animate-fadeIn text-base leading-7 text-light-100 transition-opacity duration-500",
                  "opacity-100"
                )}
              >
                {latestMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="btn-call relative flex min-w-36 items-center justify-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.16em]"
            onClick={handleCall}
          >
            <span
              className={cn(
                "absolute inset-0 rounded-full animate-ping bg-current opacity-20",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">{isCallInactiveOrFinished ? "Start Call" : "Connecting"}</span>
          </button>
        ) : (
          <button className="btn-disconnect flex min-w-36 items-center justify-center gap-3 px-8 py-4 text-sm uppercase tracking-[0.16em]" onClick={handleDisconnect}>
            End Call
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Status</p>
          <p className="text-sm font-semibold text-light-100">{getCallStatusLabel(callStatus)}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Transcript</p>
          <p className="text-sm font-semibold text-light-100">{messages.length} entries</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-400">Speaking</p>
          <p className="text-sm font-semibold text-light-100">{isSpeaking ? "AI is talking" : "Waiting"}</p>
        </div>
      </div>
    </section>
  );
};

export default Agent;
