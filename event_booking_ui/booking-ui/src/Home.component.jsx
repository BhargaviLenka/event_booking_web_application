import { useEffect, useState } from 'react';
import axios from 'axios'

const HomeComponent = () => {
    const [message, setMessage] = useState('Loading...')

    useEffect(() => {
        axios.get('http://localhost:8002/api/get-event-categories/')
        .then(response => {
            setMessage(response.data.message)
        })
        .catch(error => {
            setMessage("Error connecting to backend")
        })
    }, [])
    
    return (
        <p>
            {console.log('hii')}
            hi {message}
        </p>
    );
};

export default HomeComponent;