import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  fullWidth = true,
  required = false,
  placeholder = "••••••••",
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TextField
      label={label}
      name={name}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      error={error}
      helperText={helperText}
      variant="outlined"
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={togglePasswordVisibility}
              edge="end"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default PasswordField; 