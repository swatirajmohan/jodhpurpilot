/**
 * PDF Table Component
 * STRICT RULES:
 * - Use ONLY <View> and <Text>
 * - NO HTML tags
 * - NO className
 * - NO fragments
 * - NO conditional returns
 * - All values rendered as String(value ?? "-")
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e0e0e0',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottom: '2pt solid #000',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
    borderRight: '1pt solid #e0e0e0',
  },
  tableCellLast: {
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
  },
  priorityHigh: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  priorityMedium: {
    backgroundColor: '#fff9c4',
    color: '#f57f17',
  },
  priorityLow: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
})

interface TableRow {
  [key: string]: string | number | null | undefined
}

interface PdfTableProps {
  headers: Array<{ label: string; width: string | number }>
  rows: TableRow[]
  keyField: string
}

export function PdfTable({ headers, rows, keyField }: PdfTableProps) {
  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        {headers.map((header, index) => (
          <Text
            key={index}
            style={[
              index === headers.length - 1 ? styles.tableCellLast : styles.tableCell,
              { width: header.width },
            ]}
          >
            {String(header.label)}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={String(row[keyField] ?? rowIndex)} style={styles.tableRow}>
          {headers.map((header, colIndex) => {
            const value = row[header.label]
            return (
              <Text
                key={colIndex}
                style={[
                  colIndex === headers.length - 1 ? styles.tableCellLast : styles.tableCell,
                  { width: header.width },
                ]}
              >
                {String(value ?? '-')}
              </Text>
            )
          })}
        </View>
      ))}
    </View>
  )
}

