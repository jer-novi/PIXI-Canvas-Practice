// src/pages/CanvasPage/hooks/useDraggable.js
import { useRef, useEffect, useCallback } from "react";
import { useApplication } from "@pixi/react";

export function useDraggable(target, { onDragStart, onDragMove, onDragEnd }) {
  const app = useApplication();
  const dragData = useRef(null); // Houdt de staat van het slepen bij

  const handlePointerDown = useCallback(
    (event) => {
      // Voorkom dat andere events (zoals viewport drag) worden getriggerd
      event.stopPropagation();

      // Sla de startpositie en het doelobject op
      dragData.current = {
        target: event.currentTarget,
        startPosition: event.data.getLocalPosition(event.currentTarget.parent),
        isDragging: true,
      };

      if (onDragStart) {
        onDragStart(event);
      }
    },
    [onDragStart]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (dragData.current?.isDragging) {
        const newPosition = event.data.getLocalPosition(
          dragData.current.target.parent
        );
        const offset = {
          x: newPosition.x - dragData.current.startPosition.x,
          y: newPosition.y - dragData.current.startPosition.y,
        };

        if (onDragMove) {
          onDragMove(offset, newPosition);
        }
      }
    },
    [onDragMove]
  );

  const handlePointerUp = useCallback(
    (event) => {
      if (dragData.current?.isDragging) {
        dragData.current = null; // Reset de sleepstatus

        if (onDragEnd) {
          onDragEnd(event);
        }
      }
    },
    [onDragEnd]
  );

  useEffect(() => {
    const currentTarget = target?.current;
    if (currentTarget) {
      currentTarget.eventMode = "static";
      currentTarget.cursor = "move";

      currentTarget.on("pointerdown", handlePointerDown);
      // We luisteren naar de 'global' move en up events op de stage
      // zodat het slepen doorgaat, zelfs als de muis het object verlaat.
      app.stage.on("pointermove", handlePointerMove);
      app.stage.on("pointerup", handlePointerUp);
      app.stage.on("pointerupoutside", handlePointerUp);

      return () => {
        currentTarget.off("pointerdown", handlePointerDown);
        app.stage.off("pointermove", handlePointerMove);
        app.stage.off("pointerup", handlePointerUp);
        app.stage.off("pointerupoutside", handlePointerUp);
      };
    }
  }, [
    target,
    app.stage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  ]);
}
