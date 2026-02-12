import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { vi, describe, it, beforeEach, afterEach, expect} from "vitest";
import { AudioControl } from "@/components/AudioControl/AudioControl";
import { useTheme } from "@/context/useTheme";

vi.mock("@/context/useTheme", () => ({
  useTheme: vi.fn(),
}));

type ListenerMap = Record<string, Set<() => void>>;

class FakeAudio {
  public src: string;
  public loop = false;

  public play = vi.fn(() => Promise.resolve());
  public pause = vi.fn();
  public removeEventListener = vi.fn((event: string, cb: () => void) => {
    this.listeners[event]?.delete(cb);
  });

  private listeners: ListenerMap = {};

  constructor(src: string) {
    this.src = src;
  }

  addEventListener(event: string, cb: () => void) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(cb);
  }

  emit(event: string) {
    this.listeners[event]?.forEach((cb) => cb());
  }
}

describe("AudioControl", () => {
  let presetId = "default";
  const instances: FakeAudio[] = [];

  beforeEach(() => {
    presetId = "default";
    instances.length = 0; // Clear instances array

    (useTheme as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      currentPresetId: presetId,
    }));

    // Create a proper constructor function for Audio
    function AudioConstructor(this: unknown, src: string) {
      const inst = new FakeAudio(src);
      instances.push(inst);
      // Return the instance directly (constructor can return object)
      return inst as unknown as HTMLAudioElement;
    }

    // Mock global Audio constructor for jsdom
    // Use Object.defineProperty to ensure it's properly set up
    Object.defineProperty(globalThis, "Audio", {
      value: AudioConstructor,
      writable: true,
      configurable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up global Audio mock
    delete (globalThis as Record<string, unknown>).Audio;
  });

  it("returns null when theme has no audio", () => {
    presetId = "default";
    const { container } = render(<AudioControl />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Play button for an audio theme", async () => {
    presetId = "samson";
    render(<AudioControl />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });
    // Audio should NOT be created until user clicks play (lazy loading)
    expect(instances.length).toBe(0);
  });

  it("does not create audio until user clicks play (lazy loading)", async () => {
    presetId = "samson";
    render(<AudioControl />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    expect(instances.length).toBe(0);

    const button = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(instances[0].src).toBe("/samson.mp3");
    });
  });

  it("plays then switches UI to Pause (play success path)", async () => {
    presetId = "samson";
    render(<AudioControl />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Audio should not exist yet (lazy loading)
    expect(instances.length).toBe(0);

    const button = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(button);

    // Wait for audio to be created and play to be called
    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(instances[0].play).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: /pause audio/i })).toBeInTheDocument();
    });
  });

  it("pauses when already playing (pause branch)", async () => {
    presetId = "samson";
    render(<AudioControl />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Click play to create audio and start playing
    const playButton = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(screen.getByRole("button", { name: /pause audio/i })).toBeInTheDocument();
    });

    // Click pause
    const pauseButton = screen.getByRole("button", { name: /pause audio/i });
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Verify pause was called
    expect(instances[0].pause).toHaveBeenCalled();
  });

  it("handles play() rejection (catch branch)", async () => {
    presetId = "samson";
    render(<AudioControl />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    const button = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(screen.getByRole("button", { name: /pause audio/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /pause audio/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    instances[0].play = vi.fn(() => Promise.reject(new Error("nope")));

    fireEvent.click(screen.getByRole("button", { name: /play audio/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });
  });

  it("runs cleanup when theme changes from audio -> non-audio (covers audioRef.current cleanup)", async () => {
    presetId = "samson";
    const { rerender } = render(<AudioControl />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Click play to create audio
    const playButton = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(playButton);

    // Wait for audio to be created
    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(screen.getByRole("button", { name: /pause audio/i })).toBeInTheDocument();
    });

    const firstInstance = instances[0];
    expect(firstInstance).toBeTruthy();

    // Clear mocks to track cleanup calls
    firstInstance.pause.mockClear();
    firstInstance.removeEventListener.mockClear();

    // Change theme to something without audio => component returns null
    presetId = "default";
    await act(async () => {
      rerender(<AudioControl />);
    });

    // After rerender, component should be gone
    await waitFor(() => {
      expect(screen.queryByRole("button")).toBeNull();
    });

    // Verify cleanup was called on the first audio instance
    expect(firstInstance.pause).toHaveBeenCalled();
    // removeEventListener should be called 3 times (play, pause, ended)
    expect(firstInstance.removeEventListener).toHaveBeenCalledTimes(3);
  });

  it("runs cleanup when theme changes from one audio theme to another", async () => {
    presetId = "samson";
    const { rerender } = render(<AudioControl />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Click play to create audio
    const playButton = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(playButton);

    // Wait for audio to be created
    await waitFor(() => {
      expect(instances.length).toBe(1);
      expect(screen.getByRole("button", { name: /pause audio/i })).toBeInTheDocument();
    });

    const firstInstance = instances[0];
    expect(firstInstance).toBeTruthy();

    // Clear mocks to track cleanup calls
    firstInstance.pause.mockClear();
    firstInstance.removeEventListener.mockClear();

    // Change theme to another audio theme
    presetId = "king";
    await act(async () => {
      rerender(<AudioControl />);
    });

    // Wait for button to render with new theme
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Click play to create new audio instance
    const newPlayButton = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(newPlayButton);

    // Wait for new audio to be created
    await waitFor(() => {
      expect(instances.length).toBe(2);
    });

    // Verify cleanup was called on the first audio instance
    expect(firstInstance.pause).toHaveBeenCalled();
    // removeEventListener should be called 3 times (play, pause, ended)
    expect(firstInstance.removeEventListener).toHaveBeenCalledTimes(3);
  });

  it("creates audio with correct file for each theme", async () => {
    const themes = [
      { id: "samson", file: "/samson.mp3" },
      { id: "noname", file: "/noname.mp3" },
      { id: "vapor-wave", file: "http://radio.plaza.one/mp3" },
      { id: "king", file: "/i_have_a_dream_speech.mp3" },
      { id: "planet", file: "/earth_song.mp3" },
    ];

    for (const theme of themes) {
      instances.length = 0; // Clear for each test
      presetId = theme.id;
      const { rerender } = render(<AudioControl />);

      // Wait for button to render
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
      });

      // Audio should not exist yet (lazy loading)
      expect(instances.length).toBe(0);

      // Click play to create audio
      const button = screen.getByRole("button", { name: /play audio/i });
      fireEvent.click(button);

      // Wait for audio to be created with correct file
      await waitFor(() => {
        expect(instances.length).toBe(1);
        expect(instances[0].src).toBe(theme.file);
      });

      rerender(<div />); // Cleanup
    }
  });

  it("sets audio loop to true", async () => {
    presetId = "samson";
    render(<AudioControl />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /play audio/i })).toBeInTheDocument();
    });

    // Click play to create audio
    const button = screen.getByRole("button", { name: /play audio/i });
    fireEvent.click(button);

    // Wait for audio to be created
    await waitFor(() => {
      expect(instances.length).toBe(1);
    });

    expect(instances[0].loop).toBe(true);
  });
});
