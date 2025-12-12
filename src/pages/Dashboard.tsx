// import { Aggregates } from '../types'
// import aggregatesData from '../data/aggregates.json'

function Dashboard() {
  // Data loading will be implemented in Phase 2/3
  // const [aggregates, setAggregates] = useState<Aggregates[]>([])

  return (
    <div>
      <h1>Jodhpur School Assessment Dashboard</h1>
      
      <table border={1} cellPadding={8} cellSpacing={0}>
        <thead>
          <tr>
            <th rowSpan={2}>School Name</th>
            <th rowSpan={2}>School Code</th>
            <th rowSpan={2}>Overall School Average</th>
            <th colSpan={5}>Grade 6 Average</th>
            <th colSpan={5}>Grade 7 Average</th>
            <th colSpan={5}>Grade 8 Average</th>
            <th rowSpan={2}>View detailed report</th>
            <th rowSpan={2}>Download detailed report (PDF)</th>
          </tr>
          <tr>
            {/* Grade 6 sub-columns */}
            <th>Overall</th>
            <th>English</th>
            <th>Math</th>
            <th>SST</th>
            <th>Science</th>
            {/* Grade 7 sub-columns */}
            <th>Overall</th>
            <th>English</th>
            <th>Math</th>
            <th>SST</th>
            <th>Science</th>
            {/* Grade 8 sub-columns */}
            <th>Overall</th>
            <th>English</th>
            <th>Math</th>
            <th>SST</th>
            <th>Science</th>
          </tr>
        </thead>
        <tbody>
          {/* Data rows will be populated in next phase */}
        </tbody>
      </table>
    </div>
  )
}

export default Dashboard

