'use client';

import { ChallengeCategory, ChallengeLevel } from '@/lib/types/challenge-system';
import { useState } from 'react';

interface FilterState {
  categories: ChallengeCategory[];
  levels: ChallengeLevel[];
  duration: { min: number | undefined; max: number | undefined };
  hasSpots: boolean;
  startingSoon: boolean;
}

interface ChallengeFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const categoryOptions = [
  { value: ChallengeCategory.TECHNICAL, label: '💻 Technical', color: 'bg-blue-100 text-blue-800' },
  { value: ChallengeCategory.DESIGN, label: '🎨 Design', color: 'bg-purple-100 text-purple-800' },
  { value: ChallengeCategory.MARKETING, label: '📢 Marketing', color: 'bg-green-100 text-green-800' },
  { value: ChallengeCategory.BUSINESS, label: '💼 Business', color: 'bg-orange-100 text-orange-800' },
  { value: ChallengeCategory.COMMUNITY, label: '👥 Community', color: 'bg-pink-100 text-pink-800' },
  { value: ChallengeCategory.SUSTAINABILITY, label: '🌱 Sustainability', color: 'bg-emerald-100 text-emerald-800' },
];

const levelOptions = [
  { value: ChallengeLevel.BEGINNER, label: 'Beginner', color: 'bg-gray-100 text-gray-700' },
  { value: ChallengeLevel.INTERMEDIATE, label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  { value: ChallengeLevel.ADVANCED, label: 'Advanced', color: 'bg-orange-100 text-orange-700' },
  { value: ChallengeLevel.EXPERT, label: 'Expert', color: 'bg-red-100 text-red-700' },
];

export function ChallengeFilters({ filters, onFiltersChange }: ChallengeFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showDurationSlider, setShowDurationSlider] = useState(false);

  const toggleCategory = (category: ChallengeCategory) => {
    const updated = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    const newFilters = { ...localFilters, categories: updated };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleLevel = (level: ChallengeLevel) => {
    const updated = localFilters.levels.includes(level)
      ? localFilters.levels.filter(l => l !== level)
      : [...localFilters.levels, level];
    
    const newFilters = { ...localFilters, levels: updated };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateDuration = (type: 'min' | 'max', value: number | undefined) => {
    const newFilters = {
      ...localFilters,
      duration: { ...localFilters.duration, [type]: value }
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleFilter = (key: 'hasSpots' | 'startingSoon') => {
    const newFilters = { ...localFilters, [key]: !localFilters[key] };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      levels: [],
      duration: { min: undefined, max: undefined },
      hasSpots: false,
      startingSoon: false,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = 
    localFilters.categories.length + 
    localFilters.levels.length + 
    (localFilters.duration.min || localFilters.duration.max ? 1 : 0) +
    (localFilters.hasSpots ? 1 : 0) +
    (localFilters.startingSoon ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <button
              key={category.value}
              onClick={() => toggleCategory(category.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                localFilters.categories.includes(category.value)
                  ? category.color + ' border-2 border-current'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Difficulty Level</h4>
        <div className="space-y-2">
          {levelOptions.map((level) => (
            <button
              key={level.value}
              onClick={() => toggleLevel(level.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                localFilters.levels.includes(level.value)
                  ? level.color + ' border-2 border-current'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Duration</h4>
        <button
          onClick={() => setShowDurationSlider(!showDurationSlider)}
          className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors"
        >
          {localFilters.duration.min || localFilters.duration.max
            ? `${localFilters.duration.min || 0} - ${localFilters.duration.max || 30} days`
            : 'Any duration'
          }
        </button>
        
        {showDurationSlider && (
          <div className="mt-3 px-3 space-y-3">
            <div>
              <label className="text-xs text-gray-600">Min days: {localFilters.duration.min || 0}</label>
              <input
                id="min-duration-range"
                name="minDuration"
                type="range"
                min="0"
                max="30"
                value={localFilters.duration.min || 0}
                onChange={(e) => updateDuration('min', parseInt(e.target.value) || undefined)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Max days: {localFilters.duration.max || 30}</label>
              <input
                id="max-duration-range"
                name="maxDuration"
                type="range"
                min="0"
                max="30"
                value={localFilters.duration.max || 30}
                onChange={(e) => updateDuration('max', parseInt(e.target.value) || undefined)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Other Filters */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="has-spots-checkbox"
            name="hasSpots"
            type="checkbox"
            checked={localFilters.hasSpots}
            onChange={() => toggleFilter('hasSpots')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Has spots available</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="starting-soon-checkbox"
            name="startingSoon"
            type="checkbox"
            checked={localFilters.startingSoon}
            onChange={() => toggleFilter('startingSoon')}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Starting soon</span>
        </label>
      </div>
    </div>
  );
}