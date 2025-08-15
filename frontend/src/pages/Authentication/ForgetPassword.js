import PropTypes from 'prop-types';
import React from 'react';
import {
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
} from 'reactstrap';

//redux
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Link } from 'react-router-dom';
import withRouter from 'components/Common/withRouter';

// Formik Validation
import { z } from 'zod';
import { useFormik } from 'formik';

// action
import { userForgetPassword } from '../../store/actions';

// import images
import profile from '../../assets/images/profile-img.png';
import logo from '../../assets/images/logo.svg';

const forgetPasswordSchema = z.object({
  email: z.string({ required_error: 'Please Enter Your Email' }).email({ message: "Invalid email address" }),
});

const ForgetPasswordPage = (props) => {
  //meta title
  document.title = 'Forget Password | RedeCellRJ - React Admin & Dashboard Template';

  const dispatch = useDispatch();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: '',
    },
    validate: (values) => {
      try {
        forgetPasswordSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.formErrors.fieldErrors;
        }
        return {};
      }
    },
    onSubmit: (values) => {
      dispatch(userForgetPassword(values, props.history));
    },
  });

  const ForgotPasswordProperties = createSelector(
    (state) => state.ForgetPassword,
    (forgetPassword) => ({
      forgetError: forgetPassword.forgetError,
      forgetSuccessMsg: forgetPassword.forgetSuccessMsg,
    }),
  );

  const { forgetError, forgetSuccessMsg } = useSelector(ForgotPasswordProperties);

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
                    <Col xs={7}>
                      <div className='text-primary p-4'>
                        <h5 className='text-primary'>Welcome Back !</h5>
                        <p>Sign in to continue to RedeCellRJ.</p>
                      </div>
                    </Col>
                    <Col className='col-5 align-self-end'>
                      <img alt='' className='img-fluid' src={profile} />
                    </Col>
                  </Row>
                </div>
                <CardBody className='pt-0'>
                  <div>
                    <Link to='/'>
                      <div className='avatar-md profile-user-wid mb-4'>
                        <span className='avatar-title rounded-circle bg-light'>
                          <img alt='' className='rounded-circle' height='34' src={logo} />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className='p-2'>
                    {forgetError && forgetError ? (
                      <Alert color='danger' style={{ marginTop: '13px' }}>
                        {forgetError}
                      </Alert>
                    ) : null}
                    {forgetSuccessMsg ? (
                      <Alert color='success' style={{ marginTop: '13px' }}>
                        {forgetSuccessMsg}
                      </Alert>
                    ) : null}

                    <Form
                      className='form-horizontal'
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className='mb-3'>
                        <Label className='form-label'>Email</Label>
                        <Input
                          className='form-control'
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
                      <Row className='mb-3'>
                        <Col className='text-end'>
                          <button className='btn btn-primary w-md ' type='submit'>
                            Reset
                          </button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className='mt-5 text-center'>
                <p>
                  Go back to{' '}
                  <Link className='font-weight-medium text-primary' to='login'>
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

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
