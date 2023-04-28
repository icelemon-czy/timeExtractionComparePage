import {useState, useEffect, Component} from 'react';
import ClockComponent from "./ClockComponent";
const DisplayTime= () => {
    const [date, setDate] = useState(new Date());


    function refreshClock() {
        setDate(new Date());
    }

    useEffect(() => {
        const timerId = setInterval(refreshClock, 1000);
        return function cleanup() {
            clearInterval(timerId);
        };
    }, []);

    return (
        <div>
            <h2>
                Pitt Local Time: {date.toLocaleTimeString()}
            </h2>
            <ClockComponent />
        </div>
    )
};

export default DisplayTime;
