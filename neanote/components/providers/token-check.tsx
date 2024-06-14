import Cookies from 'js-cookie';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const withTokenCheck = (WrappedComponent) => {
  return (props) => {
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!Cookies.get('token')) {
        navigate('/get-started');
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withTokenCheck;