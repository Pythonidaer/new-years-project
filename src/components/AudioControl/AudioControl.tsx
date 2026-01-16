import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/useTheme';
import { Play, Pause } from 'lucide-react';
import styles from './AudioControl.module.css';

export function AudioControl() {
  const { currentPresetId } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Only show when noname theme is active
  const isNonameActive = currentPresetId === 'noname';

  useEffect(() => {
    if (isNonameActive && !audioRef.current) {
      // Create audio element
      const audio = new Audio('/noname.mp3');
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

      // Store cleanup function
      return () => {
        audio.pause();
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
        audioRef.current = null;
        setIsPlaying(false);
      };
    } else if (!isNonameActive && audioRef.current) {
      // Clean up audio when theme changes away from noname
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [isNonameActive]);

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

  if (!isNonameActive) {
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

