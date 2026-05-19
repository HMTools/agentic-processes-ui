import React from 'react';

interface Principle {
  id: string;
  name: string;
  rule: string;
  verification: string;
  enabled: boolean;
  order: number;
}

interface PrinciplesListProps {
  principles: Principle[];
  onReorder: (newOrder: Principle[]) => void;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  editingId: string | null;
}

export const PrinciplesList: React.FC<PrinciplesListProps> = ({
  principles,
  onReorder,
  onToggle,
  onEdit,
  editingId
}) => {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (dragIndex === dropIndex) return;

    const newOrder = [...principles];
    const [draggedItem] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    onReorder(newOrder);
  };

  return (
    <div className="principles-list">
      {principles
        .sort((a, b) => a.order - b.order)
        .map((principle, index) => (
          <div
            key={principle.id}
            className={`principle-item ${!principle.enabled ? 'disabled' : ''} ${editingId === principle.id ? 'editing' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="principle-header">
              <div className="principle-order">{principle.order}</div>
              <div className="principle-name">{principle.name}</div>
              <div className="principle-controls">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={principle.enabled}
                    onChange={() => onToggle(principle.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <button
                  className="edit-btn"
                  onClick={() => onEdit(principle.id)}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="principle-rule">{principle.rule}</div>
            <div className="principle-verification">
              <strong>Verification:</strong> {principle.verification}
            </div>
          </div>
        ))}
    </div>
  );
};
