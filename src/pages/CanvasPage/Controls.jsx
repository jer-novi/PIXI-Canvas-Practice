import styles from './CanvasPage.module.css';

export default function Controls({ fontSize, onFontSizeChange }) {
    return (
        <div className={styles.controlsWrapper}>
            <h2>Styling Controls</h2>
            
            <div className={styles.controlRow}>
                <label htmlFor="fontSize">Lettergrootte</label>
                <input 
                    type="range" 
                    id="fontSize" 
                    min="12" 
                    max="72" 
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                />
                <span>{fontSize}px</span>
            </div>
        </div>
    );
}

