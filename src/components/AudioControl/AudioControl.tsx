import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/useTheme';
import { Play, Pause } from 'lucide-react';
import styles from './AudioControl.module.css';

export function AudioControl() {
  const { currentPresetId } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Store the audio file path (lazy-loaded - only create Audio on user interaction)
  const audioFileRef = useRef<string | null>(null);
  // Store handlers so we can remove them properly
  const handlersRef = useRef<{
    handlePlay: () => void;
    handlePause: () => void;
    handleEnded: () => void;
  } | null>(null);

  // Show when noname, samson, vapor-wave, king, or planet theme is active
  const isThemeWithAudio = currentPresetId === 'noname' || currentPresetId === 'samson' || currentPresetId === 'vapor-wave' || currentPresetId === 'king' || currentPresetId === 'planet';

  useEffect(() => {
    // Determine audio file based on theme (but don't create Audio yet - lazy load on interaction)
    let audioFile: string | null = null;
    if (currentPresetId === 'samson') {
      audioFile = '/samson.mp3';
    } else if (currentPresetId === 'noname') {
      audioFile = '/noname.mp3';
    } else if (currentPresetId === 'vapor-wave') {
      audioFile = 'http://radio.plaza.one/mp3';
    } else if (currentPresetId === 'king') {
      audioFile = '/i_have_a_dream_speech.mp3';
    } else if (currentPresetId === 'planet') {
      audioFile = '/earth_song.mp3';
    }

    // Store audio file path, but don't create Audio instance yet (prevents eager download)
    if (isThemeWithAudio && audioFile) {
      audioFileRef.current = audioFile;
    } else {
      audioFileRef.current = null;
    }

    // Cleanup: if audio was created, clean it up when theme changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (handlersRef.current) {
          audioRef.current.removeEventListener('play', handlersRef.current.handlePlay);
          audioRef.current.removeEventListener('pause', handlersRef.current.handlePause);
          audioRef.current.removeEventListener('ended', handlersRef.current.handleEnded);
        }
        audioRef.current = null;
      }
      handlersRef.current = null;
      setIsPlaying(false);
    };
  }, [isThemeWithAudio, currentPresetId]);

  // Lazy-load audio: create Audio instance only when user clicks play
  const initializeAudio = (): HTMLAudioElement | null => {
    // If audio already exists, return it
    if (audioRef.current) {
      return audioRef.current;
    }

    // If no audio file configured, can't create audio
    if (!audioFileRef.current) {
      return null;
    }

    // Create audio element only on user interaction (lazy load)
    const audio = new Audio(audioFileRef.current);
    audio.loop = true; // Loop the audio
    audioRef.current = audio;

    // Create event handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // Store handlers in ref so we can remove them properly
    handlersRef.current = { handlePlay, handlePause, handleEnded };

    // Listen for play/pause events to update state
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return audio;
  };

  const togglePlayPause = async () => {
    // Lazy-load audio on first play interaction
    const audio = initializeAudio();
    if (!audio) return;
    
    if (isPlaying) {
      // Pause
      audio.pause();
      setIsPlaying(false);
    } else {
      // Play
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Failed to play audio:', error);
        setIsPlaying(false);
      }
    }
  };

  if (!isThemeWithAudio) {
    return null;
  }

  return (
    <button
      className={styles.trigger}
      onClick={togglePlayPause}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      title={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
    </button>
  );
}

