import React, { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Logo from '../../assets/Logo.png';
import background from '../../assets/background.jpg'
import Alert from '../utils/Alert';
import { useAuth } from './UseAuth'


const Form = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();   

  const { login } = useAuth();

  // Alertas
  const [showAlert, setShowAlert] = useState(false);
  const [tipo, setTipo] = useState('error');
  const [mensaje, setMensaje] = useState('Credenciales Incorrectas');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(apiUrl + "/reporteria/api-token-auth/", {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      login(response.data.token, { username: username });
      navigate('/catalogo')
    } catch (error) {
      console.error('Error al hacer login:', error.response?.data || error.message);
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2500);
    }
  };

return (
  <StyledWrapper>
    <div id='main_div'>
      <div className="form">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <span className="input-span">
            <label className="label">Username</label>
            <input
              type="text"
              name="user"
              id="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </span>
          <span className="input-span">
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </span>
          <span className="span"><a href="#">Forgot password?</a></span>
          <input className="submit" type="submit" value="Log in" />
        </form>
      </div>
    </div>
    {showAlert && <Alert type={tipo} message={mensaje}/>}
  </StyledWrapper>
);
};

const StyledWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Background image con blur */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${background});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(8px);
    z-index: -1;         /* para que quede detrás de la tarjeta */
  }

  #main_div {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 300px;
    padding: 2rem;

    /* Glassmorphism */
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  }

  .form .input-span {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form input[type="text"],
  .form input[type="password"] {
    border-radius: 0.5rem;
    padding: 1rem 0.75rem;
    width: 100%;
    border: none;
    background-color: rgba(255, 255, 255, 0.3);
    outline: 2px solid #707070;
  }

  .form input[type="text"]:focus,
  .form input[type="password"]:focus {
    outline: 2px solid #001EB4;
  }

  .label {
    align-self: flex-start;
    color: #FFFFFF;
    font-weight: 600;
  }

  .form .submit {
    padding: 1rem 0.75rem;
    width: 100%;
    border-radius: 3rem;
    background-color: #707070;
    color: #efefef;
    border: none;
    cursor: pointer;
    transition: all 300ms;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form .submit:hover {
    background-color: #001EB4;
    color: #707070;
  }

  .span a {
    color: #FFFFFF;
    text-decoration: none;
    font-size: 0.85rem;
  }

  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .logo {
    width: 300px;
    height: auto;
    margin-bottom: 0.5rem;
  }
`;


export default Form;