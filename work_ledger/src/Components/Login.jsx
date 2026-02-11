import React, { Component } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'jquery-validation';
import axios from 'axios';
import { loginSuccess } from '../Store/actions/authActions';
import { connect } from 'react-redux';
import { API_BASE_URL } from '../Config/config';
import logo from "../../public/Images/logo.png";
const withNavigation = (Component) => {
    return props => <Component {...props} navigate={useNavigate()} />;
}
export class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            showAlert: false,
            check: false,
            isLoggedIn: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCloseAlert = this.handleCloseAlert.bind(this);
    }

    handleChange(e) {
        const { name, type, checked, value } = e.target;
        this.setState({
            [name]: type === 'checkbox' ? checked : value
        });
    }

    componentDidMount() {
        $('#loginForm').validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                    maxlength: 15,
                    minlength: 7
                },
                // check: {
                //   required: true
                // }
            },
            messages: {
                email: {
                    required: 'Please enter email'
                },
                password: {
                    required: 'Please enter your password',
                    minlength: 'Please enter 7 digit password',
                    maxlength: 'Password must not be more than 15 digits'
                },
                // check: {
                //   required: 'Please click the checkbox'
                // }
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
        });
    }

    handleSubmit() {
        const { email, password } = this.state;
        const loginData = { email, password };

        axios.post(`${API_BASE_URL}/work_ledger/login_api.php`, loginData)
            .then(response => {
                console.log(response.data);


                if (response.data.success === 'success') {
                const { user, token } = response.data;
                this.props.loginSuccess(user, token);
                // console.log(response.data.token.email);

                // console.log(this.props.loginSuccess(user, token));

                this.props.navigate('/dashboard')

                this.setState({ email: '', password: '', check: false, successMessage: 'Login Successfull!', showAlert: true, isLoggedIn: true });

                } else {
                    $('#loginForm').validate().showErrors(
                        response.data.errors
                    );
                }
            })

    }
    handleCloseAlert = () => {
        this.setState({
            showAlert: false,
            successMessage: '',
        });
    }
    render() {
        const { email, password, check, successMessage, showAlert } = this.state;
        return (
            <div className="container mt-5 py-5">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card p-3">
                            {/* <h1 className="text-center">Login</h1> */}
                            <img src={logo} alt="" />
                            <form id="loginForm" onSubmit={this.handleSubmit}>
                                {showAlert && (
                                    <div className='alert alert-success alert-dismissible fade show' role='alert'>
                                        {successMessage}
                                        <button type='button' className='btn-close' onClick={this.handleCloseAlert} aria-label='Close'>
                                        </button>
                                    </div>
                                )}
                                <div className='mt-3'>
                                    <label htmlFor="email" className='form-label'>Email </label>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <i className="bi bi-envelope-fill"></i>
                                        </span>
                                        <input type="email" name='email' id='email' value={email} onChange={this.handleChange} className='form-control border' maxLength={100} placeholder='Enter Email' />
                                    </div>
                                </div>

                                <div className='mt-3'>
                                    <label htmlFor="password" className='form-label'>Password </label>
                                    <div className='float-end forget-text'>
                                        <Link to="/forgetpassword" >Forget Password?</Link>
                                    </div>
                                    <div className='input-group'>
                                        <span className='input-group-text'>
                                            <i className="bi bi-lock"></i>
                                        </span>
                                        <input type="password" name='password' id='password' value={password} onChange={this.handleChange} className='form-control border' maxLength={15} placeholder='Enter Password' />
                                    </div>
                                </div>

                                <div className="mt-3 text-center">
                                    <input type="submit" value="Login" className="btn login-button w-100" />
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withNavigation(connect(null, { loginSuccess })(Login))