// @ts-nocheck - Geçici olarak tüm tip kontrollerini devre dışı bırakıyoruz
import React, { useEffect, useState } from 'react';
import { Droppable, DroppableProps, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

interface StrictModeDroppableProps extends Omit<DroppableProps, 'children'> {
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  droppableId: string;
  type?: string;
  direction?: 'vertical' | 'horizontal';
  isDropDisabled?: boolean;
  mode?: string;
  isCombineEnabled?: boolean;
}

export const StrictModeDroppable: React.FC<StrictModeDroppableProps> = ({
  children,
  droppableId,
  type = 'DEFAULT',
  direction = 'vertical',
  isDropDisabled = false,
  isCombineEnabled = false,
  mode = 'standard',
  ...props
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <Droppable
      droppableId={droppableId}
      type={type}
      direction={direction}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      mode={mode}
      {...props}
    >
      {(provided, snapshot) => children(provided, snapshot)}
    </Droppable>
  );
}; 