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
            <th>School Name</th>
            <th>School Code</th>
            <th>Overall Average (Grades 6–8, all subjects)</th>
            <th>English Average</th>
            <th>Math Average</th>
            <th>SST Average</th>
            <th>Science Average</th>
            <th>View detailed report</th>
            <th>Download detailed report (PDF)</th>
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

