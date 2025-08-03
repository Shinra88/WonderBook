// 📁 __tests__/utils/formatBooks.test.js
import { describe, it, expect } from 'vitest';
import { formatBooks } from './formatBooks';

describe('formatBooks', () => {
  const DEFAULT_COVER = 'https://wonderbook-images.s3.eu-north-1.amazonaws.com/covers/default.webp';

  it('should format a complete book correctly', () => {
    const books = [
      {
        bookId: 1,
        title: 'Test Book',
        search_title: 'test-book',
        author: 'John Doe',
        date: 2023,
        summary: 'A great test book',
        book_categories: [
          { categories: { name: 'Fiction' } },
          { categories: { name: 'Drama' } }
        ],
        book_publishers: [
          { publishers: { name: 'Test Publisher' } },
          { publishers: { name: 'Second Publisher' } }
        ],
        cover_url: 'https://example.com/cover.jpg',
        ebook_url: 'https://example.com/book.epub',
        averageRating: 4.5
      }
    ];

    const result = formatBooks(books);

    expect(result).toEqual([
      {
        bookId: 1,
        title: 'Test Book',
        search_title: 'test-book',
        author: 'John Doe',
        date: 2023,
        summary: 'A great test book',
        categories: ['Fiction', 'Drama'],
        editors: ['Test Publisher', 'Second Publisher'],
        cover_url: 'https://example.com/cover.jpg',
        ebook_url: 'https://example.com/book.epub',
        averageRating: 4.5
      }
    ]);
  });

  it('should handle empty array', () => {
    const result = formatBooks([]);
    
    expect(result).toEqual([]);
  });

  it('should handle book with missing fields', () => {
    const books = [
      {
        bookId: 1
        // All other fields missing
      }
    ];

    const result = formatBooks(books);

    expect(result).toEqual([
      {
        bookId: 1,
        title: 'Titre inconnu',
        search_title: '',
        author: 'Auteur inconnu',
        date: null,
        summary: 'Aucun résumé disponible.',
        categories: [],
        editors: [],
        cover_url: DEFAULT_COVER,
        ebook_url: null,
        averageRating: 0
      }
    ]);
  });

  it('should handle book with null fields', () => {
    const books = [
      {
        bookId: 2,
        title: null,
        search_title: null,
        author: null,
        date: null,
        summary: null,
        book_categories: null,
        book_publishers: null,
        cover_url: null,
        ebook_url: null,
        averageRating: null
      }
    ];

    const result = formatBooks(books);

    expect(result).toEqual([
      {
        bookId: 2,
        title: 'Titre inconnu',
        search_title: '',
        author: 'Auteur inconnu',
        date: null,
        summary: 'Aucun résumé disponible.',
        categories: [],
        editors: [],
        cover_url: DEFAULT_COVER,
        ebook_url: null,
        averageRating: 0
      }
    ]);
  });

  it('should handle book with empty arrays', () => {
    const books = [
      {
        bookId: 3,
        title: 'Book with empty arrays',
        author: 'Test Author',
        book_categories: [],
        book_publishers: [],
        averageRating: 0
      }
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual([]);
    expect(result[0].editors).toEqual([]);
    expect(result[0].averageRating).toBe(0);
  });

  it('should handle multiple books', () => {
    const books = [
      {
        bookId: 1,
        title: 'Book One',
        author: 'Author One',
        averageRating: 3.5
      },
      {
        bookId: 2,
        title: 'Book Two',
        author: 'Author Two',
        averageRating: 4.0
      }
    ];

    const result = formatBooks(books);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Book One');
    expect(result[1].title).toBe('Book Two');
  });

  it('should handle book with single category and publisher', () => {
    const books = [
      {
        bookId: 4,
        title: 'Single Relations Book',
        book_categories: [
          { categories: { name: 'Science Fiction' } }
        ],
        book_publishers: [
          { publishers: { name: 'Amazing Publisher' } }
        ]
      }
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual(['Science Fiction']);
    expect(result[0].editors).toEqual(['Amazing Publisher']);
  });

  it('should handle book with undefined averageRating', () => {
    const books = [
      {
        bookId: 5,
        title: 'No Rating Book',
        averageRating: undefined
      }
    ];

    const result = formatBooks(books);

    expect(result[0].averageRating).toBe(0);
  });

  it('should handle book with zero averageRating', () => {
    const books = [
      {
        bookId: 6,
        title: 'Zero Rating Book',
        averageRating: 0
      }
    ];

    const result = formatBooks(books);

    expect(result[0].averageRating).toBe(0);
  });

  it('should handle book with empty string fields', () => {
    const books = [
      {
        bookId: 7,
        title: '',
        search_title: '',
        author: '',
        summary: '',
        cover_url: '',
        ebook_url: ''
      }
    ];

    const result = formatBooks(books);

    expect(result).toEqual([
      {
        bookId: 7,
        title: 'Titre inconnu',
        search_title: '',
        author: 'Auteur inconnu',
        date: null,
        summary: 'Aucun résumé disponible.',
        categories: [],
        editors: [],
        cover_url: DEFAULT_COVER,
        ebook_url: null,
        averageRating: 0
      }
    ]);
  });

  it('should handle book with complex nested structure', () => {
    const books = [
      {
        bookId: 8,
        title: 'Complex Book',
        book_categories: [
          { categories: { name: 'Fantasy' } },
          { categories: { name: 'Adventure' } },
          { categories: { name: 'Young Adult' } }
        ],
        book_publishers: [
          { publishers: { name: 'Publisher A' } },
          { publishers: { name: 'Publisher B' } },
          { publishers: { name: 'Publisher C' } }
        ],
        averageRating: 4.7
      }
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual(['Fantasy', 'Adventure', 'Young Adult']);
    expect(result[0].editors).toEqual(['Publisher A', 'Publisher B', 'Publisher C']);
    expect(result[0].averageRating).toBe(4.7);
  });

  it('should preserve all required fields in output', () => {
    const books = [
      {
        bookId: 9,
        title: 'Complete Fields Test'
      }
    ];

    const result = formatBooks(books);
    const book = result[0];

    expect(book).toHaveProperty('bookId');
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('search_title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('date');
    expect(book).toHaveProperty('summary');
    expect(book).toHaveProperty('categories');
    expect(book).toHaveProperty('editors');
    expect(book).toHaveProperty('cover_url');
    expect(book).toHaveProperty('ebook_url');
    expect(book).toHaveProperty('averageRating');
  });

  it('should handle mixed valid and invalid data', () => {
    const books = [
      {
        bookId: 10,
        title: 'Valid Book',
        author: 'Valid Author',
        book_categories: [
          { categories: { name: 'Valid Category' } }
        ]
      },
      {
        bookId: 11,
        // Missing most fields
      },
      {
        bookId: 12,
        title: null,
        author: '',
        book_categories: [],
        book_publishers: null
      }
    ];

    const result = formatBooks(books);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Valid Book');
    expect(result[1].title).toBe('Titre inconnu');
    expect(result[2].title).toBe('Titre inconnu');
    expect(result[2].author).toBe('Auteur inconnu');
  });

  it('should handle decimal averageRating values', () => {
    const books = [
      {
        bookId: 13,
        title: 'Decimal Rating Book',
        averageRating: 3.14159
      }
    ];

    const result = formatBooks(books);

    expect(result[0].averageRating).toBe(3.14159);
  });

  it('should handle date as string', () => {
    const books = [
      {
        bookId: 14,
        title: 'String Date Book',
        date: '2023'
      }
    ];

    const result = formatBooks(books);

    expect(result[0].date).toBe('2023');
  });
});