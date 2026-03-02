import React, { Component } from 'react'
import { API_BASE_URL } from '../../../Config/config'
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import $ from 'jquery'
export class Task extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [
                {
                    id: 1, task_name: '', task_description: '', team_member: { id: null, label: '' },
                    memberSearch: '', due_date: null, membersSuggestions: [],
                }
            ],

            showForm: false,
            billable_type: '1',
            tasks: [],
            showAlert: true,
            projectSearch: '',
            searchText: '',
            filterBy: 'all',
            filteredTasks: [],
            currentPage: 1,
            rowsPerPage: 10,
            projectSuggestions: [],
            selectedProjectId: null,
            successMessage: '',
            errorMessage: '',
            selectedDate: null,

        }
        this.handleAddRow = this.handleAddRow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {

        $('#tasks').validate({
            ignore: [],
            rules: {
                project_name: {
                    required: true,
                    // lettersOnly: true,
                },
                task_name: {
                    required: true,
                    lettersOnly: true,
                },
                task_description: {
                    required: true,
                },
                team_members: {
                    required: true,
                    // min: 1
                },
                due_date: {
                    required: true,
                },

            }, messages: {
                project_name: {
                    required: 'Enter Project Name',
                    // lettersOnly: 'Only Alphabets'
                },
                task_name: {
                    required: 'Task required',
                    lettersOnly: 'Only Alphabets'
                },
                task_description: {
                    required: 'Enter Project Description',
                },
                team_members: {
                    required: 'Enter Team Members',
                    min: 'Enter Team Members'
                },
                due_date: {
                    required: "Enter Start Date",
                },
            },
            errorClass: 'text-danger',
            errorPlacement: function (error, element) {
                if (element.closest('.input-group').length) {
                    error.insertAfter(element.closest('.input-group'));
                } else {
                    error.insertAfter(element);
                }
            },
            submitHandler: (form, event) => {
                event.preventDefault();
                this.handleSubmit();
            }
        })
        $.validator.addMethod(
            "lettersOnly",
            function (value, element) {
                return this.optional(element) || /^[A-Za-z\s]+$/.test(value);
            },
            "Please enter Alphabets"
        );
        this.fetchTasks();

    }
    handleProjectChange = (e) => {
        const value = e.target.value;
        this.setState({ projectSearch: value });

        if (value.length >= 1) {
            axios.get(
                `${API_BASE_URL}/work_ledgerr/tasks.php?project_term=${value}`
            )
                .then(res => {
                    this.setState({
                        projectSuggestions: Array.isArray(res.data) ? res.data : []
                    });
                });
        } else {
            this.setState({ projectSuggestions: [] });
        }
    };
    selectProjectSuggestion = (item) => {
        this.setState({
            projectSearch: item.label,
            selectedProjectId: item.id,
            projectSuggestions: []
        });
    };

    handleMembersChange = (e, rowId) => {
        const value = e.target.value;

        this.setState(prev => ({
            rows: prev.rows.map(row =>
                row.id === rowId
                    ? { ...row, memberSearch: value }
                    : row
            )
        }));

        if (value.length >= 1) {
            axios.get(`${API_BASE_URL}/work_ledgerr/tasks.php?terms=${value}`)
                .then(res => {
                    const selectedIds = this.state.rows
                        .map(r => r.team_member.id)
                        .filter(Boolean);

                    const filtered = (Array.isArray(res.data) ? res.data : [])
                        .filter(item => !selectedIds.includes(item.id));

                    this.setState(prev => ({
                        rows: prev.rows.map(row =>
                            row.id === rowId
                                ? { ...row, memberSuggestions: filtered }
                                : row
                        )
                    }));
                });
        } else {
            this.setState(prev => ({
                rows: prev.rows.map(row =>
                    row.id === rowId ? { ...row, memberSuggestions: [] } : row
                )
            }));
        }
    };

    selectMemberSuggestion = (item, rowId) => {
        this.setState(prev => ({
            rows: prev.rows.map(row =>
                row.id === rowId
                    ? {
                        ...row,
                        team_member: { id: item.id, label: item.label },
                        memberSearch: item.label,
                        memberSuggestions: []
                    }
                    : row
            )
        }));
    };

    handleAddRow() {
        const newRow = {
            id: Date.now(),
            task_name: '',
            task_description: '',
            team_member: { id: null, label: '' },
            due_date: ''
        };
        this.setState(prevState => ({
            rows: [...prevState.rows, newRow]
        }));
    }

    handleInputChange(event, id) {
        const { name, value } = event.target;
        this.setState(prevState => ({
            rows: prevState.rows.map(row =>
                row.id === id ? { ...row, [name]: value } : row
            )
        }));
    }
    handleRowClear(rowId, e) {
        e.preventDefault();

        this.setState(prevState => ({
            rows: prevState.rows.map(row =>
                row.id === rowId
                    ? {
                        ...row,
                        task_name: '',
                        task_description: '',
                        team_member: { id: null, label: '' },
                        memberSearch: '',
                        due_date: null
                    }
                    : row
            )
        }));
    }
    applyFilter = () => {
        const { tasks, searchText, selectedDate } = this.state;
        const text = searchText.toLowerCase();

        const filtered = tasks.filter(task =>
            task.task_name.toLowerCase().includes(text) ||
            task.project_name.toLowerCase().includes(text) ||
            task.user_name.toLowerCase().includes(text) ||
            task.status.toLowerCase().includes(text)
            // task.billable_type.toLowerCase().includes(text)
        );

        // const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

        this.setState({
            filteredTasks: filtered,
            currentPage: 1,
            // selectedDate: formattedDate
        });
    };

    clearFilter = () => {
        this.setState({
            searchText: '',
            filteredTasks: this.state.tasks,
            currentPage: 1
        });
    };

    handleFilterChange = (e) => {
        this.setState({
            searchText: e.target.value,
            selectedDate: e.target.value
        });
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleRowsChange = (e) => {
        this.setState({
            rowsPerPage: Number(e.target.value),
            currentPage: 1
        });
    };

    fetchTasks = () => {
        axios.get(`${API_BASE_URL}/work_ledgerr/tasks.php?list=1`)
            .then(res => {
                console.log(res.data);

                this.setState({
                    tasks: res.data,
                    filteredTasks: res.data
                    // filteredProjects: res.data
                });
            });
    };

    handleClear = () => {

        if ($('#tasks').length) {
            $('#tasks').validate().resetForm();
        }

        this.setState({
            rows: [
                {
                    id: 1, task_name: '', task_description: '', team_member: { id: null, label: '' },
                    memberSearch: '', due_date: null
                }
            ],
            membersSuggestions: [],
            showForm: false,
            showAlert: '',
            projectSearch: '',
            projectSuggestions: [],
            selectedProjectId: null,
        });
    };

    handleEdit = (task) => {
        this.setState({
            showForm: true,
            showAlert: false,
            successMessage: '',
            errorMessage: '',
            billable_type: task.billable_type?.toString(),
            editingTasksId: task.task_id,

            projectSearch: task.project_name,
            selectedProjectId: task.project_id,

            rows: [
                {
                    id: Date.now(),
                    task_name: task.task_name,
                    task_description: task.task_description,
                    team_member: {
                        id: task.user_id,
                        label: task.user_name
                    },
                    memberSearch: task.user_name,
                    due_date: new Date(task.due_date)
                }
            ]
        }, () => {
            $('#tasks').fadeIn();
            $('#tasks').validate().resetForm();
        });
    };

    handleSubmit = () => {
        const formatDate = (date) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };


        const validTasks = this.state.rows.filter(row =>
            row.task_name?.trim() &&
            row.task_description?.trim() &&
            row.team_member?.id &&
            row.due_date

        );

        if (validTasks.length === 0) {
            this.setState({
                errorMessage: 'Please enter at least one complete task.',
                successMessage: '',
                showAlert: true
            });
            return;
        }

        const payload = {
            project_id: this.state.selectedProjectId,
            billable_type: this.state.billable_type,
            tasks: validTasks.map(row => ({
                task_name: row.task_name.trim(),
                task_description: row.task_description.trim(),
                team_member: row.team_member.id,
                due_date: formatDate(row.due_date)
            }))
        };


        if (this.state.editingTasksId) {
            payload.task_id = this.state.editingTasksId;


            axios.put(`${API_BASE_URL}/work_ledgerr/tasks.php`, payload)
                .then(res => {
                    this.fetchTasks();
                    this.setState({
                        rows: [
                            {
                                id: 1, task_name: '', task_description: '', team_member: { id: null, label: '' },
                                memberSearch: '', due_date: ''
                            }
                        ],
                        membersSuggestions: [],
                        // showForm: false,
                        showAlert: true,
                        billable_type: '',
                        projectSearch: '',
                        projectSuggestions: [],
                        selectedProjectId: null,
                        editingTaskId: null,
                        successMessage: res.data.message || 'Task Updated Successfully',
                        errorMessage: '',
                    });
                    $('#tasks').fadeOut();
                    this.setState({ showForm: false });
                })
                .catch(error => {
                    this.setState({
                        errorMessage: error.response?.data?.message || 'Update failed',
                        successMessage: '',
                        showAlert: true
                    });
                });

        }

        else {
            axios.post(`${API_BASE_URL}/work_ledgerr/tasks.php`, payload)
                .then(res => {
                    // console.log(res.data);
                    this.fetchTasks();
                    this.setState({
                        rows: [
                            {
                                id: 1, task_name: '', task_description: '', team_member: { id: null, label: '' },
                                memberSearch: '', due_date: ''
                            }
                        ],
                        membersSuggestions: [],
                        // showForm: false,
                        billable_type: '',
                        showAlert: true,
                        projectSearch: '',
                        projectSuggestions: [],
                        selectedProjectId: null,
                        editingProjectId: null,
                        successMessage: res.data.message || 'Task Added Successfully',
                        errorMessage: '',
                    });
                    $('#tasks').fadeOut();
                    this.setState({ showForm: false });
                })
                .catch(error => {
                    if (error.response) {
                        // backend error (409, 400, etc)
                        this.setState({
                            errorMessage: error.response.data.message,
                            successMessage: '',
                            showAlert: true
                        });
                    } else {
                        this.setState({
                            errorMessage: 'Server error. Please try again.',
                            showAlert: true
                        });
                    }
                });
        }
    };

    handleRowDelete(rowId, e) {
        e.preventDefault();
        const updatedRows = this.state.rows.filter((row) => row.id !== rowId);
        this.setState({ rows: updatedRows })
    }

    // toggleStatus = (task) => {
    //     const newStatus =
    //         task.status === 'completed' ? 'pending' : 'completed';

    //     axios.put(
    //         `${API_BASE_URL}/work_ledger/tasks.php?status=1`,
    //         {
    //             task_id: task.task_id,
    //             status: newStatus
    //         },
    //         {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }
    //     )
    //         .then(() => {
    //             this.setState(prevState => ({
    //                 tasks: prevState.tasks.map(t =>
    //                     t.task_id === task.task_id
    //                         ? { ...t, status: newStatus }
    //                         : t
    //                 ),
    //                 // filteredProjects: prevState.filteredProjects.map(p =>
    //                 //     p.project_id === project.project_id
    //                 //         ? { ...p, status: newStatus }
    //                 //         : p
    //                 // )
    //             }));
    //         })
    //         .catch((err) => {
    //             alert("Status update failed");
    //             console.error(err);
    //         });
    // };
    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
            errorMessage: '',
        });
    }
    handleDelete = (task_id) => {

        axios.delete(`${API_BASE_URL}/work_ledgerr/tasks.php`, {
            data: { task_id },

        }).then(res => {
            // alert(res.data.message);

            this.fetchTasks();
            this.setState({
                showAlert: true,
                successMessage: 'Project Deleted Successfully',
                errorMessage: ''
            });
        }).catch(() => alert("Delete failed"));
    };

    render() {
        const { rows, showAlert, successMessage, tasks } = this.state;
        const {
            filteredTasks,
            currentPage,
            rowsPerPage,
            searchText,
            selectedDate
        } = this.state;

        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);

        const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

        return (
            <div className='mt-4 container layout'>
                <div className='row'>
                    <div className='col-lg-6'>
                        {/* <h3 className=''> <i className="bi bi-gear me-2"></i>Project Setup</h3> */}
                    </div>
                    <div className='col-lg-6'>
                        <div className=" mb-3 text-end">
                            {!this.state.showForm && (
                                <button
                                    className="btn btn-success mb-3"
                                    onClick={() =>
                                        this.setState(
                                            { showForm: true, project: false },
                                            () => $('#tasks').fadeIn()
                                        )
                                    }
                                >
                                    <i className="bi bi-list me-2"></i>
                                    Add Tasks
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {showAlert && successMessage && (
                    <div className='alert alert-success alert-dismissible fade show'>
                        {successMessage}
                        <button type='button' className='btn-close' onClick={this.handleCloseAlert}></button>
                    </div>
                )}

                {showAlert && this.state.errorMessage && (
                    <div className="alert alert-danger alert-dismissible fade show">
                        {this.state.errorMessage}
                        <button type="button" className="btn-close" onClick={this.handleCloseAlert}></button>
                    </div>
                )}
                <form action="" id='tasks' style={{ display: 'none' }} >
                    <div className="card mb-4 w-100">
                        <div className="card-body ">
                            <button
                                type="button"
                                className="btn-close float-end"
                                aria-label="Close"
                                onClick={() => {
                                    $('#tasks').fadeOut(300, () => {
                                        this.handleClear();
                                        this.setState({ showForm: false });
                                    });
                                }}
                            ></button>
                            <div className='row'>
                                <div className='mb-3 col-lg-4'>
                                    <label htmlFor="" className='form-label'>Project Name</label>
                                    <input
                                        type="text"
                                        name='project_name'
                                        value={this.state.projectSearch}
                                        onChange={this.handleProjectChange}
                                        placeholder="Enter Project Name"
                                        className="form-control border"
                                    />

                                    {this.state.projectSuggestions.length > 0 && (
                                        <ul className="autocomplete-list-project" style={{ position: 'absolute', zIndex: '1' }}>
                                            {this.state.projectSuggestions.map(item => (
                                                <li
                                                    key={item.id}
                                                    onClick={() => this.selectProjectSuggestion(item)}
                                                >
                                                    {item.label} [{item.client_name}]
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <input type="hidden" value={this.state.selectedProjectId || ''} />
                                </div>
                                <div className='mb-3 col-lg-4'>
                                    <label htmlFor="" className='form-label'>Billable Type</label>
                                    <select name="billable_type" id="" value={this.state.billable_type} className='form-select border' onChange={(e) => this.setState({ [e.target.name]: e.target.value })}>
                                        <option value="1">Billable</option>
                                        <option value="0">Non-Billable</option>
                                    </select>
                                </div>
                                <div className='col-lg-4 mt-1 '>
                                    <div className='text-end mt-4  '>
                                        <button
                                            type="button"
                                            className="btn btn-primary mb-3 "
                                            onClick={this.handleAddRow}
                                        >
                                            Add Field
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='mb-3'>

                                <table className='table '>
                                    <thead>
                                        <tr>
                                            <th>Task Name</th>
                                            <th>Task Description</th>
                                            <th>Team Members</th>
                                            <th>Due Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr key={row.id}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name="task_name"
                                                        placeholder='Enter Tasks'
                                                        value={row.task_name}
                                                        onChange={(e) => this.handleInputChange(e, row.id)}
                                                        className="form-control border"
                                                        maxLength={30}
                                                    // required
                                                    />
                                                </td>
                                                <td>
                                                    <textarea
                                                        type="text"
                                                        name="task_description"
                                                        placeholder='Enter Description'
                                                        rows={1}
                                                        value={row.task_description}
                                                        onChange={(e) => this.handleInputChange(e, row.id)}
                                                        className="form-control border"
                                                        maxLength={400}
                                                    // required
                                                    ></textarea>
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        name='team_members'
                                                        value={row.memberSearch}
                                                        onChange={(e) => this.handleMembersChange(e, row.id)}
                                                        placeholder="Enter Team Member"
                                                        className="form-control border"
                                                    />

                                                    {row.memberSuggestions?.length > 0 && (
                                                        <ul className="autocomplete-list" style={{ position: 'absolute', zIndex: 1 }}>
                                                            {row.memberSuggestions.map(item => (
                                                                <li
                                                                    key={item.id}
                                                                    onClick={() => this.selectMemberSuggestion(item, row.id)}
                                                                >
                                                                    {item.label} [{item.email}]
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}


                                                    <input type="hidden" value={row.team_member.id || ''} />
                                                </td>

                                                <td>
                                                    <DatePicker minDate={new Date()}
                                                        className="form-control border"
                                                        name='due_date'
                                                        selected={row.due_date}
                                                        onChange={(date) =>
                                                            this.handleInputChange(
                                                                { target: { name: 'due_date', value: date } },
                                                                row.id
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td style={{ display: 'flex' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary px-1 me-1"
                                                        onClick={(e) => this.handleRowClear(row.id, e)}
                                                    >
                                                        <i className="bi bi-eraser"></i>
                                                    </button>
                                                    <button type='button' className='btn btn-danger px-1' onClick={(e) => this.handleRowDelete(row.id, e)}>
                                                        <i className="bi bi-trash2"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className='mb-3'>
                                <button type='submit' className='btn btn-primary'>Submit</button>
                            </div>
                        </div>
                    </div>
                </form>
                {!this.state.showForm && (
                    <div className="card mb-3">
                        <div className="card-body d-flex gap-2 align-items-center flex-wrap">
                            <input
                                type="text"
                                className="form-control border"
                                placeholder="Search task / project / member"
                                value={searchText}
                                onChange={this.handleFilterChange}
                                style={{ maxWidth: '250px' }}
                            />
                            {/* <DatePicker
                                selected={selectedDate}
                                onChange={this.handleFilterChange}
                                className='form-control border' placeholder='Search due date' style={{ maxWidth: '250px' }} /> */}

                            <button className="btn btn-primary" onClick={this.applyFilter}>
                                <i className="bi bi-search me-1"></i> Filter
                            </button>

                            <button className="btn btn-outline-secondary" onClick={this.clearFilter}>
                                <i className="bi bi-x-circle me-1"></i> Clear
                            </button>

                            <div className="ms-auto d-flex align-items-center gap-2">
                                <span>Rows:</span>
                                <select
                                    className="form-select"
                                    style={{ width: '100px' }}
                                    value={rowsPerPage}
                                    onChange={this.handleRowsChange}
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {!this.state.showForm && (
                    <div className='mt-4'>
                        <div className='card mb-3 '>


                            <table className='table'>
                                <thead>
                                    <tr>
                                        {/* <th></th> */}
                                        <th>Task Name</th>
                                        <th>Task Description</th>
                                        <th>Project Name</th>
                                        <th>Member</th>
                                        <th>Billable Type</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        {/* <th>Notes</th> */}
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTasks.length ? currentTasks.map(task => (
                                        <tr key={task.task_id}>
                                            {/* <td><input
                                                type="checkbox"
                                                checked={task.status === 'completed'}
                                                onChange={() => this.toggleStatus(task)}
                                            />
                                            </td> */}
                                            <td>{task.task_name}</td>
                                            <td style={{ maxWidth: '250px' }}>{task.task_description}</td>
                                            <td>{task.project_name}</td>
                                            <td>{task.user_name}</td>
                                            <td>{task.billable_type == 1 ? 'Billable' : 'Non-Billable'}</td>
                                            <td>{task.due_date}</td>
                                            {/* <td>
                                                <span
                                                    className={`badge ${task.status === 'completed'
                                                        ? 'bg-success'
                                                        : 'bg-warning text-dark'
                                                        }`}
                                                >
                                                    {task.status === 'completed' ? 'Completed' : 'Pending'}
                                                </span>

                                            </td> */}
                                            <td>{task.status}</td>
                                            {/* <td>{task.notes}</td> */}
                                            <td>
                                                <button
                                                    className="btn btn-warning px-2 me-1"
                                                    onClick={() => this.handleEdit(task)}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-danger px-2"
                                                    onClick={() => this.handleDelete(task.task_id)}
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">
                                                No tasks found
                                            </td>
                                        </tr>)}
                                </tbody>
                            </table>
                            <nav>
                                <ul className="pagination justify-content-end mt-3 me-5">

                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => this.handlePageChange(currentPage - 1)}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <li
                                            key={i}
                                            className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => this.handlePageChange(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => this.handlePageChange(currentPage + 1)}
                                        >
                                            Next
                                        </button>
                                    </li>

                                </ul>
                            </nav>

                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default Task