import { memo } from "react";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = memo<SearchInputProps>(({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = "" 
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={`flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      placeholder={placeholder}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
