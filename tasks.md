# Story Read-Aloud Feature — Tasks

## Goal

Add a speaker/read-aloud feature to story pages.

When the user clicks the speaker button:
- The story is spoken slowly.
- The currently spoken word is highlighted.
- The highlight moves word-by-word as narration progresses.
- The user can pause, resume, and stop playback.

## Phase 1 — Core Read-Aloud

### UI
- [x] Add a speaker icon/button near the story title.
- [x] Show a clear playing state while narration is active.
- [x] Add Pause/Resume control.
- [x] Add Stop control.
- [x] Use accessible labels and keyboard support.

### Text-to-Speech
- [x] Use the browser `SpeechSynthesis` API.
- [x] Read only the story content initially.
- [x] Set a slow default speech rate around `0.7`.
- [x] Select a suitable available voice.
- [x] Handle browsers/devices where speech synthesis is unavailable.
- [x] Cancel existing speech before starting new narration.

## Phase 2 — Word Highlighting

- [x] Render individual words as identifiable elements/spans.
- [x] Preserve story formatting and paragraphs.
- [x] Preserve punctuation and spacing correctly.
- [x] Use speech boundary events where supported.
- [x] Determine the currently spoken word from the speech character position.
- [x] Highlight the current word.
- [x] Remove the previous word highlight.
- [x] Handle punctuation, whitespace, repeated words, and paragraphs.
- [x] Clear the highlight when narration finishes.

### Highlight Styling
- [x] Use a subtle, child-friendly highlight.
- [x] Make the highlighted word clearly visible.
- [x] Ensure sufficient contrast.
- [x] Add a small transition only if it does not affect readability.

## Phase 3 — Playback Behavior

- [ ] Pause without losing the current position.
- [ ] Resume from the paused position.
- [ ] Stop and reset the story state.
- [ ] Restart from the beginning after Stop.
- [ ] Reset state when narration finishes.
- [ ] Prevent multiple speech instances from running simultaneously.
- [ ] Stop speech when navigating to another story.
- [ ] Stop speech when the component is unmounted.
- [ ] Handle browser speech errors gracefully.

## Phase 4 — Auto-Scroll

- [ ] Automatically scroll the current word into view.
- [ ] Keep the highlighted word comfortably visible.
- [ ] Avoid excessive scrolling.
- [ ] Preserve normal scrolling when narration is stopped.
- [ ] Test on desktop and mobile.

## Phase 5 — Reading Speed

- [ ] Add a speech-speed control.
- [ ] Provide `0.6×`, `0.7×`, `0.9×`, and `1.0×`.
- [ ] Default to `0.7×`.
- [ ] Decide how speed changes behave during playback.

## Phase 6 — Questions

Initially, discussion questions should not be included in automatic story narration.

Later:
- [ ] Add a separate "Read Questions" option.
- [ ] Allow each question to be read individually.
- [ ] Highlight words while questions are being read.

## Suggested Component Structure

```text
StoryReader
├── Read Aloud button
├── Playback controls
├── Speed control
└── Story content
    ├── Paragraph
    │   ├── Word
    │   ├── Word
    │   └── ...
    └── Paragraph
```

Suggested state:

```text
isPlaying
isPaused
currentWordIndex
speechRate
selectedVoice
```

## Browser Compatibility

- [ ] Test Chrome desktop.
- [ ] Test Safari desktop.
- [ ] Test Chrome Android.
- [ ] Test Safari iPhone/iPad.
- [ ] Test speech boundary events on each browser.
- [ ] Handle unavailable voices gracefully.
- [ ] Provide a fallback when word-boundary events are unsupported.

## Accessibility

- [ ] Use an accessible label such as "Read story aloud".
- [ ] Ensure controls are keyboard accessible.
- [ ] Do not rely on color alone to indicate the current word.
- [ ] Maintain readable contrast.
- [ ] Respect reduced-motion preferences.

## Testing

### Basic
- [ ] Story starts from the speaker button.
- [ ] Story is spoken slowly.
- [ ] Current word is highlighted.
- [ ] Highlight follows the spoken text.
- [ ] Narration reaches the end.
- [ ] Highlight disappears after completion.

### Controls
- [ ] Pause works.
- [ ] Resume works.
- [ ] Stop works.
- [ ] Restart works.
- [ ] Speed selection works.

### Edge Cases
- [ ] Quotation marks.
- [ ] Apostrophes.
- [ ] Numbers.
- [ ] Hyphenated words.
- [ ] Multiple paragraphs.
- [ ] Long sentences.
- [ ] Repeated words.
- [ ] Navigation during narration.
- [ ] Starting narration twice.
- [ ] Unsupported speech events.

## Future Enhancements

- [ ] Multiple voice options.
- [ ] Child-friendly narrator voice.
- [ ] Read from a selected paragraph.
- [ ] Read from a selected word.
- [ ] Remember preferred reading speed.
- [ ] Remember preferred voice.
- [ ] Generate consistent server-side audio.
- [ ] Download audio for offline use.
- [ ] Sentence-level highlighting fallback.
- [ ] "Read Again" button.

## Definition of Done

- [ ] Every story page has a speaker button.
- [ ] Clicking it reads the story aloud.
- [ ] Default speed is suitable for children.
- [ ] Current word is visibly highlighted.
- [ ] Highlight stays reasonably synchronized.
- [ ] Pause, resume, and stop work reliably.
- [ ] Narration stops when leaving the page.
- [ ] Feature works on major desktop and mobile browsers.
- [ ] No backend speech service is required for the initial version.
