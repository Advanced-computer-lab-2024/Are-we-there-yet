import React, { useState, useMemo } from "react";

export interface MultiSelectOption {
  value: string;
  label: string;
  payload?: any; // Payload can hold any additional data
}

interface SearchMultiSelectProps {
  options: MultiSelectOption[];
  selectedItems: MultiSelectOption[];
  onSelect: (item: MultiSelectOption) => void;
  onRemove: (item: MultiSelectOption) => void;
}

const SearchMultiSelect: React.FC<SearchMultiSelectProps> = ({
  options,
  selectedItems,
  onSelect,
  onRemove,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Ensure options are distinct by value
  const distinctOptions = useMemo(() => {
    const uniqueOptions = new Map(
      options?.map((option) => [option.value, option]),
    );
    return Array.from(uniqueOptions.values());
  }, [options]);

  const filteredOptions = useMemo(() => {
    return distinctOptions.filter(
      (option) =>
        option.label?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.some((selected) => selected.value === option.value),
    );
  }, [distinctOptions, searchTerm, selectedItems]);

  return (
    <div className="relative w-full rounded-md border border-borders-primary bg-secondary-light_grey p-4">
      <div className="mb-2 flex items-start">
        {/* Selected Items */}
        <div className="mr-2 flex flex-wrap">
          {selectedItems.length === 0 ? (
            <div className="text-text-primary"></div>
          ) : (
            selectedItems.map((item) => (
              <span
                key={item.value}
                className="mb-2 mr-2 flex items-center rounded-full bg-primary-blue px-2 py-1 text-text-white shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-md"
              >
                {item.label}
                <button
                  onClick={() => onRemove(item)}
                  className="hover:text-gold ml-1 text-destructive"
                >
                  &times;
                </button>
              </span>
            ))
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-auto w-[100px] rounded-md border border-borders-primary p-2 shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-blue md:w-[50%] lg:w-[75%]"
        />
      </div>

      {/* Options Dropdown */}
      {filteredOptions.length > 0 && (
        <div className="mt-2 max-h-40 overflow-hidden">
          <div
            className="max-h-40 w-full overflow-y-auto shadow-lg"
            style={{
              scrollbarWidth: "none", // For Firefox
              msOverflowStyle: "none", // For Internet Explorer and Edge
            }}
          >
            {/* Hide scrollbar for Chrome, Safari, and Opera */}
            <style>
              {`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => onSelect(option)}
                className="cursor-pointer rounded-md p-2 transition-colors duration-200 ease-in-out hover:bg-primary-green"
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchMultiSelect;
