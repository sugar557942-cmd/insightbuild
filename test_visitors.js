
async function checkVisitors() {
    try {
        const res = await fetch('http://localhost:3000/api/visitors');
        if (!res.ok) {
            console.log('Fetch failed with status:', res.status);
            return;
        }
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkVisitors();
