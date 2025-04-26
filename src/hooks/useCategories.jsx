// 📁 src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import api from '../services/api/api';

export default function useCategories() {
  const [categories, setCategories] = useState([]); // contient des objets { id, name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        const formatted = res.data.map((cat) => ({
          id: cat.categoryId,
          name: cat.name,
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("Erreur lors de la récupération des catégories :", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return { categories, loading, error };
}
