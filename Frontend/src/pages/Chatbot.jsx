import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import style from "./Chatbot.module.css";

const API_KEY = "AIzaSyAPgSGg2fTTIOQfPJAbpgxs3_PCtmdEHv0";
// console.log(API_KEY);

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const constructRequestBody = (messages) => {
  return {
    contents: messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    })),
    systemInstruction: {
      role: "user",
      parts: [
        {
          text: `You are Tina, an AI insurance consultant. Your role is to chat with users and help them choose the most suitable insurance policy based on their personal attributes and needs. Follow these guidelines during the interaction:\n - \"I’m Tina. I help you choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?\"\n- Proceed only if the user agrees.\nBased on the user'\''s responses, ask appropriate follow-up questions. These questions should help you gather information about the user without directly asking what policy they want. For example:\n- \"What type of vehicle do you drive?\"\n- \"Do you need coverage for your own car or just third party?\"\n- \"How old is your vehicle?\"\nBusiness Rules:\n- Mechanical Breakdown Insurance (MBI) is not available for trucks or racing cars.\n- Comprehensive Car Insurance is only available for motor vehicles that are less than 10 years old.\nAfter gathering enough information, recommend one or more suitable insurance policies from the following options:\n- Mechanical Breakdown Insurance (MBI)\n- Comprehensive Car Insurance\n- Third Party Car Insurance\nProvide a clear explanation for your recommendation based on the user'\''s input and the business rules.\nAdjust your responses to the user’s answers to make the conversation flow naturally and ensure the user understands your suggestions.`,
        },
      ],
    },
    generationConfig: {
      temperature: 1,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  };
};

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I'm Tina, your AI Insurance Policy Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatDisplayRef = useRef(null);

  const handleMessageInput = (e) => {
    setInput(e.target.value);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const newMessage = {
      role: "user",
      text: input,
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput("");

    await processMessageToGeminiAi(newMessages);
  };

  const processMessageToGeminiAi = async (messages) => {
    try {
      const requestBody = constructRequestBody(messages);
      const response = await axios.post(url, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const aiMessage = response.data.candidates[0].content.parts[0].text;
      if (aiMessage) {
        setMessages([...messages, { text: aiMessage, role: "model" }]);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data from Gemini AI:", error);
    }
  };
  useEffect(() => {
    // Scroll to the bottom of the chat display whenever messages change
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={style.container}>
      <div className={style.body}>
        <h2 className={style.header}>AI Insurance Consultant</h2>
        <form className={style.form} onSubmit={(e) => e.preventDefault()}>
          <div className={style.chatDisplay} ref={chatDisplayRef}>
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={message.role === "user" ? style.user : style.bot}
                >
                  <p>{message.text}</p>
                </div>
                <p
                  className={
                    message.role === "user" ? style.userIcon : style.botIcon
                  }
                >
                  {message.role === "model" ? "Tina" : "You"}
                </p>
              </div>
            ))}
          </div>
          <div className={style.chatBox}>
            <input
              type="text"
              placeholder="Type message here"
              value={input}
              onChange={handleMessageInput}
              className={style.inputChat}
            />
            <button onClick={handleClick} className={style.button}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Chatbot;
