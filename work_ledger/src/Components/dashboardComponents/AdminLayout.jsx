import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import '../../assets/css/style.min.css'
import '../../assets/js/script'
import '../../assets/plugins/feather.min.js'
import '../../assets/plugins/chart.min.js'
// import '../../assets/css/demo.css';
// import '../../assets/vendor/css/core.css';
// import '../../assets/vendor/css/theme-default.css';
// import '../../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css';
// import '../../assets/vendor/libs/apex-charts/apex-charts.css';
// import '../../assets/vendor/js/helpers.js';
// import '../../assets/js/config.js';
// import '../../assets/vendor/libs/jquery/jquery.js';
// import '../../assets/vendor/libs/popper/popper.js';
// import '../../assets/vendor/js/bootstrap.js';
// import '../../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js';
// import '../../assets/js/main.js';
// import '../../assets/vendor/js/menu.js';
const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }
    return (
        
        <div className='container-fluid admin-layout '>
            <Topbar handleSidebarToggle={toggleSidebar}/>
            <div className="page-flex ">
            {/* <Topbar /> */}
            <Sidebar isOpen={isSidebarOpen}/>
            
            {/* <main class="main users chart-page" id="skip-target"> */}
                {/* <div class="container-fluid"> */}
                    <Outlet />
                {/* </div> */}
            {/* </main> */}
            </div>
        </div>
    )
}

export default AdminLayout