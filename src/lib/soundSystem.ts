// Premium Sound System for immersive experience

class SoundSystem {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', this.enabled.toString());
    }
    return this.enabled;
  }

  // Set volume
  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // Check if enabled
  isEnabled() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('soundEnabled');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
    return this.enabled;
  }

  // Play hover sound
  playHover() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.volume * 0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  // Play click sound
  playClick() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(this.volume * 0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.05);
  }

  // Play success sound
  playSuccess() {
    if (!this.enabled || !this.context) return;

    const frequencies = [523.25, 659.25, 783.99]; // C, E, G
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.15, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 0.3);

        oscillator.start(this.context!.currentTime);
        oscillator.stop(this.context!.currentTime + 0.3);
      }, i * 100);
    });
  }

  // Play error sound
  playError() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(this.volume * 0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.2);
  }

  // Play whoosh (transition)
  playWhoosh() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(1000, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.3);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.volume * 0.15, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.3);
  }

  // Play ambient hum (background)
  playAmbient() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = 60;
    oscillator.type = 'sine';

    filter.type = 'lowpass';
    filter.frequency.value = 200;

    gainNode.gain.setValueAtTime(this.volume * 0.05, this.context.currentTime);

    oscillator.start(this.context.currentTime);

    return () => {
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 1);
      oscillator.stop(this.context!.currentTime + 1);
    };
  }

  // Play notification
  playNotification() {
    if (!this.enabled || !this.context) return;

    const frequencies = [659.25, 783.99]; // E, G
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = this.context!.createOscillator();
        const gainNode = this.context!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context!.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(this.volume * 0.15, this.context!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context!.currentTime + 0.2);

        oscillator.start(this.context!.currentTime);
        oscillator.stop(this.context!.currentTime + 0.2);
      }, i * 80);
    });
  }

  // Play laser (futuristic click)
  playLaser() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(2000, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(this.volume * 0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.1);
  }

  // Play power up
  playPowerUp() {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1600, this.context.currentTime + 0.4);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(this.volume * 0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.4);
  }
}

// Create singleton instance
export const soundSystem = new SoundSystem();
