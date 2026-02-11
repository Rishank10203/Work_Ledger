import React, { Component } from 'react'
import { API_BASE_URL } from '../../../Config/config'
import $ from 'jquery';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import CurrencyInput from 'react-currency-input-field';
// import 'jquery-ui-dist/jquery-ui.css';
// import 'jquery-ui-dist/jquery-ui.js';
// import Autosuggest from 'react-autosuggest';
class Projects extends Component {
    constructor(props) {
        super(props)
        this.state = {
            projectName: '',
            projectDescription: '',
            projectAttach: null,
            startingDate: null,
            endDate: null,
            search: '',
            suggestions: [],
            selectedClientId: null,
            memberInput: '',
            memberSuggestions: [],
            selectedMembers: [],
            projects: [],
            errorMessage: '',
            successMessage: '',
            showForm: false,
            showAlert: false,
            estimatedHours: '',
            filteredProjects: [],
            searchText: '',
            selectedCurrency: '',
            budget: '',
            memberFilterText: '',
            memberFilterSuggestions: [],
            selectedFilterMember: null,
            filterBy: 'all',
            currentPage: 1,
            rowsPerPage: 10,
            
        },
            this.handleCloseAlert = this.handleCloseAlert.bind(this);
    }

    handleStartDateChange = (date) => {
        if (this.state.endDate && date > this.state.endDate) {
            this.setState({
                startingDate: date,
                endDate: null,
            });
        } else {
            this.setState({ startingDate: date });
        }
    }
    handleEndDateChange = (date) => {
        this.setState({ endDate: date })
    }
    // onClientSuggestionsFetchRequested = ({ value }) => {
    //     if (value.length >= 1) {
    //         axios
    //             .get(`${API_BASE_URL}/work_ledger/projects.php?term=${value}`)
    //             .then(res => {
    //                 this.setState({
    //                     suggestions: Array.isArray(res.data) ? res.data : []
    //                 });
    //             })
    //             .catch(() => this.setState({ suggestions: [] }));
    //     }
    // };

    // onClientSuggestionsClearRequested = () => {
    //     this.setState({ suggestions: [] });
    // };

    // getClientSuggestionValue = suggestion => suggestion.label;

    // renderClientSuggestion = suggestion => (
    //     <div>{suggestion.label}</div>
    // );

    // onClientSuggestionSelected = (e, { suggestion }) => {
    //     this.setState({
    //         search: suggestion.label,
    //         selectedClientId: suggestion.id
    //     });
    // };
    fetchProjects = () => {
        axios.get(`${API_BASE_URL}/work_ledger/projects.php?list=1`)
            .then(res => {
                this.setState({
                    projects: res.data,
                    filteredProjects: res.data
                });
            });
    };

    applyFilter = () => {
        const {
            projects,
            searchText,
            filterBy
        } = this.state;

        const text = searchText.toLowerCase();

        const filtered = projects.filter(project => {

            if (filterBy === 'name')
                return project.project_name.toLowerCase().includes(text);

            if (filterBy === 'client')
                return project.client_name.toLowerCase().includes(text);
            if(filterBy==='budget')
                return project.budget.toString().includes(budget);
            return (
                project.project_name.toLowerCase().includes(text) ||
                project.client_name.toLowerCase().includes(text) ||
                project.budget_amount.toLowerCase().includes(text)

            );
        });

        this.setState({ filteredProjects: filtered, currentPage: 1 });
    };


