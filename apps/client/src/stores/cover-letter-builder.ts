import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type Sheet = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

type PanelHandle = {
  isDragging: boolean;
  setDragging: (dragging: boolean) => void;
};

type Panel = {
  size: number;
  setSize: (size: number) => void;
  handle: PanelHandle;
};

type CoverLetterBuilderState = {
  // Frame management
  frame: {
    ref: HTMLIFrameElement | null;
    setRef: (ref: HTMLIFrameElement | null) => void;
  };

  // Panel system (desktop)
  panel: {
    left: Panel;
    right: Panel;
  };

  // Sheet system (mobile)
  sheet: {
    left: Sheet;
    right: Sheet;
  };

  // Sidebar management (legacy)
  leftSidebar: {
    open: boolean;
    toggle: () => void;
    close: () => void;
    openSidebar: () => void;
  };

  rightSidebar: {
    open: boolean;
    toggle: () => void;
    close: () => void;
    openSidebar: () => void;
  };

  // Cover letter generation state
  generation: {
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
    progress: number;
    setProgress: (progress: number) => void;
    currentStep: string;
    setCurrentStep: (step: string) => void;
  };

  // Interview flow state
  interview: {
    isActive: boolean;
    setIsActive: (isActive: boolean) => void;
    currentQuestion: number;
    setCurrentQuestion: (question: number) => void;
    questions: string[];
    setQuestions: (questions: string[]) => void;
    answers: Record<number, string>;
    setAnswer: (questionIndex: number, answer: string) => void;
  };

  // Content selection state
  contentSelection: {
    selectedStories: string[];
    setSelectedStories: (stories: string[]) => void;
    addStory: (storyId: string) => void;
    removeStory: (storyId: string) => void;
    clearStories: () => void;
  };

  // Template and styling state
  template: {
    selectedTemplate: string;
    setSelectedTemplate: (template: string) => void;
    tone: string;
    setTone: (tone: string) => void;
    customInstructions: string;
    setCustomInstructions: (instructions: string) => void;
  };

  // Page settings state
  page: {
    format: "a4" | "letter";
    setFormat: (format: "a4" | "letter") => void;
    margin: number;
    setMargin: (margin: number) => void;
  };
};

type CoverLetterBuilderActions = {
  toggle: (side: "left" | "right") => void;
};

export const useCoverLetterBuilderStore = create<CoverLetterBuilderState & CoverLetterBuilderActions>()(
  devtools(
    immer((set) => ({
      // Frame management
      frame: {
        ref: null,
        setRef: (ref) => {
          set((state) => {
            // @ts-expect-error Unable to set ref type
            state.frame.ref = ref;
          });
        },
      },

      // Panel system (desktop)
      panel: {
        left: {
          size: 0,
          setSize: (size) => {
            set((state) => {
              state.panel.left.size = size;
            });
          },
          handle: {
            isDragging: false,
            setDragging: (dragging) => {
              set((state) => {
                state.panel.left.handle.isDragging = dragging;
              });
            },
          },
        },
        right: {
          size: 0,
          setSize: (size) => {
            set((state) => {
              state.panel.right.size = size;
            });
          },
          handle: {
            isDragging: false,
            setDragging: (dragging) => {
              set((state) => {
                state.panel.right.handle.isDragging = dragging;
              });
            },
          },
        },
      },

      // Sheet system (mobile)
      sheet: {
        left: {
          open: false,
          setOpen: (open) => {
            set((state) => {
              state.sheet.left.open = open;
            });
          },
        },
        right: {
          open: false,
          setOpen: (open) => {
            set((state) => {
              state.sheet.right.open = open;
            });
          },
        },
      },

      // Toggle action for mobile sheets
      toggle: (side) => {
        set((state) => {
          state.sheet[side].open = !state.sheet[side].open;
        });
      },

      // Left sidebar management (legacy)
      leftSidebar: {
        open: true,
        toggle: () => {
          set((state) => {
            state.leftSidebar.open = !state.leftSidebar.open;
          });
        },
        close: () => {
          set((state) => {
            state.leftSidebar.open = false;
          });
        },
        openSidebar: () => {
          set((state) => {
            state.leftSidebar.open = true;
          });
        },
      },

      // Right sidebar management (legacy)
      rightSidebar: {
        open: false,
        toggle: () => {
          set((state) => {
            state.rightSidebar.open = !state.rightSidebar.open;
          });
        },
        close: () => {
          set((state) => {
            state.rightSidebar.open = false;
          });
        },
        openSidebar: () => {
          set((state) => {
            state.rightSidebar.open = true;
          });
        },
      },

      // Generation state
      generation: {
        isGenerating: false,
        setIsGenerating: (isGenerating) => {
          set((state) => {
            state.generation.isGenerating = isGenerating;
          });
        },
        progress: 0,
        setProgress: (progress) => {
          set((state) => {
            state.generation.progress = progress;
          });
        },
        currentStep: "",
        setCurrentStep: (currentStep) => {
          set((state) => {
            state.generation.currentStep = currentStep;
          });
        },
      },

      // Interview flow state
      interview: {
        isActive: false,
        setIsActive: (isActive) => {
          set((state) => {
            state.interview.isActive = isActive;
          });
        },
        currentQuestion: 0,
        setCurrentQuestion: (currentQuestion) => {
          set((state) => {
            state.interview.currentQuestion = currentQuestion;
          });
        },
        questions: [],
        setQuestions: (questions) => {
          set((state) => {
            state.interview.questions = questions;
          });
        },
        answers: {},
        setAnswer: (questionIndex, answer) => {
          set((state) => {
            state.interview.answers[questionIndex] = answer;
          });
        },
      },

      // Content selection state
      contentSelection: {
        selectedStories: [],
        setSelectedStories: (selectedStories) => {
          set((state) => {
            state.contentSelection.selectedStories = selectedStories;
          });
        },
        addStory: (storyId) => {
          set((state) => {
            state.contentSelection.selectedStories.push(storyId);
          });
        },
        removeStory: (storyId) => {
          set((state) => {
            state.contentSelection.selectedStories = state.contentSelection.selectedStories.filter(
              (id) => id !== storyId,
            );
          });
        },
        clearStories: () => {
          set((state) => {
            state.contentSelection.selectedStories = [];
          });
        },
      },

      // Template and styling state
      template: {
        selectedTemplate: "professional",
        setSelectedTemplate: (selectedTemplate) => {
          set((state) => {
            state.template.selectedTemplate = selectedTemplate;
          });
        },
        tone: "professional",
        setTone: (tone) => {
          set((state) => {
            state.template.tone = tone;
          });
        },
        customInstructions: "",
        setCustomInstructions: (customInstructions) => {
          set((state) => {
            state.template.customInstructions = customInstructions;
          });
        },
      },

      // Page settings state
      page: {
        format: "a4", // Default to A4
        setFormat: (format) => {
          set((state) => {
            state.page.format = format;
          });
        },
        margin: 18, // Default margin
        setMargin: (margin) => {
          set((state) => {
            state.page.margin = margin;
          });
        },
      },
    })),
    {
      name: "cover-letter-builder",
    },
  ),
);
