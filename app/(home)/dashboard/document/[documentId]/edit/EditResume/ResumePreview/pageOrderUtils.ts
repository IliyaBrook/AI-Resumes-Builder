import { useUpdateDocument } from '@/hooks';

export const usePageOrderUpdate = () => {
  const { mutate: updateDocument } = useUpdateDocument();

  const updatePagesOrder = (newOrder: string[]) => {
    updateDocument({
      pagesOrder: newOrder,
    });
  };

  return { updatePagesOrder };
};

export const moveSection = (
  currentOrder: string[],
  selectedSection: string,
  direction: 'up' | 'down'
): string[] | null => {
  const currentIndex = currentOrder.indexOf(selectedSection);
  if (currentIndex === -1) return null;

  const newOrder = [...currentOrder];

  if (direction === 'up' && currentIndex > 0) {
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
  } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
  } else {
    return null;
  }

  return newOrder;
};
