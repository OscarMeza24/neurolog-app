import { ChildWithRelation } from '@/types';
import { useRouter } from 'next/navigation';

export function useChildHandlers() {
  const router = useRouter();

  const handleEdit = (child: ChildWithRelation) => {
    router.push(`/dashboard/children/${child.id}/edit`);
  };

  const handleViewDetails = (child: ChildWithRelation) => {
    router.push(`/dashboard/children/${child.id}`);
  };

  const handleManageUsers = (child: ChildWithRelation) => {
    router.push(`/dashboard/children/${child.id}/users`);
  };

  return { handleEdit, handleViewDetails, handleManageUsers };
}
