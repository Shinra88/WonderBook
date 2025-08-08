// 📁 src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import api from '../services/api/api';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function fetchCategories() {
      try {
        const res = await api.get('api/categories');

        if (res.data && Array.isArray(res.data)) {
          const formatted = res.data.map(cat => ({
            id: cat.categoryId,
            name: cat.name,
          }));
          setCategories(formatted);
        } else {
          console.log("❌ res.data n'est pas un tableau:", res.data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des catégories :', err);
        setError(err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
