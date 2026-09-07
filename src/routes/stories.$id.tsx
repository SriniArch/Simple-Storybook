import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookOpenText, Cloud, Pause, Play, Sparkles, Square, Star, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { storyQueryOptions } from "@/lib/stories-queries";
import { useAdminAuth } from "@/lib/admin-auth";
import { deleteStory } from "@/lib/stories.functions";
import { getStoryTone } from "@/lib/story-style";

type WordBoundary = {
  start: number;
  end: number;
};

type RenderToken = {
  text: string;
  isWord: boolean;
  wordIndex: number | null;
};

type RenderParagraph = {
  tokens: RenderToken[];
};

function splitParagraphs(text: string) {
  const paragraphs: Array<{ text: string; start: number }> = [];
  const paragraphBreakRegex = /\n\s*\n/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = paragraphBreakRegex.exec(text)) !== null) {
    const paragraphText = text.slice(lastIndex, match.index);
    if (paragraphText.length > 0) {
      paragraphs.push({ text: paragraphText, start: lastIndex });
    }
    lastIndex = match.index + match[0].length;
  }

  const finalParagraph = text.slice(lastIndex);
  if (finalParagraph.length > 0) {
    paragraphs.push({ text: finalParagraph, start: lastIndex });
  }

  return paragraphs;
}

function buildRenderData(text: string) {
  const paragraphs = splitParagraphs(text);
  const wordBoundaries: WordBoundary[] = [];
  const renderParagraphs: RenderParagraph[] = [];
  const words: string[] = [];
  let wordIndex = 0;

  for (const paragraph of paragraphs) {
    const tokens: RenderToken[] = [];
    const tokenRegex = /\S+|\s+/g;
    let tokenMatch: RegExpExecArray | null;

    while ((tokenMatch = tokenRegex.exec(paragraph.text)) !== null) {
      const tokenText = tokenMatch[0];
      const isWord = !/^\s+$/.test(tokenText);

      if (isWord) {
        const start = paragraph.start + tokenMatch.index;
        const end = start + tokenText.length;

        wordBoundaries.push({ start, end });
        words.push(tokenText);
        tokens.push({ text: tokenText, isWord: true, wordIndex });
        wordIndex += 1;
      } else {
        tokens.push({ text: tokenText, isWord: false, wordIndex: null });
      }
    }

    renderParagraphs.push({ tokens });
  }

  return { renderParagraphs, wordBoundaries, words };
}

function getWordIndexFromCharIndex(charIndex: number, boundaries: WordBoundary[]) {
  if (!boundaries.length || charIndex < 0) {
    return null;
  }

  let low = 0;
  let high = boundaries.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const boundary = boundaries[mid];
    if (!boundary) {
      return null;
    }

    if (charIndex < boundary.start) {
      high = mid - 1;
      continue;
    }

    if (charIndex >= boundary.end) {
      low = mid + 1;
      continue;
    }

    return mid;
  }

  if (low < boundaries.length) {
    return low;
  }

  return boundaries.length - 1;
}

export const Route = createFileRoute("/stories/$id")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(storyQueryOptions(params.id));
  },
  head: () => ({
    meta: [
      { title: "Read a story" },
      { name: "description", content: "A distraction-free reading view for your story." },
      { property: "og:title", content: "Read a story" },
      { property: "og:description", content: "A distraction-free reading view for your story." },
    ],
  }),
  component: ReadStoryPage,
});

