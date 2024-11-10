import React, { useState, useMemo, useEffect } from "react";
import { Search, X, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
  payload?: {
    type: string;
    historical_period: string;
  };
}

interface SearchMultiSelectProps {
  options: MultiSelectOption[];
  selectedItems: MultiSelectOption[];
  onSelect: (item: MultiSelectOption) => void;
  onRemove: (item: MultiSelectOption) => void;
  onUpdate?: (items: MultiSelectOption[]) => void;
  initialSelectedItems?: MultiSelectOption[];
}

const MAX_VISIBLE_TAGS = 4;

const TouristSearchMultiSelect: React.FC<SearchMultiSelectProps> = ({
  options,
  selectedItems,
  onSelect,
  onRemove,
  onUpdate,
  initialSelectedItems = [],
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newlySelected, setNewlySelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Create arrays of comparable strings
    const initialIds = initialSelectedItems.map((item) => item.value);
    const currentIds = selectedItems.map((item) => item.value);

    // Compare arrays
    const isDifferent =
      initialIds.length !== currentIds.length ||
      initialIds.some((id, index) => id !== currentIds[index]);

    setHasChanges(isDifferent);
  }, [selectedItems, initialSelectedItems]);

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

  const handleSelect = (item: MultiSelectOption) => {
    setNewlySelected((prev) => new Set([...prev, item.value]));
    onSelect(item);
  };

  const handleUpdate = () => {
    onUpdate?.(selectedItems);
    setHasChanges(false);
    setNewlySelected(new Set()); // Clear all "new" states when update is clicked
  };

  const handleRemove = (item: MultiSelectOption) => {
    setNewlySelected((prev) => {
      const updated = new Set(prev);
      updated.delete(item.value);
      return updated;
    });
    onRemove(item);
  };

  const renderTag = (item: MultiSelectOption) => {
    const isNew = newlySelected.has(item.value);
    return (
      <span
        key={item.value}
        className={`inline-flex items-center rounded-md px-3 py-3 text-sm font-medium ring-1 ring-inset transition-all duration-300 ${
          isNew
            ? "bg-accent-dark-blue text-white ring-accent-dark-blue"
            : "bg-secondary-light_grey text-gray-700 ring-gray-200"
        }`}
      >
        {item.label}
        <button
          onClick={() => handleRemove(item)}
          className={`ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-opacity-20 ${
            isNew
              ? "text-white hover:bg-white"
              : "text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    );
  };

  const renderMoreTags = () => {
    if (selectedItems.length <= MAX_VISIBLE_TAGS) return null;

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center rounded-md bg-secondary-light_grey px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto bg-white p-2">
          <div className="flex flex-col gap-2">
            {selectedItems.slice(MAX_VISIBLE_TAGS).map(renderTag)}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="w-full bg-transparent shadow-sm">
      <CardContent className="p-6">
        <div className="relative mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-secondary-light_grey px-4 py-2 pl-10 text-sm text-gray-700 transition-all duration-200 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {selectedItems.slice(0, MAX_VISIBLE_TAGS).map(renderTag)}
            {renderMoreTags()}
          </div>

          {hasChanges && (
            <Button
              onClick={handleUpdate}
              className="ml-4 w-[20%] bg-accent-dark-blue text-white hover:bg-accent-dark-blue"
            >
              Update
            </Button>
          )}
        </div>

        {filteredOptions.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-transparent shadow-sm">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-secondary-foreground/20"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}

        {searchTerm && filteredOptions.length === 0 && (
          <div className="mt-2 text-center text-sm text-gray-500">
            No results found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TouristSearchMultiSelect;