    clearFilter = () => {
        this.setState({
            searchText: '',
            filterBy: 'all',
            memberFilterText: '',
            selectedFilterMember: null,
            memberFilterSuggestions: [],
            filteredProjects: this.state.projects,
            currentPage: 1
        });
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    handleRowsChange = (e) => {
        this.setState({
            rowsPerPage: parseInt(e.target.value),
            currentPage: 1
        });
    };

    componentDidMount() {

        $('#projectForm').validate({
            ignore: [],
            rules: {
                project_name: {
                    required: true,
                    lettersOnly: true,
                },
                project_description: {
                    required: true,
                },
                project_attach: {
                    required: true,
                },
                client_name: {
                    required: true,
                    // email: true,
                },
                team_members: {
                    required: true,
                    min: 1
                },
                startingDate: {
                    required: true,
                },
                endDate: {
                    required: true,
                },
                selectedCurrency: {
                    required: true,
                },
                budget: {
                    required: true,
                },
                estimatedHours: {
                    required: true,
                }

            }, messages: {
                project_name: {
                    required: 'Enter Project Name',
                    // lettersOnly: 'Only Alphabets'
                },
                project_description: {
                    required: 'Enter Project Description',
                },
                project_attach: {
                    required: 'An attachment is required to proceed',
                },
                client_name: {
                    required: 'Enter Client Name ',
                    // email: 'Enter Valid email'
                },
                team_members: {
                    required: 'Enter Team Members',
                    min: 'Enter Team Members'
                },
                startingDate: {
                    required: "Enter Start Date",
                },
                endDate: {
                    required: 'Enter End Date'
                },
                selectedCurrency: {
                    required: 'Enter Selected Currency'
                },
                budget: {
                    required: 'Enter Budget Amount',
                },
                estimatedHours: {
                    required: 'Enter Estimated Hours'
                }
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
        this.fetchProjects();

    }

    handleChange = (e) => {
        const { name, value } = e.target;

        this.setState({ [name]: value });
        if (value.length >= 1) {
            axios
                .get(`${API_BASE_URL}/work_ledger/projects.php?term=${value}`)
                .then(res => {
                    if (Array.isArray(res.data)) {
                        this.setState({ suggestions: res.data });
                        // console.log(res.data);

                    } else {
                        this.setState({ suggestions: [] });
                    }
                })
                .catch(() => {
                    this.setState({ suggestions: [] });
                });

        } else {
            this.setState({ suggestions: [] });
        }
    };
    selectSuggestion = (item) => {
        this.setState({
            search: item.label,
            selectedClientId: item.id,
            suggestions: []
        });
    };

    removeMember = (id) => {
        this.setState(prev => ({
            selectedMembers: prev.selectedMembers.filter(m => m.id !== id)
        }), () => {
            $('#projectForm').validate().element('[name="team_members"]');
        });
    };


    toggleStatus = (project) => {
        const newStatus =
            project.status === 'completed' ? 'pending' : 'completed';

        axios.put(
            `${API_BASE_URL}/work_ledger/projects.php?status=1`,
            {
                project_id: project.project_id,
                status: newStatus
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
            .then(() => {
                this.setState(prevState => ({
                    projects: prevState.projects.map(p =>
                        p.project_id === project.project_id
                            ? { ...p, status: newStatus }
                            : p
                    ),
                    filteredProjects: prevState.filteredProjects.map(p =>
                        p.project_id === project.project_id
                            ? { ...p, status: newStatus }
                            : p
                    )
                }));
            })
            .catch((err) => {
                alert("Status update failed");
                console.error(err);
            });
    };



    handleSubmit = () => {
        const formattedBudget = this.state.budget
            ? Number(this.state.budget).toLocaleString('en')
            : '0';

        const formatDate = (date) => {
            if (!date) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };


        const payload = {
            project_name: this.state.projectName,
            project_description: this.state.projectDescription,
            // project_attach: this.state.projectAttach,
            client_id: this.state.selectedClientId,
            // members: this.state.selectedMembers.map(m => m.id),
            starting_date: formatDate(this.state.startingDate),
            end_date: formatDate(this.state.endDate),
            selectedCurrency: this.state.selectedCurrency,
            budget: `${this.state.selectedCurrency} ${formattedBudget}`,
            estimatedHours: this.state.estimatedHours,

        };

        if (this.state.editingProjectId) {
            payload.project_id = this.state.editingProjectId;


            axios.put(`${API_BASE_URL}/work_ledger/projects.php`, payload)
                .then(res => {
                    this.fetchProjects();
                    this.setState({
                        editingProjectId: null,
                        successMessage: res.data.message || 'Project Updated Successfully',
                        errorMessage: '',
                        showAlert: true,
                        projectName: '',
                        selectedCurrency: '',
                        budget: '',
                        estimatedHours: '',
                        projectAttach: null,
                        projectDescription: '',
                        startingDate: null,
                        endDate: null,
                        search: '',
                        selectedClientId: null,
                    });
                    $('#projectForm').fadeOut();
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
            axios.post(`${API_BASE_URL}/work_ledger/projects.php`, payload)
                .then(res => {
                    this.fetchProjects();
                    this.setState({
                        projectName: '',
                        projectDescription: '',
                        projectAttach: null,
                        search: '',
                        estimatedHours: '',
                        startingDate: null,
                        endDate: null,
                        selectedCurrency: '',
                        budget: '',
                        selectedClientId: null,
                        showAlert: true,
                        successMessage: res.data.message || 'Project Added Successfully',
                        errorMessage: '',
                    });
                    $('#projectForm').fadeOut();
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
    handleEdit = (project) => {
        let currency = '';
        let amount = '';

        if (project.budget_amount) {
            const parts = project.budget_amount.split(' ');
            currency = parts[0];
            amount = parts.slice(1).join('').replace(/,/g, '');
        }

        this.setState({
            selectedCurrency: currency,
            budget: amount,
            editingProjectId: project.project_id,
            projectName: project.project_name,
            projectDescription: project.project_description,
            projectAttach: project.project_attach,
            search: project.client_name,
            selectedClientId: project.client_id,
            selectedMembers: project.team_member,
            startingDate: new Date(project.starting_date),
            endDate: new Date(project.end_date),
            estimatedHours: project.estimated_hours,
            showForm: true,
            showAlert: false,
            successMessage: '',
            errorMessage: ''
        }, () => {
            $('#projectForm').fadeIn();
            $('#projectForm').validate().resetForm();
        });
    };


    handleDelete = (project_id) => {
        // if (!window.confirm("Are you sure you want to delete this project?")) return;

        axios.delete(`${API_BASE_URL}/work_ledger/projects.php`, {
            data: { project_id },

        }).then(res => {
            // alert(res.data.message);

            this.fetchProjects();
            this.setState({
                showAlert: true,
                successMessage: 'Project Deleted Successfully',
                errorMessage: ''
            });
        }).catch(() => alert("Delete failed"));
    };
    handleClear = () => {

        if ($('#projectForm').length) {
            $('#projectForm').validate().resetForm();
        }

        this.setState({
            projectName: '',
            projectDescription: '',
            projectAttach: null,
            search: '',
            startingDate: null,
            endDate: null,
            selectedClientId: null,
            memberInput: '',
            memberSuggestions: [],
            selectedMembers: [],
            suggestions: [],
            editingProjectId: null,
            successMessage: '',
            errorMessage: '',
            showAlert: false,
        });
    };

    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
            errorMessage: '',
        });
    }
    handleFilterChange = (e) => {
        this.setState({ searchText: e.target.value });
    };

    handleRowsChange = (e) => {
        this.setState({
            rowsPerPage: Number(e.target.value),
            currentPage: 1
        });
    };

    render() {
        const { successMessage, showAlert, project, startingDate } = this.state;
        const {
            search,
            suggestions,
            filteredProjects,
            currentPage,
            rowsPerPage,
            searchText,
            filterBy
        } = this.state;
        // const clientInputProps = {
        //     placeholder: 'Enter Client Name',
        //     value: search,
        //     onChange: (e, { newValue }) => {
        //         this.setState({ search: newValue });
        //     },
        //     className: 'form-control'
        // };
        const isEndDateDisabled = !startingDate;
        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentUsers = filteredProjects.slice(indexOfFirst, indexOfLast);

        const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
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
                                            () => $('#projectForm').fadeIn()
                                        )
                                    }
                                >
                                    <i className="bi bi-briefcase-fill me-2"></i>
                                    Add Project
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

                <form action="" id='projectForm' style={{ display: 'none' }}>
                    <div className=''>
                        <div className="card mb-4 w-100">
                            <div className="card-body ">
                                <button
                                    type="button"
                                    className="btn-close float-end"
                                    aria-label="Close"
                                    onClick={() => {
                                        $('#projectForm').fadeOut(300, () => {
                                            this.handleClear();
                                            this.setState({ showForm: false });
                                        });
                                    }}
                                ></button>
                                <h5>{project ? 'Update Project' : 'Add Project '}</h5>

                                <div className=" mt-3">
                                    <div className=" mb-3">
                                        <label htmlFor="" className='form-label'>Project Name </label>
                                        <input
                                            type="text"
                                            className="form-control border"
                                            placeholder="Project Name"
                                            name='project_name'
                                            value={this.state.projectName}
                                            onChange={(e) => this.setState({ projectName: e.target.value })} maxLength={30}
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor="" className='form-label'>Project Desciption</label>
                                        <textarea name="project_description"
                                            value={this.state.projectDescription} onChange={(e) => this.setState({ projectDescription: e.target.value })} rows="2" className='form-control border' placeholder='Enter Project Description' maxLength={700}></textarea>
                                    </div>
                                    {/* <div className='mb-3'>
                                        <label htmlFor="" className='form-label'>Attachment</label>
                                        <input type="file" className='form-control border' name='project_attach' ref={input => this.fileIput = input} onChange={(e) => this.setState({ projectAttach: e.target.files[0] })} />
                                    </div> */}

                                    <div className=" mb-3">
                                        <label htmlFor="" className='form-label'>Client Name </label>
                                        <input
                                            type="text"
                                            value={this.state.search}
                                            onChange={this.handleChange}
                                            name='client_name'
                                            placeholder="Enter Client Name"
                                            autoComplete="off"
                                            className='form-control border' maxLength={20}
                                        />

                                        {this.state.suggestions.length > 0 && (
                                            <ul className="autocomplete-list" style={{ position: 'absolute', zIndex: '1' }}>
                                                {this.state.suggestions.map(item => (
                                                    <li
                                                        key={item.id}
                                                        onClick={() => this.selectSuggestion(item)}
                                                    >
                                                        {item.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <input type="hidden" value={this.state.selectedClientId || ''} />
                                        {/* <label className="form-label">Client Name</label>

                                        <Autosuggest
                                            suggestions={suggestions}
                                            onSuggestionsFetchRequested={this.onClientSuggestionsFetchRequested}
                                            onSuggestionsClearRequested={this.onClientSuggestionsClearRequested}
                                            getSuggestionValue={this.getClientSuggestionValue}
                                            renderSuggestion={this.renderClientSuggestion}
                                            onSuggestionSelected={this.onClientSuggestionSelected}
                                            inputProps={clientInputProps}
                                        />

                                        <input
                                            type="hidden"
                                            value={this.state.selectedClientId || ''}
                                        /> */}
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor="" className='form-label'>Budget</label>
                                        <div className='input-group'>
                                            <select name="selectedCurrency" id="" className='' value={this.state.selectedCurrency} onChange={this.handleChange}>
                                                <option value="">--Select Currency--</option>
                                                <option value="$">USD ($)</option>
                                                <option value="₹">INR (₹)</option>
                                                <option value="€">EUR (€)</option>
                                            </select>
                                            <CurrencyInput
                                                className="form-control border"
                                                id="budget"
                                                name="budget"
                                                value={this.state.budget}
                                                placeholder="Enter Amount"
                                                maxLength={20}
                                                decimalsLimit={2}
                                                onValueChange={(value) => {
                                                    this.setState({ budget: value });
                                                }}
                                            />

                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor="" className='form-label'>Estimated Hours</label>
                                        <input type="number" placeholder='Enter Hours' name='estimatedHours' className='form-control border' value={this.state.estimatedHours} onChange={this.handleChange} maxLength={5} />
                                    </div>
                                    {/* <div className="mb-3">
                                        <label className='form-label'>Enter Members</label>
                                        <div className="d-flex flex-wrap mb-2">
                                            {this.state.selectedMembers.map(member => (
                                                <span
                                                    key={member.id}
                                                    className="badge bg-primary me-2 mb-2"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => this.removeMember(member.id)}
                                                >
                                                    {member.label} ✕
                                                </span>
                                            ))}
                                        </div>

                                        <input
                                            type="text"
                                            className='form-control'
                                            // name='team_members'
                                            placeholder='Type member names...'
                                            value={this.state.memberInput}
                                            onChange={this.handleMemberChange}
                                            autoComplete="off"
                                            maxLength={50}
                                        />
                                        <input
                                            type="hidden"
                                            name="team_members"
                                            value={this.state.selectedMembers.length}
                                        />
                                        {this.state.memberSuggestions.length > 0 && (
                                            <ul className="autocomplete-list">
                                                {this.state.memberSuggestions.map(item => (
                                                    <li
                                                        key={item.id}
                                                        onClick={() => this.selectMemberSuggestion(item)}
                                                    >
                                                        {item.label} [{item.email}]
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div> */}
                                    <div className='row mb-3'>
                                        <div className='col-lg-4'>
                                            <label htmlFor="" className='form-label me-2'>Start Date</label><br />
                                            <DatePicker className='form-control border' minDate={new Date()}
                                                placeholder="Select a Start Date"
                                                selected={this.state.startingDate}
                                                onChange={this.handleStartDateChange}
                                                selectsStart
                                                startingDate={this.state.startingDate}
                                                endDate={this.state.endDate}
                                                name='startingDate'
                                                showMonthDropdown
                                                showYearDropdown />
                                            {/* <input type="date" name="" className='form-control' id="" /> */}
                                        </div>
                                        <div className='col-lg-4'>
                                            <label htmlFor="" className='form-label me-2'>End Date</label><br />
                                            <DatePicker className='form-control border' placeholder="Select a End Date" selected={this.state.endDate}
                                                onChange={this.handleEndDateChange}
                                                startingDate={this.state.startingDate}
                                                name='endDate'
                                                endDate={this.state.endDate}
                                                disabled={isEndDateDisabled}
                                                minDate={this.state.startingDate}
                                                showMonthDropdown
                                                showYearDropdown
                                            />
                                            {/* <input type="date" name="" className='form-control' id="" /> */}
                                        </div>
                                    </div>
                                    <div className="">
                                        <button className="btn btn-primary me-2 ">
                                            {this.state.editingProjectId ? 'Update' : 'Create'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary "
                                            onClick={this.handleClear}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                {!this.state.showForm && (
                    <div className="card mb-3 ">
                        <div className="card-body d-flex gap-2 align-items-center flex-wrap">
                            <input
                                type="text"
                                className="form-control border"
                                placeholder="Search..."
                                name="searchText"
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
                {!this.state.showForm && (
                    <div className='card mb-3 '>
                        <table className="table ">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Project Name</th>
                                    <th>Project Description</th>
                                    <th>Client Name</th>
                                    <th>Budget</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Estimated Hours</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentUsers.length ? currentUsers.map(project => (
                                    <tr key={project.project_id}>
                                        <td><input
                                            type="checkbox"
                                            checked={project.status === 'completed'}
                                            onChange={() => this.toggleStatus(project)}
                                        />
                                        </td>
                                        <td>{project.project_name}</td>

                                        <td className='' style={{}}>{project.project_description}</td>

                                        <td>{project.client_name}</td>
                                        <td>{project.budget_amount}</td>
                                        <td>{project.starting_date}</td>
                                        <td>{project.end_date}</td>
                                        <td>{project.estimated_hours}</td>
                                        <td> <span
                                            className={`badge ${project.status === 'completed'
                                                ? 'bg-success'
                                                : 'bg-warning text-dark'
                                                }`}
                                        >
                                            {project.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span></td>
                                        <td>
                                            <button
                                                className="btn btn-warning px-1 me-1"
                                                onClick={() => this.handleEdit(project)}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger px-1"
                                                onClick={() => this.handleDelete(project.project_id)}
                                            >
                                                <i className="bi bi-trash3-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">No projects found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <nav>
                            <ul className="pagination justify-content-end mt-3 me-5">

                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => this.handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
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
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </li>

                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        )
    }
}

export default Projects