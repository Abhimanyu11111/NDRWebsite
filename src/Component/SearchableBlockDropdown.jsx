import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axiosClient';
import styles from './Styles/SearchableDropdown.module.css';

function SearchableBlockDropdown({ value = [], onChange }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Regime filter
  const [regimes, setRegimes] = useState([]);
  const [selectedRegime, setSelectedRegime] = useState('');

  const dropdownRef = useRef(null);

  // Fetch regimes on mount
  useEffect(() => {
    const fetchRegimes = async () => {
      try {
        const res = await axios.get('/blocks/regimes');
        setRegimes(res.data.regimes || []);
      } catch (err) {
        console.error('Failed to fetch regimes:', err);
      }
    };
    fetchRegimes();
  }, []);

  // Search blocks with debounce
  useEffect(() => {
    const searchBlocks = async () => {
      if (query.length < 2) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        if (selectedRegime) params.append('regime', selectedRegime);

        const res = await axios.get(`/blocks/search?${params}`);
        setOptions(res.data.blocks || []);
      } catch (err) {
        console.error('Block search error:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchBlocks, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedRegime]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const isSelected = (blockName) => value.includes(blockName);

  const handleToggle = (block) => {
    if (isSelected(block.block_name)) {
      onChange(value.filter((b) => b !== block.block_name));
    } else {
      onChange([...value, block.block_name]);
    }
  };

  const handleRemoveChip = (blockName) => {
    onChange(value.filter((b) => b !== blockName));
  };

  return (
    <div className={styles.searchableDropdown} ref={dropdownRef}>
      {/* Regime Filter */}
      <div className={styles.filterRow}>
        <select
          className={styles.filterSelect}
          value={selectedRegime}
          onChange={(e) => setSelectedRegime(e.target.value)}
        >
          <option value="">All Regimes</option>
          {regimes.map((regime, idx) => (
            <option key={idx} value={regime}>{regime}</option>
          ))}
        </select>
      </div>

      {/* Selected Chips */}
      {value.length > 0 && (
        <div className={styles.chipsContainer}>
          {value.map((blockName) => (
            <span key={blockName} className={styles.chip}>
              {blockName}
              <button
                className={styles.chipRemove}
                onClick={() => handleRemoveChip(blockName)}
                type="button"
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Type to search blocks (e.g., AA-ONHP-2017/11)..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {/* Dropdown Results */}
      {isOpen && (
        <div className={styles.dropdownList}>
          {value.length > 0 && (
            <div className={styles.selectedCount}>
              {value.length} block{value.length > 1 ? 's' : ''} selected
            </div>
          )}

          {loading ? (
            <div className={styles.dropdownItem}>🔍 Searching...</div>
          ) : options.length > 0 ? (
            options.map((block) => (
              <div
                key={block.id}
                className={`${styles.dropdownItem} ${isSelected(block.block_name) ? styles.dropdownItemSelected : ''}`}
                onClick={() => handleToggle(block)}
              >
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isSelected(block.block_name)}
                    onChange={() => handleToggle(block)}
                    onClick={(e) => e.stopPropagation()}
                    readOnly
                  />
                  <div className={styles.blockInfo}>
                    <div className={styles.blockMain}>
                      <strong>{block.block_name}</strong>
                      <span className={styles.regimeBadge}>{block.regime}</span>
                    </div>
                    <div className={styles.blockMeta}>
                      {block.basin_name && `${block.basin_name} · `}
                      {block.block_area} · {block.operator}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : query.length >= 2 ? (
            <div className={styles.dropdownItem}>
              ❌ No blocks found for "{query}"
            </div>
          ) : (
            <div className={styles.dropdownItem}>
              💡 Type at least 2 characters to search
            </div>
          )}

          {options.length > 0 && (
            <div className={styles.dropdownFooter} onClick={() => setIsOpen(false)}>
              Done
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableBlockDropdown;
