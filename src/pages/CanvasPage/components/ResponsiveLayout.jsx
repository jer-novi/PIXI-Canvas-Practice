import React, { memo } from 'react';
import styles from './ResponsiveLayout.module.css';

const ResponsiveLayout = memo(({ 
  layout,
  controls, 
  canvas,
  navigation
}) => {


  return (
    <div className={styles.layoutContainer}>
      {/* Left Controls Panel */}
      {layout.controlsVisible && (
        <div 
          className={styles.controlsPanel}
          style={{ width: layout.controlsWidth }}
        >
          {controls}
        </div>
      )}

      {/* Main Canvas - takes remaining space */}
      <div 
        className={styles.canvasWrapper}
        style={{
          width: layout.canvasWidth,
          height: layout.canvasHeight,
        }}
      >
        {canvas}
      </div>

      {/* Right Navigation Panel */}
      {layout.navVisible && (
        <div 
          className={styles.navPanel}
          style={{ width: layout.navWidth }}
        >
          {navigation}
        </div>
      )}
    </div>
  );
});

ResponsiveLayout.displayName = 'ResponsiveLayout';

export default ResponsiveLayout;
