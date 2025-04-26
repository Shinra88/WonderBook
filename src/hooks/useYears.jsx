// 📁 hooks/useYears.jsx
import { useEffect, useState } from 'react';

export function useYears() {
  const [minYear, setMinYear] = useState(1900);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchMinYear = async () => {
      try {
        const res = await fetch('/api/books/minyear');
        const data = await res.json();
        if (data.minYear) setMinYear(data.minYear);
      } catch (err) {
        console.error('Erreur minYear :', err);
      }
    };
    fetchMinYear();
  }, []);

  return { minYear, currentYear };
}
