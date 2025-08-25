import { useState, useCallback } from 'react';

/**
 * Custom hook for managing element selection state in the canvas
 * 
 * @description
 * This hook provides functionality for selecting single or multiple elements
 * with comprehensive error handling to prevent Set-related TypeErrors.
 * 
 * @returns {Object} Selection state and methods
 * @returns {Array} selectedElements - Array of currently selected element IDs
 * @returns {string} selectionMode - Current selection mode ('single' | 'multiple')
 * @returns {Function} setSelectionMode - Function to change selection mode
 * @returns {Function} selectElement - Function to select/deselect an element
 * @returns {Function} clearSelection - Function to clear all selections
 * @returns {Function} isSelected - Function to check if element is selected
 */
export function useSelection() {
  // Initialize with a new Set to ensure proper Set functionality
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'multiple'

  /**
   * Selects or deselects an element based on current selection mode
   * 
   * @param {string|number} elementId - Unique identifier for the element
   * 
   * @description
   * - In 'single' mode: Replaces current selection with the new element
   * - In 'multiple' mode: Toggles the element (add if not selected, remove if selected)
   * 
   * @example
   * selectElement('poem-line-1'); // Selects line 1
   * selectElement('poem-line-1'); // In multiple mode: deselects line 1
   */
  const selectElement = useCallback((elementId) => {
    setSelectedElements(prev => {
      /**
       * Safety Check: Ensure prev is always a valid Set
       * 
       * @description
       * This prevents the TypeError "Cannot read properties of undefined (reading 'add')"
       * that can occur if the Set state becomes corrupted or undefined.
       * 
       * Possible causes for Set corruption:
       * - React state updates in strict mode
       * - Browser compatibility issues with Set
       * - Memory issues during heavy re-renders
       * - Concurrent state updates
       */
      const safePrev = prev instanceof Set ? prev : new Set();
      const newSelection = new Set(safePrev);
      
      if (selectionMode === 'single') {
        /**
         * Single Selection Mode:
         * Clear all existing selections and add only the new element
         */
        newSelection.clear();
        newSelection.add(elementId);
      } else {
        /**
         * Multiple Selection Mode:
         * Toggle the element - remove if selected, add if not selected
         */
        if (newSelection.has(elementId)) {
          newSelection.delete(elementId);
        } else {
          newSelection.add(elementId);
        }
      }
      
      return newSelection;
    });
  }, [selectionMode]);

  /**
   * Clears all selected elements
   * 
   * @description
   * Creates a new empty Set to reset all selections.
   * Safe to call at any time, even when no elements are selected.
   * 
   * @example
   * clearSelection(); // Removes all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedElements(new Set());
  }, []);

  /**
   * Checks if a specific element is currently selected
   * 
   * @param {string|number} elementId - Element ID to check
   * @returns {boolean} True if element is selected, false otherwise
   * 
   * @description
   * Includes safety check to handle cases where selectedElements
   * might not be a proper Set instance.
   * 
   * @example
   * const isLineSelected = isSelected('poem-line-1');
   * if (isLineSelected) {
   *   // Apply selection styling
   * }
   */
  const isSelected = useCallback((elementId) => {
    // Safety check: ensure selectedElements is a Set with has() method
    if (selectedElements instanceof Set && typeof selectedElements.has === 'function') {
      return selectedElements.has(elementId);
    }
    return false; // Safe fallback
  }, [selectedElements]);

  /**
   * Return object with all selection functionality
   * 
   * @description
   * selectedElements is converted to Array for easier consumption by components.
   * The original Set is preserved internally for performance.
   */
  return {
    /** @type {Array} Array of currently selected element IDs */
    selectedElements: Array.from(selectedElements),
    
    /** @type {string} Current selection mode ('single' | 'multiple') */
    selectionMode,
    
    /** @type {Function} Function to change selection mode */
    setSelectionMode,
    
    /** @type {Function} Function to select/deselect an element */
    selectElement,
    
    /** @type {Function} Function to clear all selections */
    clearSelection,
    
    /** @type {Function} Function to check if element is selected */
    isSelected,
  };
}
