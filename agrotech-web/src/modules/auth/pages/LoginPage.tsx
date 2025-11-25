import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input, Button, Card, CardBody, CardHeader } from '@heroui/react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      setError('');
      navigate('/home');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Card>
      <CardHeader>Login</CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <Button type="submit">Login</Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default LoginPage;