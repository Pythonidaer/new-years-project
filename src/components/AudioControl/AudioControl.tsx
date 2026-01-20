import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/useTheme';
import { Play, Pause } from 'lucide-react';
import styles from './AudioControl.module.css';

export function AudioControl() {
  const { currentPresetId } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Show when noname, samson, vapor-wave, or king theme is active
  const isThemeWithAudio = currentPresetId === 'noname' || currentPresetId === 'samson' || currentPresetId === 'vapor-wave' || currentPresetId === 'king';

  useEffect(() => {
    // Determine audio file based on theme
    let audioFile: string | null = null;
    if (currentPresetId === 'samson') {
      audioFile = '/samson.mp3';
    } else if (currentPresetId === 'noname') {
      audioFile = '/noname.mp3';
    } else if (currentPresetId === 'vapor-wave') {
      audioFile = 'http://radio.plaza.one/mp3';
    } else if (currentPresetId === 'king') {
      audioFile = '/i_have_a_dream_speech.mp3';
    }

    // Clean up existing audio if theme changed or theme no longer has audio
    if (audioRef.current) {
      const currentAudio = audioRef.current;
      currentAudio.pause();
      currentAudio.removeEventListener('play', () => setIsPlaying(true));
      currentAudio.removeEventListener('pause', () => setIsPlaying(false));
      currentAudio.removeEventListener('ended', () => setIsPlaying(false));
      audioRef.current = null;
      setIsPlaying(false);
    }

    // Create new audio if theme has audio
    if (isThemeWithAudio && audioFile) {
      // Create audio element
      const audio = new Audio(audioFile);
      audio.loop = true; // Loop the audio
      audioRef.current = audio;

      // Create event handlers
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);

      // Listen for play/pause events to update state
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      // Don't autoplay - user must click Play button
      setIsPlaying(false);

      // Cleanup function
      return () => {
        audio.pause();
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audioRef.current = null;
        setIsPlaying(false);
      };
    }
  }, [isThemeWithAudio, currentPresetId]);

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // Pause
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play
      try {
        await audioRef.current.play();
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

