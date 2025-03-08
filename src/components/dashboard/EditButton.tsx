import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-8 w-8 text-gray-500 hover:text-gray-700"
    >
      <Edit className="h-4 w-4" />
    </Button>
  );
}; 