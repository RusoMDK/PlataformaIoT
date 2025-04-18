// src/hooks/useHoverSidebar.js
import { useEffect, useState } from 'react';

export function useHoverSidebar(id = 'sidebar-hover') {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const onEnter = () => setHover(true);
    const onLeave = () => setHover(false);

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [id]);

  return hover;
}
