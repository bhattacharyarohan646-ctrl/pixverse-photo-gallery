import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiClock, FiMic, FiMicOff } from 'react-icons/fi';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Search bar with recent searches dropdown and Web Speech API Voice Search
 * @param {string} value - current query
 * @param {Function} onChange - called with new query string
 * @param {string} placeholder
 * @param {boolean} large - bigger height for Hero
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search photos, photographers, tags…',
  large = false,
}) {
  const [focused, setFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage('pixverse-recent-searches', []);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        saveRecent(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onChange]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Voice search is not supported by your current browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const saveRecent = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) =>
      [trimmed, ...prev.filter((r) => r !== trimmed)].slice(0, 8)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      saveRecent(value);
      inputRef.current?.blur();
    }
  };

  const handleRecent = (term) => {
    onChange(term);
    inputRef.current?.blur();
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const showDropdown = focused && recentSearches.length > 0 && !value.trim();

  const pad = large ? '1.1rem 5.5rem 1.1rem 3.5rem' : '0.7rem 4.5rem 0.7rem 2.75rem';
  const iconSize = large ? 20 : 17;
  const fontSize = large ? '1rem' : '0.875rem';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <FiSearch
          size={iconSize}
          style={{
            position: 'absolute',
            left: large ? '1rem' : '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder={isListening ? '🎙️ Listening... speak now' : placeholder}
          style={{
            width: '100%',
            padding: pad,
            fontSize,
            background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isListening ? '#EF4444' : focused ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '14px',
            color: '#fff',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.2)' : focused ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />

        {/* Right Buttons: Voice Search & Clear */}
        <div style={{
          position: 'absolute',
          right: large ? '1rem' : '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {value && (
            <button
              onClick={() => onChange('')}
              style={{
                color: '#64748b', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              title="Clear search"
            >
              <FiX size={iconSize - 2} />
            </button>
          )}

          <button
            onClick={toggleVoiceSearch}
            style={{
              color: isListening ? '#EF4444' : '#64748b',
              background: isListening ? 'rgba(239,68,68,0.2)' : 'none',
              border: 'none',
              borderRadius: '50%',
              width: 28, height: 28,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
            onMouseEnter={(e) => { if (!isListening) e.currentTarget.style.color = '#3B82F6'; }}
            onMouseLeave={(e) => { if (!isListening) e.currentTarget.style.color = '#64748b'; }}
            title={isListening ? 'Stop listening' : 'Voice Search'}
          >
            {isListening ? <FiMicOff size={iconSize} /> : <FiMic size={iconSize} />}
          </button>
        </div>
      </div>

      {/* Recent Searches Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px 6px',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FiClock size={11} /> Recent
              </span>
              <button
                onMouseDown={clearRecentSearches}
                style={{
                  fontSize: '0.75rem',
                  color: '#60A5FA',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Clear all
              </button>
            </div>

            {recentSearches.map((term, i) => (
              <button
                key={i}
                onMouseDown={() => handleRecent(term)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <FiClock size={13} style={{ color: '#475569', flexShrink: 0 }} />
                {term}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
