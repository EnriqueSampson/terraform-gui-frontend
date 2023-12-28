import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography } from '@mui/material';

function RDSInstancesList() {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchRDSInstances() {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:3000/rds-instances');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setInstances(data);
            } catch (err) {
                setError('Failed to fetch RDS instances');
                console.error('Error fetching data:', err);
            }
            setLoading(false);
        }

        fetchRDSInstances();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                AWS RDS Instances:
            </Typography>
            <List>
                {instances.map((instance, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={instance.DBInstanceIdentifier} secondary={`Status: ${instance.DBInstanceStatus}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}

export default RDSInstancesList;