function ReadStoryPage() {
  const { id } = Route.useParams();
  const { isAdmin } = useAdminAuth();
  const { data: story } = useSuspenseQuery(storyQueryOptions(id));
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const remove = useServerFn(deleteStory);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);
  const fallbackStartTimeoutRef = useRef<number | null>(null);
  const boundaryEventSeenRef = useRef(false);
  const manualFallbackModeRef = useRef(false);
  const ignoreCurrentUtteranceEventsRef = useRef(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const storyTone = getStoryTone(story?.category ?? story?.title);

  const canUseSpeech = isSpeechSupported;
  const storyText = useMemo(() => story?.content?.trim() ?? "", [story?.content]);
  const { renderParagraphs, wordBoundaries, words } = useMemo(() => buildRenderData(storyText), [storyText]);

  const deleteMutation = useMutation({
    mutationFn: () => remove({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      router.invalidate();
      toast.success("Story deleted");
      navigate({ to: "/" });
    },
    onError: () => toast.error("Could not delete the story"),
  });

  useEffect(() => {
    setIsSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (fallbackStartTimeoutRef.current !== null) {
        window.clearTimeout(fallbackStartTimeoutRef.current);
      }
      utteranceRef.current = null;
    };
  }, []);

  const clearFallbackStartTimeout = () => {
    if (fallbackStartTimeoutRef.current !== null) {
      window.clearTimeout(fallbackStartTimeoutRef.current);
      fallbackStartTimeoutRef.current = null;
    }
  };

  const startManualFallbackNarration = (startIndex: number, rate: number) => {
    if (!canUseSpeech || !words.length) {
      return;
    }

    manualFallbackModeRef.current = true;

    const speakWordAt = (index: number) => {
      if (!manualFallbackModeRef.current) {
        return;
      }

      if (index >= words.length) {
        manualFallbackModeRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(null);
        utteranceRef.current = null;
        return;
      }

      const wordUtterance = new SpeechSynthesisUtterance(words[index]);
      wordUtterance.rate = rate;
      if (selectedVoiceRef.current) {
        wordUtterance.voice = selectedVoiceRef.current;
      }

      wordUtterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentWordIndex(index);
      };

      wordUtterance.onend = () => {
        if (!manualFallbackModeRef.current) {
          return;
        }
        speakWordAt(index + 1);
      };

      wordUtterance.onerror = () => {
        manualFallbackModeRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(null);
        utteranceRef.current = null;
        toast.error("Unable to read this story aloud.");
      };

      utteranceRef.current = wordUtterance;
      window.speechSynthesis.speak(wordUtterance);
    };
  };

  const selectVoice = () => {
    if (!canUseSpeech) return undefined;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return undefined;
    const preferred = voices.find((voice) => {
      const lang = voice.lang.toLowerCase();
      return lang.startsWith("en") && !voice.localService;
    });

    return preferred ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ?? voices[0];
  };

  const stopNarration = () => {
    if (!canUseSpeech) return;
    clearFallbackStartTimeout();
    manualFallbackModeRef.current = false;
    ignoreCurrentUtteranceEventsRef.current = false;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(null);
  };

  const startNarration = () => {
    if (!canUseSpeech) {
      toast.error("Read-aloud is not available in this browser.");
      return;
    }

    if (!storyText) {
      toast.error("This story has no content to read.");
      return;
    }

    window.speechSynthesis.cancel();
    clearFallbackStartTimeout();
    setCurrentWordIndex(null);
    boundaryEventSeenRef.current = false;
    manualFallbackModeRef.current = false;
    ignoreCurrentUtteranceEventsRef.current = false;

    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.rate = 0.7;

    const selectedVoice = selectVoice();
    selectedVoiceRef.current = selectedVoice;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentWordIndex(wordBoundaries.length ? 0 : null);

      fallbackStartTimeoutRef.current = window.setTimeout(() => {
        if (!boundaryEventSeenRef.current) {
          ignoreCurrentUtteranceEventsRef.current = true;
          window.speechSynthesis.cancel();
          startManualFallbackNarration(0, utterance.rate);
        }
      }, 1800);
    };

    utterance.onboundary = (event) => {
      if (typeof event.charIndex !== "number") {
        return;
      }

      boundaryEventSeenRef.current = true;
      clearFallbackStartTimeout();

      const nextWordIndex = getWordIndexFromCharIndex(event.charIndex, wordBoundaries);
      setCurrentWordIndex(nextWordIndex);
    };

    utterance.onend = () => {
      if (ignoreCurrentUtteranceEventsRef.current) {
        ignoreCurrentUtteranceEventsRef.current = false;
        return;
      }
      clearFallbackStartTimeout();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      if (ignoreCurrentUtteranceEventsRef.current) {
        ignoreCurrentUtteranceEventsRef.current = false;
        return;
      }
      clearFallbackStartTimeout();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
      utteranceRef.current = null;
      toast.error("Unable to read this story aloud.");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseNarration = () => {
    if (!canUseSpeech || !window.speechSynthesis.speaking || window.speechSynthesis.paused) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeNarration = () => {
    if (!canUseSpeech || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  };

  if (!story) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-white to-amber-100 text-sky-500 shadow-sm ring-1 ring-sky-200/70">
          <BookOpenText className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">Story not found</h1>
        <p className="mt-2 text-muted-foreground">This story may have been moved or deleted.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to stories
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to stories
      </Link>

      <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-white via-sky-50/60 to-rose-50/60 p-5 shadow-[0_18px_60px_-36px_rgba(125,140,170,0.45)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute left-4 top-4 text-sky-200/70">
            <Cloud className="h-9 w-9" />
          </div>
          <div className="absolute right-5 top-6 text-amber-200/70">
            <Star className="h-5 w-5" />
          </div>
          <div className="absolute bottom-5 right-6 text-violet-200/70">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ring-1 ${storyTone.badge}`}>
              {story.category ?? "Story"}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{story.title}</h1>
            {story.description && <p className="text-lg leading-8 text-muted-foreground">{story.description}</p>}
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Story narration controls">
              <Button
                type="button"
                variant={isPlaying ? "secondary" : "outline"}
                size="icon"
                className="rounded-full"
                onClick={startNarration}
                disabled={!canUseSpeech}
                aria-label="Read story aloud"
                title={!canUseSpeech ? "Read-aloud is unavailable in this browser" : isPlaying ? "Reading aloud" : "Read aloud"}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={isPaused ? resumeNarration : pauseNarration}
                disabled={!canUseSpeech || !isPlaying}
                aria-label={isPaused ? "Resume narration" : "Pause narration"}
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={stopNarration}
                disabled={!canUseSpeech || (!isPlaying && !isPaused)}
                aria-label="Stop narration"
                title="Stop"
              >
                <Square className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            {!canUseSpeech && (
              <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">
                Read-aloud is not supported on this browser or device.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-border/70 bg-white/85 p-5 shadow-sm sm:p-7">
          <div className="space-y-5 text-lg leading-8 text-foreground sm:text-xl sm:leading-9">
            {renderParagraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="whitespace-pre-wrap">
                {paragraph.tokens.map((token, tokenIndex) => {
                  if (!token.isWord) {
                    return <span key={`${paragraphIndex}-${tokenIndex}`}>{token.text}</span>;
                  }

                  const isCurrentWord = token.wordIndex === currentWordIndex;

                  return (
                    <span
                      key={`${paragraphIndex}-${tokenIndex}`}
                      data-word-index={token.wordIndex ?? undefined}
                      className={
                        isCurrentWord
                          ? "rounded-md bg-amber-200/70 px-1 text-foreground ring-1 ring-amber-300/70 transition-colors"
                          : undefined
                      }
                      aria-current={isCurrentWord ? "true" : undefined}
                    >
                      {token.text}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8 flex flex-wrap gap-3 border-t border-border/70 pt-6">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/stories/$id/edit" params={{ id }}>
                Edit story
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-full">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this story?</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{story.title}” will be permanently removed. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </article>
  );
}
