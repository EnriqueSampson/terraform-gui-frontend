import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RDSInstancesList from './RDSInstancesList';

function Navigation() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="flex items-center justify-center space-x-4">
                <Link to="/" className="text-white hover:text-gray-300">Home</Link>
                <Link to="/buckets" className="text-white hover:text-gray-300">Buckets</Link>
                <Link to="/instances" className="text-white hover:text-gray-300">Instances</Link>
                <Link to="/rds-instances" className="text-white hover:text-gray-300">RDS Instances</Link>
            </div>
        </nav>
    );
}

function App() {
  const [buckets, setBuckets] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        setError('');
      try {
        const bucketsResponse = await fetch('http://localhost:3000/buckets');
        const bucketsData = await bucketsResponse.json();
        setBuckets(bucketsData);

        const instancesResponse = await fetch('http://localhost:3000/instances');
        const instancesData = await instancesResponse.json();
        setInstances(instancesData);
      } catch (error) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', error);
        console.error('Error fetching data:', error);
      }
        setLoading(false);
    }

    fetchData();
  }, []);

    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/buckets" element={<BucketList buckets={buckets} loading={loading} error={error} />} />
                <Route path="/instances" element={<InstanceList instances={instances} loading={loading} error={error} />} />
                <Route path="/rds-instances" element={<RDSInstancesList />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;

function BucketList({ buckets, loading, error }) {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="mt-10">
            <Typography variant="h5" gutterBottom className="text-lg font-semibold">S3 Buckets:</Typography>
            <List className="bg-white rounded shadow">
                {buckets.map(bucket => (
                    <ListItem key={bucket.Name} className="border-b border-gray-200">
                        <ListItemText primary={bucket.Name} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

function InstanceList({ instances, loading, error }) {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container className="mt-10">
            <Typography variant="h5" gutterBottom className="text-lg font-semibold">EC2 Instances:</Typography>
            <List className="bg-white rounded shadow">
                {instances.map(instance => (
                    <ListItem key={instance.InstanceId} className="border-b border-gray-200">
                        <ListItemText primary={`Instance ID: ${instance.InstanceId}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

function Home() {
    return (
        <Container className="mt-10">
            <Typography variant="h4" gutterBottom className="text-center text-2xl font-bold">Welcome to the Terraform GUI</Typography>
            <Typography variant="body1" className="text-center">Select a resource from the navigation to get started.</Typography>
        </Container>
    );
}

