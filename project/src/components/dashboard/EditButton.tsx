import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} title="Düzenle">
      <Pencil className="h-4 w-4" />
    </Button>
  );
}; 