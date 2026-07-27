import type {
  DemoId,
  DocumentationSectionId,
} from '../app/navigation'

export interface SourceLink {
  label: string
  url: string
}

export interface ExerciseField {
  label: string
  value: string
}

export interface Exercise {
  title: string
  goal: string
  fields: ExerciseField[]
  setup?: string
  observe: string
  expected?: string
}

export interface ApiGuide {
  id: DocumentationSectionId
  label: string
  eyebrow: string
  title: string
  summary: string
  status: 'Stable' | 'Developer trial' | 'Origin trial'
  statusDetail: string
  prerequisites: string[]
  goodFor: string[]
  avoidFor: string[]
  playground: string
  workflow?: { title: string; steps: string[] }
  observe: string[]
  limitations: string[]
  lifecycle: string
  demoId?: DemoId
  exercises: Exercise[]
  sources: SourceLink[]
  reviewedOn: string
}

export interface ArticleSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export interface DocumentationArticle {
  id: DocumentationSectionId
  label: string
  eyebrow: string
  title: string
  summary: string
  sections: ArticleSection[]
  sources?: SourceLink[]
}

export interface DocumentationNavGroup {
  label: string
  items: Array<{ id: DocumentationSectionId; label: string }>
}

const builtInOverview: SourceLink = {
  label: 'Chrome built-in AI API overview',
  url: 'https://developer.chrome.com/docs/ai/built-in-apis',
}

const builtInStart: SourceLink = {
  label: 'Get started with built-in AI',
  url: 'https://developer.chrome.com/docs/ai/get-started',
}

const builtInDosAndDonts: SourceLink = {
  label: 'Built-in AI do and don’t',
  url: 'https://developer.chrome.com/docs/ai/built-in-ai-dos-donts',
}

const webmcpOverview: SourceLink = {
  label: 'WebMCP overview',
  url: 'https://developer.chrome.com/docs/ai/webmcp',
}

const webmcpDevtools: SourceLink = {
  label: 'Debug WebMCP tools in Chrome DevTools',
  url: 'https://developer.chrome.com/docs/devtools/application/webmcp',
}

const webmcpDevtools149: SourceLink = {
  label: 'What’s new in DevTools 149',
  url: 'https://developer.chrome.com/blog/new-in-devtools-149',
}

const webmcpBestPractices: SourceLink = {
  label: 'WebMCP best practices',
  url: 'https://developer.chrome.com/docs/ai/webmcp/best-practices',
}

const webmcpSecurity: SourceLink = {
  label: 'WebMCP tool security',
  url: 'https://developer.chrome.com/docs/ai/webmcp/secure-tools',
}

export const documentationNavGroups: DocumentationNavGroup[] = [
  {
    label: 'Start here',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'requirements', label: 'Browser requirements' },
      { id: 'choosing-an-api', label: 'Choosing an API' },
    ],
  },
  {
    label: 'Built-in AI',
    items: [
      { id: 'translator', label: 'Translator' },
      { id: 'language-detector', label: 'Language Detector' },
      { id: 'summarizer', label: 'Summarizer' },
      { id: 'prompt', label: 'Prompt' },
      { id: 'writer', label: 'Writer' },
      { id: 'rewriter', label: 'Rewriter' },
      { id: 'proofreader', label: 'Proofreader' },
    ],
  },
  {
    label: 'WebMCP',
    items: [
      { id: 'webmcp', label: 'WebMCP overview' },
      { id: 'webmcp-declarative', label: 'Declarative API' },
      { id: 'webmcp-imperative', label: 'Imperative API' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { id: 'sources', label: 'Sources' },
      { id: 'terminology', label: 'Terminology' },
    ],
  },
]

