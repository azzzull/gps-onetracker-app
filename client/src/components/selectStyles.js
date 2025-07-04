export const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: (state.isFocused || state.isHovered) ? '#0f172a' : '#0f172a', // slate-900
    borderWidth: '1.5px',
    boxShadow: state.isFocused ? '0 0 0 2px #cbd5e1' : 'none', // slate-200
    borderRadius: '0.375rem', // rounded-md
    minHeight: '2.5rem',
    paddingLeft: '0.25rem',
    backgroundColor: '#fff',
    fontSize: '1rem',
    color: '#0f172a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
  }),
  menu: base => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused || state.isHovered ? '#f1f5f9' : '#fff', // slate-100
    color: '#0f172a', // slate-900
    fontSize: '1rem',
    cursor: 'pointer',
  }),
  singleValue: base => ({ ...base, color: '#0f172a', fontWeight: 500 }),
  placeholder: base => ({ ...base, color: '#94a3b8', fontSize: '1rem' }), // slate-400
  input: base => ({ ...base, fontSize: '1rem', color: '#0f172a' }),
  indicatorSeparator: base => ({ ...base, display: 'none' }),
  dropdownIndicator: base => ({ ...base, color: '#64748b' }),
  clearIndicator: base => ({ ...base, color: '#64748b' }),
};