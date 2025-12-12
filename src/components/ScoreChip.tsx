/**
 * ScoreChip Component
 * 
 * Displays a numeric score with color-coded priority band background
 * following FRS.md Section 4.4 specifications:
 * - 0-4.9: High priority (Below expected)
 * - 5.0-6.9: Medium priority (At expected)
 * - 7.0+: Low priority (Above expected)
 */

import styles from './ScoreChip.module.css'

interface ScoreChipProps {
  value: number | null;
  decimal?: number; // Number of decimal places (default: 1)
}

function ScoreChip({ value, decimal = 1 }: ScoreChipProps) {
  // Handle null or missing data - render as plain text, NOT as chip
  if (value === null || value === undefined) {
    return <span className={styles.noData}>No data</span>;
  }

  // Determine priority band based on client specification
  let priorityBand: 'High' | 'Medium' | 'Low';
  let className: string;

  if (value >= 0 && value < 5) {
    // 0 to 4.9: High priority (Below expected)
    priorityBand = 'High';
    className = styles.high;
  } else if (value >= 5 && value < 7) {
    // 5.0 to 6.9: Medium priority (At expected)
    priorityBand = 'Medium';
    className = styles.medium;
  } else {
    // 7.0+: Low priority (Above expected)
    priorityBand = 'Low';
    className = styles.low;
  }

  return (
    <span
      className={`${styles.chip} ${className}`}
      title={`Priority: ${priorityBand}`}
    >
      {value.toFixed(decimal)}
    </span>
  );
}

export default ScoreChip;

