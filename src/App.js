import React  from 'react';
import { Container, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RDSInstancesList from './RDSInstancesList';
import GlueTablesList from './GlueTablesList';
import S3BucketsList from './S3BucketsList';
import EC2InstancesList from './EC2InstancesList';

function Navigation() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="flex items-center justify-center space-x-4">
                <Link to="/" className="text-white hover:text-gray-300">Home</Link>
                <Link to="/buckets" className="text-white hover:text-gray-300">Buckets</Link>
                <Link to="/instances" className="text-white hover:text-gray-300">Instances</Link>
                <Link to="/rds-instances" className="text-white hover:text-gray-300">RDS Instances</Link>
                <Link to="/glue-tables" className="text-white hover:text-gray-300">Glue Tables</Link>
            </div>
        </nav>
    );
}

function App() {

    return (
        <Router>
            <Navigation />
            <Routes>
                <Route path="/buckets" element={<S3BucketsList />} />
                <Route path="/instances" element={<EC2InstancesList />} />
                <Route path="/rds-instances" element={<RDSInstancesList />} />
                <Route path="/glue-tables" element={<GlueTablesList />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;

function Home() {
    return (
        <Container className="mt-10">
            <Typography variant="h4" gutterBottom className="text-center text-2xl font-bold">Welcome to the Terraform GUI</Typography>
            <Typography variant="body1" className="text-center">Select a resource from the navigation to get started.</Typography>
        </Container>
    );
}

