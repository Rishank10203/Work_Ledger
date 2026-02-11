import AdminLayout from "./dashboardComponents/AdminLayout";
import DashboardCard from "./dashboardComponents/DashboardCard";

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="row g-3">
        <div className="col-md-6 col-lg-3">
          <DashboardCard title="Total Projects" value="24" />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard title="Total Tasks" value="134" />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard title="Billable Hours" value="1,245" />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard title="Clients" value="18" />  
        </div>
      </div>

      <div className="card card-shadow mt-4 p-3">
        <h6 className="fw-bold mb-3">Recent Task Logs</h6>

        <table className="table text-center">
          <thead>
            <tr>
              <th>User</th>
              <th>Task</th>
              <th>Project</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>UI Design</td>
              <td>CRM</td>
              <td>3h</td>
              <td>Done</td>
            </tr>
            <tr>
              <td>Emma</td>
              <td>API Build</td>
              <td>ERP</td>
              <td>5h</td>
              <td>In Progress</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
