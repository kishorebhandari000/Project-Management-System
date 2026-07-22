import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface DiscussableProject {
  id: string;
  title: string;
}

// A student can discuss projects they have an approved Allocation on; a
// supervisor/admin can discuss projects returned by GET /projects, which is
// already scoped server-side (supervisor: own projects, admin: all).
export function useMyProjects() {
  const [projects, setProjects] = useState<DiscussableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const role = localStorage.getItem('userRole');
        let list: DiscussableProject[];

        if (role === 'student') {
          const data = await api.get('/allocations?status=approved');
          list = data.allocations.map((a: { project: { _id: string; title: string } }) => ({
            id: a.project._id,
            title: a.project.title,
          }));
        } else {
          const data = await api.get('/projects');
          list = data.projects.map((p: { _id: string; title: string }) => ({
            id: p._id,
            title: p.title,
          }));
        }

        if (!cancelled) setProjects(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
