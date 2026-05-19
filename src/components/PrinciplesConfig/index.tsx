import React, { useState, useEffect } from 'react';
import { PrinciplesList } from './PrinciplesList';
import { PrincipleCard } from './PrincipleCard';
import './PrinciplesConfig.css';

interface Principle {
  id: string;
  name: string;
  rule: string;
  verification: string;
  enabled: boolean;
  order: number;
}

interface PrinciplesConfig {
  version: string;
  principles: Principle[];
}

export const PrinciplesConfig: React.FC = () => {
  const [config, setConfig] = useState<PrinciplesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load principles from config file
  useEffect(() => {
    loadPrinciples();
  }, []);

  const loadPrinciples = async () => {
    try {
      // TODO: Replace with actual file read via Electron IPC
      const configPath = '~/.claude/agentic-processes/config/operating-principles.json';
      const response = await window.electron.readFile(configPath);
      const data = JSON.parse(response);
      setConfig(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const savePrinciples = async () => {
    try {
      const configPath = '~/.claude/agentic-processes/config/operating-principles.json';
      await window.electron.writeFile(configPath, JSON.stringify(config, null, 2));
      // Show success notification
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePrinciple = (id: string) => {
    setConfig(prev => ({
      ...prev!,
      principles: prev!.principles.map(p =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    }));
  };

  const handleEditPrinciple = (id: string, updates: Partial<Principle>) => {
    setConfig(prev => ({
      ...prev!,
      principles: prev!.principles.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  };

  const handleReorderPrinciples = (newOrder: Principle[]) => {
    setConfig(prev => ({
      ...prev!,
      principles: newOrder.map((p, idx) => ({ ...p, order: idx + 1 }))
    }));
  };

  const handleAddPrinciple = () => {
    const newPrinciple: Principle = {
      id: `custom-${Date.now()}`,
      name: 'NEW CUSTOM PRINCIPLE',
      rule: 'Enter the rule here',
      verification: 'Enter verification method',
      enabled: true,
      order: config!.principles.length + 1
    };
    setConfig(prev => ({
      ...prev!,
      principles: [...prev!.principles, newPrinciple]
    }));
    setEditingId(newPrinciple.id);
  };

  if (loading) return <div>Loading principles...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config) return null;

  return (
    <div className="principles-config">
      <header className="principles-header">
        <h1>Operating Principles Configuration</h1>
        <div className="principles-actions">
          <button onClick={handleAddPrinciple}>Add Custom Principle</button>
          <button onClick={savePrinciples} className="save-btn">Save Changes</button>
        </div>
      </header>

      <PrinciplesList
        principles={config.principles}
        onReorder={handleReorderPrinciples}
        onToggle={handleTogglePrinciple}
        onEdit={setEditingId}
        editingId={editingId}
      />

      {editingId && (
        <PrincipleCard
          principle={config.principles.find(p => p.id === editingId)!}
          onSave={(updates) => {
            handleEditPrinciple(editingId, updates);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  );
};