export const documentationArticles: DocumentationArticle[] = [
  {
    id: 'overview',
    label: 'Overview',
    eyebrow: 'Documentation',
    title: 'Build useful AI experiences directly in Chrome',
    summary:
      'Learn where browser-supplied models fit, how their lifecycle differs from a cloud API, and how to explore each native surface in this playground.',
    sections: [
      {
        heading: 'A third place to run AI',
        paragraphs: [
          'Frontend applications can call a hosted provider, bundle or download their own model, or use capabilities supplied by the browser. Chrome built-in AI belongs to the third category: your code calls a browser API and Chrome manages the supporting model.',
          'That changes the architecture, but it does not remove product responsibility. A browser model is still generative, its output remains untrusted, and availability depends on the user’s browser, device, policy, language pair, and model state.',
        ],
      },
      {
        heading: 'What this playground teaches',
        bullets: [
          'Task APIs for translation, detection, summarization, writing, rewriting, and proofreading.',
          'The general Prompt API and its explicit session lifecycle.',
          'Capability checks, model downloads, cancellation, cleanup, and unsupported states.',
          'WebMCP as a separate agentic-web track that exposes website actions as tools.',
        ],
      },
      {
        heading: 'A local-first boundary',
        paragraphs: [
          'Every runnable built-in AI example calls Chrome directly. There is no backend, API key, cloud-model fallback, authentication, database, or analytics layer.',
          'Use the exercises to compare what each focused API makes easy, where a small local model struggles, and which production concerns the minimal lesson deliberately leaves visible.',
        ],
      },
    ],
    sources: [builtInOverview, builtInStart, builtInDosAndDonts],
  },
  {
    id: 'requirements',
    label: 'Browser requirements',
    eyebrow: 'Start here',
    title: 'Check the environment before judging an API',
    summary:
      'Support is capability-based. Chrome version alone does not guarantee that a model is already available or that an experimental API is enabled.',
    sections: [
      {
        heading: 'Stable task APIs',
        bullets: [
          'Translator, Language Detector, and Summarizer are stable from Chrome 138 on supported desktop environments.',
          'The Prompt API is stable on the web from Chrome 148 and in Chrome extensions from Chrome 138.',
          'Translator and Language Detector use expert models for their focused tasks; the other generative APIs use Chrome’s built-in foundation model.',
        ],
      },
      {
        heading: 'Model readiness',
        paragraphs: [
          'Each lesson checks availability before creating a session. A model can be ready, downloadable, downloading, or unavailable. The first user-triggered run may therefore begin a download rather than return an immediate result.',
          'Keep enough free storage, stay on a supported desktop operating system, and do not treat mobile support as implied.',
        ],
      },
      {
        heading: 'Experimental surfaces',
        bullets: [
          'Writer, Rewriter, and Proofreader remain trial APIs and require their documented local flags.',
          'WebMCP local testing requires its WebMCP flag; its DevTools panel currently requires the separate DevTools support flag.',
          'Experimental contracts and availability can change. Every guide shows the date its claims were reviewed.',
        ],
      },
    ],
    sources: [builtInOverview, builtInStart, webmcpOverview, webmcpDevtools149],
  },
  {
    id: 'choosing-an-api',
    label: 'Choosing an API',
    eyebrow: 'Start here',
    title: 'Start with the user’s task, not the model',
    summary:
      'Choose the narrowest native API that expresses the job. Task APIs make intent and options clearer; Prompt is the flexible fallback.',
    sections: [
      {
        heading: 'Use a task API when the job has a name',
        bullets: [
          'Translate known languages with Translator.',
          'Identify unknown input language with Language Detector.',
          'Condense longer content with Summarizer.',
          'Draft new content with Writer and transform existing content with Rewriter.',
          'Return corrections, categories, and explanations with Proofreader.',
        ],
      },
      {
        heading: 'Use Prompt for an open-ended language task',
        paragraphs: [
          'Prompt exposes Chrome’s general foundation model and conversational session. It is useful when the task does not fit a focused API, but your instructions and output handling must define more of the contract.',
        ],
      },
      {
        heading: 'Use WebMCP for actions, not generation',
        paragraphs: [
          'WebMCP does not generate or transform text. It describes website actions so browser agents can discover and call them reliably while the human-visible interface remains the source of truth.',
        ],
      },
    ],
    sources: [builtInOverview, webmcpOverview],
  },
  {
    id: 'sources',
    label: 'Sources',
    eyebrow: 'Reference',
    title: 'Official sources used by this guide',
    summary:
      'Compatibility and trial status change. Follow the linked Chrome documentation for the current contract and treat the in-app status as a reviewed snapshot.',
    sections: [
      {
        heading: 'Source policy',
        paragraphs: [
          'Factual API claims in this guide come from Chrome for Developers. Each API page links to its own primary source and records a review date.',
          'The exercises are original teaching material designed around this repository’s current controls. Their expected observations describe workflow signals, not guaranteed model wording.',
        ],
      },
      {
        heading: 'Recheck before shipping',
        bullets: [
          'API status and supported Chrome versions.',
          'Desktop operating-system, hardware, storage, and language constraints.',
          'Local flags, origin-trial dates, and deployed-origin requirements.',
          'WebMCP permissions, isolation, security, and DevTools behaviour.',
        ],
      },
    ],
    sources: [
      builtInOverview,
      builtInStart,
      builtInDosAndDonts,
      webmcpOverview,
      webmcpDevtools,
      webmcpDevtools149,
      webmcpBestPractices,
      webmcpSecurity,
    ],
  },
  {
    id: 'terminology',
    label: 'Terminology',
    eyebrow: 'Reference',
    title: 'Terms used throughout the playground',
    summary:
      'A compact vocabulary for browser models, sessions, capability states, and website tools.',
    sections: [
      {
        heading: 'Built-in AI',
        bullets: [
          'Capability: a browser feature and model state reported at runtime.',
          'Expert model: a model specialized for a focused task such as translation or language detection.',
          'Foundation model: Chrome’s general-purpose on-device language model.',
          'Session: an owned native object used for one task configuration or conversation.',
          'Structured output: output constrained against a schema, not merely text that resembles JSON.',
        ],
      },
      {
        heading: 'WebMCP',
        bullets: [
          'Tool: a named website capability with a description and typed inputs.',
          'Declarative tool: a semantic HTML form exposed through WebMCP annotations.',
          'Imperative tool: JavaScript registered through document.modelContext with a JSON Schema and execute function.',
          'Invocation: one tool call with a status, exact input, and returned output or error.',
          'Progressive enhancement: the human interface keeps working even when WebMCP is unavailable.',
        ],
      },
    ],
    sources: [builtInOverview, webmcpOverview, webmcpDevtools],
  },
]

