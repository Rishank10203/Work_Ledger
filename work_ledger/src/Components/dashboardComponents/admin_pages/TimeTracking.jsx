import React, { Component } from 'react'
import { API_BASE_URL } from '../../../Config/config'
import DatePicker from 'react-datepicker'
import $ from 'jquery'
import axios from 'axios'
export class TimeTracking extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rows: [
                {
                    id: 1,
                    task_date: null,
                    task_name: { id: null, label: '' },
                    taskSearch: '',
                    taskSuggestions: [],
                    task_start: '',
                    task_end: '',
                    total_hours: '',
                    task_notes: ''
                }
            ],
            showForm: false,
            showAlert: true,
            successMessage: '',
            errorMessage: '',
            searchText: '',
            filterBy: 'all',
            filteredTasks: [],
            currentPage: 1,
            rowsPerPage: 10,
            editingTimerId: null,
        }
    }
    componentDidMount() {
        $('#time_tracking').validate({
            ignore: [],
            rules: {
                task_date: {
                    required: true,
                },
                task_name: {
                    required: true,
                },
                task_start: {
                    required: true,
                },
                task_end: {
                    required: true
                },
            },
            messages: {
                task_date: {
                    required: 'Enter Task Date'
                },
                task_name: {
                    required: 'Enter Task Name'
                },
                task_start: {
                    required: 'Enter Task Start Time'
                },
                task_end: {
                    required: 'Enter Task End Time'
                }
            }, errorClass: 'text-danger',
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
        this.fetchTasks();
    }

    handleTaskChange = (e, rowId) => {
        const value = e.target.value;

        this.setState(prev => ({
            rows: prev.rows.map(row =>
                row.id === rowId
                    ? { ...row, taskSearch: value }
                    : row
            )
        }));

        if (value.length >= 1) {
            axios.get(`${API_BASE_URL}/work_ledgerr/time_track.php?terms=${value}`)
                .then(res => {
                    // console.log(res.data);

                    this.setState(prev => ({
                        rows: prev.rows.map(row =>
                            row.id === rowId
                                ? {
                                    ...row,
                                    taskSuggestions: Array.isArray(res.data) ? res.data : []
                                }
                                : row
                        )
                    }));
                });
        } else {
            this.setState(prev => ({
                rows: prev.rows.map(row =>
                    row.id === rowId ? { ...row, taskSuggestions: [] } : row
                )
            }));
        }
    };

    applyFilter = () => {
        const { tasks, searchText } = this.state;
        const text = searchText.toLowerCase();

        const filtered = tasks.filter(task =>
            task.task_name.toLowerCase().includes(text) ||
            task.project_name.toLowerCase().includes(text)
        );

        this.setState({
            filteredTasks: filtered,
            currentPage: 1
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
        this.setState({ searchText: e.target.value });
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    selectTaskSuggestion = (item, rowId) => {
        this.setState(prev => ({
            rows: prev.rows.map(row =>
                row.id === rowId
                    ? {
                        ...row,
                        task_name: { id: item.id, label: item.label },
                        taskSearch: item.label,
                        taskSuggestions: []
                    }
                    : row
            )
        }));
    };
    handleAddRow = () => {
        const newRow = {
            id: Date.now(),
            task_date: null,
            task_name: { id: null, label: '' },
            taskSearch: '',
            taskSuggestions: [],
            task_start: '',
            task_end: '',
            total_hours: '',
            task_notes: ''
        };

        this.setState(prevState => ({
            rows: [...prevState.rows, newRow]
        }));
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
            row.task_date &&
            row.task_name?.id &&
            row.task_start &&
            row.task_end
        );
        // console.log(validTasks);
        



        if (validTasks.length !== this.state.rows.length) {
            this.setState({
                errorMessage: 'Please select a task from the list.',
                successMessage: '',
                showAlert: true
            });
            return;
        }


        const payload = {
            tasks: validTasks.map(row => ({
                task_date: formatDate(row.task_date),
                task_id: row.task_name.id,
                task_start: row.task_start,
                task_end: row.task_end,
                total_hours: row.total_hours,
            }))
        };
        console.log(payload.tasks);

        if (this.state.editingTaskId) {
            // console.log(this.state.editingTaskId);

            payload.timer_id = this.state.editingTaskId;
            axios.put(`${API_BASE_URL}/work_ledgerr/time_track.php`, payload)
                .then(res => {
                    console.log(res.data);
                    this.fetchTasks();
                    this.setState({
                        rows: [
                            {
                                id: 1,
                                task_date: null,
                                task_name: { id: null, label: '' },
                                taskSearch: '',
                                taskSuggestions: [],
                                task_start: '',
                                task_end: '',
                                total_hours: '',
                                // task_notes: ''
                            }
                        ],
                        // showForm: false,
                        showAlert: true,
                        editingTaskId: null,
                        successMessage: res.data.message || 'Task Updated Successfully',
                        errorMessage: '',
                    });
                    $('#time_tracking').fadeOut();
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
            axios.post(`${API_BASE_URL}/work_ledgerr/time_track.php`, payload)
                .then(res => {
                    // console.log(res.data);
                    this.fetchTasks();
                    this.setState({
                        rows: [
                            {
                                id: 1,
                                task_date: null,
                                task_name: { id: null, label: '' },
                                taskSearch: '',
                                taskSuggestions: [],
                                task_start: '',
                                task_end: '',
                                total_hours: '',
                                // task_notes: ''
                            }
                        ],
                        // showForm: false,
                        showAlert: true,
                        editingTaskId: null,
                        successMessage: res.data.message || 'Task Created Successfully',
                        errorMessage: '',
                    });
                    $('#time_tracking').fadeOut();
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
    handleInputChange = (event, id) => {
        const { name, value } = event.target;

        this.setState(prevState => ({
            rows: prevState.rows.map(row => {
                if (row.id !== id) return row;

                const updatedRow = { ...row, [name]: value };
                if (name === 'task_start' || name === 'task_end') {
                    updatedRow.total_hours = this.calculateHours(
                        updatedRow.task_start,
                        updatedRow.task_end
                    );
                }
                return updatedRow;
            })
        }));
    };
    handleRowDelete(rowId, e) {
        e.preventDefault();
        const updatedRows = this.state.rows.filter((row) => row.id !== rowId);
        this.setState({ rows: updatedRows })
    }

    // handleEdit = (task) => {
    //     this.setState({
    //         showForm: true,
    //         showAlert: false,
    //         successMessage: '',
    //         errorMessage: '',
    //         editingTaskId: task.timer_id,
    //         rows: [
    //             {
    //                 task_id: Date.now(),
    //                 task_date: new Date(task.task_date),
    //                 task_name: {
    //                     id: task.task_id,
    //                     label: task.task_name
    //                 },
    //                 taskSearch: task.task_name,
    //                 taskSuggestions: [],

    //                 task_start: task.task_start,
    //                 task_end: task.task_end,
    //                 total_hours: task.total_hours,
    //                 task_notes: task.notes || ''
    //             }
    //         ]
    //     }, () => {
    //         $('#time_tracking').fadeIn();
    //         $('#time_tracking').validate().resetForm();
    //     });
    // };
    handleEdit = (task) => {


        this.setState({
            showForm: true,
            showAlert: false,
            successMessage: '',
            errorMessage: '',
            editingTaskId: task.timer_id,
            rows: [
                {
                    id: Date.now(),            
                    task_date: new Date(task.task_date),
                    task_name: {
                        id: task.task_id,       
                        label: task.task_name
                    },
                    taskSearch: task.task_name,
                    taskSuggestions: [],
                    task_start: task.task_start,
                    task_end: task.task_end,
                    total_hours: task.total_hours,
                }

            ]

        }, () => {
            $('#time_tracking').fadeIn();
            $('#time_tracking').validate().resetForm();
        });

        // console.log(task_name.id);
    };

    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
            errorMessage: '',
        });
    }
    calculateHours = (start, end) => {
        if (!start || !end) return '';

        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        let diff = endMinutes - startMinutes;

        if (diff < 0) diff += 24 * 60;

        return (diff / 60).toFixed(2);
    };

    handleClear = () => {

        if ($('#time_tracking').length) {
            $('#time_tracking').validate().resetForm();
        }

        this.setState({
            rows: [
                {
                    id: 1,
                    task_date: null,
                    task_name: { id: null, label: '' },
                    taskSearch: '',
                    taskSuggestions: [],
                    task_start: '',
                    task_end: '',
                    total_hours: '',
                    task_notes: ''
                }
            ],
            showForm: false,
            showAlert: true,
        });
    };

    fetchTasks = () => {
        axios.get(`${API_BASE_URL}/work_ledgerr/time_track.php?list=1`)
            .then(res => {
                // console.log(res.data);

                this.setState({
                    tasks: res.data,
                    filteredTasks: res.data
                    // filteredProjects: res.data
                });
            });
    };
    handleRowClear(rowId, e) {
        e.preventDefault();

        this.setState(prevState => ({
            rows: prevState.rows.map(row =>
                row.id === rowId
                    ? {
                        ...row,
                        task_date: '',
                        task_name: { id: null, label: '' },
                        task_start: '',
                        task_end: '',
                        total_hours: ''
                    }
                    : row
            )
        }));
    }

    handleDelete = (timer_id) => {

        axios.delete(`${API_BASE_URL}/work_ledgerr/time_track.php`, {
            data: { timer_id },

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
        const { rows, showAlert, successMessage } = this.state
        const {
            filteredTasks,
            currentPage,
            rowsPerPage,
            searchText
        } = this.state;

        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);

        const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
        return (
            <div className='mt-4 container layout'>
                <div className='row'>
                    <div className='col-lg-6'></div>
                    <div className='col-lg-6'>
                        <div className='mb-3 text-end'>
                            {!this.state.showForm && (
                                <button
                                    className="btn btn-success mb-3"
                                    onClick={() =>
                                        this.setState(
                                            { showForm: true, project: false },
                                            () => $('#time_tracking').fadeIn()
                                        )
                                    }
                                >
                                    <i className="bi-activity me-2"></i>
                                    Add Time Tracking
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
                <form action="" id='time_tracking' style={{ display: 'none' }} >
                    <div className="card mb-4 w-100">
                        <div className="card-body ">
                            {/* <button
                                type="button"
                                className="btn-close float-end"
                                aria-label="Close"
                                onClick={() => {
                                    $('#tasks').fadeOut(300, () => {
                                        this.handleClear();
                                        this.setState({ showForm: false });
                                    });
                                }}
                            ></button> */}
                            <button
                                type="button"
                                className="btn-close float-end "
                                aria-label="Close"
                                onClick={() => {
                                    $('#time_tracking').fadeOut(300, () => {
                                        this.handleClear();
                                        this.setState({ showForm: false });
                                    });
                                }}
                            ></button>
                            <div className='row mt-4'>
                                <div className=' mb-3 '>
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

                                <table className='table'>
                                    <thead>
                                        <tr>
                                            <th>Task Date</th>
                                            <th>Task Name</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>Total hours</th>
                                            <th>Action</th>
                                            {/* <th>Notes</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr key={row.id}>
                                                <td>
                                                    {/* <DatePicker
                                                        className="form-control"
                                                        selected={row.task_date}
                                                        onChange={(date) => {
                                                            this.setState(prev => ({
                                                                rows: prev.rows.map(r =>
                                                                    r.id === row.id ? { ...r, task_date: date } : r
                                                                )
                                                            }));
                                                        }}
                                                    /> */}
                                                    <DatePicker
                                                        // minDate={new Date()}
                                                        className="form-control border"
                                                        name='task_date'
                                                        selected={row.task_date}
                                                        onChange={(date) =>
                                                            this.handleInputChange(
                                                                { target: { name: 'task_date', value: date } },
                                                                row.id
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        name="task_name"
                                                        value={row.taskSearch}
                                                        onChange={(e) => this.handleTaskChange(e, row.id)}
                                                        placeholder="Enter Task Name"
                                                        className="form-control border"
                                                    />

                                                    {row.taskSuggestions.length > 0 && (
                                                        <ul
                                                            className="autocomplete-task-list"
                                                            style={{ position: 'absolute', zIndex: 1 }}
                                                        >
                                                            {row.taskSuggestions.map((item) => (
                                                                <li
                                                                    key={item.id}
                                                                    onClick={() => this.selectTaskSuggestion(item, row.id)}
                                                                >
                                                                    {item.label} [{item.project_name}]
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    <input
                                                        type="hidden"
                                                        name="task_id"
                                                        value={row.task_name?.id || ''}
                                                    />
                                                </td>

                                                <td>
                                                    <input
                                                        type="time"
                                                        name="task_start"
                                                        className="form-control border"
                                                        value={row.task_start}
                                                        onChange={(e) => this.handleInputChange(e, row.id)}
                                                    />

                                                </td>

                                                <td>
                                                    <input
                                                        type="time"
                                                        name="task_end"
                                                        className="form-control border"
                                                        value={row.task_end}
                                                        min={row.task_start}
                                                        onChange={(e) => this.handleInputChange(e, row.id)}
                                                    />

                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        className="form-control border"
                                                        name="total_hours"
                                                        value={row.total_hours}
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
                                placeholder="Search task / project"
                                value={searchText}
                                onChange={this.handleFilterChange}
                                style={{ maxWidth: '250px' }}
                            />

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
                <div className="card mb-4 w-100">
                    <div className="card-body ">
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>Task Date</th>
                                    <th>Task Name</th>
                                    <th>Project Name</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Hours</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.tasks?.map(task => (
                                    <tr key={task.task_id}>
                                        <td>{task.task_date}</td>
                                        <td>{task.task_name}</td>
                                        <td>{task.project_name}</td>
                                        <td>{task.task_start}</td>
                                        <td>{task.task_end}</td>
                                        <td>{task.total_hours}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning px-2 me-1"
                                                onClick={() => this.handleEdit(task)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger px-2"
                                                onClick={() => this.handleDelete(task.timer_id)}
                                            >
                                                <i className="bi bi-trash3-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

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
            </div>
        )
    }
}

export default TimeTracking