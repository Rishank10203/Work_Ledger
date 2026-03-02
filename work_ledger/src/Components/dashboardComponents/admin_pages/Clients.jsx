import { error, event } from 'jquery';
import React, { Component } from 'react'
import { API_BASE_URL } from '../../../Config/config';
import axios from 'axios';
import $ from 'jquery'
export class Clients extends Component {

    constructor(props) {
        super(props)
        this.state = {
            client_id: null,
            client_name: '',
            client_email: '',
            country_name: '',
            company_details:'',
            users: [],
            errorMessage: '',
            successMessage: '',
            showAlert: false,
            isEdit: false,
            showForm: false,
            filteredClient: [],
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
    }

    handleEdit = (client) => {
        this.setState({
            client_id: client.client_id,
            client_name: client.client_name,
            client_email: client.client_email,
            company_details:client.company_details,
            country_name: client.country,
            isEdit: true,
            showForm: true,
            showAlert: false,
            successMessage: '',
            errorMessage: ''
        }, () => {
            $('#client').fadeIn();
        });
    }
    handleSubmit = () => {
        // event.preventDefault();
        const { client_id, client_name, client_email,company_details, country_name, isEdit } = this.state;
        // const userData={client_name,client_email,project_name};
        // console.log(userData);


        if (isEdit) {

            axios.put(`${API_BASE_URL}/work_ledgerr/clients.php`, {
                client_id,
                client_name,
                client_email,
                company_details,
                country_name
            })
                .then(response => {

                    this.setState({
                        successMessage: response.data.message || 'Client Updated Successfully',
                        errorMessage: '',
                        showAlert: true,
                        isEdit: false,
                        client_id: null,
                        client_name: '',
                        client_email: '',
                        company_details:'',
                        country_name: '',
                    });
                    this.fetchClients();
                    $('#client').fadeOut();
                    this.setState({ showForm: false });
                })
                .catch(error => {
                    if (error.response) {
                        this.setState({
                            errorMessage: error.response.data.message,
                            successMessage: '',
                            showAlert: true
                        });
                    }
                });

        } else {

            axios.post(`${API_BASE_URL}/work_ledgerr/clients.php`, {
                client_name,
                client_email,
                company_details,
                country_name
            })
                .then(response => {
                    this.setState({
                        client_name: '',
                        client_email: '',
                        company_details:'',
                        country_name: '',
                        successMessage: response.data.message || 'Client Added Successfully',
                        errorMessage: '',
                        showAlert: true
                    });
                    this.fetchClients();
                    $('#client').fadeOut();
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
    }
    // handleClear = () => {
    //     $('#client').fadeOut(() => {
    //         this.setState({
    //             user_id: null,
    //             user_name: '',
    //             user_email: '',
    //             user_number: '',
    //             role_name: '',
    //             isEdit: false,
    //             showForm: false,
    //             errorMessage: '',
    //             successMessage: '',
    //             showAlert: false
    //         });
    //     });
    // };
    componentDidMount() {
        $('#client').validate({

            rules: {
                client_name: {
                    required: true,
                    lettersOnly: true,
                },
                client_email: {
                    required: true,
                    email: true,
                },
                
                country_name: {
                    required: true,
                    lettersOnly: true,
                    // verifyNumber: true,
                    // minLength:13,
                    // minlength:12
                },
                company_details:{
                    required:true,
                }
            }, messages: {
                client_name: {
                    required: 'Enter Client Name',
                    // lettersOnly: 'Only Alphabets'
                },
                client_email: {
                    required: 'Enter Client Email ',
                    email: 'Enter Valid email'
                },
                company_details:{
                    required:'Enter Company Details'
                },
                country_name: {
                    required: 'Enter Country',
                    // minlength:'Enter Valid number with country code'
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

        this.fetchClients();
    }
    fetchClients = () => {
        axios.get(`${API_BASE_URL}/work_ledgerr/clients.php`)
            .then(response => {
                // console.log("GET response:", response.data);
                this.setState({
                    users: response.data,
                    filteredClient: response.data
                });
                // console.log(response.data);

            })
            .catch(err => console.error(err));
    }
    applyFilter = () => {
        const { users, searchText, filterBy } = this.state;
        const text = searchText.toLowerCase();

        const filtered = users.filter(user => {
            if (filterBy === 'name') return user.client_name.toLowerCase().includes(text);
            if (filterBy === 'email') return user.client_email.toLowerCase().includes(text);
            if (filterBy === 'country') return user.country.toLowerCase().includes(text);

            return (
                user.client_name.toLowerCase().includes(text) ||
                user.client_email.toLowerCase().includes(text) ||
                user.country.toLowerCase().includes(text)
            );
        });

        this.setState({ filteredClient: filtered, currentPage: 1 });
    };

    clearFilter = () => {
        this.setState({
            searchText: '',
            filterBy: 'all',
            filteredClient: this.state.users,
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
    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
            errorMessage: '',
        });
    }
    handleDelete = (id) => {
        axios
            .delete(`${API_BASE_URL}/work_ledgerr/clients.php`, {
                data: { client_id: id }
            })
            .then(response => {
                // console.log(response.data);

                this.setState(prevState => ({
                    users: prevState.users.filter(
                        user => user.client_id !== id
                    ),
                    successMessage: 'Client data deleted successfully',
                    errorMessage: '',
                    showAlert: true
                }));
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    this.setState({
                        errorMessage: error.response.data.message,
                        successMessage: '',
                        // errorMessage: ,
                        showAlert: true
                    });
                } else {
                    this.setState({
                        errorMessage: 'Client Project is under Development , so it cannot delete the client details',
                        successMessage: '',
                        // errorMessage: '',
                        showAlert: true
                    });
                }
            });
    };

    handleClear = () => {
        if ($('#client').length) {
            $('#client').validate().resetForm();
        }

        // $('#client').fadeOut();

        this.setState({
            client_id: null,
            client_name: '',
            client_email: '',
            company_details:'',
            country_name: '',
            errorMessage: '',
            // showForm: false,
            successMessage: '',
            showAlert: false,
            isEdit: false,
        });
    };

    render() {
        const { client_name, client_email, country_name,company_details, successMessage, showAlert, isEdit } = this.state;
        const {
            filteredClient,
            currentPage,
            rowsPerPage,
            searchText,
            filterBy
        } = this.state;

        const indexOfLast = currentPage * rowsPerPage;
        const indexOfFirst = indexOfLast - rowsPerPage;
        const currentUsers = filteredClient.slice(indexOfFirst, indexOfLast);

        const totalPages = Math.ceil(filteredClient.length / rowsPerPage);
        return (
            <div className='mt-4 container layout'>
                <div className='row'>
                    <div className='col-lg-6'>
                        {/* <h3 className=''><i className="bi bi-briefcase-fill me-2"></i>Client Management</h3> */}
                    </div>
                    <div className='col-lg-6'>
                        <div className=" mb-3 text-end">
                            {!this.state.showForm && (
                                <button
                                    className="btn btn-success mb-3"
                                    onClick={() =>
                                        this.setState(
                                            { showForm: true, isEdit: false },
                                            () => $('#client').fadeIn()
                                        )
                                    }
                                >
                                    <i className="bi-person-plus-fill me-2"></i>
                                    Add Client
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

                <form action="" style={{ display: 'none' }} id='client'>
                    <div className=''>
                        <div className="card w-100 mb-4">

                            <div className="card-body ">
                                <button
                                    type="button"
                                    className="btn-close float-end"
                                    aria-label="Close"
                                    onClick={() => {
                                        $('#client').fadeOut(300, () => {
                                            this.handleClear();
                                            this.setState({ showForm: false });
                                        });
                                    }}
                                ></button>
                                <h5>{isEdit ? 'Update Client' : 'Add Client '}</h5>

                                <div className="mt-3">
                                    <div className=" mb-3">
                                        <label htmlFor="" className='form-label'>Name </label>
                                        <input type="text" className="form-control border" placeholder="Enter Client Name" name='client_name' value={client_name} onChange={this.handleChange} maxLength={70} />
                                    </div>

                                    <div className=" mb-3">
                                        <label htmlFor="" className='form-label'>Email</label>
                                        <input type="email" className="form-control border" placeholder="Enter Client Email" name='client_email' value={client_email} onChange={this.handleChange} maxLength={100} />
                                    </div>
                                    <div className='mb-3'>
                                        <label htmlFor="" className='form-label'>Company_details</label>
                                        <textarea name="company_details"
                                            value={company_details} onChange={this.handleChange} rows="2" className='form-control border' placeholder='Enter Company Details' maxLength={500}></textarea>
                                    </div>
                                    <div className=" mb-3">
                                        <label htmlFor="" className='form-label'>Country</label>
                                        <input type="text" className="form-control border" placeholder="Enter Country Name" name='country_name' value={country_name} onChange={this.handleChange} maxLength={30} />
                                    </div>
                                    
                                    <div className="">
                                        <button className="btn btn-primary me-2">
                                            {this.state.isEdit ? 'Update' : 'Save'}
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
                                    <th>Client</th>
                                    <th>Email</th>
                                    <th>Comapny Details</th>
                                    <th>Country</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentUsers.length ? currentUsers.map(user => (
                                    <tr key={user.client_id}>
                                        <td>{user.client_name}</td>
                                        <td>{user.client_email}</td>
                                        <td>{user.company_details}</td>
                                        <td>{user.country}</td>
                                        <td>
                                            <button type="button"
                                                className='btn btn-warning me-2'
                                                onClick={() => this.handleEdit(user)}
                                            ><i className="bi bi-pencil-square"></i></button>
                                            <button className='btn btn-danger' type="button" onClick={() => this.handleDelete(user.client_id)}><i className="bi bi-trash3-fill"></i></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No data found</td>
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

export default Clients