import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showInfo?: boolean;
  totalResults?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showInfo = true,
  totalResults,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate visible page numbers (max 5 pages)
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end of visible pages
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
      {/* Page Info */}
      {showInfo && (
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
            {totalResults && ` • ${totalResults.toLocaleString()} results`}
          </Typography>
        </Box>
      )}

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* First Page */}
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
          size="small"
          aria-label="First page"
        >
          <FirstPage />
        </IconButton>

        {/* Previous Page */}
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          size="small"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </IconButton>

        {/* Page Numbers */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {visiblePages.map((page) => (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                variant={page === currentPage ? 'contained' : 'outlined'}
                size="small"
                sx={{
                  minWidth: 32,
                  height: 32,
                  fontSize: '0.875rem',
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile: Show current page */}
        {isMobile && (
          <Typography variant="body2" sx={{ px: 2 }}>
            {currentPage} / {totalPages}
          </Typography>
        )}

        {/* Next Page */}
        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          size="small"
          aria-label="Next page"
        >
          <ChevronRight />
        </IconButton>

        {/* Last Page */}
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          size="small"
          aria-label="Last page"
        >
          <LastPage />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Pagination;
