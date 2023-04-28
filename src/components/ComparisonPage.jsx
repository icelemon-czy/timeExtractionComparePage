import React,{useState} from "react";
import axios from "axios";
import DisplayTime from "./Time/DisplayTime";
import "./ComparisonPage.scss"
const ComparisonPage = () =>{

    const[input,setInput] = useState("");
    const[output,setOutput] = useState({
        regularExpression:"",
        openAI:"",
        suTime:"",
        spacy:""
    });

    const handleChange = (e) =>{
        setInput(e.target.value);
    }

    const openAiHeader = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
    }

    /**
     * Call backend ....
     */
    const handleClick = async (e) =>{
        e.preventDefault();
        // For now, we just output input
        let newOutput = output;
        let reTime = {code:6};
        try{
            const reUrl = "http://localhost:6789/pitt/db/support/re/"+input;
            await axios
                .get(reUrl)
                .then(response => {
                    if(response.status == 200){
                        reTime = response.data;
                    }else {
                        reTime = "Connection Error...";
                    }
                });
        }catch (err){
            reTime = "Connection Error...";
            console.log("err...")
        }
        if(reTime.code == 6){
            // Bad Request
            newOutput["regularExpression"] = "Bad HTTP Request!";
        }else{
            // No Ambiguity
            if(reTime.code == 0){
                newOutput["regularExpression"] = reTime.time.hour +":"+reTime.time.minute;
            }
            // Ambiguity
            else if(reTime.code ==1 ){
                newOutput["regularExpression"] = reTime.time.hour +":"+reTime.time.minute +" or "+ reTime.time.hour2 +":"+reTime.time.minute2;
            }
            // No useful information
            else{
                newOutput["regularExpression"] = "No Time is extracted!";
            }
        }

        let suTime = "";
        try{
            const sutUrl = "http://localhost:6789/pitt/db/support/sut/"+input;
            await axios
                .get(sutUrl)
                .then(response => {
                    if(response.status == 200){
                        suTime = response.data;
                    }else {
                        suTime ="Connection Error...";
                    }
                });
        }catch (err){
            suTime ="Connection Error...";
            console.log("err...")
        }
        newOutput["suTime"] =  suTime;

        let spacyTime = "";
        try{
            const spacyUrl = "http://127.0.0.1:5000/pitt/db/support/spacy/"+input;
            await axios
                .get(spacyUrl)
                .then(response => {
                    if(response.status == 200){
                        spacyTime = response.data;
                    }else{
                        spacyTime= "Connection Error...";
                    }
                });
        }catch (err){
            spacyTime = "Connection Error...";
            console.log("err...")
        }
        newOutput["spacy"] = spacyTime;

        let openAITime= "";
        try {
            const prompt = "Extract time (hour and minute) in the following sentence and convert into  HH:mm (24 hour clock format),the sentence is " + input;
            await axios.post(
                "https://api.openai.com/v1/completions",
                {
                    "model": "text-davinci-003",
                    "prompt": prompt,
                    "max_tokens": 100,
                    "temperature": 0
                },
                {headers: openAiHeader})
                .then((response) => {
                    if(response.status==200){
                        let time= response.data.choices;
                        if(time.length === 0){
                            openAITime = "No Time is extracted!";
                        }else{
                            openAITime = time[0].text.trim().toString();
                        }
                    }else{
                        openAITime= "Connection Error...";
                    }
                });
        }catch(err){
            openAITime = "Connection Error...";
            console.log("err...")
        }
        newOutput["openAI"] = openAITime;

        setOutput({...newOutput});
    }

    return (
        <div className={"page"}>
            <div className={"wrapper"}>
                <h1> Demo Page</h1>
                <div className={"upper"}>
                    <p>
                        During the chatbot’s dialog, users will be asked about departure and arrival times.
                    </p>
                    <p>
                        We implement our own regular expression methods and also experimented with several NLP models, including SUTime, Spacy, and ChatGPT.
                    </p>
                    <p>
                        Here is the demo to compare our own method with other three NLP Model.
                    </p>
                </div>

                <h1>Compare</h1>
                <div className={"down"}>
                    <div className={"left"}>
                        <DisplayTime/>
                    </div>
                    <div></div>
                    <div className={"right"}>
                        <div className={"input"}>
                            <input type={"text"} placeholder={"time"} name={"time"} onChange={handleChange} />
                            <button onClick={(e)=>handleClick(e)}>Generate</button>

                        </div>
                        <div className={"resultDisplay"}>
                            <div className={"result"}>
                                <p>Regular Expression</p>
                                <p>{output["regularExpression"]} </p>
                            </div>
                            <div className={"result"}>
                                <p>Open AI</p>
                                <p>{output["openAI"]}</p>
                            </div>
                            <div className={"result"}>
                                <p>SUTime</p>
                                <p> {output["suTime"]} </p>
                            </div>
                            <div className={"result"}>
                                <p>Spacy</p>
                                <p>{output["spacy"]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComparisonPage;
