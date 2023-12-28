import React, { useState, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, Typography, Button } from '@mui/material';

function EC2InstancesList() {
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchEC2Instances() {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('http://localhost:3000/instances');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setInstances(data);
            } catch (err) {
                setError('Failed to fetch EC2 instances');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchEC2Instances();
    }, []);

    const generateTerraform = async () => {
        const instanceChunks = chunkArray([...instances], 10); // Adjust the chunk size as needed
        await handleChunks(instanceChunks, setError);
    };

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
            <Button variant="contained" color="primary" onClick={generateTerraform}>
                Generate Terraform Config
            </Button>
        </Container>
    );
}

// Utility function to split an array into chunks
function chunkArray(array, chunkSize) {
    let results = [];
    while (array.length) {
        results.push(array.splice(0, chunkSize));
    }
    return results;
}

// Function to send each chunk of data to the server
async function sendChunk(chunk) {
    try {
        const response = await fetch('http://localhost:3000/generate-terraform', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resourceType: 'ec2', resourceData: chunk })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.text();
    } catch (err) {
        console.error('Error:', err);
        throw err; // Rethrow to handle in the caller
    }
}

// Function to handle all chunks and combine the generated Terraform configurations
async function handleChunks(chunks, setError) {
    let combinedTerraformConfig = '';

    for (const chunk of chunks) {
        try {
            const configPart = await sendChunk(chunk);
            combinedTerraformConfig += configPart;
        } catch (err) {
            setError('Failed to generate Terraform configuration');
            return; // Stop processing further chunks on error
        }
    }

    downloadFile(combinedTerraformConfig, 'ec2-config.tf', 'text/plain');
}

// Utility function to trigger file download
function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export default EC2InstancesList;
