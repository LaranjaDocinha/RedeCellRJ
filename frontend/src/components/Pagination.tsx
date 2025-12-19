import React from 'react';
import { PaginationContainer, PageButton } from './Pagination.styled';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Número máximo de botões de página a serem exibidos

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbersToRender = getPageNumbers();

  return (
    <PaginationContainer>
      <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </PageButton>
      {pageNumbersToRender.map((number, index) => (
        <PageButton
          key={index}
          onClick={() => typeof number === 'number' && onPageChange(number)}
          isActive={number === currentPage}
          disabled={typeof number !== 'number'}
        >
          {number}
        </PageButton>
      ))}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </PageButton>
    </PaginationContainer>
  );
};

export default Pagination;
