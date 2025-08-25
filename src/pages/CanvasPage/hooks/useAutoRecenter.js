// src/pages/CanvasPage/hooks/useAutoRecenter.js
import { useEffect, useRef } from "react";

// Deze custom hook bevat alle logica voor het centreren
export function useAutoRecenter({ viewportRef, contentRef, deps }) {
  const rafId = useRef(0);

  useEffect(() => {
    if (!viewportRef.current || !contentRef.current) return;

    // Annuleer een eventueel vorig animatie-verzoek om "stotteren" te voorkomen
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    // Vraag een nieuw animatieframe aan. Dit is een performance-optimalisatie.
    rafId.current = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      const content = contentRef.current;

      const bounds = content.getBounds();
      if (bounds.width <= 0 || bounds.height <= 0) return; // Niet centreren als er niks te zien is

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2; // behouden voor later gebruik indien nodig

      // Animeer alleen horizontaal centreren
      // Verticaal behouden we de huidige center-positie van de viewport
      const currentCenterY = viewport.center?.y ?? viewport.y ?? centerY;
      viewport.animate({
        position: { x: centerX, y: currentCenterY },
        time: 250, // Duur van de animatie in milliseconden
        ease: "easeOutCubic",
        removeOnInterrupt: true, // Belangrijk: stop de oude animatie als een nieuwe start
      });
    });

    return () => {
      // Cleanup: annuleer het verzoek als het component verdwijnt
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, deps); // De hook draait opnieuw als een van de 'deps' verandert
}
