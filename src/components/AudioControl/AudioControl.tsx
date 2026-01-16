import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/useTheme';
import { Volume2, VolumeX } from 'lucide-react';
import styles from './AudioControl.module.css';

export function AudioControl() {
  const { currentPresetId } = useTheme();
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Only show when noname theme is active
  const isNonameActive = currentPresetId === 'noname';

  useEffect(() => {
    if (isNonameActive && !audioRef.current) {
      // Create audio element
      const audio = new Audio('/noname.mp3');
      audio.loop = true; // Loop the audio
      audioRef.current = audio;

      // Try to play when theme is selected
      audio.play().catch((error) => {
        // Silently fail if autoplay is blocked (browser policy)
        console.log('Audio autoplay blocked or failed:', error);
      });
    } else if (!isNonameActive && audioRef.current) {
      // Clean up audio when theme changes away from noname
      audioRef.current.pause();
      audioRef.current = null;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isNonameActive]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = async () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      // Unmuting - ensure audio is playing (in case autoplay was blocked)
      audioRef.current.muted = false;
      setIsMuted(false);
      try {
        await audioRef.current.play();
      } catch (error) {
        console.log('Failed to play audio:', error);
      }
    } else {
      // Muting
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  if (!isNonameActive) {
    return null;
  }

  return (
    <button
      className={styles.trigger}
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      title={isMuted ? 'Unmute audio' : 'Mute audio'}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}

