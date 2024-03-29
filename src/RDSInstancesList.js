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

    const generateTerraform = async () => {
        try {
            const response = await fetch('http://localhost:3000/generate-terraform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resourceType: 'rds',
                    resourceData: instances, // assuming 'instances' contains the RDS instance data
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const terraformConfig = await response.text();
            downloadFile(terraformConfig, 'rds-config.tf', 'text/plain');
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to generate Terraform configuration');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                AWS RDS Instances:
            </Typography>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            <List>
                {instances.map((instance, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={instance.DBInstanceIdentifier} secondary={`Status: ${instance.DBInstanceStatus}`} />
                    </ListItem>
                ))}
            </List>
            <button onClick={generateTerraform}>Generate Terraform Config</button>
        </Container>
    );
}


function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export default RDSInstancesList;