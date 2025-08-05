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
        book_categories: [{ categories: { name: 'Fiction' } }, { categories: { name: 'Drama' } }],
        book_publishers: [
          { publishers: { name: 'Test Publisher' } },
          { publishers: { name: 'Second Publisher' } },
        ],
        cover_url: 'https://example.com/cover.jpg',
        ebook_url: 'https://example.com/book.epub',
        averageRating: 4.5,
        status: 'validated',
        validated_by: 'Shrina88',
      },
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
        averageRating: 4.5,
        status: 'validated',
        validated_by: 'Shrina88',
      },
    ]);
  });

  it('should handle empty array', () => {
    const result = formatBooks([]);

    expect(result).toEqual([]);
  });

  it('should handle book with missing fields', () => {
    const books = [
      {
        bookId: 1,
        // All other fields missing
      },
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
        averageRating: 0,
        status: 'validated',
        validated_by: null,
      },
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
        averageRating: null,
        status: null,
        validated_by: null,
      },
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
        averageRating: 0,
        status: 'validated',
        validated_by: null,
      },
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
        averageRating: 0,
        status: 'pending',
        validated_by: '',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual([]);
    expect(result[0].editors).toEqual([]);
    expect(result[0].averageRating).toBe(0);
    expect(result[0].status).toBe('pending');
    expect(result[0].validated_by).toBe(null); // Empty string becomes null
  });

  it('should handle multiple books', () => {
    const books = [
      {
        bookId: 1,
        title: 'Book One',
        author: 'Author One',
        averageRating: 3.5,
        status: 'validated',
        validated_by: 'Admin1',
      },
      {
        bookId: 2,
        title: 'Book Two',
        author: 'Author Two',
        averageRating: 4.0,
        status: 'pending',
        validated_by: null,
      },
    ];

    const result = formatBooks(books);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Book One');
    expect(result[0].status).toBe('validated');
    expect(result[0].validated_by).toBe('Admin1');
    expect(result[1].title).toBe('Book Two');
    expect(result[1].status).toBe('pending');
    expect(result[1].validated_by).toBe(null);
  });

  it('should handle book with single category and publisher', () => {
    const books = [
      {
        bookId: 4,
        title: 'Single Relations Book',
        book_categories: [{ categories: { name: 'Science Fiction' } }],
        book_publishers: [{ publishers: { name: 'Amazing Publisher' } }],
        status: 'validated',
        validated_by: 'Editor123',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual(['Science Fiction']);
    expect(result[0].editors).toEqual(['Amazing Publisher']);
    expect(result[0].status).toBe('validated');
    expect(result[0].validated_by).toBe('Editor123');
  });

  it('should handle book with undefined averageRating', () => {
    const books = [
      {
        bookId: 5,
        title: 'No Rating Book',
        averageRating: undefined,
      },
    ];

    const result = formatBooks(books);

    expect(result[0].averageRating).toBe(0);
    expect(result[0].status).toBe('validated'); // Default value
    expect(result[0].validated_by).toBe(null); // Default value
  });

  it('should handle book with zero averageRating', () => {
    const books = [
      {
        bookId: 6,
        title: 'Zero Rating Book',
        averageRating: 0,
      },
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
        ebook_url: '',
        status: '',
        validated_by: '',
      },
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
        averageRating: 0,
        status: 'validated', // Empty string becomes default
        validated_by: null, // Empty string becomes null
      },
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
          { categories: { name: 'Young Adult' } },
        ],
        book_publishers: [
          { publishers: { name: 'Publisher A' } },
          { publishers: { name: 'Publisher B' } },
          { publishers: { name: 'Publisher C' } },
        ],
        averageRating: 4.7,
        status: 'validated',
        validated_by: 'SuperAdmin',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].categories).toEqual(['Fantasy', 'Adventure', 'Young Adult']);
    expect(result[0].editors).toEqual(['Publisher A', 'Publisher B', 'Publisher C']);
    expect(result[0].averageRating).toBe(4.7);
    expect(result[0].status).toBe('validated');
    expect(result[0].validated_by).toBe('SuperAdmin');
  });

  it('should preserve all required fields in output', () => {
    const books = [
      {
        bookId: 9,
        title: 'Complete Fields Test',
      },
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
    expect(book).toHaveProperty('status');
    expect(book).toHaveProperty('validated_by');
  });

  it('should handle mixed valid and invalid data', () => {
    const books = [
      {
        bookId: 10,
        title: 'Valid Book',
        author: 'Valid Author',
        book_categories: [{ categories: { name: 'Valid Category' } }],
        status: 'validated',
        validated_by: 'ValidUser',
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
        book_publishers: null,
        status: 'pending',
        validated_by: null,
      },
    ];

    const result = formatBooks(books);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Valid Book');
    expect(result[0].status).toBe('validated');
    expect(result[0].validated_by).toBe('ValidUser');
    expect(result[1].title).toBe('Titre inconnu');
    expect(result[1].status).toBe('validated'); // Default
    expect(result[1].validated_by).toBe(null); // Default
    expect(result[2].title).toBe('Titre inconnu');
    expect(result[2].author).toBe('Auteur inconnu');
    expect(result[2].status).toBe('pending');
    expect(result[2].validated_by).toBe(null);
  });

  it('should handle decimal averageRating values', () => {
    const books = [
      {
        bookId: 13,
        title: 'Decimal Rating Book',
        averageRating: 3.14159,
      },
    ];

    const result = formatBooks(books);

    expect(result[0].averageRating).toBe(3.14159);
  });

  it('should handle date as string', () => {
    const books = [
      {
        bookId: 14,
        title: 'String Date Book',
        date: '2023',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].date).toBe('2023');
  });

  // ✅ Tests spécifiques pour les nouveaux champs
  it('should handle pending status correctly', () => {
    const books = [
      {
        bookId: 15,
        title: 'Pending Book',
        status: 'pending',
        validated_by: null,
      },
    ];

    const result = formatBooks(books);

    expect(result[0].status).toBe('pending');
    expect(result[0].validated_by).toBe(null);
  });

  it('should handle different status values', () => {
    const books = [
      {
        bookId: 16,
        title: 'Status Test Book',
        status: 'rejected',
        validated_by: 'ModeratorX',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].status).toBe('rejected');
    expect(result[0].validated_by).toBe('ModeratorX');
  });

  it('should convert empty strings to appropriate defaults for status and validated_by', () => {
    const books = [
      {
        bookId: 17,
        title: 'Empty Fields Book',
        status: '',
        validated_by: '',
      },
    ];

    const result = formatBooks(books);

    expect(result[0].status).toBe('validated'); // Empty string becomes default
    expect(result[0].validated_by).toBe(null); // Empty string becomes null
  });
});
