import { memo } from "react";

interface FilterOption {
  value: string | number;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FilterOption[];
  placeholder: string;
  className?: string;
  width?: string;
}

const FilterSelect = memo<FilterSelectProps>(({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "",
  width = "w-56"
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${width} border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value} className="capitalize">
          {option.label}
        </option>
      ))}
    </select>
  );
});

FilterSelect.displayName = 'FilterSelect';

export default FilterSelect;
export type { FilterOption };
