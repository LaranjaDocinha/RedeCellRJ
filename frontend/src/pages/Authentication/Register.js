import React, { useEffect } from 'react';
import {
  Row,
  Col,
  CardBody,
  Card,
  Alert,
  Container,
  Input,
  Label,
  Form,
  FormFeedback,
} from 'reactstrap';

// Formik Validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

// action

//redux
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser, apiError } from '../../store/actions';

// import images
import profileImg from '../../assets/images/profile-img.png';
import logoImg from '../../assets/images/logo.svg';

const Register = (props) => {
  //meta title
  document.title = 'Register | RedeCellRJ - React Admin & Dashboard Template';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Please Enter Your Email'),
      username: Yup.string().required('Please Enter Your Username'),
      password: Yup.string().required('Please Enter Your Password'),
    }),
    onSubmit: (values) => {
      dispatch(registerUser(values));
    },
  });

  const AccountProperties = createSelector(
    (state) => state.Account,
    (account) => ({
      user: account.user,
      registrationError: account.registrationError,
      success: account.success,
      // loading: account.loading,
    }),
  );

  const {
    user,
    registrationError,
    success,
    // loading
  } = useSelector(AccountProperties);

  useEffect(() => {
    dispatch(apiError(''));
  }, []);

  useEffect(() => {
    success && setTimeout(() => navigate('/login'), 2000);
  }, [success]);

  return (
    <React.Fragment>
      <div className='home-btn d-none d-sm-block'>
        <Link className='text-dark' to='/'>
          <i className='bx bx-home h2' />
        </Link>
      </div>
      <div className='account-pages my-5 pt-sm-5'>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={6} md={8} xl={5}>
              <Card className='overflow-hidden'>
                <div className='bg-primary-subtle'>
                  <Row>
                    <Col className='col-7'>
                      <div className='text-primary p-4'>
                        <h5 className='text-primary'>Free Register</h5>
                        <p>Get your free RedeCellRJ account now.</p>
                      </div>
                    </Col>
                    <Col className='col-5 align-self-end'>
                      <img alt='' className='img-fluid' src={profileImg} />
                    </Col>
                  </Row>
                </div>
                <CardBody className='pt-0'>
                  <div>
                    <Link to='/'>
                      <div className='avatar-md profile-user-wid mb-4'>
                        <span className='avatar-title rounded-circle bg-light'>
                          <img alt='' className='rounded-circle' height='34' src={logoImg} />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className='p-2'>
                    <Form
                      className='form-horizontal'
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      {user && user ? (
                        <Alert color='success'>Register User Successfully</Alert>
                      ) : null}

                      {registrationError && registrationError ? (
                        <Alert color='danger'>{registrationError}</Alert>
                      ) : null}

                      <div className='mb-3'>
                        <Label className='form-label'>Email</Label>
                        <Input
                          className='form-control'
                          id='email'
                          invalid={
                            validation.touched.email && validation.errors.email ? true : false
                          }
                          name='email'
                          placeholder='Enter email'
                          type='email'
                          value={validation.values.email || ''}
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                        />
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type='invalid'>{validation.errors.email}</FormFeedback>
                        ) : null}
                      </div>

                      <div className='mb-3'>
                        <Label className='form-label'>Username</Label>
                        <Input
                          invalid={
                            validation.touched.username && validation.errors.username ? true : false
                          }
                          name='username'
                          placeholder='Enter username'
                          type='text'
                          value={validation.values.username || ''}
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                        />
                        {validation.touched.username && validation.errors.username ? (
                          <FormFeedback type='invalid'>{validation.errors.username}</FormFeedback>
                        ) : null}
                      </div>
                      <div className='mb-3'>
                        <Label className='form-label'>Password</Label>
                        <Input
                          invalid={
                            validation.touched.password && validation.errors.password ? true : false
                          }
                          name='password'
                          placeholder='Enter Password'
                          type='password'
                          value={validation.values.password || ''}
                          onBlur={validation.handleBlur}
                          onChange={validation.handleChange}
                        />
                        {validation.touched.password && validation.errors.password ? (
                          <FormFeedback type='invalid'>{validation.errors.password}</FormFeedback>
                        ) : null}
                      </div>

                      <div className='mt-4'>
                        <button className='btn btn-primary btn-block ' type='submit'>
                          Register
                        </button>
                      </div>

                      <div className='mt-4 text-center'>
                        <p className='mb-0'>
                          By registering you agree to the RedeCellRJ{' '}
                          <Link className='text-primary' to='#'>
                            Terms of Use
                          </Link>
                        </p>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className='mt-5 text-center'>
                <p>
                  Already have an account ?{' '}
                  <Link className='font-weight-medium text-primary' to='/login'>
                    {' '}
                    Login
                  </Link>{' '}
                </p>
                <p>
                  © {new Date().getFullYear()} RedeCellRJ. Crafted with{' '}
                  <i className='mdi mdi-heart text-danger' /> by Themesbrand
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Register;
