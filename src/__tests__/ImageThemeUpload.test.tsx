import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ImageThemeUpload } from '@/components/ThemePicker/ImageThemeUpload';
import { ThemePicker } from '@/components/ThemePicker/ThemePicker';
import { ThemeProvider } from '@/context/ThemeContext';
import { readImagePixels, themeFromPixels } from '@/utils/imageTheme';
import { cedar_oakTheme } from '@/context/themes/cedar-oak';
import type { Theme } from '@/context/themes/types';

vi.mock('@/utils/imageTheme', async () => {
  const actual = await vi.importActual<typeof import('@/utils/imageTheme')>('@/utils/imageTheme');
  return {
    ...actual,
    readImagePixels: vi.fn(),
  };
});

const pixels = [
  { r: 247, g: 243, b: 234 },
  { r: 224, g: 122, b: 61 },
  { r: 107, g: 68, b: 35 },
];

const lightPixels = [
  { r: 250, g: 248, b: 240 },
];

function deferred<T>() {
  let resolve: (_value: T) => void = () => {};
  let reject: (_reason: Error) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function ensureRoot() {
  if (!document.getElementById('root')) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }
}

describe('ImageThemeUpload', () => {
  beforeEach(() => {
    vi.mocked(readImagePixels).mockReset();
  });

  it('keeps the photo hint on an info control beside the heading', () => {
    render(<ImageThemeUpload onApply={vi.fn()} onSave={vi.fn()} />);

    const heading = screen.getByRole('heading', { name: /create from image/i });
    const info = screen.getByRole('button', { name: /preview a theme from a photo\. 20 mb max/i });

    expect(heading.parentElement?.contains(info)).toBe(true);
    expect(heading.compareDocumentPosition(info) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole('paragraph', { name: /20 mb max/i })).toBeNull();
  });

  it('renders a file input and applies a theme from a readable image', async () => {
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);

    const input = screen.getByLabelText(/^upload$/i);
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledTimes(1);
    });
    const theme = onApply.mock.calls[0][0] as Theme;
    expect(theme.bg).toMatch(/^(#|rgba?\()/);
    expect(theme.primary).toMatch(/^(#|rgba?\()/);
    expect(screen.getByRole('list', { name: /extracted colors/i })).toBeTruthy();
  });

  it('shows a save icon after a successful upload and asks to name the theme', async () => {
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    const onSave = vi.fn();
    render(<ImageThemeUpload onApply={vi.fn()} onSave={onSave} />);

    expect(screen.queryByRole('button', { name: /save image theme/i })).toBeNull();

    const input = screen.getByLabelText(/^upload$/i);
    fireEvent.change(input, { target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] } });

    const saveButton = await screen.findByRole('button', { name: /save image theme/i });
    const upload = screen.getByLabelText(/^upload$/i);
    expect(upload.compareDocumentPosition(saveButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows an error for a non-image and does not apply a theme', async () => {
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);

    const input = screen.getByLabelText(/^upload$/i);
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/image/i);
    expect(onApply).not.toHaveBeenCalled();
    expect(readImagePixels).not.toHaveBeenCalled();
  });

  it('shows an error for an image over 20 MB and does not apply a theme', async () => {
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);

    const input = screen.getByLabelText(/^upload$/i);
    const file = new File(['img'], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: (20 * 1024 * 1024) + 1 });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/20 MB/i);
    expect(onApply).not.toHaveBeenCalled();
    expect(readImagePixels).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('accepts an image between 10 MB and 20 MB', async () => {
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);

    const file = new File(['img'], 'medium.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 });
    fireEvent.change(screen.getByLabelText(/^upload$/i), { target: { files: [file] } });

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledTimes(1);
    });
    expect(readImagePixels).toHaveBeenCalledWith(file);
  });

  it('shows a processing state and lets a newer upload replace an older one', async () => {
    const first = deferred<typeof pixels>();
    const second = deferred<typeof lightPixels>();
    vi.mocked(readImagePixels)
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);
    const input = screen.getByLabelText(/^upload$/i);

    fireEvent.change(input, {
      target: { files: [new File(['a'], 'first.png', { type: 'image/png' })] },
    });
    expect(screen.getByRole('status')).toHaveTextContent(/processing image/i);
    expect(readImagePixels).toHaveBeenCalledTimes(1);

    fireEvent.change(input, {
      target: { files: [new File(['b'], 'second.png', { type: 'image/png' })] },
    });
    expect(readImagePixels).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /save image theme/i })).toBeNull();

    first.resolve(pixels);
    await waitFor(() => {
      expect(readImagePixels).toHaveBeenCalledTimes(2);
    });
    expect(onApply).not.toHaveBeenCalled();

    second.resolve(lightPixels);
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledTimes(1);
    });
    expect(onApply.mock.calls[0][0].bg).toBe(themeFromPixels(lightPixels).theme.bg);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('list', { name: /extracted colors/i })).toBeTruthy();
  });

  it('ignores a failed upload that finishes after a newer image was chosen', async () => {
    const first = deferred<typeof pixels>();
    const second = deferred<typeof lightPixels>();
    vi.mocked(readImagePixels)
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);
    const input = screen.getByLabelText(/^upload$/i);

    fireEvent.change(input, {
      target: { files: [new File(['a'], 'first.png', { type: 'image/png' })] },
    });
    fireEvent.change(input, {
      target: { files: [new File(['b'], 'second.png', { type: 'image/png' })] },
    });

    first.reject(new Error('Could not read image.'));
    await waitFor(() => {
      expect(readImagePixels).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByRole('alert')).toBeNull();

    second.resolve(lightPixels);
    await waitFor(() => {
      expect(onApply).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an error when the image cannot be decoded', async () => {
    vi.mocked(readImagePixels).mockRejectedValue(new Error('Could not read image.'));
    const onApply = vi.fn();
    render(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/^upload$/i), {
      target: { files: [new File(['x'], 'broken.jpg', { type: 'image/jpeg' })] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not read that image/i);
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('list', { name: /extracted colors/i })).toBeNull();
  });

  it('does not apply an upload that finishes after the preview is reset', async () => {
    const pending = deferred<typeof pixels>();
    vi.mocked(readImagePixels).mockReturnValue(pending.promise);
    const onApply = vi.fn();
    const { rerender } = render(
      <ImageThemeUpload onApply={onApply} onSave={vi.fn()} previewResetKey={0} />,
    );

    fireEvent.change(screen.getByLabelText(/^upload$/i), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });
    expect(screen.getByRole('status')).toBeTruthy();

    rerender(<ImageThemeUpload onApply={onApply} onSave={vi.fn()} previewResetKey={1} />);
    expect(screen.queryByRole('status')).toBeNull();

    await act(async () => {
      pending.resolve(pixels);
      await pending.promise;
    });
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole('list', { name: /extracted colors/i })).toBeNull();
  });

  it('is available at the top of the theme drawer', async () => {
    localStorage.clear();
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));

    expect(await screen.findByLabelText(/^upload$/i)).toBeTruthy();
    const upload = screen.getByText('Create from image');
    const presets = screen.getByText('Choose a theme');
    expect(upload.compareDocumentPosition(presets) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('previews an uploaded palette on the page before saving', async () => {
    localStorage.clear();
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));
    const input = await screen.findByLabelText(/^upload$/i);
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const primary = document.getElementById('root')?.style.getPropertyValue('--color-primary');
      expect(primary).toMatch(/^#/);
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled();
  });

  it('names an uploaded image as a preset that stays in this browser', async () => {
    localStorage.clear();
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));
    const input = await screen.findByLabelText(/^upload$/i);
    fireEvent.change(input, { target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] } });

    fireEvent.click(await screen.findByRole('button', { name: /save image theme/i }));
    const nameInput = await screen.findByPlaceholderText('Preset name...');
    fireEvent.change(nameInput, { target: { value: 'Photo theme' } });
    fireEvent.click(screen.getByRole('button', { name: /save preset/i }));

    await waitFor(() => {
      expect(screen.getByText('Photo theme')).toBeTruthy();
    });
    const presets = JSON.parse(localStorage.getItem('theme-presets') || '[]') as Array<{ name: string }>;
    const active = JSON.parse(localStorage.getItem('user-theme') || '{}') as { primary?: string };
    expect(presets.some((preset) => preset.name === 'Photo theme')).toBe(true);
    expect(active.primary).toMatch(/^#/);
  });

  it('clears the sampled colors when the preview reset key changes', async () => {
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    const { rerender } = render(
      <ImageThemeUpload onApply={vi.fn()} onSave={vi.fn()} previewResetKey={0} />,
    );

    fireEvent.change(screen.getByLabelText(/^upload$/i), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });

    expect(await screen.findByRole('list', { name: /extracted colors/i })).toBeTruthy();

    rerender(
      <ImageThemeUpload onApply={vi.fn()} onSave={vi.fn()} previewResetKey={1} />,
    );

    await waitFor(() => {
      expect(screen.queryByRole('list', { name: /extracted colors/i })).toBeNull();
    });
    expect(screen.queryByRole('button', { name: /save image theme/i })).toBeNull();
  });

  it('clears the upload preview after the image theme is saved', async () => {
    localStorage.clear();
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));
    fireEvent.change(await screen.findByLabelText(/^upload$/i), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /save image theme/i }));
    fireEvent.change(await screen.findByPlaceholderText('Preset name...'), {
      target: { value: 'Photo theme' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save preset/i }));

    await waitFor(() => {
      expect(screen.queryByRole('list', { name: /extracted colors/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /save image theme/i })).toBeNull();
    });
  });

  it('keeps the upload preview when naming is cancelled', async () => {
    localStorage.clear();
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    if (!document.getElementById('root')) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));
    fireEvent.change(await screen.findByLabelText(/^upload$/i), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });

    fireEvent.click(await screen.findByRole('button', { name: /save image theme/i }));
    fireEvent.click(await screen.findByRole('button', { name: /cancel preset/i }));

    expect(screen.getByRole('list', { name: /extracted colors/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /save image theme/i })).toBeTruthy();
  });

  it('clears the upload preview when another preset is selected', async () => {
    localStorage.clear();
    vi.mocked(readImagePixels).mockResolvedValue(pixels);
    ensureRoot();

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /open theme picker/i }));
    fireEvent.change(await screen.findByLabelText(/^upload$/i), {
      target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] },
    });
    expect(await screen.findByRole('list', { name: /extracted colors/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /select cedar oak theme/i }));

    await waitFor(() => {
      expect(screen.queryByRole('list', { name: /extracted colors/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /save image theme/i })).toBeNull();
    });
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
    expect(document.getElementById('root')?.style.getPropertyValue('--color-primary')).toBe(
      cedar_oakTheme.primary,
    );
  });
});
