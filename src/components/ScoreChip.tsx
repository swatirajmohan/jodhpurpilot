/**
 * ScoreChip Component
 * 
 * Displays a numeric score with color-coded priority band background
 * following FRS.md Section 4.4 specifications:
 * - 0-4: High priority (Below expected)
 * - 5-6: Medium priority (At expected)
 * - 7-10: Low priority (Above expected)
 */

interface ScoreChipProps {
  value: number | null;
  decimal?: number; // Number of decimal places (default: 1)
}

function ScoreChip({ value, decimal = 1 }: ScoreChipProps) {
  // Handle null or missing data
  if (value === null || value === undefined) {
    return <span style={styles.noData}>No data</span>;
  }

  // Determine priority band based on FRS.md Section 4.4
  let priorityBand: 'High' | 'Medium' | 'Low';
  let backgroundColor: string;
  let textColor: string;

  if (value >= 0 && value <= 4) {
    priorityBand = 'High';
    backgroundColor = '#ffcccc'; // More visible light red
    textColor = '#cc0000'; // Dark red
  } else if (value >= 5 && value <= 6) {
    priorityBand = 'Medium';
    backgroundColor = '#fff4cc'; // Light yellow
    textColor = '#996600'; // Dark yellow/orange
  } else if (value >= 7 && value <= 10) {
    priorityBand = 'Low';
    backgroundColor = '#ccffcc'; // Light green
    textColor = '#006600'; // Dark green
  } else {
    // Fallback for out of range values
    priorityBand = 'High';
    backgroundColor = '#eee';
    textColor = '#666';
  }

  return (
    <span
      style={{
        ...styles.chip,
        backgroundColor,
        color: textColor,
      }}
      title={`Priority: ${priorityBand}`}
    >
      {value.toFixed(decimal)}
    </span>
  );
}

// Inline styles (minimal, no external libraries)
const styles = {
  chip: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'center' as const,
  },
  noData: {
    display: 'inline-block',
    padding: '4px 10px',
    color: '#999',
    fontSize: '13px',
    fontStyle: 'italic' as const,
  },
};

export default ScoreChip;

