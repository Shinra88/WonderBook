// 📁 src/hooks/useEditors.js
import { useState, useEffect } from 'react';
import api from '../services/api/api';

export default function useEditors() {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEditors() {
      try {
        const res = await api.get('/publishers');
        const formatted = res.data.map(pub => ({
          id: pub.publisherId,
          name: pub.name,
        }));
        setEditors(formatted);
      } catch (err) {
        console.error('Erreur lors de la récupération des éditeurs :', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEditors();
  }, []);

  return { editors, loading, error };
}
