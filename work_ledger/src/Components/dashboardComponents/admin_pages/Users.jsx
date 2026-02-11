import React, { Component } from 'react';
import { API_BASE_URL } from '../../../Config/config';
import axios from 'axios';
import $ from 'jquery';

export class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_id: null,
            user_name: '',
            user_email: '',
            user_number: '',
            role_name: '',
            users: [],
            errorMessage: '',
            successMessage: '',
            showAlert: false,
            isEdit: false,
            showForm: false,
            filteredUsers: [],
            searchText: '',
            filterBy: 'all',
            currentPage: 1,
            rowsPerPage: 10,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCloseAlert = this.handleCloseAlert.bind(this);
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleEdit = (user) => {
        this.setState({
            user_id: user.user_id,
            user_name: user.user_name,
            user_email: user.user_email,
            user_number: user.user_number,
            role_name: user.role_name,
            isEdit: true,
            showForm: true,
            showAlert: false,
            successMessage: '',
            errorMessage: ''
        }, () => {
            $('#users').fadeIn();
        });
    };

    handleSubmit = () => {
        const { user_id, user_name, user_email, user_number, role_name, isEdit } = this.state;

        if (isEdit) {
            axios
                .put(`${API_BASE_URL}/work_ledger/users.php`, {
                    user_id,
                    user_name,
                    user_email,
                    user_number,
                    role_name
                })
                .then((response) => {
                    this.setState({
                        user_id: null,
                        successMessage: response.data.message || 'User updated successfully',
                        user_name: '',
                        user_email: '',
                        user_number: '',
                        role_name: '',
                        isEdit: false,
                        errorMessage: '',
                        showAlert: true
                    });
                    this.fetchUsers();
                    $('#users').fadeOut();
                    this.setState({ showForm: false });
                })
                .catch((error) => {
                    this.setState({
                        errorMessage:
                            error.response?.data?.message ||
                            'Update failed',
                        successMessage: '',
                        showAlert: true
                    });
                });

        } else {
            axios.post(`${API_BASE_URL}/work_ledger/users.php`, {
                user_name,
                user_email,
                user_number,
                role_name
            })
                .then(response => {
                    this.setState({
                        user_name: '',
                        user_email: '',
                        user_number: '',
                        role_name: '',
                        successMessage: response.data.message || 'Users Added Successfully',
                        errorMessage: '',
                        showAlert: true
                    });
                    this.fetchUsers();
                    $('#users').fadeOut();
                    this.setState({ showForm: false });
                })
                .catch(error => {
                    if (error.response && error.response.data) {
                        this.setState({
                            errorMessage: error.response.data.message,
                            successMessage: '',
                            showAlert: true
                        });
                    } else {
                        this.setState({
                            errorMessage: 'Something went wrong. Please try again.',
                            successMessage: '',
                            showAlert: true
                        });
                    }
                });
        }
    };


    componentDidMount() {
        $('#users').validate({
            rules: {
                user_name: {
                    required: true,
                    lettersOnly: true,
                },
                user_email: {
                    required: true,
                    email: true,
                },
                user_number: {
                    required: true,
                    verifyNumber: true,
                    // minLength:13,
                    minlength: 12
                },
                role_name: {
                    required: true,
                    lettersOnly: true,
                }
            },
            messages: {
                user_name: {
                    required: 'Enter Full Name',
                    // lettersOnly: 'Only Alphabets'
                },
                user_email: {
                    required: 'Enter Email',
                    email: 'Enter Valid Email'
                },
                user_number: {
                    required: 'Enter Client Mobile Number',
                    minlength: 'Enter Valid number with country code'
                },
                role_name: {
                    required: 'Enter Role'
                }
            },
            errorClass: 'text-danger',
            errorPlacement: function (error, element) {
                error.insertAfter(element);
            },
            submitHandler: (form, event) => {
                event.preventDefault();
                this.handleSubmit();
            }
        });

        $.validator.addMethod(
            'lettersOnly',
            function (value, element) {
                return this.optional(element) || /^[A-Za-z\s]+$/.test(value);
            },
            'Only alphabets allowed'
        );
        $.validator.addMethod(
            'verifyNumber',
            function (value, element) {
                return this.optional(element) || /^\+[0-9]{1,3}[0-9]{9,}$/.test(value);
            },
            "Enter correct number"
        );
        this.fetchUsers();
    }

    fetchUsers = () => {
        axios.get(`${API_BASE_URL}/work_ledger/users.php?type=users`)
            .then(response => {
                this.setState({
                    users: response.data,
                    filteredUsers: response.data
                });
            })
            .catch(err => console.error(err));
    };
    applyFilter = () => {
        const { users, searchText, filterBy } = this.state;
        const text = searchText.toLowerCase();

        const filtered = users.filter(user => {
            if (filterBy === 'name') return user.user_name.toLowerCase().includes(text);
            if (filterBy === 'email') return user.user_email.toLowerCase().includes(text);
            if (filterBy === 'role') return user.role_name.toLowerCase().includes(text);

            return (
                user.user_name.toLowerCase().includes(text) ||
                user.user_email.toLowerCase().includes(text) ||
                user.role_name.toLowerCase().includes(text)
            );
        });

        this.setState({ filteredUsers: filtered, currentPage: 1 });
    };

    clearFilter = () => {
        this.setState({
            searchText: '',
            filterBy: 'all',
            filteredUsers: this.state.users,
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
    handleDelete = (id) => {
        axios.delete(`${API_BASE_URL}/work_ledger/users.php`, {
            data: { user_id: id }
        })
            .then(() => {
                this.setState(prevState => ({
                    users: prevState.users.filter(user => user.user_id !== id),
                    successMessage: 'User deleted successfully',
                    errorMessage: '',
                    showAlert: true
                }));
            })
            .catch(error => {
                const message =
                    error.response?.data?.message ||
                    'User is assigned to a project and cannot be deleted';

                this.setState({
                    errorMessage: message,
                    successMessage: '',
                    showAlert: true
                });
            });
    };
    handleClear = () => {
        if ($('#users').length) {
            $('#users').validate().resetForm();
        }

        // $('#users').fadeOut();

        this.setState({
            user_id: null,
            user_name: '',
            user_email: '',
            user_number: '',
            role_name: '',
            isEdit: false,
            // showForm: false,
            errorMessage: '',
            successMessage: '',
            showAlert: false
        });
    };

    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
            errorMessage: '',
        });
    };

    render() {
        const { user_name, user_email, user_number, role_name, users, showAlert, successMessage, isEdit } = this.state;
        const {
            filteredUsers,
            currentPage,
            rowsPerPage,
            searchText,
            filterBy
        } = this.state;

        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        return (
            <div className='mt-4 container layout' >
                <div className='row'>
                    <div className='col-lg-6'>
                        {/* <h3 className=''><i className="bi bi-people me-2"></i>People Management</h3> */}
                    </div>
                    <div className='col-lg-6'>
                        <div className=''>
                            <div className=" mb-3 text-end">
                                {!this.state.showForm && (
                                    <button
                                        className="btn btn-success mb-3"
                                        onClick={() =>
                                            this.setState(
                                                { showForm: true, isEdit: false },
                                                () => $('#users').fadeIn()
                                            )
                                        }
                                    >
                                        <i className="bi bi-person-add me-2"></i>
                                        Add People
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {showAlert && successMessage && (
                        <div className="alert alert-success alert-dismissible fade show">
                            {successMessage}
                            <button type="button" className="btn-close" onClick={this.handleCloseAlert}></button>
                        </div>
                    )}

                    {showAlert && this.state.errorMessage && (
                        <div className="alert alert-danger alert-dismissible fade show">
                            {this.state.errorMessage}
                            <button type="button" className="btn-close" onClick={this.handleCloseAlert}></button>
                        </div>
                    )}

                    <form id="users" style={{ display: 'none' }}>

                        <div className="card w-100 mb-4">

                            <div className="card-body ">
                                <button
                                    type="button"
                                    className="btn-close float-end"
                                    aria-label="Close"
                                    onClick={() => {
                                        $('#users').fadeOut(300, () => {
                                            this.handleClear();
                                            this.setState({ showForm: false });
                                        });
                                    }}></button>
                                <h5>{isEdit ? 'Update User' : 'Add User'}</h5>

                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control border"
                                        name="user_name"
                                        placeholder='Enter User Name'
                                        value={user_name}
                                        onChange={this.handleChange}
                                        maxLength={70}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        placeholder='Enter User Email'
                                        className="form-control border"
                                        name="user_email"
                                        value={user_email}
                                        onChange={this.handleChange}
                                        maxLength={100}
                                    />
                                </div>
                                <div className=" mb-3">
                                    <label htmlFor="" className='form-label'>Phone No.</label>
                                    <input type="text" className="form-control border" placeholder="Enter User Number" name='user_number' value={user_number} onChange={this.handleChange} maxLength={14} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <input
                                        type="text"
                                        placeholder='Enter Role'
                                        className="form-control border"
                                        name="role_name"
                                        value={role_name}
                                        onChange={this.handleChange}
                                        maxLength={20}
                                    />
                                </div>

                                <button className="btn btn-primary me-2">
                                    {isEdit ? 'Update' : 'Save'}
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
                    </form>
                </div >
                {!this.state.showForm && (
                    <div className="card mb-3 ">
                        <div className="card-body d-flex gap-2 align-items-center flex-wrap">

                            <input
                                type="text"
                                className="form-control border"
                                placeholder="Search..."
                                name="searchText"
                                value={searchText}
                                onChange={this.handleChange}
                                style={{ maxWidth: '250px' }}
                            />

                            {/* <select
                            className="form-select"
                            name="filterBy"
                            value={filterBy}
                            onChange={this.handleChange}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">All Properties</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="role">Role</option>
                        </select> */}

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
                    <div className='card mb-3'>


                        <table className="table ">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile No.</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length ? currentUsers.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.user_name}</td>
                                        <td>{user.user_email}</td>
                                        <td>{user.user_number}</td>
                                        <td>{user.role_name}</td>
                                        <td>
                                            <button className="btn btn-warning btn-sm me-2"
                                                onClick={() => this.handleEdit(user)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-danger btn-sm"
                                                onClick={() => this.handleDelete(user.user_id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No data found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>



                        {/* <nav>
                            <ul className="pagination justify-content-end mt-1">
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
                            </ul>
                        </nav> */}

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
                )
                }
                {/* <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400 disabled:opacity-50"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 rounded bg-slate-300 hover:bg-slate-400 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )} */}
            </div>
        );
    }
}

export default Users;
