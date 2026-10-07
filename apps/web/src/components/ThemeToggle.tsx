'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    setEscuro(document.documentElement.dataset.theme === 'dark');
  }, []);

  const alternar = () => {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.dataset.theme = novo ? 'dark' : 'light';
    try {
      localStorage.setItem('ratione_tema', novo ? 'dark' : 'light');
    } catch {
      // ignorar
    }
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
      className="p-2 rounded-md text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors"
    >
      {escuro ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
}
