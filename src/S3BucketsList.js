import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography, Button } from '@mui/material';

function S3BucketsList() {
    const [buckets, setBuckets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchS3Buckets() {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:3000/buckets');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setBuckets(data);
            } catch (err) {
                setError('Failed to fetch S3 buckets');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchS3Buckets();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const generateTerraform = async () => {
        try {
            const response = await fetch('http://localhost:3000/generate-terraform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resourceType: 's3',
                    resourceData: buckets,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const terraformConfig = await response.text();
            downloadFile(terraformConfig, 's3-bucket-config.tf', 'text/plain');
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to generate Terraform configuration');
        }
    };

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
            <Button variant="contained" color="primary" onClick={generateTerraform}>
                Generate Terraform Config
            </Button>
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

export default S3BucketsList;