import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

const InputGroup = ({
   name,
   placeholder,
   value,
   error,
   icon,
   onChange
}) => {

    return (
      <div className="input-group mb-3">
        <div className="input-group-prepend">
            <span className="input-group-text">
                <i className={icon} />
            </span>
         </div>

       <textarea  
          className={classnames('form-control form-control-ld', {'is-invalid': error})} 
          placeholder={placeholder}     
          name={name}  
          value={value} 
          onChange={onChange}
          />


      {error && (<div className="invalid-feedback">{error}</div>)}
    </div>
    );
};

InputGroup.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  icon: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired
}

InputGroup.defaultProps = {
  type: 'text'
}

export default InputGroup;