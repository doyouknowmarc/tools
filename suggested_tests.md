# Suggested Test Plan for Sidepanel Tools

This document outlines recommended automated and manual tests for each tool surfaced in the sidebar navigation. The goal is to cover critical behaviours, edge cases, and third-party integrations so future refactors do not regress existing functionality. Where possible, the tests below assume the use of [Vitest](https://vitest.dev/) with React Testing Library for component tests and Playwright for optional end-to-end scenarios.

## HEIC to JPG Converter (`HeicToJpgConverter.jsx`)

### Component unit/integration tests
1. **File filtering** – mock `react-dropzone`'s `onDrop` handler to pass a mixture of `.heic` and non-HEIC files and assert only the HEIC entries are persisted in the uploaded list. Expect the `alert` spy to fire for invalid files.
2. **Conversion flow** – mock `heic2any` to resolve with a predictable blob URL. Trigger `Convert to JPG`, advance fake timers to simulate sequential conversions, and assert:
   - `processingFiles` and `processedFiles` states transition per file index.
   - Converted list renders each file with a `.jpg` suffix.
   - `Download All` button invokes the mocked `downloadFile` helper for every converted blob.
3. **Removal actions** – verify clicking the trash icon deletes an uploaded/converted entry without mutating other state.
4. **Tab toggle** – confirm switching between “Uploaded Files” and “Converted Files” tabs maintains the underlying state.

### Manual / E2E checks
* Upload a large (~20MB) `.heic` file to observe progress labels and ensure the UI remains responsive while conversion runs.
* Exercise the drag-and-drop interaction in multiple browsers, especially Safari where HEIC support originates.

## Text Counter (`TextCounter.jsx`)

### Unit tests
1. Assert that empty input returns `0` for words, characters, and spaces.
2. Provide text with irregular spacing (`"hello   world"`) to ensure `.trim()` and regex counting behave as intended.
3. Include newline and punctuation heavy strings to confirm whitespace splitting still produces the correct word count.

## Text Converter (`TextConverter.jsx`)

### Component tests
1. With default mode (`text-to-binary`), type `"AB"` and confirm output equals `01000001 01000010`.
2. Switch to binary mode, feed valid binary and ensure the text output matches expectation.
3. Enter malformed binary (`01002`) and verify non-binary tokens are ignored (`''`) rather than throwing.
4. Click the switch button and ensure the previous output becomes the new input while the mode toggles.

## Pomodoro Timer (`PomodoroTimer.jsx`)

### Component tests
1. Use fake timers to start the countdown and verify `timeLeft` decrements once per second.
2. After reaching zero, assert the phase flips (work ↔ break), `timeLeft` resets to the configured duration, and the mocked `Audio` constructor is invoked.
3. Changing work/break inputs while paused should immediately adjust the displayed time; when running, the inputs must be disabled.
4. `Reset` should stop timers, restore work mode, and reset `timeLeft` to `workDuration * 60`.

### Manual checks
* Confirm long-running timers keep the browser tab awake and audio cues play in production builds.

## Public IP (`PublicIp.jsx`)

### Component tests
1. Mock `fetch` to resolve `{ ip: '203.0.113.5' }` and assert the IP renders and the loading indicator disappears.
2. Mock a network rejection and ensure the component shows "Failed to fetch IP" and clears `loading` state.
3. Click the refresh button and confirm it issues another `fetch` call.

### Manual checks
* Verify the CORS request succeeds from production/staging domains without additional headers.

## Mailto Link Generator (`MailtoLinkGenerator.jsx`)

### Unit tests for helpers
1. `generateMailto` should encode multiple recipients (`"a@b.com, c@d.com"`) into a comma-separated list.
2. Confirm subjects/bodies with spaces, commas, and newline characters are percent-encoded correctly (CRLF conversion included).

### Component tests
1. Update fields via `fireEvent.change` and assert the generated link mirrors the helper output.
2. Mock `navigator.clipboard.writeText` to verify the "Copy Link" button handles both success (sets `Copied!`) and rejection (logs error, resets state).

## Document OCR (`components/ocr`)

### Unit tests
1. **FileValidator** – cover acceptance of supported MIME types, rejection of oversize files, and zero-byte file handling.
2. **Language options** – ensure `getLastLanguage` falls back to `'auto'` when `localStorage` access fails and `saveLastLanguage` writes values safely.
3. **OCRProcessor** – mock `Tesseract.createWorker`, `PDFDocument`, and `pdfjs-dist` to simulate:
   - Image recognition returning text arrays and updating progress via the callback.
   - PDF processing with multiple pages, including an intentional page failure to exercise the warning branch and placeholder text.
   - Worker reuse across multiple calls and cleanup via `terminateWorker`.

### Component tests
1. **UploadZone** – simulate drag-and-drop and file input selection with a mix of valid/invalid files. Assert alerts fire for rejects, `onFilesSelected` receives the filtered list, and language selection persists.
2. **ProcessingIndicator** – provide mock file objects in different states (`pending`, `processing`, `completed`, `error`) and confirm icons, progress bars, preview text, and expand/collapse toggles render appropriately.
3. **OcrTool end-to-end** – mock `OCRProcessor.processFile` to resolve predictable results. Trigger file selection, step through the queued `await` loop, and assert the list transitions from pending → processing → completed with downloadable blobs.
4. Ensure `useEffect` cleanup calls `OCRProcessor.terminateWorker` when the component unmounts (spy on method).

### Manual / E2E checks
* Upload large PDFs to observe streaming progress updates and verify downloads contain embedded invisible text.
* Test different languages (especially non-Latin scripts) to validate font rendering and worker initialisation.

## RAG Token Calculator (`RAGTokenCalculator.jsx`)

### Unit tests
1. For each canned scenario (`low`, `medium`, `high`), assert the derived totals (input tokens, output tokens, costs) match hand calculations using the provided constants.
2. Switch to `custom` mode, tweak fields via controlled inputs, and ensure the memoised calculations update immediately.
3. Validate currency inputs accept decimals and gracefully handle empty strings (`0` fallback).
4. Verify descriptive text and icons update based on scenario selection.

## Token Production Rate Demo (`TokenProductionRateDemo.jsx`)

### Component tests
1. Use fake timers to start generation at a fixed `tokenSpeed` and assert tokens append to the output container until exhaustion, after which intervals clear automatically.
2. Confirm `timeElapsed`, `currentSpeed`, and `progress` are derived correctly during generation (e.g., after 2 seconds at 10 tokens/sec the speed reads `10.0`).
3. Hitting `Stop` should freeze counts without clearing already-generated tokens; `Reset` clears everything.
4. Changing sliders while idle should update state; when running, new values take effect only after restart.

### Manual checks
* Confirm UI responsiveness for maximum slider values (2,000 words at 100 tokens/sec) and that the cursor animation matches generation state.

## Elasticsearch RAM Calculator (`ElasticSearchRamCalculator.jsx`)

### Unit tests
1. With default inputs, assert the memoised calculations (chunks per document, total vectors, MB/GB conversions) match expected numeric values.
2. Toggle `includeMetadata`/`includeIndex` off and ensure the corresponding sections disappear and totals recalculate without those contributions.
3. Switch numeric type to `float16` to confirm `bytesPerValue` halves and the downstream totals adjust accordingly.
4. Validate that `InfoBox` toggles tooltips and closes when clicking again.

### Manual checks
* On small viewports verify the responsive grid wraps correctly and tooltips remain visible within the viewport.

## "Coming soon .." placeholder

### Smoke test
* Click the "Suggest a Feature" button and verify the browser opens a `mailto:` link with the expected prefilled subject line. No automated test is required unless navigation side effects need coverage.

## Sidebar navigation regression

Although not a standalone tool, add a basic integration test to ensure selecting each sidebar entry updates `activeTool` and renders the corresponding component heading in `App.jsx`. This guards against accidental key mismatches between the sidebar and `App` switch statement.

## End-to-end test ideas

* Use Playwright to run a smoke tour: iterate through each sidebar button, confirm the header text updates, and perform a minimal interaction per tool (e.g., type text, toggle slider). This ensures routing state and main components mount without runtime errors in the browser.
* For features relying on external services (`PublicIp`, OCR workers), stub network requests/service workers at the browser layer to produce deterministic results.

## Screenshot Optimizer (`ScreenshotOptimizer.jsx`)

### Component tests
1. Mock a small PNG file and assert the original metadata panel renders pixel dimensions and file size.
2. Override `HTMLCanvasElement.prototype.toBlob` to resolve a deterministic blob. Change quality/format controls and ensure the download button href updates accordingly.
3. Enter an invalid URL and confirm the inline error renders, then fetch a valid PNG via `fetch` mock to verify state resets and optimisation runs.
4. Trigger `Reset selection` and ensure both original and optimised panels clear while the presets revert to defaults.

### Manual checks
* Drag in a retina screenshot (~2× scale) and try each preset to compare visual fidelity versus file savings.
* Exercise the WebP output on browsers that support the format and download to confirm file extensions.

## Meeting Prep Assistant (`MeetingPrepAssistant.jsx`)

### Component tests
1. Supply agenda text with bullets and assert derived objectives/questions/follow-ups match deterministic expectations for each meeting type.
2. Click the template buttons and ensure state changes update `meetingType` styling and regenerate summaries.
3. Mock `navigator.clipboard.writeText` to confirm the copy button reflects success and resets after the timeout.
4. Verify that empty agendas still render default prompts tailored to the chosen meeting type.

### Manual checks
* Paste real project agendas (status, kickoff, retro) to gauge usefulness of generated prompts.
* Confirm summary copy preserves newline formatting when pasted into docs or calendar invites.

## Regex Tester & Explainer (`RegexTester.jsx`)

### Component tests
1. Render with default pattern and sample text; assert matches array equals expected ticket IDs and capture groups.
2. Toggle flag buttons and verify the resulting regex instance is reconstructed with the selected flags.
3. Input an invalid pattern and ensure the alert displays the thrown error message while matches section hides.
4. Provide a pattern with recognised tokens (e.g., `\d`, `^`, `$`) and assert the explainer renders mapped descriptions.

### Manual checks
* Paste multiline logs and confirm highlighting respects the multiline flag.
* Try patterns with zero-width matches to ensure the component still progresses and highlights correctly.

## Content Tone Adjuster (`ContentToneAdjuster.jsx`)

### Component tests
1. Feed sample text and ensure each tone preset returns deterministic rewrites (mock timers for copy reset).
2. Verify selecting a tone toggles button styling and recalculates follow-up hints.
3. Mock `navigator.clipboard.writeText` to confirm successful copy toggles the feedback state and failure logs gracefully.
4. Assert the metrics card updates word/sentence counts when the source text changes.

### Manual checks
* Validate tone shifts on a variety of marketing vs. support snippets.
* Ensure special characters and multiline inputs maintain formatting in the adjusted output panel.

## API Latency Budget Calculator (`ApiLatencyBudgetCalculator.jsx`)

### Component tests
1. Start with defaults and assert p50/p95 totals equal manual calculations from the helper.
2. Update latency/calls/concurrency fields and confirm derived metrics recompute without mutating sibling rows.
3. Add and remove dependencies to ensure state updates predictably and the optimisation list reorders accordingly.
4. Adjust jitter slider and verify the p95 total and slack status respond to the new multiplier.

### Manual checks
* Model real API architectures (fan-out, caching) to validate the concurrency heuristic feels right.
* Stress test large call counts to ensure the calculator remains responsive.

