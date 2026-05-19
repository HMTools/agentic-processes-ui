import React, { useState } from 'react';

interface Principle {
  id: string;
  name: string;
  rule: string;
  verification: string;
  enabled: boolean;
  order: number;
}

interface PrincipleCardProps {
  principle: Principle;
  onSave: (updates: Partial<Principle>) => void;
  onCancel: () => void;
}

export const PrincipleCard: React.FC<PrincipleCardProps> = ({
  principle,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(principle.name);
  const [rule, setRule] = useState(principle.rule);
  const [verification, setVerification] = useState(principle.verification);

  const handleSave = () => {
    onSave({ name, rule, verification });
  };

  const handleCancel = () => {
    setName(principle.name);
    setRule(principle.rule);
    setVerification(principle.verification);
    onCancel();
  };

  return (
    <div className="principle-card-overlay">
      <div className="principle-card">
        <div className="principle-card-header">
          <h2>Edit Principle</h2>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="principle-card-body">
          <div className="form-group">
            <label htmlFor="principle-name">Name</label>
            <input
              id="principle-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PRINCIPLE NAME"
            />
          </div>

          <div className="form-group">
            <label htmlFor="principle-rule">Rule</label>
            <textarea
              id="principle-rule"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="Enter the principle rule..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="principle-verification">Verification</label>
            <textarea
              id="principle-verification"
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
              placeholder="How to verify compliance..."
              rows={3}
            />
          </div>
        </div>

        <div className="principle-card-footer">
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
