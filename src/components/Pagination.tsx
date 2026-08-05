'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
      {/* Items count summary */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {totalItems && startItem && endItem ? (
          <span>
            Showing <strong className="font-semibold text-gray-900 dark:text-white">{startItem}</strong> to{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">{endItem}</strong> of{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">{totalItems}</strong> results
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-gray-900 dark:text-white">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-gray-900 dark:text-white">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}