export const apiGuides: ApiGuide[] = [
  {
    id: 'translator',
    label: 'Translator',
    eyebrow: 'Built-in AI · API 1',
    title: 'Translator',
    summary:
      'Translate dynamic or user-written text with a language-pair-specific expert model supplied by Chrome.',
    status: 'Stable',
    statusDetail: 'Stable from Chrome 138 on supported desktop environments.',
    prerequisites: [
      'Choose different supported source and target languages.',
      'Expect a model download the first time a language pair is used.',
      'Use feature detection; the API is not available on mobile.',
    ],
    goodFor: [
      'On-demand translation of messages, comments, and short-lived content.',
      'Keeping ephemeral text on the device before it reaches another workflow.',
    ],
    avoidFor: [
      'Certified or legally binding translations.',
      'Silently translating text without showing the chosen language direction.',
    ],
    playground:
      'The demo creates one translator for the selected language pair, displays download state, translates one editable string, and destroys the old translator when the pair changes.',
    observe: [
      'A language-pair change creates a different capability check.',
      'Idioms may preserve meaning rather than word order.',
      'Output is displayed as untrusted plain text.',
    ],
    limitations: [
      'Quality varies by language pair and phrasing.',
      'A supported browser may still report a particular pair as unavailable.',
    ],
    lifecycle:
      'Own the translator near the feature, cancel unwanted work, and destroy it when the pair changes or the view unmounts.',
    demoId: 'translator',
    exercises: [
      {
        title: 'Translate a concrete update',
        goal: 'Establish the basic German-to-English flow.',
        setup: 'Choose German → English.',
        fields: [
          {
            label: 'Text to translate',
            value:
              'Der Zug nach Hamburg fährt heute zehn Minuten später vom Gleis sieben ab.',
          },
        ],
        observe: 'Check that time, destination, and platform remain precise.',
      },
      {
        title: 'Challenge an idiom',
        goal: 'See whether meaning survives a non-literal phrase.',
        setup: 'Choose Spanish → English.',
        fields: [
          {
            label: 'Text to translate',
            value:
              'Aunque el proyecto empezó con mal pie, al final salió a pedir de boca.',
          },
        ],
        observe:
          'Compare the conveyed meaning with a word-for-word translation.',
      },
      {
        title: 'Preserve tone and punctuation',
        goal: 'Try an informal French message with emphasis.',
        setup: 'Choose French → English.',
        fields: [
          {
            label: 'Text to translate',
            value:
              'Franchement, cette démo est super utile — mais n’oublie pas de fermer la session !',
          },
        ],
        observe:
          'Look for the informal tone, negation, em dash, and exclamation mark.',
      },
    ],
    sources: [
      {
        label: 'Translator API',
        url: 'https://developer.chrome.com/docs/ai/translator-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'language-detector',
    label: 'Language Detector',
    eyebrow: 'Built-in AI · API 2',
    title: 'Language Detector',
    summary:
      'Return ranked language candidates and confidence scores before deciding how to handle unknown text.',
    status: 'Stable',
    statusDetail: 'Stable from Chrome 138 on supported desktop environments.',
    prerequisites: [
      'Use more than a single word when you need stronger confidence.',
      'Treat results as ranked evidence rather than an absolute label.',
    ],
    goodFor: [
      'Choosing a source language before translation.',
      'Labelling content so downstream experiences can adapt.',
    ],
    avoidFor: [
      'Making high-impact identity or nationality assumptions.',
      'Treating low-confidence short text as certain.',
    ],
    playground:
      'The demo reuses one detector and renders the top three candidates with confidence percentages.',
    observe: [
      'Long, coherent sentences usually produce a clearer first candidate.',
      'Mixed-language input can distribute confidence across candidates.',
      'A successful request may still be uncertain.',
    ],
    limitations: [
      'Names, abbreviations, and shared vocabulary are inherently ambiguous.',
      'The API identifies language; it does not translate or explain the text.',
    ],
    lifecycle:
      'Reuse the detector for repeated checks, abort active work on cancel, and destroy it during cleanup.',
    demoId: 'language-detector',
    exercises: [
      {
        title: 'Clear single-language input',
        goal: 'See a high-confidence result from a complete sentence.',
        fields: [
          {
            label: 'Text to inspect',
            value:
              'La aplicación puede detectar el idioma antes de elegir un traductor.',
          },
        ],
        observe: 'Spanish should lead the ranked candidates.',
      },
      {
        title: 'Mix two languages',
        goal: 'Challenge the ranking with code-switching.',
        fields: [
          {
            label: 'Text to inspect',
            value:
              'Bonjour tout le monde, today we are testing language detection in the browser.',
          },
        ],
        observe:
          'Compare French and English confidence instead of expecting one perfect label.',
      },
      {
        title: 'Use an ambiguous word',
        goal: 'Expose the weak evidence in very short input.',
        fields: [{ label: 'Text to inspect', value: 'Gift' }],
        observe:
          'The result can differ from the intended language; focus on confidence.',
      },
    ],
    sources: [
      {
        label: 'Language Detector API',
        url: 'https://developer.chrome.com/docs/ai/language-detection',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'summarizer',
    label: 'Summarizer',
    eyebrow: 'Built-in AI · API 3',
    title: 'Summarizer',
    summary:
      'Condense longer English content with a focused summarization session and explicit task options.',
    status: 'Stable',
    statusDetail: 'Stable from Chrome 138 on supported desktop environments.',
    prerequisites: [
      'Provide enough source material to contain real signal.',
      'Review the summary against the original before relying on it.',
    ],
    goodFor: [
      'Article previews, meeting highlights, and support-thread overviews.',
      'Helping a reader decide whether longer content is relevant.',
    ],
    avoidFor: [
      'Replacing a source where every qualification matters.',
      'Summarizing content that exceeds the model context without a chunking strategy.',
    ],
    playground:
      'The adapter fixes one short key-points configuration so the lesson can focus on input, preparation, reuse, and cleanup.',
    observe: [
      'The result should be much shorter than the source.',
      'Important facts may be selected differently across runs.',
      'A fluent sentence is not proof that every detail is correct.',
    ],
    limitations: [
      'The small context window and output length constrain dense documents.',
      'This core demo does not stream or chunk long sources.',
    ],
    lifecycle:
      'Reuse a task session with the same options and destroy it when the feature unmounts.',
    demoId: 'summarizer',
    exercises: [
      {
        title: 'Summarize a product decision',
        goal: 'Extract the decision and its constraints.',
        fields: [
          {
            label: 'English article',
            value:
              'The team compared three options for adding translation to the support form. A hosted provider offered broad language coverage but required sending every message to a server. Shipping a model with the app would increase download size and maintenance. The browser Translator API kept short-lived text on the device and required no application backend, but only worked in supported desktop Chrome environments. The team chose progressive enhancement: show on-device translation when the pair is available and preserve the normal form when it is not.',
          },
        ],
        observe:
          'Check whether the chosen approach and graceful fallback both survive.',
      },
      {
        title: 'Separate facts from context',
        goal: 'See which details the model considers central.',
        fields: [
          {
            label: 'English article',
            value:
              'A community study group meets on Thursday at 18:30 in the city library. The session is free, lasts 90 minutes, and is designed for frontend developers who know basic JavaScript. Participants need a laptop with a supported desktop version of Chrome and enough free storage for an on-device model. The first half explains capability detection and model downloads. The second half compares translation, summarization, and general prompting. Registration closes on Tuesday because the room has 24 seats.',
          },
        ],
        observe:
          'Look for date, audience, requirements, format, and registration limit.',
      },
      {
        title: 'Challenge prioritization',
        goal: 'Use a dense incident update with competing details.',
        fields: [
          {
            label: 'English article',
            value:
              'At 09:12 the content editor stopped loading for some users. Monitoring showed no increase in server errors because the failure happened before any network request. At 09:28 the team reproduced it only in browsers where the local language model was downloading. The interface had disabled editing during preparation without explaining why. At 10:05 a patch separated editing state from model readiness and added visible download progress. No user content was lost. The patch reached production at 10:42, and support confirmed recovery at 11:10. A follow-up will add a regression test for editing while a model prepares.',
          },
        ],
        observe:
          'Check whether impact, cause, fix, recovery, and follow-up remain distinct.',
      },
    ],
    sources: [
      {
        label: 'Summarizer API',
        url: 'https://developer.chrome.com/docs/ai/summarizer-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'prompt',
    label: 'Prompt',
    eyebrow: 'Built-in AI · API 4',
    title: 'Prompt',
    summary:
      'Use Chrome’s general-purpose language model for tasks that do not fit a narrower API.',
    status: 'Stable',
    statusDetail:
      'Stable on the web from Chrome 148; sampling parameters remain separately gated.',
    prerequisites: [
      'Write a focused English instruction for this demo.',
      'Treat every response as untrusted generated text.',
      'Remember that the session retains conversational context until destroyed.',
    ],
    goodFor: [
      'Small explanations, classifications, transformations, and structured drafts.',
      'Prototyping a language task before deciding whether a focused API fits.',
    ],
    avoidFor: [
      'Current facts without supplied grounding.',
      'Assuming requested JSON text has been validated against a schema.',
    ],
    playground:
      'The demo owns one conversational session with a fixed system instruction, supports cancellation, and renders the answer as plain text.',
    observe: [
      'Specific constraints produce more inspectable answers.',
      'Conversation context can influence later requests in the same mounted demo.',
      'Small local models can miss constraints or invent details.',
    ],
    limitations: [
      'The core lesson does not expose grounding, cloning, token counters, or response constraints.',
      'Knowledge can be incomplete or stale; the model is not a source of truth.',
    ],
    lifecycle:
      'Create the session for the feature, cancel work the user no longer wants, and destroy the session on cleanup.',
    demoId: 'prompt',
    exercises: [
      {
        title: 'Explain a lifecycle decision',
        goal: 'Ask for a concise technical explanation with a concrete audience.',
        fields: [
          {
            label: 'English prompt',
            value:
              'Explain to a junior frontend developer, in three bullet points, why a web app should destroy an unused browser AI session.',
          },
        ],
        observe: 'Check the audience, length, and lifecycle focus.',
      },
      {
        title: 'Request JSON-shaped text',
        goal: 'See whether the model follows a strict-looking output request.',
        fields: [
          {
            label: 'English prompt',
            value:
              'Return only a JSON object with the keys "api", "runsLocally", and "mainRisk". Describe the Chrome Prompt API. Use a boolean for "runsLocally" and a short string for the other values.',
          },
        ],
        observe:
          'Check whether the text parses as JSON, but do not mistake this request for schema-constrained structured output.',
      },
      {
        title: 'Expose a knowledge boundary',
        goal: 'Ask for evidence the model cannot retrieve by itself.',
        fields: [
          {
            label: 'English prompt',
            value:
              'What changed in the Chrome AI documentation today? Cite the exact page update and do not guess.',
          },
        ],
        observe:
          'A trustworthy response should admit it has no live browsing or supplied source.',
      },
    ],
    sources: [
      {
        label: 'Prompt API',
        url: 'https://developer.chrome.com/docs/ai/prompt-api',
      },
      {
        label: 'Structured output with the Prompt API',
        url: 'https://developer.chrome.com/docs/ai/structured-output-for-prompt-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'writer',
    label: 'Writer',
    eyebrow: 'Built-in AI · API 5',
    title: 'Writer',
    summary:
      'Create new editable content from an idea and optional context instead of transforming an existing draft.',
    status: 'Developer trial',
    statusDetail: 'Experimental writing-assistance API; verify current trial access.',
    prerequisites: [
      'Enable the Writer and on-device model flags listed in the playground.',
      'Use English input and output in this focused lesson.',
    ],
    goodFor: [
      'Drafting messages, reviews, support requests, and introductions.',
      'Turning structured context into a first editable version.',
    ],
    avoidFor: [
      'Publishing generated content without review.',
      'Using Writer when the real task is to preserve and transform an existing text.',
    ],
    playground:
      'The demo sends one idea plus optional context to a reusable Writer session and keeps the resulting draft editable.',
    observe: [
      'Context should contribute factual details without becoming the task itself.',
      'A clearer idea narrows the shape of the draft.',
      'The generated draft never silently replaces learner input.',
    ],
    limitations: [
      'The demo fixes language, tone, format, and length options.',
      'Output quality depends strongly on the distinction between idea and context.',
    ],
    lifecycle:
      'Reuse a Writer with fixed options, abort unwanted generation, and destroy it when the demo unmounts.',
    demoId: 'writer',
    exercises: [
      {
        title: 'Draft from an idea only',
        goal: 'See how much the model must invent when context is absent.',
        fields: [
          {
            label: 'Writing idea',
            value: 'Invite neighbours to a weekend community garden cleanup.',
          },
          { label: 'Optional context', value: '' },
        ],
        observe: 'Notice which missing details the draft leaves vague or invents.',
      },
      {
        title: 'Ground a practical invitation',
        goal: 'Give the same kind of task enough concrete context.',
        fields: [
          {
            label: 'Writing idea',
            value: 'Invite neighbours to a weekend community garden cleanup.',
          },
          {
            label: 'Optional context',
            value:
              'Meet Saturday at 10:00 by the north gate. Gloves and tools are provided. The cleanup lasts two hours, children are welcome with an adult, and no registration is required.',
          },
        ],
        observe: 'Check that the supplied logistics survive without new claims.',
      },
      {
        title: 'Challenge instruction boundaries',
        goal: 'Separate the requested document from background context.',
        fields: [
          {
            label: 'Writing idea',
            value:
              'Write a short release note announcing an accessibility improvement.',
          },
          {
            label: 'Optional context',
            value:
              'Keyboard users can now move through the vertical API tabs with Arrow keys, Home, and End. The change does not alter pointer navigation or API behaviour.',
          },
        ],
        observe:
          'Look for a release note rather than a tutorial, and verify the scope remains accurate.',
      },
    ],
    sources: [
      {
        label: 'Writer API',
        url: 'https://developer.chrome.com/docs/ai/writer-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'rewriter',
    label: 'Rewriter',
    eyebrow: 'Built-in AI · API 6',
    title: 'Rewriter',
    summary:
      'Transform existing content by one visible tone or length choice while keeping the original available.',
    status: 'Developer trial',
    statusDetail: 'Experimental writing-assistance API; verify current trial access.',
    prerequisites: [
      'Enable the writing-assistance flags listed in the playground.',
      'Choose one of the demo’s exact tone or length changes.',
    ],
    goodFor: [
      'Making an existing message more formal or casual.',
      'Expanding or condensing text while preserving its intent.',
    ],
    avoidFor: [
      'Creating a new document from a bare idea.',
      'Silently overwriting the original text.',
    ],
    playground:
      'The demo creates a Rewriter for the selected immutable option and returns a separate alternative below the original.',
    observe: [
      'Tone changes should preserve facts.',
      'Length changes can introduce or omit nuance.',
      'Changing the option destroys the previous configured session.',
    ],
    limitations: [
      'The API can still alter meaning while producing fluent prose.',
      'The demo applies one transformation at a time.',
    ],
    lifecycle:
      'Destroy the old Rewriter before creating one with a different immutable tone or length option.',
    demoId: 'rewriter',
    exercises: [
      {
        title: 'Make a request more formal',
        goal: 'Change tone without changing the deadline.',
        setup: 'Choose “Use a more formal tone”.',
        fields: [
          {
            label: 'Original text',
            value:
              'Hey, can you send me the accessibility report by Friday? I need it for the review.',
          },
        ],
        observe: 'Confirm Friday and the reason remain intact.',
      },
      {
        title: 'Condense a repetitive update',
        goal: 'Test whether shorter output keeps the decision.',
        setup: 'Choose “Make it shorter”.',
        fields: [
          {
            label: 'Original text',
            value:
              'After looking at all of the available options and talking through each one as a team, we have decided that we will use the browser Translator API for the prototype because it keeps short-lived text on the device.',
          },
        ],
        observe: 'The choice and privacy reason should survive.',
      },
      {
        title: 'Expand a minimal statement',
        goal: 'See what a longer rewrite adds beyond supplied facts.',
        setup: 'Choose “Make it longer”.',
        fields: [
          {
            label: 'Original text',
            value: 'The model download may take a few minutes.',
          },
        ],
        observe:
          'Separate useful elaboration from unsupported timing or technical claims.',
      },
    ],
    sources: [
      {
        label: 'Rewriter API',
        url: 'https://developer.chrome.com/docs/ai/rewriter-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'proofreader',
    label: 'Proofreader',
    eyebrow: 'Built-in AI · API 7',
    title: 'Proofreader',
    summary:
      'Inspect grammar, spelling, and punctuation corrections with categories and explanations.',
    status: 'Developer trial',
    statusDetail: 'Experimental proofreading API; verify current trial access.',
    prerequisites: [
      'Enable the Proofreader flag listed in the playground.',
      'Use English text in this focused lesson.',
    ],
    goodFor: [
      'Reviewing messages, comments, notes, and editable documents.',
      'Showing explainable corrections before a person accepts them.',
    ],
    avoidFor: [
      'Silently replacing user-authored text.',
      'Treating style preferences as objective grammatical errors.',
    ],
    playground:
      'The demo keeps the original text, renders a corrected alternative, and lists every returned correction with its category and explanation.',
    observe: [
      'Correction indices refer to the submitted original.',
      'A successful run can legitimately return zero corrections.',
      'Categories and explanations can be absent or imperfect.',
    ],
    limitations: [
      'The API focuses on proofreading rather than broad rewriting.',
      'Suggestions still require user review.',
    ],
    lifecycle:
      'Own one Proofreader, abort the active request when canceled, and destroy the session on unmount.',
    demoId: 'proofreader',
    exercises: [
      {
        title: 'Correct agreement errors',
        goal: 'Produce several explainable grammar corrections.',
        fields: [
          {
            label: 'Original text',
            value:
              'She have finished the tests, but the results was not uploaded yet.',
          },
        ],
        observe: 'Look for subject–verb agreement categories and explanations.',
      },
      {
        title: 'Mix spelling and punctuation',
        goal: 'Compare different correction types in one result.',
        fields: [
          {
            label: 'Original text',
            value:
              'The browser recieved the request however it didnt return a response.',
          },
        ],
        observe:
          'Check spelling, apostrophe, and sentence punctuation separately.',
      },
      {
        title: 'Submit already-correct text',
        goal: 'Distinguish success with no changes from an unavailable API.',
        fields: [
          {
            label: 'Original text',
            value:
              'The session is destroyed when the component unmounts.',
          },
        ],
        observe:
          'The UI should report that no corrections were suggested after a successful run.',
      },
    ],
    sources: [
      {
        label: 'Proofreader API',
        url: 'https://developer.chrome.com/docs/ai/proofreader-api',
      },
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'webmcp',
    label: 'WebMCP overview',
    eyebrow: 'Agentic web',
    title: 'WebMCP',
    summary:
      'Expose structured website actions to browser agents while keeping the human interface visible and usable.',
    status: 'Origin trial',
    statusDetail: 'Origin trial from Chrome 149; local testing uses Chrome flags.',
    prerequisites: [
      'Enable chrome://flags/#enable-webmcp-testing and relaunch Chrome.',
      'For the built-in DevTools pane, also enable chrome://flags/#devtools-webmcp-support.',
      'Keep the page open: WebMCP tools require a visible browsing context.',
    ],
    goodFor: [
      'Reliable agent access to forms, navigation, state changes, and application actions.',
      'Progressively enhancing an existing human-first interface.',
    ],
    avoidFor: [
      'Replacing authentication, authorization, validation, or user control.',
      'Describing WebMCP as an on-device inference API.',
    ],
    playground:
      'The WebMCP track separates a conceptual introduction from one semantic-form tool and one JavaScript-registered tool.',
    workflow: {
      title: 'Test tools with Chrome DevTools',
      steps: [
        'Open chrome://flags/#enable-webmcp-testing, set it to Enabled, and relaunch Chrome.',
        'Open chrome://flags/#devtools-webmcp-support, set it to Enabled, and relaunch Chrome if required.',
        'Open either runnable WebMCP demo so its tool is mounted on the page.',
        'Open Chrome DevTools, select Application, then select WebMCP in the Application sidebar.',
        'Choose a tool under Available Tools to inspect its name, description, type, and inputs.',
        'Enter parameters in the manual test area and choose Run tool.',
        'Select the call under Invoked Tools to inspect its status, exact Input, Output, or error.',
      ],
    },
    observe: [
      'Tools appear only while their owning demo is mounted.',
      'Agent calls update the same visible state a person uses.',
      'Tool input and output remain inspectable in Chrome DevTools.',
    ],
    limitations: [
      'Agents must visit the page to discover its tools.',
      'Origin isolation and the tools permissions policy gate availability.',
      'A tool contract can expose powerful actions, so normal application security still applies.',
    ],
    lifecycle:
      'Register only tools relevant to current page state and remove or abort them when their owning UI unmounts.',
    exercises: [],
    sources: [
      webmcpOverview,
      webmcpBestPractices,
      webmcpSecurity,
      webmcpDevtools,
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'webmcp-declarative',
    label: 'Declarative API',
    eyebrow: 'WebMCP · Declarative',
    title: 'Turn a semantic form into a tool',
    summary:
      'Annotate a normal HTML form so an agent sees its name, purpose, fields, requirements, and allowed values.',
    status: 'Origin trial',
    statusDetail: 'Origin trial from Chrome 149; local testing uses Chrome flags.',
    prerequisites: [
      'Enable both WebMCP and DevTools WebMCP flags, then relaunch Chrome.',
      'Open this demo before opening Application → WebMCP so the form tool is mounted.',
      'Select submitSupportRequest in Available Tools and enter values in the manual test area.',
      'The demo’s Enable toolautosubmit checkbox is off by default: after choosing Run tool you must also click the page’s Submit request button before DevTools reports Completed or Error. Turn the checkbox on to see the same tool complete without that click.',
    ],
    goodFor: [
      'Existing forms whose labels, names, types, and required fields already describe the action.',
      'Keeping person and agent workflows aligned through one semantic surface.',
    ],
    avoidFor: [
      'Hidden actions that have no meaningful human form.',
      'Auto-submitting consequential forms without deliberate review and security design.',
    ],
    playground:
      'The support form uses toolname, tooldescription, field names, native types, required attributes, and tool parameter descriptions. A checkbox toggles the real toolautosubmit attribute on and off the same form so the two submission modes stay comparable.',
    workflow: {
      title: 'Compare both submission modes',
      steps: [
        'Open Chrome DevTools → Application → WebMCP and select submitSupportRequest under Available Tools.',
        'With Enable toolautosubmit off (the default), enter fullName, email, topic, and details, then choose Run tool — the call only activates and pre-fills the form.',
        'Switch to the demo tab, click Submit request, then return to DevTools: the call now shows Completed (or Error) with the page’s Input and Output.',
        'Back in the demo, turn on Enable toolautosubmit, then choose Run tool again with the same or new values.',
        'This time DevTools reports Completed (or Error) immediately — the demo’s preventDefault() and respondWith() run without a click, and without a real page navigation.',
      ],
    },
    observe: [
      'Available Tools shows submitSupportRequest as a Declarative tool.',
      'Input contains the exact form parameter values.',
      'Completed or Error output matches the visible activity panel.',
    ],
    limitations: [
      'toolautosubmit is a page-authored, per-form flag, not something an individual agent call chooses; the checkbox exists to compare both modes, not to model real per-call control.',
      'Browser-native form semantics remain part of the tool contract.',
    ],
    lifecycle:
      'The form tool exists while its annotated form is mounted; event listeners are removed with the demo.',
    demoId: 'webmcp-declarative',
    exercises: [
      {
        title: 'Route a valid technical request',
        goal: 'Run the complete Declarative tool successfully.',
        setup:
          'Leave Enable toolautosubmit off. Run submitSupportRequest in DevTools with these values, then click the page’s Submit request button.',
        fields: [
          { label: 'fullName', value: 'Ada Lovelace' },
          { label: 'email', value: 'ada@example.com' },
          { label: 'topic', value: 'technical' },
          {
            label: 'details',
            value: 'The on-device model remains in the downloading state.',
          },
        ],
        observe:
          'The page should show agent activation and a routed confirmation.',
        expected:
          'DevTools records Completed and exposes the same confirmation in Output.',
      },
      {
        title: 'Inspect a validation failure',
        goal: 'See how page validation becomes tool error output.',
        setup:
          'Leave Enable toolautosubmit off. Run submitSupportRequest in DevTools with these values, then click the page’s Submit request button to trigger validation.',
        fields: [
          { label: 'fullName', value: 'Grace Hopper' },
          { label: 'email', value: 'not-an-email' },
          { label: 'topic', value: 'billing' },
          { label: 'details', value: 'Please review this request.' },
        ],
        observe: 'The visible activity panel should show the validation error.',
        expected:
          'DevTools records Error with the rejected validation message in Output.',
      },
      {
        title: 'Complete a call with no click',
        goal: 'Turn on toolautosubmit and compare it against the default human-review mode.',
        setup:
          'Turn on Enable toolautosubmit in the demo, then run submitSupportRequest in DevTools with these values. Do not click anything on the page.',
        fields: [
          { label: 'fullName', value: 'Alan Turing' },
          { label: 'email', value: 'alan@example.com' },
          { label: 'topic', value: 'technical' },
          {
            label: 'details',
            value: 'Confirm this request routes without a manual submit.',
          },
        ],
        observe:
          'The page should show the routed confirmation without a Submit request click.',
        expected:
          'DevTools records Completed on its own; no page navigation occurs because the demo calls preventDefault().',
      },
    ],
    sources: [
      {
        label: 'WebMCP Declarative API',
        url: 'https://developer.chrome.com/docs/ai/webmcp/declarative-api',
      },
      webmcpDevtools,
      webmcpDevtools149,
    ],
    reviewedOn: '2026-07-24',
  },
  {
    id: 'webmcp-imperative',
    label: 'Imperative API',
    eyebrow: 'WebMCP · Imperative',
    title: 'Register a schema-driven JavaScript tool',
    summary:
      'Use document.modelContext when a website action is better represented by JavaScript and JSON Schema than by a form.',
    status: 'Origin trial',
    statusDetail: 'Origin trial from Chrome 149; local testing uses Chrome flags.',
    prerequisites: [
      'Enable both WebMCP and DevTools WebMCP flags, then relaunch Chrome.',
      'Open this demo so its addTodo tool registers before inspecting Available Tools.',
      'Select addTodo and use the built-in manual test area.',
    ],
    goodFor: [
      'State changes, navigation, and application functions without a natural form.',
      'Tools that need explicit JSON Schema, asynchronous execution, or structured results.',
    ],
    avoidFor: [
      'Duplicating a semantic form that the Declarative API already describes clearly.',
      'Registering tools unrelated to the current visible application state.',
    ],
    playground:
      'The demo registers addTodo with a name, description, JSON Schema, and execute function. Person and tool calls update one shared visible list with their source labelled.',
    observe: [
      'Available Tools shows addTodo as an Imperative tool and its schema.',
      'Valid tool calls add agent-labelled items to the visible list.',
      'Invocation history retains exact input, output, status, and errors.',
    ],
    limitations: [
      'Schema validation does not replace authorization or domain validation.',
      'The AbortController registration signal is the cleanup path for this experimental API.',
    ],
    lifecycle:
      'Register on mount with an AbortSignal and abort that signal when the owning feature unmounts.',
    demoId: 'webmcp-imperative',
    exercises: [
      {
        title: 'Add a task through the tool',
        goal: 'Verify a valid schema-driven state change.',
        fields: [{ label: 'text', value: 'Draft the release notes' }],
        observe:
          'The visible list should gain one item labelled as coming from the agent.',
        expected:
          'DevTools records Completed and Output reports the added task.',
      },
      {
        title: 'Reject empty input',
        goal: 'Inspect schema or execute-function failure.',
        fields: [{ label: 'text', value: '' }],
        observe: 'The visible list should remain unchanged.',
        expected:
          'DevTools records Error or prevents the invalid run, depending on the current panel validation.',
      },
      {
        title: 'Build invocation history',
        goal: 'Compare repeated calls and synchronized page state.',
        setup: 'Run this value twice from the manual test area.',
        fields: [{ label: 'text', value: 'Verify the WebMCP tool' }],
        observe:
          'The visible list should contain two separately sourced additions.',
        expected:
          'DevTools shows two Completed calls whose Input and Output can be inspected independently.',
      },
    ],
    sources: [
      {
        label: 'WebMCP Imperative API',
        url: 'https://developer.chrome.com/docs/ai/webmcp/imperative-api',
      },
      webmcpDevtools,
      webmcpDevtools149,
    ],
    reviewedOn: '2026-07-24',
  },
]

export const apiGuideById = new Map(apiGuides.map((guide) => [guide.id, guide]))
export const documentationArticleById = new Map(
  documentationArticles.map((article) => [article.id, article]),
)
